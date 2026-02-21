import { ImageResponse } from 'next/og'
import { NextRequest, NextResponse } from 'next/server'
import { BRAND, type BrandDimension } from '@/lib/brand'
import { loadFonts } from '@/lib/og-fonts'
import {
  brandedCard,
  propertyCard,
  socialSquare,
  socialPortrait,
  twitterCard,
  loadLogo,
} from '@/lib/og-templates'

const VALID_TEMPLATES = [
  'brandedCard',
  'propertyCard',
  'socialSquare',
  'socialPortrait',
  'twitterCard',
] as const

type TemplateName = (typeof VALID_TEMPLATES)[number]

/** Default dimensions per template when not overridden */
const TEMPLATE_DEFAULTS: Record<TemplateName, { width: number; height: number }> = {
  brandedCard: BRAND.dimensions.og,
  propertyCard: BRAND.dimensions.og,
  socialSquare: BRAND.dimensions.instagramSquare,
  socialPortrait: BRAND.dimensions.instagramPortrait,
  twitterCard: BRAND.dimensions.twitter,
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const template = searchParams.get('template') as TemplateName | null
  const title = searchParams.get('title')

  // Validate required params
  if (!template || !VALID_TEMPLATES.includes(template)) {
    return NextResponse.json(
      {
        error: `Invalid template. Valid options: ${VALID_TEMPLATES.join(', ')}`,
      },
      { status: 400 }
    )
  }

  if (!title) {
    return NextResponse.json({ error: 'Missing required parameter: title' }, { status: 400 })
  }

  // Optional params
  const subtitle = searchParams.get('subtitle') || undefined
  const footer = searchParams.get('footer') || undefined
  const imageUrl = searchParams.get('image') || undefined
  const price = searchParams.get('price') || undefined
  const city = searchParams.get('city') || undefined
  const beds = parseInt(searchParams.get('beds') || '0', 10)
  const baths = parseInt(searchParams.get('baths') || '0', 10)
  const badge = searchParams.get('badge') || undefined
  const listingType = (searchParams.get('listingType') as 'rent' | 'sale') || undefined

  // Optional dimension override — use preset name or explicit w/h
  const preset = searchParams.get('preset') as BrandDimension | null
  const widthParam = parseInt(searchParams.get('width') || '0', 10)
  const heightParam = parseInt(searchParams.get('height') || '0', 10)

  let size = TEMPLATE_DEFAULTS[template]
  if (preset && BRAND.dimensions[preset]) {
    size = BRAND.dimensions[preset]
  } else if (widthParam > 0 && heightParam > 0) {
    // Clamp to reasonable bounds to prevent abuse
    size = {
      width: Math.min(widthParam, 4096),
      height: Math.min(heightParam, 4096),
    }
  }

  // Render the selected template
  const logoSrc = await loadLogo()
  let jsx: React.ReactElement

  switch (template) {
    case 'brandedCard':
      jsx = brandedCard({ title, subtitle, footer, logoSrc })
      break
    case 'propertyCard':
      jsx = propertyCard({
        title,
        price: price || '$0',
        city: city || 'Zimbabwe',
        beds,
        baths,
        imageUrl,
        listingType,
        logoSrc,
      })
      break
    case 'socialSquare':
      jsx = socialSquare({ title, subtitle, imageUrl, badge, logoSrc })
      break
    case 'socialPortrait':
      jsx = socialPortrait({ title, price, subtitle, imageUrl, badge, logoSrc })
      break
    case 'twitterCard':
      jsx = twitterCard({ title, subtitle, imageUrl, logoSrc })
      break
  }

  const fonts = await loadFonts()

  return new ImageResponse(jsx, {
    ...size,
    fonts,
  })
}
