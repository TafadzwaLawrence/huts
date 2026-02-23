'use client'

import { MapPin, Bed, Bath, Square, Car } from 'lucide-react'
import { formatPrice, formatSalePrice } from '@/lib/utils'
import PropertyActions from './PropertyActions'

interface PropertyHeaderProps {
  property: {
    id: string
    title: string
    description?: string | null
    city: string
    neighborhood?: string | null
    state?: string | null
    price?: number | null
    sale_price?: number | null
    listing_type?: string | null
    beds: number
    baths: number
    sqft?: number | null
    parking_spaces?: number | null
    deposit?: number | null
    property_type?: string | null
    status?: string | null
  }
  slug: string
}

export default function PropertyHeader({ property, slug }: PropertyHeaderProps) {
  const isRental = property.listing_type === 'rent' || (!property.listing_type && property.price)
  const isSale = property.listing_type === 'sale' || !!property.sale_price

  const locationParts: string[] = []
  if (property.neighborhood && property.neighborhood !== property.city) {
    locationParts.push(property.neighborhood)
  }
  locationParts.push(property.city)
  if (property.state && property.state !== property.city) {
    locationParts.push(property.state)
  }
  const locationString = locationParts.join(', ')

  const propertyTypeDisplay = property.property_type
    ? property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)
    : 'Property'

  return (
    <div className="border-b border-[#E9ECEF] pb-6 mb-6">
      {/* Price row */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-bold text-[#212529] tracking-tight">
              {isSale ? formatSalePrice(property.sale_price ?? 0) : formatPrice(property.price ?? 0)}
            </span>
            {isRental && !isSale && (
              <span className="text-base text-[#ADB5BD] font-medium">/mo</span>
            )}
          </div>
          {property.deposit && isRental && (
            <p className="text-sm text-[#495057] mt-1">
              Deposit: {formatPrice(property.deposit)}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0">
          <PropertyActions
            propertyId={property.id}
            propertyTitle={property.title}
            propertyDescription={property.description || `${property.beds} bed, ${property.baths} bath ${propertyTypeDisplay} in ${property.city}`}
          />
        </div>
      </div>

      {/* Stats row - Zillow style: bold stats inline */}
      <div className="flex items-center gap-1 text-[#212529] mb-2">
        <span className="font-bold text-lg">{property.beds}</span>
        <span className="text-[#495057] text-sm mr-3">bd</span>

        <span className="text-[#ADB5BD]">|</span>

        <span className="font-bold text-lg ml-3">{property.baths}</span>
        <span className="text-[#495057] text-sm mr-3">ba</span>

        {property.sqft && (
          <>
            <span className="text-[#ADB5BD]">|</span>
            <span className="font-bold text-lg ml-3">{property.sqft.toLocaleString()}</span>
            <span className="text-[#495057] text-sm mr-3">sqft</span>
          </>
        )}

        {property.parking_spaces && property.parking_spaces > 0 && (
          <>
            <span className="text-[#ADB5BD]">|</span>
            <span className="font-bold text-lg ml-3">{property.parking_spaces}</span>
            <span className="text-[#495057] text-sm">parking</span>
          </>
        )}
      </div>

      {/* Address */}
      <div className="flex items-center gap-1.5 text-[#495057]">
        <MapPin size={14} className="text-[#ADB5BD] flex-shrink-0" />
        <span className="text-sm">{locationString}, Zimbabwe</span>
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className="inline-flex items-center bg-[#212529] text-white px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wide">
          {isSale ? 'For Sale' : 'For Rent'}
        </span>
        <span className="inline-flex items-center bg-[#F8F9FA] text-[#495057] px-2.5 py-0.5 rounded text-xs font-medium border border-[#E9ECEF]">
          {propertyTypeDisplay}
        </span>
        {isSale && property.sqft && property.sale_price && (
          <span className="inline-flex items-center bg-[#F8F9FA] text-[#495057] px-2.5 py-0.5 rounded text-xs font-medium border border-[#E9ECEF]">
            ${Math.round((property.sale_price / 100) / property.sqft)}/sqft
          </span>
        )}
      </div>
    </div>
  )
}
