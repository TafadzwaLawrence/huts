'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react'
import { ICON_SIZES } from '@/lib/constants'
import { BottomSheet } from '@/components/ui/BottomSheet'

interface FilterBarProps {
  listingType: 'all' | 'rent' | 'sale'
  onListingTypeChange: (type: 'all' | 'rent' | 'sale') => void
  filters: {
    minPrice: string
    maxPrice: string
    beds: string
    baths: string
    propertyType: string
    studentHousingOnly: boolean
  }
  onFilterChange: (key: string, value: string | boolean) => void
  onClearFilters: () => void
  resultCount: number
  sort: string
  onSortChange: (sort: string) => void
}

function Dropdown({ label, active, children }: { label: string; active?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
          active
            ? 'bg-[#212529] text-white border-[#212529]'
            : 'bg-white text-[#212529] border-[#E9ECEF] hover:border-[#212529]'
        }`}
      >
        {label}
        <ChevronDown size={ICON_SIZES.sm} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl border border-[#E9ECEF] shadow-xl p-4 z-50 min-w-[240px]">
          {children}
        </div>
      )}
    </div>
  )
}

export function FilterBar({
  listingType,
  onListingTypeChange,
  filters,
  onFilterChange,
  onClearFilters,
  resultCount,
  sort,
  onSortChange,
}: FilterBarProps) {
  const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.beds || filters.baths || filters.propertyType !== 'all' || filters.studentHousingOnly
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  return (
    <>
      {/* Desktop filters */}
      <div className="hidden md:flex items-center gap-2 flex-wrap">
      {/* Listing Type Toggle */}
      <div className="inline-flex items-center bg-[#F8F9FA] rounded-lg p-0.5 border border-[#E9ECEF]">
        {(['all', 'rent', 'sale'] as const).map((type) => (
          <button
            key={type}
            onClick={() => onListingTypeChange(type)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              listingType === type
                ? 'bg-[#212529] text-white shadow-sm'
                : 'text-[#495057] hover:text-[#212529]'
            }`}
          >
            {type === 'all' ? 'All' : type === 'rent' ? 'Rent' : 'Buy'}
          </button>
        ))}
      </div>

      {/* Price */}
      <Dropdown label="Price" active={!!(filters.minPrice || filters.maxPrice)}>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-[#495057] block mb-1">Min Price</label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => onFilterChange('minPrice', e.target.value)}
              placeholder="No min"
              className="w-full px-3 py-2 text-sm border border-[#E9ECEF] rounded-lg focus:border-[#212529] outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#495057] block mb-1">Max Price</label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => onFilterChange('maxPrice', e.target.value)}
              placeholder="No max"
              className="w-full px-3 py-2 text-sm border border-[#E9ECEF] rounded-lg focus:border-[#212529] outline-none"
            />
          </div>
        </div>
      </Dropdown>

      {/* Beds & Baths */}
      <Dropdown label="Beds / Baths" active={!!(filters.beds || filters.baths)}>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#495057] block mb-2">Bedrooms</label>
            <div className="flex gap-1">
              {['', '1', '2', '3', '4', '5'].map((val) => (
                <button
                  key={val}
                  onClick={() => onFilterChange('beds', val)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                    filters.beds === val
                      ? 'bg-[#212529] text-white border-[#212529]'
                      : 'text-[#495057] border-[#E9ECEF] hover:border-[#212529]'
                  }`}
                >
                  {val || 'Any'}
                  {val && '+'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[#495057] block mb-2">Bathrooms</label>
            <div className="flex gap-1">
              {['', '1', '2', '3', '4'].map((val) => (
                <button
                  key={val}
                  onClick={() => onFilterChange('baths', val)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                    filters.baths === val
                      ? 'bg-[#212529] text-white border-[#212529]'
                      : 'text-[#495057] border-[#E9ECEF] hover:border-[#212529]'
                  }`}
                >
                  {val || 'Any'}
                  {val && '+'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Dropdown>

      {/* Home Type */}
      <Dropdown label="Home Type" active={filters.propertyType !== 'all'}>
        <div className="space-y-1.5">
          {[
            { value: 'all', label: 'Any' },
            { value: 'apartment', label: 'Apartment' },
            { value: 'house', label: 'House' },
            { value: 'cottage', label: 'Cottage' },
            { value: 'room', label: 'Room' },
            { value: 'student', label: 'Student Housing' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onFilterChange('propertyType', opt.value)}
              className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-all ${
                filters.propertyType === opt.value
                  ? 'bg-[#212529] text-white'
                  : 'text-[#495057] hover:bg-[#F8F9FA]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Dropdown>

      {/* Sort */}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#495057] hover:text-[#212529] transition-colors"
        >
          <X size={12} />
          Clear
        </button>
      )}
    </div>

      {/* Mobile compact filter bar */}
      <div className="flex md:hidden items-center gap-2">
        {/* Listing type toggle */}
        <div className="inline-flex items-center bg-[#F8F9FA] rounded-full p-0.5 border border-[#E9ECEF]">
          {(['all', 'rent', 'sale'] as const).map((type) => (
            <button
              key={type}
              onClick={() => onListingTypeChange(type)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                listingType === type
                  ? 'bg-[#212529] text-white shadow-sm'
                  : 'text-[#495057]'
              }`}
            >
              {type === 'all' ? 'All' : type === 'rent' ? 'Rent' : 'Buy'}
            </button>
          ))}
        </div>

        {/* Filters button */}
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-full border transition-all ${
            hasActiveFilters
              ? 'bg-[#212529] text-white border-[#212529]'
              : 'bg-white text-[#212529] border-[#E9ECEF]'
          }`}
        >
          <SlidersHorizontal size={14} />
          Filters
          {hasActiveFilters && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
        </button>

        <div className="ml-auto text-xs text-[#495057]">
          <span className="font-semibold text-[#212529]">{resultCount.toLocaleString()}</span>
        </div>
      </div>

      {/* Mobile filter bottom sheet */}
      <BottomSheet
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        title="Filters"
      >
        <div className="space-y-6">
          {/* Price */}
          <div>
            <label className="text-sm font-semibold text-[#212529] block mb-2">Price Range</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => onFilterChange('minPrice', e.target.value)}
                placeholder="Min"
                className="w-full px-3 py-2.5 text-sm border border-[#E9ECEF] rounded-lg focus:border-[#212529] outline-none"
              />
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                placeholder="Max"
                className="w-full px-3 py-2.5 text-sm border border-[#E9ECEF] rounded-lg focus:border-[#212529] outline-none"
              />
            </div>
          </div>

          {/* Beds */}
          <div>
            <label className="text-sm font-semibold text-[#212529] block mb-2">Bedrooms</label>
            <div className="flex gap-2 flex-wrap">
              {['', '1', '2', '3', '4', '5'].map((val) => (
                <button
                  key={val}
                  onClick={() => onFilterChange('beds', val)}
                  className={`px-4 py-2 text-sm rounded-lg border transition-all ${
                    filters.beds === val
                      ? 'bg-[#212529] text-white border-[#212529]'
                      : 'text-[#495057] border-[#E9ECEF]'
                  }`}
                >
                  {val || 'Any'}{val && '+'}
                </button>
              ))}
            </div>
          </div>

          {/* Baths */}
          <div>
            <label className="text-sm font-semibold text-[#212529] block mb-2">Bathrooms</label>
            <div className="flex gap-2 flex-wrap">
              {['', '1', '2', '3', '4'].map((val) => (
                <button
                  key={val}
                  onClick={() => onFilterChange('baths', val)}
                  className={`px-4 py-2 text-sm rounded-lg border transition-all ${
                    filters.baths === val
                      ? 'bg-[#212529] text-white border-[#212529]'
                      : 'text-[#495057] border-[#E9ECEF]'
                  }`}
                >
                  {val || 'Any'}{val && '+'}
                </button>
              ))}
            </div>
          </div>

          {/* Home Type */}
          <div>
            <label className="text-sm font-semibold text-[#212529] block mb-2">Home Type</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'all', label: 'Any' },
                { value: 'apartment', label: 'Apartment' },
                { value: 'house', label: 'House' },
                { value: 'cottage', label: 'Cottage' },
                { value: 'room', label: 'Room' },
                { value: 'student', label: 'Student' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onFilterChange('propertyType', opt.value)}
                  className={`px-3 py-2.5 text-sm rounded-lg border transition-all ${
                    filters.propertyType === opt.value
                      ? 'bg-[#212529] text-white border-[#212529]'
                      : 'text-[#495057] border-[#E9ECEF]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="text-sm font-semibold text-[#212529] block mb-2">Sort by</label>
            <div className="space-y-1">
              {[
                { value: 'newest', label: 'Newest' },
                { value: 'price_asc', label: 'Price: Low to High' },
                { value: 'price_desc', label: 'Price: High to Low' },
                { value: 'beds_desc', label: 'Bedrooms' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onSortChange(opt.value)}
                  className={`block w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all ${
                    sort === opt.value
                      ? 'bg-[#212529] text-white'
                      : 'text-[#495057] hover:bg-[#F8F9FA]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-[#E9ECEF]">
            <button
              onClick={() => { onClearFilters(); setMobileFiltersOpen(false) }}
              className="flex-1 py-3 text-sm font-medium text-[#495057] border border-[#E9ECEF] rounded-lg"
            >
              Clear All
            </button>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="flex-1 py-3 text-sm font-semibold text-white bg-[#212529] rounded-lg"
            >
              Show {resultCount.toLocaleString()} Results
            </button>
          </div>
        </div>
      </BottomSheet>
    </>
  )
}
