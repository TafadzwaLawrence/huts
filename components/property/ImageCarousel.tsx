'use client'

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ICON_SIZES } from '@/lib/constants'

interface ImageCarouselProps {
  images: Array<{ url: string; is_primary?: boolean | null; alt_text?: string | null }>
  title: string
  noGrayscale?: boolean
}

export function ImageCarousel({ images, title, noGrayscale = false }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const goTo = useCallback((index: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex(index)
  }, [])

  const goPrev = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length)
  }, [images.length])

  const goNext = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    setCurrentIndex(prev => (prev + 1) % images.length)
  }, [images.length])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current
    const threshold = 50
    if (Math.abs(diff) > threshold) {
      if (diff > 0) goNext()
      else goPrev()
    }
  }, [goNext, goPrev])

  if (images.length === 0) return null

  return (
    <div
      className="relative w-full h-full group/carousel"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Current Image - Full Color */}
      <Image
        src={images[currentIndex].url}
        alt={images[currentIndex].alt_text || `${title} - Photo ${currentIndex + 1}`}
        fill
        className="object-cover contrast-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABwgJ/8QAJRAAAgEDAwMFAQAAAAAAAAAAAQIDBAURBhIHIzExCBMUQVFx/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAeEQABAwQDAQAAAAAAAAAAAAABAAIDBBEhMQUSQf/aAAwDAQACEQMRAD8Av+u25ts1Pqe8agt2qLpQwXS4T3BYadIWjRpZGkKAuh48S2M4zjOR5Gg0S0d0T0Dt/piy2Ca+3a4U1qtsNvSonaNZJRFGsfNgqkBmxkgEDPjxo306Ah6W0m+6QP/Z"
        loading="lazy"
        key={currentIndex}
      />

      {/* Dark overlay for B&W aesthetic - only when not noGrayscale */}
      {!noGrayscale && (
        <div className="absolute inset-0 bg-black/15 mix-blend-multiply pointer-events-none" />
      )}

      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Navigation Arrows — show on hover */}
      {images.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover/carousel:opacity-100 hover:bg-white hover:scale-110 transition-all z-10"
            aria-label="Previous image"
          >
            <ChevronLeft size={ICON_SIZES.md} className="text-[#212529]" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover/carousel:opacity-100 hover:bg-white hover:scale-110 transition-all z-10"
            aria-label="Next image"
          >
            <ChevronRight size={ICON_SIZES.md} className="text-[#212529]" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {images.length > 1 && images.length <= 7 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => goTo(i, e)}
              className={`rounded-full transition-all ${
                i === currentIndex
                  ? 'w-2 h-2 bg-white shadow-sm'
                  : 'w-1.5 h-1.5 bg-white/60 hover:bg-white/80'
              }`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Counter for many images */}
      {images.length > 7 && (
        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-medium z-10">
          {currentIndex + 1}/{images.length}
        </div>
      )}
    </div>
  )
}
