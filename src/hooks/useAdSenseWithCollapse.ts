'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export interface AdSenseConfig {
  adSlot: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
  collapseEmpty?: boolean;
  timeoutMs?: number;
}

export interface AdState {
  isLoading: boolean;
  isLoaded: boolean;
  isEmpty: boolean;
  hasError: boolean;
  isCollapsed: boolean;
}

/**
 * SSG-compatible hook for AdSense with collapse functionality
 * Handles the three-phase loading: static → hydrated → ads loaded
 */
export function useAdSenseWithCollapse(config: AdSenseConfig) {
  const adRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [adState, setAdState] = useState<AdState>({
    isLoading: true,
    isLoaded: false,
    isEmpty: false,
    hasError: false,
    isCollapsed: false,
  });

  const [adPushed, setAdPushed] = useState(false);

  // Clean up observers and timeouts
  const cleanup = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Check if ad is empty/unfilled
  const checkAdStatus = useCallback(() => {
    const adElement = adRef.current;
    if (!adElement) return;

    const insElement = adElement.querySelector('ins.adsbygoogle');
    if (!insElement) return;

    // Multiple ways to detect empty ads
    const isEmpty = 
      // No child elements
      insElement.children.length === 0 ||
      // AdSense adds data-ad-status when empty
      insElement.getAttribute('data-ad-status') === 'unfilled' ||
      // Check for specific empty ad content
      insElement.innerHTML.trim() === '' ||
      // Height-based detection (common for empty ads)
      insElement.clientHeight <= 1 ||
      // Check for Google's empty ad indicators
      insElement.querySelector('[data-ad-status="unfilled"]') !== null;

    const isLoaded = !isEmpty && insElement.children.length > 0;

    if (isEmpty && config.collapseEmpty) {
      setAdState(prev => ({
        ...prev,
        isLoading: false,
        isLoaded: false,
        isEmpty: true,
        isCollapsed: true,
      }));
      cleanup();
    } else if (isLoaded) {
      setAdState(prev => ({
        ...prev,
        isLoading: false,
        isLoaded: true,
        isEmpty: false,
        isCollapsed: false,
      }));
      cleanup();
    }
  }, [config.collapseEmpty, cleanup]);

  // Set up mutation observer to watch for ad changes
  const setupObserver = useCallback(() => {
    const adElement = adRef.current;
    if (!adElement) return;

    const insElement = adElement.querySelector('ins.adsbygoogle');
    if (!insElement) return;

    // Observe changes to the ad element
    observerRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'childList' ||
          mutation.type === 'attributes' ||
          mutation.type === 'characterData'
        ) {
          // Small delay to allow AdSense to fully render
          setTimeout(checkAdStatus, 100);
        }
      });
    });

    observerRef.current.observe(insElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-ad-status', 'style'],
      characterData: true,
    });
  }, [checkAdStatus]);

  // Initialize AdSense
  useEffect(() => {
    if (!adPushed && typeof window !== 'undefined') {
      try {
        setAdPushed(true);
        
        // Push ad to AdSense queue
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        
        // Set up observer after a small delay
        setTimeout(setupObserver, 500);
        
        // Set timeout for empty ad detection
        if (config.timeoutMs) {
          timeoutRef.current = setTimeout(() => {
            checkAdStatus();
            // If still loading after timeout, consider it empty
            setAdState(prev => {
              if (prev.isLoading) {
                return {
                  ...prev,
                  isLoading: false,
                  isEmpty: true,
                  isCollapsed: config.collapseEmpty || false,
                };
              }
              return prev;
            });
          }, config.timeoutMs);
        }
        
      } catch (err) {
        console.error('AdSense error:', err);
        setAdState(prev => ({
          ...prev,
          isLoading: false,
          hasError: true,
          isCollapsed: config.collapseEmpty || false,
        }));
        setAdPushed(false);
      }
    }
  }, [adPushed, config.timeoutMs, config.collapseEmpty, setupObserver, checkAdStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    adRef,
    adState,
    retryAd: () => {
      setAdPushed(false);
      setAdState({
        isLoading: true,
        isLoaded: false,
        isEmpty: false,
        hasError: false,
        isCollapsed: false,
      });
    },
  };
}
