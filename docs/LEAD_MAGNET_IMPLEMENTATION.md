# Lead Magnet System Implementation Guide

## Overview

The Huts lead magnet system is a complete framework for capturing leads through downloadable content. This guide covers setup, usage, testing, and integration.

## Quick Start

### 1. Database Setup

The migration `048_lead_magnets_system.sql` includes:

- `lead_magnets` — Catalog of all lead magnets (10 pre-seeded)
- `lead_magnet_downloads` — Tracks every lead capture with contact info
- `email_automation_workflows` — Email sequences triggered by downloads
- `email_automation_steps` — Individual emails in workflows
- `email_automation_logs` — Delivery tracking (opens, clicks)

**Apply migration:**

```bash
cd /home/tafadzwa/Documents/Github/Huts
npx supabase db push
npx supabase gen types typescript --project-id idhcvldxyhfjzytswomo > types/database.ts
```

### 2. Files Created

#### Components

- `components/lead-magnets/LeadMagnetButton.tsx` — CTA button with dialog
- `components/lead-magnets/LeadMagnetCaptureForm.tsx` — Email capture form
- `components/lead-magnets/LeadMagnetLandingPage.tsx` — Reusable landing page template
- `components/lead-magnets/LeadMagnetsAnalyticsDashboard.tsx` — Admin analytics view

#### API Routes

- `app/api/lead-magnets/capture/route.ts` — POST: capture lead, GET: fetch lead magnet details
- `app/api/analytics/lead-magnets/route.ts` — Track page views, form loads, submissions
- `app/api/analytics/pixel/route.ts` — Track external referral sources (ads, social)

#### Pages

- `app/guides/page.tsx` — Index of all 10 guides (organized by priority)
- `app/guides/[slug]/page.tsx` — Individual landing pages for each guide:
  - `buying-guide-zimbabwe`
  - `landlord-rental-yield`
  - `home-valuation-tool`
  - `rental-affordability-calculator`
  - `relocation-guide`
  - `agent-commission-calculator`
  - `investment-roi-calculator`
  - `property-laws-cheat-sheet`
  - `renovation-roi-guide`
  - `market-report-newsletter`

#### Utilities

- `lib/resend.ts` — Added `sendLeadMagnetEmail()` function for email delivery
- `lib/analytics-tracking.ts` — Hooks for tracking page views and form interactions
- `emails/LeadMagnetEmail.tsx` — Email template using React Email

#### Documentation

- `docs/LEAD_MAGNET_PDF_TEMPLATES.md` — Detailed structure for all 10 PDF guides

---

## How the System Works

### Lead Capture Flow

```
1. User visits /guides/[slug]
   ↓
2. Sees landing page with CTA button
   ↓
3. Clicks "Download Guide" → Opens modal
   ↓
4. Fills form: name, email, [optional: phone, location, user_type]
   ↓
5. Submits → POST /api/lead-magnets/capture
   ↓
6. Server validates & inserts into `lead_magnet_downloads`
   ↓
7. Sends email with PDF link via Resend
   ↓
8. Triggers email automation workflow (if configured)
   ↓
9. User downloads PDF from link in email
```

### Email Delivery

The system sends 2 types of emails:

1. **Immediate Welcome Email** — Delivered within seconds
   - Template: `LeadMagnetEmail.tsx`
   - Includes direct PDF download link
   - Call-to-action to explore platform
   - Unsubscribe footer

2. **Automated Drip Campaign** (optional)
   - Set up in `email_automation_workflows`
   - Example: 3-email sequence over 7 days
   - Step 1: Day 0 (welcome)
   - Step 2: Day 3 (success stories)
   - Step 3: Day 7 (platform feature spotlight)

### Analytics Tracking

The system tracks:

```
Page View
  ↓
Form Load
  ↓
Form Submit
  ↓
Download Completion
  ↓
Conversion (optional: listing created, inquiry sent)
```

Each event is logged with:
- Timestamp
- Lead magnet ID/slug
- User info (email, location, type)
- Referrer source
- IP address (for location tracking)

---

## Usage Examples

### 1. Add Lead Magnet Button to a Page

```typescript
'use client'

import { LeadMagnetButton } from '@/components/lead-magnets/LeadMagnetButton'

export function HomePage() {
  const buyingGuide = {
    id: '...',
    title: 'The Ultimate Guide to Buying Property in Zimbabwe',
    slug: 'buying-guide-zimbabwe',
    // ... other fields
  }

  return (
    <div>
      <h1>Start Your Journey</h1>
      <LeadMagnetButton
        leadMagnet={buyingGuide}
        text="Download Free Buyer's Guide"
        variant="default"
      />
    </div>
  )
}
```

### 2. Customize Landing Page

Edit any of these files:

```typescript
// app/guides/buying-guide-zimbabwe/page.tsx

export default function BuyingGuidePage() {
  return (
    <LeadMagnetLandingPage
      slug="buying-guide-zimbabwe"
      heroImage="/guides/buying-hero.jpg"  // Add your image
      features={[
        'Step-by-step process',
        'Cost breakdown',
        // ...
      ]}
      testimonials={[
        {
          author: 'John Doe',
          role: 'First-time Buyer',
          text: 'This guide saved me thousands!',
        },
        // ...
      ]}
      cta="Get Your Guide"
    />
  )
}
```

### 3. Track Form Submissions

```typescript
'use client'

import { useLeadMagnetTracking } from '@/lib/analytics-tracking'

export function MyComponent() {
  useLeadMagnetTracking({
    leadMagnetId: '...',
    leadMagnetSlug: 'buying-guide-zimbabwe',
    eventType: 'form_submitted',
  })

  return <div>{/* ... */}</div>
}
```

### 4. View Analytics Dashboard

```typescript
// In admin panel
import { LeadMagnetsAnalyticsDashboard } from '@/components/lead-magnets/LeadMagnetsAnalyticsDashboard'

export function AdminAnalytics() {
  return <LeadMagnetsAnalyticsDashboard />
}
```

---

## Next Steps: Email Automation

To enable automated drip campaigns:

### 1. Define Workflows

Insert into `email_automation_workflows`:

```sql
INSERT INTO email_automation_workflows (name, trigger_lead_magnet_id, workflow_type)
VALUES
  (
    'Buyer Welcome Sequence',
    (SELECT id FROM lead_magnets WHERE slug = 'buying-guide-zimbabwe'),
    'welcome'
  );
```

### 2. Define Steps

```sql
INSERT INTO email_automation_steps (workflow_id, step_number, delay_hours, email_template_name, subject_line)
VALUES
  (
    (SELECT id FROM email_automation_workflows WHERE name = 'Buyer Welcome Sequence'),
    1,
    0,
    'lead_magnet_welcome',
    'Welcome to Huts - Your Property Guide is Ready'
  ),
  (
    (SELECT id FROM email_automation_workflows WHERE name = 'Buyer Welcome Sequence'),
    2,
    72,
    'buyer_success_stories',
    'How Others Saved Thousands on Property Purchases'
  ),
  (
    (SELECT id FROM email_automation_workflows WHERE name = 'Buyer Welcome Sequence'),
    3,
    168,
    'platform_features',
    'Start Your Property Search - Exclusive Features Inside'
  );
```

### 3. Create Email Templates

Add to `emails/`:

```typescript
// emails/BuyerSuccessStoriesEmail.tsx
export default function BuyerSuccessStoriesEmail({ name }) {
  return (
    <Html>
      {/* Email content */}
    </Html>
  )
}
```

### 4. Queue Automation

The system will automatically trigger workflows when leads are captured. In production, use a background job queue (e.g., Bull, Resque) or serverless tasks (AWS Lambda, Vercel Functions).

---

## PDF Uploads

### 1. Create PDFs

Follow structure in `docs/LEAD_MAGNET_PDF_TEMPLATES.md`

Tools:
- Figma/Canva (design)
- Figma → Export as PDF
- Adobe InDesign (professional)

### 2. Optimize & Upload

```bash
# Compress PDF
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 \
   -dPDFSETTINGS=/ebook \
   -dNOPAUSE -dQUIET -dBATCH \
   -sOutputFile=output.pdf input.pdf
```

### 3. Upload to Uploadthing

Upload via dashboard or API:

```typescript
import { utapi } from "@/server/uploadthing"

const file = new File([pdfBuffer], 'buying-guide-zimbabwe.pdf', {
  type: 'application/pdf',
})

const res = await utapi.uploadFiles(file)
// Returns: { key, url, ... }
```

### 4. Update Database

```sql
UPDATE lead_magnets
SET file_url = 'https://cdn.example.com/buying-guide-zimbabwe.pdf'
WHERE slug = 'buying-guide-zimbabwe';
```

---

## Integration with Existing Pages

### Homepage Hero CTA

```typescript
'use client'

import { LeadMagnetButton } from '@/components/lead-magnets/LeadMagnetButton'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function HomepageHero() {
  const [guide, setGuide] = useState(null)

  useEffect(() => {
    const fetchGuide = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('lead_magnets')
        .select('*')
        .eq('slug', 'home-valuation-tool')
        .single()
      setGuide(data)
    }
    fetchGuide()
  }, [])

  return (
    <section>
      <h1>Find Your Perfect Property</h1>
      {guide && (
        <LeadMagnetButton
          leadMagnet={guide}
          text="Get Free Home Valuation"
          variant="default"
          className="mt-6"
        />
      )}
    </section>
  )
}
```

### Property Detail Page

```typescript
// app/property/[id]/page.tsx

export default async function PropertyPage({ params }) {
  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', params.id)
    .single()

  // Show relevant guide based on property type
  const guideSlug = property.listing_type === 'rent'
    ? 'rental-affordability-calculator'
    : 'buying-guide-zimbabwe'

  return (
    <div>
      {/* Property details */}
      <section className="mt-12 bg-off-white p-8 rounded">
        <h2>Learn More About Buying/Renting</h2>
        <LeadMagnetButton leadMagnet={guideData} />
      </section>
    </div>
  )
}
```

### Dashboard for Agents

```typescript
// app/dashboard/property-reviews/page.tsx

export default function ReviewsPage() {
  return (
    <div>
      {/* Reviews section */}

      {/* Promote related guide */}
      <section className="mt-8 border-t pt-8">
        <h3>Learn From Our Experts</h3>
        <LeadMagnetButton leadMagnet={landlordYieldGuide} />
      </section>
    </div>
  )
}
```

---

## Conversion Tracking

### Mark Downloads as Converted

When a user:
- Creates a property listing
- Submits an inquiry
- Signs up as an agent

Update their download record:

```typescript
const { error } = await supabase
  .from('lead_magnet_downloads')
  .update({
    converted: true,
    conversion_date: new Date().toISOString(),
    conversion_type: 'property_listing', // or inquiry, agent_signup
  })
  .eq('email', userEmail)
  .eq('lead_magnet_id', magnetId)
```

This allows tracking which guides drive actual business outcomes (ROI measurement).

---

## Testing Checklist

- [ ] Database migration applied successfully
- [ ] `/guides` page loads and lists all 10 guides
- [ ] `/guides/buying-guide-zimbabwe` (and others) load
- [ ] CTA button opens modal dialog
- [ ] Form validation works (email required, etc.)
- [ ] Form submission succeeds
- [ ] Email delivered to test email
- [ ] PDF URL in email works
- [ ] Analytics events logged to console
- [ ] Admin dashboard shows downloads
- [ ] Conversion tracking updates records
- [ ] Test on mobile (responsive design)

---

## Configuration

### Environment Variables

No additional env vars needed - uses existing:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `RESEND_API_KEY`

### Supabase RLS Policies

All RLS policies are included in migration. Key facts:

- Public: Can read active lead magnets
- Anyone: Can submit lead downloads (no auth required)
- Admin: Can manage workflows and view all conversions
- Users: Can view their own downloads

### Rate Limiting

Consider adding rate limiting to prevent abuse:

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 downloads per hour per IP
})

// In capture/route.ts
const { success } = await ratelimit.limit(ip)
if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
```

---

## Monitoring & Optimization

### Key Metrics to Track

1. **Download Rate** — visitors → downloads ratio
2. **Conversion Rate** — downloads → listings/inquiries
3. **Email Delivery** — sent vs. bounced
4. **Engagement** — opens, clicks on email CTA
5. **ROI** — guide leads → $$$ revenue (if applicable)

### Optimization Tips

- A/B test CTA text ("Download", "Get Guide", "Learn More")
- Test different gate fields (email only vs. name+email+location)
- Monitor which guides convert best
- Adjust guide content based on feedback
- Promote high-converting guides more prominently
- Feature testimonials from satisfied users

---

## Troubleshooting

### Form Not Submitting

- Check browser console for errors
- Verify Supabase URL & keys are correct
- Test Resend API key in isolation

### Email Not Arriving

- Check Resend logs in dashboard
- Verify email address is correct
- Check spam folder
- Confirm SMTP settings if using custom domain

### Analytics Not Tracking

- Check Network tab in browser dev tools
- Verify `/api/analytics/lead-magnets` returns 200
- Check server logs for errors

### PDF Not Downloading

- Verify Uploadthing URL is correct and public
- Test URL directly in browser
- Check file permissions in Uploadthing dashboard

---

## API Reference

### POST /api/lead-magnets/capture

**Request:**

```json
{
  "lead_magnet_id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+263123456789",
  "location": "harare",
  "user_type": "buyer",
  "source_page": "/guides/buying-guide-zimbabwe"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Download successful! Check your email.",
  "data": { "id": "uuid", "email": "...", ... }
}
```

### GET /api/lead-magnets/capture?slug=buying-guide-zimbabwe

**Response:**

```json
{
  "data": {
    "id": "uuid",
    "slug": "buying-guide-zimbabwe",
    "title": "The Ultimate Guide...",
    "description": "...",
    "file_url": "https://cdn.example.com/...",
    ...
  }
}
```

---

## Future Enhancements

1. **A/B Testing** — Test different landing pages, CTAs
2. **Personalization** — Dynamic content based on user type
3. **Video Guides** — Video versions of PDFs
4. **Webinars** — Live/recorded training sessions
5. **Community Forum** — User discussions around guides
6. **Partner Integrations** — Co-branded guides with partners
7. **Translation** — Shona/Ndebele versions
8. **Mobile App** — App-only exclusive guides

---

Created: April 2026
Last Updated: April 5, 2026
