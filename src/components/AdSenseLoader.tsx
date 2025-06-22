'use client';

import Script from 'next/script';

export default function AdSenseLoader() {
  // Don't render if no publisher ID or auto ads disabled
  if (process.env.NEXT_PUBLIC_ADSENSE_AUTO_ADS !== 'true' || !process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID) {
    return null;
  }

  return (
    <>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
        onLoad={() => {
          // Configure Auto Ads for optimal responsive behavior
          if (typeof window !== 'undefined' && (window as Window & { adsbygoogle?: unknown[] }).adsbygoogle) {
            ((window as Window & { adsbygoogle: unknown[] }).adsbygoogle).push({
              google_ad_client: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID,
              enable_page_level_ads: true,
              page_level_ad_config: {
                // Mobile configuration
                mobile: {
                  // Limit ad density on mobile for better UX
                  ads_density: "low",
                  // Ensure proper spacing
                  page_level_ad_types: ["anchor", "in_article"],
                  // Disable vignette ads that can be intrusive
                  page_level_ad_config: {
                    vignette: { disabled: true },
                    anchor: { 
                      enabled: true,
                      number_of_ads: 1 
                    }
                  }
                },
                // Desktop configuration  
                desktop: {
                  ads_density: "medium",
                  page_level_ad_types: ["anchor", "in_article", "matched_content"]
                },
                // Global settings
                overlays: {
                  bottom: true,
                  top: false // Prevent header interference
                },
                // Responsive behavior
                responsive: {
                  // Ensure ads adapt to container width
                  enabled: true,
                  // Maintain aspect ratios
                  maintain_aspect_ratio: true
                },
                // Performance optimizations
                loading: {
                  // Lazy load ads when near viewport
                  lazy: true,
                  // Delay to prevent render blocking
                  delay: 200
                }
              }
            });
          }
        }}
      />
      
      {/* Auto Ads placeholder - helps with ad placement detection */}
      <meta name="google-adsense-platform-account" content={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID} />
      <meta name="google-adsense-platform-domain" content={typeof window !== 'undefined' ? window.location.hostname : 'thenextpages.com'} />
    </>
  );
}