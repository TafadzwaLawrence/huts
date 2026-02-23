'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Home, Building2, Clock, X } from 'lucide-react'
import { ICON_SIZES } from '@/lib/constants'

interface Suggestion {
  type: 'city' | 'neighborhood' | 'property'
  label: string
  value: string
  city?: string
  neighborhood?: string
  listing_type?: string
}

interface SearchAutocompleteProps {
  defaultValue?: string
  placeholder?: string
  className?: string
  inputClassName?: string
  onSearch?: (query: string) => void
  compact?: boolean
}

const RECENT_KEY = 'huts_recent_searches'
const MAX_RECENT = 5

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
  } catch { return [] }
}

function addRecentSearch(query: string) {
  if (typeof window === 'undefined' || !query.trim()) return
  const recent = getRecentSearches().filter(s => s !== query)
  recent.unshift(query)
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)))
}

export function SearchAutocomplete({
  defaultValue = '',
  placeholder = 'Search by city, neighborhood, or address',
  className = '',
  inputClassName = '',
  onSearch,
  compact = false,
}: SearchAutocompleteProps) {
  const router = useRouter()
  const [query, setQuery] = useState(defaultValue)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches())
  }, [])

  // Fetch suggestions with debounce
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    const timeout = setTimeout(async () => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setLoading(true)
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        })
        if (res.ok) {
          const data = await res.json()
          setSuggestions(data.suggestions || [])
        }
      } catch (e) {
        if (!(e instanceof DOMException && e.name === 'AbortError')) {
          console.error('Search suggestions error:', e)
        }
      } finally {
        setLoading(false)
      }
    }, 200)

    return () => clearTimeout(timeout)
  }, [query])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelect = useCallback((suggestion: Suggestion) => {
    setIsOpen(false)
    if (suggestion.type === 'property') {
      router.push(`/property/${suggestion.value}`)
    } else if (suggestion.type === 'neighborhood') {
      addRecentSearch(suggestion.label)
      const params = new URLSearchParams()
      params.set('neighborhood', suggestion.value)
      if (suggestion.city) params.set('city', suggestion.city)
      router.push(`/search?${params.toString()}`)
    } else {
      addRecentSearch(suggestion.label)
      router.push(`/search?city=${encodeURIComponent(suggestion.value)}`)
    }
  }, [router])

  const handleSubmit = useCallback(() => {
    if (query.trim()) {
      addRecentSearch(query.trim())
      setIsOpen(false)
      if (onSearch) {
        onSearch(query.trim())
      } else {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      }
    }
  }, [query, router, onSearch])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const items = suggestions.length > 0 ? suggestions : recentSearches.map(s => ({ type: 'city' as const, label: s, value: s }))
    
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => (prev + 1) % items.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => (prev - 1 + items.length) % items.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && activeIndex < items.length) {
        const item = items[activeIndex]
        if ('type' in item) {
          handleSelect(item as Suggestion)
        } else {
          setQuery(item as unknown as string)
          handleSubmit()
        }
      } else {
        handleSubmit()
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }, [suggestions, recentSearches, activeIndex, handleSelect, handleSubmit])

  const showDropdown = isOpen && (suggestions.length > 0 || (query.length === 0 && recentSearches.length > 0))

  const iconForType = (type: string) => {
    switch (type) {
      case 'city': return <MapPin size={ICON_SIZES.md} className="text-[#ADB5BD]" />
      case 'neighborhood': return <MapPin size={ICON_SIZES.md} className="text-[#ADB5BD]" />
      case 'property': return <Home size={ICON_SIZES.md} className="text-[#ADB5BD]" />
      default: return <Search size={ICON_SIZES.md} className="text-[#ADB5BD]" />
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className={`flex items-center gap-2 ${compact ? 'px-3 py-2' : 'px-4 py-3'} bg-[#F8F9FA] rounded-xl border-2 border-transparent focus-within:border-[#212529] focus-within:bg-white transition-all`}>
        <Search size={compact ? ICON_SIZES.md : ICON_SIZES.lg} className="text-[#ADB5BD] shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActiveIndex(-1)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`flex-1 bg-transparent outline-none text-[#212529] placeholder:text-[#ADB5BD] ${compact ? 'text-sm' : 'text-base'} ${inputClassName}`}
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="search-suggestions"
          aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
          autoComplete="off"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setSuggestions([]); inputRef.current?.focus() }}
            className="p-1 hover:bg-[#E9ECEF] rounded-md transition-colors"
            aria-label="Clear search"
          >
            <X size={ICON_SIZES.sm} className="text-[#ADB5BD]" />
          </button>
        )}
        {loading && (
          <div className="w-4 h-4 border-2 border-[#ADB5BD] border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-[#E9ECEF] shadow-xl overflow-hidden z-50 max-h-[400px] overflow-y-auto"
        >
          {/* Recent searches */}
          {query.length === 0 && recentSearches.length > 0 && (
            <div>
              <div className="px-4 py-2.5 text-[10px] font-bold text-[#ADB5BD] uppercase tracking-widest">
                Recent Searches
              </div>
              {recentSearches.map((search, i) => (
                <button
                  key={search}
                  id={`suggestion-${i}`}
                  role="option"
                  aria-selected={activeIndex === i}
                  onClick={() => {
                    setQuery(search)
                    setIsOpen(false)
                    router.push(`/search?q=${encodeURIComponent(search)}`)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F8F9FA] transition-colors ${
                    activeIndex === i ? 'bg-[#F8F9FA]' : ''
                  }`}
                >
                  <Clock size={ICON_SIZES.md} className="text-[#ADB5BD] shrink-0" />
                  <span className="text-sm text-[#495057]">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div>
              {/* Group by type */}
              {['city', 'neighborhood', 'property'].map(type => {
                const items = suggestions.filter(s => s.type === type)
                if (items.length === 0) return null
                
                const labels: Record<string, string> = {
                  city: 'Cities',
                  neighborhood: 'Neighborhoods',
                  property: 'Properties',
                }

                return (
                  <div key={type}>
                    <div className="px-4 py-2 text-[10px] font-bold text-[#ADB5BD] uppercase tracking-widest border-t border-[#F8F9FA] first:border-t-0">
                      {labels[type]}
                    </div>
                    {items.map((suggestion, i) => {
                      const globalIdx = suggestions.indexOf(suggestion)
                      return (
                        <button
                          key={`${type}-${suggestion.value}`}
                          id={`suggestion-${globalIdx}`}
                          role="option"
                          aria-selected={activeIndex === globalIdx}
                          onClick={() => handleSelect(suggestion)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F8F9FA] transition-colors ${
                            activeIndex === globalIdx ? 'bg-[#F8F9FA]' : ''
                          }`}
                        >
                          {iconForType(type)}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[#212529] truncate">{suggestion.label}</div>
                            {suggestion.type === 'property' && suggestion.city && (
                              <div className="text-xs text-[#ADB5BD]">{suggestion.neighborhood ? `${suggestion.neighborhood}, ` : ''}{suggestion.city}</div>
                            )}
                          </div>
                          {suggestion.type === 'property' && suggestion.listing_type && (
                            <span className="text-[10px] font-bold text-[#495057] bg-[#F8F9FA] px-2 py-0.5 rounded-full uppercase">
                              {suggestion.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
