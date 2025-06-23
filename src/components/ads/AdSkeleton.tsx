'use client';

interface AdSkeletonProps {
  height?: number;
  width?: string | number;
  showLabel?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'banner';
  animate?: boolean;
}

/**
 * Enhanced skeleton placeholder for ad slots during loading
 * Features:
 * - Multiple variants for different ad types
 * - SSG-optimized with no hydration mismatches
 * - Accessibility support with proper ARIA labels
 * - Helps prevent layout shifts during static → hydrated → ads loaded transition
 * - Respects user motion preferences
 */
export default function AdSkeleton({ 
  height = 100, 
  width = '100%',
  showLabel = true,
  className = "",
  variant = 'default',
  animate = true
}: AdSkeletonProps) {
  
  // Get height based on variant
  const getVariantHeight = () => {
    switch (variant) {
      case 'compact':
        return Math.min(height, 50);
      case 'banner':
        return Math.min(height, 90);
      default:
        return height;
    }
  };

  // Get animation class based on user preferences
  const getAnimationClass = () => {
    if (!animate) return '';
    return 'animate-pulse';
  };

  const skeletonHeight = getVariantHeight();
  const animationClass = getAnimationClass();

  return (
    <div 
      className={`w-full bg-gray-100 border border-gray-200 rounded-md ${animationClass} ${className}`}
      style={{ 
        minHeight: skeletonHeight,
        width: typeof width === 'number' ? `${width}px` : width,
        maxWidth: '100%',
        // Ensure no layout shifts
        contain: 'layout style',
        isolation: 'isolate',
      }}
      role="img"
      aria-label="Advertisement loading"
      data-testid="ad-skeleton"
    >
      <div className="flex flex-col items-center justify-center h-full p-4">
        {/* Main skeleton content */}
        <div className="flex items-center justify-center space-x-2 mb-2">
          {variant === 'banner' ? (
            // Banner-style skeleton
            <>
              <div className="w-8 h-8 bg-gray-300 rounded animate-pulse"></div>
              <div className="w-32 h-4 bg-gray-300 rounded animate-pulse"></div>
            </>
          ) : variant === 'compact' ? (
            // Compact skeleton
            <div className="w-24 h-3 bg-gray-300 rounded animate-pulse"></div>
          ) : (
            // Default skeleton with varied sizes
            <>
              <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse"></div>
              <div className="space-y-2">
                <div className="w-20 h-3 bg-gray-300 rounded animate-pulse"></div>
                <div className="w-16 h-3 bg-gray-300 rounded animate-pulse"></div>
              </div>
            </>
          )}
        </div>
        
        {/* Loading label */}
        {showLabel && (
          <div className="text-gray-400 text-xs text-center">
            {variant === 'compact' ? (
              <div className="w-12 h-2 bg-gray-300 rounded animate-pulse"></div>
            ) : (
              <div className="space-y-1">
                <div className="w-16 h-2 bg-gray-300 rounded animate-pulse mx-auto"></div>
                <div className="w-12 h-2 bg-gray-300 rounded animate-pulse mx-auto"></div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Subtle gradient overlay for depth */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 pointer-events-none"
        style={{
          background: animate ? 'linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.5) 50%, transparent 75%)' : 'none',
          backgroundSize: animate ? '200% 100%' : 'auto',
          animation: animate ? 'skeleton-shimmer 1.5s infinite' : 'none',
        }}
      />
      
      {/* CSS for shimmer animation */}
      <style jsx>{`
        @keyframes skeleton-shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        
        /* Respect user motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse {
            animation: none;
          }
          
          @keyframes skeleton-shimmer {
            0%, 100% {
              background-position: 0 0;
            }
          }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .bg-gray-100 {
            background-color: #374151;
          }
          
          .border-gray-200 {
            border-color: #4b5563;
          }
          
          .bg-gray-300 {
            background-color: #6b7280;
          }
          
          .text-gray-400 {
            color: #9ca3af;
          }
        }
      `}</style>
    </div>
  );
}
