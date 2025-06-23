/**
 * AdSense utilities for SSG-compatible implementation
 * Provides helper functions for ad management and detection
 */

declare global {
  interface Window {
    adsbygoogle: unknown[];
    __adsense_script_ready?: boolean;
    gtag?: (command: string, action: string, params?: Record<string, unknown>) => void;
    Sentry?: { captureException: (error: Error, context?: Record<string, unknown>) => void };
  }
}

export interface AdConfig {
  publisherId: string;
  adSlot: string;
  adFormat?: string;
  isResponsive?: boolean;
  autoAds?: boolean;
}

export interface AdElementInfo {
  isEmpty: boolean;
  isLoaded: boolean;
  hasError: boolean;
  element: Element | null;
}

/**
 * Check if AdSense script is loaded and ready
 */
export function isAdSenseReady(): boolean {
  return typeof window !== 'undefined' && 
         window.adsbygoogle !== undefined && 
         window.__adsense_script_ready === true;
}

/**
 * Wait for AdSense script to be ready
 */
export function waitForAdSense(timeoutMs = 10000): Promise<boolean> {
  return new Promise((resolve) => {
    if (isAdSenseReady()) {
      resolve(true);
      return;
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (isAdSenseReady()) {
        clearInterval(checkInterval);
        resolve(true);
      } else if (Date.now() - startTime > timeoutMs) {
        clearInterval(checkInterval);
        resolve(false);
      }
    }, 100);

    // Also listen for the custom event
    const handleAdSenseLoaded = () => {
      clearInterval(checkInterval);
      window.removeEventListener('adsense-loaded', handleAdSenseLoaded);
      resolve(true);
    };
    
    window.addEventListener('adsense-loaded', handleAdSenseLoaded);
  });
}

/**
 * Detect if an ad element is empty/unfilled
 */
export function detectEmptyAd(element: Element): AdElementInfo {
  if (!element) {
    return {
      isEmpty: true,
      isLoaded: false,
      hasError: true,
      element: null,
    };
  }

  const insElement = element.querySelector('ins.adsbygoogle');
  
  if (!insElement) {
    return {
      isEmpty: true,
      isLoaded: false,
      hasError: false,
      element: null,
    };
  }

  // Multiple detection methods for empty ads
  const isEmpty = 
    // No child elements
    insElement.children.length === 0 ||
    // AdSense status attribute
    insElement.getAttribute('data-ad-status') === 'unfilled' ||
    // Empty content
    insElement.innerHTML.trim() === '' ||
    // Minimal height (common for empty ads)
    insElement.clientHeight <= 1 ||
    // Width check
    insElement.clientWidth <= 1 ||
    // Hidden style
    getComputedStyle(insElement).display === 'none' ||
    getComputedStyle(insElement).visibility === 'hidden' ||
    // AdSense error indicators
    insElement.querySelector('[data-ad-status="unfilled"]') !== null ||
    // Google's empty ad class
    insElement.classList.contains('adsbygoogle-noads');

  const isLoaded = !isEmpty && insElement.children.length > 0;
  const hasError = insElement.getAttribute('data-ad-status') === 'error';

  return {
    isEmpty,
    isLoaded,
    hasError,
    element: insElement,
  };
}

/**
 * Refresh a specific ad unit
 */
export function refreshAd(element: Element): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const insElement = element.querySelector('ins.adsbygoogle');
      if (!insElement || !isAdSenseReady()) {
        resolve(false);
        return;
      }

      // Clear existing ad content
      insElement.innerHTML = '';
      insElement.removeAttribute('data-ad-status');
      
      // Push to AdSense queue for refresh
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      
      // Wait a bit for the refresh to take effect
      setTimeout(() => {
        const adInfo = detectEmptyAd(element);
        resolve(adInfo.isLoaded);
      }, 2000);
      
    } catch (error) {
      console.error('[AdSense] Refresh error:', error);
      resolve(false);
    }
  });
}

/**
 * Get optimal ad sizes based on viewport
 */
export function getOptimalAdSize(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 728, height: 90 };
  }

  const width = window.innerWidth;
  
  // Mobile
  if (width < 768) {
    return { width: 320, height: 50 };
  }
  
  // Tablet
  if (width < 1024) {
    return { width: 728, height: 90 };
  }
  
  // Desktop
  return { width: 728, height: 90 };
}

/**
 * Check if ads should be blocked (ad blockers, etc.)
 */
export function areAdsBlocked(): Promise<boolean> {
  return new Promise((resolve) => {
    // Create a test element that ad blockers typically hide
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbox';
    testAd.style.position = 'absolute';
    testAd.style.left = '-10000px';
    testAd.style.width = '1px';
    testAd.style.height = '1px';
    
    document.body.appendChild(testAd);
    
    setTimeout(() => {
      const isBlocked = testAd.offsetHeight === 0;
      document.body.removeChild(testAd);
      resolve(isBlocked);
    }, 100);
  });
}

/**
 * Validate AdSense configuration
 */
export function validateAdConfig(config: Partial<AdConfig>): boolean {
  if (!config.publisherId || !config.publisherId.startsWith('ca-pub-')) {
    console.error('[AdSense] Invalid publisher ID');
    return false;
  }
  
  if (!config.adSlot || !/^\d+$/.test(config.adSlot)) {
    console.error('[AdSense] Invalid ad slot ID');
    return false;
  }
  
  return true;
}

/**
 * Log ad performance metrics
 */
export function logAdMetrics(adType: string, metrics: {
  loadTime?: number;
  isEmpty?: boolean;
  hasError?: boolean;
}): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AdSense Metrics] ${adType}:`, metrics);
  }
  
  // In production, you could send this to analytics
  if (typeof window !== 'undefined' && 'gtag' in window) {
    const gtag = (window as unknown as { gtag: (command: string, action: string, params?: Record<string, unknown>) => void }).gtag;
    gtag('event', 'ad_performance', {
      ad_type: adType,
      is_empty: metrics.isEmpty,
      has_error: metrics.hasError,
      load_time: metrics.loadTime,
    });
  }
}

/**
 * Handle ad loading errors gracefully
 */
export function handleAdError(error: Error, adType: string): void {
  console.error(`[AdSense] ${adType} error:`, error);
  
  // Log to error tracking service if available
  if (typeof window !== 'undefined' && 'Sentry' in window) {
    const Sentry = (window as unknown as { Sentry: { captureException: (error: Error, context?: Record<string, unknown>) => void } }).Sentry;
    Sentry.captureException(error, {
      tags: {
        component: 'adsense',
        ad_type: adType,
      },
    });
  }
}
