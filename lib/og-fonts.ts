/**
 * Font loading utility for Satori / next/og image generation.
 * Reads Inter TTF fonts bundled in public/fonts/ for reliable rendering.
 * Satori requires TTF or OTF — woff/woff2 are NOT supported.
 */

import { readFile } from 'fs/promises'
import { join } from 'path'
import { BRAND } from './brand'

interface SatoriFont {
  name: string
  data: ArrayBuffer
  weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
  style: 'normal' | 'italic'
}

// In-memory cache — persists across requests within the same serverless instance
let fontCache: SatoriFont[] | null = null
let boldFontCache: SatoriFont[] | null = null

const FONT_DIR = join(process.cwd(), 'public', 'fonts')

const FONT_FILES: Record<number, string> = {
  400: 'Inter-Regular.ttf',
  500: 'Inter-Medium.ttf',
  600: 'Inter-SemiBold.ttf',
  700: 'Inter-Bold.ttf',
}

async function readFontFile(weight: number): Promise<ArrayBuffer> {
  const filename = FONT_FILES[weight]
  if (!filename) throw new Error(`No font file mapped for weight ${weight}`)
  const buffer = await readFile(join(FONT_DIR, filename))
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
}

/**
 * Load Inter font in multiple weights for Satori rendering.
 * Pass the result to `ImageResponse` options: `{ fonts: await loadFonts() }`
 *
 * Loads: Regular (400), Medium (500), Semibold (600), Bold (700)
 */
export async function loadFonts(): Promise<SatoriFont[]> {
  if (fontCache) return fontCache

  const weights = [
    BRAND.fonts.weights.regular,
    BRAND.fonts.weights.medium,
    BRAND.fonts.weights.semibold,
    BRAND.fonts.weights.bold,
  ] as const

  const fontBuffers = await Promise.all(weights.map((w) => readFontFile(w)))

  fontCache = fontBuffers.map((data, i) => ({
    name: BRAND.fonts.family,
    data,
    weight: weights[i] as SatoriFont['weight'],
    style: 'normal' as const,
  }))

  return fontCache
}

/**
 * Load only bold weight — lighter alternative for simple images.
 */
export async function loadBoldFont(): Promise<SatoriFont[]> {
  if (boldFontCache) return boldFontCache

  const data = await readFontFile(BRAND.fonts.weights.bold)
  boldFontCache = [
    {
      name: BRAND.fonts.family,
      data,
      weight: 700,
      style: 'normal',
    },
  ]

  return boldFontCache
}
