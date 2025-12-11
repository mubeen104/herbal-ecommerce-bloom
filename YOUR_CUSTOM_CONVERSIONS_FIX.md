# Your Custom Conversions - Issues and Fixes

## Current Status Analysis

Based on your Meta Events Manager, here are the issues found:

---

## ❌ Conversions to DELETE (Too Broad/Incorrect)

### 1. "WEBISTE" (ID: 24683620297991239)
**Problem:** Tracks ALL URL traffic, not purchases
- **Current Rule:** "All URL traffic where URL contains 'https://neweraherbals.com/'"
- **Issue:** This counts every page view (4.6K events), not actual purchases
- **Action:** DELETE this conversion

### 2. "ORDER NOW" (ID: 1056876456523180)
**Problem:** Tracks ALL shop page visits, not orders
- **Current Rule:** "All URL traffic where URL contains 'https://neweraherbals.com/shop'"
- **Issue:** This counts page visits (719 events), not actual orders
- **Action:** DELETE this conversion

### 3. "Purchase" (ID: 829999896283649) - Inactive
**Problem:** Misconfigured rule, inactive
- **Current Rule:** "URL contains 'value currency num_items contents content_ids content_type'"
- **Issue:** Rule is completely wrong - looking for parameter names as text
- **Action:** DELETE this conversion (already inactive)

---

## ⚠️ Conversions to FIX (Edit Rules)

### 4. "InitiateCheckout" (ID: 2011615026419952)
**Current Status:** Active, 120 events
- **Current Rule:** "URL contains 'https://neweraherbals.com/'"
- **Issue:** URL rule too broad (any page on site)
- **Options:**
  - **Option A:** DELETE if you only want to track purchases (not checkout starts)
  - **Option B:** KEEP and EDIT to make URL rule more specific (e.g., `/checkout`)

**If keeping, edit to:**
- Event: `InitiateCheckout`
- URL Contains: `/checkout` (more specific)
- Value: Can be 0.00 for checkout initiation

---

### 5. "Purchase" (ID: 837438998939577) - CRITICAL FIX NEEDED
**Current Status:** Active, but 0 recent activity (last 4 days ago)
- **Current Rule:** "referrer_domain contains 'www.neweraherbals.com'"
- **Current Value:** 0.00 PKR
- **Issues:**
  1. ❌ Using `referrer_domain` rule instead of event-based rule
  2. ❌ No value filter (tracks $0 test orders)
  3. ❌ No recent activity suggests it's not firing correctly

**FIX THIS CONVERSION:**

1. Click on "Purchase" (ID: 837438998939577)
2. Click "Edit" or "Manage"
3. Change the rules to:
   - **Event:** `Purchase` (not URL-based)
   - **Value Greater Than:** `0.01` (excludes test orders)
   - **Currency:** `PKR` (if you only sell in PKR)
   - **Remove:** The referrer_domain rule
4. Save

**New Rule Should Be:**
```
Event: Purchase
AND
Value > 0.01
AND
Currency = PKR
```

---

## ✅ Recommended Final Setup

After cleanup, you should have:

### ONE Purchase Conversion:
```
Name: "Purchase - Real Orders Only"
Event: Purchase
Value Greater Than: 0.01
Currency: PKR
Status: Active
```

### Optional: InitiateCheckout Conversion (if you want to track checkout starts):
```
Name: "Begin Checkout"
Event: InitiateCheckout
URL Contains: /checkout
Status: Active
```

---

## Step-by-Step Action Plan

### Step 1: Delete Unwanted Conversions
1. Go to Meta Events Manager → Custom Conversions
2. Delete "WEBISTE" (ID: 24683620297991239)
3. Delete "ORDER NOW" (ID: 1056876456523180)
4. Delete "Purchase" (ID: 829999896283649) - already inactive

### Step 2: Fix Purchase Conversion
1. Click on "Purchase" (ID: 837438998939577)
2. Click "Edit"
3. Remove referrer_domain rule
4. Add: Event = `Purchase`
5. Add: Value > `0.01`
6. Add: Currency = `PKR`
7. Save

### Step 3: Decide on InitiateCheckout
- **Option A:** Delete it (if you only care about completed purchases)
- **Option B:** Keep it but edit URL rule to `/checkout` (more specific)

### Step 4: Verify
1. Place a test order (value > 0.01)
2. Go to Test Events tab
3. Verify Purchase event appears
4. Verify only ONE conversion triggers
5. Verify value is correct (not 0.00)

---

## Why These Issues Cause Problems

1. **"WEBISTE" and "ORDER NOW" tracking URL traffic:**
   - Counts every page view as a conversion
   - Inflates your conversion numbers
   - Meta optimizes for wrong behavior
   - Wastes ad budget

2. **Purchase conversion with wrong rules:**
   - `referrer_domain` rule doesn't match Purchase events properly
   - No value filter means $0 test orders count as conversions
   - This is why you see conversions without real orders

3. **Multiple Purchase conversions:**
   - One active, one inactive
   - Creates confusion
   - Should have only ONE Purchase conversion

---

## Expected Results After Fix

- ✅ Only real orders (value > 0.01) counted as conversions
- ✅ No more $0 test orders counted
- ✅ Accurate conversion tracking
- ✅ Better ad optimization
- ✅ One Purchase conversion only

---

## Quick Checklist

- [ ] Delete "WEBISTE" conversion
- [ ] Delete "ORDER NOW" conversion  
- [ ] Delete inactive "Purchase" conversion
- [ ] Fix active "Purchase" conversion (add value filter, fix rules)
- [ ] Decide: Keep or delete "InitiateCheckout"
- [ ] Test with real order
- [ ] Verify only one conversion triggers
- [ ] Monitor for 2-3 days to ensure everything works

