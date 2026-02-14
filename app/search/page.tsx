'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  Grid3x3, 
  Map as MapIcon, 
  Bed, 
  Bath, 
  Square, 
  Heart,
  Home,
  X
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatSalePrice } from '@/lib/utils'

interface Property {
  id: string
  title: string
  slug: string
  listing_type: 'rent' | 'sale' | null
  price: number | null
  sale_price: number | null
  beds: number
  baths: number
  sqft: number | null
  city: string
  neighborhood: string | null
  property_type: string | null
  lat: number | null
  lng: number | null
  property_images: Array<{ url: string; is_primary: boolean; alt_text?: string }>
}

// Dynamic import to avoid SSR issues with Leaflet
const MapView = dynamic<{
  properties: (Property & { lat: number; lng: number })[]
  selectedProperty: string | null
  onPropertySelect: (id: string | null) => void
}>(() => import('@/components/search/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[#F8F9FA] flex items-center justify-center">
      <p className="text-[#495057]">Loading map...</p>
    </div>
  ),
})

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [showMap, setShowMap] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [listingType, setListingType] = useState<'all' | 'rent' | 'sale'>('all')
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    beds: '',
    baths: '',
    propertyType: 'all',
    city: '',
    neighborhood: '',
  })
  const [allProperties, setAllProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Handle AI-generated filters
  const handleAIFilters = (aiFilters: any) => {
    setFilters(prev => ({
      ...prev,
      minPrice: aiFilters.minPrice ? String(aiFilters.minPrice / 100) : prev.minPrice,
      maxPrice: aiFilters.maxPrice ? String(aiFilters.maxPrice / 100) : prev.maxPrice,
      beds: aiFilters.beds ? String(aiFilters.beds) : prev.beds,
      baths: aiFilters.baths ? String(aiFilters.baths) : prev.baths,
      propertyType: aiFilters.propertyType || prev.propertyType,
      city: aiFilters.city || prev.city,
      neighborhood: aiFilters.neighborhood || prev.neighborhood,
    }))
    // Also set search query if location is provided
    if (aiFilters.neighborhood || aiFilters.city) {
      setSearchQuery(aiFilters.neighborhood || aiFilters.city)
    }
    // Show filters panel so user can see what was applied
    setShowFilters(true)
  }

  // Fetch properties from Supabase on mount
  useEffect(() => {
    async function fetchProperties() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('properties')
          .select(`
            id,
            title,
            slug,
            listing_type,
            price,
            sale_price,
            beds,
            baths,
            sqft,
            city,
            neighborhood,
            property_type,
            lat,
            lng,
            property_images(url, is_primary, alt_text)
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false })

        if (error) throw error

setAllProperties(data || [])
        setFilteredProperties(data || [])
      } catch (error) {
        console.error('Error fetching properties:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Filter properties based on search and filters
  useEffect(() => {
    let results = allProperties

    // Listing type filter (rent/sale)
    // Handle null/undefined listing_type - treat as 'rent' (default)
    if (listingType !== 'all') {
      results = results.filter((p) => {
        const type = p.listing_type || 'rent' // Default to 'rent' if null
        return type === listingType
      })
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          (p.neighborhood && p.neighborhood.toLowerCase().includes(query)) ||
          p.city.toLowerCase().includes(query)
      )
    }

    // Price filter - handle both rental and sale prices
    if (filters.minPrice) {
      const minCents = parseInt(filters.minPrice) * 100
      results = results.filter((p) => {
        // Get the appropriate price based on listing type
        const type = p.listing_type || 'rent'
        const propertyPrice = type === 'sale' ? (p.sale_price || p.price) : (p.price || p.sale_price)
        return propertyPrice && propertyPrice >= minCents
      })
    }
    if (filters.maxPrice) {
      const maxCents = parseInt(filters.maxPrice) * 100
      results = results.filter((p) => {
        const type = p.listing_type || 'rent'
        const propertyPrice = type === 'sale' ? (p.sale_price || p.price) : (p.price || p.sale_price)
        return propertyPrice && propertyPrice <= maxCents
      })
    }

    // Bedroom filter
    if (filters.beds) {
      results = results.filter((p) => p.beds >= parseInt(filters.beds))
    }

    // Bathroom filter
    if (filters.baths) {
      results = results.filter((p) => p.baths >= parseInt(filters.baths))
    }

    // Property type filter
    if (filters.propertyType && filters.propertyType !== 'all') {
      results = results.filter((p) => p.property_type === filters.propertyType)
    }

    // City filter
    if (filters.city) {
      results = results.filter((p) => p.city.toLowerCase().includes(filters.city.toLowerCase()))
    }

    // Neighborhood filter
    if (filters.neighborhood) {
      results = results.filter((p) => 
        p.neighborhood?.toLowerCase().includes(filters.neighborhood.toLowerCase())
      )
    }

    setFilteredProperties(results)
  }, [searchQuery, listingType, filters.minPrice, filters.maxPrice, filters.beds, filters.baths, filters.propertyType, filters.city, filters.neighborhood, allProperties])

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Search Header */}
      <div className="bg-white border-b border-[#E9ECEF] p-4 lg:px-8">
        {/* Listing Type Toggle - Primary */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <div className="inline-flex border-2 border-[#E9ECEF] rounded-lg overflow-hidden">
            <button
              onClick={() => setListingType('all')}
              className={`px-4 py-2.5 text-sm font-medium transition-all min-w-[70px] ${
                listingType === 'all'
                  ? 'bg-[#212529] text-white'
                  : 'bg-white text-[#495057] hover:bg-[#F8F9FA]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setListingType('rent')}
              className={`px-4 py-2.5 text-sm font-medium transition-all border-x-2 border-[#E9ECEF] min-w-[90px] ${
                listingType === 'rent'
                  ? 'bg-[#212529] text-white'
                  : 'bg-white text-[#495057] hover:bg-[#F8F9FA]'
              }`}
            >
              Rent
            </button>
            <button
              onClick={() => setListingType('sale')}
              className={`px-4 py-2.5 text-sm font-medium transition-all min-w-[90px] ${
                listingType === 'sale'
                  ? 'bg-[#212529] text-white'
                  : 'bg-white text-[#495057] hover:bg-[#F8F9FA]'
              }`}
            >
              Buy
            </button>
          </div>
          
          {/* Results count - desktop */}
          <div className="hidden sm:block text-sm text-[#495057]">
            <span className="font-semibold text-[#212529]">{filteredProperties.length}</span> {filteredProperties.length === 1 ? 'property' : 'properties'}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 flex items-center border-2 border-[#E9ECEF] rounded-lg focus-within:border-[#212529] transition-colors bg-white">
            <Search size={20} className="ml-4 text-[#ADB5BD]" />
            <input
              type="text"
              placeholder="Search by location, neighborhood..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-3 outline-none bg-transparent text-[#212529] placeholder:text-[#ADB5BD]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-2 mr-2 hover:bg-[#F8F9FA] rounded-full transition-colors"
              >
                <X size={16} className="text-[#ADB5BD]" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                showFilters
                  ? 'border-[#212529] bg-[#212529] text-white'
                  : 'border-[#E9ECEF] text-[#212529] hover:border-[#212529]'
              }`}
            >
              <SlidersHorizontal size={18} />
              <span className="hidden sm:inline">Filters</span>
            </button>
            <button
              onClick={() => setShowMap(!showMap)}
              className={`flex items-center gap-2 px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                showMap
                  ? 'border-[#212529] bg-[#212529] text-white'
                  : 'border-[#E9ECEF] text-[#212529] hover:border-[#212529]'
              }`}
            >
              {showMap ? <Grid3x3 size={18} /> : <MapIcon size={18} />}
              <span className="hidden sm:inline">{showMap ? 'List' : 'Map'}</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-[#E9ECEF]">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#495057] mb-1">
                  Min Price {listingType === 'sale' ? '' : '/mo'}
                </label>
                <input
                  type="number"
                  placeholder={listingType === 'sale' ? '100,000' : '500'}
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-[#E9ECEF] rounded-lg text-sm focus:outline-none focus:border-[#212529]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#495057] mb-1">
                  Max Price {listingType === 'sale' ? '' : '/mo'}
                </label>
                <input
                  type="number"
                  placeholder={listingType === 'sale' ? '500,000' : '3,000'}
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-[#E9ECEF] rounded-lg text-sm focus:outline-none focus:border-[#212529]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#495057] mb-1">Bedrooms</label>
                <select
                  value={filters.beds}
                  onChange={(e) => setFilters({ ...filters, beds: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-[#E9ECEF] rounded-lg text-sm focus:outline-none focus:border-[#212529]"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#495057] mb-1">Bathrooms</label>
                <select
                  value={filters.baths}
                  onChange={(e) => setFilters({ ...filters, baths: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-[#E9ECEF] rounded-lg text-sm focus:outline-none focus:border-[#212529]"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#495057] mb-1">Property Type</label>
                <select
                  value={filters.propertyType}
                  onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-[#E9ECEF] rounded-lg text-sm focus:outline-none focus:border-[#212529]"
                >
                  <option value="all">All Types</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="condo">Condo</option>
                  <option value="studio">Studio</option>
                  <option value="room">Room</option>
                </select>
              </div>
            </div>
            {/* Clear Filters */}
            {(filters.minPrice || filters.maxPrice || filters.beds || filters.baths || filters.propertyType !== 'all') && (
              <button
                onClick={() => setFilters({
                  minPrice: '',
                  maxPrice: '',
                  beds: '',
                  baths: '',
                  propertyType: 'all',
                  city: '',
                  neighborhood: '',
                })}
                className="mt-3 text-sm text-[#495057] hover:text-[#212529] underline underline-offset-2"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Results Count - mobile */}
        <div className="mt-4 text-sm text-[#495057] sm:hidden">
          <span className="font-semibold text-[#212529]">{filteredProperties.length}</span> {filteredProperties.length === 1 ? 'property' : 'properties'}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="h-full overflow-y-auto bg-[#F8F9FA] p-4 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white border border-[#E9ECEF] rounded-xl overflow-hidden">
                  <div className="h-52 bg-[#E9ECEF] animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-[#E9ECEF] rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-[#E9ECEF] rounded animate-pulse w-1/2" />
                    <div className="pt-3 border-t border-[#E9ECEF] flex gap-4">
                      <div className="h-4 bg-[#E9ECEF] rounded animate-pulse w-16" />
                      <div className="h-4 bg-[#E9ECEF] rounded animate-pulse w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : showMap ? (
          <MapView
            properties={filteredProperties.filter(p => p.lat !== null && p.lng !== null) as any}
            selectedProperty={selectedProperty}
            onPropertySelect={setSelectedProperty}
          />
        ) : (
          <div className="h-full overflow-y-auto bg-[#F8F9FA] p-4 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProperties.map((property) => (
                <PropertyListCard key={property.id} property={property} />
              ))}
            </div>
            {filteredProperties.length === 0 && (
              <div className="text-center py-20 max-w-md mx-auto">
                <div className="w-16 h-16 bg-[#E9ECEF] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Home size={32} className="text-[#495057]" />
                </div>
                <h3 className="text-xl font-bold text-[#212529] mb-2">No properties found</h3>
                <p className="text-[#495057] mb-6">
                  {searchQuery 
                    ? `We couldn't find any properties matching "${searchQuery}".`
                    : 'Try adjusting your filters to see more results.'
                  }
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setListingType('all')
                    setFilters({
                      minPrice: '',
                      maxPrice: '',
                      beds: '',
                      baths: '',
                      propertyType: 'all',
                      city: '',
                      neighborhood: '',
                    })
                  }}
                  className="btn-secondary"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Search Assistant - TODO: Re-enable when AI budget available */}
      {/* <AISearchAssistant 
        onFiltersApply={handleAIFilters}
        onSearchQuery={setSearchQuery}
      /> */}
    </div>
  )
}

// Property Card Component - Enhanced Design
function PropertyListCard({ property }: { property: Property }) {
  const primaryImage = property.property_images.find(img => img.is_primary) || property.property_images[0]
  const imageUrl = primaryImage?.url || null
  
  // Determine listing type - default to 'rent' if null
  const listingType = property.listing_type || 'rent'
  const isForSale = listingType === 'sale'
  
  // Format price based on listing type - use whichever price is available
  const displayPrice = isForSale && property.sale_price
    ? formatSalePrice(property.sale_price)
    : property.price
      ? formatPrice(property.price)
      : property.sale_price
        ? formatSalePrice(property.sale_price)
        : '$0'

  return (
    <a
      href={`/property/${property.slug || property.id}`}
      className="group block bg-white border border-[#E9ECEF] rounded-xl overflow-hidden hover:border-[#212529] hover:shadow-xl transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative h-52 min-h-[208px] bg-[#F8F9FA] overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={primaryImage?.alt_text || property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="text-[#ADB5BD]" size={48} />
          </div>
        )}
        
        {/* Badges Row */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {/* Price Badge */}
          <div className="bg-black/90 text-white px-3 py-1.5 rounded-lg text-sm font-bold">
            {displayPrice}{!isForSale && '/mo'}
          </div>
          
          {/* For Sale Badge */}
          {isForSale && (
            <div className="bg-white text-black px-2 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide">
              For Sale
            </div>
          )}
        </div>
        
        {/* Save Button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            // TODO: Implement save functionality
          }}
          className="absolute top-3 right-3 p-2 bg-white/95 rounded-full hover:bg-white hover:scale-110 transition-all duration-200 min-w-[40px] min-h-[40px] flex items-center justify-center shadow-sm"
          aria-label="Save property"
        >
          <Heart size={18} className="text-[#212529]" />
        </button>

        {/* Property Type Badge */}
        {property.property_type && (
          <div className="absolute bottom-3 left-3 bg-white/95 text-[#495057] px-2 py-1 rounded text-xs font-medium capitalize">
            {property.property_type}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-[#212529] text-base mb-2 line-clamp-1 group-hover:underline underline-offset-2">
          {property.title}
        </h3>
        
        {/* Location */}
        <div className="flex items-center text-[#495057] text-sm mb-4">
          <MapPin size={14} className="mr-1.5 flex-shrink-0" />
          <span className="line-clamp-1">
            {property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}
          </span>
        </div>
        
        {/* Features */}
        <div className="flex items-center gap-4 text-sm text-[#495057] pt-3 border-t border-[#E9ECEF]">
          <div className="flex items-center gap-1.5">
            <Bed size={16} className="text-[#495057]" />
            <span className="font-medium">{property.beds}</span>
            <span className="text-[#ADB5BD]">bed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath size={16} className="text-[#495057]" />
            <span className="font-medium">{property.baths}</span>
            <span className="text-[#ADB5BD]">bath</span>
          </div>
          {property.sqft && property.sqft > 0 && (
            <div className="flex items-center gap-1.5">
              <Square size={16} className="text-[#495057]" />
              <span className="font-medium">{property.sqft.toLocaleString()}</span>
              <span className="text-[#ADB5BD]">sqft</span>
            </div>
          )}
        </div>
      </div>
    </a>
  )
}
