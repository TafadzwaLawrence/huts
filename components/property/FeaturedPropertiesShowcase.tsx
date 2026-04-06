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
    <section className="py-16 bg-white">
      <div className="container-main">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-black mb-2">Featured Properties</h2>
          <p className="text-black">Browse our handpicked selection of premium listings</p>
        </div>
        <div className="relative">
          {/* Navigation */}
          {currentIndex > 0 && (
            <button
              onClick={goToPrevious}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-black text-white shadow-lg hover:bg-charcoal hover:scale-110 transition-all duration-200"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          {currentIndex < maxIndex && (
            <button
              onClick={goToNext}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-black text-white shadow-lg hover:bg-charcoal hover:scale-110 transition-all duration-200"
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 pb-8">
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
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="33vw"
                  />
                </div>
                <p className="text-2xl font-bold text-black mt-2">
                  {property.listing_type === 'sale' 
                    ? formatSalePrice(property.sale_price ?? 0)
                    : property.rental_period === 'nightly' && property.nightly_price
                      ? formatPrice(property.nightly_price) + '/night'
                      : formatPrice(property.price ?? 0) + '/mo'
                  }
                </p>
                <div className="mt-3 space-y-1">
                  <p className="text-sm font-semibold text-charcoal line-clamp-2">{property.title}</p>
                  <p className="text-xs text-dark-gray">{property.address}</p>
                  <div className="flex items-center gap-3 text-xs text-charcoal mt-2 pt-2 border-t border-light-gray">
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
                </div>
              </Link>
            ))}
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-8 h-2 bg-black rounded-full'
                    : 'w-2 h-2 bg-light-gray rounded-full hover:bg-dark-gray'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
