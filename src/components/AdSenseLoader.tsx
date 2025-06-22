'use client';

import Script from 'next/script';
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
    __adsense_auto_ads_initialized?: boolean;
  }
}

export default function AdSenseLoader() {
  const initRef = useRef<boolean>(false);

  useEffect(() => {
    // Reset initialization state when component mounts
    return () => {
      // Cleanup on unmount
      initRef.current = false;
    };
  }, []);

  // Don't render if no publisher ID or auto ads disabled
  if (process.env.NEXT_PUBLIC_ADSENSE_AUTO_ADS !== 'true' || !process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID) {
    return null;
  }

  const handleLoad = () => {
    // Check multiple sources to prevent duplicate initialization
    const sessionInitialized = typeof window !== 'undefined' && sessionStorage.getItem('adsense-auto-ads-init') === 'true';
    const windowInitialized = typeof window !== 'undefined' && window.__adsense_auto_ads_initialized === true;
    const refInitialized = initRef.current;

    if (!sessionInitialized && !windowInitialized && !refInitialized) {
      try {
        if (typeof window !== 'undefined') {
          (window.adsbygoogle = window.adsbygoogle || []).push({
            google_ad_client: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID,
            enable_page_level_ads: true
          });
          
          // Mark as initialized in multiple places
          sessionStorage.setItem('adsense-auto-ads-init', 'true');
          window.__adsense_auto_ads_initialized = true;
          initRef.current = true;
        }
      } catch (error) {
        console.error('Auto Ads initialization error:', error);
      }
    }
  };

  return (
    <>
      <Script
        id="adsense-auto-ads-script"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
        onLoad={handleLoad}
      />
      
      {/* Auto Ads metadata */}
      <meta name="google-adsense-platform-account" content={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID} />
      <meta name="google-adsense-platform-domain" content={typeof window !== 'undefined' ? window.location.hostname : 'thenextpages.com'} />
    </>
  );
}