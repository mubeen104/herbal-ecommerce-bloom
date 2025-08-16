import { useEffect } from 'react';
import { useEnabledPixels } from '@/hooks/useAdvertisingPixels';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    ttq?: {
      load: (pixelId: string) => void;
      page: () => void;
      track: (event: string, data?: any) => void;
    };
  }
}

export const PixelTracker = () => {
  const { data: pixels = [] } = useEnabledPixels();

  useEffect(() => {
    pixels.forEach((pixel) => {
      switch (pixel.platform) {
        case 'google_ads':
          loadGoogleAdsPixel(pixel.pixel_id);
          break;
        case 'meta_pixel':
          loadMetaPixel(pixel.pixel_id);
          break;
        case 'tiktok_pixel':
          loadTikTokPixel(pixel.pixel_id);
          break;
      }
    });
  }, [pixels]);

  return null; // This component doesn't render anything
};

const loadGoogleAdsPixel = (pixelId: string) => {
  if (typeof window === 'undefined') return;

  // Load Google Analytics/Ads script if not already loaded
  if (!window.gtag) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${pixelId}`;
    document.head.appendChild(script);

    window.gtag = function() {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', pixelId);
  }
};

const loadMetaPixel = (pixelId: string) => {
  if (typeof window === 'undefined') return;

  // Load Meta Pixel script if not already loaded
  if (!window.fbq) {
    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
    `;
    document.head.appendChild(script);

    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
  }
};

const loadTikTokPixel = (pixelId: string) => {
  if (typeof window === 'undefined') return;

  // Load TikTok Pixel script if not already loaded
  if (!window.ttq) {
    const script = document.createElement('script');
    script.innerHTML = `
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
        ttq.load('${pixelId}');
        ttq.page();
      }(window, document, 'ttq');
    `;
    document.head.appendChild(script);
  }
};

// Export functions for tracking events
export const trackEvent = (eventName: string, data?: any) => {
  if (typeof window === 'undefined') return;

  console.info(`Tracking pixel event: ${eventName}`, data);

  // Google Ads - Convert event names to standard Google events
  if (window.gtag) {
    const googleEventMap: { [key: string]: string } = {
      'AddToCart': 'add_to_cart',
      'Purchase': 'purchase',
      'ViewContent': 'page_view',
      'InitiateCheckout': 'begin_checkout',
      'PageView': 'page_view'
    };
    const googleEvent = googleEventMap[eventName] || eventName.toLowerCase();
    window.gtag('event', googleEvent, data);
  }

  // Meta Pixel - Use standard Facebook events
  if (window.fbq) {
    const metaEventMap: { [key: string]: string } = {
      'PageView': 'PageView',
      'ViewContent': 'ViewContent',
      'AddToCart': 'AddToCart',
      'InitiateCheckout': 'InitiateCheckout',
      'Purchase': 'Purchase'
    };
    const metaEvent = metaEventMap[eventName] || eventName;
    window.fbq('track', metaEvent, data);
  }

  // TikTok Pixel
  if (window.ttq) {
    const tiktokEventMap: { [key: string]: string } = {
      'PageView': 'Browse',
      'ViewContent': 'ViewContent',
      'AddToCart': 'AddToCart',
      'InitiateCheckout': 'InitiateCheckout',
      'Purchase': 'PlaceAnOrder'
    };
    const tiktokEvent = tiktokEventMap[eventName] || eventName;
    window.ttq.track(tiktokEvent, data);
  }
};

// Track page views
export const trackPageView = (pageData?: any) => {
  trackEvent('PageView', {
    page_title: document.title,
    page_location: window.location.href,
    ...pageData
  });
};

// Track add to cart
export const trackAddToCart = (productData: { product_id: string; value: number; currency: string; product_name?: string }) => {
  trackEvent('AddToCart', {
    currency: productData.currency,
    value: productData.value,
    content_ids: [productData.product_id],
    content_name: productData.product_name,
    content_type: 'product'
  });
};

// Track purchase
export const trackPurchase = (orderData: { order_id: string; value: number; currency: string; items?: any[] }) => {
  trackEvent('Purchase', {
    currency: orderData.currency,
    value: orderData.value,
    transaction_id: orderData.order_id,
    content_ids: orderData.items?.map(item => item.product_id) || [],
    contents: orderData.items?.map(item => ({
      id: item.product_id,
      quantity: item.quantity,
      item_price: item.price
    })) || []
  });
};

// Track checkout initiation
export const trackInitiateCheckout = (checkoutData: { value: number; currency: string; items?: any[] }) => {
  trackEvent('InitiateCheckout', {
    currency: checkoutData.currency,
    value: checkoutData.value,
    content_ids: checkoutData.items?.map(item => item.product_id) || [],
    num_items: checkoutData.items?.length || 0
  });
};