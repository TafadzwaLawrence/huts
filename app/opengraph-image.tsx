import { ImageResponse } from 'next/og'
import { BRAND } from '@/lib/brand'
import { loadBoldFont } from '@/lib/og-fonts'
import { brandedCard, loadLogo } from '@/lib/og-templates'

export const size = BRAND.dimensions.og
export const contentType = 'image/png'

export default async function Image() {
  const [fonts, logoSrc] = await Promise.all([loadBoldFont(), loadLogo()])

  return new ImageResponse(
    brandedCard({
      title: BRAND.name,
      subtitle: BRAND.tagline,
      footer: BRAND.subtitle,
      logoSrc,
    }),
    { ...size, fonts }
  )
}
