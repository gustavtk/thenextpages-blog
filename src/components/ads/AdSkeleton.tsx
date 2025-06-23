'use client';

/**
 * Skeleton placeholder for ad slots during loading
 * Helps prevent layout shifts during the static → hydrated → ads loaded transition
 */
export default function AdSkeleton({ 
  height = 100, 
  showLabel = true,
  className = "" 
}: { 
  height?: number;
  showLabel?: boolean;
  className?: string;
}) {
  return (
    <div 
      className={`w-full bg-gray-100 border border-gray-200 rounded-md animate-pulse ${className}`}
      style={{ minHeight: height }}
      aria-label="Advertisement loading"
    >
      <div className="flex items-center justify-center h-full">
        {showLabel && (
          <div className="text-gray-400 text-sm">
            <div className="w-20 h-4 bg-gray-300 rounded animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
}
