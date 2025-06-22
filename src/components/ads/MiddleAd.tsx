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
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-xs text-gray-500 text-center mb-2">Advertisement</div>
          <ins
            className="adsbygoogle"
            style={{
              display: 'block',
              width: '100%',
              minHeight: '250px',
              maxHeight: '320px'
            }}
            data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
            data-ad-slot={process.env.NEXT_PUBLIC_ADSENSE_MIDDLE_AD}
            data-ad-format="rectangle"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </div>
  );
}