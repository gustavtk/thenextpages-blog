'use client';

import Script from 'next/script';
import { useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

// Global flag outside of React to prevent multiple initializations
let adsenseInitialized = false;

export default function AdSenseLoader() {
  const scriptRef = useRef<boolean>(false);

  // Don't render if no publisher ID or auto ads disabled
  if (process.env.NEXT_PUBLIC_ADSENSE_AUTO_ADS !== 'true' || !process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID) {
    return null;
  }

  return (
    <>
      <Script
        id="adsense-loader"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
        onLoad={() => {
          // Prevent duplicate initialization using module-level flag
          if (!adsenseInitialized && !scriptRef.current) {
            try {
              (window.adsbygoogle = window.adsbygoogle || []).push({
                google_ad_client: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID,
                enable_page_level_ads: true
              });
              adsenseInitialized = true;
              scriptRef.current = true;
            } catch (error) {
              console.error('Auto Ads initialization error:', error);
            }
          }
        }}
      />
      
      {/* Auto Ads placeholder - helps with ad placement detection */}
      <meta name="google-adsense-platform-account" content={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID} />
      <meta name="google-adsense-platform-domain" content={typeof window !== 'undefined' ? window.location.hostname : 'thenextpages.com'} />
    </>
  );
}