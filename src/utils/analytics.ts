/**
 * Analytics Tracking using Google Tag Manager AND Meta Pixel
 * 
 * Fires events to both GTM (for tag-based tracking) and directly to Meta Pixel.
 * Ensures reliable event tracking across both platforms.
 */

declare global {
  interface Window {
    dataLayer: any[];
    fbq?: (action: string, event: string, data?: Record<string, any>) => void;
  }
}

// Initialize dataLayer
if (typeof window !== 'undefined') {
  window.dataLayer = window.dataLayer || [];
}

/**
 * Convert currency to standard 3-letter ISO code
 * Handles common currency symbols and locale-specific formats
 */
export function getCurrencyCode(currency: string): string {
  if (!currency) return 'PKR'; // Default fallback
  
  const normalized = currency.trim();
  
  const currencyMap: Record<string, string> = {
    // Pakistani Rupee variants
    'PKR': 'PKR',
    'Rs': 'PKR',
    'Rs.': 'PKR',
    '₨': 'PKR',
    'Rupees': 'PKR',
    'rupees': 'PKR',
    // US Dollar variants
    'USD': 'USD',
    '$': 'USD',
    'Dollars': 'USD',
    'dollars': 'USD',
    // Other common currencies
    'EUR': 'EUR',
    '€': 'EUR',
    'GBP': 'GBP',
    '£': 'GBP',
  };
  
  return currencyMap[normalized] || normalized.toUpperCase().substring(0, 3);
}

/**
 * Initialize Meta Pixel if ID is provided
 */
export function initializeMetaPixel(pixelId: string) {
  if (typeof window === 'undefined' || !pixelId) return;
  
  // Check if Meta Pixel is already loaded
  if (window.fbq) {
    console.log('Meta Pixel already initialized');
    return;
  }

  // Initialize fbq function
  (window as any).fbq = function() {
    (window as any).fbq.callMethod
      ? (window as any).fbq.callMethod.apply((window as any).fbq, arguments)
      : (window as any).fbq.queue.push(arguments);
  };
  
  (window as any).fbq.push = (window as any).fbq;
  (window as any).fbq.loaded = true;
  (window as any).fbq.version = '2.0';
  (window as any).fbq.queue = [];

  // Load Meta Pixel script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://connect.facebook.net/en_US/fbevents.js`;
  
  script.onload = () => {
    console.log('Meta Pixel script loaded successfully');
    // Initialize the pixel
    if (window.fbq) {
      window.fbq('init', pixelId);
      window.fbq('track', 'PageView');
    }
  };
  
  script.onerror = () => {
    console.error('Failed to load Meta Pixel script');
  };

  document.head.appendChild(script);

  // Add noscript image fallback
  if (!document.querySelector(`noscript[data-meta-pixel="${pixelId}"]`)) {
    const noscript = document.createElement('noscript');
    noscript.setAttribute('data-meta-pixel', pixelId);
    const img = document.createElement('img');
    img.height = 1;
    img.width = 1;
    img.style.display = 'none';
    img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
    noscript.appendChild(img);
    document.body.insertBefore(noscript, document.body.firstChild);
  }
}

/**
 * Push event to GTM dataLayer
 */
function gtmPush(event: string, data?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    ...data,
  });
}

/**
 * Fire event to Meta Pixel directly
 */
function fireMetaPixelEvent(eventName: string, data?: Record<string, any>) {
  if (typeof window === 'undefined' || !window.fbq) {
    return;
  }

  try {
    window.fbq('track', eventName, data || {});
  } catch (error) {
    console.warn('Meta Pixel event failed:', eventName, error);
  }
}

/**
 * Track page view
 */
export function trackPageView(path: string) {
  gtmPush('page_view', {
    page_path: path,
    page_title: document.title,
    page_location: window.location.href,
  });
  
  // Meta Pixel PageView (automatic, but we can ensure it fires)
  fireMetaPixelEvent('PageView');
}

/**
 * Track product view
 */
export function trackViewContent(product: {
  id: string;
  name: string;
  price: number;
  category?: string;
  brand?: string;
  currency?: string;
}) {
  const currencyCode = product.currency ? getCurrencyCode(product.currency) : 'PKR';
  
  const gtmData = {
    currency: currencyCode,
    value: product.price,
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      item_brand: product.brand || 'New Era Herbals',
      price: product.price,
    }],
  };
  
  gtmPush('view_item', gtmData);
  
  // Meta Pixel ViewContent event
  fireMetaPixelEvent('ViewContent', {
    content_id: product.id,
    content_name: product.name,
    content_type: 'product',
    value: product.price,
    currency: currencyCode,
    content_category: product.category || 'Herbal Products',
  });
}

/**
 * Track add to cart
 */
export function trackAddToCart(product: {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  brand?: string;
  currency?: string;
}) {
  const currencyCode = product.currency ? getCurrencyCode(product.currency) : 'PKR';
  const value = product.price * product.quantity;
  
  const gtmData = {
    currency: currencyCode,
    value,
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      item_brand: product.brand || 'New Era Herbals',
      price: product.price,
      quantity: product.quantity,
    }],
  };
  
  gtmPush('add_to_cart', gtmData);
  
  // Meta Pixel AddToCart event
  fireMetaPixelEvent('AddToCart', {
    content_id: product.id,
    content_name: product.name,
    content_type: 'product',
    value: value,
    currency: currencyCode,
    content_category: product.category || 'Herbal Products',
    quantity: product.quantity,
  });
}

/**
 * Track begin checkout
 */
export function trackBeginCheckout(
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
    brand?: string;
  }>,
  total: number,
  currency?: string,
  tax?: number,
  shipping?: number
) {
  const currencyCode = currency ? getCurrencyCode(currency) : 'PKR';
  
  const gtmData = {
    currency: currencyCode,
    value: total,
    tax: tax || 0,
    shipping: shipping || 0,
    items: items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      item_brand: item.brand || 'New Era Herbals',
      price: item.price,
      quantity: item.quantity,
    })),
  };
  
  gtmPush('begin_checkout', gtmData);
  
  // Meta Pixel InitiateCheckout event
  fireMetaPixelEvent('InitiateCheckout', {
    content_type: 'product',
    currency: currencyCode,
    value: total,
    num_items: items.length,
  });
}

/**
 * Track purchase
 */
export function trackPurchase(
  orderId: string,
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
    brand?: string;
  }>,
  total: number,
  currency?: string,
  tax?: number,
  shipping?: number
) {
  const currencyCode = currency ? getCurrencyCode(currency) : 'PKR';
  
  const gtmData = {
    transaction_id: orderId,
    currency: currencyCode,
    value: total,
    tax: tax || 0,
    shipping: shipping || 0,
    items: items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      item_brand: item.brand || 'New Era Herbals',
      price: item.price,
      quantity: item.quantity,
    })),
  };
  
  gtmPush('purchase', gtmData);
  
  // Meta Pixel Purchase event (standard conversion event)
  fireMetaPixelEvent('Purchase', {
    content_type: 'product',
    currency: currencyCode,
    value: total,
    content_id: items.map(i => i.id).join(','),
    num_items: items.length,
  });
}

/**
 * Track search
 */
export function trackSearch(searchTerm: string) {
  gtmPush('search', {
    search_term: searchTerm,
  });
  
  // Meta Pixel Search event
  fireMetaPixelEvent('Search', {
    search_string: searchTerm,
  });
}

/**
 * Track custom event
 */
export function trackCustomEvent(eventName: string, data?: Record<string, any>) {
  gtmPush(eventName, data);
  
  // Meta Pixel custom event
  fireMetaPixelEvent(eventName, data);
}
