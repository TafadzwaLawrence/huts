'use client'

import { useRouter, usePathname } from 'next/navigation'
import { SlidersHorizontal, X } from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  pending_offer: 'Pending Offer',
  under_contract: 'Under Contract',
  closed: 'Closed',
  cancelled: 'Cancelled',
  expired: 'Expired',
}

const TYPE_LABELS: Record<string, string> = {
  sale: 'Sale',
  rental: 'Rental',
  lease: 'Lease',
}

interface TransactionFiltersProps {
  currentStatus?: string
  currentType?: string
}

export function TransactionFilters({ currentStatus, currentType }: TransactionFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()

  const update = (key: string, value: string) => {
    const params = new URLSearchParams()
    if (key !== 'status' && currentStatus) params.set('status', currentStatus)
    if (key !== 'type'   && currentType)   params.set('type',   currentType)
    if (value) params.set(key, value)
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  const removeFilter = (key: string) => update(key, '')
  const clear = () => router.push(pathname)
  const hasFilters = currentStatus || currentType

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide shrink-0">
          <SlidersHorizontal size={13} />
          Filter
        </div>

        {/* Status */}
        <select
          value={currentStatus || ''}
          onChange={e => update('status', e.target.value)}
          className="py-2 pl-3 pr-7 text-sm border border-[#E9ECEF] rounded-lg bg-white text-[#212529] focus:outline-none focus:border-[#212529] transition-colors appearance-none cursor-pointer hover:border-[#212529]"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="pending_offer">Pending Offer</option>
          <option value="under_contract">Under Contract</option>
          <option value="closed">Closed</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
        </select>

        {/* Type */}
        <select
          value={currentType || ''}
          onChange={e => update('type', e.target.value)}
          className="py-2 pl-3 pr-7 text-sm border border-[#E9ECEF] rounded-lg bg-white text-[#212529] focus:outline-none focus:border-[#212529] transition-colors appearance-none cursor-pointer hover:border-[#212529]"
        >
          <option value="">All types</option>
          <option value="sale">Sale</option>
          <option value="rental">Rental</option>
          <option value="lease">Lease</option>
        </select>

        {hasFilters && (
          <button
            onClick={clear}
            className="flex items-center gap-1 text-xs text-[#9CA3AF] hover:text-[#495057] transition-colors"
          >
            <X size={12} />
            Clear all
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {currentStatus && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#212529] text-white text-xs font-medium rounded-full">
              {STATUS_LABELS[currentStatus] ?? currentStatus}
              <button onClick={() => removeFilter('status')} className="hover:opacity-70"><X size={11} /></button>
            </span>
          )}
          {currentType && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#212529] text-white text-xs font-medium rounded-full">
              {TYPE_LABELS[currentType] ?? currentType}
              <button onClick={() => removeFilter('type')} className="hover:opacity-70"><X size={11} /></button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}