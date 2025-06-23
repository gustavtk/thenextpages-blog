'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function FooterAd() {
  useEffect(() => {
    try {
      // Push ad to AdSense queue
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('FooterAd AdSense error:', err);
    }
  }, []);

  // Don't render if no publisher ID or footer ad slot
  if (!process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || !process.env.NEXT_PUBLIC_ADSENSE_FOOTER_AD) {
    return null;
  }

  return (
    <div className="w-full my-8 px-4 sm:px-6 lg:px-8" style={{ minHeight: 'fit-content', isolation: 'isolate' }}>
      <div className="max-w-4xl mx-auto" style={{ maxWidth: '100%', boxSizing: 'border-box' }}>
      <div className="border-t border-gray-200 pt-8 mt-8">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
          data-ad-slot={process.env.NEXT_PUBLIC_ADSENSE_FOOTER_AD}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
      </div>
    </div>
  );
}