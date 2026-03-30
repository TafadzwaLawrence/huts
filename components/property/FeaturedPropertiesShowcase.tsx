'use client'

import { useState } from 'react'
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
  nightly_price?: number
  rental_period?: string
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

  if (properties.length === 0) return null

  const maxIndex = Math.max(0, properties.length - 3)
  const visibleProperties = properties.slice(currentIndex, currentIndex + 3)

  const goToPrevious = () => setCurrentIndex(prev => Math.max(0, prev - 1))
  const goToNext = () => setCurrentIndex(prev => Math.min(maxIndex, prev + 1))

  return (
    <section className="py-8 bg-white">
      <div className="container-main">
        <div className="relative">
          {/* Navigation */}
          {currentIndex > 0 && (
            <button
              onClick={goToPrevious}
              className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow text-[#212529] hover:bg-gray-50"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          {currentIndex < maxIndex && (
            <button
              onClick={goToNext}
              className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow text-[#212529] hover:bg-gray-50"
            >
              <ChevronRight size={18} />
            </button>
          )}

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6">
            {visibleProperties.map((property) => (
              <Link
                key={property.id}
                href={`/property/${property.slug}`}
                className="group block"
              >
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 mb-3">
                  <Image
                    src={property.primary_image}
                    alt={property.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="33vw"
                  />
                </div>
                <p className="text-lg font-semibold text-[#212529]">
                  {property.listing_type === 'sale' 
                    ? formatSalePrice(property.sale_price ?? 0)
                    : property.rental_period === 'nightly' && property.nightly_price
                      ? formatPrice(property.nightly_price) + '/night'
                      : formatPrice(property.price ?? 0) + '/mo'
                  }
                </p>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Bed size={14} />
                    {property.bedrooms}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath size={14} />
                    {property.bathrooms}
                  </span>
                  {property.square_feet > 0 && (
                    <span>{property.square_feet.toLocaleString()} sqft</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {property.city}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
