'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, Home, Grid3X3, Images, ZoomIn } from 'lucide-react'

interface PropertyImage {
  id: string
  url: string
  alt_text?: string
  order: number
}

interface PropertyGalleryProps {
  images: PropertyImage[]
  title: string
}

export default function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showGallery, setShowGallery] = useState(false)

  const sortedImages = images?.sort((a, b) => a.order - b.order) || []
  const imageCount = sortedImages.length

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!showGallery) return
    if (e.key === 'ArrowLeft') {
      setCurrentImageIndex((prev) => (prev === 0 ? imageCount - 1 : prev - 1))
    } else if (e.key === 'ArrowRight') {
      setCurrentImageIndex((prev) => (prev === imageCount - 1 ? 0 : prev + 1))
    } else if (e.key === 'Escape') {
      setShowGallery(false)
    }
  }, [showGallery, imageCount])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Prevent body scroll when gallery is open
  useEffect(() => {
    if (showGallery) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [showGallery])

  if (imageCount === 0) {
    return (
      <div className="w-full h-[300px] md:h-[450px] bg-gradient-to-br from-[#E9ECEF] to-[#DEE2E6] flex flex-col items-center justify-center">
        <Home size={64} className="text-[#ADB5BD] mb-4" />
        <p className="text-[#495057]">No photos available</p>
      </div>
    )
  }

  // Single image layout
  if (imageCount === 1) {
    return (
      <>
        <div 
          className="relative w-full h-[300px] md:h-[500px] cursor-pointer group"
          onClick={() => setShowGallery(true)}
        >
          <Image
            src={sortedImages[0]?.url}
            alt={sortedImages[0]?.alt_text || title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <button className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium text-black hover:bg-white transition-all flex items-center gap-2">
            <ZoomIn size={18} className="text-black" />
            View photo
          </button>
        </div>
        {renderGalleryModal()}
      </>
    )
  }

  // Two images layout
  if (imageCount === 2) {
    return (
      <>
        <div className="grid grid-cols-2 gap-2 h-[300px] md:h-[450px]">
          {sortedImages.map((img, index) => (
            <div 
              key={img.id}
              className="relative cursor-pointer group overflow-hidden"
              onClick={() => {
                setCurrentImageIndex(index)
                setShowGallery(true)
              }}
            >
              <Image
                src={img.url}
                alt={img.alt_text || `${title} - Image ${index + 1}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                priority={index === 0}
                sizes="50vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowGallery(true)}
          className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium text-black hover:bg-white transition-all flex items-center gap-2"
        >
          <Images size={18} className="text-black" />
          View all {imageCount} photos
        </button>
        {renderGalleryModal()}
      </>
    )
  }

  // Three images layout
  if (imageCount === 3) {
    return (
      <>
        <div className="grid grid-cols-3 gap-2 h-[300px] md:h-[450px]">
          <div 
            className="col-span-2 relative cursor-pointer group overflow-hidden"
            onClick={() => {
              setCurrentImageIndex(0)
              setShowGallery(true)
            }}
          >
            <Image
              src={sortedImages[0]?.url}
              alt={sortedImages[0]?.alt_text || title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority
              sizes="66vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
          <div className="grid grid-rows-2 gap-2">
            {sortedImages.slice(1, 3).map((img, index) => (
              <div 
                key={img.id}
                className="relative cursor-pointer group overflow-hidden"
                onClick={() => {
                  setCurrentImageIndex(index + 1)
                  setShowGallery(true)
                }}
              >
                <Image
                  src={img.url}
                  alt={img.alt_text || `${title} - Image ${index + 2}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="33vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => setShowGallery(true)}
          className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium text-black hover:bg-white transition-all flex items-center gap-2"
        >
          <Images size={18} className="text-black" />
          View all {imageCount} photos
        </button>
        {renderGalleryModal()}
      </>
    )
  }

  // Four images layout
  if (imageCount === 4) {
    return (
      <>
        <div className="grid grid-cols-4 gap-2 h-[300px] md:h-[450px]">
          <div 
            className="col-span-2 row-span-2 relative cursor-pointer group overflow-hidden rounded-l-xl"
            onClick={() => {
              setCurrentImageIndex(0)
              setShowGallery(true)
            }}
          >
            <Image
              src={sortedImages[0]?.url}
              alt={sortedImages[0]?.alt_text || title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority
              sizes="50vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
          <div className="col-span-2 grid grid-cols-2 grid-rows-2 gap-2">
            {sortedImages.slice(1, 5).map((img, index) => (
              <div 
                key={img.id}
                className={`relative cursor-pointer group overflow-hidden ${
                  index === 1 ? 'rounded-tr-xl' : index === 3 ? 'rounded-br-xl' : ''
                }`}
                onClick={() => {
                  setCurrentImageIndex(index + 1)
                  setShowGallery(true)
                }}
              >
                <Image
                  src={img.url}
                  alt={img.alt_text || `${title} - Image ${index + 2}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="25vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => setShowGallery(true)}
          className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium text-black hover:bg-white transition-all flex items-center gap-2"
        >
          <Grid3X3 size={18} className="text-black" />
          View all {imageCount} photos
        </button>
        {renderGalleryModal()}
      </>
    )
  }

  // Five or more images - Airbnb style grid
  function renderGalleryModal() {
    if (!showGallery) return null

    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="text-white font-medium">
              {currentImageIndex + 1} / {imageCount}
            </span>
            <span className="text-white/60 hidden sm:block">|</span>
            <span className="text-white/60 text-sm hidden sm:block truncate max-w-[300px]">{title}</span>
          </div>
          <button
            onClick={() => setShowGallery(false)}
            className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
            aria-label="Close gallery"
          >
            <X size={24} />
          </button>
        </div>

        {/* Main Image Area */}
        <div className="flex-1 flex items-center justify-center relative px-4 py-4">
          {/* Previous Button */}
          <button
            onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? imageCount - 1 : prev - 1))}
            className="absolute left-4 md:left-8 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-10"
            aria-label="Previous image"
          >
            <ChevronLeft size={28} />
          </button>

          {/* Image */}
          <div className="relative w-full h-full max-w-6xl mx-auto">
            {sortedImages[currentImageIndex] && (
              <Image
                src={sortedImages[currentImageIndex].url}
                alt={sortedImages[currentImageIndex].alt_text || `Image ${currentImageIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            )}
          </div>

          {/* Next Button */}
          <button
            onClick={() => setCurrentImageIndex((prev) => (prev === imageCount - 1 ? 0 : prev + 1))}
            className="absolute right-4 md:right-8 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-10"
            aria-label="Next image"
          >
            <ChevronRight size={28} />
          </button>
        </div>

        {/* Thumbnail Strip */}
        <div className="bg-black/80 backdrop-blur-sm px-4 py-3 overflow-x-auto">
          <div className="flex gap-2 justify-center">
            {sortedImages.map((img, index) => (
              <button
                key={img.id}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                  index === currentImageIndex 
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-black' 
                    : 'opacity-50 hover:opacity-100'
                }`}
              >
                <Image
                  src={img.url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Keyboard hint */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-white/40 text-xs hidden md:block">
          Use ← → arrows to navigate • ESC to close
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Default 5+ images grid - Airbnb style */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[300px] md:h-[450px]">
        {/* Main large image - left half */}
        <div 
          className="col-span-2 row-span-2 relative cursor-pointer group overflow-hidden rounded-l-xl"
          onClick={() => {
            setCurrentImageIndex(0)
            setShowGallery(true)
          }}
        >
          <Image
            src={sortedImages[0]?.url}
            alt={sortedImages[0]?.alt_text || title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>

        {/* Right side - 4 smaller images */}
        {sortedImages.slice(1, 5).map((img, index) => (
          <div 
            key={img.id}
            className={`relative cursor-pointer group overflow-hidden ${
              index === 1 ? 'rounded-tr-xl' : index === 3 ? 'rounded-br-xl' : ''
            }`}
            onClick={() => {
              setCurrentImageIndex(index + 1)
              setShowGallery(true)
            }}
          >
            <Image
              src={img.url}
              alt={img.alt_text || `${title} - Image ${index + 2}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="25vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            
            {/* Show +X more overlay on last image */}
            {index === 3 && imageCount > 5 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/60 transition-colors">
                <span className="text-white text-lg font-semibold">+{imageCount - 5} more</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Show All Photos Button */}
      <button
        onClick={() => setShowGallery(true)}
        className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium text-black hover:bg-white transition-all flex items-center gap-2 border border-[#E9ECEF]"
      >
        <Grid3X3 size={18} className="text-black" />
        Show all {imageCount} photos
      </button>

      {renderGalleryModal()}
    </>
  )
}
