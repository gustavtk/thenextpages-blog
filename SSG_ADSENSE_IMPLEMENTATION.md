# SSG-Compatible AdSense Implementation with Collapse Functionality

## Overview

This document provides a comprehensive guide for implementing Google AdSense with collapse functionality in a Next.js SSG (Static Site Generation) application. The implementation addresses the unique challenges of SSG environments where ads must load client-side after static page generation.

## Key Features

✅ **SSG-Compatible**: Handles three-phase loading (static → hydrated → ads loaded)  
✅ **Collapse Functionality**: Automatically collapses empty/unfilled ad slots  
✅ **Hydration Safe**: Prevents mismatches between server and client  
✅ **Performance Optimized**: Minimizes layout shifts and improves Core Web Vitals  
✅ **Error Recovery**: Robust error handling with retry mechanisms  
✅ **Accessibility**: ARIA labels and proper semantic markup  
✅ **TypeScript**: Full type safety throughout  

## Architecture

### Three-Phase Loading Process

1. **Static Phase**: Server renders skeleton/placeholder
2. **Hydration Phase**: Client takes over, starts AdSense initialization
3. **Ads Loaded Phase**: Ads display or collapse if empty

### Core Components

- `useAdSenseWithCollapse` - Enhanced hook with timing coordination
- `AdSenseLoader` - Script loader with retry logic
- `ClientOnlyAd` - SSG-safe wrapper component
- `AdSkeleton` - Loading placeholder component
- Individual ad components (HeaderAd, MiddleAd, FooterAd)

## Installation & Setup

### 1. Environment Variables

Add to your `.env.local`:

```bash
# Required
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-xxxxxxxxxx

# Ad unit slots
NEXT_PUBLIC_ADSENSE_HEADER_AD=1234567890
NEXT_PUBLIC_ADSENSE_MIDDLE_AD=1234567891
NEXT_PUBLIC_ADSENSE_FOOTER_AD=1234567892

# Optional: Enable auto ads
NEXT_PUBLIC_ADSENSE_AUTO_ADS=true
```

### 2. Layout Integration

Update your `app/layout.tsx`:

```tsx
import AdSenseLoader from "@/components/AdSenseLoader";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Your existing head content */}
      </head>
      <body suppressHydrationWarning={true}>
        {/* Load AdSense script */}
        <AdSenseLoader />
        
        {/* Auto Ads optimization wrapper */}
        <div data-ad-layout="in-article" data-ad-format="auto" data-full-width-responsive="true">
          {children}
        </div>
      </body>
    </html>
  );
}
```

## Usage Examples

### Basic Ad Implementation

```tsx
import HeaderAd from '@/components/ads/HeaderAd';
import MiddleAd from '@/components/ads/MiddleAd';
import FooterAd from '@/components/ads/FooterAd';

export default function ArticlePage() {
  return (
    <main>
      <HeaderAd />
      
      <article>
        <h1>Article Title</h1>
        <p>Article content...</p>
        
        {/* Ad will automatically collapse if empty */}
        <MiddleAd />
        
        <p>More content...</p>
      </article>
      
      <FooterAd />
    </main>
  );
}
```

### Custom Ad Component

```tsx
'use client';

import { useAdSenseWithCollapse } from '@/hooks/useAdSenseWithCollapse';
import ClientOnlyAd from '@/components/ads/ClientOnlyAd';
import AdSkeleton from '@/components/ads/AdSkeleton';

function CustomAdContent() {
  const { adRef, adState, retryAd } = useAdSenseWithCollapse({
    adSlot: 'YOUR_AD_SLOT_ID',
    adFormat: 'auto',
    fullWidthResponsive: true,
    collapseEmpty: true,
    timeoutMs: 8000,
    retryCount: 2,
  });

  // Collapse if empty
  if (adState.isCollapsed || adState.isEmpty) {
    return null;
  }

  return (
    <div className="my-4">
      {adState.isLoading && <AdSkeleton height={200} />}
      
      {adState.hasError && (
        <div className="text-center py-4">
          <p>Ad failed to load</p>
          <button onClick={retryAd}>Retry</button>
        </div>
      )}
      
      <div ref={adRef}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
          data-ad-slot="YOUR_AD_SLOT_ID"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}

export default function CustomAd() {
  const fallback = <AdSkeleton height={200} animate={false} />;
  
  return (
    <ClientOnlyAd fallback={fallback}>
      <CustomAdContent />
    </ClientOnlyAd>
  );
}
```

### SSG Page with getStaticProps

```tsx
import { GetStaticProps } from 'next';
import HeaderAd from '@/components/ads/HeaderAd';

interface ArticlePageProps {
  article: {
    title: string;
    content: string;
  };
}

export default function ArticlePage({ article }: ArticlePageProps) {
  return (
    <main>
      {/* Ad loads client-side after SSG */}
      <HeaderAd />
      
      <article>
        <h1>{article.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </article>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // Fetch your data
  const article = await fetchArticle(params?.slug as string);
  
  return {
    props: {
      article,
    },
    revalidate: 3600, // ISR: regenerate every hour
  };
};

export const getStaticPaths = async () => {
  const articles = await fetchAllArticles();
  
  return {
    paths: articles.map((article) => ({
      params: { slug: article.slug },
    })),
    fallback: 'blocking',
  };
};
```

## Configuration Options

### Hook Configuration

```tsx
const { adRef, adState, retryAd } = useAdSenseWithCollapse({
  adSlot: string;                    // Required: AdSense ad slot ID
  adFormat?: string;                 // Default: 'auto'
  fullWidthResponsive?: boolean;     // Default: true
  collapseEmpty?: boolean;           // Default: true
  timeoutMs?: number;                // Default: 8000ms
  retryCount?: number;               // Default: 2
});
```

### Ad States

```tsx
interface AdState {
  isLoading: boolean;     // Currently loading
  isLoaded: boolean;      // Successfully loaded
  isEmpty: boolean;       // Detected as empty/unfilled
  hasError: boolean;      // Error occurred
  isCollapsed: boolean;   // Collapsed due to empty state
  isHydrated: boolean;    // Client-side hydration complete
  loadAttempts: number;   // Number of load attempts
}
```

### Skeleton Variants

```tsx
<AdSkeleton
  height={100}              // Height in pixels
  width="100%"              // Width (string or number)
  showLabel={true}          // Show loading label
  variant="default"         // 'default' | 'compact' | 'banner'
  animate={true}            // Enable animation
  className=""              // Additional CSS classes
/>
```

## Best Practices

### 1. Performance Optimization

```tsx
// Use different timeouts based on ad placement
const headerTimeout = 8000;   // Above fold - faster timeout
const middleTimeout = 10000;  // In content - longer timeout
const footerTimeout = 12000;  // Below fold - longest timeout
```

### 2. Error Handling

```tsx
// Monitor ad performance
import { logAdMetrics, handleAdError } from '@/lib/adsenseUtils';

// Custom error handling
const handleCustomError = (error: Error, adType: string) => {
  console.error(`Ad error in ${adType}:`, error);
  
  // Send to analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', 'ad_error', {
      ad_type: adType,
      error_message: error.message,
    });
  }
};
```

### 3. Testing

```tsx
// Development mode testing
if (process.env.NODE_ENV === 'development') {
  // Use test ads
  data-adtest="on"
  
  // Enable debug logging
  console.log('[AdSense Debug]', adState);
}
```

### 4. Core Web Vitals Optimization

```tsx
// Prevent layout shifts
<div style={{
  contain: 'layout style size',  // CSS containment
  isolation: 'isolate',         // Create new stacking context
  minHeight: '100px',           // Reserve space
}}>
  {/* Ad content */}
</div>
```

## Troubleshooting

### Common Issues

#### 1. Ads Not Displaying

**Symptoms**: Ads show loading skeleton but never display
**Solutions**:
- Check environment variables are set correctly
- Verify ad slot IDs in AdSense dashboard
- Ensure AdSense account is approved
- Check browser console for script loading errors

#### 2. Hydration Mismatches

**Symptoms**: Console warnings about hydration mismatches
**Solutions**:
- Ensure `ClientOnlyAd` wrapper is used
- Add `suppressHydrationWarning={true}` to body tag
- Check that fallback states match between server and client

#### 3. Layout Shifts

**Symptoms**: Content jumps when ads load/collapse
**Solutions**:
- Use proper skeleton placeholders
- Set appropriate `minHeight` values
- Implement CSS containment
- Test with slow network connections

#### 4. Ad Blockers

**Symptoms**: Ads never load on some users' browsers
**Solutions**:
- Implement ad blocker detection
- Provide fallback content
- Monitor ad fill rates

### Debug Tools

#### Development Indicators

The implementation includes visual debug indicators in development mode:

- **Green indicator**: AdSense script loaded successfully
- **Red indicator**: Script loading failed with retry information
- **Console logs**: Detailed loading progression

#### Performance Monitoring

```tsx
// Add performance monitoring
const startTime = performance.now();

// After ad loads
const loadTime = performance.now() - startTime;
console.log(`Ad loaded in ${loadTime}ms`);
```

## Advanced Features

### 1. Custom Empty Detection

```tsx
// Extend empty ad detection
const customDetectEmpty = (element: Element) => {
  const insElement = element.querySelector('ins.adsbygoogle');
  if (!insElement) return true;
  
  // Custom detection logic
  return insElement.clientHeight <= 1 || 
         insElement.getAttribute('data-ad-status') === 'unfilled';
};
```

### 2. A/B Testing

```tsx
// Test different ad configurations
const adConfig = Math.random() > 0.5 ? {
  timeoutMs: 8000,
  collapseEmpty: true,
} : {
  timeoutMs: 12000,
  collapseEmpty: false,
};
```

### 3. Ad Refresh

```tsx
// Refresh ads on navigation
import { refreshAd } from '@/lib/adsenseUtils';

const handleRefresh = async () => {
  const success = await refreshAd(adRef.current);
  if (!success) {
    console.warn('Ad refresh failed');
  }
};
```

## Migration Guide

### From Previous Implementation

1. **Update Hook Usage**:
   ```tsx
   // Old
   const { adRef, adState } = useAdSenseWithCollapse(config);
   
   // New
   const { adRef, adState, retryAd } = useAdSenseWithCollapse(config);
   ```

2. **Add Fallback Props**:
   ```tsx
   // Old
   <ClientOnlyAd>
     <AdContent />
   </ClientOnlyAd>
   
   // New
   <ClientOnlyAd fallback={<AdSkeleton />}>
     <AdContent />
   </ClientOnlyAd>
   ```

3. **Update Error Handling**:
   ```tsx
   // Add retry functionality
   {adState.hasError && (
     <button onClick={retryAd}>Retry</button>
   )}
   ```

## Production Checklist

- [ ] Environment variables configured
- [ ] AdSense account approved and active
- [ ] Ad slot IDs created in AdSense dashboard
- [ ] `ads.txt` file added to domain root
- [ ] Performance testing completed
- [ ] Core Web Vitals scores acceptable
- [ ] Cross-browser testing completed
- [ ] Error monitoring implemented
- [ ] Analytics tracking configured

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review browser console for errors
3. Test with AdSense test ads first
4. Verify network requests in DevTools

## Changelog

### v2.0.0 (Current)
- Enhanced SSG compatibility
- Improved collapse detection
- Added retry mechanisms
- Better error handling
- Accessibility improvements
- Performance optimizations

### v1.0.0 (Previous)
- Basic AdSense integration
- Simple collapse functionality
