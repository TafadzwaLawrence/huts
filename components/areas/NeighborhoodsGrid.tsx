'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { MapPin, ArrowRight, Search, Home, X } from 'lucide-react'

interface AreaGuide {
  id: string
  slug: string
  name: string
  city: string
  description?: string | null
  property_count?: number | null
  avg_rent?: number | null
}

interface Props {
  areas: AreaGuide[]
}

export default function NeighborhoodsGrid({ areas }: Props) {
  const [activeCity, setActiveCity] = useState<string>('All')
  const [query, setQuery] = useState('')

  // Build sorted city tab list with counts
  const cityTabs = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const a of areas) {
      counts[a.city] = (counts[a.city] || 0) + 1
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1]) // most suburbs first
      .map(([city, count]) => ({ city, count }))
  }, [areas])

  // Filter by city + search query
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return areas.filter((a) => {
      const matchesCity = activeCity === 'All' || a.city === activeCity
      const matchesQuery =
        !q || a.name.toLowerCase().includes(q) || a.city.toLowerCase().includes(q)
      return matchesCity && matchesQuery
    })
  }, [areas, activeCity, query])

  // Group by city for "All" view
  const grouped = useMemo(() => {
    if (activeCity !== 'All') return null
    const map: Record<string, AreaGuide[]> = {}
    for (const a of filtered) {
      if (!map[a.city]) map[a.city] = []
      map[a.city].push(a)
    }
    // Sort cities by total count desc, then alphabetically
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length)
  }, [filtered, activeCity])

  return (
    <div>
      {/* City tabs — horizontal scroll on mobile */}
      <div className="relative">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          <button
            onClick={() => setActiveCity('All')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              activeCity === 'All'
                ? 'bg-[#212529] text-white'
                : 'bg-white border border-[#E9ECEF] text-[#495057] hover:border-[#212529] hover:text-[#212529]'
            }`}
          >
            All
            <span className={`ml-1.5 text-xs ${activeCity === 'All' ? 'text-[#ADB5BD]' : 'text-[#ADB5BD]'}`}>
              {areas.length}
            </span>
          </button>
          {cityTabs.map(({ city, count }) => (
            <button
              key={city}
              onClick={() => setActiveCity(city)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeCity === city
                  ? 'bg-[#212529] text-white'
                  : 'bg-white border border-[#E9ECEF] text-[#495057] hover:border-[#212529] hover:text-[#212529]'
              }`}
            >
              {city}
              <span className="ml-1.5 text-xs text-[#ADB5BD]">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="mt-5 mb-6 relative">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ADB5BD] pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${activeCity === 'All' ? 'all neighborhoods' : activeCity + ' neighborhoods'}…`}
          className="w-full pl-9 pr-9 py-2.5 text-sm border border-[#E9ECEF] rounded-lg bg-white text-[#212529] placeholder:text-[#ADB5BD] focus:outline-none focus:border-[#212529] transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ADB5BD] hover:text-[#212529] transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Results count */}
      {query && (
        <p className="text-xs text-[#ADB5BD] mb-5">
          {filtered.length === 0
            ? 'No areas match your search'
            : `${filtered.length} area${filtered.length !== 1 ? 's' : ''} found`}
        </p>
      )}

      {/* Grid — grouped by city in "All" view, flat grid in city view */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <MapPin size={32} className="mx-auto text-[#ADB5BD] mb-3" />
          <p className="text-sm text-[#495057] font-medium">No areas match &ldquo;{query}&rdquo;</p>
          <button
            onClick={() => setQuery('')}
            className="mt-3 text-xs text-[#ADB5BD] underline underline-offset-2 hover:text-[#212529]"
          >
            Clear search
          </button>
        </div>
      ) : grouped ? (
        /* ALL view — grouped by city */
        <div className="space-y-10">
          {grouped.map(([city, cityAreas]) => (
            <div key={city}>
              {/* City heading */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-[#ADB5BD]" />
                  <h3 className="text-sm font-bold text-[#212529] tracking-wide uppercase">
                    {city}
                  </h3>
                  <span className="text-xs text-[#ADB5BD] font-normal">
                    {cityAreas.length} neighborhood{cityAreas.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  onClick={() => setActiveCity(city)}
                  className="text-xs text-[#ADB5BD] hover:text-[#212529] transition-colors flex items-center gap-1"
                >
                  Show all <ArrowRight size={11} />
                </button>
              </div>

              {/* Compact suburb list */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                {cityAreas.map((area) => (
                  <AreaPill key={area.id} area={area} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Single city view — slightly larger cards in a grid */
        <div>
          <p className="text-xs text-[#ADB5BD] mb-5">
            {filtered.length} neighborhood{filtered.length !== 1 ? 's' : ''} in {activeCity}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {filtered.map((area) => (
              <AreaPill key={area.id} area={area} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AreaPill({ area }: { area: AreaGuide }) {
  const hasProperties = (area.property_count || 0) > 0

  return (
    <Link
      href={`/areas/${area.slug}`}
      className={`group flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border transition-all duration-200 ${
        hasProperties
          ? 'border-[#E9ECEF] bg-white hover:border-[#212529] hover:bg-[#212529] hover:text-white'
          : 'border-[#E9ECEF] bg-[#F8F9FA] hover:border-[#ADB5BD] hover:bg-white'
      }`}
    >
      <div className="min-w-0">
        <span
          className={`text-sm font-semibold leading-tight block truncate transition-colors ${
            hasProperties
              ? 'text-[#212529] group-hover:text-white'
              : 'text-[#495057] group-hover:text-[#212529]'
          }`}
        >
          {area.name}
        </span>
        {hasProperties && (
          <span
            className={`text-[10px] font-medium flex items-center gap-0.5 mt-0.5 transition-colors ${
              hasProperties ? 'text-[#ADB5BD] group-hover:text-[#ADB5BD]' : 'text-[#ADB5BD]'
            }`}
          >
            <Home size={10} />
            {area.property_count}
          </span>
        )}
      </div>
      <ArrowRight
        size={13}
        className={`flex-shrink-0 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200 ${
          hasProperties ? 'text-white' : 'text-[#212529]'
        }`}
      />
    </Link>
  )
}
