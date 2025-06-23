'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

/**
 * SSG-compatible client-only wrapper that prevents hydration mismatches
 * This component ensures ads only render on the client side
 */
const ClientOnlyAd = ({ children }: { children: React.ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Only set mounted to true after hydration is complete
    setIsMounted(true);
  }, []);

  // During SSR and initial hydration, render nothing to prevent mismatches
  if (!isMounted) {
    return null;
  }

  // After hydration, render the ad components
  return <>{children}</>;
};

export default ClientOnlyAd;
