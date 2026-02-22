'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
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
  X,
  ChevronDown
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatSalePrice } from '@/lib/utils'
import { ICON_SIZES } from '@/lib/constants'

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

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Initialize state from URL params
  const [showMap, setShowMap] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [listingType, setListingType] = useState<'all' | 'rent' | 'sale'>(
    (searchParams.get('type') as 'all' | 'rent' | 'sale') || 'all'
  )
  const [filters, setFilters] = useState({
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    beds: searchParams.get('beds') || '',
    baths: searchParams.get('baths') || '',
    propertyType: searchParams.get('propertyType') || 'all',
    city: searchParams.get('city') || '',
    neighborhood: searchParams.get('neighborhood') || '',
    studentHousingOnly: searchParams.get('student') === '1',
  })
  const [allProperties, setAllProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Debounce search query for URL sync (avoid excessive URL updates while typing)
  const debouncedQuery = useDebounce(searchQuery, 400)

  // Sync state to URL params
  const isInitialMount = useRef(true)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    const params = new URLSearchParams()
    if (debouncedQuery) params.set('q', debouncedQuery)
    if (listingType !== 'all') params.set('type', listingType)
    if (filters.minPrice) params.set('minPrice', filters.minPrice)
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
    if (filters.beds) params.set('beds', filters.beds)
    if (filters.baths) params.set('baths', filters.baths)
    if (filters.propertyType !== 'all') params.set('propertyType', filters.propertyType)
    if (filters.city) params.set('city', filters.city)
    if (filters.neighborhood) params.set('neighborhood', filters.neighborhood)
    if (filters.studentHousingOnly) params.set('student', '1')

    const queryString = params.toString()
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname
    router.replace(newUrl, { scroll: false })
  }, [debouncedQuery, listingType, filters, pathname, router])

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
          .eq('verification_status', 'approved')
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

  // Sync listing type with URL parameter changes (e.g., navigating from homepage links)
  useEffect(() => {
    const typeParam = searchParams.get('type') as 'all' | 'rent' | 'sale' | null
    if (typeParam && typeParam !== listingType) {
      setListingType(typeParam)
    }
    // Sync city/neighborhood from URL (from area pages linking to search)
    const cityParam = searchParams.get('city')
    const neighborhoodParam = searchParams.get('neighborhood')
    if (cityParam && cityParam !== filters.city) {
      setFilters(prev => ({ ...prev, city: cityParam }))
    }
    if (neighborhoodParam && neighborhoodParam !== filters.neighborhood) {
      setFilters(prev => ({ ...prev, neighborhood: neighborhoodParam }))
    }
  }, [searchParams])

  // Filter properties based on search and filters
  useEffect(() => {
    let results = allProperties

    // Listing type filter (rent/sale)
    if (listingType !== 'all') {
      results = results.filter((p) => {
        const type = p.listing_type || 'rent'
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

    // Student housing filter
    if (filters.studentHousingOnly) {
      results = results.filter((p) => p.property_type === 'student')
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
  }, [searchQuery, listingType, filters.minPrice, filters.maxPrice, filters.beds, filters.baths, filters.propertyType, filters.city, filters.neighborhood, filters.studentHousingOnly, allProperties])

  // Update document title dynamically based on search state
  useEffect(() => {
    const parts: string[] = []
    if (listingType === 'rent') parts.push('Rentals')
    else if (listingType === 'sale') parts.push('Homes for Sale')
    else parts.push('Properties')

    const location = debouncedQuery || filters.city || filters.neighborhood
    if (location) parts.push(`in ${location}`)
    else parts.push('in Zimbabwe')

    document.title = `${parts.join(' ')} | Huts`
  }, [debouncedQuery, listingType, filters.city, filters.neighborhood])

  // Active filter count for badge
  const activeFilterCount = [
    filters.minPrice,
    filters.maxPrice,
    filters.beds,
    filters.baths,
    filters.propertyType !== 'all' ? filters.propertyType : '',
    filters.studentHousingOnly ? 'student-housing' : '',
  ].filter(Boolean).length

  // Generate SEO heading text
  const headingText = (() => {
    const parts: string[] = []
    if (listingType === 'rent') parts.push('Rentals')
    else if (listingType === 'sale') parts.push('Homes for Sale')
    else parts.push('Properties')
    
    const location = searchQuery || filters.city || filters.neighborhood
    if (location) parts.push(`in ${location}`)
    else parts.push('in Zimbabwe')
    
    return parts.join(' ')
  })()

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Visually hidden but crawlable H1 for SEO */}
      <h1 className="sr-only">{headingText} — Search on Huts</h1>

      {/* Search Header */}
      <div className="bg-white border-b border-[#E9ECEF] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">

        {/* Listing Type Pills + Results Count - moved above search for better hierarchy */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-0.5 bg-[#F8F9FA] p-0.5 rounded-full border border-[#E9ECEF]">
            {(['all', 'rent', 'sale'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setListingType(type)}
                className={`px-5 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                  listingType === type
                    ? 'bg-[#212529] text-white shadow-md shadow-black/10'
                    : 'text-[#495057] hover:text-[#212529] hover:bg-white/80'
                }`}
              >
                {type === 'all' ? 'All' : type === 'rent' ? 'Rent' : 'Buy'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold text-[#212529] tabular-nums">{filteredProperties.length}</span>
            <span className="text-sm text-[#ADB5BD] hidden sm:inline">{filteredProperties.length === 1 ? 'property' : 'properties'}</span>
          </div>
        </div>

        {/* Unified Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
          {/* Main Search Bar */}
          <div className="flex-1 flex flex-col sm:flex-row items-stretch rounded-full bg-[#F8F9FA] border border-[#E9ECEF] hover:bg-[#F1F3F5] focus-within:bg-white focus-within:border-[#212529] focus-within:ring-4 focus-within:ring-black/[0.04] transition-all duration-200 overflow-hidden">
            {/* Location Input */}
            <div className="flex-1 flex items-center gap-3 pl-4 sm:pl-5 pr-3 py-3 sm:py-3.5 group">
              <MapPin size={ICON_SIZES.lg} className="text-[#ADB5BD] group-focus-within:text-[#212529] transition-colors flex-shrink-0" />
              <input
                type="text"
                placeholder="City, neighborhood, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full outline-none bg-transparent text-[15px] text-[#212529] placeholder:text-[#ADB5BD] font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 hover:bg-[#E9ECEF] rounded-full transition-colors flex-shrink-0"
                >
                  <X size={ICON_SIZES.sm} className="text-[#495057]" />
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="hidden sm:flex items-center">
              <div className="w-px h-7 bg-[#E9ECEF]" />
            </div>

            {/* Type Selector */}
            <div className="relative flex items-center sm:min-w-[170px] px-4 py-3 sm:py-3.5 border-t sm:border-t-0 border-[#E9ECEF] sm:border-none">
              <Home size={ICON_SIZES.lg} className="text-[#ADB5BD] flex-shrink-0 mr-3" />
              <select
                value={filters.propertyType}
                onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                className="w-full outline-none bg-transparent text-[15px] text-[#212529] font-medium cursor-pointer appearance-none pr-5"
              >
                <option value="all">Any type</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="townhouse">Townhouse</option>
                <option value="condo">Condo</option>
                <option value="studio">Studio</option>
                <option value="room">Room</option>
                <option value="student">Student Housing</option>
              </select>
              <ChevronDown size={ICON_SIZES.sm} className="text-[#ADB5BD] flex-shrink-0 pointer-events-none absolute right-4" />
            </div>

            {/* Search Button - integrated pill */}
            <div className="hidden sm:flex items-center pr-1.5">
              <button
                type="button"
                onClick={() => {/* Search triggers reactively */}}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#212529] text-white font-semibold text-sm rounded-full hover:bg-black active:scale-[0.97] transition-all shadow-sm"
              >
                <Search size={ICON_SIZES.sm} />
                Search
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative flex items-center gap-2 px-4 py-3 rounded-full font-semibold transition-all duration-200 text-sm ${
                showFilters
                  ? 'bg-[#212529] text-white shadow-md shadow-black/10'
                  : activeFilterCount > 0
                    ? 'bg-[#F8F9FA] text-[#212529] border border-[#212529] hover:bg-[#212529] hover:text-white'
                    : 'bg-[#F8F9FA] text-[#495057] border border-[#E9ECEF] hover:border-[#ADB5BD] hover:text-[#212529]'
              }`}
            >
              <SlidersHorizontal size={ICON_SIZES.sm} />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className={`inline-flex items-center justify-center min-w-[20px] h-5 rounded-full text-[10px] font-bold px-1 ${
                  showFilters ? 'bg-white text-[#212529]' : 'bg-[#212529] text-white'
                }`}>
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowMap(!showMap)}
              className={`flex items-center gap-2 px-4 py-3 rounded-full font-semibold transition-all duration-200 text-sm ${
                showMap
                  ? 'bg-[#212529] text-white shadow-md shadow-black/10'
                  : 'bg-[#F8F9FA] text-[#495057] border border-[#E9ECEF] hover:border-[#ADB5BD] hover:text-[#212529]'
              }`}
            >
              {showMap ? <Grid3x3 size={ICON_SIZES.sm} /> : <MapIcon size={ICON_SIZES.sm} />}
              <span className="hidden sm:inline">{showMap ? 'List' : 'Map'}</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-[#E9ECEF] animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#495057] mb-1.5">
                  Min Price{listingType !== 'sale' && ' /mo'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ADB5BD] text-sm">$</span>
                  <input
                    type="number"
                    placeholder={listingType === 'sale' ? '100,000' : '500'}
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="w-full pl-7 pr-3 py-2.5 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl text-sm text-[#212529] font-medium focus:outline-none focus:bg-white focus:border-[#212529] focus:ring-4 focus:ring-black/[0.04] transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#495057] mb-1.5">
                  Max Price{listingType !== 'sale' && ' /mo'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ADB5BD] text-sm">$</span>
                  <input
                    type="number"
                    placeholder={listingType === 'sale' ? '500,000' : '3,000'}
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="w-full pl-7 pr-3 py-2.5 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl text-sm text-[#212529] font-medium focus:outline-none focus:bg-white focus:border-[#212529] focus:ring-4 focus:ring-black/[0.04] transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#495057] mb-1.5">Bedrooms</label>
                <div className="flex gap-1">
                  {['', '1', '2', '3', '4', '5'].map((val) => (
                    <button
                      key={val}
                      onClick={() => setFilters({ ...filters, beds: val })}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                        filters.beds === val
                          ? 'bg-[#212529] text-white shadow-sm'
                          : 'bg-[#F8F9FA] text-[#495057] border border-[#E9ECEF] hover:border-[#ADB5BD]'
                      }`}
                    >
                      {val === '' ? 'Any' : `${val}+`}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#495057] mb-1.5">Bathrooms</label>
                <div className="flex gap-1">
                  {['', '1', '2', '3'].map((val) => (
                    <button
                      key={val}
                      onClick={() => setFilters({ ...filters, baths: val })}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                        filters.baths === val
                          ? 'bg-[#212529] text-white shadow-sm'
                          : 'bg-[#F8F9FA] text-[#495057] border border-[#E9ECEF] hover:border-[#ADB5BD]'
                      }`}
                    >
                      {val === '' ? 'Any' : `${val}+`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Student Housing Checkbox */}
            <div className="mt-4 pt-4 border-t border-[#E9ECEF]">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.studentHousingOnly}
                  onChange={(e) => setFilters({ ...filters, studentHousingOnly: e.target.checked })}
                  className="w-4 h-4 rounded border-2 border-[#E9ECEF] bg-white cursor-pointer appearance-none checked:bg-[#212529] checked:border-[#212529] rounded focus:ring-2 focus:ring-black/[0.04] transition-all"
                />
                <span className="text-sm font-semibold text-[#212529] group-hover:text-black transition-colors flex items-center gap-2">
                  Student Housing Only
                  <span className="text-xs font-normal text-[#ADB5BD]">(furnished, shared rooms, utilities included)</span>
                </span>
              </label>
            </div>
            {/* Clear Filters */}
            {(filters.minPrice || filters.maxPrice || filters.beds || filters.baths || filters.propertyType !== 'all' || filters.studentHousingOnly) && (
              <button
                onClick={() => setFilters({
                  minPrice: '',
                  maxPrice: '',
                  beds: '',
                  baths: '',
                  propertyType: 'all',
                  city: '',
                  neighborhood: '',
                  studentHousingOnly: false,
                })}
                className="mt-4 flex items-center gap-1.5 text-sm text-[#495057] hover:text-[#212529] font-medium transition-colors group"
              >
                <X size={ICON_SIZES.sm} className="group-hover:rotate-90 transition-transform" />
                Clear all filters
              </button>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden bg-[#F8F9FA]">
        {loading ? (
          <div className="h-full overflow-y-auto">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          </div>
        ) : showMap ? (
          <MapView
            properties={filteredProperties.filter(p => p.lat !== null && p.lng !== null) as any}
            selectedProperty={selectedProperty}
            onPropertySelect={setSelectedProperty}
          />
        ) : (
          <div className="h-full overflow-y-auto">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <PropertyListCard key={property.id} property={property} />
              ))}
            </div>
            {filteredProperties.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 px-4">
                <div className="flex items-center justify-center">
                  <div className="w-20 h-20 bg-[#F8F9FA] rounded-2xl flex items-center justify-center border-2 border-[#E9ECEF] shadow-sm">
                    <Home size={ICON_SIZES['3xl']} className="text-[#495057]" />
                  </div>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold text-[#212529] mt-8 mb-3">No properties found</h3>
                <p className="text-[#495057] text-center max-w-md mb-8 leading-relaxed">
                  {searchQuery 
                    ? `We couldn't find any properties matching "${searchQuery}". Try adjusting your search or filters.`
                    : 'Try adjusting your filters or search query to discover available properties.'
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
                      studentHousingOnly: false,
                    })
                  }}
                  className="btn-primary"
                >
                  Clear all filters
                </button>
                
                <p className="text-[#ADB5BD] text-xs mt-6">
                  Need help? <a href="/help" className="text-[#212529] font-medium hover:underline">View our guides</a>
                </p>
              </div>
            )}
            </div>
          </div>
        )}
      </div>

      {/* Structured Data for Search Results */}
      {!loading && filteredProperties.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: headingText,
              numberOfItems: filteredProperties.length,
              itemListElement: filteredProperties.slice(0, 10).map((p, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: `https://www.huts.co.zw/property/${p.slug || p.id}`,
                name: p.title,
              })),
            }),
          }}
        />
      )}
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
            <Home className="text-[#ADB5BD]" size={ICON_SIZES['3xl']} />
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
          <Heart size={ICON_SIZES.lg} className="text-[#212529]" />
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
          <MapPin size={ICON_SIZES.sm} className="mr-1.5 flex-shrink-0" />
          <span className="line-clamp-1">
            {property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}
          </span>
        </div>
        
        {/* Features */}
        <div className="flex items-center gap-4 text-sm text-[#495057] pt-3 border-t border-[#E9ECEF]">
          <div className="flex items-center gap-1.5">
            <Bed size={ICON_SIZES.md} className="text-[#495057]" />
            <span className="font-medium">{property.beds}</span>
            <span className="text-[#ADB5BD]">bed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath size={ICON_SIZES.md} className="text-[#495057]" />
            <span className="font-medium">{property.baths}</span>
            <span className="text-[#ADB5BD]">bath</span>
          </div>
          {property.sqft && property.sqft > 0 && (
            <div className="flex items-center gap-1.5">
              <Square size={ICON_SIZES.md} className="text-[#495057]" />
              <span className="font-medium">{property.sqft.toLocaleString()}</span>
              <span className="text-[#ADB5BD]">sqft</span>
            </div>
          )}
        </div>
      </div>
    </a>
  )
}
