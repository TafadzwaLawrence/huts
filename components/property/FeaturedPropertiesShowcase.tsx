'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Bed, Bath, MapPin } from 'lucide-react'
import { formatPrice, formatSalePrice } from '@/lib/utils'
import { ICON_SIZES } from '@/lib/constants'

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

const getPriceDisplay = (property: Property) => {
  if (property.listing_type === 'sale') {
    return formatSalePrice(property.sale_price ?? 0)
  }
  if (property.rental_period === 'nightly' && property.nightly_price) {
    return `${formatPrice(property.nightly_price)}/night`
  }
  return `${formatPrice(property.price ?? 0)}/mo`
}

// Skeleton loader matching the design system
const PropertyCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-[#F8F9FA] mb-3" />
    <div className="h-7 bg-[#F8F9FA] rounded w-2/3 mt-2" />
    <div className="mt-3 space-y-2">
      <div className="h-4 bg-[#F8F9FA] rounded w-full" />
      <div className="h-4 bg-[#F8F9FA] rounded w-3/4" />
      <div className="flex gap-3 mt-2 pt-2 border-t border-[#E9ECEF]">
        <div className="h-4 bg-[#F8F9FA] rounded w-14" />
        <div className="h-4 bg-[#F8F9FA] rounded w-14" />
      </div>
    </div>
  </div>
)

export default function FeaturedPropertiesShowcase({ properties }: { properties: Property[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  if (properties.length === 0) return null

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const itemsPerView = isMobile ? 1 : 3
  const maxIndex = Math.max(0, properties.length - itemsPerView)
  const visibleProperties = properties.slice(currentIndex, currentIndex + itemsPerView)

  // Simulate loading (replace with actual loading state)
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const goToPrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1))
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious()
      else if (e.key === 'ArrowRight') goToNext()
    }
    const section = sectionRef.current
    if (section) {
      section.addEventListener('keydown', handleKeyDown)
      return () => section.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentIndex, maxIndex])

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return
    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNext()
      else goToPrevious()
    }
    setTouchStart(0)
  }

  const isPrevDisabled = currentIndex === 0
  const isNextDisabled = currentIndex >= maxIndex

  return (
    <section
      ref={sectionRef}
      className="py-12 md:py-16 bg-white"
      aria-labelledby="featured-heading"
      tabIndex={0}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 id="featured-heading" className="text-2xl md:text-3xl font-bold text-[#212529] mb-2">
            Featured Properties
          </h2>
          <p className="text-sm text-[#495057]">
            Browse our handpicked selection of premium listings
          </p>
        </div>

        <div className="relative px-0 sm:px-4">
          {/* Navigation Buttons - desktop only, styled like carousel */}
          {!isPrevDisabled && !isMobile && (
            <button
              onClick={goToPrevious}
              className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm border border-[#E9ECEF] hover:bg-white hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-1 transition-all duration-200"
              aria-label="Previous properties"
            >
              <ChevronLeft size={ICON_SIZES.md} className="text-[#212529]" />
            </button>
          )}
          {!isNextDisabled && !isMobile && (
            <button
              onClick={goToNext}
              className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm border border-[#E9ECEF] hover:bg-white hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-1 transition-all duration-200"
              aria-label="Next properties"
            >
              <ChevronRight size={ICON_SIZES.md} className="text-[#212529]" />
            </button>
          )}

          {/* Cards Grid */}
          <div
            className={`grid gap-5 ${
              isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}
            aria-live="polite"
            aria-atomic="true"
          >
            {isLoading
              ? (isMobile ? <PropertyCardSkeleton /> : Array(3).fill(0).map((_, i) => <PropertyCardSkeleton key={i} />))
              : visibleProperties.map((property, index) => (
                  <Link
                    key={property.id}
                    href={`/property/${property.slug}`}
                    className="group block focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-2 rounded-lg transition-all duration-200 hover:shadow-md"
                  >
                    <article className="bg-white rounded-lg border border-[#E9ECEF] overflow-hidden transition-all duration-300 hover:border-[#212529]/20">
                      {/* Image Container */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#F8F9FA]">
                        <Image
                          src={property.primary_image}
                          alt={property.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          priority={index === 0}
                          loading={index < 2 ? 'eager' : 'lazy'}
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABwgJ/8QAJRAAAgEDAwMFAQAAAAAAAAAAAQIDBAURBhIHIzExCBMUQVFx/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAeEQABAwQDAQAAAAAAAAAAAAABAAIDBBEhMQUSQf/aAAwDAQACEQMRAD8Av+u25ts1Pqe8agt2qLpQwXS4T3BYadIWjRpZGkKAuh48S2M4zjOR5Gg0S0d0T0Dt/piy2Ca+3a4U1qtsNvSonaNZJRFGsfNgqkBmxkgEDPjxo306Ah6W0m+6QP/Z"
                        />
                      </div>

                      {/* Content */}
                      <div className="p-3">
                        {/* Price */}
                        <div className="text-xl font-bold text-[#212529] tracking-tight leading-tight mb-1">
                          {getPriceDisplay(property)}
                        </div>

                        {/* Title */}
                        <p className="text-sm font-semibold text-[#212529] line-clamp-2 mb-1">
                          {property.title}
                        </p>

                        {/* Address */}
                        <div className="flex items-start gap-1 text-xs text-[#6C757D] mb-2">
                          <MapPin size={12} className="mt-0.5 flex-shrink-0 text-[#ADB5BD]" />
                          <span className="line-clamp-1">{property.address}, {property.city}</span>
                        </div>

                        {/* Details */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[#495057] pt-2 border-t border-[#E9ECEF]">
                          <span className="flex items-center gap-1">
                            <Bed size={14} className="text-[#ADB5BD]" />
                            <span>{property.bedrooms} {property.bedrooms === 1 ? 'bed' : 'beds'}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Bath size={14} className="text-[#ADB5BD]" />
                            <span>{property.bathrooms} {property.bathrooms === 1 ? 'bath' : 'baths'}</span>
                          </span>
                          {property.square_feet > 0 && (
                            <>
                              <span className="text-[#ADB5BD]">·</span>
                              <span>{property.square_feet.toLocaleString()} sqft</span>
                            </>
                          )}
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
          </div>

          {/* Dot Indicators */}
          {maxIndex > 0 && (
            <div className="flex justify-center gap-1.5 mt-8">
              {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-1 rounded-full ${
                    idx === currentIndex
                      ? 'w-6 h-1.5 bg-[#212529]'
                      : 'w-1.5 h-1.5 bg-[#ADB5BD] hover:bg-[#495057]'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                  aria-current={idx === currentIndex ? 'true' : 'false'}
                />
              ))}
            </div>
          )}

          {/* Mobile Swipe Hint */}
          {isMobile && maxIndex > 0 && (
            <div className="text-center mt-4 animate-pulse">
              <p className="text-xs text-[#ADB5BD] flex items-center justify-center gap-2">
                <ChevronLeft size={12} />
                Swipe to see more
                <ChevronRight size={12} />
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}