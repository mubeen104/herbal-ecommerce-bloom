import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/utils/analytics';

/**
 * Analytics Component
 * 
 * Loads Google Tag Manager for event tracking.
 * All events are sent to GTM via dataLayer.
 * Meta Pixel tracking is handled by GTM tags (not directly initialized).
 * 
 * Flow:
 * 1. Initialize dataLayer
 * 2. Load GTM script
 * 3. Push events to dataLayer (GTM handles routing to Meta Pixel via tags)
 */
export function Analytics() {
  const location = useLocation();
  const initializedRef = useRef(false); // Prevent double initialization in React Strict Mode

  // Load GTM and Meta Pixel on mount (ONE TIME ONLY)
  useEffect(() => {
    // CRITICAL: Prevent double initialization in React Strict Mode
    if (initializedRef.current) {
      console.log('⏭️ [Analytics] Already initialized, skipping duplicate initialization');
      return;
    }
    initializedRef.current = true;
    
    const gtmId = import.meta.env.VITE_GTM_ID;
    
    // Initialize dataLayer (required for GTM)
    window.dataLayer = window.dataLayer || [];
    
    // Push initial pageview to dataLayer
    window.dataLayer.push({ 
      event: 'pageview', 
      page: location.pathname 
    });
    
    if (!gtmId) {
      console.warn('⚠️  GTM ID not configured. Set VITE_GTM_ID environment variable.');
    }

    // Initialize GTM if configured
    // Meta Pixel will be handled by GTM tags, not directly initialized
    if (gtmId) {
      // Check if GTM is already loaded
      if (document.querySelector(`script[src*="googletagmanager.com/gtm.js?id=${gtmId}"]`)) {
        console.log('📊 GTM already loaded');
      } else {
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
          console.log('✅ Google Tag Manager loaded successfully');
          console.log('ℹ️  Meta Pixel will be handled via GTM tags');
        };
        
        script.onerror = () => {
          console.error('❌ Failed to load Google Tag Manager');
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
    
    // Setup SPA route change detection using MutationObserver (fallback)
    // This ensures pageviews are tracked even if React Router doesn't fire
    setupSPARouteDetection();
  }, []);

  // Track page views on route change
  useEffect(() => {
    const path = location.pathname + location.search;
    trackPageView(path);
  }, [location]);

  return null;
}

/**
 * Setup SPA route change detection using MutationObserver
 * This is a fallback to ensure pageviews are tracked even if React Router doesn't fire
 * Matches the pattern from the provided tracking script
 */
function setupSPARouteDetection() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  
  let lastUrl = location.href;
  
  const observer = new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      
      // Use trackPageView to respect deduplication instead of directly pushing to dataLayer
      // This prevents duplicate pageviews from SPA route detection
      // trackPageView is already imported at the top of this file
      trackPageView(location.pathname + location.search);
      
      console.log('[GTM] PageView (SPA change)', location.pathname);
    }
  });
  
  // Start observing
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
  
  console.log('[GTM] SPA route detection initialized');
}
