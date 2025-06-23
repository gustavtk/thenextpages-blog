'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

// Global variable outside React to persist across all instances and navigation
let ADSENSE_PAGE_LEVEL_INITIALIZED = false;
let ADSENSE_SCRIPT_LOADED = false;

declare global {
  interface Window {
    adsbygoogle: unknown[];
    __adsense_page_level_done?: boolean;
    __adsense_script_ready?: boolean;
  }
}

/**
 * SSG-compatible AdSense loader with enhanced error handling
 * Features:
 * - Prevents hydration mismatches
 * - Robust script loading detection
 * - Better error handling and recovery
 * - Compatible with Next.js SSG
 */
export default function AdSenseLoader() {
  const [isMounted, setIsMounted] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  // Always call hooks before any early returns
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render if no publisher ID or auto ads disabled
  if (process.env.NEXT_PUBLIC_ADSENSE_AUTO_ADS !== 'true' || !process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID) {
    return null;
  }

  // Bulletproof initialization that absolutely prevents duplicates
  const handleLoad = () => {
    // Check all possible sources to prevent any duplicate calls
    const globalFlag = ADSENSE_PAGE_LEVEL_INITIALIZED;
    const windowFlag = typeof window !== 'undefined' && window.__adsense_page_level_done;
    const sessionFlag = typeof window !== 'undefined' && sessionStorage.getItem('adsense_page_level_init') === 'true';
    
    // If ANY flag is set, do not initialize
    if (globalFlag || windowFlag || sessionFlag) {
      console.log('[AdSense] Page-level ads already initialized, skipping');
      return;
    }
    
    try {
      // Set ALL flags immediately before any AdSense calls
      ADSENSE_PAGE_LEVEL_INITIALIZED = true;
      ADSENSE_SCRIPT_LOADED = true;
      
      if (typeof window !== 'undefined') {
        window.__adsense_page_level_done = true;
        window.__adsense_script_ready = true;
        sessionStorage.setItem('adsense_page_level_init', 'true');
        
        // Initialize AdSense array
        window.adsbygoogle = window.adsbygoogle || [];
        
        // Push page-level ads configuration once and only once
        window.adsbygoogle.push({
          google_ad_client: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID,
          enable_page_level_ads: true
        });
        
        console.log('[AdSense] Page-level ads initialized successfully');
        
        // Trigger a custom event for other components to listen to
        window.dispatchEvent(new CustomEvent('adsense-loaded'));
      }
    } catch (error) {
      console.error('[AdSense] Initialization error:', error);
      setScriptError(true);
      
      // On error, reset flags to allow retry
      ADSENSE_PAGE_LEVEL_INITIALIZED = false;
      ADSENSE_SCRIPT_LOADED = false;
      if (typeof window !== 'undefined') {
        window.__adsense_page_level_done = false;
        window.__adsense_script_ready = false;
        sessionStorage.removeItem('adsense_page_level_init');
      }
    }
  };

  const handleError = (error: Error) => {
    console.error('[AdSense] Script loading error:', error);
    setScriptError(true);
    
    // Reset flags on script error
    ADSENSE_PAGE_LEVEL_INITIALIZED = false;
    ADSENSE_SCRIPT_LOADED = false;
    if (typeof window !== 'undefined') {
      window.__adsense_page_level_done = false;
      window.__adsense_script_ready = false;
      sessionStorage.removeItem('adsense_page_level_init');
    }
  };

  // Check if we should load the script (only once per session)
  const shouldLoadScript = isMounted && (
    typeof window === 'undefined' || 
    (!ADSENSE_SCRIPT_LOADED && 
     !ADSENSE_PAGE_LEVEL_INITIALIZED && 
     !window.__adsense_page_level_done && 
     sessionStorage.getItem('adsense_page_level_init') !== 'true')
  );

  // Don't render anything during SSR
  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* Only load script once per browser session */}
      {shouldLoadScript && !scriptError && (
        <Script
          id="adsense-page-level-script"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      
      {/* Meta tags for AdSense optimization */}
      <meta name="google-adsense-platform-account" content={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID} />
      <meta name="google-adsense-platform-domain" content="thenextpages.com" />
      
      {/* Error notification (only in development) */}
      {scriptError && process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#ff4444',
          color: 'white',
          padding: '10px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 9999
        }}>
          AdSense script failed to load
        </div>
      )}
    </>
  );
}