'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, MapPin, Home, Clock, ArrowRight } from 'lucide-react'

interface RecentSearch {
  query: string
  timestamp: number
}

export function NavbarSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('huts-recent-searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse recent searches')
      }
    }
  }, [])

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open search on "/" key
      if (e.key === '/' && !isOpen && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        setIsOpen(true)
      }
      // Close on Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        setQuery('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return

    // Save to recent searches
    const newRecent: RecentSearch = { query: searchQuery.trim(), timestamp: Date.now() }
    const updated = [newRecent, ...recentSearches.filter(r => r.query !== searchQuery.trim())].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('huts-recent-searches', JSON.stringify(updated))

    // Navigate to search page
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    setIsOpen(false)
    setQuery('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(query)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('huts-recent-searches')
  }

  const quickLinks = [
    { label: 'Apartments for Rent', href: '/search?type=rent&property_type=apartment', icon: Home },
    { label: 'Houses for Sale', href: '/search?type=sale&property_type=house', icon: Home },
    { label: 'Near Me', href: '/search?near_me=true', icon: MapPin },
  ]

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-3 w-full bg-[#F8F9FA] hover:bg-white border border-[#E9ECEF] hover:border-[#212529] rounded-full px-4 py-2 transition-all duration-200 hover:shadow-lg"
        >
          <Search size={16} className="text-[#ADB5BD] group-hover:text-[#212529] transition-colors shrink-0" />
          <span className="text-sm text-[#ADB5BD] group-hover:text-[#495057] transition-colors truncate">
            Search properties...
          </span>
          <kbd className="hidden group-hover:inline-flex ml-auto text-[10px] text-[#ADB5BD] bg-white px-1.5 py-0.5 rounded border border-[#E9ECEF] font-mono shrink-0">/</kbd>
        </button>
      ) : (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
          
          {/* Search Modal */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] max-w-[90vw] z-50">
            <div className="bg-white rounded-2xl shadow-2xl border border-[#E9ECEF] overflow-hidden">
              {/* Search Input */}
              <form onSubmit={handleSubmit} className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ADB5BD]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by location, property type, or keywords..."
                  className="w-full pl-12 pr-12 py-4 text-[#212529] placeholder-[#ADB5BD] focus:outline-none text-base"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-14 top-1/2 -translate-y-1/2 p-1 hover:bg-[#F8F9FA] rounded-full transition-colors"
                  >
                    <X size={16} className="text-[#ADB5BD]" />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!query.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[#212529] text-white rounded-lg hover:bg-[#495057] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ArrowRight size={16} />
                </button>
              </form>

              <div className="border-t border-[#E9ECEF]">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <span className="text-xs font-medium text-[#ADB5BD] uppercase tracking-wider">Recent</span>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-[#ADB5BD] hover:text-[#495057] transition-colors"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((recent, i) => (
                        <button
                          key={i}
                          onClick={() => handleSearch(recent.query)}
                          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-[#F8F9FA] transition-colors text-left"
                        >
                          <Clock size={14} className="text-[#ADB5BD] shrink-0" />
                          <span className="text-sm text-[#495057] truncate">{recent.query}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Links */}
                <div className="p-3 border-t border-[#E9ECEF]">
                  <span className="text-xs font-medium text-[#ADB5BD] uppercase tracking-wider px-1 mb-2 block">Quick Links</span>
                  <div className="space-y-1">
                    {quickLinks.map((link, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          router.push(link.href)
                          setIsOpen(false)
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-[#F8F9FA] transition-colors text-left"
                      >
                        <link.icon size={14} className="text-[#495057] shrink-0" />
                        <span className="text-sm text-[#495057]">{link.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Keyboard Hint */}
                <div className="px-4 py-3 bg-[#F8F9FA] flex items-center justify-between text-xs text-[#ADB5BD]">
                  <span>Press <kbd className="px-1.5 py-0.5 bg-white rounded border border-[#E9ECEF] font-mono">Enter</kbd> to search</span>
                  <span>Press <kbd className="px-1.5 py-0.5 bg-white rounded border border-[#E9ECEF] font-mono">Esc</kbd> to close</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
