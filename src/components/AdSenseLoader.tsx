'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

// Global variables to persist across all instances and navigation
let ADSENSE_SCRIPT_LOADED = false;
let ADSENSE_INITIALIZATION_ATTEMPTED = false;

declare global {
  interface Window {
    adsbygoogle: unknown[];
    __adsense_script_ready?: boolean;
    __adsense_page_level_done?: boolean;
  }
}

/**
 * Enhanced SSG-compatible AdSense loader with improved timing coordination
 * Features:
 * - Prevents hydration mismatches with proper client-side detection
 * - Robust script loading with error recovery
 * - Better coordination with ad components
 * - Compatible with Next.js SSG three-phase loading
 * - Enhanced debugging and monitoring
 */
export default function AdSenseLoader() {
  const [isMounted, setIsMounted] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Always call hooks before any early returns
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Validate environment variables
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
  const autoAdsEnabled = process.env.NEXT_PUBLIC_ADSENSE_AUTO_ADS === 'true';

  // Early return for missing configuration
  if (!publisherId) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[AdSense] Missing NEXT_PUBLIC_ADSENSE_PUBLISHER_ID');
    }
    return null;
  }

  // Enhanced script load handler with better error recovery
  const handleLoad = () => {
    try {
      // Check if already initialized to prevent duplicates
      if (ADSENSE_SCRIPT_LOADED && ADSENSE_INITIALIZATION_ATTEMPTED) {
        console.log('[AdSense] Script already loaded and initialized');
        return;
      }

      ADSENSE_SCRIPT_LOADED = true;
      
      if (typeof window !== 'undefined') {
        // Initialize AdSense array
        window.adsbygoogle = window.adsbygoogle || [];
        window.__adsense_script_ready = true;
        
        console.log('[AdSense] Script loaded successfully');
        
        // Only initialize page-level ads if auto ads are enabled
        if (autoAdsEnabled && !ADSENSE_INITIALIZATION_ATTEMPTED) {
          ADSENSE_INITIALIZATION_ATTEMPTED = true;
          
          try {
            // Push page-level ads configuration
            window.adsbygoogle.push({
              google_ad_client: publisherId,
              enable_page_level_ads: true
            });
            
            window.__adsense_page_level_done = true;
            console.log('[AdSense] Page-level ads initialized');
            
          } catch (pageError) {
            console.error('[AdSense] Page-level ads initialization error:', pageError);
            ADSENSE_INITIALIZATION_ATTEMPTED = false;
          }
        }
        
        // Dispatch ready event for components to listen to
        window.dispatchEvent(new CustomEvent('adsense-ready', {
          detail: {
            scriptLoaded: true,
            autoAdsEnabled,
            publisherId
          }
        }));
        
        // Also dispatch the legacy event for backward compatibility
        window.dispatchEvent(new CustomEvent('adsense-loaded'));
      }
      
    } catch (error) {
      console.error('[AdSense] Load handler error:', error);
      handleError(error as Error);
    }
  };

  // Enhanced error handler with retry logic
  const handleError = (error: Error) => {
    console.error('[AdSense] Script loading error:', error);
    setScriptError(true);
    
    // Reset global flags on error
    ADSENSE_SCRIPT_LOADED = false;
    ADSENSE_INITIALIZATION_ATTEMPTED = false;
    
    if (typeof window !== 'undefined') {
      window.__adsense_script_ready = false;
      window.__adsense_page_level_done = false;
      
      // Dispatch error event
      window.dispatchEvent(new CustomEvent('adsense-error', {
        detail: {
          error: error.message,
          retryCount,
        }
      }));
    }
    
    // Implement retry logic for transient errors
    if (retryCount < 3) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setScriptError(false);
        console.log(`[AdSense] Retrying script load (attempt ${retryCount + 1})`);
      }, Math.pow(2, retryCount) * 1000); // Exponential backoff
    }
  };

  // Enhanced check for script loading conditions
  const shouldLoadScript = () => {
    if (!isMounted || scriptError) return false;
    
    // Don't load if already loaded
    if (ADSENSE_SCRIPT_LOADED) return false;
    
    // Check if script already exists in DOM (from previous navigation)
    if (typeof window !== 'undefined') {
      const existingScript = document.querySelector(`script[src*="adsbygoogle.js"][src*="${publisherId}"]`);
      if (existingScript) {
        // Script exists but wasn't detected as loaded, trigger load handler
        setTimeout(handleLoad, 100);
        return false;
      }
    }
    
    return true;
  };

  // Don't render anything during SSR
  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* AdSense script with enhanced error handling */}
      {shouldLoadScript() && (
        <Script
          id={`adsense-script-${publisherId}-${retryCount}`}
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
          onLoad={handleLoad}
          onError={handleError}
          data-retry-count={retryCount}
        />
      )}
      
      {/* Essential meta tags for AdSense optimization */}
      <meta name="google-adsense-platform-account" content={publisherId} />
      <meta name="google-adsense-platform-domain" content="thenextpages.com" />
      <meta name="ads-txt-url" content="https://thenextpages.com/ads.txt" />
      
      {/* Performance hints for faster ad loading */}
      <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
      <link rel="preconnect" href="https://googleads.g.doubleclick.net" />
      <link rel="preconnect" href="https://securepubads.g.doubleclick.net" />
      
      {/* Development tools */}
      {process.env.NODE_ENV === 'development' && (
        <>
          {/* Error notification */}
          {scriptError && (
            <div style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              background: '#dc2626',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              zIndex: 9999,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              maxWidth: '300px',
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                AdSense Error
              </div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>
                Script failed to load (attempt {retryCount + 1}/4)
              </div>
              {retryCount < 3 && (
                <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.8 }}>
                  Retrying...
                </div>
              )}
            </div>
          )}
          
          {/* Status indicator */}
          {ADSENSE_SCRIPT_LOADED && (
            <div style={{
              position: 'fixed',
              bottom: '70px',
              right: '20px',
              background: '#059669',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              zIndex: 9999,
              opacity: 0.9,
            }}>
              AdSense Ready
            </div>
          )}
        </>
      )}
    </>
  );
}