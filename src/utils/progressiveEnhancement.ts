/**
 * Progressive Enhancement Utilities
 *
 * These utilities help implement progressive enhancement strategies,
 * ensuring that core functionality works without JavaScript and
 * enhancements are added progressively.
 */

/**
 * Check if JavaScript is available
 * (This will always return true when JS is running, but can be used to conditionally render)
 */
export const hasJavaScript = (): boolean => {
  return true;
};

/**
 * Check if user prefers reduced motion
 *
 * Returns true if user has set prefers-reduced-motion: reduce
 * This should be respected to avoid triggering vestibular disorders
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
};

/**
 * Create a media query listener for reduced motion preference
 */
export const onReducedMotionChange = (callback: (prefersReduced: boolean) => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches);
  };

  mediaQuery.addEventListener('change', handler);

  // Return cleanup function
  return () => {
    mediaQuery.removeEventListener('change', handler);
  };
};

/**
 * Check if user prefers dark color scheme
 */
export const prefersDarkScheme = (): boolean => {
  if (typeof window === 'undefined') return false;

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  return mediaQuery.matches;
};

/**
 * Check if user prefers high contrast
 */
export const prefersHighContrast = (): boolean => {
  if (typeof window === 'undefined') return false;

  const mediaQuery = window.matchMedia('(prefers-contrast: high)');
  return mediaQuery.matches;
};

/**
 * Check if touch is available
 */
export const hasTouchSupport = (): boolean => {
  if (typeof window === 'undefined') return false;

  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
};

/**
 * Check if device has fine pointer (mouse)
 */
export const hasFinePointer = (): boolean => {
  if (typeof window === 'undefined') return true;

  const mediaQuery = window.matchMedia('(pointer: fine)');
  return mediaQuery.matches;
};

/**
 * Check if viewport is mobile-sized
 */
export const isMobileViewport = (breakpoint: number = 768): boolean => {
  if (typeof window === 'undefined') return false;

  return window.innerWidth < breakpoint;
};

/**
 * Create a responsive media query listener
 */
export const onViewportChange = (
  breakpoint: number,
  callback: (isMobile: boolean) => void
): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const handler = () => {
    callback(window.innerWidth < breakpoint);
  };

  window.addEventListener('resize', handler);

  return () => {
    window.removeEventListener('resize', handler);
  };
};

/**
 * Check if Intersection Observer is supported
 */
export const hasIntersectionObserver = (): boolean => {
  if (typeof window === 'undefined') return false;

  return 'IntersectionObserver' in window;
};

/**
 * Check if localStorage is available and functional
 */
export const hasLocalStorage = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const test = '__storage_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Check if CSS feature is supported
 */
export const supportsCSSFeature = (property: string, value: string): boolean => {
  if (typeof window === 'undefined' || !window.CSS || !window.CSS.supports) {
    return false;
  }

  return window.CSS.supports(property, value);
};

/**
 * Detect if screen reader is likely active
 * Note: This is not 100% reliable, use as a hint only
 */
export const isScreenReaderLikely = (): boolean => {
  if (typeof window === 'undefined') return false;

  // Check for common screen reader indicators
  const hasScreenReaderIndicator =
    document.querySelector('[role="application"]') !== null ||
    document.querySelector('[aria-live]') !== null;

  // Check for reduced motion (often enabled with screen readers)
  const reducedMotion = prefersReducedMotion();

  return hasScreenReaderIndicator || reducedMotion;
};

/**
 * Progressive Enhancement Manager
 *
 * Provides a centralized way to manage progressive enhancements
 */
export class ProgressiveEnhancementManager {
  private features: Map<string, boolean> = new Map();

  constructor() {
    this.detectFeatures();
  }

  private detectFeatures(): void {
    this.features.set('javascript', true);
    this.features.set('reducedMotion', prefersReducedMotion());
    this.features.set('touch', hasTouchSupport());
    this.features.set('finePointer', hasFinePointer());
    this.features.set('intersectionObserver', hasIntersectionObserver());
    this.features.set('localStorage', hasLocalStorage());
    this.features.set('darkScheme', prefersDarkScheme());
    this.features.set('highContrast', prefersHighContrast());
  }

  hasFeature(feature: string): boolean {
    return this.features.get(feature) ?? false;
  }

  updateFeature(feature: string, value: boolean): void {
    this.features.set(feature, value);
  }

  getFeatures(): Record<string, boolean> {
    return Object.fromEntries(this.features);
  }

  /**
   * Get recommended configuration based on detected features
   */
  getRecommendedConfig() {
    return {
      useAnimations: !this.hasFeature('reducedMotion'),
      useAutoScroll: !this.hasFeature('reducedMotion'),
      useLargerTargets: this.hasFeature('touch') && !this.hasFeature('finePointer'),
      useInfiniteScroll: this.hasFeature('intersectionObserver') && !this.hasFeature('reducedMotion'),
      useLocalStorage: this.hasFeature('localStorage'),
      preferSimpleUI: this.hasFeature('reducedMotion') || this.hasFeature('highContrast')
    };
  }
}

/**
 * Create a singleton instance
 */
export const enhancementManager = typeof window !== 'undefined'
  ? new ProgressiveEnhancementManager()
  : null;

/**
 * React Hook for using progressive enhancement
 */
export const useProgressiveEnhancement = () => {
  if (typeof window === 'undefined') {
    return {
      hasFeature: () => false,
      config: {
        useAnimations: false,
        useAutoScroll: false,
        useLargerTargets: true,
        useInfiniteScroll: false,
        useLocalStorage: false,
        preferSimpleUI: true
      }
    };
  }

  const manager = enhancementManager || new ProgressiveEnhancementManager();

  return {
    hasFeature: (feature: string) => manager.hasFeature(feature),
    config: manager.getRecommendedConfig()
  };
};

/**
 * Focus management utilities
 */
export const focusManagement = {
  /**
   * Trap focus within an element
   */
  trapFocus: (element: HTMLElement): (() => void) => {
    const focusableElements = element.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },

  /**
   * Save and restore focus
   */
  saveFocus: (): (() => void) => {
    const activeElement = document.activeElement as HTMLElement;

    return () => {
      if (activeElement && activeElement.focus) {
        activeElement.focus();
      }
    };
  },

  /**
   * Focus first error in a form
   */
  focusFirstError: (formElement: HTMLElement): void => {
    const firstError = formElement.querySelector('[aria-invalid="true"]') as HTMLElement;
    if (firstError) {
      firstError.focus();
    }
  }
};

/**
 * Announce to screen readers
 */
export const announce = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  if (typeof document === 'undefined') return;

  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Skip link utilities
 */
export const skipLinks = {
  /**
   * Add skip to main content link
   */
  addSkipToMain: (mainId: string = 'main-content'): void => {
    if (typeof document === 'undefined') return;

    const existing = document.querySelector('.skip-to-main');
    if (existing) return;

    const skipLink = document.createElement('a');
    skipLink.href = `#${mainId}`;
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-to-main sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded';

    document.body.insertBefore(skipLink, document.body.firstChild);
  }
};

/**
 * Debounce function for performance
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function for performance
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export default {
  prefersReducedMotion,
  onReducedMotionChange,
  prefersDarkScheme,
  prefersHighContrast,
  hasTouchSupport,
  hasFinePointer,
  isMobileViewport,
  onViewportChange,
  hasIntersectionObserver,
  hasLocalStorage,
  supportsCSSFeature,
  isScreenReaderLikely,
  enhancementManager,
  useProgressiveEnhancement,
  focusManagement,
  announce,
  skipLinks,
  debounce,
  throttle
};
