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
 * SSG-compatible HeaderAd component with collapse functionality
 * Features:
 * - Client-side only rendering to prevent hydration mismatches
 * - Automatic collapse for empty/unfilled ad slots
 * - Three-phase loading states: static → hydrated → ads loaded
 * - Performance optimized for Core Web Vitals
 */
function HeaderAdContent() {
  const { adRef, adState, retryAd } = useAdSenseWithCollapse({
    adSlot: process.env.NEXT_PUBLIC_ADSENSE_HEADER_AD || '',
    adFormat: 'auto',
    fullWidthResponsive: true,
    collapseEmpty: true,
    timeoutMs: 5000, // 5 second timeout for empty ad detection
  });

  // Don't render if no publisher ID or header ad slot
  if (!process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || !process.env.NEXT_PUBLIC_ADSENSE_HEADER_AD) {
    return null;
  }

  // Collapse the container if ad is empty
  if (adState.isCollapsed || adState.isEmpty) {
    return null;
  }

  return (
    <div 
      className={`w-full transition-all duration-300 ease-in-out ${
        adState.isLoading ? 'my-4' : 'my-6'
      } px-4 sm:px-6 lg:px-8`}
      style={{ 
        minHeight: adState.isLoading ? '100px' : 'fit-content',
        isolation: 'isolate',
        // Prevent layout shift during loading
        contain: 'layout style',
      }}
    >
      <div className="max-w-4xl mx-auto" style={{ maxWidth: '100%', boxSizing: 'border-box' }}>
        
        {/* Show skeleton during loading */}
        {adState.isLoading && (
          <AdSkeleton height={100} showLabel={false} className="mb-4" />
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
            }}
            data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
            data-ad-slot={process.env.NEXT_PUBLIC_ADSENSE_HEADER_AD}
            data-ad-format="auto"
            data-full-width-responsive="true"
            data-adtest={process.env.NODE_ENV === 'development' ? 'on' : undefined}
          />
        </div>
        
        {/* Advertisement label for transparency */}
        {(adState.isLoaded || adState.isLoading) && (
          <div className="text-center mt-2">
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              Advertisement
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HeaderAd() {
  return (
    <ClientOnlyAd>
      <HeaderAdContent />
    </ClientOnlyAd>
  );
}