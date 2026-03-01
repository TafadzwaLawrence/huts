'use client'

import { useEffect, useState } from 'react'
import { formatPrice, formatSalePrice } from '@/lib/utils'
import { Heart, Share2 } from 'lucide-react'

interface PropertyStickyHeaderProps {
  property: {
    id: string
    title: string
    price?: number | null
    sale_price?: number | null
    listing_type?: string | null
    beds: number
    baths: number
    sqft?: number | null
    city: string
    neighborhood?: string | null
  }
  onContact: () => void
}

export default function PropertyStickyHeader({ property, onContact }: PropertyStickyHeaderProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past ~400px (past the gallery)
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isSale = property.listing_type === 'sale' || !!property.sale_price
  const isRental = !isSale

  if (!visible) return null

  return (
    <div className="fixed top-[60px] left-0 right-0 z-40 bg-white border-b border-[#E9ECEF] shadow-sm transform transition-transform duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: price + stats */}
          <div className="flex items-center gap-4 min-w-0">
            <span className="text-lg font-bold text-[#212529] whitespace-nowrap">
              {isSale ? formatSalePrice(property.sale_price ?? 0) : formatPrice(property.price ?? 0)}
              {isRental && <span className="text-sm font-normal text-[#ADB5BD]">/mo</span>}
            </span>
            <div className="hidden sm:flex items-center gap-2 text-sm text-[#495057]">
              <span><b>{property.beds}</b> bd</span>
              <span className="text-[#ADB5BD]">|</span>
              <span><b>{property.baths}</b> ba</span>
              {property.sqft && (
                <>
                  <span className="text-[#ADB5BD]">|</span>
                  <span><b>{property.sqft.toLocaleString()}</b> sqft</span>
                </>
              )}
            </div>
            <span className="hidden md:block text-sm text-[#495057] truncate">
              {property.neighborhood || property.city}
            </span>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onContact}
              className="px-4 py-1.5 bg-[#212529] text-white rounded-lg text-sm font-semibold hover:bg-black transition-colors"
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
