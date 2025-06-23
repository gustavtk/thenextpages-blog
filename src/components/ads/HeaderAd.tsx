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
 * Enhanced SSG-compatible HeaderAd component with robust collapse functionality
 * Features:
 * - Client-side only rendering to prevent hydration mismatches
 * - Automatic collapse for empty/unfilled ad slots with improved detection
 * - Three-phase loading states: static → hydrated → ads loaded
 * - Performance optimized for Core Web Vitals with proper layout containment
 * - Enhanced error handling and retry mechanisms
 * - Accessibility improvements
 */
function HeaderAdContent() {
  const { adRef, adState, retryAd } = useAdSenseWithCollapse({
    adSlot: process.env.NEXT_PUBLIC_ADSENSE_HEADER_AD || '',
    adFormat: 'auto',
    fullWidthResponsive: true,
    collapseEmpty: true,
    timeoutMs: 8000, // Increased timeout for better reliability
    retryCount: 2, // Allow retries
  });

  // Don't render if no publisher ID or header ad slot
  if (!process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || !process.env.NEXT_PUBLIC_ADSENSE_HEADER_AD) {
    return null;
  }

  // Collapse the container if ad is empty - return null for complete removal
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
        // Enhanced layout containment to prevent shifts
        contain: 'layout style size',
      }}
      role="banner"
      aria-label="Header advertisement"
    >
      <div className="max-w-4xl mx-auto" style={{ maxWidth: '100%', boxSizing: 'border-box' }}>
        
        {/* Advertisement label (shown before loading for transparency) */}
        {(adState.isLoading || adState.isLoaded) && (
          <div className="text-center mb-2">
            <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">
              Advertisement
            </span>
          </div>
        )}
        
        {/* Show skeleton during loading */}
        {adState.isLoading && (
          <AdSkeleton 
            height={100} 
            showLabel={false} 
            className="mb-2" 
            variant="banner"
            animate={true}
          />
        )}
        
        {/* Error state with enhanced retry options */}
        {adState.hasError && (
          <div className="text-center py-6 px-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="max-w-sm mx-auto">
              <p className="text-gray-600 text-sm mb-3">
                Unable to load advertisement
              </p>
              <div className="flex items-center justify-center space-x-3">
                <button 
                  onClick={retryAd}
                  className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  aria-label="Retry loading advertisement"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retry
                </button>
                <span className="text-gray-400 text-xs">
                  Attempt {adState.loadAttempts}/3
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* AdSense ad unit with enhanced attributes */}
        <div 
          ref={adRef}
          className={`transition-all duration-500 ease-in-out ${
            adState.isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          style={{
            // Ensure proper layout containment
            contain: 'layout style',
          }}
        >
          <ins
            className="adsbygoogle"
            style={{ 
              display: 'block',
              minHeight: '1px',
              transition: 'all 0.3s ease-in-out',
              width: '100%',
              maxWidth: '100%',
              overflow: 'hidden',
            }}
            data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
            data-ad-slot={process.env.NEXT_PUBLIC_ADSENSE_HEADER_AD}
            data-ad-format="auto"
            data-full-width-responsive="true"
            data-adtest={process.env.NODE_ENV === 'development' ? 'on' : undefined}
            // Enhanced attributes for better ad serving
            data-ad-layout="in-article"
            data-ad-layout-key="-fb+5w+4e-db+86"
            // Accessibility
            role="img"
            aria-label="Advertisement"
          />
        </div>
        
        {/* Loading progress indicator */}
        {adState.isLoading && (
          <div className="text-center mt-2">
            <div className="inline-flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">Loading ad content...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Main HeaderAd component with SSG-compatible client-only wrapper
 */
export default function HeaderAd() {
  // Provide a fallback skeleton during SSR and initial hydration
  const fallback = (
    <div className="w-full my-4 px-4 sm:px-6 lg:px-8" role="banner" aria-label="Advertisement loading">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-2">
          <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">
            Advertisement
          </span>
        </div>
        <AdSkeleton 
          height={100} 
          showLabel={false} 
          variant="banner"
          animate={false} // No animation during SSR
        />
      </div>
    </div>
  );

  return (
    <ClientOnlyAd fallback={fallback}>
      <HeaderAdContent />
    </ClientOnlyAd>
  );
}