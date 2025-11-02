import { createEnhancedMatchingParams } from '@/utils/pixelUtils';

export type PixelPlatform =
  | 'google_ads'
  | 'meta_pixel'
  | 'tiktok_pixel'
  | 'linkedin_insight'
  | 'twitter_pixel'
  | 'pinterest_tag'
  | 'snapchat_pixel'
  | 'microsoft_advertising'
  | 'reddit_pixel'
  | 'quora_pixel';

export interface PixelConfig {
  id: string;
  platform: PixelPlatform;
  pixelId: string;
  isEnabled: boolean;
}

export interface PixelLoadStatus {
  platform: PixelPlatform;
  loaded: boolean;
  loading: boolean;
  error: string | null;
  loadTime?: number;
}

export interface UserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  userId?: string;
}

class PixelManagerService {
  private loadedPixels: Map<PixelPlatform, boolean> = new Map();
  private loadingPixels: Map<PixelPlatform, Promise<void>> = new Map();
  private pixelErrors: Map<PixelPlatform, string> = new Map();
  private userData: UserData | null = null;
  private eventQueue: Array<() => void> = [];
  private initialized = false;

  setUserData(userData: UserData | null) {
    this.userData = userData;
  }

  getUserData(): UserData | null {
    return this.userData;
  }

  async loadPixel(
    platform: PixelPlatform,
    pixelId: string,
    retries = 3
  ): Promise<void> {
    if (this.loadedPixels.get(platform)) {
      return Promise.resolve();
    }

    if (this.loadingPixels.has(platform)) {
      return this.loadingPixels.get(platform)!;
    }

    const loadPromise = this.attemptPixelLoad(platform, pixelId, retries);
    this.loadingPixels.set(platform, loadPromise);

    try {
      await loadPromise;
      this.loadedPixels.set(platform, true);
      this.pixelErrors.delete(platform);
      console.info(`✅ ${platform} pixel loaded successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.pixelErrors.set(platform, errorMessage);
      console.error(`❌ ${platform} pixel failed to load:`, errorMessage);
      throw error;
    } finally {
      this.loadingPixels.delete(platform);
    }
  }

  private async attemptPixelLoad(
    platform: PixelPlatform,
    pixelId: string,
    retries: number
  ): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.loadPixelScript(platform, pixelId);
        return;
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  private loadPixelScript(platform: PixelPlatform, pixelId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        switch (platform) {
          case 'google_ads':
            this.loadGoogleAds(pixelId, resolve, reject);
            break;
          case 'meta_pixel':
            this.loadMetaPixel(pixelId, resolve, reject);
            break;
          case 'tiktok_pixel':
            this.loadTikTok(pixelId, resolve, reject);
            break;
          case 'linkedin_insight':
            this.loadLinkedIn(pixelId, resolve, reject);
            break;
          case 'twitter_pixel':
            this.loadTwitter(pixelId, resolve, reject);
            break;
          case 'pinterest_tag':
            this.loadPinterest(pixelId, resolve, reject);
            break;
          case 'snapchat_pixel':
            this.loadSnapchat(pixelId, resolve, reject);
            break;
          case 'microsoft_advertising':
            this.loadMicrosoft(pixelId, resolve, reject);
            break;
          case 'reddit_pixel':
            this.loadReddit(pixelId, resolve, reject);
            break;
          case 'quora_pixel':
            this.loadQuora(pixelId, resolve, reject);
            break;
          default:
            reject(new Error(`Unknown platform: ${platform}`));
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  private loadGoogleAds(pixelId: string, onSuccess: () => void, onError: (error: Error) => void) {
    if (window._gtag_loaded) {
      onSuccess();
      return;
    }

    window.dataLayer = window.dataLayer || [];

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${pixelId}`;

    script.onload = () => {
      window.gtag = function() {
        window.dataLayer!.push(arguments);
      };

      window.gtag('js', new Date());
      window.gtag('config', pixelId, {
        page_title: document.title,
        page_location: window.location.href,
        send_page_view: false
      });

      window._gtag_loaded = true;
      onSuccess();
    };

    script.onerror = () => onError(new Error('Failed to load Google Ads script'));
    document.head.appendChild(script);
  }

  private async loadMetaPixel(pixelId: string, onSuccess: () => void, onError: (error: Error) => void) {
    if (window._fbq_loaded) {
      onSuccess();
      return;
    }

    try {
      const script = document.createElement('script');
      script.textContent = `
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

      setTimeout(async () => {
        if (window.fbq) {
          const advancedMatching = await createEnhancedMatchingParams(this.userData || undefined);

          window.fbq('init', pixelId, advancedMatching);

          const noscript = document.createElement('noscript');
          noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>`;
          document.body.appendChild(noscript);

          window._fbq_loaded = true;
          onSuccess();
        } else {
          onError(new Error('Meta Pixel failed to initialize'));
        }
      }, 1000);
    } catch (error) {
      onError(error as Error);
    }
  }

  private loadTikTok(pixelId: string, onSuccess: () => void, onError: (error: Error) => void) {
    if (window._ttq_loaded) {
      onSuccess();
      return;
    }

    try {
      const script = document.createElement('script');
      script.textContent = `
        !function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
          ttq.load('${pixelId}');
        }(window, document, 'ttq');
      `;
      document.head.appendChild(script);

      setTimeout(() => {
        if (window.ttq) {
          window._ttq_loaded = true;
          onSuccess();
        } else {
          onError(new Error('TikTok Pixel failed to initialize'));
        }
      }, 1500);
    } catch (error) {
      onError(error as Error);
    }
  }

  private loadLinkedIn(pixelId: string, onSuccess: () => void, onError: (error: Error) => void) {
    if (window._linkedin_partner_id) {
      onSuccess();
      return;
    }

    try {
      window._linkedin_partner_id = pixelId;
      window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
      window._linkedin_data_partner_ids.push(pixelId);

      const script = document.createElement('script');
      script.textContent = `
        (function(l) {
          if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
          window.lintrk.q=[]}
          var s = document.getElementsByTagName("script")[0];
          var b = document.createElement("script");
          b.type = "text/javascript";b.async = true;
          b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
          s.parentNode.insertBefore(b, s);
        })(window.lintrk);
      `;
      document.head.appendChild(script);

      setTimeout(() => {
        if (window.lintrk) {
          onSuccess();
        } else {
          onError(new Error('LinkedIn Pixel failed to initialize'));
        }
      }, 1000);
    } catch (error) {
      onError(error as Error);
    }
  }

  private loadTwitter(pixelId: string, onSuccess: () => void, onError: (error: Error) => void) {
    if (window.twq) {
      onSuccess();
      return;
    }

    try {
      const script = document.createElement('script');
      script.textContent = `
        !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
        },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
        a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
        twq('config','${pixelId}');
      `;
      document.head.appendChild(script);

      setTimeout(() => {
        if (window.twq) {
          onSuccess();
        } else {
          onError(new Error('Twitter Pixel failed to initialize'));
        }
      }, 1000);
    } catch (error) {
      onError(error as Error);
    }
  }

  private loadPinterest(pixelId: string, onSuccess: () => void, onError: (error: Error) => void) {
    if (window.pintrk) {
      onSuccess();
      return;
    }

    try {
      const script = document.createElement('script');
      script.textContent = `
        !function(e){if(!window.pintrk){window.pintrk = function () {
        window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
        n=window.pintrk;n.queue=[],n.version="3.0";var
        t=document.createElement("script");t.async=!0,t.src=e;var
        r=document.getElementsByTagName("script")[0];
        r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
        pintrk('load', '${pixelId}');
      `;
      document.head.appendChild(script);

      setTimeout(() => {
        if (window.pintrk) {
          onSuccess();
        } else {
          onError(new Error('Pinterest Pixel failed to initialize'));
        }
      }, 1000);
    } catch (error) {
      onError(error as Error);
    }
  }

  private loadSnapchat(pixelId: string, onSuccess: () => void, onError: (error: Error) => void) {
    if (window.snaptr) {
      onSuccess();
      return;
    }

    try {
      const script = document.createElement('script');
      script.textContent = `
        (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
        {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
        a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
        r.src=n;var u=t.getElementsByTagName(s)[0];
        u.parentNode.insertBefore(r,u);})(window,document,
        'https://sc-static.net/scevent.min.js');
        snaptr('init', '${pixelId}');
      `;
      document.head.appendChild(script);

      setTimeout(() => {
        if (window.snaptr) {
          onSuccess();
        } else {
          onError(new Error('Snapchat Pixel failed to initialize'));
        }
      }, 1000);
    } catch (error) {
      onError(error as Error);
    }
  }

  private loadMicrosoft(pixelId: string, onSuccess: () => void, onError: (error: Error) => void) {
    if (window.uetq && window.uetq.length > 0) {
      onSuccess();
      return;
    }

    try {
      window.uetq = window.uetq || [];
      const script = document.createElement('script');
      script.src = `//bat.bing.com/bat.js`;
      script.async = true;

      script.onload = () => {
        window.uetq!.push('create', { tid: pixelId });
        onSuccess();
      };

      script.onerror = () => onError(new Error('Microsoft Ads script failed to load'));
      document.head.appendChild(script);
    } catch (error) {
      onError(error as Error);
    }
  }

  private loadReddit(pixelId: string, onSuccess: () => void, onError: (error: Error) => void) {
    if (window.rdt) {
      onSuccess();
      return;
    }

    try {
      const script = document.createElement('script');
      script.textContent = `
        !function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);
        rdt('init','${pixelId}', {
          optOut: false,
          useDecimalCurrencyValues: true
        });
      `;
      document.head.appendChild(script);

      setTimeout(() => {
        if (window.rdt) {
          onSuccess();
        } else {
          onError(new Error('Reddit Pixel failed to initialize'));
        }
      }, 1000);
    } catch (error) {
      onError(error as Error);
    }
  }

  private loadQuora(pixelId: string, onSuccess: () => void, onError: (error: Error) => void) {
    if (window.qp) {
      onSuccess();
      return;
    }

    try {
      const script = document.createElement('script');
      script.textContent = `
        !function(q,e,v,n,t,s){if(q.qp) return; n=q.qp=function(){n.qp?n.qp.apply(n,arguments):n.queue.push(arguments);}; n.queue=[];t=document.createElement(e);t.async=!0;t.src=v; s=document.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t,s);}(window, 'script', 'https://a.quora.com/qevents.js');
        qp('init', '${pixelId}');
      `;
      document.head.appendChild(script);

      setTimeout(() => {
        if (window.qp) {
          onSuccess();
        } else {
          onError(new Error('Quora Pixel failed to initialize'));
        }
      }, 1000);
    } catch (error) {
      onError(error as Error);
    }
  }

  isPixelLoaded(platform: PixelPlatform): boolean {
    return this.loadedPixels.get(platform) || false;
  }

  getPixelError(platform: PixelPlatform): string | null {
    return this.pixelErrors.get(platform) || null;
  }

  getAllLoadStatus(): PixelLoadStatus[] {
    const allPlatforms: PixelPlatform[] = [
      'google_ads',
      'meta_pixel',
      'tiktok_pixel',
      'linkedin_insight',
      'twitter_pixel',
      'pinterest_tag',
      'snapchat_pixel',
      'microsoft_advertising',
      'reddit_pixel',
      'quora_pixel'
    ];

    return allPlatforms.map(platform => ({
      platform,
      loaded: this.loadedPixels.get(platform) || false,
      loading: this.loadingPixels.has(platform),
      error: this.pixelErrors.get(platform) || null
    }));
  }

  async waitForPixelsReady(timeout = 10000): Promise<void> {
    const startTime = Date.now();

    while (this.loadingPixels.size > 0) {
      if (Date.now() - startTime > timeout) {
        throw new Error('Timeout waiting for pixels to load');
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  queueEvent(eventFn: () => void) {
    if (this.loadingPixels.size === 0) {
      eventFn();
    } else {
      this.eventQueue.push(eventFn);
    }
  }

  processEventQueue() {
    while (this.eventQueue.length > 0) {
      const eventFn = this.eventQueue.shift();
      if (eventFn) {
        try {
          eventFn();
        } catch (error) {
          console.error('Error processing queued event:', error);
        }
      }
    }
  }
}

export const PixelManager = new PixelManagerService();
