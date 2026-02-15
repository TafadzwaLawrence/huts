# Huts - AI Coding Instructions

## Project Overview
Huts is a rental & sale property listing platform connecting landlords/sellers with renters/buyers. Built for SEO-first discovery with hyper-local market focus. Supports dual listing types (rent/sale) with role-based dashboards, reviews, messaging, and analytics.

## Tech Stack
- **Framework:** Next.js 14 (App Router) + React + TypeScript
- **Styling:** Tailwind CSS + Shadcn/ui components + Lucide React icons
- **Database:** Supabase (PostgreSQL + Auth + Real-time + Storage)
- **Images:** Uploadthing (1GB storage, CDN, built for Next.js)
- **Maps:** Leaflet + OpenStreetMap
- **Email:** Resend + React Email
- **Hosting:** Vercel
- **Forms:** React Hook Form
- **Compression:** browser-image-compression

## Core Tables & Key Flows

**Critical data model:**
- `profiles` - user accounts with role ('landlord' | 'renter')
- `properties` - listings with `listing_type` enum ('rent' | 'sale'), status
- `property_images` - Uploadthing URLs with `is_primary` flag
- `reviews` - landlord ratings (requires prior inquiry), 3/day rate limit, 7-day edit window
- `messages` - conversations (auto-created on first inquiry via RPC function)
- `conversations` - threads between renter and landlord
- `inquiries` - legacy inquiry records (still used for review verification)
- `property_views` - analytics tracking by property/date/source

**Inquiry → Conversation flow:**
1. Renter submits inquiry (App: `app/api/inquiries/send/route.ts`)
2. Server calls `get_or_create_conversation()` RPC function
3. Creates `messages` row and updates conversation `last_message_at`
4. Notification triggered (via trigger: `handle_new_message()`)
5. Landlord sees unread count in `/dashboard/messages`

**Materialized views (perf-critical):**
- `property_ratings` - aggregates review stats (avg rating, count, distribution)
- Auto-refreshes on review insert/update via trigger

## Database Migration System

**Critical:** All database changes go through versioned migrations in `supabase/migrations/`:
```
supabase/migrations/
├── 010_reviews_system.sql          # Review table, rate limits, materialized views
├── 011_sale_properties.sql         # Sale-specific fields, listing_type enum
├── 012_messages.sql                # Conversations, messages, auto-delete old
├── 013_notifications.sql           # Notification system for new messages
└── 014_update_notification_triggers.sql  # Trigger maintenance
```

**Migration workflow:**
1. Write migration in `supabase/migrations/NNN_feature.sql` (next sequential number)
2. Test locally: `npx supabase db push` or paste in Supabase SQL Editor
3. After push, always regenerate types: `npx supabase gen types typescript --project-id idhcvldxyhfjzytswomo > types/database.ts`
4. Update TypeScript types in `types/index.ts` if new exports needed
5. Commit migration + updated types/database.ts together

**Key constraints to enforce in migrations:**
- Use `ON DELETE CASCADE` for related content cleanup
- Add indexes for frequently queried columns (esp. user_id, property_id, status)
- Use CHECK constraints for enums (e.g., role IN ('landlord', 'renter'))
- Add RLS policies for security (users can only see/edit their own data)
- Use triggers for auto-calculated fields (updated_at timestamps)

## Key File Locations

```
lib/supabase/
├── server.ts       # Server-side @supabase/ssr client (use in Server Components)
├── client.ts       # Browser client (use in 'use client' components)
└── middleware.ts   # Session update on every request

types/
├── index.ts        # Type exports + isRentalProperty/isSaleProperty type guards
└── database.ts     # Generated Supabase database schema (regenerate with: npx supabase gen types...)

components/property/
├── PropertyCard.tsx          # Shows rent/sale badges dynamically
├── SalePropertyDetails.tsx   # Sale-specific fields display
├── MortgageCalculator.tsx    # Interest/term sliders
└── PropertyTypeToggle.tsx    # Filter All/Rent/Sale

components/reviews/
├── ReviewsSection.tsx    # Complete review section (most important)
├── ReviewForm.tsx        # 50-2000 char validation
├── ReviewCard.tsx        # Vote/edit/delete actions
└── RatingDistribution.tsx

app/dashboard/
├── layout.tsx           # Auth guard + redirects to /overview
├── overview/page.tsx    # Stats cards (role-aware), recent properties
├── my-properties/       # Landlord property list
├── messages/page.tsx    # Conversations UI
├── reviews/page.tsx     # User review history
└── property-reviews/    # Landlord: reviews on their properties
```

## Development Commands
```bash
npm install                # Install dependencies
npm run dev                # Start dev server (localhost:3000)
npm run build              # Production build
npm run lint               # ESLint check
npm test                   # Vitest unit tests
npm run test:e2e           # Playwright E2E tests
npm run test:coverage      # Coverage report

# Database (via Supabase CLI)
npx supabase db push       # Apply pending migrations
npx supabase gen types typescript --project-id idhcvldxyhfjzytswomo > types/database.ts
```

**After any database schema change:** Regenerate `types/database.ts` so TypeScript types stay in sync.

## Code Conventions

### Components
- Use functional components with TypeScript interfaces
- Place in feature folders: `components/property/PropertyCard.tsx`
- Use Shadcn/ui primitives from `components/ui/`
- Prefer Server Components for initial data fetches (SEO benefit)
- Use `'use client'` only for interactive features (forms, state, real-time subscriptions)

### Naming
- Components: `PascalCase` (e.g., `PropertyCard.tsx`)
- Hooks: `useCamelCase` (e.g., `useProperties.ts`)
- Utilities: `camelCase` (e.g., `formatPrice.ts`)
- Types: `PascalCase` with suffix (e.g., `PropertyResponse`, `UserRole`)
- Type guards: prefix with `is` (e.g., `isRentalProperty`, `isSaleProperty`)

### Data Fetching
- Use Server Components for initial data (SEO-critical pages)
- Use `lib/supabase/server.ts` for server-side Supabase client
- Use `lib/supabase/client.ts` for browser-based mutations
- Use RPC functions for complex multi-step operations (e.g., `get_or_create_conversation()`)
- Always check for Supabase errors: `if (error) throw error`

### Type Safety with Discriminated Unions
Properties support both rent and sale - use type guards to safely branch:
```typescript
import { isRentalProperty, isSaleProperty } from '@/types'

if (isRentalProperty(property)) {
  // Use property.price (monthly rent)
} else if (isSaleProperty(property)) {
  // Use property.sale_price
  // Use property.property_tax_annual, property.hoa_fee_monthly
}
```

### Error Handling
- Wrap API calls in try/catch
- Return consistent error shape: `NextResponse.json({ error: string }, { status: number })`
- Use appropriate HTTP status codes (401 auth, 400 validation, 404 not found, 500 server)
- Log errors to console in development
- Show user-friendly toast messages via `sonner`

Example pattern:
```typescript
try {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single()
  
  if (error) throw error
  return NextResponse.json({ data })
} catch (error) {
  console.error('Error:', error)
  return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
}
```

### SEO & Performance
- Every property page needs unique meta descriptions via `generateMetadata()`
- Use `next-sitemap` for automatic sitemap generation
- Create area guide pages at `/areas/[slug]` for local SEO
- Use materialized views for expensive aggregations (e.g., `property_ratings`)
- Lazy load images below the fold

## Key Patterns

### Supabase Clients by Context
Always use the correct client:
```typescript
// server.ts - In Server Components and API routes
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// client.ts - In 'use client' components
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

### Complex Database Operations via RPC
Use PostgreSQL functions for multi-step operations:
```typescript
// Database function example: get_or_create_conversation()
const { data: conversationId, error } = await supabase.rpc(
  'get_or_create_conversation',
  {
    p_property_id: propertyId,
    p_renter_id: userId,
    p_landlord_id: landlordId,
  }
)
```

### Role-Based Feature Gating
Profile role determines UI and features:
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

const isLandlord = profile?.role === 'landlord'
// Conditionally show: property management, inquiries, review responses
// Renters see: saved properties, reviews written, messages
```

### Dual Property Types (Rent/Sale)
Use type guards to safely branch on listing_type:
```typescript
// Check migration 011_sale_properties.sql for schema
// Price field names: price (monthly rent) vs sale_price (purchase)
// Utilities in lib/utils.ts: formatPrice() vs formatSalePrice()

import { isRentalProperty, isSaleProperty } from '@/types'
const monthlyRent = isRentalProperty(prop) ? prop.price : null
const purchasePrice = isSaleProperty(prop) ? prop.sale_price : null
```

### Review System Architecture
Reviews are tied to properties and require prior inquiry:
```typescript
// Check migration 010_reviews_system.sql
// - Reviews table with author_id, property_id, rating, comment_text
// - Rate limiting: 3 reviews per user per day (review_rate_limits table)
// - Verification: must have inquired about property (verified badge)
// - Edit window: 7 days (checked on PATCH)
// - Materialized view: property_ratings (avg rating, count, distribution)
// - Auto-refresh on review changes via trigger

// See components/reviews/ReviewsSection.tsx for full implementation
```

### Message/Conversation Flow
Messages are organized in conversations (not standalone):
```typescript
// 1. Renter submits inquiry → app/api/inquiries/send/route.ts
// 2. Server RPC creates conversation if needed → get_or_create_conversation()
// 3. First message inserted into messages table
// 4. Trigger fires → sends notification, updates conversation.last_message_at
// 5. Landlord sees in /dashboard/messages

// Key: conversation.id links multiple messages, not message.id alone
```

### Responsive Price Formatting
Utilities handle both rent and sale pricing:
```typescript
formatPrice(10000) // "$100.00" - for monthly rent
formatSalePrice(45000000) // "$450K" - for purchase price
calculateMonthlyMortgage(450000000) // Includes down payment, interest rate, term
calculateTotalMonthlyCost(mortgage, propertyTax, hoa) // Monthly ownership cost
```

## Error Handling

### API Route Pattern (Inquiries Example)
```typescript
// app/api/inquiries/send/route.ts
try {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const { propertyId, message } = body
  if (!propertyId || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Prevent self-inquiry
  if (property.user_id === user.id) {
    return NextResponse.json({ error: 'Cannot inquire about your own property' }, { status: 400 })
  }

  // Use RPC for multi-step operations
  const { data: conversationId, error: convError } = await supabase.rpc('get_or_create_conversation', {...})
  if (convError) throw convError

  return NextResponse.json({ success: true, conversationId })
} catch (error) {
  console.error('Inquiry error:', error)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
```

### Client-Side Errors
- Use Next.js `error.tsx` boundaries in each route segment
- Wrap async operations in try/catch with user-friendly toast notifications
- Log errors to Sentry (free tier: 5K errors/month)

## Testing

### Tools (all free)
- **Unit/Integration:** Vitest + React Testing Library
- **E2E:** Playwright
- **Commands:**
```bash
npm run test              # Run Vitest unit tests
npm run test:e2e          # Run Playwright E2E tests
npm run test:coverage     # Generate coverage report
```

### Testing Priorities
1. **Critical paths:** Auth flow, property submission, search, reviews
2. **Components:** PropertyCard, ReviewCard, MortgageCalculator, Filters
3. **API routes:** Property CRUD, review creation, inquiry/message flows

### File Naming
- Unit tests: `ComponentName.test.tsx`
- E2E tests: `feature-name.spec.ts` in `/e2e/` folder

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://idhcvldxyhfjzytswomo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_meCv2tDuxjtQb5RL4PSkpg_lvG2yPTQ
UPLOADTHING_TOKEN='eyJhcGlLZXkiOiJza19saXZlX2I4OGU5NTE1NTFiMDQ3ZjY2MDEyOTE4NDdkM2UxODFkMjFmZGNkNWJjYjU0NGVjYmE0ODUxMzZmNzQ0ZTk5MWYiLCJhcHBJZCI6IjNlb3RiMmY5bnciLCJyZWdpb25zIjpbInNlYTEiXX0='
RESEND_API_KEY=re_QXT3mx7c_2MSM9BdfYww1NW42mTMdUZ1M
SENTRY_DSN=https://7eff2bd4522f30a7f7f3c2b55d207a1d@o4509355706613760.ingest.de.sentry.io/4510860358975568
```

## Code Quality Standards

### Authentication & Authorization
- All API routes must check authentication: `const { data: { user } } = await supabase.auth.getUser()`
- Use standardized error message: `"Authentication required"` (status 401)
- Check role-based permissions before operations (e.g., `property.user_id === user.id`)

### Error Handling Standards
- **401 Unauthorized:** "Authentication required"
- **403 Forbidden:** "Only [entity] can [action]"
- **404 Not Found:** "[Entity] not found"
- **409 Conflict:** Duplicate key errors (e.g., "Property already saved")
- **429 Rate Limited:** Usage limit exceeded (e.g., "You have reached your daily review limit")
- **500 Server Error:** "Internal server error"
- Always log errors: `console.error('[Feature] error:', error)`

### Query Patterns
- Use `single()` when expecting exactly one row
- Use `{count: 'exact', head: true}` for counting without fetching rows
- Chain selects with specific columns for security and performance: `.select('id, user_id, status')`
- Always destructure errors: `const { data, error } = await query; if (error) throw error`

---

## UI/UX Design System

### Design Philosophy
**95% Black & White, 5% color for necessities only.** Property photos are the stars—the UI stays minimal.

### Logo Usage
- **Primary logo:** Black hut icon + "HUTS" wordmark on white background
- **Navbar:** Use full logo on white backgrounds
- **Dark mode:** Invert to white logo on black background
- **Minimum size:** 120px width to maintain legibility
- **Spacing:** Minimum 16px padding around logo
- **File location:** `public/logo.svg` (vector for crisp scaling)
- **Favicons:** All sizes included in `public/` (16x16, 32x32, 192x192, 512x512, apple-touch-icon)

### Color Palette
```css
:root {
  /* Core B&W */
  --pure-white: #FFFFFF;
  --off-white: #F8F9FA;
  --light-gray: #E9ECEF;
  --medium-gray: #ADB5BD;
  --dark-gray: #495057;
  --charcoal: #212529;
  --pure-black: #000000;
  
  /* Functional ONLY (use sparingly) */
  --accent-red: #FF6B6B;    /* Urgent alerts only */
  --accent-green: #51CF66;  /* Success states only */
}
```

### Typography
```css
/* Google Fonts: Inter */
font-family: 'Inter', -apple-system, sans-serif;

/* Scale */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px - Body */
--text-base: 1rem;     /* 16px - Default */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px - Headers */
--text-3xl: 1.875rem;  /* 30px - Page Titles */
--text-4xl: 2.25rem;   /* 36px - Hero */
```

### Button Patterns
```tsx
// Primary: Black fill
<button className="bg-black text-white border-2 border-black hover:bg-charcoal hover:-translate-y-0.5 transition-all">
  Contact Landlord
</button>

// Secondary: Outlined
<button className="bg-transparent text-black border-2 border-dark-gray hover:border-black hover:border-[3px]">
  Save Property
</button>
```

### Responsive Grid
- **Mobile:** 1 column
- **Tablet:** 2 columns
- **Desktop:** 3-4 columns
- **Gutters:** 16px mobile, 24px desktop
- **Max-width:** 1280px

### PropertyCard Component Pattern
```tsx
<div className="group cursor-pointer border border-light-gray rounded-lg overflow-hidden hover:border-charcoal transition-all duration-300 hover:shadow-lg">
  {/* Image - only color element */}
  <div className="relative h-48 overflow-hidden">
    <Image className="object-cover group-hover:scale-105 transition-transform duration-500" />
    <div className="absolute top-3 left-3 bg-black/90 text-white px-2 py-1 rounded text-sm font-semibold">
      ${price}/mo
    </div>
  </div>
  
  {/* Details - Pure B&W */}
  <div className="p-4">
    <h3 className="font-semibold text-charcoal">{title}</h3>
    <div className="flex items-center text-dark-gray text-sm">
      <MapPin size={14} /> {location}
    </div>
    <div className="flex gap-4 text-sm border-t border-light-gray pt-3">
      <span><Bed size={16} /> {beds} bed</span>
      <span><Bath size={16} /> {baths} bath</span>
      <span><Square size={16} /> {sqft} sqft</span>
    </div>
  </div>
</div>
```

### Icon System (Lucide React)
```tsx
import {
  MapPin,     // Location
  Bed,        // Bedrooms
  Bath,       // Bathrooms
  Square,     // Square footage
  Heart,      // Save
  Share2,     // Share
  Filter,     // Filter
  Search,     // Search
  Phone,      // Call
  Mail,       // Email
  Calendar,   // Schedule tour
  Star,       // Ratings
  Check,      // Amenities
  Wifi, Car, Dumbbell, PawPrint, ChefHat  // Amenity icons
} from 'lucide-react';
```

### Accessibility Requirements
```css
/* Focus states are CRITICAL */
*:focus {
  outline: 2px solid var(--pure-black);
  outline-offset: 2px;
}

/* Reduce motion preference */
@media (prefers-reduced-motion) {
  * { transition: none !important; }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --pure-white: #000000;
    --off-white: #121212;
    --pure-black: #FFFFFF;
  }
}
```

### Mobile-First Requirements
- Hamburger menu for navigation
- Bottom nav bar: Search, Saved, Profile
- Touch targets: min 44×44px
- One input per screen on mobile forms
- WebP images with lazy loading

### Micro-interactions
- **Card hover:** slight scale-up + shadow
- **Image hover:** grayscale → color
- **Save button:** heart fill animation
- **Form focus:** border thickness increase
- **Loading:** B&W skeleton screens

### What to AVOID
- ❌ Gray text on gray background
- ❌ Pure black backgrounds (use charcoal)
- ❌ Underlined non-links
- ❌ Missing focus states
- ❌ Low contrast text

---

## Component Guidelines

### NO Redundant CTAs
**CRITICAL:** Do NOT add "Add Property", "List Property", "New Property" or similar CTA buttons on dashboard pages. These actions are ALREADY available in the Navbar for landlords.

**Avoid creating:**
- ❌ "Add Property" buttons in page headers
- ❌ Floating action buttons (FAB) for property creation
- ❌ "List Your First Property" CTAs (except in truly empty states with zero properties)
- ❌ Duplicate navigation actions that exist in the global Navbar
- ❌ "Back to Dashboard" links (Dashboard is always in the Navbar)

**The Navbar already provides:**
- "+ List Property" button for landlords (always visible)
- User dropdown with dashboard navigation
- Search functionality

**Empty states exception:** Only show a single "List Your First Property" CTA when a landlord has exactly 0 properties. Once they have 1+ properties, rely on the Navbar for the action.
