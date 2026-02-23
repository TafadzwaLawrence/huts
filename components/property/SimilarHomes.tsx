'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Bed, Bath, Square, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { formatPrice, formatSalePrice } from '@/lib/utils'

interface SimilarProperty {
  id: string
  title: string
  slug?: string | null
  price?: number | null
  sale_price?: number | null
  listing_type?: string | null
  beds: number
  baths: number
  sqft?: number | null
  city: string
  neighborhood?: string | null
  property_images: { url: string; is_primary?: boolean }[]
}

interface SimilarHomesProps {
  propertyId: string
  city: string
  listingType?: string | null
  price?: number | null
  salePrice?: number | null
  beds?: number
}

export default function SimilarHomes({ propertyId, city, listingType, price, salePrice, beds }: SimilarHomesProps) {
  const [properties, setProperties] = useState<SimilarProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [scrollPos, setScrollPos] = useState(0)

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        const params = new URLSearchParams({
          propertyId,
          city,
          ...(listingType && { listingType }),
          ...(price && { price: String(price) }),
          ...(salePrice && { salePrice: String(salePrice) }),
          ...(beds && { beds: String(beds) }),
        })
        const res = await fetch(`/api/properties/similar?${params}`)
        if (res.ok) {
          const data = await res.json()
          setProperties(data.properties || [])
        }
      } catch (error) {
        console.error('Failed to fetch similar homes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSimilar()
  }, [propertyId, city, listingType, price, salePrice, beds])

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-base font-bold text-[#212529] mb-4">Similar homes</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-[#E9ECEF] rounded-lg mb-2" />
              <div className="h-4 bg-[#E9ECEF] rounded w-2/3 mb-1" />
              <div className="h-3 bg-[#E9ECEF] rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (properties.length === 0) return null

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('similar-homes-scroll')
    if (!container) return
    const scrollAmount = 280
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-[#212529]">Similar homes</h2>
        <Link
          href={`/search?city=${encodeURIComponent(city)}${listingType ? `&listing_type=${listingType}` : ''}`}
          className="text-xs font-medium text-[#212529] underline hover:no-underline"
        >
          See more
        </Link>
      </div>

      <div className="relative group">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-[#E9ECEF] rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#F8F9FA]"
        >
          <ChevronLeft size={16} />
        </button>

        <div
          id="similar-homes-scroll"
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {properties.map((prop) => {
            const isSale = prop.listing_type === 'sale' || !!prop.sale_price
            const primaryImage = prop.property_images?.find(i => i.is_primary) || prop.property_images?.[0]
            const href = `/property/${prop.slug || prop.id}`

            return (
              <Link
                key={prop.id}
                href={href}
                className="flex-shrink-0 w-[240px] group/card"
              >
                <div className="relative h-36 rounded-lg overflow-hidden mb-2">
                  {primaryImage ? (
                    <Image
                      src={primaryImage.url}
                      alt={prop.title}
                      fill
                      className="object-cover group-hover/card:scale-105 transition-transform duration-300"
                      sizes="240px"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#E9ECEF] flex items-center justify-center">
                      <span className="text-[#ADB5BD] text-xs">No photo</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-black/80 text-white px-2 py-0.5 rounded text-xs font-bold">
                    {isSale ? formatSalePrice(prop.sale_price ?? 0) : formatPrice(prop.price ?? 0)}
                    {!isSale && <span className="font-normal">/mo</span>}
                  </div>
                </div>
                <div className="text-xs text-[#495057] flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-[#212529]">{prop.beds}</span> bd |
                  <span className="font-bold text-[#212529]">{prop.baths}</span> ba
                  {prop.sqft && (
                    <>
                      | <span className="font-bold text-[#212529]">{prop.sqft.toLocaleString()}</span> sqft
                    </>
                  )}
                </div>
                <p className="text-xs text-[#495057] flex items-center gap-1 truncate">
                  <MapPin size={10} />
                  {prop.neighborhood || prop.city}
                </p>
              </Link>
            )
          })}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-[#E9ECEF] rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#F8F9FA]"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
