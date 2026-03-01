'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Search, Loader2 } from 'lucide-react'
import { ICON_SIZES } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'

interface LocationSuggestion {
  type: 'city' | 'neighborhood'
  name: string
  city?: string
  count: number
}

export default function HomeSearchBar() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch location suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([])
        setIsOpen(false)
        return
      }

      setIsLoading(true)
      const supabase = createClient()

      try {
        // Fetch all active properties with their locations
        const { data: properties } = await supabase
          .from('properties')
          .select('city, neighborhood')
          .eq('status', 'active')
          .eq('verification_status', 'approved')

        if (!properties) {
          setSuggestions([])
          return
        }

        const searchTerm = query.toLowerCase().trim()
        const results: LocationSuggestion[] = []

        // Group by city
        const cityCounts = properties.reduce((acc: any, prop: any) => {
          if (prop.city) {
            acc[prop.city] = (acc[prop.city] || 0) + 1
          }
          return acc
        }, {})

        // Group by neighborhood (with city)
        const neighborhoodCounts = properties.reduce((acc: any, prop: any) => {
          if (prop.neighborhood && prop.city) {
            const key = `${prop.neighborhood}|${prop.city}`
            acc[key] = (acc[key] || 0) + 1
          }
          return acc
        }, {})

        // Filter cities
        Object.entries(cityCounts).forEach(([city, count]) => {
          if (city.toLowerCase().includes(searchTerm)) {
            results.push({
              type: 'city',
              name: city,
              count: count as number,
            })
          }
        })

        // Filter neighborhoods
        Object.entries(neighborhoodCounts).forEach(([key, count]) => {
          const [neighborhood, city] = key.split('|')
          if (
            neighborhood.toLowerCase().includes(searchTerm) ||
            city.toLowerCase().includes(searchTerm)
          ) {
            results.push({
              type: 'neighborhood',
              name: neighborhood,
              city: city,
              count: count as number,
            })
          }
        })

        // Sort by count (most properties first) and limit to 8 results
        results.sort((a, b) => b.count - a.count)
        setSuggestions(results.slice(0, 8))
        setIsOpen(results.length > 0)
      } catch (error) {
        console.error('Search error:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    setIsOpen(false)
    setQuery('')
    
    if (suggestion.type === 'city') {
      router.push(`/search?city=${encodeURIComponent(suggestion.name)}`)
    } else {
      router.push(
        `/search?city=${encodeURIComponent(suggestion.city!)}&neighborhood=${encodeURIComponent(suggestion.name)}`
      )
    }
  }

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    } else {
      router.push('/search')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div ref={wrapperRef} className="max-w-2xl mx-auto relative">
      <div className="relative bg-white rounded-2xl shadow-xl border-2 border-[#E9ECEF] p-2 hover:border-[#495057] transition-colors duration-300">
        <div className="flex flex-col md:flex-row gap-2">
          {/* Location Input */}
          <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-[#F8F9FA] rounded-xl relative">
            <MapPin size={ICON_SIZES.lg} className="text-[#ADB5BD] flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by city, neighborhood, or address"
              className="w-full bg-transparent outline-none text-[#212529] placeholder:text-[#ADB5BD] text-sm font-medium"
            />
            {isLoading && (
              <Loader2 size={ICON_SIZES.md} className="text-[#ADB5BD] animate-spin flex-shrink-0" />
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="btn btn-primary flex items-center justify-center gap-2 px-8 py-4 min-h-[52px]"
          >
            <Search size={ICON_SIZES.lg} />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border-2 border-[#E9ECEF] z-50 overflow-hidden">
          <div className="py-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.name}-${index}`}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full px-6 py-3 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F8F9FA] rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin size={ICON_SIZES.md} className="text-[#495057]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#212529]">
                      {suggestion.name}
                    </div>
                    {suggestion.type === 'neighborhood' && suggestion.city && (
                      <div className="text-xs text-[#ADB5BD]">
                        {suggestion.city}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-[#ADB5BD] font-medium">
                  {suggestion.count} {suggestion.count === 1 ? 'property' : 'properties'}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
