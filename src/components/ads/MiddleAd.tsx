'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function MiddleAd() {
  const adRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adPushed, setAdPushed] = useState(false);
  
  useEffect(() => {
    // Only run if not already pushed
    if (!adPushed) {
      try {
        setAdPushed(true);
        // Push ad to AdSense queue
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        
        // Check if ad actually loaded after delay
        setTimeout(() => {
          if (adRef.current) {
            const adElement = adRef.current.querySelector('.adsbygoogle');
            if (adElement && (adElement.children.length > 0 || adElement.innerHTML.trim() !== '')) {
              setAdLoaded(true);
            }
          }
        }, 2000);
      } catch (err) {
        console.error('MiddleAd AdSense error:', err);
        setAdPushed(false); // Reset on error
      }
    }
  }, [adPushed]);

  // Don't render if no publisher ID or middle ad slot
  if (!process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || !process.env.NEXT_PUBLIC_ADSENSE_MIDDLE_AD) {
    return null;
  }

  // ONLY render when ad is confirmed loaded - otherwise return null (no space at all)
  if (!adLoaded) {
    return (
      <div ref={adRef} style={{ 
        position: 'absolute', 
        left: '-9999px', 
        width: '320px', 
        height: '250px',
        visibility: 'hidden'
      }}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '320px', height: '250px' }}
          data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
          data-ad-slot={process.env.NEXT_PUBLIC_ADSENSE_MIDDLE_AD}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  return (
    <div className="w-full my-8 px-4 sm:px-6 lg:px-8" style={{ minHeight: 'fit-content', isolation: 'isolate' }}>
      <div className="max-w-4xl mx-auto" style={{ maxWidth: '100%', boxSizing: 'border-box' }}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
          data-ad-slot={process.env.NEXT_PUBLIC_ADSENSE_MIDDLE_AD}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}