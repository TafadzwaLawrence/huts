'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Search, Loader2, Building2 } from 'lucide-react'
import { ICON_SIZES } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'

interface DbSuggestion {
  source: 'db'
  type: 'city' | 'neighborhood'
  name: string
  city?: string
  count: number
}

interface PlaceSuggestion {
  source: 'place'
  displayName: string      // short label e.g. "Borrowdale"
  subtitle: string         // e.g. "Harare, Zimbabwe"
  lat: string
  lon: string
  searchQuery: string      // what we pass to /search?q=
}

type Suggestion = DbSuggestion | PlaceSuggestion

// Nominatim result shape (only fields we use)
interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  type: string
  address: {
    suburb?: string
    neighbourhood?: string
    city?: string
    town?: string
    village?: string
    county?: string
    state?: string
    country?: string
  }
}

function parseNominatim(results: NominatimResult[]): PlaceSuggestion[] {
  return results
    .filter((r) => r.address.country?.toLowerCase().includes('zimbabwe'))
    .map((r) => {
      const a = r.address
      const locality =
        a.suburb || a.neighbourhood || a.city || a.town || a.village || a.county || ''
      const city = a.city || a.town || a.village || a.county || ''
      const state = a.state || ''

      const displayName = locality || city
      const subtitle = [city !== displayName ? city : '', state, 'Zimbabwe']
        .filter(Boolean)
        .join(', ')

      return {
        source: 'place' as const,
        displayName,
        subtitle,
        lat: r.lat,
        lon: r.lon,
        searchQuery: locality || city,
      } satisfies PlaceSuggestion
    })
    .filter((s) => s.displayName)
    // deduplicate on displayName+subtitle
    .filter((s, i, arr) => arr.findIndex((x) => x.displayName === s.displayName && x.subtitle === s.subtitle) === i)
    .slice(0, 4)
}

export default function HomeSearchBar() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isLocating, setIsLocating] = useState(false)
  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    const supabase = createClient()
    const searchTerm = q.toLowerCase().trim()

    try {
      // Run DB query and Nominatim in parallel
      const [propertiesResult, nominatimResult] = await Promise.allSettled([
        supabase
          .from('properties')
          .select('city, neighborhood')
          .eq('status', 'active')
          .eq('verification_status', 'approved'),
        fetch(
          `https://nominatim.openstreetmap.org/search?` +
          new URLSearchParams({
            q: `${q}, Zimbabwe`,
            format: 'json',
            addressdetails: '1',
            limit: '6',
            countrycodes: 'zw',
            'accept-language': 'en',
          }),
          { headers: { 'User-Agent': 'HutsPropertySearch/1.0' } }
        ).then((r) => r.json() as Promise<NominatimResult[]>),
      ])

      const dbResults: DbSuggestion[] = []

      if (propertiesResult.status === 'fulfilled' && propertiesResult.value.data) {
        const properties = propertiesResult.value.data

        const cityCounts = properties.reduce((acc: Record<string, number>, p) => {
          if (p.city) acc[p.city] = (acc[p.city] || 0) + 1
          return acc
        }, {})

        const neighborhoodCounts = properties.reduce((acc: Record<string, { city: string; count: number }>, p) => {
          if (p.neighborhood && p.city) {
            const k = `${p.neighborhood}||${p.city}`
            acc[k] = { city: p.city, count: (acc[k]?.count || 0) + 1 }
          }
          return acc
        }, {})

        Object.entries(cityCounts).forEach(([city, count]) => {
          if (city.toLowerCase().includes(searchTerm)) {
            dbResults.push({ source: 'db', type: 'city', name: city, count })
          }
        })

        Object.entries(neighborhoodCounts).forEach(([key, val]) => {
          const [neighborhood] = key.split('||')
          if (
            neighborhood.toLowerCase().includes(searchTerm) ||
            val.city.toLowerCase().includes(searchTerm)
          ) {
            dbResults.push({ source: 'db', type: 'neighborhood', name: neighborhood, city: val.city, count: val.count })
          }
        })

        dbResults.sort((a, b) => b.count - a.count)
      }

      const placeResults: PlaceSuggestion[] =
        nominatimResult.status === 'fulfilled'
          ? parseNominatim(nominatimResult.value)
          : []

      // Remove place results whose displayName already appears in DB results
      const dbNames = new Set(dbResults.map((d) => d.name.toLowerCase()))
      const filteredPlaces = placeResults.filter(
        (p) => !dbNames.has(p.displayName.toLowerCase())
      )

      const merged: Suggestion[] = [...dbResults.slice(0, 5), ...filteredPlaces.slice(0, 4)]
      setSuggestions(merged)
      setIsOpen(merged.length > 0)
      setActiveIndex(-1)
    } catch (error) {
      console.error('Search error:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchSuggestions(query), 300)
    return () => clearTimeout(timer)
  }, [query, fetchSuggestions])

  const handleLocateMe = () => {
    if (!navigator.geolocation) return
    setIsLocating(true)
    setIsOpen(false)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?` +
            new URLSearchParams({
              lat: String(latitude),
              lon: String(longitude),
              format: 'json',
              addressdetails: '1',
              'accept-language': 'en',
            }),
            { headers: { 'User-Agent': 'HutsPropertySearch/1.0' } }
          )
          const data = await res.json()
          const a = data.address ?? {}
          const locality =
            a.suburb || a.neighbourhood || a.city_district || a.town || a.city || a.county || ''
          const label = locality || data.display_name?.split(',')[0] || ''
          if (label) {
            setQuery(label)
            router.push(`/search?q=${encodeURIComponent(label)}`)
          }
        } catch (e) {
          console.error('Reverse geocode error:', e)
        } finally {
          setIsLocating(false)
        }
      },
      (err) => {
        console.error('Geolocation error:', err)
        setIsLocating(false)
      },
      { timeout: 10000, maximumAge: 60000 }
    )
  }

  const handleSelectDb = (s: DbSuggestion) => {
    setIsOpen(false)
    setActiveIndex(-1)
    if (s.type === 'city') {
      router.push(`/search?city=${encodeURIComponent(s.name)}`)
    } else {
      router.push(`/search?city=${encodeURIComponent(s.city!)}&neighborhood=${encodeURIComponent(s.name)}`)
    }
  }

  const handleSelectPlace = (s: PlaceSuggestion) => {
    setQuery(s.displayName)
    setIsOpen(false)
    setActiveIndex(-1)
    router.push(`/search?q=${encodeURIComponent(s.searchQuery)}`)
  }

  const handleSelect = (s: Suggestion) => {
    if (s.source === 'db') handleSelectDb(s)
    else handleSelectPlace(s)
  }

  const handleSearch = () => {
    setIsOpen(false)
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      handleSelect(suggestions[activeIndex])
      return
    }
    router.push(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter') handleSearch()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        handleSelect(suggestions[activeIndex])
      } else {
        handleSearch()
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  // Split for section headers
  const dbSuggestions = suggestions.filter((s): s is DbSuggestion => s.source === 'db')
  const placeSuggestions = suggestions.filter((s): s is PlaceSuggestion => s.source === 'place')

  return (
    <div ref={wrapperRef} className="max-w-2xl mx-auto relative">
      <div className="relative bg-white rounded-2xl shadow-xl border-2 border-[#E9ECEF] p-2 hover:border-[#495057] transition-colors duration-300">
          {/* Location Input + Search — single row */}
          <div className="flex items-center gap-3 px-4 py-3 bg-[#F8F9FA] rounded-xl">
            <button
              type="button"
              onClick={handleLocateMe}
              title="Use my current location"
              className="flex-shrink-0 rounded-md p-0.5 transition-colors hover:text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-1"
              disabled={isLocating}
            >
              {isLocating
                ? <Loader2 size={ICON_SIZES.lg} className="text-[#212529] animate-spin" />
                : <MapPin size={ICON_SIZES.lg} className="text-[#ADB5BD] hover:text-[#212529] transition-colors" />}
            </button>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setIsOpen(true)}
              placeholder="Search by city, neighborhood, or address"
              className="w-full bg-transparent outline-none text-[#212529] placeholder:text-[#ADB5BD] text-sm font-medium"
              autoComplete="off"
            />
            {isLoading && !isLocating && (
              <Loader2 size={ICON_SIZES.md} className="text-[#ADB5BD] animate-spin flex-shrink-0" />
            )}
            <button
              type="button"
              onClick={handleSearch}
              aria-label="Search"
              className="flex-shrink-0 rounded-md p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-1"
            >
              <Search size={ICON_SIZES.lg} className="text-[#ADB5BD] hover:text-[#212529] transition-colors" />
            </button>
          </div>
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border-2 border-[#E9ECEF] z-50 overflow-hidden">
          <div className="py-2">

            {/* DB results — properties on platform */}
            {dbSuggestions.length > 0 && (
              <>
                <p className="px-5 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#ADB5BD]">
                  On Huts
                </p>
                {dbSuggestions.map((s, i) => {
                  const globalIdx = i
                  return (
                    <button
                      key={`db-${s.name}-${i}`}
                      onClick={() => handleSelectDb(s)}
                      className={`w-full px-5 py-2.5 flex items-center justify-between transition-colors text-left ${
                        activeIndex === globalIdx ? 'bg-[#F8F9FA]' : 'hover:bg-[#F8F9FA]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 size={15} className="text-[#495057]" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-[#212529] truncate">{s.name}</div>
                          {s.type === 'neighborhood' && s.city && (
                            <div className="text-xs text-[#ADB5BD] truncate">{s.city}</div>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-[#ADB5BD] font-medium flex-shrink-0 ml-2">
                        {s.count} {s.count === 1 ? 'property' : 'properties'}
                      </span>
                    </button>
                  )
                })}
              </>
            )}

            {/* Place results — Nominatim real places */}
            {placeSuggestions.length > 0 && (
              <>
                {dbSuggestions.length > 0 && <div className="my-1.5 border-t border-[#F1F3F5]" />}
                <p className="px-5 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#ADB5BD]">
                  Places
                </p>
                {placeSuggestions.map((s, i) => {
                  const globalIdx = dbSuggestions.length + i
                  return (
                    <button
                      key={`place-${i}-${s.displayName}`}
                      onClick={() => handleSelectPlace(s)}
                      className={`w-full px-5 py-2.5 flex items-center gap-3 transition-colors text-left ${
                        activeIndex === globalIdx ? 'bg-[#F8F9FA]' : 'hover:bg-[#F8F9FA]'
                      }`}
                    >
                      <div className="w-9 h-9 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin size={15} className="text-[#495057]" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-[#212529] truncate">{s.displayName}</div>
                        {s.subtitle && (
                          <div className="text-xs text-[#ADB5BD] truncate">{s.subtitle}</div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </>
            )}

          </div>
        </div>
      )}
    </div>
  )
}
