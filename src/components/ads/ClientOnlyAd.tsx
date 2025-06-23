'use client';

import { useEffect, useState, useRef } from 'react';

interface ClientOnlyAdProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  hydrationDelay?: number;
}

/**
 * Enhanced SSG-compatible client-only wrapper for ads
 * Features:
 * - Prevents hydration mismatches with proper client-side detection  
 * - Provides skeleton/fallback states during SSR and hydration
 * - Coordinates with AdSense script loading
 * - Optimized for Core Web Vitals and layout stability
 * - Handles three-phase loading: static → hydrated → ads loaded
 */
const ClientOnlyAd = ({ 
  children, 
  fallback = null,
  hydrationDelay = 0 
}: ClientOnlyAdProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const mountTimeRef = useRef<number>(0);

  // Track mounting and hydration
  useEffect(() => {
    mountTimeRef.current = Date.now();
    setIsMounted(true);
    
    // Allow for any specified hydration delay
    const hydrationTimer = setTimeout(() => {
      setIsHydrated(true);
    }, hydrationDelay);

    return () => clearTimeout(hydrationTimer);
  }, [hydrationDelay]);

  // During SSR, render fallback or nothing
  if (typeof window === 'undefined') {
    return <>{fallback}</>;
  }

  // During initial hydration, render fallback or nothing to prevent mismatches
  if (!isMounted || !isHydrated) {
    return <>{fallback}</>;
  }

  // After hydration, render the ad components
  // Note: AdSense readiness is checked within individual ad components
  return <>{children}</>;
};

export default ClientOnlyAd;
