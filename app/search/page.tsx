'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Map as MapIcon, List, Loader2, Bell, ChevronLeft, ChevronRight, Search, Lightbulb } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
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
  schools?: any[]
  healthcareFacilities?: any[]
  selectedProperty: string | null
  onPropertySelect: (id: string | null) => void
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void
  showSchools: boolean
  schoolLevels: string
  onSchoolFilterChange: (showSchools: boolean, schoolLevels: string) => void
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
    showSchools: searchParams.get('showSchools') === '1',
    schoolLevels: searchParams.get('schoolLevels') || 'primary,secondary,tertiary,combined',
  })
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest')
  const [properties, setProperties] = useState<Property[]>([])
  const [schools, setSchools] = useState<any[]>([])
  const [healthcareFacilities, setHealthcareFacilities] = useState<any[]>([])
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
    if (filters.showSchools) params.set('showSchools', '1')
    if (filters.schoolLevels) params.set('schoolLevels', filters.schoolLevels)
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

  // Fetch schools when enabled and bounds change
  const fetchSchools = useCallback(async () => {
    if (!filters.showSchools || !debouncedBounds) {
      setSchools([])
      return
    }

    try {
      const params = new URLSearchParams()
      params.set('north', String(debouncedBounds.north))
      params.set('south', String(debouncedBounds.south))
      params.set('east', String(debouncedBounds.east))
      params.set('west', String(debouncedBounds.west))
      if (filters.schoolLevels) params.set('level', filters.schoolLevels)
      const city = searchParams.get('city')
      if (city) params.set('city', city)

      const res = await fetch(`/api/schools?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch schools')
      const data = await res.json()
      setSchools(data.schools || [])
    } catch (err) {
      console.error('Schools fetch error:', err)
      setSchools([])
    }
  }, [filters.showSchools, filters.schoolLevels, debouncedBounds, searchParams])

  // Fetch healthcare facilities within map bounds (always shown)
  const fetchHealthcare = useCallback(async () => {
    if (!debouncedBounds) {
      setHealthcareFacilities([])
      return
    }

    try {
      const params = new URLSearchParams()
      params.set('north', debouncedBounds.north.toString())
      params.set('south', debouncedBounds.south.toString())
      params.set('east', debouncedBounds.east.toString())
      params.set('west', debouncedBounds.west.toString())

      const res = await fetch(`/api/healthcare?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch healthcare facilities')
      const data = await res.json()
      setHealthcareFacilities(data.facilities || [])
    } catch (err) {
      console.error('Healthcare fetch error:', err)
      setHealthcareFacilities([])
    }
  }, [debouncedBounds])

  // Fetch on filter/sort/page change
  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  // Fetch schools when enabled or bounds change
  useEffect(() => {
    fetchSchools()
  }, [fetchSchools])

  // Fetch healthcare facilities when bounds change
  useEffect(() => {
    fetchHealthcare()
  }, [fetchHealthcare])

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

  const handleSchoolFilterChange = (showSchools: boolean, schoolLevels: string) => {
    setFilters((prev) => ({ ...prev, showSchools, schoolLevels }))
  }

  const handleClearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      beds: '',
      baths: '',
      propertyType: 'all',
      studentHousingOnly: false,
      showSchools: false,
      schoolLevels: 'primary,secondary,tertiary,combined',
    })
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
    <div className="flex flex-col h-[calc(100vh-60px)]">
      {/* Filter Bar */}
      <div className="bg-white border-b border-[#E9ECEF] px-4 py-2 flex-shrink-0 relative z-[1000]">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <FilterBar
              listingType={listingType}
              onListingTypeChange={setListingType}
              filters={{
                minPrice: filters.minPrice,
                maxPrice: filters.maxPrice,
                beds: filters.beds,
                baths: filters.baths,
                propertyType: filters.propertyType,
                studentHousingOnly: filters.studentHousingOnly,
              }}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              resultCount={total}
              sort={sort}
              onSortChange={setSort}
            />
          </div>

          {/* Save Search */}
          <button className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#212529] border border-[#E9ECEF] rounded-lg hover:border-[#212529] transition-colors whitespace-nowrap">
            <Bell size={14} />
            Save search
          </button>

          {/* View Toggles */}
          <div className="flex-shrink-0 flex items-center gap-0.5 border-l border-[#E9ECEF] pl-2 ml-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${effectiveView === 'list' ? 'bg-[#212529] text-white' : 'text-[#495057] hover:bg-[#F8F9FA]'}`}
              aria-label="List view"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`hidden md:block p-1.5 rounded-md transition-all ${effectiveView === 'split' ? 'bg-[#212529] text-white' : 'text-[#495057] hover:bg-[#F8F9FA]'}`}
              aria-label="Split view"
            >
              <div className="flex gap-0.5">
                <div className="w-2 h-3.5 border border-current rounded-sm" />
                <div className="w-2 h-3.5 border border-current rounded-sm" />
              </div>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-md transition-all ${effectiveView === 'map' ? 'bg-[#212529] text-white' : 'text-[#495057] hover:bg-[#F8F9FA]'}`}
              aria-label="Map view"
            >
              <MapIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${isMobile ? 'flex flex-col' : 'flex'} overflow-hidden`}>
        {/* Map Panel - On mobile: stacked on top (height adjusts by view mode), On desktop: Zillow style on left */}
        {(isMobile || effectiveView === 'split' || effectiveView === 'map') && (
          <div className={`${
            isMobile 
              ? `${
                  effectiveView === 'map' ? 'h-[60vh]' : 
                  effectiveView === 'list' ? 'h-[30vh]' : 
                  'h-[45vh]'
                } border-b border-[#E9ECEF]`
              : effectiveView === 'split' 
                ? 'w-1/2 border-r border-[#E9ECEF]' 
                : 'w-full'
          } relative`}>
            <MapView
              properties={mappableProperties}
              schools={schools}
              healthcareFacilities={healthcareFacilities}
              selectedProperty={selectedProperty}
              onPropertySelect={setSelectedProperty}
              onBoundsChange={handleBoundsChange}
              showSchools={filters.showSchools}
              schoolLevels={filters.schoolLevels}
              onSchoolFilterChange={handleSchoolFilterChange}
            />
          </div>
        )}

        {/* Listings Panel - On mobile: stacked below map, On desktop: Zillow style on right */}
        {(isMobile || effectiveView !== 'map') && (
          <div className={`overflow-y-auto bg-white ${
            isMobile 
              ? 'flex-1' 
              : effectiveView === 'split' 
                ? 'w-1/2' 
                : 'w-full'
          }`}>
            {/* Search as map moves toggle */}
            {effectiveView === 'split' && (
              <div className="px-4 py-1.5 border-b border-[#E9ECEF] bg-[#F8F9FA]/50 flex items-center gap-2 text-xs text-[#495057]">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={searchMoveMap}
                    onChange={(e) => setSearchMoveMap(e.target.checked)}
                    className="rounded border-[#ADB5BD] text-[#212529] focus:ring-[#212529] w-3.5 h-3.5"
                  />
                  Search as I move the map
                </label>
              </div>
            )}

            {/* Result header */}
            <div className="px-4 pt-3 pb-1 flex items-center justify-between">
              <div>
                <h1 className="text-base font-bold text-[#212529]">
                  {searchParams.get('q') || searchParams.get('neighborhood') || searchParams.get('city')
                    ? `${searchParams.get('q') || searchParams.get('neighborhood') || searchParams.get('city')} Real Estate`
                    : 'Zimbabwe Real Estate'}
                </h1>
                {!loading && (
                  <p className="text-xs text-[#495057] mt-0.5">
                    <span className="font-semibold text-[#212529]">{total.toLocaleString()}</span> results
                  </p>
                )}
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-xs text-[#495057] bg-transparent border-none outline-none cursor-pointer font-medium"
              >
                <option value="newest">Sort: Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="beds_desc">Sort: Bedrooms</option>
                <option value="sqft_desc">Sort: Sq Ft</option>
              </select>
            </div>

            {loading ? (
              <div className="p-4">
                <div className={`grid gap-4 ${effectiveView === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-[#E9ECEF] rounded-xl h-44" />
                      <div className="p-3 space-y-2">
                        <div className="h-5 w-24 bg-[#E9ECEF] rounded" />
                        <div className="h-3 w-32 bg-[#F8F9FA] rounded" />
                        <div className="h-3 w-40 bg-[#F8F9FA] rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : properties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-14 h-14 bg-[#F8F9FA] rounded-2xl flex items-center justify-center mb-5">
                  <Search size={24} className="text-[#ADB5BD]" />
                </div>
                <p className="text-xl font-bold text-[#212529] mb-2">No matching results</p>
                <p className="text-sm text-[#495057] mb-8 max-w-sm">We couldn&apos;t find properties matching your criteria. Try changing your search.</p>
                
                <div className="bg-[#F8F9FA] rounded-xl p-6 max-w-md w-full text-left">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb size={16} className="text-[#495057]" />
                    <h3 className="text-sm font-bold text-[#212529] uppercase tracking-wide">Search Tips</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-[#495057]">
                    <li className="flex gap-2">
                      <span className="text-[#212529] font-bold">·</span>
                      <span>Try a broader location — search by city instead of neighborhood</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#212529] font-bold">·</span>
                      <span>Decrease the number of filters you&apos;ve applied</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#212529] font-bold">·</span>
                      <span>Zoom out or move the map to expand your search area</span>
                    </li>
                  </ul>
                </div>

                <button className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-[#212529] border border-[#E9ECEF] rounded-lg hover:border-[#212529] transition-colors">
                  <Bell size={14} />
                  Save this search to get alerts
                </button>
              </div>
            ) : (
              <div className="p-4">
                <div className={`grid gap-4 ${effectiveView === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      onMouseEnter={() => setSelectedProperty(property.id)}
                      onMouseLeave={() => setSelectedProperty(null)}
                      className={`transition-shadow duration-150 rounded-xl ${selectedProperty === property.id ? 'ring-2 ring-[#212529]' : ''}`}
                    >
                      <PropertyCard property={property as any} compact={effectiveView === 'split'} noGrayscale={true} />
                    </div>
                  ))}
                </div>

                {/* Pagination — Zillow style numbered pages */}
                {totalPages > 1 && (
                  <nav className="flex items-center justify-center gap-1 mt-8 pb-4" aria-label="Pagination">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg border border-[#E9ECEF] disabled:opacity-30 hover:border-[#212529] transition-all"
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                      let pageNum: number
                      if (totalPages <= 7) {
                        pageNum = i + 1
                      } else if (page <= 4) {
                        pageNum = i + 1
                      } else if (page >= totalPages - 3) {
                        pageNum = totalPages - 6 + i
                      } else {
                        pageNum = page - 3 + i
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`min-w-[36px] h-9 text-sm font-medium rounded-lg transition-all ${
                            page === pageNum
                              ? 'bg-[#212529] text-white'
                              : 'text-[#495057] hover:bg-[#F8F9FA]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 rounded-lg border border-[#E9ECEF] disabled:opacity-30 hover:border-[#212529] transition-all"
                      aria-label="Next page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </nav>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
