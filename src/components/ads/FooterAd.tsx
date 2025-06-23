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
 * SSG-compatible FooterAd component with collapse functionality
 * Features:
 * - Client-side only rendering to prevent hydration mismatches
 * - Automatic collapse for empty/unfilled ad slots
 * - Three-phase loading states: static → hydrated → ads loaded
 * - Performance optimized for Core Web Vitals
 */
function FooterAdContent() {
  const { adRef, adState, retryAd } = useAdSenseWithCollapse({
    adSlot: process.env.NEXT_PUBLIC_ADSENSE_FOOTER_AD || '',
    adFormat: 'auto',
    fullWidthResponsive: true,
    collapseEmpty: true,
    timeoutMs: 5000, // 5 second timeout for empty ad detection
  });

  // Don't render if no publisher ID or footer ad slot
  if (!process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || !process.env.NEXT_PUBLIC_ADSENSE_FOOTER_AD) {
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
        minHeight: adState.isLoading ? '120px' : 'fit-content',
        isolation: 'isolate',
        // Prevent layout shift during loading
        contain: 'layout style',
      }}
    >
      <div className="max-w-4xl mx-auto" style={{ maxWidth: '100%', boxSizing: 'border-box' }}>
        <div className={`transition-all duration-300 ${
          adState.isLoaded ? 'border-t border-gray-200 pt-8 mt-8' : ''
        }`}>
          
          {/* Show skeleton during loading */}
          {adState.isLoading && (
            <div className="border-t border-gray-200 pt-8 mt-8">
              <AdSkeleton height={120} showLabel={true} />
            </div>
          )}
          
          {/* Error state with retry option */}
          {adState.hasError && (
            <div className="text-center py-4 border-t border-gray-200 mt-8">
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
            {/* Advertisement label for footer ads */}
            {adState.isLoaded && (
              <div className="text-center mb-4">
                <span className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-200 pb-2">
                  Advertisement
                </span>
              </div>
            )}
            
            <ins
              className="adsbygoogle"
              style={{ 
                display: 'block',
                minHeight: '1px',
                transition: 'all 0.3s ease-in-out',
              }}
              data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
              data-ad-slot={process.env.NEXT_PUBLIC_ADSENSE_FOOTER_AD}
              data-ad-format="auto"
              data-full-width-responsive="true"
              data-adtest={process.env.NODE_ENV === 'development' ? 'on' : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FooterAd() {
  return (
    <ClientOnlyAd>
      <FooterAdContent />
    </ClientOnlyAd>
  );
}