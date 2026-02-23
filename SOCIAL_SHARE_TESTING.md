# Social Share Preview Testing Guide

This guide explains how to test and validate the improved social sharing previews for Huts.

## What Was Improved

### 1. Enhanced Open Graph Metadata
- **Root Layout**: Added explicit OG image URL, improved Twitter card metadata
- **Property Pages**: Using custom-generated OG images (via opengraph-image.tsx) instead of raw property photos
- Improved descriptions focused on key details (beds, baths, price, location)

### 2. JSON-LD Structured Data
Added rich structured data for better search engine understanding:
- **Organization schema** (root layout): Brand, contact, services
- **Property schema** (property pages): Accommodation/Residence with offers, amenities, address
- **BreadcrumbList schema** (property pages): Navigation hierarchy

### 3. Better Twitter Cards
- Added `creator` field
- Explicit image URLs
- Optimized descriptions for character limits

---

## Testing Tools

### 1. Facebook/Meta Sharing Debugger
**URL**: https://developers.facebook.com/tools/debug/

**How to test:**
1. Enter your URL: `https://www.huts.co.zw` or `https://www.huts.co.zw/property/[slug]`
2. Click "Debug"
3. Check the preview image, title, and description
4. Click "Scrape Again" to refresh Meta's cache

**What to look for:**
- ✅ 1200×630 branded OG image appears
- ✅ Title shows properly
- ✅ Description is complete (not truncated)
- ✅ No warnings about missing tags

### 2. Twitter/X Card Validator
**URL**: https://cards-dev.twitter.com/validator

**How to test:**
1. Enter your URL
2. Click "Preview card"

**What to look for:**
- ✅ Summary card with large image (1200×630)
- ✅ Image loads correctly
- ✅ Card type: "summary_large_image"

### 3. LinkedIn Post Inspector
**URL**: https://www.linkedin.com/post-inspector/

**How to test:**
1. Enter your URL
2. Click "Inspect"
3. View the preview

**What to look for:**
- ✅ Image displays (1200×630 OG image)
- ✅ Title and description match metadata

### 4. WhatsApp Link Preview
**Manual test:**
1. Send a link to yourself or a test contact
2. Check the preview that appears

**What to look for:**
- ✅ Image appears (400×400 or OG fallback)
- ✅ Title and description visible

### 5. Google Rich Results Test
**URL**: https://search.google.com/test/rich-results

**How to test:**
1. Enter a property page URL
2. Click "Test URL"
3. Review detected structured data

**What to look for:**
- ✅ Organization schema detected (homepage)
- ✅ Accommodation or SingleFamilyResidence schema (property pages)
- ✅ BreadcrumbList schema (property pages)
- ✅ No errors or warnings

### 6. Schema.org Validator
**URL**: https://validator.schema.org/

**How to test:**
1. Paste your page URL
2. Click "Run Test"

**What to look for:**
- ✅ All schemas validate
- ✅ No required fields missing
- ✅ Proper types used

---

## Testing Checklist

### Homepage (`https://www.huts.co.zw`)
- [ ] OG image shows branded card with "HUTS" logo
- [ ] Title: "Huts — Find Your Perfect Rental in Zimbabwe"
- [ ] Description includes Zimbabwe properties mention
- [ ] Twitter card type: summary_large_image
- [ ] Organization schema present in HTML (view source)

### Property Page (`https://www.huts.co.zw/property/[slug]`)
- [ ] OG image shows property photo with price overlay (generated image)
- [ ] Title includes property title + "| Huts"
- [ ] Description includes: listing type, beds, baths, city, price
- [ ] Twitter card with property-specific image
- [ ] Property schema present (Accommodation or SingleFamilyResidence)
- [ ] BreadcrumbList schema present
- [ ] Canonical URL set correctly

---

## Manual Browser Testing

### Chrome DevTools
1. Open DevTools (F12)
2. Go to Elements tab
3. Search for:
   - `<meta property="og:image"`
   - `<meta property="og:title"`
   - `<script type="application/ld+json"`

4. Verify values match expectations

### View Source
**Right-click page → View Page Source**

Search for:
- `og:image` - Should point to `/opengraph-image` or auto-generated URL
- `twitter:card` - Should be "summary_large_image"
- `application/ld+json` - Should have Organization/Property/BreadcrumbList schemas

---

## Common Issues & Fixes

### Issue: Old preview shows when sharing
**Fix**: Clear the cache on the social platform:
- Facebook: Use Sharing Debugger → "Scrape Again"
- Twitter: Card validator updates automatically
- LinkedIn: Post Inspector refreshes cache

### Issue: Image not loading
**Check:**
1. Image is publicly accessible (not behind auth)
2. Image URL is absolute (https://, not relative)
3. Image dimensions meet platform requirements (1200×630 recommended)

### Issue: Description truncated
**Limits:**
- OG description: ~200 chars ideal, 300 max
- Twitter description: ~200 chars ideal

**Fix**: Edit metadata in relevant file:
- Homepage: `/app/layout.tsx`
- Property: `/app/property/[slug]/page.tsx`

### Issue: Schema validation errors
**Check:**
1. Required fields present (name, description, image, url)
2. Correct types used (`@type`: Organization, Accommodation, etc.)
3. Valid values (e.g., price must be number, not string)

**Debug**: Use Google Rich Results Test for detailed errors

---

## Files Modified

### Metadata Improvements
- `/app/layout.tsx` - Root OG metadata, Organization schema
- `/app/property/[slug]/page.tsx` - Property metadata, structured data imports

### New Components
- `/components/layout/OrganizationStructuredData.tsx` - Brand schema
- `/components/property/PropertyStructuredData.tsx` - Property/Accommodation schema
- `/components/property/BreadcrumbStructuredData.tsx` - Navigation schema

### Existing (No Changes)
- `/app/opengraph-image.tsx` - Already generates branded OG image
- `/app/property/[slug]/opengraph-image.tsx` - Already generates property OG images
- `/lib/og-templates.tsx` - Existing templates used by OG images

---

## Next Steps (Optional Enhancements)

1. **Area Pages**: Add OG images and structured data to `/app/areas/[slug]/`
2. **Search Page**: Add OG metadata to `/app/search/page.tsx`
3. **Analytics**: Track share clicks with UTM parameters
4. **A/B Testing**: Test different OG image templates for conversion

---

## Resources

- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Schema.org Documentation](https://schema.org/)
- [Google Structured Data Guidelines](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)

---

## Support

If share previews aren't updating:
1. Wait 24-48 hours (social platforms cache aggressively)
2. Use platform-specific cache-busting tools (Sharing Debugger, etc.)
3. Check that site is publicly accessible (not staging/localhost)
4. Verify HTTPS is working properly
