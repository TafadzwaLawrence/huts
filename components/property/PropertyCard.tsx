'use client'

import Link from 'next/link'
import { MapPin, Heart, Home, Camera, Users } from 'lucide-react'
import { PropertyWithImages, isRentalProperty, isSaleProperty, isStudentProperty } from '@/types'
import { formatPrice, formatNightlyPrice, formatSalePrice } from '@/lib/utils'
import { ICON_SIZES } from '@/lib/constants'
import { ImageCarousel } from './ImageCarousel'
import { useState } from 'react'

interface PropertyCardProps {
  property: PropertyWithImages
  compact?: boolean
}

export function PropertyCard({ property, compact = false }: PropertyCardProps) {
  const [isNavigating, setIsNavigating] = useState(false)
  const images = property.property_images
  const sortedImages = [
    ...images.filter((img: any) => img.is_primary),
    ...images.filter((img: any) => !img.is_primary),
  ].map((img: any) => ({
    url: img.url || img.image_url,
    is_primary: img.is_primary,
    alt_text: property.title,
  }))

  const priceDisplay = isRentalProperty(property)
    ? (property.rental_period === 'nightly' || property.nightly_price)
      ? property.nightly_price
        ? `${formatNightlyPrice(property.nightly_price)}/night`
        : property.price
        ? `${formatPrice(property.price)}/mo`
        : null
      : property.price
      ? `${formatPrice(property.price)}/mo`
      : null
    : isSaleProperty(property) && property.sale_price
    ? formatSalePrice(property.sale_price)
    : null

  const listingLabel = isSaleProperty(property)
    ? 'For sale'
    : isRentalProperty(property)
    ? 'For rent'
    : null

  return (
    <Link 
      href={`/property/${property.id}`} 
      className="block group relative"
      prefetch={true}
      onClick={() => setIsNavigating(true)}
    >
      {/* Loading overlay - matches the minimalist design */}
      {isNavigating && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] z-50 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-6 h-6 border-2 border-[#212529] border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-medium text-[#495057]">Loading...</span>
          </div>
        </div>
      )}
      
      <article className="bg-white rounded-lg border border-[#E9ECEF] overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#212529]/20">
        {/* Image Container */}
        <div className={`relative ${compact ? 'h-44' : 'h-56'} overflow-hidden bg-[#F8F9FA]`}>
          {sortedImages.length > 0 ? (
            <ImageCarousel images={sortedImages} title={property.title} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Home className="text-[#ADB5BD]" size={ICON_SIZES['3xl']} />
            </div>
          )}

          {/* Student Housing Badge */}
          {isStudentProperty(property) && (
            <div className="absolute top-3 left-3 z-10">
              <div className="bg-[#212529]/90 backdrop-blur-sm text-white px-2 py-1 rounded-md text-[10px] font-semibold flex items-center gap-1 shadow-sm">
                <Users size={12} />
                Student
              </div>
            </div>
          )}

          {/* Image Count Badge */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1 z-10 shadow-sm">
              <Camera size={10} />
              {images.length}
            </div>
          )}

          {/* Save Button - improved styling */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md z-10 focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-1"
            aria-label="Save property"
          >
            <Heart size={16} className="text-[#212529] group-hover/save:fill-[#FF6B6B] group-hover/save:text-[#FF6B6B] transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className={compact ? 'p-3' : 'p-4'}>
          {/* Price - bold and prominent */}
          {priceDisplay && (
            <div className="text-xl font-bold text-[#212529] tracking-tight leading-tight mb-1">
              {priceDisplay}
            </div>
          )}

          {/* Beds / Baths / Sqft inline */}
          <div className="flex flex-wrap items-center gap-x-1 text-sm text-[#495057] mb-1.5">
            <span><span className="font-semibold text-[#212529]">{property.bedrooms}</span> bd</span>
            <span className="text-[#ADB5BD]">·</span>
            <span><span className="font-semibold text-[#212529]">{property.bathrooms}</span> ba</span>
            {property.square_feet && property.square_feet > 0 && (
              <>
                <span className="text-[#ADB5BD]">·</span>
                <span><span className="font-semibold text-[#212529]">{property.square_feet.toLocaleString()}</span> sqft</span>
              </>
            )}
            {listingLabel && (
              <>
                <span className="text-[#ADB5BD]">·</span>
                <span className="text-[#495057] text-xs">{listingLabel}</span>
              </>
            )}
          </div>

          {/* Address */}
          <div className="flex items-start gap-1 text-sm text-[#6C757D]">
            <MapPin size={12} className="mt-0.5 flex-shrink-0 text-[#ADB5BD]" />
            <span className="line-clamp-1 text-sm">
              {property.title}, {property.area ? `${property.area}, ` : ''}{property.city}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}