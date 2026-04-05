# SEO Action Plan - Get Huts Ranking First

**Created:** March 4, 2026  
**Goal:** Rank #1 for "home rentals", "properties for rent Zimbabwe", "Harare rentals"

---

## 🚨 DO THESE TODAY (Critical)

### 1. Google Search Console Setup (30 minutes)
**Why:** Google can't index your pages if they don't know your site exists.

**Steps:**
```bash
1. Go to: https://search.google.com/search-console
2. Click "Add Property" → Enter: https://www.huts.co.zw
3. Choose verification method:
   - Option A: DNS TXT record (recommended for production)
   - Option B: HTML file upload to /public folder
4. After verified, click "Sitemaps" → Submit: https://www.huts.co.zw/sitemap.xml
5. Use URL Inspection tool to request indexing for:
   - https://www.huts.co.zw
   - https://www.huts.co.zw/properties-for-rent-zimbabwe
   - https://www.huts.co.zw/rentals-in-harare
   - https://www.huts.co.zw/search
```

**Check indexing status:**
```
In Google, search: site:huts.co.zw
```
If you see < 10 results, your pages aren't indexed yet.

---

### 2. Google Analytics 4 Setup (15 minutes)
**Why:** Track which keywords are bringing traffic so you can optimize.

**Steps:**
```bash
1. Go to: https://analytics.google.com
2. Create account → Property: "Huts - Zimbabwe Property Marketplace"
3. Get tracking ID (G-XXXXXXXXXX)
4. Add to your app (see code below)
```

**Implementation:**
Add to `/app/layout.tsx` in the `<head>`:
```typescript
<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  `}
</Script>
```

---

### 3. Verify Your Pages Are Live (5 minutes)
Check these URLs in your browser:
- ✅ https://www.huts.co.zw/properties-for-rent-zimbabwe
- ✅ https://www.huts.co.zw/rentals-in-harare
- ✅ https://www.huts.co.zw/sitemap.xml

If any 404, redeploy to Vercel.

---

## 📅 THIS WEEK (High Priority)

### 4. Create More City Landing Pages
**Why:** Target specific local searches (rank faster).

**Create these pages:**
```bash
/app/rentals-in-bulawayo/page.tsx
/app/rentals-in-gweru/page.tsx
/app/rentals-in-mutare/page.tsx
/app/rentals-in-victoria-falls/page.tsx
```

**Copy template from:** `/app/rentals-in-harare/page.tsx`  
**Change:** City name, neighborhoods, stats, H1 title, metadata

**Target keywords:**
- "properties for rent in Bulawayo"
- "Gweru rentals"
- "apartments for rent Mutare"
- "Victoria Falls accommodation"

---

### 5. Get Your First 10 Backlinks
**Why:** Backlinks = authority signals to Google.

**Action list:**
- [ ] Submit to Zimbabwe business directories
  - Zimbabwe Yellow Pages
  - Zimbabwean Business Directory
  - Classifieds.co.zw
- [ ] List on property aggregators
  - PropertyLounge.co.zw (if exists)
  - ZimProperties (if exists)
- [ ] Social media profiles (link to site)
  - Facebook Page → Add website link
  - Twitter/X profile → Add website link
  - Instagram bio → Add website link
- [ ] Partner outreach
  - Email universities: "Free student housing listings"
  - Email real estate agents: "Free property listings"
  - Email relocation companies: "Partner with us"

**Email template:**
```
Subject: Partnership Opportunity - Free Property Listings

Hi [Name],

I'm reaching out from Huts (huts.co.zw), Zimbabwe's newest property 
marketplace. We're offering free property listings to partners.

Would you be interested in:
- Listing your properties for free
- Co-marketing opportunities
- Featured placement on our homepage

Let me know if you'd like to chat!

Best,
[Your Name]
```

---

### 6. Add Property Schema to Individual Listings
**Why:** Rich snippets in Google (price, beds, rating shows in search).

**Add to:** `/app/property/[slug]/page.tsx`

```typescript
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': property.listing_type === 'rent' ? 'Apartment' : 'SingleFamilyResidence',
      name: property.title,
      address: {
        '@type': 'PostalAddress',
        addressLocality: property.city,
        addressRegion: property.neighborhood,
        addressCountry: 'ZW',
      },
      ...(property.listing_type === 'rent' ? {
        offers: {
          '@type': 'Offer',
          price: property.price,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        }
      } : {
        offers: {
          '@type': 'Offer',
          price: property.sale_price,
          priceCurrency: 'USD',
        }
      }),
      numberOfRooms: property.beds,
      floorSize: {
        '@type': 'QuantitativeValue',
        value: property.sqft,
        unitCode: 'FTK',
      },
      ...(property.property_images?.[0]?.url && {
        image: property.property_images[0].url
      }),
    }),
  }}
/>
```

---

## 📈 THIS MONTH (Medium Priority)

### 7. Write 4 SEO Blog Posts
**Why:** Target long-tail keywords (rank faster than competitive terms).

**Post ideas:**
1. **"How Much Does It Cost to Rent in Harare? (2026 Guide)"**
   - Target: "cost to rent in Harare"
   - Include: Neighborhood price comparisons, charts
   
2. **"Best Neighborhoods in Harare for Families"**
   - Target: "best neighborhoods Harare"
   - Include: Schools, safety, amenities
   
3. **"Student Housing Guide: Renting Near Universities in Zimbabwe"**
   - Target: "student accommodation Zimbabwe"
   - Include: MSU, UZ, NUST areas
   
4. **"Renting in Zimbabwe: Complete Guide for Expats (2026)"**
   - Target: "rent house Zimbabwe expat"
   - Include: Visa requirements, costs, tips

**Blog location:** Create `/app/blog/[slug]/page.tsx`

---

### 8. Optimize Page Speed
**Check current speed:**
```bash
# Test at: https://pagespeed.web.dev
# Enter: https://www.huts.co.zw

# Target metrics:
- First Contentful Paint: < 1.8s
- Largest Contentful Paint: < 2.5s
- Total Blocking Time: < 200ms
```

**Quick wins:**
- Use WebP images (smaller than JPEG)
- Lazy load below-the-fold images
- Defer non-critical JavaScript
- Enable Vercel Edge caching

---

### 9. Create FAQ Section on Homepage
**Why:** Ranks for "People Also Ask" boxes in Google.

**Add to:** `/app/page.tsx` (bottom of page)

```typescript
<section className="py-16 bg-[#F8F9FA]">
  <div className="container-main max-w-3xl">
    <h2 className="text-3xl font-bold text-[#212529] mb-8">Frequently Asked Questions</h2>
    
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-[#212529] mb-2">
          How much does it cost to rent in Zimbabwe?
        </h3>
        <p className="text-[#495057]">
          Rental prices vary by location. In Harare, expect $300-$1200/month for apartments, 
          $500-$2000/month for houses. Bulawayo and Gweru are typically 20-30% cheaper.
        </p>
      </div>
      
      <div>
        <h3 className="text-lg font-bold text-[#212529] mb-2">
          Are properties on Huts verified?
        </h3>
        <p className="text-[#495057]">
          Yes, all properties undergo manual verification before going live. We verify 
          ownership, photos, and contact details to prevent scams.
        </p>
      </div>
      
      <div>
        <h3 className="text-lg font-bold text-[#212529] mb-2">
          Can I list my property for free?
        </h3>
        <p className="text-[#495057]">
          Yes! Listing properties on Huts is completely free. Create an account, 
          add your property details and photos, and go live in minutes.
        </p>
      </div>
      
      <div>
        <h3 className="text-lg font-bold text-[#212529] mb-2">
          What areas does Huts cover?
        </h3>
        <p className="text-[#495057]">
          We cover all major cities in Zimbabwe including Harare, Bulawayo, Gweru, 
          Mutare, Victoria Falls, Masvingo, and Kwekwe. New areas added weekly.
        </p>
      </div>
    </div>
  </div>
</section>

{/* FAQ Schema */}
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How much does it cost to rent in Zimbabwe?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Rental prices vary by location. In Harare, expect $300-$1200/month for apartments...'
          }
        },
        // ... add all 4 questions
      ]
    })
  }}
/>
```

---

## 🎯 EXPECTED TIMELINE

### Week 1-2: Crawling & Discovery
- Google discovers your pages via sitemap
- Pages appear in Search Console
- Zero rankings yet (normal)

**Action:** Monitor Search Console → Coverage report

---

### Week 3-4: Initial Indexing
- Pages start appearing for long-tail keywords
- Positions: 50-100 (page 5-10)
- Example: "3 bedroom apartment borrowdale harare" → page 7

**Action:** Check rankings with: `site:huts.co.zw "your keyword"`

---

### Month 2: Getting Traction
- More keywords appear (20-50 keywords)
- Positions improve: 20-50 (page 2-5)
- Long-tail keywords hit page 1-2
- Example: "properties for rent zimbabwe" → page 3

**Action:** Create more content, get more backlinks

---

### Month 3-4: Real Rankings
- Competitive keywords reach page 1-2
- Branded searches rank #1
- 50-100 keywords ranked
- Organic traffic: 500-1000 visitors/month

**Action:** Double down on what's working

---

### Month 5-6: Established Presence
- **Target achieved:** "properties for rent zimbabwe" → page 1 (#3-5)
- "harare rentals" → page 1 (#1-3)
- Organic traffic: 2000-5000 visitors/month

**Action:** Maintain momentum with weekly content

---

## 🔍 MONITORING CHECKLIST

### Daily (First 2 Weeks)
- [ ] Check if new pages are indexed: `site:huts.co.zw`
- [ ] Monitor Search Console for crawl errors

### Weekly
- [ ] Check Search Console → Performance
  - Impressions trend (going up?)
  - Average position (improving?)
  - Click-through rate
- [ ] Check Google Analytics
  - Organic traffic sessions
  - Top landing pages
  - Bounce rate (< 60% is good)

### Monthly
- [ ] Track keyword positions (use Ahrefs free trial or SEMrush)
- [ ] Analyze top 10 landing pages
- [ ] Identify new keyword opportunities
- [ ] Review and update old content

---

## 🚫 AVOID THESE MISTAKES

**DON'T:**
- ❌ Buy backlinks (Google penalty)
- ❌ Keyword stuff (unnatural repetition)
- ❌ Copy content from competitors
- ❌ Expect results in 1-2 weeks
- ❌ Ignore Search Console errors
- ❌ Use black-hat SEO tactics

**DO:**
- ✅ Create unique, helpful content
- ✅ Write for humans first, Google second
- ✅ Build real relationships (backlinks naturally follow)
- ✅ Be patient (SEO is a 6-month game)
- ✅ Focus on user experience
- ✅ Keep content updated

---

## 🏆 SUCCESS METRICS

### After 3 Months
- [ ] 50+ keywords ranked in top 50
- [ ] 5+ keywords on page 1
- [ ] 1000+ organic visitors/month
- [ ] 20+ indexed pages
- [ ] 10+ quality backlinks

### After 6 Months
- [ ] 150+ keywords ranked
- [ ] 20+ keywords on page 1
- [ ] 5000+ organic visitors/month
- [ ] 50+ indexed pages
- [ ] 30+ quality backlinks
- [ ] **"properties for rent zimbabwe" → Top 3**
- [ ] **"harare rentals" → #1**

---

## 📞 NEXT STEPS

**Right now:**
1. Set up Google Search Console (30 min)
2. Submit sitemap
3. Request indexing for top 5 pages
4. Set up Google Analytics (15 min)

**This week:**
1. Create 3 more city landing pages
2. Get 5 backlinks
3. Add FAQ section to homepage
4. Add property schema to listings

**This month:**
1. Write 4 blog posts
2. Get 20 total backlinks
3. Optimize page speed
4. Monitor rankings weekly

---

## 📚 RESOURCES

**Free Tools:**
- Google Search Console: https://search.google.com/search-console
- Google Analytics: https://analytics.google.com
- PageSpeed Insights: https://pagespeed.web.dev
- Schema Markup Validator: https://validator.schema.org

**Learning:**
- Google SEO Starter Guide: https://developers.google.com/search/docs/beginner/seo-starter-guide
- Moz Beginner's Guide: https://moz.com/beginners-guide-to-seo
- Ahrefs Blog: https://ahrefs.com/blog

**Paid Tools (Optional):**
- Ahrefs: Keyword research, backlink analysis ($99/mo - 7-day trial for $7)
- SEMrush: Competitor analysis, rank tracking ($119/mo - free trial)
- Screaming Frog: Technical SEO audit (Free up to 500 URLs)

---

**Questions?** Review this plan weekly and adjust based on Search Console data.

---

**Last Updated:** March 4, 2026
