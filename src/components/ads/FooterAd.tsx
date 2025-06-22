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
    <div className="w-full my-8 flex justify-center">
      <div className="max-w-4xl w-full">
        {/* Footer Ad - After Main Content */}
        <div className="border-t border-gray-200 pt-8 mt-8">
          <div className="text-xs text-gray-500 text-center mb-4">Advertisement</div>
          <ins
            className="adsbygoogle"
            style={{
              display: 'block',
              width: '100%',
              height: '280px'
            }}
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