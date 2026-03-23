'use client'

import { useRouter, usePathname } from 'next/navigation'
import { SlidersHorizontal, X } from 'lucide-react'

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

  const clear = () => router.push(pathname)
  const hasFilters = currentStatus || currentType

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide shrink-0">
        <SlidersHorizontal size={13} />
        Filters
      </div>

      {/* Status */}
      <select
        value={currentStatus || ''}
        onChange={e => update('status', e.target.value)}
        className="py-1.5 pl-3 pr-7 text-sm border border-[#E9ECEF] rounded-lg bg-white text-[#212529] focus:outline-none focus:border-[#111827] transition-colors appearance-none cursor-pointer"
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
        className="py-1.5 pl-3 pr-7 text-sm border border-[#E9ECEF] rounded-lg bg-white text-[#212529] focus:outline-none focus:border-[#111827] transition-colors appearance-none cursor-pointer"
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
          Clear
        </button>
      )}
    </div>
  )
}