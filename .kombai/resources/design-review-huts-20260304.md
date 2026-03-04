# Design Review Results: Huts — All Pages

**Review Date**: 2026-03-04  
**Routes Reviewed**: `/` · `/search` · `/dashboard` · `/help` · `/admin`  
**Focus Areas**: All — Visual Design, UX/Usability, Responsive/Mobile, Accessibility, Micro-interactions, Consistency, Performance

> **Note**: Review conducted via live browser inspection + static code analysis. Screenshots captured at 1440px (desktop) and 390px (mobile).

---

## Summary

Huts has a strong, well-documented design system in `globals.css` (custom properties, typography scale, spacing guide) and shows clear design intent. However, the system is **inconsistently applied** — most components use hardcoded hex values instead of semantic tokens, which breaks dark mode universally. Three high-impact structural issues stand out: the mobile hero has a contrast failure, the `BottomTabBar` is silently disabled (returning `null`), and the `help` page exports metadata inside a client component (SEO loss).

---

## Issues

| # | Issue | Criticality | Category | Location |
|---|-------|-------------|----------|----------|
| 1 | Hero subtitle `text-[#495057]` renders directly over the grayscale image with no scrim — fails WCAG 1.4.3 contrast on mid-tone areas of the image. On mobile the text is nearly unreadable. | 🔴 Critical | Accessibility | `app/page.tsx:54` |
| 2 | `BottomTabBar` always returns `null` — mobile users have zero bottom navigation, a core UX pattern for mobile-first property apps | 🔴 Critical | UX/Mobile | `components/layout/BottomTabBar.tsx:20` |
| 3 | `metadata` object exported from a `'use client'` component — Next.js silently ignores it, so `/help` has no OG tags, title, or canonical URL for SEO | 🔴 Critical | Performance/SEO | `app/help/page.tsx:12-23` |
| 4 | Hydration mismatch error in browser console: "Extra attributes from the server" on form `<input>` elements — indicates SSR/CSR divergence that can cause layout flicker | 🔴 Critical | Performance | `app/auth/signup/page.tsx` (console error observed) |
| 5 | `alert()` used to tell unauthenticated users they must sign in for save-search — breaks UX consistency; app already uses `sonner` toasts everywhere else | 🟠 High | UX/Consistency | `app/search/page.tsx:110` |
| 6 | Mobile hero search bar clips horizontally — the `HomeSearchBar` input has no `max-w` constraint relative to viewport on 390px, cutting off the input field | 🟠 High | Responsive | `app/page.tsx:57`, `components/search/HomeSearchBar.tsx` |
| 7 | Floating chat widget (`FloatingChatWidget`) overlaps map controls and listing cards on both mobile search and help pages — no z-index coordination with page content | 🟠 High | UX/Responsive | `components/chat/FloatingChatWidget.tsx`, `app/layout.tsx:129` |
| 8 | Duplicate sort control on search page — `FilterBar` contains sort logic AND the listings panel renders its own `<select>` for sort (`Sort: Newest`). Two sort controls visible simultaneously | 🟠 High | UX/Consistency | `app/search/page.tsx:474-484`, `components/search/FilterBar.tsx` |
| 9 | Dark mode entirely broken — `globals.css` defines `.dark` / `prefers-color-scheme: dark` tokens but virtually all components use hardcoded values (`#212529`, `#E9ECEF`, etc.) that bypass semantic tokens | 🟠 High | Consistency/Visual | `app/page.tsx`, `app/search/page.tsx`, `app/help/page.tsx` (pervasive) |
| 10 | Custom "Remember me" checkbox in dashboard login uses `peer-checked` CSS selectors but the visual indicator `<div>` is not a direct sibling of the `<input peer>` — checkbox is visually broken | 🟠 High | Accessibility/UX | `app/dashboard/page.tsx:338-347` |
| 11 | `/dashboard` route serves the sign-in page instead of the dashboard — users who bookmark `/dashboard` get a login page; actual dashboard is at `/dashboard/overview` with no redirect for authenticated users from the index | 🟠 High | UX | `app/dashboard/page.tsx:1-444` |
| 12 | Hero has no gradient scrim/overlay above the background image — text readability depends entirely on where in the image the text lands. On different viewport widths the image crop shifts, potentially making text invisible | 🟠 High | Visual/Accessibility | `app/page.tsx:29-61` |
| 13 | `app/help/page.tsx` marked `'use client'` but has no interactivity that requires client-side JS until FAQ interaction — forces unnecessary JS bundle load before content renders | 🟡 Medium | Performance | `app/help/page.tsx:1` |
| 14 | FAQ accordion uses conditional rendering (`{openFAQ === index && ...}`) with no CSS transition — content appears/disappears abruptly. The `shadcn` `Accordion` component is available and unused | 🟡 Medium | Micro-interactions | `app/help/page.tsx:315-344` |
| 15 | Sort `<select>` in listings panel has no `<label>` or `aria-label` — screen readers cannot identify the control purpose | 🟡 Medium | Accessibility | `app/search/page.tsx:474-484` |
| 16 | Save search modal form: `<label>` has no `htmlFor` and `<input>` has no `id` — the label is not programmatically associated with the input | 🟡 Medium | Accessibility | `app/search/page.tsx:644-656` |
| 17 | Inconsistent button implementation — some pages use `.btn-primary` / `.btn-secondary` CSS classes from the design system; others inline all styles. Makes maintenance harder and creates visual drift over time | 🟡 Medium | Consistency | `app/page.tsx:77-80`, `app/search/page.tsx:531`, `app/help/page.tsx:363-405` |
| 18 | Border radius used inconsistently across the app: `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3xl` used without a clear hierarchy rule. `--radius: 0.5rem` token defined in globals but rarely used | 🟡 Medium | Consistency/Visual | `globals.css:113`, pervasive in all page files |
| 19 | Hero `<h1>` hard-codes `text-black` while the design system uses `text-foreground` — this will look wrong if a light background image is ever used | 🟡 Medium | Consistency | `app/page.tsx:44` |
| 20 | Home page action cards use Unsplash images directly in `<Image>` but the `remotePatterns` in `next.config.js` does not include `images.unsplash.com` as a pattern — these will fail in production image optimization | 🟡 Medium | Performance | `app/page.tsx:95,120,143`, `next.config.js:27-30` |
| 21 | `app/search/page.tsx` uses `window.innerWidth` for mobile detection in a `useEffect` — causes layout shift on hydration when server renders desktop layout but mobile is detected client-side | 🟡 Medium | Responsive/Performance | `app/search/page.tsx:333-339` |
| 22 | Dashboard branding panel: `CheckCircle2` icon inside non-highlighted feature items uses `text-[#212529]` but the parent background is `bg-white/10` (semi-transparent dark) — icon invisible against dark left panel | 🟡 Medium | Visual | `app/dashboard/page.tsx:171-173` |
| 23 | Footer link grid defines 6 sections but `grid-cols-5` — the 6th section ("About") wraps to a new row visually on large screens, creating an unbalanced layout | 🟡 Medium | Visual/Responsive | `components/layout/Footer.tsx:125-149` |
| 24 | FAQ accordion does not sync URL hash or retain open state on navigate-back — users lose their position when they click a link in an FAQ answer and return | 🟡 Medium | UX | `app/help/page.tsx:130-131` |
| 25 | "Popular Searches" in footer uses `text-white/25` — extremely low contrast (~1.5:1), effectively invisible for most users. These are SEO-critical links that should be readable | ⚪ Low | Visual/Accessibility | `components/layout/Footer.tsx:158-163` |
| 26 | Social media footer links go to `https://facebook.com` and `https://instagram.com` (generic root URLs), not Huts' actual social profiles | ⚪ Low | UX | `components/layout/Footer.tsx:180-185` |
| 27 | "About Huts" footer link (`href="/help"`) points to Help page — should be a dedicated `/about` page or labelled correctly | ⚪ Low | UX | `components/layout/Footer.tsx:58` |
| 28 | SVG underline decoration on "perfect" in hero is `h-3` / `strokeWidth="8"` — visually effective on desktop but barely visible on mobile due to the smaller font scale | ⚪ Low | Visual | `app/page.tsx:48-51` |
| 29 | Pagination on search page does not restore scroll position to top of listings panel after page change — users must scroll up manually | ⚪ Low | UX | `app/search/page.tsx:554-596` |
| 30 | Multiple `animate-pulse` usages inside `app/dashboard/page.tsx` (gradient orbs) use inline `style={{ animationDuration: '4s' }}` — bypasses the `prefers-reduced-motion` reset in `globals.css` which only targets CSS classes | ⚪ Low | Accessibility | `app/dashboard/page.tsx:95-96` |

---

## Criticality Legend

- 🔴 **Critical**: Breaks functionality, violates WCAG standards, or causes active SEO/UX damage
- 🟠 **High**: Significantly impacts user experience, visual quality, or design system integrity
- 🟡 **Medium**: Noticeable issue that degrades polish or accessibility; addressable in next sprint
- ⚪ **Low**: Nice-to-have improvement; minimal user impact

---

## Strengths Worth Preserving

- **Design system documentation** in `globals.css` is exceptional — spacing guide, typography scale, component patterns are all well-commented
- **Security headers** in `next.config.js` are comprehensive and production-ready
- **ISR + cache** strategy on the home page (`revalidate = 60`) is correct
- **Metadata** on most pages (OG, Twitter card, canonical, robots) is thorough
- **`prefers-reduced-motion`** is handled globally in `globals.css`
- **Focus states** are carefully defined for all interactive elements
- **AbortController** used in search fetch to cancel stale requests — solid engineering
- **Skeleton loading** states on search are well-implemented

---

## Next Steps — Prioritised

```mermaid
graph LR
  A[🔴 Sprint 1 - Critical Fixes] --> B[🟠 Sprint 2 - High Impact]
  B --> C[🟡 Sprint 3 - Polish]
  C --> D[⚪ Sprint 4 - Refinement]

  A --> A1[Add hero scrim overlay]
  A --> A2[Re-enable BottomTabBar]
  A --> A3[Fix help page - split client/server]
  A --> A4[Fix hydration mismatch]

  B --> B1[Replace alert() with toast]
  B --> B2[Fix floating widget z-index]
  B --> B3[Remove duplicate sort control]
  B --> B4[Migrate hardcoded colors to tokens]
  B --> B5[Fix custom checkbox]

  C --> C1[Animate FAQ with shadcn Accordion]
  C --> C2[Add aria-labels to sort/modal inputs]
  C --> C3[Fix Unsplash remote pattern]
  C --> C4[Standardise border-radius scale]
  C --> C5[Fix footer grid to 6 columns]

  D --> D1[Fix popular searches contrast]
  D --> D2[Fix social links]
  D --> D3[Add scroll-to-top on pagination]
```

### Quick Wins (< 30 min each)

| Fix | File | Change |
|-----|------|--------|
| Add hero scrim | `app/page.tsx:31` | Add `<div className="absolute inset-0 bg-black/30 z-[1]" />` inside hero |
| Fix help page SEO | `app/help/page.tsx` | Move metadata to a new `layout.tsx` or separate server component |
| Replace `alert()` | `app/search/page.tsx:110` | `toast.error('Please sign in to save searches')` |
| Fix sort aria-label | `app/search/page.tsx:474` | Add `aria-label="Sort listings"` to the `<select>` |
| Fix footer grid | `components/layout/Footer.tsx:125` | Change to `grid-cols-3 lg:grid-cols-6` |
| Fix popular searches contrast | `components/layout/Footer.tsx:158` | Change `text-white/25` → `text-white/50` |
| Fix Unsplash remote pattern | `next.config.js` | Add `images.unsplash.com` to `remotePatterns` |
| Re-enable BottomTabBar | `components/layout/BottomTabBar.tsx` | Restore component render logic (currently `return null`) |
