'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { waitForAdSense, detectEmptyAd, logAdMetrics, handleAdError } from '@/lib/adsenseUtils';

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
  retryCount?: number;
}

export interface AdState {
  isLoading: boolean;
  isLoaded: boolean;
  isEmpty: boolean;
  hasError: boolean;
  isCollapsed: boolean;
  isHydrated: boolean;
  loadAttempts: number;
}

/**
 * Enhanced SSG-compatible hook for AdSense with robust collapse functionality
 * Handles the three-phase loading: static → hydrated → ads loaded
 * Features proper timing coordination and enhanced error recovery
 */
export function useAdSenseWithCollapse(config: AdSenseConfig) {
  const adRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);
  const startTimeRef = useRef<number>(0);
  
  const [adState, setAdState] = useState<AdState>({
    isLoading: false, // Start as false for SSG
    isLoaded: false,
    isEmpty: false,
    hasError: false,
    isCollapsed: false,
    isHydrated: false,
    loadAttempts: 0,
  });

  // Clean up all observers, timeouts, and intervals
  const cleanup = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
  }, []);

  // Enhanced empty ad detection with multiple methods
  const checkAdStatus = useCallback(() => {
    const adElement = adRef.current;
    if (!adElement) return false;

    const adInfo = detectEmptyAd(adElement);
    
    if (adInfo.isEmpty && config.collapseEmpty) {
      setAdState(prev => ({
        ...prev,
        isLoading: false,
        isLoaded: false,
        isEmpty: true,
        isCollapsed: true,
      }));
      
      // Log metrics for empty ad
      logAdMetrics('empty_ad', {
        isEmpty: true,
        loadTime: Date.now() - startTimeRef.current,
      });
      
      cleanup();
      return true;
    } else if (adInfo.isLoaded) {
      setAdState(prev => ({
        ...prev,
        isLoading: false,
        isLoaded: true,
        isEmpty: false,
        isCollapsed: false,
      }));
      
      // Log successful load metrics
      logAdMetrics('successful_load', {
        isEmpty: false,
        loadTime: Date.now() - startTimeRef.current,
      });
      
      cleanup();
      return true;
    } else if (adInfo.hasError) {
      setAdState(prev => ({
        ...prev,
        isLoading: false,
        hasError: true,
        isCollapsed: config.collapseEmpty || false,
      }));
      cleanup();
      return true;
    }
    
    return false;
  }, [config.collapseEmpty, cleanup]);

  // Set up enhanced mutation observer with better detection
  const setupObserver = useCallback(() => {
    const adElement = adRef.current;
    if (!adElement) return;

    const insElement = adElement.querySelector('ins.adsbygoogle');
    if (!insElement) return;

    // Enhanced mutation observer
    observerRef.current = new MutationObserver((mutations) => {
      let shouldCheck = false;
      
      mutations.forEach((mutation) => {
        // Check for various types of changes that indicate ad loading
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldCheck = true;
        }
        if (mutation.type === 'attributes') {
          const attributeName = mutation.attributeName;
          if (attributeName === 'data-ad-status' || 
              attributeName === 'style' || 
              attributeName === 'class') {
            shouldCheck = true;
          }
        }
      });
      
      if (shouldCheck) {
        // Small delay to allow AdSense to complete rendering
        setTimeout(() => {
          checkAdStatus();
        }, 200);
      }
    });

    observerRef.current.observe(insElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-ad-status', 'style', 'class', 'data-adsbygoogle-status'],
      characterData: true,
    });

    // Also observe the parent container for size changes
    observerRef.current.observe(adElement, {
      attributes: true,
      attributeFilter: ['style', 'class'],
    });
  }, [checkAdStatus]);

  // Periodic check for ad status (fallback mechanism)
  const setupPeriodicCheck = useCallback(() => {
    let attempts = 0;
    const maxAttempts = 20; // Check for up to 10 seconds (20 * 500ms)
    
    checkIntervalRef.current = setInterval(() => {
      attempts++;
      
      const statusChanged = checkAdStatus();
      
      if (statusChanged || attempts >= maxAttempts) {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
        
        // If we've reached max attempts without detection, consider it empty
        if (!statusChanged && attempts >= maxAttempts) {
          setAdState(prev => ({
            ...prev,
            isLoading: false,
            isEmpty: true,
            isCollapsed: config.collapseEmpty || false,
          }));
          
          logAdMetrics('timeout', {
            isEmpty: true,
            loadTime: Date.now() - startTimeRef.current,
          });
        }
      }
    }, 500);
  }, [checkAdStatus, config.collapseEmpty]);

  // Initialize AdSense ad with proper timing coordination
  const initializeAd = useCallback(async () => {
    if (isInitializedRef.current || !adRef.current) return;
    
    try {
      startTimeRef.current = Date.now();
      isInitializedRef.current = true;
      
      setAdState(prev => ({
        ...prev,
        isLoading: true,
        loadAttempts: prev.loadAttempts + 1,
      }));

      // Wait for AdSense script to be ready
      const isAdSenseReady = await waitForAdSense(10000);
      
      if (!isAdSenseReady) {
        throw new Error('AdSense script not ready');
      }

      // Ensure the ins element exists before pushing
      const insElement = adRef.current?.querySelector('ins.adsbygoogle');
      if (!insElement) {
        throw new Error('AdSense ins element not found');
      }

      // Push to AdSense queue
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      
      // Set up monitoring after a brief delay
      setTimeout(() => {
        setupObserver();
        setupPeriodicCheck();
      }, 1000);
      
      // Set overall timeout
      if (config.timeoutMs) {
        timeoutRef.current = setTimeout(() => {
          const finalCheck = checkAdStatus();
          if (!finalCheck) {
            setAdState(prev => ({
              ...prev,
              isLoading: false,
              isEmpty: true,
              isCollapsed: config.collapseEmpty || false,
            }));
            
            logAdMetrics('final_timeout', {
              isEmpty: true,
              loadTime: Date.now() - startTimeRef.current,
            });
          }
          cleanup();
        }, config.timeoutMs);
      }
      
    } catch (error) {
      console.error('AdSense initialization error:', error);
      handleAdError(error as Error, 'initialization');
      
      setAdState(prev => ({
        ...prev,
        isLoading: false,
        hasError: true,
        isCollapsed: config.collapseEmpty || false,
      }));
      
      isInitializedRef.current = false;
      cleanup();
    }
  }, [config.timeoutMs, config.collapseEmpty, setupObserver, setupPeriodicCheck, checkAdStatus, cleanup]);

  // Handle hydration and component mounting
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAdState(prev => ({ ...prev, isHydrated: true }));
      
      // Small delay to ensure DOM is ready after hydration
      const initTimer = setTimeout(() => {
        initializeAd();
      }, 100);
      
      return () => clearTimeout(initTimer);
    }
  }, [initializeAd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      isInitializedRef.current = false;
    };
  }, [cleanup]);

  // Retry function with enhanced error recovery
  const retryAd = useCallback(() => {
    if (adState.loadAttempts >= (config.retryCount || 3)) {
      console.warn('Max retry attempts reached for ad');
      return;
    }
    
    cleanup();
    isInitializedRef.current = false;
    
    setAdState({
      isLoading: false,
      isLoaded: false,
      isEmpty: false,
      hasError: false,
      isCollapsed: false,
      isHydrated: true,
      loadAttempts: 0,
    });
    
    // Retry after a brief delay
    setTimeout(() => {
      initializeAd();
    }, 1000);
  }, [adState.loadAttempts, config.retryCount, cleanup, initializeAd]);

  return {
    adRef,
    adState,
    retryAd,
  };
}
