'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { ICON_SIZES } from '@/lib/constants'
import { PropertyWithImages } from '@/types'
import { PropertyCard } from './PropertyCard'

interface PropertyCarouselProps {
  properties: PropertyWithImages[]
  title?: string
  viewAllLink?: string
}

export function PropertyCarousel({ properties, title, viewAllLink }: PropertyCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.querySelector(':first-child')?.clientWidth || 300
    el.scrollBy({
      left: direction === 'left' ? -(cardWidth + 20) : (cardWidth + 20),
      behavior: 'smooth',
    })
  }

  if (properties.length === 0) return null

  return (
    <div className="relative group/carousel">
      {/* Header with title and optional view all link */}
      {(title || viewAllLink) && (
        <div className="flex items-center justify-between mb-5">
          {title && (
            <h2 className="text-lg font-bold text-[#212529]">{title}</h2>
          )}
          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="text-xs text-[#495057] hover:text-[#212529] transition-colors flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      )}

      <div className="relative">
        {/* Scroll buttons - improved styling */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white border border-[#E9ECEF] rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 hover:bg-[#F8F9FA] hover:border-[#212529] hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-1"
            aria-label="Scroll left"
          >
            <ChevronLeft size={ICON_SIZES.md} className="text-[#212529]" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white border border-[#E9ECEF] rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 hover:bg-[#F8F9FA] hover:border-[#212529] hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-1"
            aria-label="Scroll right"
          >
            <ChevronRight size={ICON_SIZES.md} className="text-[#212529]" />
          </button>
        )}

        {/* Gradient fade edges - softer gradient */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />
        )}

        {/* Scrollable track */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-3 -mx-1 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {properties.map((property) => (
            <div
              key={property.id}
              className="flex-none w-[280px] sm:w-[300px] md:w-[320px] snap-start"
            >
              <PropertyCard property={property} compact />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}