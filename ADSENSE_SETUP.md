# AdSense Implementation Guide

Your Next.js blog now has comprehensive AdSense integration with 4 different ad placements:

## 🎯 **Ad Placements**

### **1. Auto Ads** (Site-wide)
- **Location**: Automatically placed throughout your site by Google
- **Configuration**: Global script in `layout.tsx`
- **Control**: Managed via AdSense dashboard

### **2. Header Ad** (Manual)
- **Location**: After article title and meta information
- **Component**: `HeaderAd.tsx`
- **Size**: Responsive (auto-sizing)

### **3. Middle Ad** (Manual - Injected)
- **Location**: Automatically injected in the middle of article content
- **Component**: Injected via `contentParser.ts`
- **Logic**: Only appears in articles with 300+ words and 4+ paragraphs

### **4. Footer Ad** (Manual)
- **Location**: After main article content, before related posts
- **Component**: `FooterAd.tsx`
- **Style**: Bordered section with "Advertisement" label

## ⚙️ **Configuration Steps**

### **1. Update Environment Variables**
Edit `.env.local` with your actual AdSense codes:

```bash
# Replace these with your actual values
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-5463575648472899
NEXT_PUBLIC_ADSENSE_HEADER_AD=3157557015
NEXT_PUBLIC_ADSENSE_MIDDLE_AD=6438590929
NEXT_PUBLIC_ADSENSE_FOOTER_AD=2965985329
NEXT_PUBLIC_ADSENSE_AUTO_ADS=true
```

### **2. Get Your AdSense Codes**
From your Google AdSense dashboard:

1. **Publisher ID**: Found in Account → Account Information
2. **Ad Unit IDs**: Create 3 ad units for Header, Middle, and Footer
3. **Auto Ads**: Enable in Sites → Your Site → Auto Ads

### **3. Test Your Implementation**
1. Deploy your site to production (ads won't show on localhost)
2. Check browser console for any AdSense errors
3. Use AdSense dashboard to monitor ad performance

## 🚀 **Features**

### **Smart Middle Ad Injection**
- Automatically finds optimal insertion point in article content
- Only injects in substantial articles (300+ words)
- Maintains content readability

### **SSG Compatibility**
- All ads work with your static site generation
- Content with ads is pre-rendered at build time
- Fast loading with proper ad initialization

### **Error Handling**
- Graceful fallbacks if ads fail to load
- Console logging for debugging
- Won't break your site if AdSense is unavailable

### **Performance Optimized**
- Ads load after content (`afterInteractive` strategy)
- Maintains excellent Core Web Vitals scores
- Responsive design for all screen sizes

## 📱 **Ad Layouts**

### **Desktop Layout**
```
[Header/Navigation]
[Article Title & Meta]
[Header Ad] ← 728x90 or responsive
[Article Content]
    [Middle Ad] ← Injected automatically
[Article Content continues]
[Footer Ad] ← 728x90 or responsive
[Related Posts]
[Footer]
```

### **Mobile Layout**
```
[Header/Navigation]
[Article Title & Meta]
[Header Ad] ← 320x50 or responsive
[Article Content]
    [Middle Ad] ← 320x250 or responsive
[Article Content continues]
[Footer Ad] ← 320x50 or responsive
[Related Posts]
[Footer]
```

## 🎨 **Styling**

All ads are properly styled with:
- Responsive design
- "Advertisement" labels where appropriate
- Proper spacing and borders
- Dark mode compatibility

## 🔧 **Customization**

### **To modify ad sizes:**
Edit the respective component files in `src/components/ads/`

### **To change injection logic:**
Modify `src/lib/contentParser.ts`

### **To disable specific ads:**
Set the corresponding environment variable to empty or false

## ✅ **Verification Checklist**

- [ ] Publisher ID updated in `.env.local`
- [ ] All 3 ad unit IDs configured
- [ ] Auto ads enabled in AdSense dashboard
- [ ] Site deployed to production
- [ ] Ads appearing correctly on live site
- [ ] No console errors related to AdSense
- [ ] Mobile responsiveness tested

## 💰 **Revenue Optimization Tips**

1. **Monitor Performance**: Use AdSense reports to track best-performing ad positions
2. **A/B Testing**: Try different ad sizes and positions
3. **Content Quality**: High-quality content = better ad performance
4. **Page Speed**: Keep your excellent Core Web Vitals scores
5. **User Experience**: Don't overload pages with ads

Your blog is now fully optimized for maximum AdSense revenue! 🎯