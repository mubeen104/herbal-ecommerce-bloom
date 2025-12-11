# Detailed Guide: Identifying and Fixing Duplicate or Overly Broad Custom Conversions

This guide explains how to identify problematic custom conversions in Meta Events Manager and fix them.

---

## Part 1: Understanding Custom Conversions

### What are Custom Conversions?

Custom Conversions in Meta Events Manager are rules that automatically count certain events as conversions. For example:
- When a `Purchase` event fires → Count it as a "Sale" conversion
- When a `AddToCart` event fires → Count it as an "Add to Cart" conversion

### Why Duplicates and Overly Broad Rules are Problems

1. **Double Counting:** Same order counted multiple times
2. **Incorrect Metrics:** Your ad performance data becomes unreliable
3. **Wasted Budget:** Meta optimizes for wrong conversions
4. **Test Data Pollution:** Test orders counted as real conversions

---

## Part 2: Identifying Duplicate Conversions

### What is a Duplicate Conversion?

A duplicate conversion is when you have **multiple custom conversions** that track the **same event** with **similar or identical rules**.

### Example of Duplicate Conversions:

```
Conversion 1: "Purchase - Sales"
  - Event: Purchase
  - Value > 0
  - No other filters

Conversion 2: "Purchase Conversion"
  - Event: Purchase
  - Value > 0
  - No other filters

Conversion 3: "Order Completed"
  - Event: Purchase
  - Value > 0.01
  - Currency: PKR
```

**Problem:** All three track Purchase events, so one order triggers THREE conversions!

### How to Find Duplicates:

#### Step 1: List All Your Custom Conversions

1. Go to [Meta Events Manager](https://business.facebook.com/events_manager2)
2. Select your Pixel
3. Click **Custom Conversions** in the left sidebar
4. You'll see a list like this:

```
Active Custom Conversions:
├── Purchase - Sales
├── Purchase Conversion
├── Order Completed
├── Add to Cart
├── Checkout Started
└── Page View Conversion
```

#### Step 2: Check Each Conversion's Rules

For each conversion, click on it to see its details:

**Conversion: "Purchase - Sales"**
- Event: `Purchase`
- Value Greater Than: `0`
- Currency: (Any)
- URL Contains: (empty)

**Conversion: "Purchase Conversion"**
- Event: `Purchase`
- Value Greater Than: `0`
- Currency: (Any)
- URL Contains: (empty)

**Conversion: "Order Completed"**
- Event: `Purchase`
- Value Greater Than: `0.01`
- Currency: `PKR`
- URL Contains: `/order-confirmation`

#### Step 3: Identify Duplicates

Compare the rules:

| Conversion Name | Event | Value Filter | Currency | URL Filter | Is Duplicate? |
|----------------|-------|--------------|----------|------------|---------------|
| Purchase - Sales | Purchase | > 0 | Any | None | ⚠️ Too broad |
| Purchase Conversion | Purchase | > 0 | Any | None | ✅ Duplicate of above |
| Order Completed | Purchase | > 0.01 | PKR | `/order-confirmation` | ✅ Different (more specific) |

**Analysis:**
- "Purchase - Sales" and "Purchase Conversion" are **duplicates** (same rules)
- "Order Completed" is **different** (has currency and URL filters)

---

## Part 3: Identifying Overly Broad Conversions

### What is an Overly Broad Conversion?

An overly broad conversion has rules that are **too loose**, causing it to track events it shouldn't.

### Examples of Overly Broad Conversions:

#### Example 1: No Value Filter

```
Conversion: "All Purchases"
  - Event: Purchase
  - Value Greater Than: 0  ❌ Too broad!
  - No currency filter
  - No URL filter
```

**Problem:** Tracks $0 test orders, $0.01 test orders, and real orders. You can't distinguish real sales from test data.

**Fix:** Add `Value Greater Than: 0.01` to exclude test orders.

#### Example 2: Wrong Event Type

```
Conversion: "Sales"
  - Event: PageView  ❌ Wrong event!
  - URL Contains: /checkout
```

**Problem:** Tracks every page view on checkout page, not actual purchases. Someone could visit checkout 10 times and it counts as 10 "sales"!

**Fix:** Change event to `Purchase` instead of `PageView`.

#### Example 3: No Filters at All

```
Conversion: "Any Purchase"
  - Event: Purchase
  - No value filter
  - No currency filter
  - No URL filter
  - No other conditions
```

**Problem:** Tracks ALL Purchase events, including:
- Test orders from development
- $0 orders
- Orders from different currencies
- Duplicate events

**Fix:** Add filters:
- Value Greater Than: `0.01`
- Currency: `PKR` (or your currency)
- URL Contains: `/order-confirmation` (optional, but recommended)

---

## Part 4: Step-by-Step Fix Process

### Step 1: Export Your Current Conversions

1. In Custom Conversions page, note down:
   - Conversion name
   - Event type
   - All filters/conditions
   - Status (Active/Paused)

Create a table like this:

```
| Name | Event | Value Filter | Currency | URL | Status |
|------|-------|--------------|----------|-----|--------|
| Purchase - Sales | Purchase | > 0 | Any | None | Active |
| Purchase Conversion | Purchase | > 0 | Any | None | Active |
| Order Completed | Purchase | > 0.01 | PKR | /order-confirmation | Active |
```

### Step 2: Identify What to Keep

**Best Practice:** Keep the **most specific** conversion and delete the rest.

From the example above:
- ✅ **Keep:** "Order Completed" (has value filter, currency filter, URL filter)
- ❌ **Delete:** "Purchase - Sales" (too broad, no filters)
- ❌ **Delete:** "Purchase Conversion" (duplicate of "Purchase - Sales")

### Step 3: Delete Duplicate Conversions

#### Method 1: Delete from List View

1. In Custom Conversions page, find the duplicate
2. Click the **three dots (⋯)** on the right
3. Select **Delete**
4. Confirm deletion

#### Method 2: Delete from Detail View

1. Click on the conversion name to open details
2. Click **Delete** button (usually at top right)
3. Confirm deletion

**Important:** 
- Deleting a conversion does NOT delete historical data
- It only stops counting NEW events as conversions
- Past conversions remain in your reports

### Step 4: Fix Overly Broad Conversions

Instead of deleting, you can **edit** to make them more specific:

1. Click on the conversion name
2. Click **Edit** button
3. Add filters:
   - **Value Greater Than:** `0.01` (excludes test orders)
   - **Currency:** `PKR` (or your currency)
   - **URL Contains:** `/order-confirmation` (optional, but recommended)
4. Click **Save**

---

## Part 5: Real-World Examples

### Example Scenario 1: Multiple Purchase Conversions

**Current Setup:**
```
1. "Sales" - Purchase, Value > 0, Any currency
2. "Orders" - Purchase, Value > 0, Any currency  
3. "Completed Purchases" - Purchase, Value > 0.01, PKR only
```

**Problem:** 
- Conversions 1 and 2 are duplicates
- Conversion 1 and 2 are too broad (no currency filter, value > 0 includes test orders)

**Solution:**
1. **Delete** "Sales" and "Orders" (duplicates and too broad)
2. **Keep** "Completed Purchases" (most specific)
3. **Optionally rename** "Completed Purchases" to "Purchase - Real Orders"

**Result:** One conversion that only tracks real PKR orders > $0.01

---

### Example Scenario 2: Wrong Event Types

**Current Setup:**
```
1. "Checkout Conversion" - Event: PageView, URL contains /checkout
2. "Add to Cart" - Event: AddToCart, No filters
3. "Purchase" - Event: Purchase, Value > 0.01
```

**Problem:**
- Conversion 1 uses `PageView` instead of `BeginCheckout` or `Purchase`
- This counts page visits as conversions, not actual actions

**Solution:**
1. **Delete** "Checkout Conversion" (wrong event type)
2. **Create new:** "Begin Checkout" - Event: `BeginCheckout`, No filters (or add URL filter)
3. **Keep** "Add to Cart" and "Purchase" (these are correct)

**Result:** Conversions track actual user actions, not just page views

---

### Example Scenario 3: Test Orders Being Counted

**Current Setup:**
```
"Purchase Conversion" - Purchase, Value > 0, No other filters
```

**Problem:**
- Value > 0 includes $0.01 test orders
- No currency filter means test orders in any currency count
- No URL filter means test events from any page count

**Solution:**
1. **Edit** "Purchase Conversion"
2. Change Value filter to: `> 0.01` (excludes $0 and $0.01 test orders)
3. Add Currency filter: `PKR` (only count your currency)
4. Add URL filter: `/order-confirmation` (only count from confirmation page)
5. **Save**

**Result:** Only real orders from your site in PKR currency are counted

---

## Part 6: Recommended Conversion Setup

### For E-commerce, You Should Have:

#### 1. Purchase Conversion (Most Important)
```
Name: "Purchase - Real Orders Only"
Event: Purchase
Value Greater Than: 0.01
Currency: PKR (or your currency)
URL Contains: /order-confirmation (optional but recommended)
Status: Active
```

#### 2. Add to Cart Conversion (Optional)
```
Name: "Add to Cart"
Event: AddToCart
No value filter (cart value varies)
Status: Active
```

#### 3. Begin Checkout Conversion (Optional)
```
Name: "Begin Checkout"
Event: BeginCheckout
Value Greater Than: 0.01
Status: Active
```

**Important:** 
- Only create ONE conversion per event type
- Use the Purchase conversion for optimization (it's the most valuable)
- Other conversions are for reporting/analysis only

---

## Part 7: Verification Steps

After fixing conversions, verify everything works:

### Step 1: Check Active Conversions

1. Go to Custom Conversions
2. Verify you have:
   - ✅ Only ONE Purchase conversion
   - ✅ Purchase conversion has Value > 0.01 filter
   - ✅ No duplicate conversions

### Step 2: Test with Real Order

1. Place a real order on your site (value > 0.01)
2. Go to Meta Events Manager → **Test Events** tab
3. Verify:
   - ✅ Purchase event appears
   - ✅ Value is correct
   - ✅ Only ONE conversion is triggered (check "Conversions" column)

### Step 3: Check Historical Data

1. Go to **Overview** or **Conversions** report
2. Check if conversion counts make sense
3. If you see sudden drops after deleting duplicates, that's normal (you removed double-counting)

---

## Part 8: Common Mistakes to Avoid

### ❌ Mistake 1: Creating Multiple Purchase Conversions

**Wrong:**
```
- "Sales Conversion"
- "Purchase Conversion"  
- "Order Conversion"
All tracking Purchase events
```

**Right:**
```
- "Purchase - Real Orders Only" (ONE conversion)
```

### ❌ Mistake 2: Using PageView for Purchase Tracking

**Wrong:**
```
Conversion: "Sales"
Event: PageView
URL: /thank-you
```

**Right:**
```
Conversion: "Sales"
Event: Purchase
Value > 0.01
```

### ❌ Mistake 3: No Value Filter

**Wrong:**
```
Conversion: "All Purchases"
Event: Purchase
Value > 0  (includes $0.01 test orders)
```

**Right:**
```
Conversion: "Real Purchases"
Event: Purchase
Value > 0.01  (excludes test orders)
```

### ❌ Mistake 4: Tracking All Events as Conversions

**Wrong:**
```
- PageView → Conversion
- ViewContent → Conversion
- AddToCart → Conversion
- BeginCheckout → Conversion
- Purchase → Conversion
```

**Right:**
```
- Purchase → Conversion (primary)
- AddToCart → Conversion (optional, for analysis)
- BeginCheckout → Conversion (optional, for analysis)
- PageView → NOT a conversion (just an event)
- ViewContent → NOT a conversion (just an event)
```

---

## Part 9: Quick Checklist

Before you start:
- [ ] List all active custom conversions
- [ ] Note down each conversion's rules
- [ ] Identify duplicates (same event, similar rules)
- [ ] Identify overly broad conversions (no filters or wrong filters)

During cleanup:
- [ ] Delete duplicate conversions (keep the most specific one)
- [ ] Edit overly broad conversions (add proper filters)
- [ ] Ensure only ONE Purchase conversion exists
- [ ] Verify Purchase conversion has Value > 0.01 filter

After cleanup:
- [ ] Test with real order
- [ ] Verify only one conversion triggers
- [ ] Check conversion counts in reports
- [ ] Monitor for a few days to ensure everything works

---

## Part 10: Need Help?

If you're unsure about a conversion:

1. **Check the Event Type:**
   - Purchase conversions should use `Purchase` event
   - Not `PageView`, `ViewContent`, or other events

2. **Check the Filters:**
   - Should have Value > 0.01 (excludes test orders)
   - Should have Currency filter (if you only sell in one currency)
   - Optional: URL filter for confirmation page

3. **Check for Duplicates:**
   - Compare rules side-by-side
   - If two conversions have identical rules, delete one

4. **When in Doubt:**
   - Pause the conversion (don't delete immediately)
   - Test for a few days
   - If everything works, then delete it
   - If something breaks, reactivate it

---

## Summary

**Key Points:**
1. **One Purchase conversion only** - Delete duplicates
2. **Add value filter** - Value > 0.01 to exclude test orders
3. **Use correct event type** - Purchase events for purchases, not PageView
4. **Add currency filter** - If you only sell in one currency
5. **Test after changes** - Verify with real order

**Remember:** Custom conversions are configured in Meta Events Manager, not in your code. The code ensures only valid orders trigger Purchase events, but you must configure Meta correctly to avoid counting test events or double-counting.

