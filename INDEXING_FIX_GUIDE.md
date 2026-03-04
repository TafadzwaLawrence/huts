# 🚨 URGENT: Fix Google Indexing Issues

**Date:** March 4, 2026  
**Status:** Only 2 pages indexed, 13 pages discovered but not indexed  
**Impact:** Your site is invisible in Google search results

---

## 📊 Current Situation (From Your Search Console)

```
✅ Indexed: 2 pages
⚠️  Discovered but not indexed: 13 pages
❌ Pages with redirect: 2 pages
📉 Impressions: ~18 total (extremely low)
```

**What this means:** Google found your pages but decided NOT to show them in search results yet.

---

## 🔧 IMMEDIATE FIXES (Do Right Now - 30 Minutes)

### Step 1: Identify the Redirect Issues (5 minutes)

**In Google Search Console:**
```
1. Go to: Indexing → Pages
2. Click on "Page with redirect" (2 pages)
3. See which URLs have redirects
4. Note them down
```

**Common redirect causes:**
- Trailing slash redirects (e.g., /search → /search/)
- HTTP → HTTPS redirects (should be fine)
- www → non-www redirects (should be fine)

**Fix:** If redirects are:
- Property pages → Ensure slug matches exactly
- Search pages → Check if query params cause redirects
- Report back which URLs have issues

---

### Step 2: Force Index Your Priority Pages (15 minutes)

**In Google Search Console → URL Inspection:**

Request indexing for these priority pages **one by one**:

```
1. https://www.huts.co.zw/
2. https://www.huts.co.zw/properties-for-rent-zimbabwe
3. https://www.huts.co.zw/rentals-in-harare
4. https://www.huts.co.zw/search
5. https://www.huts.co.zw/student-housing
6. https://www.huts.co.zw/contact
7. https://www.huts.co.zw/help
8. https://www.huts.co.zw/pricing
```

**Process for each URL:**
```
1. Paste URL into inspection tool
2. Click "Test Live URL"
3. Wait for crawl to complete (30-60 seconds)
4. Click "Request Indexing"
5. Wait for "Indexing requested" confirmation
```

⚠️ **Limitation:** You can only request ~10-15 URLs per day. Prioritize the most important ones above.

---

### Step 3: Verify Sitemap Submission (5 minutes)

**In Google Search Console → Sitemaps:**

1. Check if `https://www.huts.co.zw/sitemap.xml` is listed
2. Look at the status:
   - ✅ "Success" = Good
   - ❌ "Couldn't fetch" = Problem
   - ⚠️ "Partial" = Some pages have issues

**If sitemap is missing or errored:**
```
1. Click "Add a new sitemap"
2. Enter: sitemap.xml
3. Click Submit
```

**Verify sitemap works:**
- Open in browser: https://www.huts.co.zw/sitemap.xml
- Should show XML with list of URLs
- If you see 404 or error, redeploy your site

---

### Step 4: Check Robots.txt (5 minutes)

**Open:** https://www.huts.co.zw/robots.txt

**Should show:**
```
User-agent: *
Allow: /
Allow: /search
Allow: /search?*
Allow: /property/
Allow: /areas/
...

Sitemap: https://www.huts.co.zw/sitemap.xml
```

**If you see errors or 404:**
- Redeploy your site to Vercel
- Wait 2 minutes, check again

---

## 🔍 Why "Discovered – Currently Not Indexed" Happens

Google found your pages but decided not to index them **yet** because:

1. **New Domain** - You don't have authority yet (normal for new sites)
2. **Low Quality Signals** - Need more content, backlinks, traffic
3. **Duplicate Content** - If pages are too similar to each other
4. **Crawl Budget** - Google limits how many pages it crawls on new sites
5. **Technical Issues** - Slow loading, broken links, etc.

**Good news:** This is NORMAL for new sites. With the fixes below, pages will get indexed within 1-4 weeks.

---

## 🚀 MEDIUM-TERM FIXES (This Week)

### Fix 1: Improve Page Quality Signals

**Add unique content to each page:**

For property pages:
- Ensure each has unique title/description
- Add neighborhood details
- Include property highlights
- Add FAQ section

For landing pages:
- Add 1500+ words of unique content
- Include local statistics
- Add comparison tables
- Include user testimonials (once you have them)

---

### Fix 2: Build Internal Links

**Update your homepage footer to link to important pages:**

Add this section to `/app/page.tsx` (if not already there):

```tsx
{/* Internal Links for SEO */}
<section className="py-8 bg-white border-t border-[#E9ECEF]">
  <div className="container-main">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
      <div>
        <h4 className="font-bold text-[#212529] mb-3">Rentals by City</h4>
        <ul className="space-y-2 text-[#495057]">
          <li><Link href="/rentals-in-harare">Harare Rentals</Link></li>
          <li><Link href="/search?city=Bulawayo&type=rent">Bulawayo Rentals</Link></li>
          <li><Link href="/search?city=Gweru&type=rent">Gweru Rentals</Link></li>
          <li><Link href="/search?city=Mutare&type=rent">Mutare Rentals</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-[#212529] mb-3">Property Types</h4>
        <ul className="space-y-2 text-[#495057]">
          <li><Link href="/search?propertyType=apartment">Apartments</Link></li>
          <li><Link href="/search?propertyType=house">Houses</Link></li>
          <li><Link href="/search?propertyType=room">Rooms</Link></li>
          <li><Link href="/student-housing">Student Housing</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-[#212529] mb-3">Buy or Rent</h4>
        <ul className="space-y-2 text-[#495057]">
          <li><Link href="/search?type=rent">For Rent</Link></li>
          <li><Link href="/search?type=sale">For Sale</Link></li>
          <li><Link href="/properties-for-rent-zimbabwe">Zimbabwe Rentals</Link></li>
          <li><Link href="/rent-vs-buy">Rent vs Buy Calculator</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-[#212529] mb-3">Resources</h4>
        <ul className="space-y-2 text-[#495057]">
          <li><Link href="/help">Help Center</Link></li>
          <li><Link href="/pricing">Pricing</Link></li>
          <li><Link href="/contact">Contact Us</Link></li>
          <li><Link href="/areas">Neighborhood Guides</Link></li>
        </ul>
      </div>
    </div>
  </div>
</section>
```

**Why this helps:** Google discovers pages faster through internal links.

---

### Fix 3: Add More City Landing Pages

**Create these pages this week:**

```bash
/app/rentals-in-bulawayo/page.tsx
/app/rentals-in-gweru/page.tsx
/app/rentals-in-mutare/page.tsx
```

**Copy template from:** `/app/rentals-in-harare/page.tsx`

**For each page:**
1. Change city name in title, H1, metadata
2. Update neighborhood names
3. Change statistics (beds, baths, price ranges)
4. Update canonical URL

**After creating:**
1. Add to sitemap (automatic if using dynamic data)
2. Request indexing in Search Console
3. Link from homepage footer

---

### Fix 4: Speed Up Your Site

**Test current speed:**
```
https://pagespeed.web.dev/?url=https://www.huts.co.zw
```

**Target scores:**
- Mobile: 70+ (good), 90+ (excellent)
- Desktop: 90+ (good), 95+ (excellent)

**Quick wins if scores are low:**
1. Enable Vercel Edge caching (already on?)
2. Use WebP images instead of JPEG/PNG
3. Lazy load images below fold
4. Remove unused JavaScript

---

## 📈 WHAT TO EXPECT (Timeline)

### Week 1 (Now → March 11)
**Actions:**
- ✅ Fix redirect issues
- ✅ Request indexing for 10 priority pages
- ✅ Verify sitemap submission
- ✅ Add internal links to homepage

**Expected Results:**
- Search Console shows "Indexing requested" for priority pages
- Pages start crawling (check in URL Inspection)
- Might see 1-2 more pages indexed by end of week

---

### Week 2-3 (March 11-25)
**Actions:**
- Create 3 more city landing pages
- Get 5-10 backlinks (directories, social profiles)
- Publish 2 blog posts

**Expected Results:**
- 5-8 pages indexed (up from 2)
- "Discovered but not indexed" drops from 13 → 8-10
- First keyword impressions (50-100/week)
- Low clicks (1-5/week)

---

### Week 4-6 (March 25 - April 15)
**Actions:**
- Continue content creation
- Build more backlinks
- Improve existing pages

**Expected Results:**
- 15-25 pages indexed
- 200-500 impressions/week
- 10-20 clicks/week
- First keywords reach page 3-5

---

### Month 3-4 (April-May)
**Expected Results:**
- 50+ pages indexed
- 1000+ impressions/week
- 50-100 clicks/week
- Multiple keywords on page 1-2
- "Huts" brand search ranks #1

---

## 🛠️ TECHNICAL CHECKLIST

Run through this checklist to ensure no technical issues:

### Robots.txt
- [ ] Accessible at /robots.txt
- [ ] Allows crawling of public pages
- [ ] Includes sitemap URL
- [ ] Blocks only private pages (/dashboard, /api, /auth)

### Sitemap
- [ ] Accessible at /sitemap.xml
- [ ] Contains all public URLs
- [ ] Updates automatically when content changes
- [ ] Submitted in Search Console
- [ ] No errors in Search Console sitemap report

### Page Headers
- [ ] All pages return 200 status (not 404, 301, 302)
- [ ] Proper canonical tags (no self-referencing chains)
- [ ] No noindex tags on public pages
- [ ] Valid HTML (no critical errors)

### Mobile-Friendly
- [ ] Site works on mobile
- [ ] No horizontal scrolling
- [ ] Text is readable (font size 16px+)
- [ ] Touch targets are 44x44px minimum
- [ ] Passes Mobile-Friendly Test: https://search.google.com/test/mobile-friendly

### Page Speed
- [ ] Core Web Vitals passing (check PageSpeed Insights)
- [ ] Images optimized (WebP, proper sizing)
- [ ] No render-blocking resources
- [ ] Fast Time to Interactive (< 3 seconds)

### HTTPS
- [ ] Site uses HTTPS (not HTTP)
- [ ] Valid SSL certificate
- [ ] No mixed content warnings
- [ ] HSTS header enabled (Vercel does this automatically)

---

## 🔍 MONITORING DAILY (First 2 Weeks)

### Every Morning:
1. Check Search Console → Pages
   - How many indexed? (target: +1-2 per week)
   - Any new errors?
   - Coverage issues resolved?

2. Check Search Console → Performance
   - Impressions trend (going up?)
   - Any clicks yet?
   - New keywords appearing?

3. Verify site is live:
   - Visit: https://www.huts.co.zw
   - Check: https://www.huts.co.zw/sitemap.xml
   - Test: https://www.huts.co.zw/properties-for-rent-zimbabwe

---

## ❌ COMMON MISTAKES TO AVOID

**DON'T:**
- ❌ Request indexing for every page every day (Google penalizes this)
- ❌ Keep changing page titles/content (confuses Google)
- ❌ Use "noindex" tags on pages you want indexed
- ❌ Buy backlinks or use link farms
- ❌ Duplicate content across multiple pages
- ❌ Expect instant results (takes 2-4 weeks minimum)

**DO:**
- ✅ Request indexing once per URL
- ✅ Be patient (check weekly, not daily)
- ✅ Focus on quality content
- ✅ Build real relationships for backlinks
- ✅ Fix technical issues immediately
- ✅ Monitor Search Console for errors

---

## 🆘 TROUBLESHOOTING

### If pages still not indexed after 2 weeks:

**Check URL Inspection for each page:**
1. Paste URL into Search Console URL Inspection
2. Click "Test Live URL"
3. Look for errors:
   - "Page is not indexable" → Check for noindex tag
   - "Crawled - currently not indexed" → Need more authority/content
   - "Discovered - currently not indexed" → Be patient, normal for new sites
   - "Server error (5xx)" → Fix hosting issues
   - "Redirect" → Fix the redirect chain

**If you see errors:**
- Post the exact error message
- Check the specific URL in browser
- Verify page loads correctly
- Check Network tab in DevTools for issues

---

## 📞 NEXT STEPS

**Right now (30 minutes):**
1. ✅ Find the 2 pages with redirects (Search Console → Pages → "Page with redirect")
2. ✅ Request indexing for top 8 priority pages
3. ✅ Verify sitemap is submitted and working
4. ✅ Check robots.txt is accessible

**Today (2 hours):**
1. Fix redirect issues (if any)
2. Add internal links footer to homepage
3. Improve content on low-performing pages
4. Deploy changes to Vercel

**This week (4-6 hours):**
1. Create 3 city landing pages
2. Get 5 backlinks (directories, social profiles)
3. Request indexing for new pages
4. Monitor Search Console daily

---

## 📊 SUCCESS METRICS

### Week 1 Target:
- [ ] 0 redirect errors
- [ ] All priority pages requested for indexing
- [ ] Sitemap submitted and verified
- [ ] 3-5 pages indexed (up from 2)

### Week 2-3 Target:
- [ ] 8-12 pages indexed
- [ ] "Discovered but not indexed" < 10 pages
- [ ] 50-100 impressions/week
- [ ] 1-5 clicks/week

### Month 1 Target:
- [ ] 20+ pages indexed
- [ ] 200+ impressions/week
- [ ] 20+ clicks/week
- [ ] 1-2 keywords on page 1-3

---

**Questions or stuck?** Check Search Console errors and note the exact message. This guide covers 95% of indexing issues.

---

**Last Updated:** March 4, 2026  
**Your Current Status:** 2 pages indexed, 13 discovered but not indexed, 2 redirect errors
