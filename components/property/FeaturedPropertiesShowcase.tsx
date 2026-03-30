'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, MapPin, Bed, Bath, Square } from 'lucide-react'
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
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlay || properties.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % properties.length)
    }, 6000) // Change property every 6 seconds

    return () => clearInterval(interval)
  }, [isAutoPlay, properties.length])

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + properties.length) % properties.length)
    setIsAutoPlay(false)
  }, [properties.length])

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % properties.length)
    setIsAutoPlay(false)
  }, [properties.length])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
    setIsAutoPlay(false)
  }, [])

  // Resume auto-play after 8 seconds of inactivity
  useEffect(() => {
    if (isAutoPlay) return
    const timeout = setTimeout(() => setIsAutoPlay(true), 8000)
    return () => clearTimeout(timeout)
  }, [isAutoPlay])

  if (properties.length === 0) return null

  const property = properties[currentIndex]

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container-main">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#212529] text-center">
            Featured Properties
          </h2>
          <p className="text-center text-[#495057] mt-2">
            Explore recently listed homes and rentals
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Main Carousel */}
          <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden bg-[#F8F9FA]">
            {/* Image */}
            {property.primary_image ? (
              <Image
                src={property.primary_image}
                alt={property.title}
                fill
                className="object-cover w-full h-full transition-opacity duration-500"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 1200px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E9ECEF] to-[#F8F9FA]">
                <Square className="text-[#ADB5BD]" size={80} />
              </div>
            )}

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Property Info - Bottom Left */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
              <h3 className="text-2xl md:text-3xl font-bold mb-2 line-clamp-2">
                {property.title}
              </h3>

              {/* Location */}
              <div className="flex items-center gap-1.5 text-sm md:text-base mb-4 opacity-90">
                <MapPin size={16} />
                <span>{property.address || property.city}</span>
              </div>

              {/* Price and Details */}
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                <div>
                  <p className="text-sm text-white/80">Price</p>
                  <p className="text-2xl md:text-3xl font-bold">
                    {property.listing_type === 'rent'
                      ? formatPrice(property.price ?? 0) + '/mo'
                      : formatSalePrice(property.sale_price ?? 0)}
                  </p>
                </div>

                {/* Property Features */}
                <div className="flex gap-4 md:gap-6 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Bed size={16} />
                    <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bath size={16} />
                    <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Square size={16} />
                    <span>{(property.square_feet / 1000).toFixed(1)}K sqft</span>
                  </div>
                </div>
              </div>

              {/* View Button */}
              <Link
                href={`/property/${property.slug}`}
                className="inline-block mt-4 px-6 py-2 bg-white text-[#212529] font-semibold rounded-lg hover:bg-[#F8F9FA] transition-colors"
              >
                View Details
              </Link>
            </div>

            {/* Listing Type Badge */}
            <div className="absolute top-4 right-4 bg-[#212529] text-white px-3 py-1 rounded-full text-xs font-semibold">
              {property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Previous property"
            >
              <ChevronLeft size={28} />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Next property"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          {/* Dot Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {properties.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`transition-all ${
                  idx === currentIndex
                    ? 'w-8 h-2 bg-[#212529] rounded-full'
                    : 'w-2 h-2 bg-[#E9ECEF] hover:bg-[#ADB5BD] rounded-full'
                }`}
                aria-label={`Go to property ${idx + 1}`}
              />
            ))}
          </div>

          {/* Counter */}
          <div className="text-center mt-4 text-sm text-[#495057]">
            {currentIndex + 1} of {properties.length}
          </div>
        </div>
      </div>
    </section>
  )
}
