'use client'

import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ICON_SIZES } from '@/lib/constants'
import { PropertyWithImages } from '@/types'
import { PropertyCard } from './PropertyCard'

interface PropertyCarouselProps {
  properties: PropertyWithImages[]
  title?: string
}

export function PropertyCarousel({ properties, title }: PropertyCarouselProps) {
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
      {/* Scroll buttons */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-[#E9ECEF] rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover/carousel:opacity-100 hover:bg-[#F8F9FA] hover:scale-110 transition-all"
          aria-label="Scroll left"
        >
          <ChevronLeft size={ICON_SIZES.lg} className="text-[#212529]" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-[#E9ECEF] rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover/carousel:opacity-100 hover:bg-[#F8F9FA] hover:scale-110 transition-all"
          aria-label="Scroll right"
        >
          <ChevronRight size={ICON_SIZES.lg} className="text-[#212529]" />
        </button>
      )}

      {/* Gradient fade edges */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      )}

      {/* Scrollable track */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-1 px-1"
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
  )
}
