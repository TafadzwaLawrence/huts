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

function Dropdown({ label, active, children, onApply }: { label: string; active?: boolean; children: React.ReactNode; onApply?: () => void }) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  // Calculate fixed position from button
  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 8, left: rect.left })
    }
  }, [open])

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        buttonRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  return (
    <>
      <button
        ref={buttonRef}
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
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-[999]" onClick={() => setOpen(false)} />

          {/* Panel - fixed position to escape overflow clipping */}
          <div
            ref={panelRef}
            className="fixed bg-white rounded-xl border border-[#E9ECEF] shadow-2xl z-[1000] min-w-[280px]"
            style={{ top: pos.top, left: pos.left }}
          >
            <div className="p-4">
              {children}
            </div>
            <div className="px-4 pb-4 pt-0">
              <button
                onClick={() => { onApply?.(); setOpen(false) }}
                className="w-full py-2.5 bg-[#212529] text-white text-sm font-semibold rounded-lg hover:bg-black transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </>
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
            <label className="text-xs font-medium text-[#495057] block mb-1.5">Minimum</label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => onFilterChange('minPrice', e.target.value)}
              placeholder="No min"
              className="w-full px-3 py-2 text-sm border border-[#E9ECEF] rounded-lg focus:border-[#212529] focus:ring-1 focus:ring-[#212529] outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#495057] block mb-1.5">Maximum</label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => onFilterChange('maxPrice', e.target.value)}
              placeholder="No max"
              className="w-full px-3 py-2 text-sm border border-[#E9ECEF] rounded-lg focus:border-[#212529] focus:ring-1 focus:ring-[#212529] outline-none transition-all"
            />
          </div>
          
          {/* Quick select buttons */}
          <div className="pt-2 border-t border-[#E9ECEF]">
            <p className="text-xs text-[#ADB5BD] mb-2">Quick select</p>
            <div className="grid grid-cols-2 gap-2">
              {listingType === 'rent' ? (
                <>
                  <button
                    onClick={() => { onFilterChange('minPrice', ''); onFilterChange('maxPrice', '50000') }}
                    className="px-2.5 py-1.5 text-xs text-[#495057] bg-[#F8F9FA] rounded-md hover:bg-[#E9ECEF] transition-colors"
                  >
                    Up to $500
                  </button>
                  <button
                    onClick={() => { onFilterChange('minPrice', ''); onFilterChange('maxPrice', '100000') }}
                    className="px-2.5 py-1.5 text-xs text-[#495057] bg-[#F8F9FA] rounded-md hover:bg-[#E9ECEF] transition-colors"
                  >
                    Up to $1000
                  </button>
                  <button
                    onClick={() => { onFilterChange('minPrice', '100000'); onFilterChange('maxPrice', '200000') }}
                    className="px-2.5 py-1.5 text-xs text-[#495057] bg-[#F8F9FA] rounded-md hover:bg-[#E9ECEF] transition-colors"
                  >
                    $1000-$2000
                  </button>
                  <button
                    onClick={() => { onFilterChange('minPrice', '200000'); onFilterChange('maxPrice', '') }}
                    className="px-2.5 py-1.5 text-xs text-[#495057] bg-[#F8F9FA] rounded-md hover:bg-[#E9ECEF] transition-colors"
                  >
                    $2000+
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { onFilterChange('minPrice', ''); onFilterChange('maxPrice', '10000000') }}
                    className="px-2.5 py-1.5 text-xs text-[#495057] bg-[#F8F9FA] rounded-md hover:bg-[#E9ECEF] transition-colors"
                  >
                    Up to $100K
                  </button>
                  <button
                    onClick={() => { onFilterChange('minPrice', ''); onFilterChange('maxPrice', '25000000') }}
                    className="px-2.5 py-1.5 text-xs text-[#495057] bg-[#F8F9FA] rounded-md hover:bg-[#E9ECEF] transition-colors"
                  >
                    Up to $250K
                  </button>
                  <button
                    onClick={() => { onFilterChange('minPrice', '25000000'); onFilterChange('maxPrice', '50000000') }}
                    className="px-2.5 py-1.5 text-xs text-[#495057] bg-[#F8F9FA] rounded-md hover:bg-[#E9ECEF] transition-colors"
                  >
                    $250K-$500K
                  </button>
                  <button
                    onClick={() => { onFilterChange('minPrice', '50000000'); onFilterChange('maxPrice', '') }}
                    className="px-2.5 py-1.5 text-xs text-[#495057] bg-[#F8F9FA] rounded-md hover:bg-[#E9ECEF] transition-colors"
                  >
                    $500K+
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </Dropdown>

      {/* Beds & Baths */}
      <Dropdown label="Beds / Baths" active={!!(filters.beds || filters.baths)}>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#495057] block mb-2">Bedrooms</label>
            <div className="grid grid-cols-3 gap-2">
              {['', '1', '2', '3', '4', '5+'].map((val) => {
                const filterVal = val === '5+' ? '5' : val
                return (
                  <button
                    key={val}
                    onClick={() => onFilterChange('beds', filterVal)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                      filters.beds === filterVal
                        ? 'bg-[#212529] text-white border-[#212529]'
                        : 'text-[#495057] border-[#E9ECEF] hover:border-[#212529] hover:bg-[#F8F9FA]'
                    }`}
                  >
                    {val || 'Any'}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[#495057] block mb-2">Bathrooms</label>
            <div className="grid grid-cols-3 gap-2">
              {['', '1', '2', '3', '4+'].map((val) => {
                const filterVal = val === '4+' ? '4' : val
                return (
                  <button
                    key={val}
                    onClick={() => onFilterChange('baths', filterVal)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                      filters.baths === filterVal
                        ? 'bg-[#212529] text-white border-[#212529]'
                        : 'text-[#495057] border-[#E9ECEF] hover:border-[#212529] hover:bg-[#F8F9FA]'
                    }`}
                  >
                    {val || 'Any'}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </Dropdown>

      {/* Home Type */}
      <Dropdown label="Home Type" active={filters.propertyType !== 'all'}>
        <div className="space-y-1">
          {[
            { value: 'all', label: 'All homes' },
            { value: 'house', label: 'Houses' },
            { value: 'apartment', label: 'Apartments' },
            { value: 'cottage', label: 'Cottages' },
            { value: 'room', label: 'Rooms' },
            { value: 'student', label: 'Student housing' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onFilterChange('propertyType', opt.value)}
              className={`flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-lg transition-all ${
                filters.propertyType === opt.value
                  ? 'bg-[#212529] text-white font-medium'
                  : 'text-[#495057] hover:bg-[#F8F9FA]'
              }`}
            >
              <span>{opt.label}</span>
              {filters.propertyType === opt.value && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.3337 4L6.00033 11.3333L2.66699 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
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
