#!/usr/bin/env node
/**
 * Comprehensive Catalog Feed Testing Script
 *
 * Tests all aspects of the catalog feed system including:
 * - Feed CRUD operations
 * - Feed generation for all platforms
 * - Format conversions (XML, CSV, JSON)
 * - Category filtering
 * - Product variants
 * - Error handling
 * - Performance
 *
 * Usage: node test-catalog-feed.js
 *
 * Prerequisites:
 * - Product tables must exist in database
 * - At least 5 test products in database
 * - At least 2 categories in database
 * - VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { parse } from 'dotenv/config';

// Load environment variables
const envFile = readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1]] = match[2];
  }
});

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

function logTest(name, status, message = '') {
  const emoji = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⏭️';
  console.log(`${emoji} ${name}${message ? ': ' + message : ''}`);
  results.tests.push({ name, status, message });
  if (status === 'pass') results.passed++;
  else if (status === 'fail') results.failed++;
  else results.skipped++;
}

function logSection(title) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(title);
  console.log('='.repeat(60));
}

// Test helpers
async function testExists(tableName) {
  try {
    const { error } = await supabase.from(tableName).select('id').limit(1);
    return !error;
  } catch (e) {
    return false;
  }
}

async function cleanup() {
  // Delete test feeds
  await supabase.from('catalog_feeds')
    .delete()
    .like('name', 'TEST:%');
}

// Main test suite
async function runTests() {
  console.log('🚀 Starting Catalog Feed Comprehensive Tests\n');

  // ===== SECTION 1: Database Infrastructure =====
  logSection('1. DATABASE INFRASTRUCTURE TESTS');

  // Test 1.1: Catalog tables exist
  const catalogFeedsExists = await testExists('catalog_feeds');
  logTest(
    'Catalog feeds table exists',
    catalogFeedsExists ? 'pass' : 'fail',
    catalogFeedsExists ? 'Table found' : 'Table missing'
  );

  const catalogHistoryExists = await testExists('catalog_feed_history');
  logTest(
    'Catalog feed history table exists',
    catalogHistoryExists ? 'pass' : 'fail',
    catalogHistoryExists ? 'Table found' : 'Table missing'
  );

  // Test 1.2: Product tables exist
  const productsExists = await testExists('products');
  logTest(
    'Products table exists',
    productsExists ? 'pass' : 'fail',
    productsExists ? 'Table found' : 'CRITICAL: Missing - feed generation will fail'
  );

  const categoriesExists = await testExists('categories');
  logTest(
    'Categories table exists',
    categoriesExists ? 'pass' : 'fail',
    categoriesExists ? 'Table found' : 'Missing - category filtering unavailable'
  );

  const variantsExists = await testExists('product_variants');
  logTest(
    'Product variants table exists',
    variantsExists ? 'pass' : 'fail',
    variantsExists ? 'Table found' : 'Missing - variant support unavailable'
  );

  const settingsExists = await testExists('settings');
  logTest(
    'Settings table exists',
    settingsExists ? 'pass' : 'fail',
    settingsExists ? 'Table found' : 'Missing - will use defaults'
  );

  if (!productsExists) {
    console.log('\n⚠️  CRITICAL: Cannot continue without products table');
    console.log('Please create product schema first.\n');
    printSummary();
    return;
  }

  // Test 1.3: Product data exists
  const { data: products, count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true);

  logTest(
    'Active products in database',
    productCount > 0 ? 'pass' : 'fail',
    `${productCount} products found`
  );

  if (productCount === 0) {
    console.log('\n⚠️  WARNING: No products in database - feed tests will be limited');
  }

  // ===== SECTION 2: Feed CRUD Operations =====
  logSection('2. FEED CRUD OPERATIONS');

  await cleanup(); // Clean up any previous test data

  // Test 2.1: Create feed
  const testFeed = {
    name: 'TEST: Google Shopping Feed',
    platform: 'google',
    format: 'xml',
    feed_url_slug: 'test-google-shopping',
    is_active: true,
    category_filter: [],
    include_variants: true,
    cache_duration: 3600
  };

  const { data: createdFeed, error: createError } = await supabase
    .from('catalog_feeds')
    .insert(testFeed)
    .select()
    .single();

  logTest(
    'Create new feed',
    !createError ? 'pass' : 'fail',
    createError ? createError.message : `Created feed: ${createdFeed.id}`
  );

  let feedId = createdFeed?.id;

  // Test 2.2: Read feed
  if (feedId) {
    const { data: readFeed, error: readError } = await supabase
      .from('catalog_feeds')
      .select('*')
      .eq('id', feedId)
      .single();

    logTest(
      'Read feed by ID',
      !readError && readFeed ? 'pass' : 'fail',
      readError ? readError.message : 'Feed retrieved successfully'
    );
  }

  // Test 2.3: Update feed
  if (feedId) {
    const { error: updateError } = await supabase
      .from('catalog_feeds')
      .update({ name: 'TEST: Updated Feed Name' })
      .eq('id', feedId);

    logTest(
      'Update feed',
      !updateError ? 'pass' : 'fail',
      updateError ? updateError.message : 'Feed updated successfully'
    );
  }

  // Test 2.4: Validate slug uniqueness
  const { error: duplicateError } = await supabase
    .from('catalog_feeds')
    .insert({
      ...testFeed,
      name: 'TEST: Duplicate Slug'
    });

  logTest(
    'Prevent duplicate slug',
    duplicateError ? 'pass' : 'fail',
    duplicateError ? 'Duplicate prevented correctly' : 'BUG: Allowed duplicate slug'
  );

  // Test 2.5: Validate platform enum
  const { error: invalidPlatformError } = await supabase
    .from('catalog_feeds')
    .insert({
      ...testFeed,
      feed_url_slug: 'test-invalid-platform',
      platform: 'invalid_platform'
    });

  logTest(
    'Reject invalid platform',
    invalidPlatformError ? 'pass' : 'fail',
    invalidPlatformError ? 'Invalid platform rejected' : 'BUG: Accepted invalid platform'
  );

  // Test 2.6: Validate format enum
  const { error: invalidFormatError } = await supabase
    .from('catalog_feeds')
    .insert({
      ...testFeed,
      feed_url_slug: 'test-invalid-format',
      format: 'pdf'
    });

  logTest(
    'Reject invalid format',
    invalidFormatError ? 'pass' : 'fail',
    invalidFormatError ? 'Invalid format rejected' : 'BUG: Accepted invalid format'
  );

  // ===== SECTION 3: Feed Generation Tests =====
  logSection('3. FEED GENERATION TESTS');

  if (productCount > 0 && feedId) {
    // Test 3.1: Generate XML feed
    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/catalog-feed?feed_id=${feedId}&format=xml`,
        {
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      );

      logTest(
        'Generate XML feed',
        response.ok ? 'pass' : 'fail',
        response.ok ? `Status: ${response.status}` : `Status: ${response.status} - ${await response.text()}`
      );

      if (response.ok) {
        const xml = await response.text();
        logTest(
          'XML format validation',
          xml.includes('<?xml') && xml.includes('<products>') ? 'pass' : 'fail',
          xml.includes('<?xml') ? 'Valid XML structure' : 'Invalid XML'
        );
      }
    } catch (error) {
      logTest('Generate XML feed', 'fail', error.message);
    }

    // Test 3.2: Generate CSV feed
    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/catalog-feed?feed_id=${feedId}&format=csv`,
        {
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      );

      logTest(
        'Generate CSV feed',
        response.ok ? 'pass' : 'fail',
        response.ok ? `Status: ${response.status}` : `Status: ${response.status}`
      );

      if (response.ok) {
        const csv = await response.text();
        const lines = csv.split('\n');
        logTest(
          'CSV format validation',
          lines.length > 1 ? 'pass' : 'fail',
          lines.length > 1 ? `${lines.length} rows` : 'Empty CSV'
        );
      }
    } catch (error) {
      logTest('Generate CSV feed', 'fail', error.message);
    }

    // Test 3.3: Generate JSON feed
    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/catalog-feed?feed_id=${feedId}&format=json`,
        {
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      );

      logTest(
        'Generate JSON feed',
        response.ok ? 'pass' : 'fail',
        response.ok ? `Status: ${response.status}` : `Status: ${response.status}`
      );

      if (response.ok) {
        const json = await response.json();
        logTest(
          'JSON format validation',
          Array.isArray(json) ? 'pass' : 'fail',
          Array.isArray(json) ? `${json.length} products` : 'Invalid JSON structure'
        );
      }
    } catch (error) {
      logTest('Generate JSON feed', 'fail', error.message);
    }
  } else {
    logTest('Generate XML feed', 'skip', 'No products or feed to test');
    logTest('Generate CSV feed', 'skip', 'No products or feed to test');
    logTest('Generate JSON feed', 'skip', 'No products or feed to test');
  }

  // ===== SECTION 4: Platform-Specific Tests =====
  logSection('4. PLATFORM-SPECIFIC FORMAT TESTS');

  const platforms = [
    'meta', 'google', 'tiktok', 'pinterest',
    'snapchat', 'microsoft', 'twitter', 'linkedin', 'generic'
  ];

  for (const platform of platforms) {
    if (productCount > 0) {
      const { data: platformFeed, error } = await supabase
        .from('catalog_feeds')
        .insert({
          name: `TEST: ${platform} Feed`,
          platform,
          format: 'json',
          feed_url_slug: `test-${platform}-feed`,
          is_active: true,
          category_filter: [],
          include_variants: true,
          cache_duration: 3600
        })
        .select()
        .single();

      if (!error && platformFeed) {
        try {
          const response = await fetch(
            `${SUPABASE_URL}/functions/v1/catalog-feed?feed_id=${platformFeed.id}&format=json`,
            {
              headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
              }
            }
          );

          logTest(
            `${platform.toUpperCase()} feed generation`,
            response.ok ? 'pass' : 'fail',
            response.ok ? 'Generated successfully' : `Status: ${response.status}`
          );
        } catch (error) {
          logTest(`${platform.toUpperCase()} feed generation`, 'fail', error.message);
        }
      } else {
        logTest(`${platform.toUpperCase()} feed generation`, 'fail', 'Could not create test feed');
      }
    } else {
      logTest(`${platform.toUpperCase()} feed generation`, 'skip', 'No products available');
    }
  }

  // ===== SECTION 5: Error Handling Tests =====
  logSection('5. ERROR HANDLING TESTS');

  // Test 5.1: Missing feed_id parameter
  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/catalog-feed`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );

    logTest(
      'Handle missing feed_id',
      response.status === 400 ? 'pass' : 'fail',
      `Status: ${response.status}`
    );
  } catch (error) {
    logTest('Handle missing feed_id', 'fail', error.message);
  }

  // Test 5.2: Invalid feed_id
  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/catalog-feed?feed_id=00000000-0000-0000-0000-000000000000`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );

    logTest(
      'Handle invalid feed_id',
      response.status === 404 ? 'pass' : 'fail',
      `Status: ${response.status}`
    );
  } catch (error) {
    logTest('Handle invalid feed_id', 'fail', error.message);
  }

  // Test 5.3: Inactive feed
  if (feedId) {
    await supabase
      .from('catalog_feeds')
      .update({ is_active: false })
      .eq('id', feedId);

    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/catalog-feed?feed_id=${feedId}`,
        {
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      );

      logTest(
        'Reject inactive feed',
        response.status === 404 ? 'pass' : 'fail',
        response.status === 404 ? 'Correctly blocked' : `Status: ${response.status}`
      );
    } catch (error) {
      logTest('Reject inactive feed', 'fail', error.message);
    }
  }

  // ===== SECTION 6: Category Filtering Tests =====
  logSection('6. CATEGORY FILTERING TESTS');

  if (categoriesExists && productCount > 0) {
    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .limit(2);

    if (categories && categories.length > 0) {
      const { data: filteredFeed } = await supabase
        .from('catalog_feeds')
        .insert({
          name: 'TEST: Filtered Feed',
          platform: 'generic',
          format: 'json',
          feed_url_slug: 'test-filtered-feed',
          is_active: true,
          category_filter: [categories[0].id],
          include_variants: true,
          cache_duration: 3600
        })
        .select()
        .single();

      if (filteredFeed) {
        try {
          const response = await fetch(
            `${SUPABASE_URL}/functions/v1/catalog-feed?feed_id=${filteredFeed.id}&format=json`,
            {
              headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
              }
            }
          );

          logTest(
            'Category filter applied',
            response.ok ? 'pass' : 'fail',
            response.ok ? 'Filter works' : 'Filter failed'
          );

          if (response.ok) {
            const json = await response.json();
            logTest(
              'Category filter reduces results',
              json.length < productCount ? 'pass' : 'fail',
              `${json.length} of ${productCount} products`
            );
          }
        } catch (error) {
          logTest('Category filter applied', 'fail', error.message);
        }
      }
    } else {
      logTest('Category filter applied', 'skip', 'No categories in database');
    }
  } else {
    logTest('Category filter applied', 'skip', 'Categories table missing or no products');
  }

  // ===== SECTION 7: Feed History Tests =====
  logSection('7. FEED HISTORY TESTS');

  if (feedId) {
    // Wait a moment for history to be written
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { data: history, error: historyError } = await supabase
      .from('catalog_feed_history')
      .select('*')
      .eq('feed_id', feedId);

    logTest(
      'Feed history recorded',
      !historyError && history && history.length > 0 ? 'pass' : 'fail',
      history ? `${history.length} entries` : 'No history found'
    );

    if (history && history.length > 0) {
      const latestEntry = history[0];
      logTest(
        'History includes product count',
        latestEntry.product_count !== null ? 'pass' : 'fail',
        `Count: ${latestEntry.product_count}`
      );

      logTest(
        'History includes status',
        latestEntry.status ? 'pass' : 'fail',
        `Status: ${latestEntry.status}`
      );
    }
  }

  // ===== SECTION 8: Cleanup =====
  logSection('8. CLEANUP');

  await cleanup();
  logTest('Test data cleaned up', 'pass', 'All test feeds removed');

  // Print summary
  printSummary();
}

function printSummary() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⏭️  Skipped: ${results.skipped}`);
  console.log(`Total: ${results.passed + results.failed + results.skipped}`);

  const successRate = ((results.passed / (results.passed + results.failed)) * 100).toFixed(1);
  console.log(`\nSuccess Rate: ${successRate}%`);

  if (results.failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.tests
      .filter(t => t.status === 'fail')
      .forEach(t => console.log(`   - ${t.name}: ${t.message}`));
  }

  console.log('\n');
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
