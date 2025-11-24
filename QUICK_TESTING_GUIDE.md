# Quick Testing Guide - Follow These Steps NOW

## 🚀 QUICK START (5 minutes)

### Step 1: Open Browser Console
```
1. Go to https://yourdomain.com
2. Press F12 (Windows/Linux) or Cmd+Option+I (Mac)
3. Click "Console" tab
4. You should see green checkmarks (✅) in console
```

### Step 2: Paste This Monitoring Code
Copy and paste this entire block into your browser console:

```javascript
console.log('=== TRACKING SYSTEM MONITOR LOADED ===');

// Real-time event monitor
window.trackingMonitor = {
  events: [],
  start() {
    const originalPush = window.dataLayer.push.bind(window.dataLayer);
    window.dataLayer.push = (...args) => {
      if (args[0]?.event) {
        console.log(`📊 GTM: ${args[0].event}`, args[0]);
        this.events.push({ type: 'GTM', ...args[0] });
      }
      return originalPush(...args);
    };
    console.log('✅ Monitoring active');
  },
  
  showState() {
    console.group('📈 CURRENT STATE');
    console.log('GTM events:', window.dataLayer.length);
    console.log('Last GTM:', window.dataLayer[window.dataLayer.length - 1]);
    console.log('Retry queue size:', JSON.parse(localStorage.getItem('new_era_herbals_retry_queue') || '[]').length);
    console.groupEnd();
  },
  
  checkCategories() {
    console.group('🏷️ CATEGORY CHECK');
    const events = window.dataLayer.filter(d => d.items);
    const categoryCount = events.reduce((sum, e) => sum + (e.items?.filter(i => i.item_category).length || 0), 0);
    const totalItems = events.reduce((sum, e) => sum + (e.items?.length || 0), 0);
    console.log(`Total items tracked: ${totalItems}`);
    console.log(`Items with category: ${categoryCount}`);
    console.log(`% with category: ${((categoryCount / totalItems) * 100).toFixed(0)}%`);
    
    // Show actual categories used
    const categories = new Set();
    window.dataLayer.forEach(d => {
      if (d.items) {
        d.items.forEach(i => {
          if (i.item_category) categories.add(i.item_category);
        });
      }
    });
    console.log('Unique categories:', Array.from(categories));
    console.groupEnd();
  }
};

window.trackingMonitor.start();
```

---

## TEST 1: PRODUCT VIEW ✅
**Time: 1 minute**

```
1. In console, type: window.trackingMonitor.showState()
2. Note the current GTM count
3. Go to /shop
4. Click on any product (e.g., Ashwagandha)
5. Back in console: window.trackingMonitor.showState()
6. GTM count should increase by 1
7. Look for green checkmark: ✅ [GTM] Event pushed: view_item
8. Type: window.dataLayer[window.dataLayer.length - 1]
9. You should see:
   {
     event: "view_item",
     items: [{
       item_id: "...",
       item_name: "Ashwagandha",
       item_category: "Wellness Adaptogens",  ← SHOULD SEE THIS
       price: 1299
     }]
   }
```

**✅ PASS if:** You see `item_category` with a real category name (not "Herbal Products")

---

## TEST 2: ADD TO CART ✅
**Time: 2 minutes**

```
1. While viewing product, click "Add to Cart"
2. You should see toast: "Added to cart"
3. Console should show: ✅ [GTM] Event pushed: add_to_cart
4. Check the event:
   window.dataLayer.find(d => d.event === 'add_to_cart')
5. You should see:
   {
     event: "add_to_cart",
     items: [{
       item_id: "...",
       item_name: "...",
       item_category: "...",  ← CATEGORY PRESENT
       quantity: 1,
       price: 1299
     }]
   }
```

**✅ PASS if:** Category is present and not "Herbal Products"

---

## TEST 3: MULTI-PRODUCT CART ✅
**Time: 3 minutes**

```
1. Go to /shop
2. Add 3 different products:
   - Product A (note category)
   - Product B (different category)
   - Product C (different category)
3. Console shows 3 add_to_cart events
4. Type: window.trackingMonitor.checkCategories()
5. You should see:
   Total items tracked: 3
   Items with category: 3
   % with category: 100%
   Unique categories: ["Category 1", "Category 2", "Category 3"]
```

**✅ PASS if:** All 3 items have categories, and they're different

---

## TEST 4: BEGIN CHECKOUT ✅
**Time: 2 minutes**

```
1. Click cart icon → "View Cart"
2. Click "Checkout"
3. Watch console for: ✅ [GTM] Event pushed: begin_checkout
4. Check the event:
   window.dataLayer.find(d => d.event === 'begin_checkout')
5. You should see:
   {
     event: "begin_checkout",
     items: [
       { item_id: "...", item_category: "Category 1", ... },
       { item_id: "...", item_category: "Category 2", ... },
       { item_id: "...", item_category: "Category 3", ... }
     ],
     value: 5000,
     tax: 500,
     shipping: 300
   }
```

**✅ PASS if:** All 3 items present with correct categories, tax/shipping > 0

---

## TEST 5: PURCHASE ✅
**Time: 5 minutes**

```
1. Fill checkout form:
   - Email: test@example.com
   - Name: Test User
   - Address: Any address
2. Select payment method
3. Click "Place Order"
4. Watch console for: ✅ [GTM] Event pushed: purchase
5. After order succeeds, check:
   window.dataLayer.find(d => d.event === 'purchase')
6. You should see:
   {
     event: "purchase",
     transaction_id: "NEH-...",
     items: [
       { item_id: "...", item_category: "Category 1", ... },
       { item_id: "...", item_category: "Category 2", ... },
       { item_id: "...", item_category: "Category 3", ... }
     ],
     value: 5000,
     tax: 500,
     shipping: 300
   }
```

**✅ PASS if:**
- All 3 items in purchase event
- Each has item_category
- Categories are correct (not "Herbal Products")
- transaction_id is set

---

## TEST 6: DIRECT CHECKOUT ✅
**Time: 3 minutes**

```
1. Go to /shop (clear cart first)
2. Find any product
3. Click "Buy Now" button
4. Should go directly to checkout
5. Console shows: ✅ [GTM] Event pushed: begin_checkout
6. Check the begin_checkout event:
   window.dataLayer.find(d => d.event === 'begin_checkout')
7. Should have 1 item with category:
   {
     items: [{
       item_category: "Wellness Adaptogens",  ← NOT "Herbal Products"
     }]
   }
8. Complete checkout (fill form, place order)
9. Check purchase event:
   window.dataLayer.find(d => d.event === 'purchase')
10. Should include category in item
```

**✅ PASS if:** Direct checkout includes category, not generic fallback

---

## TEST 7: NETWORK OFFLINE ⚠️
**Time: 5 minutes - IMPORTANT TEST**

```
1. Open DevTools: F12
2. Go to Network tab
3. In dropdown (top left), select "Offline"
4. Go to /shop
5. Click on a product
6. Console should show: ⏳ [Meta Pixel] Event queued
7. You should also see: 📋 [Retry Queue] Added Meta Pixel event to retry queue
8. Check localStorage:
   JSON.parse(localStorage.getItem('new_era_herbals_retry_queue'))
   Should show queued events
9. In Network dropdown, select "No throttling" (go back online)
10. Watch console for:
    🔄 [Retry Queue] Processing X failed events
    ✅ [Meta Pixel] Event fired: ViewContent
11. Check localStorage again:
    JSON.parse(localStorage.getItem('new_era_herbals_retry_queue'))
    Should be empty now
```

**✅ PASS if:**
- Events queued when offline
- Retry queue shows in localStorage
- Events retried when online
- Retry queue cleared after success

---

## TEST 8: SEARCH ✅
**Time: 2 minutes**

```
1. Go to homepage
2. In header search bar, type: "ashwagandha"
3. Press Enter
4. Console shows: ✅ [GTM] Event pushed: search
5. Check the event:
   window.dataLayer.find(d => d.event === 'search')
   Should show: { event: "search", search_term: "ashwagandha" }
6. Page should show search results
```

**✅ PASS if:** search_term is correct

---

## TEST 9: META PIXEL EVENTS 📱
**Time: 2 minutes**

```
1. Go to product page
2. Check Meta Pixel queue:
   window.fbq.q
   Should be an array with queued events
3. If you see this structure, it's working:
   window.fbq.q = [
     ["init", "YOUR_PIXEL_ID"],
     ["track", "ViewContent", { content_id: "...", content_category: "..." }],
     ["track", "PageView"]
   ]
4. Meta Pixel should fire events without errors
5. Check console - NO red ❌ errors related to Meta Pixel
```

**✅ PASS if:** fbq.q has events, no red errors

---

## TEST 10: CATEGORY FIELD VALIDATION 🏷️
**Time: 2 minutes**

```
1. After completing all above tests, run:
   window.trackingMonitor.checkCategories()
2. You should see:
   Total items tracked: 10+ (from all tests)
   Items with category: 10+ (all of them)
   % with category: 100%
   Unique categories: ["Category 1", "Category 2", "Category 3", ...]
3. CRITICAL: If you see:
   Unique categories: ["Herbal Products"]
   This means categories aren't being fetched from database
   Check: Is product assigned category in database?
```

**✅ PASS if:** Multiple unique categories, NOT just "Herbal Products"

---

## CONSOLE QUICK REFERENCE

### Check Last GTM Event
```javascript
window.dataLayer[window.dataLayer.length - 1]
```

### Find Specific Event Type
```javascript
window.dataLayer.find(d => d.event === 'purchase')
window.dataLayer.find(d => d.event === 'begin_checkout')
window.dataLayer.find(d => d.event === 'add_to_cart')
window.dataLayer.find(d => d.event === 'view_item')
```

### Check All Events of Type
```javascript
window.dataLayer.filter(d => d.event === 'add_to_cart')
```

### Check Retry Queue
```javascript
JSON.parse(localStorage.getItem('new_era_herbals_retry_queue'))
```

### Clear Retry Queue (if stuck)
```javascript
localStorage.removeItem('new_era_herbals_retry_queue')
```

### Check Meta Pixel Status
```javascript
console.log('fbq ready:', !!window.fbq)
console.log('fbq version:', window.fbq?.version)
console.log('fbq queue:', window.fbq?.q?.length)
```

### Show Current Tracking State
```javascript
window.trackingMonitor.showState()
```

### Validate All Categories
```javascript
window.trackingMonitor.checkCategories()
```

---

## EXPECTED CONSOLE OUTPUT (GOOD SIGNS)

When everything works, you'll see:
```
✅ [GTM] Event pushed: view_item
✅ [Meta Pixel] Event fired: ViewContent
✅ [GTM] Event pushed: add_to_cart
✅ [Meta Pixel] Event fired: AddToCart
✅ [GTM] Event pushed: begin_checkout
✅ [Meta Pixel] Event fired: InitiateCheckout
✅ [GTM] Event pushed: purchase
✅ [Meta Pixel] Event fired: Purchase
```

---

## RED FLAGS ⚠️ (If You See These)

| Issue | What It Means | Fix |
|-------|--------------|-----|
| ❌ [Meta Pixel] Event failed | Network or script error | Check Network tab, may auto-retry |
| ⏳ [Meta Pixel] Event queued | Meta Pixel not ready yet | Normal during initialization |
| 📋 [Retry Queue] No recovery | Network still offline or localStorage full | Go online, clear old events |
| item_category: "Herbal Products" | Product doesn't have category in DB | Assign category in admin |
| 0 items in begin_checkout | Cart is empty | Add products first |
| ❌ No [GTM] Event pushed | GTM_ID not set | Check environment variables |

---

## PASS/FAIL SUMMARY

After running all 10 tests, count your checkmarks:

**✅ PASS (All 10 tests pass):**
- Tracking system is 100% working
- Categories are properly tracked
- Network resilience is working
- All events firing to GTM + Meta Pixel
- **Status: PRODUCTION READY**

**⚠️ PARTIAL (7-9 tests pass):**
- Most functionality working
- Minor issues to debug
- Check specific failed test above
- May need to verify environment variables

**❌ FAIL (Less than 7 tests pass):**
- Check console for red ❌ errors
- Verify VITE_GTM_ID set
- Verify VITE_META_PIXEL_ID set
- Restart app: npm run dev
- Check that tracking events are being called

---

## How to Debug Issues

### Issue: Events Not Firing
```javascript
// Check if tracking functions are imported
window.trackingMonitor.start()

// Try manually firing an event
import { trackViewContent } from '@/utils/analytics'
trackViewContent({ id: 'test', name: 'Test', price: 100, category: 'Test' })

// Should see event in dataLayer
window.dataLayer[window.dataLayer.length - 1]
```

### Issue: Category Missing
```javascript
// Check database: Does product have category?
// Navigate to product page
// Check if category loads in UI

// Check the query is fetching category:
// Network tab → Check /api/* calls
// Look for product_categories in response
```

### Issue: Meta Pixel Not Working
```javascript
// Check if script loaded
JSON.stringify(window.fbq)

// Check if PIXEL ID set
// Go to page source, search for "fbq('init'"
// Should see your pixel ID

// Check console for script errors
// Look for: "fbevents.js failed to load"
```

---

## NEXT STEPS

1. **Run all 10 tests** (15-20 minutes total)
2. **Document results** in TRACKING_TEST_REPORT.md
3. **If all pass:** System is production-ready ✅
4. **If any fail:** Debug using the troubleshooting guide above
5. **Share results** with your team

---

**MOST IMPORTANT:** Pay attention to the **category field** - it should NOT always be "Herbal Products". If it is, the products in your database don't have categories assigned.
