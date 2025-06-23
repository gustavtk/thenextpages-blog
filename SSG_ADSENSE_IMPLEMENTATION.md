# SSG-Compatible AdSense Implementation Guide

## 🎯 Overview

This implementation provides a complete SSG-compatible AdSense solution with automatic collapse functionality for empty ad slots. It's designed specifically for Next.js Static Site Generation with proper hydration handling and Core Web Vitals optimization.

## 🚀 Features

- ✅ **SSG Compatible**: Works perfectly with `getStaticProps` and `getStaticPaths`
- ✅ **Hydration Safe**: No mismatches between server and client rendering
- ✅ **Auto Collapse**: Empty ad slots automatically collapse to prevent layout issues
- ✅ **Three-Phase Loading**: Static → Hydrated → Ads Loaded with smooth transitions
- ✅ **Core Web Vitals Optimized**: Prevents layout shifts (CLS)
- ✅ **Error Handling**: Graceful fallbacks and retry mechanisms
- ✅ **Performance**: Minimal impact on build times and runtime performance
- ✅ **Accessibility**: Screen reader friendly with proper ARIA labels

## 📁 File Structure

```
src/
├── components/
│   ├── ads/
│   │   ├── ClientOnlyAd.tsx          # Client-side wrapper
│   │   ├── AdSkeleton.tsx            # Loading placeholder
│   │   ├── AdErrorBoundary.tsx       # Error handling
│   │   ├── HeaderAd.tsx              # Header ad component
│   │   ├── FooterAd.tsx              # Footer ad component
│   │   └── MiddleAd.tsx              # Middle/content ad component
│   └── AdSenseLoader.tsx             # Main script loader
├── hooks/
│   └── useAdSenseWithCollapse.ts     # Core ad logic hook
├── lib/
│   └── adsenseUtils.ts               # Utility functions
└── styles/
    └── adsense.css                   # Ad-specific styles
```

## ⚙️ Configuration

### 1. Environment Variables

Update your `.env.local`:

```bash
# Required: Your AdSense Publisher ID
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-your-publisher-id

# Required: Individual ad unit IDs
NEXT_PUBLIC_ADSENSE_HEADER_AD=1234567890
NEXT_PUBLIC_ADSENSE_MIDDLE_AD=1234567891
NEXT_PUBLIC_ADSENSE_FOOTER_AD=1234567892

# Optional: Enable auto ads (default: false)
NEXT_PUBLIC_ADSENSE_AUTO_ADS=true
```

### 2. Import Styles

Add to your `globals.css` or import in layout:

```css
@import '../styles/adsense.css';
```

### 3. Update Layout

Your `layout.tsx` should include the AdSenseLoader:

```tsx
import AdSenseLoader from '@/components/AdSenseLoader';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Your existing head content */}
      </head>
      <body>
        <AdSenseLoader />
        {children}
      </body>
    </html>
  );
}
```

## 🔧 Usage Examples

### Basic Page with Ads

```tsx
// pages/blog/[slug].tsx or app/blog/[slug]/page.tsx
import HeaderAd from '@/components/ads/HeaderAd';
import FooterAd from '@/components/ads/FooterAd';
import MiddleAd from '@/components/ads/MiddleAd';
import AdErrorBoundary from '@/components/ads/AdErrorBoundary';

export default function BlogPost({ post }: { post: Post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.excerpt}</p>
      
      {/* Header ad after title */}
      <AdErrorBoundary adType="header">
        <HeaderAd />
      </AdErrorBoundary>
      
      <div>
        {/* First part of content */}
        {post.content.slice(0, post.content.length / 2)}
        
        {/* Middle ad injected in content */}
        <AdErrorBoundary adType="middle">
          <MiddleAd />
        </AdErrorBoundary>
        
        {/* Rest of content */}
        {post.content.slice(post.content.length / 2)}
      </div>
      
      {/* Footer ad before related posts */}
      <AdErrorBoundary adType="footer">
        <FooterAd />
      </AdErrorBoundary>
    </article>
  );
}

// SSG functions
export async function getStaticProps({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  
  return {
    props: { post },
    revalidate: 3600, // ISR: regenerate every hour
  };
}

export async function getStaticPaths() {
  const posts = await getAllPosts();
  
  return {
    paths: posts.map((post) => ({
      params: { slug: post.slug },
    })),
    fallback: 'blocking',
  };
}
```

### Custom Ad Component

```tsx
import { useAdSenseWithCollapse } from '@/hooks/useAdSenseWithCollapse';
import ClientOnlyAd from '@/components/ads/ClientOnlyAd';
import AdSkeleton from '@/components/ads/AdSkeleton';

function CustomAd({ adSlot, height = 250 }: { adSlot: string; height?: number }) {
  const { adRef, adState, retryAd } = useAdSenseWithCollapse({
    adSlot,
    adFormat: 'auto',
    fullWidthResponsive: true,
    collapseEmpty: true,
    timeoutMs: 5000,
  });

  if (adState.isCollapsed || adState.isEmpty) {
    return null;
  }

  return (
    <ClientOnlyAd>
      <div className="my-8">
        {adState.isLoading && <AdSkeleton height={height} />}
        
        {adState.hasError && (
          <div className="text-center py-4">
            <button onClick={retryAd}>Retry Ad</button>
          </div>
        )}
        
        <div ref={adRef} className={adState.isLoaded ? 'opacity-100' : 'opacity-0'}>
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
            data-ad-slot={adSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </ClientOnlyAd>
  );
}
```

## 🔍 Advanced Features

### 1. Conditional Ad Loading

```tsx
import { areAdsBlocked, validateAdConfig } from '@/lib/adsenseUtils';

function ConditionalAd() {
  const [showAd, setShowAd] = useState(false);
  
  useEffect(() => {
    areAdsBlocked().then(blocked => {
      if (!blocked && validateAdConfig({
        publisherId: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID,
        adSlot: process.env.NEXT_PUBLIC_ADSENSE_HEADER_AD,
      })) {
        setShowAd(true);
      }
    });
  }, []);
  
  if (!showAd) return null;
  
  return <HeaderAd />;
}
```

### 2. Performance Monitoring

```tsx
import { logAdMetrics } from '@/lib/adsenseUtils';

function MonitoredAd() {
  const startTime = useRef(Date.now());
  const { adRef, adState } = useAdSenseWithCollapse({
    adSlot: process.env.NEXT_PUBLIC_ADSENSE_HEADER_AD || '',
    collapseEmpty: true,
  });
  
  useEffect(() => {
    if (adState.isLoaded || adState.isEmpty || adState.hasError) {
      logAdMetrics('header', {
        loadTime: Date.now() - startTime.current,
        isEmpty: adState.isEmpty,
        hasError: adState.hasError,
      });
    }
  }, [adState]);
  
  // ... rest of component
}
```

## 🐛 Debugging

### Common Issues and Solutions

#### 1. Ads not showing after implementing collapse

```typescript
// Check browser console for these messages:
// "[AdSense] Page-level ads already initialized"
// "[AdSense] Script loading error"
// "Ad failed to load"

// Debugging steps:
console.log('Publisher ID:', process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID);
console.log('Ad Slot:', process.env.NEXT_PUBLIC_ADSENSE_HEADER_AD);
console.log('Auto Ads:', process.env.NEXT_PUBLIC_ADSENSE_AUTO_ADS);
```

#### 2. Hydration mismatches

```tsx
// Ensure you're using ClientOnlyAd wrapper:
<ClientOnlyAd>
  <HeaderAd />
</ClientOnlyAd>
```

#### 3. Layout shifts during loading

```css
/* Add to your CSS */
.ad-container {
  min-height: 100px; /* Reserve space */
  contain: layout style; /* Prevent layout thrashing */
}
```

### Development Mode Features

- Error boundaries show detailed error information
- Console logging for ad state changes
- Visual error notifications
- Retry functionality for failed ads

## 📊 Performance Optimization

### Core Web Vitals

- **CLS (Cumulative Layout Shift)**: Prevented by skeleton placeholders and reserved space
- **LCP (Largest Contentful Paint)**: Ads load after main content with `afterInteractive` strategy
- **FID (First Input Delay)**: Non-blocking ad loading

### Build Optimization

- Client-side only rendering prevents SSR overhead
- Dynamic imports for ad components
- Minimal impact on bundle size

## 🔒 Best Practices

1. **Always wrap ads in error boundaries**
2. **Use ClientOnlyAd for SSG compatibility**
3. **Implement proper loading states**
4. **Test with ad blockers enabled**
5. **Monitor ad performance metrics**
6. **Respect user preferences (reduced motion, etc.)**
7. **Follow Google AdSense policies**

## 🚀 Deployment Checklist

- [ ] Environment variables configured
- [ ] AdSense account approved
- [ ] Ad units created in AdSense dashboard
- [ ] Test on production domain (ads won't show on localhost)
- [ ] Verify no console errors
- [ ] Check Core Web Vitals scores
- [ ] Test with ad blockers
- [ ] Verify proper collapse behavior
- [ ] Test on mobile devices
- [ ] Monitor error rates

## 📈 Analytics Integration

```tsx
// Track ad performance
useEffect(() => {
  if (adState.isLoaded) {
    // Google Analytics 4
    gtag('event', 'ad_loaded', {
      ad_type: 'header',
      ad_slot: adSlot,
    });
  }
}, [adState.isLoaded]);
```

This implementation provides a robust, SSG-compatible AdSense solution that maintains excellent performance while providing smooth user experiences.
