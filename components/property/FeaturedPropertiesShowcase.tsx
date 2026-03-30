'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Bed, Bath } from 'lucide-react'
import { formatPrice, formatSalePrice } from '@/lib/utils'

interface Property {
  id: string
  slug: string
  title: string
  price?: number
  sale_price?: number
  bedrooms: number
  bathrooms: number
  square_feet: number
  address: string
  city: string
  listing_type: 'rent' | 'sale'
  primary_image: string
}

export default function FeaturedPropertiesShowcase({ properties }: { properties: Property[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  if (properties.length === 0) {
    return (
      <section className="py-8 bg-white">
        <div className="container-main">
          <div className="bg-[#F8F9FA] rounded-xl p-8 text-center border border-[#E9ECEF]">
            <p className="text-[#6C757D]">No featured properties available at the moment.</p>
            <Link
              href="/search"
              className="inline-block mt-4 px-4 py-2 bg-[#212529] text-white text-sm font-semibold rounded-lg hover:bg-[#343A40] transition-colors"
            >
              Browse All Properties
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const maxIndex = Math.max(0, properties.length - 3)

  const goToPrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1))
  }

  const visibleProperties = properties.slice(currentIndex, currentIndex + 3)

  return (
    <section className="py-6 bg-white">
      <div className="container-main">
        {/* Carousel with Navigation */}
        <div className="relative">
          {/* Navigation Buttons */}
          {currentIndex > 0 && (
            <button
              onClick={goToPrevious}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-md border border-[#E9ECEF] text-[#212529] hover:bg-[#F8F9FA] transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {currentIndex < maxIndex && (
            <button
              onClick={goToNext}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-md border border-[#E9ECEF] text-[#212529] hover:bg-[#F8F9FA] transition-colors"
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Property Cards Grid */}
          <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {visibleProperties.map((property) => (
              <Link
                key={property.id}
                href={`/property/${property.slug}`}
                className="group block bg-white rounded-lg overflow-hidden border border-[#E9ECEF] hover:shadow-lg transition-shadow"
              >
                {/* Image Container - Shorter height */}
                <div className="relative h-48 overflow-hidden bg-[#F8F9FA]">
                  <Image
                    src={property.primary_image}
                    alt={property.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {/* Listing Type Badge */}
                  <div className="absolute top-3 left-3 bg-[#212529] text-white px-2 py-1 rounded text-xs font-medium">
                    {property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
                  </div>
                </div>

                {/* Property Info */}
                <div className="p-4">
                  {/* Price */}
                  <p className="text-xl font-bold text-[#212529] mb-1">
                    {property.listing_type === 'rent'
                      ? formatPrice(property.price ?? 0) + '/mo'
                      : formatSalePrice(property.sale_price ?? 0)}
                  </p>

                  {/* Specs */}
                  <div className="flex items-center gap-3 text-sm text-[#6C757D] mb-2">
                    <span className="flex items-center gap-1">
                      <Bed size={14} />
                      {property.bedrooms} bd
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath size={14} />
                      {property.bathrooms} ba
                    </span>
                    <span>{property.square_feet.toLocaleString()} sqft</span>
                  </div>

                  {/* Address */}
                  <p className="text-sm text-[#495057] line-clamp-1">
                    {property.address || property.city}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Dot Indicators */}
        {properties.length > 3 && (
          <div className="flex justify-center gap-1.5 mt-4">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'w-6 bg-[#212529]'
                    : 'w-1.5 bg-[#DEE2E6] hover:bg-[#ADB5BD]'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
