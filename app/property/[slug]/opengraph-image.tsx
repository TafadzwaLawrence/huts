import { ImageResponse } from 'next/og'
import { createStaticClient } from '@/lib/supabase/server'
import { formatPrice, formatSalePrice } from '@/lib/utils'
import { BRAND } from '@/lib/brand'
import { loadFonts } from '@/lib/og-fonts'
import { brandedCard, propertyCard, loadLogo } from '@/lib/og-templates'

export const size = BRAND.dimensions.og
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createStaticClient()

  // Fetch property by slug then ID (with properly ordered images)
  let { data: property } = await supabase
    .from('properties')
    .select('title, price, sale_price, listing_type, city, beds, baths, sqft, property_images(url, is_primary, order)')
    .eq('slug', slug)
    .order('is_primary', { ascending: false, referencedTable: 'property_images' })
    .order('order', { ascending: true, referencedTable: 'property_images' })
    .single()

  if (!property) {
    const result = await supabase
      .from('properties')
      .select('title, price, sale_price, listing_type, city, beds, baths, sqft, property_images(url, is_primary, order)')
      .eq('id', slug)
      .order('is_primary', { ascending: false, referencedTable: 'property_images' })
      .order('order', { ascending: true, referencedTable: 'property_images' })
      .single()
    property = result.data
  }

  const [fonts, logoSrc] = await Promise.all([loadFonts(), loadLogo()])

  if (!property) {
    return new ImageResponse(
      brandedCard({
        title: BRAND.name,
        subtitle: 'Property Not Found',
        logoSrc,
      }),
      { ...size, fonts }
    )
  }

  const isRental = property.listing_type === 'rent'
  const priceDisplay = isRental
    ? `${formatPrice(property.price)}/mo`
    : formatSalePrice(property.sale_price)

  // Get the primary image or first ordered image
  const primaryImage = Array.isArray(property.property_images) && property.property_images.length > 0
    ? property.property_images.find((img: any) => img.is_primary)?.url || property.property_images[0]?.url
    : null

  return new ImageResponse(
    propertyCard({
      title: property.title,
      price: priceDisplay,
      city: property.city,
      beds: property.beds,
      baths: property.baths,
      sqft: property.sqft,
      imageUrl: primaryImage,
      listingType: property.listing_type as 'rent' | 'sale',
      logoSrc,
    }),
    { ...size, fonts }
  )
}
