# GTM Events Reference
## Events Sent from Your Application

This document shows exactly what events your application sends to GTM's dataLayer.

---

## Event 1: Page View

**Event Name**: `page_view`

**When It Fires**: 
- On initial page load
- On route changes (SPA navigation)
- Via SPA route detection (MutationObserver fallback)

**Data Sent**:
```javascript
{
  event: 'page_view',
  page_path: '/shop',
  page_title: 'Shop - New Era Herbals',
  page_location: 'https://yoursite.com/shop'
}
```

**GTM Setup**:
- Trigger: Custom Event → Event name: `page_view`
- Tag: Meta Pixel - PageView

---

## Event 2: View Item (Product View)

**Event Name**: `view_item`

**When It Fires**: 
- When user clicks on a product card
- When user views a product detail page
- Only once per product per session (deduplicated)

**Data Sent**:
```javascript
{
  event: 'view_item',
  currency: 'PKR',
  value: 1500.00,
  items: [{
    item_id: 'prod_123',
    item_name: 'Rosemary Oil',
    item_category: 'Herbal Products',
    item_brand: 'New Era Herbals',
    price: 1500.00
  }]
}
```

**GTM Setup**:
- Trigger: Custom Event → Event name: `view_item`
- Tag: Meta Pixel - ViewContent
- Variables needed:
  - `items.0.item_id` → Product ID
  - `items.0.item_name` → Product Name
  - `value` → Product Price
  - `currency` → Currency Code

---

## Event 3: Add to Cart

**Event Name**: `add_to_cart`

**When It Fires**: 
- When user adds a product to cart
- Includes quantity and total value

**Data Sent**:
```javascript
{
  event: 'add_to_cart',
  currency: 'PKR',
  value: 3000.00,  // price * quantity
  items: [{
    item_id: 'prod_123',
    item_name: 'Rosemary Oil',
    item_category: 'Herbal Products',
    item_brand: 'New Era Herbals',
    price: 1500.00,
    quantity: 2
  }]
}
```

**GTM Setup**:
- Trigger: Custom Event → Event name: `add_to_cart`
- Tag: Meta Pixel - AddToCart
- Variables needed:
  - `items.0.item_id` → Product ID
  - `items.0.item_name` → Product Name
  - `items.0.quantity` → Quantity
  - `value` → Total Value (price * quantity)
  - `currency` → Currency Code

---

## Event 4: Begin Checkout

**Event Name**: `begin_checkout`

**When It Fires**: 
- When user lands on checkout page
- Includes all cart items with metadata
- Fires again if coupon is applied (to update value)

**Data Sent**:
```javascript
{
  event: 'begin_checkout',
  currency: 'PKR',
  value: 4500.00,  // Total cart value
  tax: 0,
  shipping: 0,
  items: [
    {
      item_id: 'prod_123',
      item_name: 'Rosemary Oil',
      item_category: 'Herbal Products',
      item_brand: 'New Era Herbals',
      price: 1500.00,
      quantity: 2
    },
    {
      item_id: 'prod_456',
      item_name: 'Anti Hair Fall Oil',
      item_category: 'Herbal Products',
      item_brand: 'New Era Herbals',
      price: 1500.00,
      quantity: 1
    }
  ]
}
```

**GTM Setup**:
- Trigger: Custom Event → Event name: `begin_checkout`
- Tag: Meta Pixel - InitiateCheckout
- Variables needed:
  - `value` → Total checkout value
  - `currency` → Currency Code
  - `items` → Array of all items
  - `items.length` → Number of items

---

## Event 5: Purchase

**Event Name**: `purchase`

**When It Fires**: 
- When order is successfully created
- Only once per order (deduplicated by order ID)
- Includes complete order details

**Data Sent**:
```javascript
{
  event: 'purchase',
  transaction_id: 'ORD-12345',
  currency: 'PKR',
  value: 4500.00,  // Order total
  tax: 0,
  shipping: 0,
  items: [
    {
      item_id: 'prod_123',
      item_name: 'Rosemary Oil',
      item_category: 'Herbal Products',
      item_brand: 'New Era Herbals',
      price: 1500.00,
      quantity: 2
    },
    {
      item_id: 'prod_456',
      item_name: 'Anti Hair Fall Oil',
      item_category: 'Herbal Products',
      item_brand: 'New Era Herbals',
      price: 1500.00,
      quantity: 1
    }
  ]
}
```

**GTM Setup**:
- Trigger: Custom Event → Event name: `purchase`
- Tag: Meta Pixel - Purchase
- Variables needed:
  - `transaction_id` → Order ID
  - `value` → Order total
  - `currency` → Currency Code
  - `items` → Array of all purchased items

---

## Event 6: Search

**Event Name**: `search`

**When It Fires**: 
- When user performs a search
- Includes search term

**Data Sent**:
```javascript
{
  event: 'search',
  search_term: 'rosemary'
}
```

**GTM Setup**:
- Trigger: Custom Event → Event name: `search`
- Tag: Meta Pixel - Search
- Variables needed:
  - `search_term` → Search query string

---

## Event 7: Virtual Pageview (SPA)

**Event Name**: `virtual_pageview`

**When It Fires**: 
- On SPA route changes (detected by MutationObserver)
- Fallback for React Router navigation

**Data Sent**:
```javascript
{
  event: 'virtual_pageview',
  page: '/shop?search=rosemary'
}
```

**GTM Setup**:
- Trigger: Custom Event → Event name: `virtual_pageview`
- Tag: Meta Pixel - PageView (same as regular pageview)
- Variables needed:
  - `page` → Current page path

---

## Testing Events in Browser Console

To see what events are being sent, open browser console and run:

```javascript
// View all events in dataLayer
console.log(window.dataLayer);

// Filter for specific event
window.dataLayer.filter(e => e.event === 'view_item');

// Monitor new events
window.dataLayer.push = (function(original) {
  return function() {
    console.log('GTM Event:', arguments[0]);
    return original.apply(this, arguments);
  };
})(window.dataLayer.push);
```

---

## Event Deduplication

Your application includes built-in deduplication:

1. **PageView**: Only fires once per page per 5 seconds
2. **ViewContent**: Only fires once per product per session
3. **BeginCheckout**: Only fires once per checkout session per 10 seconds
4. **Purchase**: Only fires once per order ID per session

This prevents duplicate events from React Strict Mode or component re-renders.

---

## Currency Codes

Your application uses these currency codes:
- `PKR` - Pakistani Rupee (default)
- `USD` - US Dollar
- `GBP` - British Pound

Currency is automatically detected from product prices or defaults to `PKR`.

---

## Product Metadata

All product events include:
- `item_id` - Product ID (required)
- `item_name` - Product Name (required)
- `item_category` - Product Category (defaults to "Herbal Products")
- `item_brand` - Brand Name (defaults to "New Era Herbals")
- `price` - Product Price (required)
- `quantity` - Quantity (for cart/checkout/purchase events)

---

## Quick Debugging

If events aren't appearing in GTM:

1. **Check dataLayer**:
   ```javascript
   window.dataLayer
   ```

2. **Check for errors**:
   ```javascript
   // In browser console
   console.log(window.dataLayer);
   ```

3. **Verify event names** match exactly (case-sensitive):
   - `page_view` ✅
   - `PageView` ❌ (wrong case)

4. **Check GTM Preview Mode** to see if triggers are firing

5. **Verify Meta Pixel Base tag** is firing on all pages

---

## Summary

Your application sends these events to GTM:
- ✅ `page_view` - Page views
- ✅ `view_item` - Product views
- ✅ `add_to_cart` - Add to cart
- ✅ `begin_checkout` - Checkout started
- ✅ `purchase` - Order completed
- ✅ `search` - Search queries
- ✅ `virtual_pageview` - SPA navigation

All events include complete product metadata and are deduplicated to prevent spam.

