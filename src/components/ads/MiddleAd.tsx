'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function MiddleAd() {
  useEffect(() => {
    try {
      // Push ad to AdSense queue
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('MiddleAd AdSense error:', err);
    }
  }, []);

  // Don't render if no publisher ID or middle ad slot
  if (!process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || !process.env.NEXT_PUBLIC_ADSENSE_MIDDLE_AD) {
    return null;
  }

  return (
    <div className="w-full my-8 flex justify-center">
      <div className="max-w-4xl w-full">
        {/* Middle Ad - Injected into Article Content */}
        <div className="w-full my-8">
          <ins
            className="adsbygoogle"
            style={{
              display: 'block',
              width: '100%'
            }}
            data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
            data-ad-slot={process.env.NEXT_PUBLIC_ADSENSE_MIDDLE_AD}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </div>
  );
}