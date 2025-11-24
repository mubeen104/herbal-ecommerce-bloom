# Advanced Tracking Test Suite - Deep Verification
**Date:** November 24, 2025  
**Purpose:** In-depth testing with real-time event monitoring, edge cases, and error scenarios

---

## SECTION 1: REAL-TIME EVENT MONITORING

### Setup: Browser Console Helpers
Before starting tests, paste these in DevTools Console to monitor events in real-time:

```javascript
// ===== EVENT MONITORING SETUP =====

// 1. Monitor GTM events in real-time
const originalPush = window.dataLayer.push;
window.dataLayer.push = function(...args) {
  const event = args[0];
  if (event?.event) {
    console.group(`📊 GTM Event: ${event.event}`);
    console.log('Event Data:', event);
    console.groupEnd();
  }
  return originalPush.apply(this, args);
};

// 2. Monitor Meta Pixel events in real-time
const originalFbq = window.fbq;
window.fbq = function(action, eventName, ...args) {
  if (action === 'track') {
    console.group(`📱 Meta Pixel Event: ${eventName}`);
    console.log('Event Data:', args[0]);
    console.groupEnd();
  }
  return originalFbq.apply(this, arguments);
};

// 3. View current state of both systems
window.showTrackingState = function() {
  console.log('=== TRACKING SYSTEM STATE ===');
  console.log('GTM dataLayer length:', window.dataLayer.length);
  console.log('Latest GTM event:', window.dataLayer[window.dataLayer.length - 1]);
  console.log('Meta Pixel queue length:', window.fbq?.q?.length || 0);
  console.log('Meta Pixel ready:', window.fbq?.queue ? 'Setting up' : 'Ready');
  const retryQueue = JSON.parse(localStorage.getItem('new_era_herbals_retry_queue') || '[]');
  console.log('Retry queue size:', retryQueue.length);
  if (retryQueue.length > 0) {
    console.log('Oldest retry event:', retryQueue[0]);
  }
};

console.log('✅ Monitoring helpers loaded. Use window.showTrackingState() to see status');
```

---

## SECTION 2: TEST SCENARIO A - MULTI-PRODUCT CART WITH DIFFERENT CATEGORIES

**Objective:** Verify that multiple products with different categories are all tracked correctly

### Step 1: Browse and Add Multiple Products

```
1. Go to https://domain.com/shop
2. Find "Ashwagandha" (Category: Wellness Adaptogens)
3. Add quantity 2 to cart
   → Watch console for:
      ✅ [GTM] Event pushed: add_to_cart
      ✅ [Meta Pixel] Event fired: AddToCart
   → Verify category in console:
      window.dataLayer.find(d => d.event === 'add_to_cart')
      Look for: items[0].item_category = "Wellness Adaptogens"

4. Find "Turmeric Powder" (Category: Spices & Seasonings)
5. Add quantity 1 to cart
   → Verify category: "Spices & Seasonings"

6. Find "Aloe Vera Gel" (Category: Skincare)
7. Add quantity 1 to cart
   → Verify category: "Skincare"
```

### Step 2: Verify Cart Events

**In Console:**
```javascript
// Check all add_to_cart events
window.dataLayer.filter(d => d.event === 'add_to_cart')

// Should show 3 events, each with different category:
// [0] item_category: "Wellness Adaptogens"
// [1] item_category: "Spices & Seasonings"
// [2] item_category: "Skincare"

// Verify Meta Pixel AddToCart events
window.fbq.q.filter(q => q[1] === 'AddToCart')

// Each should have: content_category: "..."
```

**Expected Output:**
```
✅ 3 add_to_cart events
✅ Each has correct category
✅ Categories are different (not all "Herbal Products")
✅ Meta Pixel events match GTM data
```

---

### Step 3: Proceed to Checkout

```
8. Click "Proceed to Checkout"
9. Open Console → window.showTrackingState()
10. Look for: "Latest GTM event: begin_checkout"
```

### Step 4: Verify Checkout Event Structure

**In Console:**
```javascript
// Get the begin_checkout event
const checkoutEvent = window.dataLayer.find(d => d.event === 'begin_checkout');

// Verify structure
console.table([
  { metric: 'Items in event', value: checkoutEvent.items.length, expected: 3 },
  { metric: 'Item 1 category', value: checkoutEvent.items[0].item_category, expected: 'Wellness Adaptogens' },
  { metric: 'Item 2 category', value: checkoutEvent.items[1].item_category, expected: 'Spices & Seasonings' },
  { metric: 'Item 3 category', value: checkoutEvent.items[2].item_category, expected: 'Skincare' },
  { metric: 'Currency', value: checkoutEvent.currency, expected: 'PKR' },
  { metric: 'Total value', value: checkoutEvent.value, expected: '>0' },
  { metric: 'Tax included', value: checkoutEvent.tax !== undefined, expected: true },
  { metric: 'Shipping included', value: checkoutEvent.shipping !== undefined, expected: true },
]);

// Verify Meta Pixel InitiateCheckout
const mpCheckout = window.fbq.q.find(q => q[1] === 'InitiateCheckout');
console.log('Meta Pixel contents:', mpCheckout[2].contents);
// Should have 3 items, each with category field
```

**Expected Output:**
```
✅ 3 items in GTM begin_checkout
✅ All 3 items have correct categories
✅ Tax > 0
✅ Shipping >= 0
✅ Meta Pixel has contents array with 3 items
✅ All 3 items in Meta Pixel have category field
```

---

## SECTION 3: TEST SCENARIO B - DIRECT CHECKOUT (SINGLE PRODUCT)

**Objective:** Verify the category fix works for direct "Buy Now" checkout

### Step 1: Direct Product Checkout

```
1. Go back to Shop: /shop
2. Find any product with a visible category
3. Click "Buy Now" button (direct checkout)
4. Should navigate to: /checkout?product=ID&quantity=1
```

### Step 2: Verify Direct Checkout Events

**In Console:**
```javascript
// Look for begin_checkout with 1 item
const dcEvent = window.dataLayer.find(d => d.event === 'begin_checkout');
console.log('Direct checkout event:', dcEvent);

// CRITICAL: Verify category is NOT "Herbal Products" (generic fallback)
// It should be the ACTUAL category from database
if (dcEvent.items[0].item_category === 'Herbal Products') {
  console.warn('⚠️ WARNING: Category is fallback value, check if product has category in DB');
} else {
  console.log('✅ Category is actual database value:', dcEvent.items[0].item_category);
}
```

### Step 3: Complete Direct Checkout Purchase

```
5. Fill in form: email, address, etc.
6. Select payment method
7. Click "Place Order"
8. Watch console for purchase event
```

### Step 4: Verify Purchase Event

**In Console:**
```javascript
// Get purchase event
const purchaseEvent = window.dataLayer.find(d => d.event === 'purchase');
console.log('Purchase event:', purchaseEvent);

// Verify category in purchase event
console.log('Item category in purchase:', purchaseEvent.items[0].item_category);

// Check Meta Pixel Purchase
const mpPurchase = window.fbq.q.find(q => q[1] === 'Purchase');
console.log('Meta Pixel contents:', mpPurchase[2].contents);

// Verify structure
const checks = {
  'Transaction ID': purchaseEvent.transaction_id ? '✅' : '❌',
  'Item category': purchaseEvent.items[0].item_category ? '✅' : '❌',
  'Tax amount': purchaseEvent.tax >= 0 ? '✅' : '❌',
  'Shipping amount': purchaseEvent.shipping >= 0 ? '✅' : '❌',
  'Value > 0': purchaseEvent.value > 0 ? '✅' : '❌',
  'MP contents array': mpPurchase[2].contents.length > 0 ? '✅' : '❌',
  'MP category': mpPurchase[2].contents[0].category ? '✅' : '❌',
};
console.table(checks);
```

**Expected Output:**
```
✅ Purchase event has transaction_id
✅ Purchase event has item_category (not fallback)
✅ Tax >= 0
✅ Shipping >= 0
✅ Value > 0
✅ Meta Pixel has contents array with 1 item
✅ Item has category field
```

---

## SECTION 4: TEST SCENARIO C - NETWORK FAILURE SIMULATION

**Objective:** Verify that events are queued when network fails and retried on recovery

### Step 1: Enable Network Throttling

```
1. Open DevTools → Network tab
2. Click the throttling dropdown (usually says "No throttling")
3. Select "Offline"
4. Keep DevTools open and watch console
```

### Step 2: Trigger Event While Offline

```
5. Still offline, go to shop
6. Click a product
7. Watch console - should see event getting queued
8. In console, run: JSON.parse(localStorage.getItem('new_era_herbals_retry_queue'))
   → Should show queued events
```

### Step 3: Restore Network

```
9. In DevTools Network tab, restore to "No throttling"
10. Watch console for:
    "🔄 [Retry Queue] Processing X failed events"
    "✅ [Meta Pixel] Event fired: ViewContent" (retry)
```

### Step 4: Verify Retry Success

**In Console:**
```javascript
// Check retry queue is now empty
const retryQueue = JSON.parse(localStorage.getItem('new_era_herbals_retry_queue'));
console.log('Retry queue after recovery:', retryQueue);
// Should be [] (empty)

// Verify event was added to GTM/Meta Pixel
window.dataLayer.filter(d => d.event === 'view_item')
```

**Expected Output:**
```
✅ Event queued to localStorage when offline
✅ Retry queue shows in localStorage
✅ Event retried when online
✅ Retry queue cleared after success
✅ Event appears in GTM dataLayer after retry
```

---

## SECTION 5: TEST SCENARIO D - MULTIPLE ITEMS IN PURCHASE

**Objective:** Verify all items with different categories appear in purchase event

### Setup: Add Different Products

```
1. Clear cart (or use new session)
2. Add 3 different products from different categories:
   - Product A: Category 1
   - Product B: Category 2
   - Product C: Category 3
3. Go to checkout
4. Place order
```

### Verify Multi-Item Purchase

**In Console:**
```javascript
// Get purchase event
const purchase = window.dataLayer.find(d => d.event === 'purchase');

// Verify all items
console.log('Number of items in purchase:', purchase.items.length);
// Should be 3

// Verify each item has category
purchase.items.forEach((item, idx) => {
  console.log(`Item ${idx + 1}:`, {
    name: item.item_name,
    category: item.item_category,
    price: item.price,
    quantity: item.quantity,
  });
});

// Verify Meta Pixel contents
const mpPurchase = window.fbq.q.find(q => q[1] === 'Purchase');
console.log('Meta Pixel contents count:', mpPurchase[2].contents.length);
// Should be 3

// Verify each Meta Pixel item has category
mpPurchase[2].contents.forEach((item, idx) => {
  console.log(`Meta Pixel Item ${idx + 1}:`, {
    title: item.title,
    category: item.category,
    quantity: item.quantity,
  });
});
```

**Expected Output:**
```
✅ Purchase has 3 items
✅ Each item has item_category (not generic)
✅ All 3 categories are different
✅ Meta Pixel has 3 items in contents
✅ Each Meta Pixel item has category field
✅ No null or undefined categories
```

---

## SECTION 6: TEST SCENARIO E - CATEGORY FIELD VALIDATION

**Objective:** Deep verification that category field is correct, not fallback

### Check All Event Types

**In Console:**
```javascript
// Function to check if category is used
function validateCategories() {
  const results = {
    view_item: { count: 0, withCategory: 0, generic: 0 },
    add_to_cart: { count: 0, withCategory: 0, generic: 0 },
    begin_checkout: { count: 0, withCategory: 0, generic: 0 },
    purchase: { count: 0, withCategory: 0, generic: 0 },
  };

  window.dataLayer.forEach(event => {
    if (results[event.event]) {
      const eventType = event.event;
      if (event.items) {
        event.items.forEach(item => {
          results[eventType].count++;
          if (item.item_category && item.item_category !== 'Herbal Products') {
            results[eventType].withCategory++;
          } else if (item.item_category === 'Herbal Products') {
            results[eventType].generic++;
          }
        });
      }
    }
  });

  console.table(results);
  return results;
}

validateCategories();
```

**Expected Output:**
```
view_item:
  count: 5+ (multiple products viewed)
  withCategory: 5+ (all have category)
  generic: 0 (NONE are generic fallback)

add_to_cart:
  count: 5+ (multiple adds)
  withCategory: 5+ (all have category)
  generic: 0 (NONE are generic)

begin_checkout:
  count: 2+ (multiple checkouts)
  withCategory: 2+ (all items have category)
  generic: 0 (NONE are generic)

purchase:
  count: 1+ (at least 1 purchase)
  withCategory: 1+ (items have category)
  generic: 0 (NONE are generic)
```

---

## SECTION 7: TEST SCENARIO F - CONCURRENT REQUESTS

**Objective:** Verify that rapid successive events don't cause data loss

### Step 1: Rapid Event Firing

**In Console:**
```javascript
// Monitor before
window.showTrackingState();

// Trigger rapid events (add same product 5 times rapidly)
for (let i = 0; i < 5; i++) {
  // Simulated: click add to cart button 5 times
  // (Do this manually or via UI automation)
}
```

### Step 2: Verify No Event Loss

**In Console:**
```javascript
// Check all add_to_cart events
const addToCartEvents = window.dataLayer.filter(d => d.event === 'add_to_cart');
console.log('Total add_to_cart events:', addToCartEvents.length);

// Should be 5 (or at least all that were triggered)

// Check Meta Pixel events
const mpAddToCart = window.fbq.q.filter(q => q[1] === 'AddToCart');
console.log('Meta Pixel AddToCart events:', mpAddToCart.length);

// Should match GTM count
console.log('Match:', addToCartEvents.length === mpAddToCart.length);
```

**Expected Output:**
```
✅ All 5 events captured in GTM
✅ All 5 events captured in Meta Pixel
✅ No events dropped
✅ No duplicate events
```

---

## SECTION 8: TEST SCENARIO G - SEARCH TRACKING

**Objective:** Verify search events fire for both Header search and POS barcode scan

### Step 1: Header Search

```
1. Go to homepage
2. Open DevTools Console
3. Type in header search: "ashwagandha"
4. Press Enter
5. Watch console for search event
```

**In Console:**
```javascript
// Check GTM search event
const searchEvent = window.dataLayer.find(d => d.event === 'search');
console.log('GTM Search:', searchEvent);

// Check Meta Pixel search event
const mpSearch = window.fbq.q.find(q => q[1] === 'Search');
console.log('Meta Pixel Search:', mpSearch);

// Verify search term
console.log('Search term:', searchEvent.search_term);
```

**Expected Output:**
```
✅ GTM search event fires
✅ search_term: "ashwagandha"
✅ Meta Pixel Search event fires
✅ search_string: "ashwagandha"
```

### Step 2: POS Barcode Search (if available)

```
6. If POS module available: scan a barcode
7. Verify search event fires with barcode as search_term
```

---

## SECTION 9: TEST SCENARIO H - BROWSER CACHE CLEARING

**Objective:** Verify tracking works after cache clear (no stale data)

### Step 1: Clear All Site Data

```
1. DevTools → Application → Storage
2. Click "Clear site data"
3. Refresh page
```

### Step 2: Verify Fresh Tracking

```
4. Go to product page
5. Check console: window.showTrackingState()
```

**Expected:**
```
✅ GTM dataLayer starts fresh
✅ Meta Pixel queue initialized
✅ View item event fires correctly
✅ Category is present (not cached fallback)
```

---

## SECTION 10: TEST SCENARIO I - CHROME DevTools Network Inspection

**Objective:** Verify network requests contain correct event data

### Step 1: View Meta Pixel Request

```
1. DevTools → Network tab
2. Filter: "graph.facebook.com"
3. Complete a purchase
4. Look for request with "Purchase" or "track"
```

### Step 2: Inspect Request Payload

```
5. Click the request
6. Go to "Request" tab
7. Look for POST body containing:
   - event: "track"
   - data: { value, currency, contents: [...] }
```

### Step 3: Verify Category in Payload

```
8. In POST body, search for "category"
9. Verify it contains actual category, not "Herbal Products"
```

**Expected Output:**
```
✅ Request to graph.facebook.com
✅ Payload includes: value, currency, contents
✅ contents array has items with category field
✅ category field contains actual product category
```

---

## SECTION 11: TEST SCENARIO J - GTM DEBUG MODE

**Objective:** Verify GTM is properly configured and events arriving

### Step 1: Enable GTM Debug

```
1. DevTools Console - paste:
   window.dataLayer.push({
     'gtm.start': new Date().getTime(),
     event: 'gtm.js'
   });
```

### Step 2: View GTM Tag Assistant

```
2. Install "Google Tag Manager Assistant" Chrome extension
3. Open extension
4. Click "Enable" to view GTM tags firing
5. Trigger an event (view product)
6. Extension should show:
   - page_view
   - view_item
   - (with data)
```

**Expected Output:**
```
✅ GTM Tag Assistant shows events arriving
✅ Events include full data structure
✅ No errors in GTM queue
```

---

## SECTION 12: EDGE CASE TESTING

### Edge Case 1: Product with No Category

```javascript
// If a product has NULL category in database
// Verify fallback:
product.product_categories?.[0]?.categories?.name || 'Herbal Products'
// Should show: "Herbal Products"

// Check event:
window.dataLayer.find(d => d.event === 'view_item').items[0].item_category
// Should be: "Herbal Products" (and that's correct as fallback)
```

### Edge Case 2: Multiple Categories on Same Product

```javascript
// If product has multiple categories
// System takes first: product_categories[0]
// Verify only first category is used, not all
```

### Edge Case 3: Special Characters in Category Name

```javascript
// If category has quotes, accents, etc.
// Verify properly escaped in JSON
// Check network request for proper encoding
```

### Edge Case 4: Very Long Category Name

```javascript
// Verify long category names don't break event structure
// Check Meta Pixel payload isn't truncated
```

---

## SECTION 13: VERIFICATION CHECKLIST

### ✅ Basic Functionality
- [ ] Home page fires page_view event
- [ ] Product page fires view_item with category
- [ ] Add to cart fires add_to_cart with category
- [ ] Checkout fires begin_checkout with all items and categories
- [ ] Purchase fires purchase with all items and categories
- [ ] Search fires search event

### ✅ Multi-Product Scenarios
- [ ] 3 products with different categories in cart
- [ ] All 3 categories appear in begin_checkout
- [ ] All 3 categories appear in purchase
- [ ] Categories are NOT all "Herbal Products"

### ✅ Direct Checkout
- [ ] Buy Now button triggers direct checkout
- [ ] Category is included (not fallback)
- [ ] Begin checkout has category
- [ ] Purchase has category

### ✅ Error Recovery
- [ ] Events queued when offline
- [ ] Events retried when online
- [ ] Retry queue clears after success
- [ ] localStorage shows queued events

### ✅ Data Integrity
- [ ] No duplicate events
- [ ] All required fields present
- [ ] No null/undefined categories
- [ ] Currency always included
- [ ] Tax and shipping included

### ✅ Meta Pixel Compatibility
- [ ] All events reach Meta Pixel
- [ ] contents array properly formatted
- [ ] category field in every item
- [ ] No data truncation

### ✅ GTM Compatibility
- [ ] All events in dataLayer
- [ ] item_category field in all items
- [ ] Proper currency codes (PKR)
- [ ] Numeric values are numbers (not strings)

---

## SECTION 14: DEBUGGING COMMANDS

### If Events Not Firing:

```javascript
// Check if Meta Pixel is ready
console.log('Meta Pixel ready:', window.fbq?.loaded);
console.log('Meta Pixel version:', window.fbq?.version);

// Check if GTM is initialized
console.log('GTM initialized:', Array.isArray(window.dataLayer));
console.log('GTM dataLayer length:', window.dataLayer.length);

// Check console for errors
// Look for red ❌ messages in console
```

### If Category is Missing:

```javascript
// Check direct checkout query
// Look in Network tab for /api/checkout request
// Verify response includes product_categories

// In browser, navigate to product page, then:
// Check view_item event has category
window.dataLayer.find(d => d.event === 'view_item').items[0]

// If missing, check database query:
// Verify product_categories relation is joined
```

### If Retry Queue Not Working:

```javascript
// Go offline
// Try to send event
// Check localStorage
JSON.parse(localStorage.getItem('new_era_herbals_retry_queue'))

// Go online
// Watch console for retry message
// Check retry queue clears

// If not retrying, check network status:
console.log('Online:', navigator.onLine);
```

---

## SECTION 15: DETAILED DATA VALIDATION

### GTM Event: view_item
```javascript
const event = window.dataLayer.find(d => d.event === 'view_item');
// Required fields:
{
  event: "view_item",
  currency: "PKR", // Always present
  value: <number>, // Product price
  items: [
    {
      item_id: <string>, // Product ID/SKU
      item_name: <string>, // Product name
      item_category: <string>, // ✅ MUST NOT BE MISSING
      item_brand: "New Era Herbals",
      price: <number>,
    }
  ]
}
```

### Meta Pixel Event: ViewContent
```javascript
const event = window.fbq.q.find(q => q[1] === 'ViewContent');
// event[0] = ['track', 'ViewContent', data]
// data must have:
{
  content_id: <string>,
  content_name: <string>,
  content_category: <string>, // ✅ MUST NOT BE MISSING
  value: <number>,
  currency: "PKR",
}
```

### Purchase Event: Full Validation
```javascript
const gtmPurchase = window.dataLayer.find(d => d.event === 'purchase');
const mpPurchase = window.fbq.q.find(q => q[1] === 'Purchase');

// GTM must have:
{
  event: "purchase",
  transaction_id: <string>, // Order number
  value: <number>,
  currency: "PKR",
  tax: <number>,
  shipping: <number>,
  items: [
    {
      item_id: <string>,
      item_name: <string>,
      item_category: <string>, // ✅ EACH ITEM MUST HAVE
      item_brand: <string>,
      price: <number>,
      quantity: <number>,
    },
    // ... more items
  ]
}

// Meta Pixel must have:
{
  content_type: "product",
  value: <number>,
  currency: "PKR",
  contents: [
    {
      id: <string>,
      title: <string>,
      category: <string>, // ✅ EACH ITEM MUST HAVE
      brand: <string>,
      quantity: <number>,
      price: <number>,
    },
    // ... more items
  ]
}
```

---

## FINAL TEST SUMMARY REPORT

After completing all sections, fill in:

| Test Section | Status | Notes |
|--------------|--------|-------|
| Basic Events | ✅/❌ | |
| Multi-Product Cart | ✅/❌ | |
| Direct Checkout | ✅/❌ | |
| Network Failure | ✅/❌ | |
| Multi-Item Purchase | ✅/❌ | |
| Category Validation | ✅/❌ | |
| Concurrent Requests | ✅/❌ | |
| Search Tracking | ✅/❌ | |
| Cache Clearing | ✅/❌ | |
| Network Inspection | ✅/❌ | |
| GTM Debug | ✅/❌ | |
| Edge Cases | ✅/❌ | |

**Overall Result:** ✅ PASS / ❌ FAIL

---

## KNOWN ISSUES TO WATCH FOR

1. **Category shows "Herbal Products" for real products**
   - Check: Is product assigned category in database?
   - Fix: Assign actual category to product

2. **Events not reaching Meta Pixel**
   - Check: VITE_META_PIXEL_ID set?
   - Check: fbevents.js loaded?
   - Check: Console for errors

3. **Duplicate events appearing**
   - Check: Is event being tracked twice?
   - Check: useAnalytics hook called multiple times?

4. **Retry queue stuck**
   - Check: localStorage size quota
   - Solution: Clear old events manually or restart browser

5. **Tax/Shipping showing as 0**
   - Check: Shipping threshold settings
   - Check: Tax rate configuration

---

**End of Advanced Test Suite**
