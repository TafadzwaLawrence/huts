/**
 * Centralized brand constants for Huts.
 * Used by OG image generators, social media templates, and email templates.
 * All colors are hex strings — compatible with Satori (next/og) inline styles.
 */

export const BRAND = {
  name: 'HUTS',
  tagline: 'Rent & Buy Property in Zimbabwe',
  subtitle: "Zimbabwe's Property Marketplace",
  url: 'https://www.huts.co.zw',
  logo: '/logo.png',
  logoHighRes: '/huts-high-resolution-logo.png',

  colors: {
    pureWhite: '#FFFFFF',
    offWhite: '#F8F9FA',
    lightGray: '#E9ECEF',
    mediumGray: '#ADB5BD',
    darkGray: '#495057',
    charcoal: '#212529',
    pureBlack: '#000000',
    accentRed: '#FF6B6B',
    accentGreen: '#51CF66',
  },

  fonts: {
    family: 'Inter',
    fallback: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  /** Typography scale (px) matching the site's Tailwind config */
  typography: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },

  /** Tailwind responsive breakpoints (min-width px) */
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },

  /** Standard image dimensions by platform/use */
  dimensions: {
    og: { width: 1200, height: 630 },
    twitter: { width: 1200, height: 675 },
    twitterSummary: { width: 800, height: 418 },
    instagramSquare: { width: 1080, height: 1080 },
    instagramPortrait: { width: 1080, height: 1350 },
    instagramLandscape: { width: 1080, height: 566 },
    pinterest: { width: 1000, height: 1500 },
    whatsapp: { width: 400, height: 400 },
  },

  /** Common spacing values (px) used in OG/social templates */
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
  },

  /** Border radius (px) */
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
} as const

export type BrandDimension = keyof typeof BRAND.dimensions
export type BrandColor = keyof typeof BRAND.colors
