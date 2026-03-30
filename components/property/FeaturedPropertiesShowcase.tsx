'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Bed, Bath, ArrowRight } from 'lucide-react'
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
  created_at?: string
}

export default function FeaturedPropertiesShowcase({ properties }: { properties: Property[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)

  // Check if property is new (listed within last 7 days)
  const isNewListing = useCallback((createdAt?: string) => {
    if (!createdAt) return false
    const daysDiff = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    return daysDiff <= 7
  }, [])

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
  const visibleCount = Math.min(3, properties.length)

  const goToSlide = (index: number) => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex(Math.max(0, Math.min(maxIndex, index)))
    setTimeout(() => setIsAnimating(false), 300)
  }

  const goToPrevious = () => goToSlide(currentIndex - 1)
  const goToNext = () => goToSlide(currentIndex + 1)

  // Touch/swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNext()
      else goToPrevious()
    }
    touchStartX.current = null
  }

  // Get badge color based on listing type
  const getBadgeStyles = (property: Property) => {
    if (property.listing_type === 'sale') {
      return 'bg-emerald-600 text-white'
    }
    if (property.rental_period === 'nightly') {
      return 'bg-blue-600 text-white'
    }
    return 'bg-violet-600 text-white'
  }

  // Get badge text
  const getBadgeText = (property: Property) => {
    if (property.listing_type === 'sale') return 'For Sale'
    if (property.rental_period === 'nightly') return 'Nightly'
    return 'For Rent'
  }

  const visibleProperties = properties.slice(currentIndex, currentIndex + visibleCount)

  return (
    <section className="py-8 bg-white">
      <div className="container-main">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#212529]">Featured Listings</h2>
            <p className="text-sm text-[#6C757D] mt-1">Handpicked properties for you</p>
          </div>
          <Link
            href="/search"
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-[#212529] hover:text-[#495057] transition-colors"
          >
            View all
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Carousel with Navigation */}
        <div 
          className="relative"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Navigation Buttons */}
          {currentIndex > 0 && (
            <button
              onClick={goToPrevious}
              className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white shadow-lg border border-[#E9ECEF] text-[#212529] hover:bg-[#F8F9FA] hover:scale-105 transition-all"
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {currentIndex < maxIndex && (
            <button
              onClick={goToNext}
              className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white shadow-lg border border-[#E9ECEF] text-[#212529] hover:bg-[#F8F9FA] hover:scale-105 transition-all"
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Property Cards Grid with Animation */}
          <div 
            ref={containerRef} 
            className="overflow-hidden"
          >
            <div 
              className="grid grid-cols-1 md:grid-cols-3 gap-5 transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${currentIndex * (100 / visibleCount)}%)` }}
            >
              {properties.map((property) => (
                <Link
                  key={property.id}
                  href={`/property/${property.slug}`}
                  className="group block bg-white rounded-xl overflow-hidden border border-[#E9ECEF] hover:shadow-xl hover:border-[#ADB5BD] transition-all duration-300"
                >
                  {/* Image Container */}
                  <div className="relative h-52 overflow-hidden bg-[#F8F9FA]">
                    <Image
                      src={property.primary_image}
                      alt={property.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${getBadgeStyles(property)}`}>
                        {getBadgeText(property)}
                      </span>
                      {isNewListing(property.created_at) && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500 text-white">
                          New
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Property Info */}
                  <div className="p-4">
                    {/* Price */}
                    <p className="text-2xl font-bold text-[#212529] mb-2">
                      {property.listing_type === 'sale' 
                        ? formatSalePrice(property.sale_price ?? 0)
                        : property.rental_period === 'nightly' && property.nightly_price
                          ? formatPrice(property.nightly_price) + '/night'
                          : formatPrice(property.price ?? 0) + '/mo'
                      }
                    </p>

                    {/* Specs */}
                    <div className="flex items-center gap-4 text-sm text-[#6C757D] mb-3">
                      <span className="flex items-center gap-1.5">
                        <Bed size={15} />
                        <span className="font-medium">{property.bedrooms}</span> bd
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Bath size={15} />
                        <span className="font-medium">{property.bathrooms}</span> ba
                      </span>
                      {property.square_feet && property.square_feet > 0 && (
                        <span className="font-medium">{property.square_feet.toLocaleString()} sqft</span>
                      )}
                    </div>

                    {/* Address */}
                    <p className="text-sm text-[#495057] line-clamp-1 font-medium">
                      {property.address || property.city}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile View All Link */}
          <div className="sm:hidden mt-4 text-center">
            <Link
              href="/search"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#212529]"
            >
              View all properties
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Dot Indicators */}
        {properties.length > 3 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-8 bg-[#212529]'
                    : 'w-2 bg-[#DEE2E6] hover:bg-[#ADB5BD]'
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
