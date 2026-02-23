'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Map as MapIcon, List, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { ICON_SIZES } from '@/lib/constants'
import { PropertyCard } from '@/components/property/PropertyCard'
import { FilterBar } from '@/components/search/FilterBar'

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
  property_images: Array<{ id?: string; url: string; is_primary: boolean; alt_text?: string | null }>
  profiles?: { name: string; avatar_url: string | null; verified: boolean }
}

const MapView = dynamic<{
  properties: (Property & { lat: number; lng: number })[]
  selectedProperty: string | null
  onPropertySelect: (id: string | null) => void
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void
}>(() => import('@/components/search/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[#F8F9FA] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#ADB5BD]" size={24} />
    </div>
  ),
})

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

  // View mode: split (desktop default), list, map
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split')
  const [listingType, setListingType] = useState<'all' | 'rent' | 'sale'>(
    (searchParams.get('type') as 'all' | 'rent' | 'sale') || 'all'
  )
  const [filters, setFilters] = useState({
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    beds: searchParams.get('beds') || '',
    baths: searchParams.get('baths') || '',
    propertyType: searchParams.get('propertyType') || 'all',
    studentHousingOnly: searchParams.get('student') === '1',
  })
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest')
  const [properties, setProperties] = useState<Property[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchMoveMap, setSearchMoveMap] = useState(true)
  const [mapBounds, setMapBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null)
  const isInitialMount = useRef(true)
  const abortRef = useRef<AbortController | null>(null)

  const debouncedBounds = useDebounce(mapBounds, 400)

  // Build query params for API
  const buildSearchParams = useCallback(() => {
    const params = new URLSearchParams()
    const q = searchParams.get('q')
    if (q) params.set('q', q)
    if (listingType !== 'all') params.set('type', listingType)
    if (filters.minPrice) params.set('minPrice', filters.minPrice)
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
    if (filters.beds) params.set('beds', filters.beds)
    if (filters.baths) params.set('baths', filters.baths)
    if (filters.propertyType !== 'all') params.set('propertyType', filters.propertyType)
    if (filters.studentHousingOnly) params.set('student', '1')
    params.set('sort', sort)
    params.set('page', String(page))
    if (searchMoveMap && debouncedBounds) {
      params.set('north', String(debouncedBounds.north))
      params.set('south', String(debouncedBounds.south))
      params.set('east', String(debouncedBounds.east))
      params.set('west', String(debouncedBounds.west))
    }
    // Also pass city/neighborhood from URL
    const city = searchParams.get('city')
    const neighborhood = searchParams.get('neighborhood')
    if (city) params.set('city', city)
    if (neighborhood) params.set('neighborhood', neighborhood)
    return params
  }, [searchParams, listingType, filters, sort, page, searchMoveMap, debouncedBounds])

  // Fetch from server-side search API
  const fetchProperties = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    try {
      const params = buildSearchParams()
      const res = await fetch(`/api/search?${params.toString()}`, { signal: controller.signal })
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()
      setProperties(data.properties || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Search error:', err)
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [buildSearchParams])

  // Fetch on filter/sort/page change
  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  // Sync state to URL
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    const params = new URLSearchParams()
    const q = searchParams.get('q')
    if (q) params.set('q', q)
    if (listingType !== 'all') params.set('type', listingType)
    if (filters.minPrice) params.set('minPrice', filters.minPrice)
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
    if (filters.beds) params.set('beds', filters.beds)
    if (filters.baths) params.set('baths', filters.baths)
    if (filters.propertyType !== 'all') params.set('propertyType', filters.propertyType)
    if (filters.studentHousingOnly) params.set('student', '1')
    if (sort !== 'newest') params.set('sort', sort)
    const city = searchParams.get('city')
    const neighborhood = searchParams.get('neighborhood')
    if (city) params.set('city', city)
    if (neighborhood) params.set('neighborhood', neighborhood)

    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [listingType, filters, sort, pathname, router, searchParams])

  // Reset page on filter change
  useEffect(() => {
    setPage(1)
  }, [listingType, filters, sort, debouncedBounds])

  // Sync listing type from URL
  useEffect(() => {
    const typeParam = searchParams.get('type') as 'all' | 'rent' | 'sale' | null
    if (typeParam && typeParam !== listingType) setListingType(typeParam)
  }, [searchParams])

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleClearFilters = () => {
    setFilters({ minPrice: '', maxPrice: '', beds: '', baths: '', propertyType: 'all', studentHousingOnly: false })
  }

  const handleBoundsChange = (bounds: { north: number; south: number; east: number; west: number }) => {
    if (searchMoveMap) setMapBounds(bounds)
  }

  const mappableProperties = properties.filter(
    (p): p is Property & { lat: number; lng: number } => p.lat !== null && p.lng !== null
  )

  // Responsive: detect mobile
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const effectiveView = isMobile ? (viewMode === 'split' ? 'list' : viewMode) : viewMode

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Filter Bar */}
      <div className="bg-white border-b border-[#E9ECEF] px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex-1 overflow-x-auto">
            <FilterBar
              listingType={listingType}
              onListingTypeChange={setListingType}
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              resultCount={total}
              sort={sort}
              onSortChange={setSort}
            />
          </div>

          {/* View Toggles */}
          <div className="flex-shrink-0 flex items-center gap-1 border-l border-[#E9ECEF] pl-3">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${effectiveView === 'list' ? 'bg-[#212529] text-white' : 'text-[#495057] hover:bg-[#F8F9FA]'}`}
              aria-label="List view"
            >
              <List size={ICON_SIZES.md} />
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`hidden md:block p-2 rounded-lg transition-all ${effectiveView === 'split' ? 'bg-[#212529] text-white' : 'text-[#495057] hover:bg-[#F8F9FA]'}`}
              aria-label="Split view"
            >
              <div className="flex gap-0.5">
                <div className="w-2.5 h-4 border border-current rounded-sm" />
                <div className="w-2.5 h-4 border border-current rounded-sm" />
              </div>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg transition-all ${effectiveView === 'map' ? 'bg-[#212529] text-white' : 'text-[#495057] hover:bg-[#F8F9FA]'}`}
              aria-label="Map view"
            >
              <MapIcon size={ICON_SIZES.md} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Listings Panel */}
        {effectiveView !== 'map' && (
          <div className={`overflow-y-auto ${effectiveView === 'split' ? 'w-1/2 border-r border-[#E9ECEF]' : 'w-full'}`}>
            {/* Search as map moves toggle */}
            {effectiveView === 'split' && (
              <div className="px-4 py-2 border-b border-[#E9ECEF] bg-[#F8F9FA] flex items-center gap-2 text-xs text-[#495057]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={searchMoveMap}
                    onChange={(e) => setSearchMoveMap(e.target.checked)}
                    className="rounded border-[#ADB5BD] text-[#212529] focus:ring-[#212529]"
                  />
                  Search as I move the map
                </label>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-[#ADB5BD]" size={32} />
              </div>
            ) : properties.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                <p className="text-lg font-semibold text-[#212529] mb-2">No properties found</p>
                <p className="text-sm text-[#495057]">Try adjusting your filters or search in a different area</p>
              </div>
            ) : (
              <div className="p-4">
                <div className={`grid gap-4 ${effectiveView === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      onMouseEnter={() => setSelectedProperty(property.id)}
                      onMouseLeave={() => setSelectedProperty(null)}
                      className={`transition-all ${selectedProperty === property.id ? 'ring-2 ring-[#212529] rounded-xl' : ''}`}
                    >
                      <PropertyCard property={property as any} compact={effectiveView === 'split'} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8 pb-4">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 text-sm font-medium rounded-lg border border-[#E9ECEF] disabled:opacity-40 hover:border-[#212529] transition-all"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-[#495057]">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 text-sm font-medium rounded-lg border border-[#E9ECEF] disabled:opacity-40 hover:border-[#212529] transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Map Panel */}
        {(effectiveView === 'split' || effectiveView === 'map') && (
          <div className={`${effectiveView === 'split' ? 'w-1/2' : 'w-full'} relative`}>
            <MapView
              properties={mappableProperties}
              selectedProperty={selectedProperty}
              onPropertySelect={setSelectedProperty}
              onBoundsChange={handleBoundsChange}
            />
          </div>
        )}
      </div>
    </div>
  )
}
