/**
 * Design System Constants
 * Centralized constants for consistent UI implementation across the application
 */

/**
 * Standard icon sizes for consistent visual hierarchy
 * Use these constants instead of hardcoded pixel values
 * 
 * @example
 * import { ICON_SIZES } from '@/lib/constants'
 * <Search size={ICON_SIZES.md} />
 */
export const ICON_SIZES = {
  xs: 12,   // Tiny inline icons (badges, tight spaces)
  sm: 14,   // Small inline icons (text labels, compact UI)
  md: 16,   // Standard buttons/cards (default for most use cases)
  lg: 20,   // Large buttons/features (CTAs, emphasis)
  xl: 24,   // Decorative/section headers
  '2xl': 32, // Hero sections, large decorative
  '3xl': 48, // Empty states, major decorative elements
} as const

export type IconSize = keyof typeof ICON_SIZES

/**
 * Standard spacing values matching Tailwind's spacing scale
 * Use for consistent padding, margins, and gaps
 */
export const SPACING = {
  xs: '0.5rem',   // 8px
  sm: '0.75rem',  // 12px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
} as const

/**
 * Container max-widths for different layouts
 */
export const CONTAINER_WIDTHS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  content: '1280px', // Standard content width
} as const

/**
 * Z-index layers for consistent stacking
 */
export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  popover: 1400,
  toast: 1500,
} as const

/**
 * Animation durations (in milliseconds)
 */
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 200,
  slow: 300,
  slower: 500,
} as const

/**
 * Breakpoint values (must match tailwind.config.ts)
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

/**
 * Tiny 1x1 pixel gray base64 image for blur-up placeholder.
 * Use with Next.js Image: placeholder="blur" blurDataURL={BLUR_PLACEHOLDER}
 */
export const BLUR_PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P7DfwAJhAPk0x1VwQAAAABJRU5ErkJggg=='
