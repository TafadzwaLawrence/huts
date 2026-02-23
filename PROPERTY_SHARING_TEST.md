# Property Sharing Quick Test Guide

## Test This Specific Property
https://www.huts.co.zw/property/the-sterling-ridge-estate-66a44a26

## What Was Improved

### 1. Enhanced Social Metadata
- ✅ **Explicit OG Image**: Custom-generated image (1200×630) instead of raw property photo
- ✅ **Beautiful Fallback**: Properties WITHOUT photos now show a stunning branded design (gradient background, professional typography)
- ✅ **Platform-Specific Tags**: Pinterest, WhatsApp, and article metadata
- ✅ **Better Descriptions**: Optimized for each platform's character limits
- ✅ **Article Tags**: Published time, modified time, tags for Facebook
- ✅ **Square Feet Added**: Now shows in OG image when available

### 2. Social Share Buttons
- ✅ **New Component**: One-click sharing to Facebook, Twitter, LinkedIn, WhatsApp
- ✅ **Native Share API**: Uses device share sheet on mobile
- ✅ **Copy Link**: Easy clipboard copy with confirmation
- ✅ **Better UX**: Dropdown menu with platform icons

### 3. Structured Data
- ✅ **Property Schema**: Rich data for Google search results
- ✅ **Breadcrumbs**: Navigation hierarchy
- ✅ **Organization**: Brand information

---

## Quick Test Steps

### 1. Facebook Test (1 minute)
1. Go to: https://developers.facebook.com/tools/debug/
2. Paste: `https://www.huts.co.zw/property/the-sterling-ridge-estate-66a44a26`
3. Click **Debug**
4. Click **Scrape Again** to refresh cache

**What you should see:**
- ✅ Custom OG image with property photo + price overlay + "HUTS" branding
- ✅ Title: "[Property Name] | Huts"
- ✅ Description with beds, baths, city, price
- ✅ No missing tag warnings

### 2. Twitter Test (30 seconds)
1. Go to: https://cards-dev.twitter.com/validator
2. Paste: `https://www.huts.co.zw/property/the-sterling-ridge-estate-66a44a26`
3. Click **Preview card**

**What you should see:**
- ✅ Summary card with large image
- ✅ Property photo with price and Huts branding
- ✅ Description under 200 characters

### 3. WhatsApp Test (Real Device)
1. Open WhatsApp on your phone
2. Send the link to yourself or a friend
3. Wait for preview to load

**What you should see:**
- ✅ Property image appears
- ✅ Title and description visible
- ✅ Tappable link preview

### 4. LinkedIn Test (30 seconds)
1. Go to: https://www.linkedin.com/post-inspector/
2. Paste: `https://www.huts.co.zw/property/the-sterling-ridge-estate-66a44a26`
3. Click **Inspect**

**What you should see:**
- ✅ Professional preview with OG image
- ✅ Complete title and description
- ✅ Proper formatting

### 5. On-Page Share Buttons
1. Visit: https://www.huts.co.zw/property/the-sterling-ridge-estate-66a44a26
2. Look for **Share** button in top-right
3. Click it

**Desktop:**
- ✅ Dropdown appears with Facebook, Twitter, LinkedIn, WhatsApp, Copy Link options
- ✅ Each platform opens in new tab with pre-filled content
- ✅ Copy Link shows "Copied!" confirmation

**Mobile:**
- ✅ Native share sheet opens (if supported)
- ✅ Fallback to dropdown if not supported
- ✅ All major apps appear in share options

---

## 🎨 Share Preview Examples

### Property WITH Photo
When a property has images, the share preview shows:
```
┌─────────────────────────────────────────┐
│ [Beautiful Property Photo]               │
│ + Price Badge: "$800/mo"                 │
│ + "HUTS" Logo (top-right)               │
├─────────────────────────────────────────┤
│ The Sterling Ridge Estate | Huts        │
│ For Rent: 3 bed, 2 bath house in       │
│ Harare, Zimbabwe. $800/month.           │
└─────────────────────────────────────────┘
```

### Property WITHOUT Photo (NEW IMPROVEMENT!)
**No more ugly gray boxes!** Properties without photos get a stunning branded design:
```
┌─────────────────────────────────────────┐
│ [Gradient: Charcoal → Black]            │
│ + Subtle Patterns & Radial Highlights   │
│ + "HUTS" Logo (top-right)               │
│                                         │
│   FOR RENT                              │
│   ┌──────────────┐                      │
│   │  $1.2K/mo    │  ← Large Price      │
│   └──────────────┘                      │
│                                         │
│   15 Roomed Lodge  ← Bold Title        │
│   Harare, Zimbabwe • 15 bed • 10 bath  │
└─────────────────────────────────────────┘
```

**Features of the fallback design:**
- ✅ Professional gradient background (charcoal to black)
- ✅ Subtle decorative patterns and radial glows
- ✅ Extra-large price display with shadow
- ✅ Prominent property title (52px instead of 48px)
- ✅ All details in crisp white text
- ✅ Huts branding always visible
- ✅ Share-worthy design landlords will be proud of!

**Test this design:**
- https://www.huts.co.zw/property/15-roomed-lodge-075cfda8

---

## Sample Share Previews

### Facebook
```
┌─────────────────────────────────────────┐
│ [Property Photo with Price Overlay]     │
│ + HUTS Logo                             │
├─────────────────────────────────────────┤
│ The Sterling Ridge Estate | Huts        │
│ For Rent: 3 bed, 2 bath house in       │
│ Harare, Zimbabwe. $800/month.           │
│ huts.co.zw                              │
└─────────────────────────────────────────┘
```

### Twitter
```
┌─────────────────────────────────────────┐
│ [Property Photo]                         │
├─────────────────────────────────────────┤
│ The Sterling Ridge Estate | Huts        │
│ For Rent: 3 bed, 2 bath in Harare.     │
│ $800/month                              │
│ 🔗 huts.co.zw                           │
└─────────────────────────────────────────┘
```

### WhatsApp
```
┌──────────────────────────────┐
│ [Property Thumbnail]         │
│ The Sterling Ridge Estate    │
│ For Rent: 3 bed, 2 bath...  │
│ huts.co.zw                   │
└──────────────────────────────┘
```

---

## Metadata Added

### Open Graph (Facebook, LinkedIn, WhatsApp)
```html
<meta property="og:title" content="The Sterling Ridge Estate | Huts" />
<meta property="og:description" content="For Rent: 3 bed, 2 bath house in Harare, Zimbabwe. $800/month." />
<meta property="og:image" content="https://www.huts.co.zw/property/.../opengraph-image" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:type" content="article" />
<meta property="og:url" content="https://www.huts.co.zw/property/..." />
<meta property="og:site_name" content="Huts" />
<meta property="og:locale" content="en_ZW" />
<meta property="article:published_time" content="..." />
<meta property="article:modified_time" content="..." />
<meta property="article:section" content="Properties for Rent" />
<meta property="article:tag" content="Harare" />
<meta property="article:tag" content="3 bedroom" />
<meta property="article:tag" content="House" />
```

### Twitter Cards
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@huts" />
<meta name="twitter:creator" content="@huts" />
<meta name="twitter:title" content="The Sterling Ridge Estate | Huts" />
<meta name="twitter:description" content="For Rent: 3 bed, 2 bath in Harare. $800/month" />
<meta name="twitter:image" content="https://www.huts.co.zw/property/.../opengraph-image" />
```

### Pinterest
```html
<meta name="pinterest:description" content="For Rent: 3 bed, 2 bath house in Harare, Zimbabwe. $800/month." />
<meta name="pinterest:media" content="https://www.huts.co.zw/property/.../opengraph-image" />
```

### JSON-LD Structured Data
```json
{
  "@context": "https://schema.org",
  "@type": "Accommodation",
  "name": "The Sterling Ridge Estate",
  "description": "3 bedroom, 2 bathroom house in Harare, Zimbabwe",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Harare",
    "addressRegion": "Harare",
    "addressCountry": "ZW"
  },
  "numberOfRooms": 3,
  "numberOfBathroomsTotal": 2,
  "offers": {
    "@type": "Offer",
    "price": 800,
    "priceCurrency": "USD",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": 800,
      "priceCurrency": "USD",
      "unitText": "MONTH"
    }
  }
}
```

---

## Troubleshooting

### "Old preview still showing"
**Solution**: Social platforms cache aggressively. Use these tools to force refresh:
- Facebook: Sharing Debugger → "Scrape Again"
- Twitter: Card Validator (updates automatically)
- LinkedIn: Post Inspector (clears cache on inspect)

### "Image not loading"
**Check**:
1. Image is publicly accessible
2. OG image endpoint is working: `/property/[slug]/opengraph-image`
3. Verify in browser DevTools → Network tab

### "Description is truncated"
**Optimal lengths**:
- OG description: 200 chars (max 300)
- Twitter description: 200 chars
- Already optimized in latest code

### "Share button not working"
**Desktop**: Should show dropdown with social platforms
**Mobile**: Should trigger native share sheet

If neither works, check browser console for JavaScript errors.

---

## Files Modified

### Enhanced Metadata
- [app/property/[slug]/page.tsx](../app/property/[slug]/page.tsx) - Enhanced generateMetadata() with platform-specific tags

### New Components
- [components/property/SocialShareButtons.tsx](../components/property/SocialShareButtons.tsx) - Social share dropdown

### Updated Components
- [components/property/PropertyActions.tsx](../components/property/PropertyActions.tsx) - Integrated SocialShareButtons

### OG Image Improvements
- [lib/og-templates.tsx](../lib/og-templates.tsx) - Added sqft support
- [app/property/[slug]/opengraph-image.tsx](../app/property/[slug]/opengraph-image.tsx) - Pass sqft to template

---

## Before vs After

### Before
- Raw property photo as OG image (no branding)
- Basic share button (copy link only)
- Minimal metadata
- No platform-specific optimizations

### After
- ✅ Custom-branded OG image (1200×630) with property photo + price overlay + logo
- ✅ Multi-platform share buttons (Facebook, Twitter, LinkedIn, WhatsApp, Copy)
- ✅ Rich metadata with article tags, timestamps, and categories
- ✅ Platform-specific optimizations (Pinterest, WhatsApp, Twitter character limits)
- ✅ Structured data for Google rich results
- ✅ Square footage in OG image when available

---

## Next Steps

1. **Test the property link** on all platforms listed above
2. **Share in your network** to see real-world previews
3. **Monitor click-through rates** to measure improvement
4. **Consider A/B testing** different OG image templates

**Expected Result**: More engaging previews → Higher click-through rates → More property views
