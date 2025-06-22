'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

/**
 * Client-side script to initialize AdSense ads that are injected via HTML
 * This is needed for the middle ad that gets injected into the article content
 */
export default function AdSenseScript() {
  useEffect(() => {
    // Initialize AdSense for any ads that were injected via HTML
    const initializeInjectedAds = () => {
      try {
        // Find all AdSense ad units that haven't been initialized
        const ads = document.querySelectorAll('.adsbygoogle');
        ads.forEach((ad) => {
          if (!ad.hasAttribute('data-adsbygoogle-status')) {
            try {
              (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (err) {
              console.error('Error initializing injected AdSense ad:', err);
            }
          }
        });
      } catch (err) {
        console.error('Error finding injected ads:', err);
      }
    };

    // Wait a bit for the content to be fully rendered
    const timer = setTimeout(initializeInjectedAds, 1000);

    // Also try to initialize immediately
    initializeInjectedAds();

    return () => clearTimeout(timer);
  }, []);

  return null; // This component doesn't render anything
}