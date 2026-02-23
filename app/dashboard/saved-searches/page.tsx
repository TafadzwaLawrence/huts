'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  Search,
  Bell,
  BellOff,
  Trash2,
  ExternalLink,
  Loader2,
  Bookmark,
} from 'lucide-react'

type SavedSearch = {
  id: string
  name: string
  filters: Record<string, string>
  frequency: string
  created_at: string
}

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchSearches = useCallback(async () => {
    const res = await fetch('/api/saved-searches')
    const { data } = await res.json()
    setSearches(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSearches()
  }, [fetchSearches])

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/saved-searches?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setSearches(prev => prev.filter(s => s.id !== id))
      toast.success('Search deleted')
    } else {
      toast.error('Failed to delete')
    }
  }

  const getSearchUrl = (filters: Record<string, string>) => {
    const params = new URLSearchParams(filters)
    return `/search?${params.toString()}`
  }

  const getFilterSummary = (filters: Record<string, string>) => {
    const parts: string[] = []
    if (filters.type) parts.push(filters.type === 'sale' ? 'For Sale' : 'For Rent')
    if (filters.city) parts.push(filters.city)
    if (filters.minPrice || filters.maxPrice) {
      const min = filters.minPrice ? `$${(Number(filters.minPrice) / 100).toLocaleString()}` : 'Any'
      const max = filters.maxPrice ? `$${(Number(filters.maxPrice) / 100).toLocaleString()}` : 'Any'
      parts.push(`${min} - ${max}`)
    }
    if (filters.beds) parts.push(`${filters.beds}+ beds`)
    if (filters.baths) parts.push(`${filters.baths}+ baths`)
    if (filters.propertyType) parts.push(filters.propertyType)
    return parts.join(' · ') || 'All properties'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#ADB5BD]" size={32} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#212529]">Saved Searches</h1>
          <p className="text-sm text-[#ADB5BD] mt-1">
            Get notified when new properties match your criteria
          </p>
        </div>
        <Link
          href="/search"
          className="px-4 py-2.5 bg-[#212529] text-white text-sm font-medium rounded-xl hover:bg-black transition-colors"
        >
          New Search
        </Link>
      </div>

      {searches.length === 0 ? (
        <div className="text-center py-16 border border-[#E9ECEF] rounded-2xl">
          <div className="w-16 h-16 bg-[#F8F9FA] rounded-full flex items-center justify-center mx-auto mb-4">
            <Bookmark size={28} className="text-[#ADB5BD]" />
          </div>
          <h2 className="text-lg font-semibold text-[#212529] mb-2">No saved searches</h2>
          <p className="text-sm text-[#ADB5BD] mb-6 max-w-sm mx-auto">
            Save a search from the search page to get email alerts when new properties match.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#212529] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors"
          >
            <Search size={16} /> Start Searching
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {searches.map((search) => (
            <div
              key={search.id}
              className="flex items-center gap-4 p-5 border border-[#E9ECEF] rounded-xl hover:border-[#ADB5BD] transition-colors"
            >
              <div className="w-10 h-10 bg-[#F8F9FA] rounded-full flex items-center justify-center flex-shrink-0">
                <Search size={18} className="text-[#495057]" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-[#212529] mb-0.5">{search.name}</h3>
                <p className="text-xs text-[#ADB5BD] truncate">
                  {getFilterSummary(search.filters)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium ${
                  search.frequency === 'instant'
                    ? 'bg-[#212529] text-white'
                    : 'bg-[#F8F9FA] text-[#495057]'
                }`}>
                  {search.frequency === 'instant' ? <Bell size={10} /> : <BellOff size={10} />}
                  {search.frequency}
                </span>

                <Link
                  href={getSearchUrl(search.filters)}
                  className="p-2 hover:bg-[#F8F9FA] rounded-lg text-[#495057] hover:text-[#212529] transition-colors"
                  title="Run search"
                >
                  <ExternalLink size={16} />
                </Link>

                <button
                  onClick={() => handleDelete(search.id)}
                  className="p-2 hover:bg-red-50 rounded-lg text-[#ADB5BD] hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
