# Google Tag Manager (GTM) Setup Guide
## Step-by-Step Event Configuration for E-commerce Tracking

This guide will help you set up all tracking events in GTM, including Meta Pixel integration.

---

## Prerequisites

1. **GTM Container ID**: Your GTM container ID (format: `GTM-XXXXXXX`)
2. **Meta Pixel ID**: Your Facebook Pixel ID (format: `123456789012345`)
3. **Access to GTM**: Admin access to your GTM container

---

## Part 1: Initial GTM Setup

### Step 1: Get Your GTM Container ID

1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Select your container (or create a new one)
3. Copy your Container ID (shown at the top, format: `GTM-XXXXXXX`)
4. Add it to your `.env` file:
   ```env
   VITE_GTM_ID=GTM-XXXXXXX
   ```

### Step 2: Verify GTM is Loading

1. Open your website
2. Open browser DevTools (F12)
3. Go to Console tab
4. Type: `window.dataLayer`
5. You should see an array with events
6. Check Network tab for `gtm.js` request

---

## Part 2: Meta Pixel Setup in GTM

### Step 3: Create Meta Pixel Base Tag

1. In GTM, go to **Tags** → Click **New**
2. Name it: `Meta Pixel - Base`
3. Click **Tag Configuration** → Choose **Custom HTML**
4. Paste this code (replace `YOUR_PIXEL_ID` with your actual Pixel ID):

```html
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>
<noscript>
<img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"/>
</noscript>
```

5. **Triggering**: Choose **All Pages**
6. Click **Save**

---

## Part 3: Event-Specific Tags Setup

### Step 4: Create Page View Tag (Meta Pixel)

1. **Tags** → **New** → Name: `Meta Pixel - PageView`
2. **Tag Configuration** → **Custom HTML**
3. Paste:
```html
<script>
fbq('track', 'PageView');
</script>
```
4. **Triggering** → **New Trigger**
   - Name: `Page View`
   - Type: **Custom Event**
   - Event name: `page_view`
   - Click **Save**
5. Attach trigger to tag → **Save**

---

### Step 5: Create View Content Tag (Product View)

1. **Tags** → **New** → Name: `Meta Pixel - ViewContent`
2. **Tag Configuration** → **Custom HTML**
3. Paste:
```html
<script>
var eventData = {
  content_ids: [{{DL - Product ID}}],
  content_type: 'product',
  content_name: {{DL - Product Name}},
  value: {{DL - Product Value}},
  currency: {{DL - Currency}}
};
fbq('track', 'ViewContent', eventData);
</script>
```

4. **Triggering** → **New Trigger**
   - Name: `View Item`
   - Type: **Custom Event**
   - Event name: `view_item`
   - Click **Save**

5. **Variables** (create these first - see Part 4):
   - `{{DL - Product ID}}` - Data Layer Variable: `items.0.item_id`
   - `{{DL - Product Name}}` - Data Layer Variable: `items.0.item_name`
   - `{{DL - Product Value}}` - Data Layer Variable: `value`
   - `{{DL - Currency}}` - Data Layer Variable: `currency`

6. Attach trigger → **Save**

---

### Step 6: Create Add to Cart Tag

1. **Tags** → **New** → Name: `Meta Pixel - AddToCart`
2. **Tag Configuration** → **Custom HTML**
3. Paste:
```html
<script>
var eventData = {
  content_ids: [{{DL - Product ID}}],
  content_type: 'product',
  content_name: {{DL - Product Name}},
  value: {{DL - Product Value}},
  currency: {{DL - Currency}},
  quantity: {{DL - Quantity}}
};
fbq('track', 'AddToCart', eventData);
</script>
```

4. **Triggering** → **New Trigger**
   - Name: `Add to Cart`
   - Type: **Custom Event**
   - Event name: `add_to_cart`
   - Click **Save**

5. **Variables**:
   - `{{DL - Product ID}}` - Data Layer Variable: `items.0.item_id`
   - `{{DL - Product Name}}` - Data Layer Variable: `items.0.item_name`
   - `{{DL - Product Value}}` - Data Layer Variable: `value`
   - `{{DL - Currency}}` - Data Layer Variable: `currency`
   - `{{DL - Quantity}}` - Data Layer Variable: `items.0.quantity`

6. Attach trigger → **Save**

---

### Step 7: Create Initiate Checkout Tag

1. **Tags** → **New** → Name: `Meta Pixel - InitiateCheckout`
2. **Tag Configuration** → **Custom HTML**
3. Paste:
```html
<script>
var eventData = {
  content_type: 'product',
  value: {{DL - Checkout Value}},
  currency: {{DL - Currency}},
  num_items: {{DL - Item Count}}
};
fbq('track', 'InitiateCheckout', eventData);
</script>
```

4. **Triggering** → **New Trigger**
   - Name: `Begin Checkout`
   - Type: **Custom Event**
   - Event name: `begin_checkout`
   - Click **Save**

5. **Variables**:
   - `{{DL - Checkout Value}}` - Data Layer Variable: `value`
   - `{{DL - Currency}}` - Data Layer Variable: `currency`
   - `{{DL - Item Count}}` - Data Layer Variable: `items.length` (or create custom JavaScript variable)

6. Attach trigger → **Save**

---

### Step 8: Create Purchase Tag

1. **Tags** → **New** → Name: `Meta Pixel - Purchase`
2. **Tag Configuration** → **Custom HTML**
3. Paste:
```html
<script>
var contentIds = [];
var items = {{DL - Items Array}};
if (items && items.length > 0) {
  for (var i = 0; i < items.length; i++) {
    if (items[i].item_id) {
      contentIds.push(items[i].item_id);
    }
  }
}

// Set currency globally (Meta Pixel doesn't accept currency in Purchase event data)
var currency = {{DL - Currency}} || 'PKR';
fbq('set', 'currency', currency);

var eventData = {
  content_type: 'product',
  value: {{DL - Purchase Value}},
  content_ids: contentIds,
  num_items: items.length
};
fbq('track', 'Purchase', eventData);
</script>
```

4. **Triggering** → **New Trigger**
   - Name: `Purchase`
   - Type: **Custom Event**
   - Event name: `purchase`
   - Click **Save**

5. **Variables**:
   - `{{DL - Purchase Value}}` - Data Layer Variable: `value`
   - `{{DL - Currency}}` - Data Layer Variable: `currency`
   - `{{DL - Items Array}}` - Data Layer Variable: `items`

6. Attach trigger → **Save**

---

### Step 9: Create Search Tag

1. **Tags** → **New** → Name: `Meta Pixel - Search`
2. **Tag Configuration** → **Custom HTML**
3. Paste:
```html
<script>
var eventData = {
  search_string: {{DL - Search Term}}
};
fbq('track', 'Search', eventData);
</script>
```

4. **Triggering** → **New Trigger**
   - Name: `Search`
   - Type: **Custom Event**
   - Event name: `search`
   - Click **Save**

5. **Variables**:
   - `{{DL - Search Term}}` - Data Layer Variable: `search_term`

6. Attach trigger → **Save**

---

## Part 4: Create Data Layer Variables

### Step 10: Create Required Variables

Go to **Variables** → **User-Defined Variables** → Click **New**

Create these variables:

#### Variable 1: Product ID
- **Name**: `DL - Product ID`
- **Type**: Data Layer Variable
- **Data Layer Variable Name**: `items.0.item_id`
- **Data Layer Version**: Version 2
- Click **Save**

#### Variable 2: Product Name
- **Name**: `DL - Product Name`
- **Type**: Data Layer Variable
- **Data Layer Variable Name**: `items.0.item_name`
- **Data Layer Version**: Version 2
- Click **Save**

#### Variable 3: Product Value
- **Name**: `DL - Product Value`
- **Type**: Data Layer Variable
- **Data Layer Variable Name**: `value`
- **Data Layer Version**: Version 2
- Click **Save**

#### Variable 4: Currency
- **Name**: `DL - Currency`
- **Type**: Data Layer Variable
- **Data Layer Variable Name**: `currency`
- **Data Layer Version**: Version 2
- Click **Save**

#### Variable 5: Quantity
- **Name**: `DL - Quantity`
- **Type**: Data Layer Variable
- **Data Layer Variable Name**: `items.0.quantity`
- **Data Layer Version**: Version 2
- Click **Save**

#### Variable 6: Items Array
- **Name**: `DL - Items Array`
- **Type**: Data Layer Variable
- **Data Layer Variable Name**: `items`
- **Data Layer Version**: Version 2
- Click **Save**

#### Variable 7: Search Term
- **Name**: `DL - Search Term`
- **Type**: Data Layer Variable
- **Data Layer Variable Name**: `search_term`
- **Data Layer Version**: Version 2
- Click **Save**

#### Variable 8: Item Count (JavaScript)
- **Name**: `DL - Item Count`
- **Type**: Custom JavaScript
- Paste:
```javascript
function() {
  var items = {{DL - Items Array}};
  return items ? items.length : 0;
}
```
- Click **Save**

---

## Part 5: Testing Your Setup

### Step 11: Use GTM Preview Mode

1. In GTM, click **Preview** button (top right)
2. Enter your website URL
3. Click **Connect**
4. A new window opens with GTM Debug Console

### Step 12: Test Each Event

#### Test Page View:
1. Navigate to any page
2. In GTM Debug Console, check **Tags Fired**
3. You should see: `Meta Pixel - Base` and `Meta Pixel - PageView`

#### Test View Content:
1. Click on a product
2. Check Debug Console
3. You should see: `Meta Pixel - ViewContent` fired
4. Check **Data Layer** tab to verify data

#### Test Add to Cart:
1. Add a product to cart
2. Check Debug Console
3. You should see: `Meta Pixel - AddToCart` fired

#### Test Begin Checkout:
1. Go to checkout page
2. Check Debug Console
3. You should see: `Meta Pixel - InitiateCheckout` fired

#### Test Purchase:
1. Complete a test purchase
2. Check Debug Console
3. You should see: `Meta Pixel - Purchase` fired

#### Test Search:
1. Perform a search
2. Check Debug Console
3. You should see: `Meta Pixel - Search` fired

### Step 13: Verify in Meta Events Manager

1. Go to [Meta Events Manager](https://business.facebook.com/events_manager2)
2. Select your Pixel
3. Go to **Test Events** tab
4. You should see events appearing in real-time as you test

---

## Part 6: Publish Your Container

### Step 14: Submit and Publish

1. In GTM, click **Submit** button (top right)
2. Add version name: `Initial Meta Pixel Setup`
3. Add description: `Set up all e-commerce events for Meta Pixel tracking`
4. Click **Publish**
5. Your tags are now live!

---

## Quick Reference: Event Mapping

| GTM Event Name | Meta Pixel Event | Trigger Name |
|----------------|------------------|--------------|
| `page_view` | `PageView` | Page View |
| `view_item` | `ViewContent` | View Item |
| `add_to_cart` | `AddToCart` | Add to Cart |
| `begin_checkout` | `InitiateCheckout` | Begin Checkout |
| `purchase` | `Purchase` | Purchase |
| `search` | `Search` | Search |

---

## Troubleshooting

### Events Not Firing?

1. **Check GTM Container ID**: Verify it's correct in `.env` file
2. **Check Data Layer**: Open browser console, type `window.dataLayer` to see events
3. **Check GTM Preview**: Use Preview mode to debug
4. **Check Meta Pixel ID**: Verify it's correct in Base tag
5. **Check Triggers**: Ensure triggers match event names exactly

### Data Not Appearing in Meta?

1. **Wait 10-15 minutes**: Events can take time to appear
2. **Check Test Events**: Use Meta Events Manager Test Events tab
3. **Verify Pixel ID**: Ensure it matches your Meta Pixel ID
4. **Check Browser Console**: Look for errors

### Common Issues:

- **Event name mismatch**: GTM event names must match exactly (case-sensitive)
- **Missing variables**: Ensure all Data Layer variables are created
- **Trigger not firing**: Check trigger conditions
- **Pixel not initialized**: Ensure Base tag fires on All Pages

---

## Additional Resources

- [GTM Documentation](https://support.google.com/tagmanager)
- [Meta Pixel Documentation](https://developers.facebook.com/docs/meta-pixel)
- [GTM Community](https://support.google.com/tagmanager/community)

---

## Summary Checklist

- [ ] GTM Container ID added to `.env`
- [ ] Meta Pixel Base tag created and published
- [ ] All 6 event tags created (PageView, ViewContent, AddToCart, InitiateCheckout, Purchase, Search)
- [ ] All triggers created and attached
- [ ] All Data Layer variables created
- [ ] Tested in GTM Preview mode
- [ ] Verified events in Meta Events Manager
- [ ] Container published

---

**Need Help?** Check the troubleshooting section or verify your dataLayer events in browser console using `window.dataLayer`.

