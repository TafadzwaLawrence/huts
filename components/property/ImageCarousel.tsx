'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ICON_SIZES } from '@/lib/constants'

interface ImageCarouselProps {
  images: Array<{ url: string; is_primary?: boolean | null; alt_text?: string | null }>
  title: string
}

export function ImageCarousel({ images, title }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const goTo = useCallback((index: number, e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (index === currentIndex || isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex(index)
    setTimeout(() => setIsTransitioning(false), 300)
  }, [currentIndex, isTransitioning])

  const goPrev = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (isTransitioning) return
    goTo((currentIndex - 1 + images.length) % images.length)
  }, [currentIndex, images.length, goTo, isTransitioning])

  const goNext = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (isTransitioning) return
    goTo((currentIndex + 1) % images.length)
  }, [currentIndex, images.length, goTo, isTransitioning])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goPrev, goNext])

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
      ref={containerRef}
      className="relative w-full h-full group/carousel"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      role="region"
      aria-label="Image carousel"
    >
      {/* Current Image with fade transition */}
      <div className="relative w-full h-full overflow-hidden">
        <Image
          src={images[currentIndex].url}
          alt={images[currentIndex].alt_text || `${title} - Photo ${currentIndex + 1}`}
          fill
          className={`object-cover transition-opacity duration-300 ${isTransitioning ? 'opacity-70' : 'opacity-100'}`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABwgJ/8QAJRAAAgEDAwMFAQAAAAAAAAAAAQIDBAURBhIHIzExCBMUQVFx/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAeEQABAwQDAQAAAAAAAAAAAAABAAIDBBEhMQUSQf/aAAwDAQACEQMRAD8Av+u25ts1Pqe8agt2qLpQwXS4T3BYadIWjRpZGkKAuh48S2M4zjOR5Gg0S0d0T0Dt/piy2Ca+3a4U1qtsNvSonaNZJRFGsfNgqkBmxkgEDPjxo306Ah6W0m+6QP/Z"
          loading="lazy"
          key={currentIndex}
        />
      </div>

      {/* Subtle gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Navigation Arrows - refined styling */}
      {images.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 hover:bg-white hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-1 z-10"
            aria-label="Previous image"
          >
            <ChevronLeft size={ICON_SIZES.md} className="text-[#212529]" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 hover:bg-white hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-1 z-10"
            aria-label="Next image"
          >
            <ChevronRight size={ICON_SIZES.md} className="text-[#212529]" />
          </button>
        </>
      )}

      {/* Dot Indicators - modern minimal */}
      {images.length > 1 && images.length <= 7 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => goTo(i, e)}
              className={`rounded-full transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-white ${
                i === currentIndex
                  ? 'w-2 h-2 bg-white shadow-sm'
                  : 'w-1.5 h-1.5 bg-white/60 hover:bg-white/80'
              }`}
              aria-label={`Go to image ${i + 1}`}
              aria-current={i === currentIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      )}

      {/* Counter for many images - subtle badge */}
      {images.length > 7 && (
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-md text-[10px] font-medium z-10 shadow-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  )
}