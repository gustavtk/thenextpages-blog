'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function HeaderAd() {
  const adRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            // Small delay to ensure smooth loading
            setTimeout(() => {
              try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
              } catch (err) {
                console.error('HeaderAd AdSense error:', err);
              }
            }, 100);
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  // Don't render if no publisher ID or header ad slot
  if (!process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || !process.env.NEXT_PUBLIC_ADSENSE_HEADER_AD) {
    return null;
  }

  return (
    <div ref={adRef} className="w-full my-6 flex justify-center">
      <div className="max-w-4xl w-full">
        {/* Header Ad - After Article Title */}
        <div className="border border-gray-200 rounded-lg p-3 mb-8 bg-white">
          <div className="text-xs text-gray-400 text-center mb-2 uppercase tracking-wide">Advertisement</div>
          {isVisible ? (
            <ins
              className="adsbygoogle"
              style={{
                display: 'block',
                width: '100%',
                minHeight: '250px',
                maxHeight: '280px'
              }}
              data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
              data-ad-slot={process.env.NEXT_PUBLIC_ADSENSE_HEADER_AD}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          ) : (
            <div 
              style={{ 
                height: '250px', 
                backgroundColor: '#f8fafc',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#cbd5e1',
                fontSize: '14px'
              }}
            >
              Loading ad...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}