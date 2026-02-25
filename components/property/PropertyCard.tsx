'use client'

import Link from 'next/link'
import { MapPin, Heart, Home, Camera, Sofa, Users, Zap } from 'lucide-react'
import { PropertyWithImages, isRentalProperty, isSaleProperty, isStudentProperty } from '@/types'
import { formatPrice, formatSalePrice } from '@/lib/utils'
import { ICON_SIZES } from '@/lib/constants'
import { ImageCarousel } from './ImageCarousel'
import { useState } from 'react'

interface PropertyCardProps {
  property: PropertyWithImages
  compact?: boolean
  noGrayscale?: boolean
}

export function PropertyCard({ property, compact = false, noGrayscale = false }: PropertyCardProps) {
  const [isNavigating, setIsNavigating] = useState(false)
  const images = property.property_images
  const sortedImages = [
    ...images.filter((img: any) => img.is_primary),
    ...images.filter((img: any) => !img.is_primary),
  ]

  const priceDisplay = isRentalProperty(property) && property.price
    ? `${formatPrice(property.price)}/mo`
    : isSaleProperty(property) && property.sale_price
    ? formatSalePrice(property.sale_price)
    : null

  const listingLabel = isSaleProperty(property)
    ? 'House for sale'
    : isRentalProperty(property)
    ? 'For rent'
    : null

  return (
    <Link 
      href={`/property/${property.slug || property.id}`} 
      className="block group relative"
      prefetch={true}
      onClick={() => setIsNavigating(true)}
    >
      {/* Loading overlay */}
      {isNavigating && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-xl">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-[#212529] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium text-[#212529]">Loading...</span>
          </div>
        </div>
      )}
      
      <article className="property-card">
        {/* Image */}
        <div className={`property-card-image ${compact ? 'h-40' : ''}`}>
          {sortedImages.length > 0 ? (
            <ImageCarousel images={sortedImages} title={property.title} noGrayscale={noGrayscale} />
          ) : (
            <div className="w-full h-full bg-[#F8F9FA] flex items-center justify-center">
              <Home className="text-[#ADB5BD]" size={ICON_SIZES['3xl']} />
            </div>
          )}

          {/* Student Housing Badges */}
          {isStudentProperty(property) && (
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[140px]">
              {property.furnished && (
                <div className="bg-[#212529]/90 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 shadow-md" title="Furnished">
                  <Sofa size={ICON_SIZES.xs} /> Furnished
                </div>
              )}
              {property.shared_rooms && (
                <div className="bg-[#212529]/90 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 shadow-md" title="Shared Rooms Available">
                  <Users size={ICON_SIZES.xs} /> Shared
                </div>
              )}
              {property.utilities_included && (
                <div className="bg-[#212529]/90 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 shadow-md" title="Utilities Included">
                  <Zap size={ICON_SIZES.xs} /> Utilities
                </div>
              )}
            </div>
          )}

          {/* Image Count Badge */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 z-10">
              <Camera size={ICON_SIZES.xs} />
              {images.length}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="absolute top-3 right-3 p-2 bg-white/95 backdrop-blur-sm rounded-full hover:bg-white hover:scale-110 transition-all duration-200 shadow-md hover:shadow-lg min-w-[36px] min-h-[36px] flex items-center justify-center group/save z-10"
            aria-label="Save property"
          >
            <Heart size={ICON_SIZES.md} className="text-[#212529] group-hover/save:fill-[#FF6B6B] group-hover/save:text-[#FF6B6B] transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className={compact ? 'px-3 py-2.5' : 'px-4 py-3'}>
          {/* Price — biggest element (Zillow style) */}
          {priceDisplay && (
            <div className="text-lg font-bold text-[#212529] tracking-tight leading-tight mb-0.5">
              {priceDisplay}
            </div>
          )}

          {/* Beds / Baths / Sqft inline */}
          <div className="flex items-center gap-1 text-sm text-[#495057] mb-1">
            <span><strong className="text-[#212529]">{property.beds}</strong> bd</span>
            <span className="text-[#ADB5BD]">|</span>
            <span><strong className="text-[#212529]">{property.baths}</strong> ba</span>
            {property.sqft && property.sqft > 0 && (
              <>
                <span className="text-[#ADB5BD]">|</span>
                <span><strong className="text-[#212529]">{property.sqft.toLocaleString()}</strong> sqft</span>
              </>
            )}
            {listingLabel && (
              <>
                <span className="text-[#ADB5BD] mx-0.5">-</span>
                <span className="text-[#495057]">{listingLabel}</span>
              </>
            )}
          </div>

          {/* Address */}
          <div className="flex items-center text-sm text-[#495057]">
            <MapPin size={12} className="mr-1 flex-shrink-0 text-[#ADB5BD]" />
            <span className="line-clamp-1">
              {property.title}, {property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
