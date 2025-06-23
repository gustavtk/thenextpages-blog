'use client';

import Script from 'next/script';

declare global {
  interface Window {
    adsbygoogle: unknown[];
    __adsense_initialized_once?: boolean;
  }
}

export default function AdSenseLoader() {
  // Don't render if no publisher ID or auto ads disabled
  if (process.env.NEXT_PUBLIC_ADSENSE_AUTO_ADS !== 'true' || !process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID) {
    return null;
  }

  // Simplified initialization that only runs once per page load
  const handleLoad = () => {
    // Use a simple document-level flag that persists across all components
    if (typeof window !== 'undefined' && !window.__adsense_initialized_once) {
      try {
        // Mark as initialized immediately to prevent any race conditions
        window.__adsense_initialized_once = true;
        
        // Initialize AdSense array
        window.adsbygoogle = window.adsbygoogle || [];
        
        // Small delay to ensure the script is fully loaded
        setTimeout(() => {
          window.adsbygoogle.push({
            google_ad_client: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID,
            enable_page_level_ads: true
          });
          console.log('AdSense Auto Ads initialized successfully');
        }, 100);
        
      } catch (error) {
        console.error('Auto Ads initialization error:', error);
        // Reset flag only on error
        window.__adsense_initialized_once = false;
      }
    }
  };

  return (
    <>
      {/* Only load script if not already initialized */}
      {typeof window === 'undefined' || !window.__adsense_initialized_once ? (
        <Script
          id="adsense-auto-ads-script"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
          onLoad={handleLoad}
        />
      ) : null}
      
      {/* Auto Ads metadata */}
      <meta name="google-adsense-platform-account" content={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID} />
      <meta name="google-adsense-platform-domain" content="thenextpages.com" />
    </>
  );
}