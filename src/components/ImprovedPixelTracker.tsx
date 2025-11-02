import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useEnabledPixels } from '@/hooks/useAdvertisingPixels';
import { useCatalogExport } from '@/hooks/useCatalogExport';
import { useAuth } from '@/contexts/AuthContext';
import { PixelManager } from '@/services/PixelManager';

export const ImprovedPixelTracker = () => {
  const { data: pixels = [], isLoading } = useEnabledPixels();
  const { catalogData, isLoading: catalogLoading } = useCatalogExport();
  const { user } = useAuth();
  const location = useLocation();
  const initRef = useRef(false);
  const lastPageView = useRef<string>('');

  useEffect(() => {
    if (user) {
      PixelManager.setUserData({
        email: user.email,
        userId: user.id
      });
    } else {
      PixelManager.setUserData(null);
    }
  }, [user]);

  useEffect(() => {
    if (isLoading || initRef.current) return;

    console.info('🚀 Initializing Pixel Tracking System...');

    window.dataLayer = window.dataLayer || [];

    const loadAllPixels = async () => {
      const loadPromises = pixels.map(async (pixel) => {
        if (pixel.is_enabled) {
          try {
            await PixelManager.loadPixel(pixel.platform, pixel.pixel_id);
          } catch (error) {
            console.error(`Failed to load ${pixel.platform}:`, error);
          }
        }
      });

      await Promise.allSettled(loadPromises);
      PixelManager.processEventQueue();

      console.info('✅ Pixel system initialized');
      initRef.current = true;
    };

    loadAllPixels();
  }, [pixels, isLoading]);

  useEffect(() => {
    if (catalogLoading || !catalogData || catalogData.length === 0 || !initRef.current) return;

    console.info('📦 Syncing product catalog with pixels...', catalogData.length, 'products');

    window.catalogData = catalogData;

    PixelManager.queueEvent(() => {
      pixels.forEach(pixel => {
        if (pixel.is_enabled && PixelManager.isPixelLoaded(pixel.platform)) {
          syncCatalogToPixel(pixel.platform, catalogData);
        }
      });
    });
  }, [catalogData, catalogLoading, pixels]);

  useEffect(() => {
    if (!initRef.current) return;

    const currentPath = `${location.pathname}${location.search}`;
    if (lastPageView.current === currentPath) return;

    lastPageView.current = currentPath;

    const timer = setTimeout(() => {
      PixelManager.queueEvent(() => {
        trackPageView();
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [location]);

  return null;
};

function syncCatalogToPixel(platform: string, catalog: any[]) {
  try {
    const validProducts = catalog
      .filter(p => (p.sku || p.id) && !isNaN(parseFloat(p.price)))
      .slice(0, 100);

    if (validProducts.length === 0) return;

    const catalogEvent = {
      content_type: 'product_group',
      content_ids: validProducts.map(p => String(p.sku || p.id)),
      currency: catalog[0]?.currency || 'PKR',
      value: validProducts.reduce((sum, p) => sum + parseFloat(p.price), 0),
      num_items: validProducts.length
    };

    switch (platform) {
      case 'meta_pixel':
        if (window.fbq) {
          window.fbq('track', 'ViewContent', {
            content_type: 'product_group',
            content_ids: validProducts.map(p => String(p.sku || p.id)),
            contents: validProducts.map(p => ({
              id: String(p.sku || p.id),
              quantity: 1,
              item_price: parseFloat(p.price)
            })),
            num_items: validProducts.length,
            currency: catalog[0]?.currency || 'PKR',
            value: validProducts.reduce((sum, p) => sum + parseFloat(p.price), 0)
          });
          console.info('📦 Meta: Catalog synced -', validProducts.length, 'products');
        }
        break;

      case 'google_ads':
        if (window.gtag) {
          window.gtag('event', 'view_item_list', {
            ...catalogEvent,
            items: validProducts.map((p, i) => ({
              item_id: p.id,
              item_name: p.title,
              item_brand: p.brand,
              item_category: p.category,
              price: p.price,
              index: i
            }))
          });
          console.info('📦 Google: Catalog synced');
        }
        break;

      case 'tiktok_pixel':
        if (window.ttq) {
          window.ttq.track('ViewContent', {
            ...catalogEvent,
            contents: validProducts.map(p => ({
              content_id: p.id,
              content_name: p.title,
              content_category: p.category,
              price: p.price,
              brand: p.brand
            }))
          });
          console.info('📦 TikTok: Catalog synced');
        }
        break;
    }
  } catch (error) {
    console.warn(`Failed to sync catalog with ${platform}:`, error);
  }
}

function trackPageView() {
  const pageData = {
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname,
    page_referrer: document.referrer
  };

  if (window.gtag) {
    window.gtag('event', 'page_view', pageData);
  }

  if (window.fbq) {
    window.fbq('track', 'PageView');
  }

  if (window.ttq) {
    window.ttq.page();
  }

  if (window.twq) {
    window.twq('track', 'PageView');
  }

  if (window.pintrk) {
    window.pintrk('page');
  }

  if (window.snaptr) {
    window.snaptr('track', 'PAGE_VIEW');
  }

  if (window.lintrk) {
    window.lintrk('track', { conversion_id: 'pageview' });
  }

  if (window.uetq) {
    window.uetq.push('event', 'page_view', pageData);
  }

  if (window.rdt) {
    window.rdt('track', 'PageVisit');
  }

  if (window.qp) {
    window.qp('track', 'ViewContent');
  }

  console.info('📄 Page view tracked:', pageData.page_path);
}

export default ImprovedPixelTracker;
