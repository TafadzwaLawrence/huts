# Huts - Development Roadmap

## Week 1: MVP Core

### Setup
```bash
npx create-next-app@latest huts --typescript --tailwind --app
cd huts
npm install @supabase/supabase-js @supabase/ssr
```

### Database Schema (Supabase)
```sql
-- profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT CHECK (role IN ('landlord', 'renter')) DEFAULT 'renter',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- properties
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  beds INTEGER,
  baths INTEGER,
  location TEXT NOT NULL,
  coordinates POINT,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- property_images
CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  "order" INTEGER DEFAULT 0
);

-- saved_properties
CREATE TABLE saved_properties (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, property_id)
);
```

### Core Pages to Build
- [ ] `/` - Homepage with search & featured listings
- [ ] `/property/[id]` - Property detail page (SEO-critical)
- [ ] `/dashboard` - User dashboard (role-based views)

---

## Week 2: Make It Real

### Features
- [ ] Add 10-20 seed listings for local area
- [ ] Implement search & filters (price, beds, location)
- [ ] "Contact Landlord" button (emails via Resend)
- [ ] Deploy to Vercel

### Components to Build
- [ ] `PropertyCard` - Listing thumbnail card
- [ ] `PropertyGrid` - Responsive grid layout
- [ ] `Filters` - Price range, bedrooms, location
- [ ] `ImageGallery` - Property photo carousel
- [ ] `ContactForm` - Inquiry form with validation

---

## Week 3: Go Live & Validate

### Launch Tasks
- [ ] Approach 5 local landlords with live site
- [ ] Manually add their properties
- [ ] Set up Google Analytics 4 (free)
- [ ] Set up Vercel Analytics (free)
- [ ] Create landing page explaining value prop

### SEO Setup
- [ ] Install `next-sitemap` for automatic sitemaps
- [ ] Add meta descriptions to all property pages
- [ ] Create first area guide page (`/areas/[slug]`)

---

## Growth Strategy (All $0)

### 1. Hyper-Local Focus
- Target ONE neighborhood or university
- Create content like "Best apartments under $700 near [University]"
- Easier to rank for local search terms

### 2. Manual Onboarding Bridge
Build a "Submit Your Property" form that:
- Sends data to you (not database directly)
- You review & enhance listings manually
- Upload optimized images to Uploadthing
- Publish listings yourself initially

This bypasses complex landlord dashboards on day one.

### 3. SEO From Day 1
- Each property = unique page with meta description
- Create area guides at `/areas/downtown-apartments`
- Use `next-sitemap` for automatic sitemap generation

---

## Monetization Path

| Phase | Listings | Model |
|-------|----------|-------|
| 1 | 0-50 | 100% free |
| 2 | 50-200 | $10 for "featured" listings |
| 3 | 200+ | Premium landlord profiles ($20/month) |

---

## First 24-Hour Sprint

| Hours | Task |
|-------|------|
| 1-3 | `npx create-next-app` + deploy to Vercel |
| 4-6 | Set up Supabase + run schema migrations |
| 7-10 | Build `PropertyCard` component + mock data |
| 11-14 | Create homepage with grid of listings |
| 15-18 | Build property detail page |
| 19-24 | Add search filters + deploy updates |

---

## Free Tier Limits to Know

| Service | Free Limit |
|---------|------------|
| Vercel | 100GB bandwidth/month |
| Supabase | 500MB database, 1GB storage |
| Uploadthing | 1GB storage, 1GB bandwidth/month |
| Resend | 3,000 emails/month |
| Sentry | 5,000 errors/month |
| Google Analytics | Unlimited |
