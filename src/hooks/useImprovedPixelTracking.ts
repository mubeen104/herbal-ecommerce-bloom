import { useCallback, useRef } from 'react';
import { useEnabledPixels } from './useAdvertisingPixels';
import { trackPixelEvent } from './usePixelPerformance';
import { PixelManager } from '@/services/PixelManager';
import {
  standardizeProductId,
  normalizeCurrency,
  validateEventData
} from '@/utils/pixelUtils';

interface EventDeduplication {
  eventKey: string;
  timestamp: number;
}

export const useImprovedPixelTracking = () => {
  const { data: enabledPixels } = useEnabledPixels();
  const eventHistory = useRef<Map<string, number>>(new Map());
  const DEDUPLICATION_WINDOW = 5000;

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('pixel_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('pixel_session_id', sessionId);
    }
    return sessionId;
  };

  const isDuplicateEvent = (eventKey: string): boolean => {
    const lastTime = eventHistory.current.get(eventKey);
    const now = Date.now();

    if (lastTime && now - lastTime < DEDUPLICATION_WINDOW) {
      return true;
    }

    eventHistory.current.set(eventKey, now);

    const cleanupThreshold = now - DEDUPLICATION_WINDOW * 2;
    for (const [key, timestamp] of eventHistory.current.entries()) {
      if (timestamp < cleanupThreshold) {
        eventHistory.current.delete(key);
      }
    }

    return false;
  };

  const trackViewContent = useCallback((productData: {
    product_id?: string;
    id?: string;
    sku?: string;
    name: string;
    price: number;
    currency: string;
    category?: string;
    brand?: string;
    availability?: string;
    imageUrl?: string;
  }) => {
    const productId = standardizeProductId(productData);
    const currency = normalizeCurrency(productData.currency);

    const eventKey = `view_content_${productId}`;
    if (isDuplicateEvent(eventKey)) {
      console.debug('Skipping duplicate ViewContent event for:', productId);
      return;
    }

    const data = {
      content_ids: [productId],
      content_name: productData.name,
      content_type: 'product',
      content_category: productData.category,
      currency,
      value: productData.price,
      item_id: productId,
      item_name: productData.name,
      item_brand: productData.brand,
      price: productData.price,
      availability: productData.availability,
      image_link: productData.imageUrl
    };

    if (!validateEventData(data)) {
      console.error('Invalid event data for ViewContent:', data);
      return;
    }

    PixelManager.queueEvent(() => {
      if (window.gtag && PixelManager.isPixelLoaded('google_ads')) {
        window.gtag('event', 'view_item', {
          currency: data.currency,
          value: data.value,
          items: [{
            item_id: data.item_id,
            item_name: data.item_name,
            item_brand: data.item_brand,
            item_category: data.content_category,
            price: data.price
          }]
        });
      }

      if (window.fbq && PixelManager.isPixelLoaded('meta_pixel')) {
        window.fbq('track', 'ViewContent', {
          content_ids: data.content_ids,
          content_name: data.content_name,
          content_type: data.content_type,
          content_category: data.content_category,
          currency: data.currency,
          value: data.value
        });
      }

      if (window.ttq && PixelManager.isPixelLoaded('tiktok_pixel')) {
        window.ttq.track('ViewContent', {
          content_id: productId,
          content_name: productData.name,
          content_category: productData.category,
          price: productData.price,
          currency: data.currency,
          value: productData.price
        });
      }

      if (window.twq) window.twq('track', 'ViewContent', data);
      if (window.pintrk) window.pintrk('track', 'pagevisit', data);
      if (window.snaptr) window.snaptr('track', 'VIEW_CONTENT', data);
      if (window.uetq) window.uetq.push('event', 'view_item', data);
      if (window.rdt) window.rdt('track', 'ViewContent', data);
      if (window.qp) window.qp('track', 'ViewContent', data);

      console.info('👁️ Product view tracked:', productData.name);
    });

    enabledPixels?.forEach(pixel => {
      trackPixelEvent({
        pixelId: pixel.id,
        eventType: 'view_content',
        eventValue: productData.price,
        currency,
        productId,
        sessionId: getSessionId(),
        metadata: {
          product_name: productData.name,
          category: productData.category,
          brand: productData.brand
        }
      }).catch(console.error);
    });
  }, [enabledPixels]);

  const trackAddToCart = useCallback((productData: {
    product_id?: string;
    id?: string;
    sku?: string;
    name: string;
    price: number;
    currency: string;
    quantity: number;
    category?: string;
    brand?: string;
  }) => {
    const productId = standardizeProductId(productData);
    const currency = normalizeCurrency(productData.currency);
    const totalValue = productData.price * productData.quantity;

    const eventKey = `add_to_cart_${productId}_${productData.quantity}_${Date.now()}`;
    if (isDuplicateEvent(eventKey)) {
      console.debug('Skipping duplicate AddToCart event for:', productId);
      return;
    }

    const data = {
      content_ids: [productId],
      content_name: productData.name,
      content_type: 'product',
      currency,
      value: totalValue,
      contents: [{
        id: productId,
        quantity: productData.quantity,
        item_price: productData.price
      }]
    };

    if (!validateEventData(data)) {
      console.error('Invalid event data for AddToCart:', data);
      return;
    }

    PixelManager.queueEvent(() => {
      if (window.gtag && PixelManager.isPixelLoaded('google_ads')) {
        window.gtag('event', 'add_to_cart', {
          currency,
          value: totalValue,
          items: [{
            item_id: productId,
            item_name: productData.name,
            item_brand: productData.brand,
            item_category: productData.category,
            price: productData.price,
            quantity: productData.quantity
          }]
        });
      }

      if (window.fbq && PixelManager.isPixelLoaded('meta_pixel')) {
        window.fbq('track', 'AddToCart', data);
      }

      if (window.ttq && PixelManager.isPixelLoaded('tiktok_pixel')) {
        window.ttq.track('AddToCart', {
          content_id: productId,
          content_name: productData.name,
          price: productData.price,
          quantity: productData.quantity,
          currency,
          value: totalValue
        });
      }

      if (window.twq) window.twq('track', 'AddToCart', { value: totalValue, currency });
      if (window.pintrk) window.pintrk('track', 'addtocart', { value: totalValue, currency, product_id: productId });
      if (window.snaptr) window.snaptr('track', 'ADD_CART', { item_ids: [productId], price: totalValue, currency });
      if (window.uetq) window.uetq.push('event', 'add_to_cart', { ecomm_prodid: productId, ecomm_totalvalue: totalValue });
      if (window.rdt) window.rdt('track', 'AddToCart', { itemCount: productData.quantity, value: totalValue, currency });
      if (window.qp) window.qp('track', 'AddToCart', { value: totalValue, currency });

      console.info('🛒 Add to cart tracked:', productData.name, 'x', productData.quantity);
    });

    enabledPixels?.forEach(pixel => {
      trackPixelEvent({
        pixelId: pixel.id,
        eventType: 'add_to_cart',
        eventValue: totalValue,
        currency,
        productId,
        sessionId: getSessionId(),
        metadata: {
          product_name: productData.name,
          quantity: productData.quantity,
          category: productData.category,
          brand: productData.brand
        }
      }).catch(console.error);
    });
  }, [enabledPixels]);

  const trackInitiateCheckout = useCallback((checkoutData: {
    value: number;
    currency: string;
    items: Array<{
      product_id?: string;
      id?: string;
      sku?: string;
      product_name?: string;
      name?: string;
      price: number;
      quantity: number;
      category?: string;
      brand?: string;
    }>;
  }) => {
    const currency = normalizeCurrency(checkoutData.currency);

    const eventKey = `initiate_checkout_${checkoutData.value}_${Date.now()}`;
    if (isDuplicateEvent(eventKey)) {
      console.debug('Skipping duplicate InitiateCheckout event');
      return;
    }

    const data = {
      currency,
      value: checkoutData.value,
      content_ids: checkoutData.items.map(i => standardizeProductId(i)),
      num_items: checkoutData.items.length,
      contents: checkoutData.items.map(i => ({
        id: standardizeProductId(i),
        quantity: i.quantity,
        item_price: i.price
      }))
    };

    if (!validateEventData(data)) {
      console.error('Invalid event data for InitiateCheckout:', data);
      return;
    }

    PixelManager.queueEvent(() => {
      if (window.gtag && PixelManager.isPixelLoaded('google_ads')) {
        window.gtag('event', 'begin_checkout', {
          currency,
          value: checkoutData.value,
          items: checkoutData.items.map(item => ({
            item_id: standardizeProductId(item),
            item_name: item.product_name || item.name,
            item_brand: item.brand,
            item_category: item.category,
            price: item.price,
            quantity: item.quantity
          }))
        });
      }

      if (window.fbq && PixelManager.isPixelLoaded('meta_pixel')) {
        window.fbq('track', 'InitiateCheckout', data);
      }

      if (window.ttq && PixelManager.isPixelLoaded('tiktok_pixel')) {
        window.ttq.track('InitiateCheckout', {
          contents: checkoutData.items.map(i => ({
            content_id: standardizeProductId(i),
            content_name: i.product_name || i.name,
            price: i.price,
            quantity: i.quantity
          })),
          currency,
          value: checkoutData.value
        });
      }

      if (window.twq) window.twq('track', 'InitiateCheckout', { value: checkoutData.value, currency });
      if (window.pintrk) window.pintrk('track', 'checkout', { value: checkoutData.value, currency, order_quantity: checkoutData.items.length });
      if (window.snaptr) window.snaptr('track', 'START_CHECKOUT', { price: checkoutData.value, currency });
      if (window.uetq) window.uetq.push('event', 'begin_checkout', { ecomm_totalvalue: checkoutData.value });
      if (window.rdt) window.rdt('track', 'InitiateCheckout', { value: checkoutData.value, currency });
      if (window.qp) window.qp('track', 'InitiateCheckout', { value: checkoutData.value, currency });

      console.info('💳 Checkout initiated:', checkoutData.value, currency);
    });

    enabledPixels?.forEach(pixel => {
      trackPixelEvent({
        pixelId: pixel.id,
        eventType: 'initiate_checkout',
        eventValue: checkoutData.value,
        currency,
        sessionId: getSessionId(),
        metadata: { items: checkoutData.items, num_items: checkoutData.items.length }
      }).catch(console.error);
    });
  }, [enabledPixels]);

  const trackPurchase = useCallback((orderData: {
    order_id?: string;
    orderId?: string;
    value: number;
    currency: string;
    items: Array<{
      product_id?: string;
      id?: string;
      sku?: string;
      product_name?: string;
      name?: string;
      price: number;
      quantity: number;
      category?: string;
      brand?: string;
    }>;
    shipping?: number;
    tax?: number;
    coupon?: string;
  }) => {
    const orderId = orderData.order_id || orderData.orderId || '';
    const currency = normalizeCurrency(orderData.currency);

    const eventKey = `purchase_${orderId}`;
    if (isDuplicateEvent(eventKey)) {
      console.warn('Skipping duplicate Purchase event for order:', orderId);
      return;
    }

    const data = {
      transaction_id: orderId,
      currency,
      value: orderData.value,
      shipping: orderData.shipping || 0,
      tax: orderData.tax || 0,
      content_ids: orderData.items.map(i => standardizeProductId(i)),
      contents: orderData.items.map(i => ({
        id: standardizeProductId(i),
        quantity: i.quantity,
        item_price: i.price
      }))
    };

    if (!validateEventData(data)) {
      console.error('Invalid event data for Purchase:', data);
      return;
    }

    PixelManager.queueEvent(() => {
      if (window.gtag && PixelManager.isPixelLoaded('google_ads')) {
        window.gtag('event', 'purchase', {
          transaction_id: orderId,
          currency,
          value: orderData.value,
          shipping: orderData.shipping || 0,
          tax: orderData.tax || 0,
          coupon: orderData.coupon,
          items: orderData.items.map(item => ({
            item_id: standardizeProductId(item),
            item_name: item.product_name || item.name,
            item_brand: item.brand,
            item_category: item.category,
            price: item.price,
            quantity: item.quantity
          }))
        });
      }

      if (window.fbq && PixelManager.isPixelLoaded('meta_pixel')) {
        window.fbq('track', 'Purchase', data);
      }

      if (window.ttq && PixelManager.isPixelLoaded('tiktok_pixel')) {
        window.ttq.track('PlaceAnOrder', {
          contents: orderData.items.map(i => ({
            content_id: standardizeProductId(i),
            content_name: i.product_name || i.name,
            price: i.price,
            quantity: i.quantity
          })),
          currency,
          value: orderData.value
        });
      }

      if (window.twq) window.twq('track', 'Purchase', { value: orderData.value, currency, conversion_id: orderId });
      if (window.pintrk) window.pintrk('track', 'checkout', { value: orderData.value, currency, order_id: orderId });
      if (window.snaptr) window.snaptr('track', 'PURCHASE', { transaction_id: orderId, price: orderData.value, currency });
      if (window.uetq) window.uetq.push('event', 'purchase', { revenue_value: orderData.value, currency });
      if (window.rdt) window.rdt('track', 'Purchase', { transactionId: orderId, value: orderData.value, currency });
      if (window.qp) window.qp('track', 'Purchase', { value: orderData.value, currency });

      console.info('💰 Purchase tracked:', orderId, orderData.value, currency);
    });

    enabledPixels?.forEach(pixel => {
      trackPixelEvent({
        pixelId: pixel.id,
        eventType: 'purchase',
        eventValue: orderData.value,
        currency,
        orderId,
        sessionId: getSessionId(),
        metadata: {
          items: orderData.items,
          shipping: orderData.shipping,
          tax: orderData.tax,
          coupon: orderData.coupon,
          num_items: orderData.items.length
        }
      }).catch(console.error);
    });
  }, [enabledPixels]);

  const trackSearch = useCallback((searchTerm: string, resultsCount?: number) => {
    const eventKey = `search_${searchTerm}`;
    if (isDuplicateEvent(eventKey)) {
      console.debug('Skipping duplicate Search event for:', searchTerm);
      return;
    }

    const data = {
      search_term: searchTerm,
      content_type: 'product',
      number_of_results: resultsCount
    };

    PixelManager.queueEvent(() => {
      if (window.gtag) window.gtag('event', 'search', { search_term: searchTerm });
      if (window.fbq) window.fbq('track', 'Search', { search_string: searchTerm });
      if (window.ttq) window.ttq.track('Search', { query: searchTerm });
      if (window.pintrk) window.pintrk('track', 'search', { search_query: searchTerm });
      if (window.rdt) window.rdt('track', 'Search');

      console.info('🔍 Search tracked:', searchTerm);
    });

    enabledPixels?.forEach(pixel => {
      trackPixelEvent({
        pixelId: pixel.id,
        eventType: 'search',
        sessionId: getSessionId(),
        metadata: { search_term: searchTerm, results_count: resultsCount }
      }).catch(console.error);
    });
  }, [enabledPixels]);

  return {
    trackViewContent,
    trackAddToCart,
    trackInitiateCheckout,
    trackPurchase,
    trackSearch
  };
};

export default useImprovedPixelTracking;
