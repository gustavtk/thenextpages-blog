'use client';

import Script from 'next/script';

// Global variable outside React to persist across all instances and navigation
let ADSENSE_PAGE_LEVEL_INITIALIZED = false;

declare global {
  interface Window {
    adsbygoogle: unknown[];
    __adsense_page_level_done?: boolean;
  }
}

export default function AdSenseLoader() {
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
      console.log('AdSense page-level ads already initialized, skipping');
      return;
    }
    
    try {
      // Set ALL flags immediately before any AdSense calls
      ADSENSE_PAGE_LEVEL_INITIALIZED = true;
      if (typeof window !== 'undefined') {
        window.__adsense_page_level_done = true;
        sessionStorage.setItem('adsense_page_level_init', 'true');
        
        // Initialize AdSense array
        window.adsbygoogle = window.adsbygoogle || [];
        
        // Push page-level ads configuration once and only once
        window.adsbygoogle.push({
          google_ad_client: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID,
          enable_page_level_ads: true
        });
        
        console.log('AdSense page-level ads initialized successfully');
      }
    } catch (error) {
      console.error('AdSense initialization error:', error);
      // On error, reset flags to allow retry
      ADSENSE_PAGE_LEVEL_INITIALIZED = false;
      if (typeof window !== 'undefined') {
        window.__adsense_page_level_done = false;
        sessionStorage.removeItem('adsense_page_level_init');
      }
    }
  };

  // Check if we should load the script (only once per session)
  const shouldLoadScript = typeof window === 'undefined' || 
    (!ADSENSE_PAGE_LEVEL_INITIALIZED && 
     !window.__adsense_page_level_done && 
     sessionStorage.getItem('adsense_page_level_init') !== 'true');

  return (
    <>
      {/* Only load script once per browser session */}
      {shouldLoadScript && (
        <Script
          id="adsense-page-level-script"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
          onLoad={handleLoad}
        />
      )}
      
      {/* Auto Ads metadata */}
      <meta name="google-adsense-platform-account" content={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID} />
      <meta name="google-adsense-platform-domain" content="thenextpages.com" />
    </>
  );
}