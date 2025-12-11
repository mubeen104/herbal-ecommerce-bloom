# How to Fix Unwanted Custom Conversions in Meta Events Manager

If you're seeing custom conversions being tracked without actual orders, follow these steps:

## Step 1: Review Your Custom Conversions

1. Go to [Meta Events Manager](https://business.facebook.com/events_manager2)
2. Select your Pixel
3. Click on **Custom Conversions** in the left sidebar
4. Review all active custom conversions

## Step 2: Check Conversion Rules

For each custom conversion, verify:

### ✅ Correct Setup for Purchase Conversions:

**Event:** `Purchase`  
**URL Contains:** (leave empty or use specific confirmation page)  
**Value Greater Than:** `0.01` (to exclude test orders)  
**Additional Conditions:** 
- `event.currency` equals `PKR` (or your currency)
- `event.value` is greater than `0.01`

### ❌ Common Mistakes to Avoid:

1. **Too Broad Rules:**
   - ❌ Event: `Purchase` with no value filter → Tracks $0 test orders
   - ✅ Event: `Purchase` with `value > 0.01` → Only real orders

2. **Wrong Event Type:**
   - ❌ Using `PageView` or `ViewContent` as conversion → Tracks all page views
   - ✅ Use only `Purchase` for order conversions

3. **Missing Value Filters:**
   - ❌ No minimum value → Tracks test orders with $0
   - ✅ Add `value > 0.01` filter

## Step 3: Delete or Pause Unwanted Conversions

1. In Custom Conversions, find the problematic conversion
2. Click the **three dots** (⋯) next to it
3. Choose **Delete** or **Pause**
4. Confirm the action

## Step 4: Create Proper Purchase Conversion

1. Click **Create Custom Conversion**
2. Configure:
   - **Name:** `Purchase - Real Orders Only`
   - **Event:** `Purchase`
   - **Value Greater Than:** `0.01`
   - **Currency:** `PKR` (or your currency)
   - **URL Contains:** (optional - your order confirmation page path)
3. Click **Create**

## Step 5: Verify in Test Events

1. Go to **Test Events** tab in Events Manager
2. Complete a test order on your site
3. Verify:
   - ✅ Purchase event appears
   - ✅ Value is correct
   - ✅ Custom conversion is triggered (check "Conversions" column)

## Step 6: Check for Duplicate Conversions

If you have multiple Purchase conversions:
- Keep only ONE active conversion for Purchase events
- Delete or pause all others to prevent double-counting

## Step 7: Review Aggregated Event Measurement (AEM)

1. Go to **Settings** → **Aggregated Event Measurement**
2. Verify Purchase events are properly configured
3. Check if any test events are being counted

## Common Issues and Solutions

### Issue: Conversions counting without orders

**Solution:**
- Add `value > 0.01` filter to exclude test orders
- Verify order creation is successful before Purchase event fires (already implemented in code)

### Issue: Multiple conversions for same order

**Solution:**
- Delete duplicate custom conversions
- Ensure Purchase event fires only once per order (deduplication already implemented)

### Issue: Test orders being counted

**Solution:**
- Add value filter: `value > 0.01`
- Use Meta's Test Events tool to verify, but don't create conversions from test events

## Code-Level Protections (Already Implemented)

The code now includes:

1. ✅ **UUID Validation:** Only valid order IDs (UUIDs) trigger Purchase events
2. ✅ **Minimum Value Check:** Orders with total < 0.01 are rejected
3. ✅ **Deduplication:** Same order ID tracked only once per session
4. ✅ **Item Validation:** All items must have valid IDs, names, prices, and quantities
5. ✅ **Total Validation:** Order total must match calculated items total

## Verification Checklist

- [ ] Reviewed all custom conversions in Meta Events Manager
- [ ] Deleted/paused unwanted conversions
- [ ] Created proper Purchase conversion with value filter
- [ ] Tested with real order (value > 0.01)
- [ ] Verified conversion appears in Test Events
- [ ] Confirmed no duplicate conversions exist
- [ ] Checked AEM settings

---

**Note:** Custom conversions are configured in Meta Events Manager, not in your code. The code changes ensure only valid, real orders trigger Purchase events, but you must also configure Meta correctly to avoid counting test events.

