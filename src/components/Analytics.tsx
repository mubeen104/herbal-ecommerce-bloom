import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, initializeMetaPixel } from '@/utils/analytics';

/**
 * Analytics Component
 * 
 * Loads Google Tag Manager AND Meta Pixel for proper event tracking.
 * Supports both GTM-based and direct Meta Pixel event firing.
 */
export function Analytics() {
  const location = useLocation();

  // Load GTM and Meta Pixel on mount
  useEffect(() => {
    const gtmId = import.meta.env.VITE_GTM_ID;
    const metaPixelId = import.meta.env.VITE_META_PIXEL_ID;
    
    if (!gtmId) {
      console.warn('GTM ID not configured. Set VITE_GTM_ID environment variable.');
    }

    // Initialize GTM if configured
    if (gtmId) {
      // Check if GTM is already loaded
      if (document.querySelector(`script[src*="googletagmanager.com/gtm.js?id=${gtmId}"]`)) {
        console.log('GTM already loaded');
      } else {
        // Initialize dataLayer
        window.dataLayer = window.dataLayer || [];
        
        // Push GTM start event (required for GTM initialization)
        window.dataLayer.push({
          'gtm.start': new Date().getTime(),
          event: 'gtm.js'
        });
        
        // Load GTM script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
        
        script.onload = () => {
          console.log('Google Tag Manager loaded successfully');
        };
        
        script.onerror = () => {
          console.error('Failed to load Google Tag Manager');
        };

        document.head.appendChild(script);

        // Add GTM noscript iframe (only once)
        if (!document.querySelector('noscript[data-gtm-noscript]')) {
          const noscript = document.createElement('noscript');
          noscript.setAttribute('data-gtm-noscript', 'true');
          const iframe = document.createElement('iframe');
          iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
          iframe.height = '0';
          iframe.width = '0';
          iframe.style.display = 'none';
          iframe.style.visibility = 'hidden';
          noscript.appendChild(iframe);
          document.body.insertBefore(noscript, document.body.firstChild);
        }
      }
    }

    // Initialize Meta Pixel if configured (direct implementation)
    if (metaPixelId) {
      initializeMetaPixel(metaPixelId);
    } else {
      console.warn('Meta Pixel ID not configured. Set VITE_META_PIXEL_ID environment variable for direct pixel tracking.');
    }
  }, []);

  // Track page views on route change
  useEffect(() => {
    const path = location.pathname + location.search;
    trackPageView(path);
  }, [location]);

  return null;
}
