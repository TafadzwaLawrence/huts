'use client'

import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import type { TransactionStatus, TransactionType } from '@/types'

interface TransactionFiltersProps {
  onFiltersChange?: (filters: { status?: TransactionStatus; type?: TransactionType }) => void
}

export function TransactionFilters({ onFiltersChange }: TransactionFiltersProps) {
  const [status, setStatus] = useState<TransactionStatus | ''>('')
  const [type, setType] = useState<TransactionType | ''>('')

  const handleStatusChange = (newStatus: TransactionStatus | '') => {
    setStatus(newStatus)
    onFiltersChange?.({
      status: newStatus || undefined,
      type: type || undefined
    })
  }

  const handleTypeChange = (newType: TransactionType | '') => {
    setType(newType)
    onFiltersChange?.({
      status: status || undefined,
      type: newType || undefined
    })
  }

  const clearFilters = () => {
    setStatus('')
    setType('')
    onFiltersChange?.({})
  }

  const hasActiveFilters = status || type

  return (
    <div className="bg-white border border-light-gray rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-dark-gray" />
          <span className="font-medium text-charcoal">Filters</span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-dark-gray hover:text-charcoal"
          >
            <X size={14} />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as TransactionStatus | '')}
            className="w-full px-3 py-2 border border-light-gray rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending_offer">Pending Offer</option>
            <option value="under_contract">Under Contract</option>
            <option value="closed">Closed</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value as TransactionType | '')}
            className="w-full px-3 py-2 border border-light-gray rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="sale">Sale</option>
            <option value="rental">Rental</option>
            <option value="lease">Lease</option>
          </select>
        </div>
      </div>
    </div>
  )
}