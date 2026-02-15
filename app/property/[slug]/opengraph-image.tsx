import { ImageResponse } from 'next/og'
import { createStaticClient } from '@/lib/supabase/server'
import { formatPrice, formatSalePrice } from '@/lib/utils'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createStaticClient()
  
  // Fetch property by slug then ID
  let { data: property } = await supabase
    .from('properties')
    .select('title, price, sale_price, listing_type, city, beds, baths, property_images(url)')
    .eq('slug', slug)
    .single()
  
  if (!property) {
    const result = await supabase
      .from('properties')
      .select('title, price, sale_price, listing_type, city, beds, baths, property_images(url)')
      .eq('id', slug)
      .single()
    property = result.data
  }
  
  if (!property) {
    // Return default branded image if property not found
    return new ImageResponse(
      (
        <div
          style={{
            background: '#F8F9FA',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter',
          }}
        >
          <div style={{ fontSize: 48, color: '#495057' }}>Property Not Found</div>
        </div>
      ),
      { ...size }
    )
  }
  
  const isRental = property.listing_type === 'rent'
  const priceDisplay = isRental 
    ? `${formatPrice(property.price)}/mo` 
    : formatSalePrice(property.sale_price)
  const propertyImage = property.property_images?.[0]?.url
  
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
        }}
      >
        {/* Property image background (if available) */}
        {propertyImage ? (
          <img
            src={propertyImage}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            alt=""
          />
        ) : (
          <div style={{ background: '#E9ECEF', width: '100%', height: '100%' }} />
        )}
        
        {/* Black overlay gradient */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60%',
            background: 'linear-gradient(to top, rgba(33, 37, 41, 0.95), transparent)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '48px',
          }}
        >
          {/* Property details */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              color: '#FFFFFF',
            }}
          >
            {/* Price badge */}
            <div
              style={{
                background: '#212529',
                color: '#FFFFFF',
                fontSize: 42,
                fontWeight: 700,
                padding: '16px 24px',
                borderRadius: '12px',
                display: 'inline-block',
                alignSelf: 'flex-start',
                marginBottom: 16,
                fontFamily: 'Inter',
              }}
            >
              {priceDisplay}
            </div>
            
            {/* Title */}
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                marginBottom: 12,
                fontFamily: 'Inter',
                lineHeight: 1.2,
                maxWidth: '90%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {property.title}
            </div>
            
            {/* Location + specs */}
            <div
              style={{
                fontSize: 28,
                color: '#E9ECEF',
                display: 'flex',
                gap: 24,
                fontFamily: 'Inter',
              }}
            >
              <span>{property.city}, Zimbabwe</span>
              <span>•</span>
              <span>{property.beds} bed</span>
              <span>•</span>
              <span>{property.baths} bath</span>
            </div>
          </div>
          
          {/* Huts logo (top right) */}
          <div
            style={{
              position: 'absolute',
              top: 32,
              right: 48,
              color: '#FFFFFF',
              fontSize: 32,
              fontWeight: 700,
              fontFamily: 'Inter',
              background: 'rgba(33, 37, 41, 0.9)',
              padding: '12px 20px',
              borderRadius: '8px',
            }}
          >
            HUTS
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
