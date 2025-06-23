'use client';

import { useAdSenseWithCollapse } from '@/hooks/useAdSenseWithCollapse';
import ClientOnlyAd from './ClientOnlyAd';
import AdSkeleton from './AdSkeleton';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

/**
 * SSG-compatible MiddleAd component with collapse functionality
 * Features:
 * - Client-side only rendering to prevent hydration mismatches
 * - Automatic collapse for empty/unfilled ad slots
 * - Three-phase loading states: static → hydrated → ads loaded
 * - Performance optimized for Core Web Vitals
 * - Designed for injection into article content
 */
function MiddleAdContent() {
  const { adRef, adState, retryAd } = useAdSenseWithCollapse({
    adSlot: process.env.NEXT_PUBLIC_ADSENSE_MIDDLE_AD || '',
    adFormat: 'auto',
    fullWidthResponsive: true,
    collapseEmpty: true,
    timeoutMs: 6000, // Slightly longer timeout for middle ads
  });

  // Don't render if no publisher ID or middle ad slot
  if (!process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || !process.env.NEXT_PUBLIC_ADSENSE_MIDDLE_AD) {
    return null;
  }

  // Collapse the container if ad is empty
  if (adState.isCollapsed || adState.isEmpty) {
    return null;
  }

  return (
    <div 
      className={`w-full transition-all duration-300 ease-in-out ${
        adState.isLoading ? 'my-6' : 'my-8'
      } px-4 sm:px-6 lg:px-8`}
      style={{ 
        minHeight: adState.isLoading ? '250px' : 'fit-content',
        isolation: 'isolate',
        // Prevent layout shift during loading
        contain: 'layout style',
      }}
    >
      <div className="max-w-4xl mx-auto" style={{ maxWidth: '100%', boxSizing: 'border-box' }}>
        
        {/* Advertisement label before the ad */}
        {(adState.isLoaded || adState.isLoading) && (
          <div className="text-center mb-4">
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              Advertisement
            </span>
          </div>
        )}
        
        {/* Show skeleton during loading */}
        {adState.isLoading && (
          <AdSkeleton height={250} showLabel={false} />
        )}
        
        {/* Error state with retry option */}
        {adState.hasError && (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm mb-2">Ad failed to load</p>
            <button 
              onClick={retryAd}
              className="text-blue-500 text-xs hover:text-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
        
        {/* AdSense ad unit */}
        <div 
          ref={adRef}
          className={`transition-opacity duration-300 ${
            adState.isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <ins
            className="adsbygoogle"
            style={{ 
              display: 'block',
              minHeight: '1px',
              transition: 'all 0.3s ease-in-out',
              margin: '20px 0',
            }}
            data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
            data-ad-slot={process.env.NEXT_PUBLIC_ADSENSE_MIDDLE_AD}
            data-ad-format="auto"
            data-full-width-responsive="true"
            data-adtest={process.env.NODE_ENV === 'development' ? 'on' : undefined}
          />
        </div>
      </div>
    </div>
  );
}

export default function MiddleAd() {
  return (
    <ClientOnlyAd>
      <MiddleAdContent />
    </ClientOnlyAd>
  );
}