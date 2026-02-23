'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { X, Plus, Bed, Bath, Maximize, MapPin, Check, Minus, Search, Loader2 } from 'lucide-react'
import { formatPrice, formatSalePrice } from '@/lib/utils'
import { isRentalProperty, isSaleProperty } from '@/types'

type CompareProperty = {
  id: string
  title: string
  slug: string
  price: number | null
  sale_price: number | null
  listing_type: string
  beds: number
  baths: number
  sqft: number | null
  city: string
  neighborhood: string | null
  property_type: string | null
  amenities: string[] | null
  year_built: number | null
  parking_spaces: number | null
  deposit: number | null
  available_from: string | null
  description: string | null
  property_images: Array<{ url: string; is_primary: boolean }>
}

const COMPARE_ROWS = [
  { key: 'price', label: 'Price' },
  { key: 'property_type', label: 'Type' },
  { key: 'beds', label: 'Bedrooms' },
  { key: 'baths', label: 'Bathrooms' },
  { key: 'sqft', label: 'Sq Ft' },
  { key: 'city', label: 'City' },
  { key: 'neighborhood', label: 'Neighborhood' },
  { key: 'year_built', label: 'Year Built' },
  { key: 'parking_spaces', label: 'Parking' },
  { key: 'deposit', label: 'Deposit' },
  { key: 'amenities', label: 'Amenities' },
]

export default function ComparePage() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<CompareProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<CompareProperty[]>([])
  const [searching, setSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const supabase = createClient()

  const fetchProperties = useCallback(async (ids: string[]) => {
    if (ids.length === 0) {
      setProperties([])
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('properties')
      .select(`
        id, title, slug, price, sale_price, listing_type, beds, baths, sqft,
        city, neighborhood, property_type, amenities, year_built, parking_spaces,
        deposit, available_from, description,
        property_images(url, is_primary)
      `)
      .in('id', ids)

    if (data) setProperties(data as unknown as CompareProperty[])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    const ids = searchParams.get('ids')?.split(',').filter(Boolean) || []
    fetchProperties(ids)
  }, [searchParams, fetchProperties])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)

    const { data } = await supabase
      .from('properties')
      .select(`
        id, title, slug, price, sale_price, listing_type, beds, baths, sqft,
        city, neighborhood, property_type, amenities, year_built, parking_spaces,
        deposit, available_from, description,
        property_images(url, is_primary)
      `)
      .eq('status', 'active')
      .ilike('title', `%${searchQuery}%`)
      .limit(10)

    setSearchResults((data as unknown as CompareProperty[]) || [])
    setSearching(false)
  }

  const addProperty = (prop: CompareProperty) => {
    if (properties.length >= 4) return
    if (properties.find(p => p.id === prop.id)) return
    setProperties(prev => [...prev, prop])
    setShowSearch(false)
    setSearchQuery('')
    setSearchResults([])
    // Update URL
    const ids = [...properties.map(p => p.id), prop.id].join(',')
    window.history.replaceState({}, '', `/compare?ids=${ids}`)
  }

  const removeProperty = (id: string) => {
    const updated = properties.filter(p => p.id !== id)
    setProperties(updated)
    const ids = updated.map(p => p.id).join(',')
    window.history.replaceState({}, '', ids ? `/compare?ids=${ids}` : '/compare')
  }

  const getPrimaryImage = (prop: CompareProperty) => {
    const primary = prop.property_images?.find(i => i.is_primary) || prop.property_images?.[0]
    return primary?.url
  }

  const getCellValue = (prop: CompareProperty, key: string) => {
    switch (key) {
      case 'price':
        return prop.listing_type === 'sale'
          ? formatSalePrice(prop.sale_price ?? 0)
          : `${formatPrice(prop.price ?? 0)}/mo`
      case 'sqft':
        return prop.sqft ? `${prop.sqft.toLocaleString()} sqft` : '—'
      case 'year_built':
        return prop.year_built || '—'
      case 'parking_spaces':
        return prop.parking_spaces ?? '—'
      case 'deposit':
        return prop.deposit ? formatPrice(prop.deposit) : '—'
      case 'amenities':
        return (prop.amenities || []).slice(0, 5).join(', ') || '—'
      default:
        return (prop as any)[key] || '—'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-[#ADB5BD]" size={32} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#F8F9FA] border-b border-[#E9ECEF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <h1 className="text-2xl md:text-4xl font-bold text-[#212529] mb-2">
            Compare Properties
          </h1>
          <p className="text-[#495057]">
            Compare up to 4 properties side by side
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Property columns header */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Property cards row */}
            <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `200px repeat(${Math.max(properties.length, 1)}, 1fr) ${properties.length < 4 ? '1fr' : ''}` }}>
              {/* Label column header */}
              <div />

              {/* Property cards */}
              {properties.map((prop) => (
                <div key={prop.id} className="relative border border-[#E9ECEF] rounded-xl overflow-hidden group">
                  <button
                    onClick={() => removeProperty(prop.id)}
                    className="absolute top-2 right-2 z-10 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                  <div className="h-32 bg-[#E9ECEF] relative">
                    {getPrimaryImage(prop) && (
                      <Image
                        src={getPrimaryImage(prop)!}
                        alt={prop.title}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <Link href={`/property/${prop.slug}`} className="text-sm font-semibold text-[#212529] hover:underline line-clamp-1">
                      {prop.title}
                    </Link>
                    <p className="text-xs text-[#ADB5BD] flex items-center gap-1 mt-0.5">
                      <MapPin size={10} /> {prop.neighborhood || prop.city}
                    </p>
                  </div>
                </div>
              ))}

              {/* Add property button */}
              {properties.length < 4 && (
                <button
                  onClick={() => setShowSearch(true)}
                  className="border-2 border-dashed border-[#E9ECEF] rounded-xl flex flex-col items-center justify-center min-h-[200px] hover:border-[#ADB5BD] transition-colors"
                >
                  <Plus size={24} className="text-[#ADB5BD] mb-2" />
                  <span className="text-sm text-[#ADB5BD] font-medium">Add Property</span>
                </button>
              )}
            </div>

            {/* Comparison table */}
            {properties.length > 0 && (
              <div className="border border-[#E9ECEF] rounded-xl overflow-hidden">
                {COMPARE_ROWS.map((row, i) => (
                  <div
                    key={row.key}
                    className={`grid gap-4 ${i % 2 === 0 ? 'bg-[#F8F9FA]' : 'bg-white'}`}
                    style={{ gridTemplateColumns: `200px repeat(${properties.length}, 1fr)` }}
                  >
                    <div className="px-4 py-3 text-sm font-medium text-[#495057]">
                      {row.label}
                    </div>
                    {properties.map((prop) => (
                      <div key={prop.id} className="px-4 py-3 text-sm text-[#212529]">
                        {row.key === 'price' ? (
                          <span className="font-bold">{getCellValue(prop, row.key)}</span>
                        ) : (
                          getCellValue(prop, row.key)
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {properties.length === 0 && !showSearch && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-[#F8F9FA] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Maximize size={28} className="text-[#ADB5BD]" />
                </div>
                <h2 className="text-lg font-semibold text-[#212529] mb-2">No properties to compare</h2>
                <p className="text-sm text-[#ADB5BD] mb-6">Add properties to see them side by side</p>
                <button
                  onClick={() => setShowSearch(true)}
                  className="px-6 py-3 bg-[#212529] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors"
                >
                  Add a property
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search modal */}
        {showSearch && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
              <div className="flex items-center justify-between p-4 border-b border-[#E9ECEF]">
                <h3 className="font-semibold text-[#212529]">Add Property</h3>
                <button onClick={() => { setShowSearch(false); setSearchResults([]) }} className="p-1.5 hover:bg-[#F8F9FA] rounded-lg">
                  <X size={18} />
                </button>
              </div>
              <div className="p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ADB5BD]" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search by property name..."
                    className="w-full pl-9 pr-4 py-3 text-sm border border-[#E9ECEF] rounded-xl focus:outline-none focus:border-[#212529]"
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={searching || !searchQuery.trim()}
                  className="w-full py-2.5 bg-[#212529] text-white rounded-xl text-sm font-medium hover:bg-black disabled:opacity-50 mb-4"
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>

                {/* Results */}
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {searchResults.map((result) => {
                    const alreadyAdded = properties.find(p => p.id === result.id)
                    return (
                      <button
                        key={result.id}
                        onClick={() => !alreadyAdded && addProperty(result)}
                        disabled={!!alreadyAdded}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          alreadyAdded ? 'opacity-50' : 'hover:bg-[#F8F9FA]'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#E9ECEF] flex-shrink-0">
                          {getPrimaryImage(result) && (
                            <Image src={getPrimaryImage(result)!} alt="" width={48} height={48} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#212529] truncate">{result.title}</p>
                          <p className="text-xs text-[#ADB5BD]">{result.neighborhood || result.city}</p>
                        </div>
                        {alreadyAdded ? (
                          <Check size={16} className="text-green-500" />
                        ) : (
                          <Plus size={16} className="text-[#ADB5BD]" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
