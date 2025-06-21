'use client';

import { useEffect } from 'react';

interface AdSenseProps {
  adSlot: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function AdSense({ 
  adSlot, 
  adFormat = 'auto', 
  fullWidthResponsive = true,
  style,
  className = ''
}: AdSenseProps) {
  useEffect(() => {
    try {
      // @ts-expect-error AdSense global variable
      if (window.adsbygoogle && window.adsbygoogle.loaded) {
        // @ts-expect-error AdSense global variable
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div className={`adsense-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-YOUR_ADSENSE_ID" // Replace with your AdSense ID
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
}

// Article Inline Ad Component
export function ArticleInlineAd({ className = '' }: { className?: string }) {
  return (
    <div className={`my-8 text-center ${className}`}>
      <AdSense 
        adSlot="YOUR_INLINE_AD_SLOT_ID" // Replace with your slot ID
        adFormat="fluid"
        style={{ textAlign: 'center' }}
      />
    </div>
  );
}

// Sidebar Ad Component
export function SidebarAd({ className = '' }: { className?: string }) {
  return (
    <div className={`sticky top-24 ${className}`}>
      <AdSense 
        adSlot="YOUR_SIDEBAR_AD_SLOT_ID" // Replace with your slot ID
        adFormat="rectangle"
        style={{ width: '300px', height: '250px' }}
      />
    </div>
  );
}

// Banner Ad Component
export function BannerAd({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full my-6 ${className}`}>
      <AdSense 
        adSlot="YOUR_BANNER_AD_SLOT_ID" // Replace with your slot ID
        adFormat="horizontal"
        style={{ width: '100%', height: '90px' }}
      />
    </div>
  );
} 