---
name: image-generation
description: 'Generate images for social media (Instagram, Twitter/X, Pinterest, WhatsApp) and site OG images using the Huts B&W design system. Covers all platform dimensions, brand constants, Satori/next-og templates, and the on-demand /api/og endpoint. Use when creating share images, OG metadata images, social posts, or any programmatic image for the property platform.'
argument-hint: 'Describe the image you need: platform, content type (property, area, brand), and any specific details'
---

# Image Generation Skill

## Purpose
Generate high-quality images for social media and the Huts website using `next/og` (Satori engine). All images follow the Huts B&W design system — 95% black & white, property photos are the only color. Templates are pre-built for every major platform dimension.

## When to Use
- Creating or modifying Open Graph images for any route
- Generating social media images (Instagram, Twitter/X, Pinterest, WhatsApp)
- Building new image templates for marketing or sharing
- Debugging image rendering issues (Satori constraints)
- Adding OG images to new pages (areas, search, dashboard)
- Creating promotional property images for social sharing

---

## 1. Architecture Overview

```
lib/
├── brand.ts          # BRAND constants (colors, fonts, dimensions, spacing)
├── og-fonts.ts       # loadFonts() / loadBoldFont() — Inter font loading for Satori
└── og-templates.tsx  # Template JSX functions (brandedCard, propertyCard, etc.)

app/
├── opengraph-image.tsx              # Root OG image (uses brandedCard template)
├── property/[slug]/opengraph-image.tsx  # Property OG image (uses propertyCard template)
└── api/og/route.ts                  # On-demand image generation API
```

**Key principle:** All templates live in `lib/og-templates.tsx`. OG image routes and the API route are thin wrappers that pick a template, pass data, and return `ImageResponse`.

---

## 2. Brand Design System Reference

### Colors (hex — required for Satori inline styles)

| Token | Hex | Usage |
|-------|-----|-------|
| `pureWhite` | `#FFFFFF` | Backgrounds, text on dark |
| `offWhite` | `#F8F9FA` | Subtle backgrounds |
| `lightGray` | `#E9ECEF` | Borders, dividers, secondary text on dark |
| `mediumGray` | `#ADB5BD` | Muted text, subtitles |
| `darkGray` | `#495057` | Body text on light backgrounds |
| `charcoal` | `#212529` | Primary dark — cards, overlays, badges |
| `pureBlack` | `#000000` | Headings, high contrast |
| `accentRed` | `#FF6B6B` | Urgent alerts **only** |
| `accentGreen` | `#51CF66` | Success states **only** |

**Rule:** Use `charcoal` (#212529) for dark elements, NOT pure black. Use color sparingly — only for functional states.

Access via: `import { BRAND } from '@/lib/brand'` → `BRAND.colors.charcoal`

### Typography

| Scale | px | Use |
|-------|-----|-----|
| xs | 12 | Tiny labels |
| sm | 14 | Captions, metadata |
| base | 16 | Body text |
| lg | 18 | Emphasized body |
| xl | 20 | Subheadings |
| 2xl | 24 | Section titles |
| 3xl | 30 | Page titles |
| 4xl | 36 | Hero headings |
| 5xl | 48 | Large display |
| 6xl | 60 | Extra large display |

**Font:** Inter (Google Fonts)
**Weights:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

Access via: `BRAND.fonts.family`, `BRAND.fonts.weights.bold`, `BRAND.typography['4xl']`

### Spacing

| Token | px | Use |
|-------|-----|-----|
| xs | 8 | Tight gaps |
| sm | 12 | Badge padding |
| md | 16 | Standard padding |
| lg | 24 | Card padding, gaps |
| xl | 32 | Section spacing |
| 2xl | 48 | Large padding (OG images) |

Access via: `BRAND.spacing.lg`

---

## 3. Platform Dimensions Reference

### Social Media & OG Sizes

| Platform | Preset Key | Width | Height | Ratio | Template |
|----------|-----------|-------|--------|-------|----------|
| Open Graph (Facebook/LinkedIn) | `og` | 1200 | 630 | 1.91:1 | `brandedCard` or `propertyCard` |
| Twitter/X Large Card | `twitter` | 1200 | 675 | 16:9 | `twitterCard` |
| Twitter/X Summary | `twitterSummary` | 800 | 418 | 1.91:1 | `brandedCard` |
| Instagram Square | `instagramSquare` | 1080 | 1080 | 1:1 | `socialSquare` |
| Instagram Portrait | `instagramPortrait` | 1080 | 1350 | 4:5 | `socialPortrait` |
| Instagram Landscape | `instagramLandscape` | 1080 | 566 | 1.91:1 | `propertyCard` |
| Pinterest | `pinterest` | 1000 | 1500 | 2:3 | `socialPortrait` |
| WhatsApp Preview | `whatsapp` | 400 | 400 | 1:1 | `socialSquare` |

Access via: `BRAND.dimensions.og` → `{ width: 1200, height: 630 }`

### Site Responsive Breakpoints

| Breakpoint | min-width | Common layout |
|------------|-----------|---------------|
| Mobile | < 640px | 1 column, stacked |
| `sm` | 640px | 1-2 columns |
| `md` | 768px | 2 columns |
| `lg` | 1024px | 3 columns |
| `xl` | 1280px | 3-4 columns (max-content) |
| `2xl` | 1536px | Same as xl, wider gutters |

**Max content width:** 1280px (`max-w-content` / `max-w-6xl`)
**Container padding:** `px-4 sm:px-6 lg:px-8`

---

## 4. Available Templates

### `brandedCard` — Generic Branded Image
**Default size:** 1200×630 (OG)
**Use for:** Site OG image, area pages, generic shares, fallbacks

```typescript
import { brandedCard, type BrandedCardProps } from '@/lib/og-templates'

brandedCard({
  title: 'HUTS',                              // Large centered text
  subtitle: 'Rent & Buy Property in Zimbabwe', // Below title, medium-gray
  footer: "Zimbabwe's Property Marketplace",   // Below card, dark-gray
})
```

**Visual:** White background → centered charcoal rounded rectangle → white title text + gray subtitle → footer text below.

### `propertyCard` — Property Listing Image
**Default size:** 1200×630 (OG)
**Use for:** Property OG images, property social shares

```typescript
import { propertyCard, type PropertyCardProps } from '@/lib/og-templates'

propertyCard({
  title: '3 Bedroom House in Borrowdale',
  price: '$1,200/mo',
  city: 'Harare',
  beds: 3,
  baths: 2,
  imageUrl: 'https://utfs.io/f/...',  // Optional property photo
  listingType: 'rent',                 // Optional: shows "For Rent" badge
})
```

**Visual:** Full-bleed property photo → bottom gradient overlay → price badge + title + location/specs → HUTS logo badge top-right.

### `socialSquare` — Instagram / WhatsApp
**Default size:** 1080×1080
**Use for:** Instagram feed posts, WhatsApp shares

```typescript
import { socialSquare, type SocialSquareProps } from '@/lib/og-templates'

socialSquare({
  title: 'New Listings in Borrowdale',
  subtitle: '12 properties just added',
  imageUrl: 'https://utfs.io/f/...',  // Optional background photo
  badge: 'Just Listed',                // Optional top badge
})
```

**Visual:** Photo background (or solid charcoal) → semi-transparent overlay → centered text + optional badge → HUTS logo badge bottom-right.

### `socialPortrait` — Instagram Stories / Pinterest
**Default size:** 1080×1350 (4:5)
**Use for:** Instagram Stories, Pinterest pins

```typescript
import { socialPortrait, type SocialPortraitProps } from '@/lib/og-templates'

socialPortrait({
  title: '3 Bedroom House in Borrowdale',
  price: '$1,200/mo',
  subtitle: 'Harare • 3 bed • 2 bath',
  imageUrl: 'https://utfs.io/f/...',
  badge: 'For Rent',
})
```

**Visual:** Top 60% = photo with badge + HUTS logo → Bottom 40% = charcoal panel with price, title, subtitle, domain footer.

### `twitterCard` — Twitter/X Large Card
**Default size:** 1200×675
**Use for:** Twitter/X shares, broad landscape formats

```typescript
import { twitterCard, type TwitterCardProps } from '@/lib/og-templates'

twitterCard({
  title: 'Find Your Next Home in Zimbabwe',
  subtitle: 'Browse 500+ verified rental and sale listings',
  imageUrl: 'https://utfs.io/f/...',
})
```

**Visual:** Left 45% = charcoal panel with HUTS logo + title + subtitle + domain → Right 55% = property photo (or gray fallback with HUTS watermark).

---

## 5. On-Demand API (`/api/og`)

Generate images programmatically via GET request:

```
GET /api/og?template=brandedCard&title=Hello&subtitle=World
GET /api/og?template=propertyCard&title=House&price=$500/mo&city=Harare&beds=3&baths=2&image=https://...
GET /api/og?template=socialSquare&title=New+Listings&badge=Featured&preset=instagramSquare
```

### Query Parameters

| Param | Required | Description |
|-------|----------|-------------|
| `template` | Yes | Template name: `brandedCard`, `propertyCard`, `socialSquare`, `socialPortrait`, `twitterCard` |
| `title` | Yes | Main heading text |
| `subtitle` | No | Secondary text |
| `footer` | No | Footer text (brandedCard only) |
| `image` | No | Background image URL |
| `price` | No | Price display string |
| `city` | No | City name |
| `beds` | No | Number of bedrooms |
| `baths` | No | Number of bathrooms |
| `badge` | No | Badge text (e.g., "For Rent", "Just Listed") |
| `listingType` | No | `rent` or `sale` |
| `preset` | No | Dimension preset key from `BRAND.dimensions` (e.g., `instagramSquare`) |
| `width` | No | Custom width (max 4096) |
| `height` | No | Custom height (max 4096) |

---

## 6. Creating a New OG Image Route

Step-by-step procedure for adding an OG image to a new page:

### Step 1: Create the file
Create `opengraph-image.tsx` in the route's directory:
```
app/areas/[slug]/opengraph-image.tsx
```

### Step 2: Write the route
```typescript
import { ImageResponse } from 'next/og'
import { BRAND } from '@/lib/brand'
import { loadFonts } from '@/lib/og-fonts'
import { brandedCard } from '@/lib/og-templates'

export const size = BRAND.dimensions.og
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const fonts = await loadFonts()

  // Fetch data for the image
  // const area = await fetchArea(slug)

  return new ImageResponse(
    brandedCard({
      title: 'Area Name',
      subtitle: '24 properties available',
      footer: BRAND.subtitle,
    }),
    { ...size, fonts }
  )
}
```

### Step 3: Verify
- Visit the page and check `<meta property="og:image">` in page source
- Open the OG image URL directly — should return a PNG
- Test with https://www.opengraph.xyz/ or Twitter Card Validator

---

## 7. Creating a New Template

### Step 1: Define the props interface
```typescript
// In lib/og-templates.ts
export interface NewTemplateProps {
  title: string
  subtitle?: string
  // ... specific props
}
```

### Step 2: Write the template function
```typescript
export function newTemplate({ title, subtitle }: NewTemplateProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: BRAND.fonts.family,
        background: BRAND.colors.pureWhite,
      }}
    >
      {/* ... layout ... */}
    </div>
  )
}
```

### Step 3: Register in the API route
Add the template to `VALID_TEMPLATES` and `TEMPLATE_DEFAULTS` in `app/api/og/route.ts`, plus a `case` in the switch statement.

### Step 4: Use it
```tsx
import { newTemplate } from '@/lib/og-templates'
// In an OG image route or via /api/og?template=newTemplate&title=Hello
```

---

## 8. Satori Constraints & Gotchas

**Satori** (the engine behind `next/og`) has specific limitations. Every template must follow these rules:

### Supported
- Flexbox layout (`display: 'flex'`, `flexDirection`, `alignItems`, `justifyContent`, `gap`, `flexWrap`)
- Inline styles only (`style={{...}}` objects)
- Absolute positioning (`position: 'absolute'`)
- `<img>` tags with `src` URLs (remote images work)
- `<svg>` inline SVGs
- Linear gradients (`background: 'linear-gradient(...)'`)
- Text truncation (`overflow: 'hidden'`, `textOverflow: 'ellipsis'`, `whiteSpace: 'nowrap'`)
- Border, borderRadius, boxShadow, opacity

### NOT Supported
- **No Tailwind classes** — all styles must be inline objects
- **No CSS Grid** — use flexbox only
- **No CSS variables** — use hardcoded hex values from `BRAND.colors`
- **No `className`** — Satori ignores class-based styles
- **No `<div>` without `display: 'flex'`** — every `<div>` should have `display: 'flex'`
- **No relative units** (rem, em, vh, vw) — use `px` values or percentages
- **No `calc()`** — pre-compute values
- **No pseudo-elements** (::before, ::after)
- **No animations or transitions**
- **No `@font-face`** — fonts must be loaded as ArrayBuffer via `loadFonts()`
- **No `<link>` or `<style>` tags**

### Common Fixes
| Problem | Fix |
|---------|-----|
| Text not rendering in Inter | Pass `fonts` to `ImageResponse` options: `{ fonts: await loadFonts() }` |
| Element not visible | Add `display: 'flex'` to every `<div>` |
| Layout broken | Use `flexDirection: 'column'` for vertical, `'row'` for horizontal |
| Image not loading | Ensure URL is absolute (starts with `https://`) |
| Text overflowing | Add `overflow: 'hidden'`, `textOverflow: 'ellipsis'`, `whiteSpace: 'nowrap'` |
| `<span>` not rendering | Wrap in `<div style={{ display: 'flex' }}>` or add `display: 'flex'` to span |

---

## 9. Font Loading

Always load fonts explicitly — do NOT rely on system fonts:

```typescript
import { loadFonts, loadBoldFont } from '@/lib/og-fonts'

// Full set (400, 500, 600, 700) — for complex templates
const fonts = await loadFonts()

// Bold only (700) — for simple templates with only bold text
const fonts = await loadBoldFont()

// Pass to ImageResponse
return new ImageResponse(jsx, { ...size, fonts })
```

Font data is cached in-memory within each serverless instance, so subsequent calls to `loadFonts()` in the same instance are fast.

---

## 10. Brand Guidelines for Images

1. **95% B&W** — Property photos are the only color element
2. **Use charcoal (#212529) not pure black** for dark backgrounds/text
3. **Every image must include the HUTS brand** — either via `LogoBadge` component or text wordmark
4. **Inter font only** — no other fonts
5. **Consistent spacing** — use `BRAND.spacing` values (8, 12, 16, 24, 32, 48px)
6. **Border radius** — `BRAND.radius` (4, 8, 12, 16px)
7. **No decorative color** — red/green only for functional alerts/success (never in marketing images)
8. **Gradient overlays** — bottom-to-top, from `rgba(33,37,41,0.95)` to transparent
9. **Price badges** — charcoal background, white text, 12px border radius
10. **Domain footer** — show `huts.co.zw` in muted text where space allows

---

## 11. Quick Reference: Import Cheatsheet

```typescript
// Brand constants
import { BRAND } from '@/lib/brand'
BRAND.colors.charcoal    // '#212529'
BRAND.dimensions.og       // { width: 1200, height: 630 }
BRAND.fonts.weights.bold  // 700
BRAND.typography['4xl']   // 36
BRAND.spacing.lg          // 24

// Font loading
import { loadFonts, loadBoldFont } from '@/lib/og-fonts'

// Templates
import {
  brandedCard,     // Generic branded card
  propertyCard,    // Property listing with photo
  socialSquare,    // 1080×1080 Instagram/WhatsApp
  socialPortrait,  // 1080×1350 Stories/Pinterest
  twitterCard,     // 1200×675 Twitter/X
} from '@/lib/og-templates'

// Template prop types
import type {
  BrandedCardProps,
  PropertyCardProps,
  SocialSquareProps,
  SocialPortraitProps,
  TwitterCardProps,
} from '@/lib/og-templates'

// ImageResponse
import { ImageResponse } from 'next/og'
```
