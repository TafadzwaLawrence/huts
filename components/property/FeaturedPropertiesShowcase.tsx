'use client'

import { useState, useEffect, useRef } from 'react'
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

// Helper function for price display
const getPriceDisplay = (property: Property) => {
  if (property.listing_type === 'sale') {
    return formatSalePrice(property.sale_price ?? 0)
  }
  if (property.rental_period === 'nightly' && property.nightly_price) {
    return `${formatPrice(property.nightly_price)}/night`
  }
  return `${formatPrice(property.price ?? 0)}/mo`
}

// Skeleton loader component
const PropertyCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-200 mb-3" />
    <div className="h-8 bg-gray-200 rounded w-3/4 mt-2" />
    <div className="mt-3 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
      <div className="flex gap-3 mt-2 pt-2 border-t border-gray-100">
        <div className="h-4 bg-gray-200 rounded w-16" />
        <div className="h-4 bg-gray-200 rounded w-16" />
      </div>
    </div>
  </div>
)

export default function FeaturedPropertiesShowcase({ properties }: { properties: Property[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const sectionRef = useRef<HTMLElement>(null)

  if (properties.length === 0) return null

  // Calculate max index safely
  const maxIndex = Math.max(0, properties.length - 3)
  const visibleProperties = properties.slice(currentIndex, currentIndex + 3)

  // Simulate loading (remove this in production - just for demo)
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious()
      } else if (e.key === 'ArrowRight') {
        goToNext()
      }
    }
    
    const section = sectionRef.current
    if (section) {
      section.addEventListener('keydown', handleKeyDown)
      return () => section.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentIndex, maxIndex])

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return
    
    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext()
      } else {
        goToPrevious()
      }
    }
    setTouchStart(0)
  }

  const isPrevDisabled = currentIndex === 0
  const isNextDisabled = currentIndex >= maxIndex

  return (
    <section 
      ref={sectionRef}
      className="py-16 bg-white"
      aria-labelledby="featured-heading"
      tabIndex={0}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="container-main px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 id="featured-heading" className="text-3xl font-bold text-black mb-2">
            Featured Properties
          </h2>
          <p className="mx-auto max-w-xl text-sm text-black leading-6">
            Browse our handpicked selection of premium listings
          </p>
        </div>

        <div className="relative px-0 sm:px-8 md:px-12">
          {/* Navigation Buttons - Hidden on mobile, visible on tablet+ */}
          {!isPrevDisabled && (
            <button
              onClick={goToPrevious}
              className="hidden sm:flex absolute -left-4 md:-left-10 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 rounded-full bg-black text-white shadow-lg hover:bg-charcoal hover:scale-110 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              aria-label="Previous properties"
              aria-disabled={isPrevDisabled}
            >
              <ChevronLeft size={20} />
            </button>
          )}
          
          {!isNextDisabled && (
            <button
              onClick={goToNext}
              className="hidden sm:flex absolute -right-4 md:-right-10 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 rounded-full bg-black text-white shadow-lg hover:bg-charcoal hover:scale-110 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              aria-label="Next properties"
              aria-disabled={isNextDisabled}
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Cards Grid with Live Region for Screen Readers */}
          <div 
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
            aria-live="polite"
            aria-atomic="true"
          >
            {isLoading ? (
              // Show skeleton loaders
              <>
                <PropertyCardSkeleton />
                <PropertyCardSkeleton />
                <PropertyCardSkeleton />
              </>
            ) : (
              visibleProperties.map((property, index) => (
                <Link
                  key={property.id}
                  href={`/property/${property.slug}`}
                  className="group block focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded-lg transition-shadow"
                >
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 mb-3">
                    <Image
                      src={property.primary_image}
                      alt={property.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                      priority={index === 0}
                      loading={index < 2 ? "eager" : "lazy"}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJrWCgAACaAACdAACdAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k="
                    />
                  </div>
                  
                  <p className="text-2xl font-bold text-black mt-2">
                    {getPriceDisplay(property)}
                  </p>
                  
                  <div className="mt-3 space-y-1">
                    <p className="text-sm font-semibold text-black line-clamp-2">
                      {property.title}
                    </p>
                    <p className="text-sm text-black font-medium">
                      {property.address}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-black mt-2 pt-2 border-t border-gray-100">
                      <span className="flex items-center gap-1">
                        <Bed size={14} />
                        {property.bedrooms} {property.bedrooms === 1 ? 'bed' : 'beds'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath size={14} />
                        {property.bathrooms} {property.bathrooms === 1 ? 'bath' : 'baths'}
                      </span>
                      {property.square_feet > 0 && (
                        <span>{property.square_feet.toLocaleString()} sqft</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Slide Indicators - Only show if more than 3 properties */}
          {maxIndex > 0 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                    idx === currentIndex
                      ? 'w-8 h-2 bg-black rounded-full'
                      : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                  aria-current={idx === currentIndex ? 'true' : 'false'}
                />
              ))}
            </div>
          )}

          {/* Mobile Swipe Hint */}
          <div className="text-center mt-4 sm:hidden">
            <p className="text-xs text-gray-400">← Swipe to see more →</p>
          </div>
        </div>
      </div>
    </section>
  )
}