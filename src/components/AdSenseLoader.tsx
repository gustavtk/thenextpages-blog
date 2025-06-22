'use client';

import Script from 'next/script';

declare global {
  interface Window {
    adsbygoogle: unknown[];
    adsenseInitialized?: boolean;
  }
}

export default function AdSenseLoader() {
  // Don't render if no publisher ID or auto ads disabled
  if (process.env.NEXT_PUBLIC_ADSENSE_AUTO_ADS !== 'true' || !process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID) {
    return null;
  }

  return (
    <>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
        onLoad={() => {
          // Simple Auto Ads initialization that works across all devices
          // Prevent duplicate initialization
          if (typeof window !== 'undefined' && !window.adsenseInitialized) {
            try {
              (window.adsbygoogle = window.adsbygoogle || []).push({
                google_ad_client: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID,
                enable_page_level_ads: true
              });
              // Mark as initialized to prevent duplicates
              window.adsenseInitialized = true;
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