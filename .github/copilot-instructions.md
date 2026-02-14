# Huts - AI Coding Instructions

## Project Overview
Huts is a rental property listing platform connecting landlords with renters. Built for SEO-first discovery with a focus on hyper-local markets.

## Tech Stack
- **Framework:** Next.js 14 (App Router) + React + TypeScript
- **Styling:** Tailwind CSS + Shadcn/ui components + Lucide React icons
- **Database:** Supabase (PostgreSQL + Auth + Real-time + Storage)
- **Images:** Uploadthing (1GB storage, CDN, built for Next.js)
- **Maps:** Leaflet + OpenStreetMap
- **Email:** Resend + React Email
- **Hosting:** Vercel

## Project Structure
```
app/
├── (marketing)/           # Landing pages, SEO content
├── property/[id]/         # Dynamic property detail pages
├── areas/[slug]/          # Area guides (e.g., /areas/downtown-apartments)
├── dashboard/             # User dashboard (role-based: landlord/renter)
└── api/                   # API routes
components/
├── ui/                    # Shadcn/ui components
├── property/              # PropertyCard, ImageGallery, PropertyForm
└── search/                # Filters, SearchBar, MapView
lib/
├── supabase.ts            # Supabase client configuration
├── uploadthing.ts         # Uploadthing client configuration
└── utils.ts               # Shared utilities
types/                     # TypeScript type definitions
```

## Database Schema
```sql
profiles (id, email, name, avatar_url, phone, role: 'landlord' | 'renter')
properties (id, title, description, price, beds, baths, location, coordinates, user_id)
property_images (id, property_id, url, order)
saved_properties (user_id, property_id)
conversations (id, property_id, renter_id, landlord_id, last_message_at)
messages (id, conversation_id, sender_id, content, read_at)
inquiries (id, property_id, sender_id, recipient_id, message, status)
```

**Note:** When a renter submits an inquiry form, the system automatically:
1. Creates an inquiry record (for analytics)
2. Creates/finds a conversation between renter and landlord
3. Sends the first message in that conversation
4. Creates a notification for the landlord
5. Redirects the renter to the Messages page

This means inquiries immediately become conversations that landlords can see in `/dashboard/messages`.

## Development Commands
```bash
npm install                # Install dependencies
npm run dev                # Start dev server (localhost:3000)
npm run build              # Production build
npm run lint               # ESLint check
npx supabase db push       # Push database migrations
```

## Code Conventions

### Components
- Use functional components with TypeScript interfaces
- Place in feature folders: `components/property/PropertyCard.tsx`
- Use Shadcn/ui primitives from `components/ui/`

### Naming
- Components: `PascalCase` (e.g., `PropertyCard.tsx`)
- Hooks: `useCamelCase` (e.g., `useProperties.ts`)
- Utilities: `camelCase` (e.g., `formatPrice.ts`)
- Types: `PascalCase` with suffix (e.g., `PropertyResponse`, `UserRole`)

### Data Fetching
- Use Server Components for initial data (SEO-critical pages)
- Use `@supabase/ssr` for server-side Supabase client
- Client-side mutations via Supabase real-time subscriptions

### SEO Requirements
- Every property page needs unique meta descriptions
- Use `next-sitemap` for automatic sitemap generation
- Create area guide pages at `/areas/[slug]` for local SEO

### Image Handling
- Upload via Uploadthing, store URLs in Supabase
- Use Uploadthing's built-in image optimization
- Lazy load images below the fold
- Use `@uploadthing/react` components for upload UI

## Key Patterns

### Supabase Client Setup
```typescript
// lib/supabase.ts - Use createBrowserClient for client components
// lib/supabase-server.ts - Use createServerClient for server components
```

### Role-Based UI
```typescript
// Dashboard shows different views based on profile.role
// 'landlord': property management, inquiries
// 'renter': saved properties, search history
```

## Error Handling

### Client-Side Errors
- Use Next.js `error.tsx` boundaries in each route segment
- Wrap async operations in try/catch with user-friendly toast notifications
- Log errors to Sentry (free tier: 5K errors/month)

```typescript
// Example pattern for API calls
try {
  const data = await supabase.from('properties').select()
  if (data.error) throw data.error
} catch (error) {
  Sentry.captureException(error)
  toast.error('Failed to load properties')
}
```

### API Route Errors
- Return consistent error shape: `{ error: string, code?: string }`
- Use HTTP status codes correctly (400 client error, 500 server error)

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
1. **Critical paths:** Auth flow, property submission, search
2. **Components:** PropertyCard, Filters, ImageGallery
3. **API routes:** Property CRUD, user profile updates

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
