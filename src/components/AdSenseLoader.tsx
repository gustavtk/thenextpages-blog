'use client';

import Script from 'next/script';

export default function AdSenseLoader() {
  // Don't render if no publisher ID or auto ads disabled
  if (process.env.NEXT_PUBLIC_ADSENSE_AUTO_ADS !== 'true' || !process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID) {
    console.log('❌ AdSense script not loaded. Auto Ads:', process.env.NEXT_PUBLIC_ADSENSE_AUTO_ADS, 'Publisher ID:', process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID);
    return null;
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
      onLoad={() => console.log('✅ AdSense script loaded successfully')}
      onError={(e) => console.error('❌ AdSense script failed to load:', e)}
    />
  );
}