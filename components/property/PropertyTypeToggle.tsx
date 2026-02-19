'use client'

import { cn } from '@/lib/utils'

interface PropertyTypeToggleProps {
  value: 'all' | 'rent' | 'sale'
  onChange: (value: 'all' | 'rent' | 'sale') => void
  className?: string
}

export function PropertyTypeToggle({ value, onChange, className }: PropertyTypeToggleProps) {
  return (
    <div className={cn('inline-flex border-2 border-[#E9ECEF] rounded-lg overflow-hidden', className)}>
      <button
        onClick={() => onChange('all')}
        className={cn(
          'px-4 py-2 text-sm font-medium transition-all min-w-[80px]',
          value === 'all'
            ? 'bg-[#212529] text-white'
            : 'bg-white text-[#495057] hover:bg-[#F8F9FA]'
        )}
      >
        All
      </button>
      <button
        onClick={() => onChange('rent')}
        className={cn(
          'px-4 py-2 text-sm font-medium transition-all border-x-2 border-[#E9ECEF] min-w-[80px]',
          value === 'rent'
            ? 'bg-[#212529] text-white'
            : 'bg-white text-[#495057] hover:bg-[#F8F9FA]'
        )}
      >
        For Rent
      </button>
      <button
        onClick={() => onChange('sale')}
        className={cn(
          'px-4 py-2 text-sm font-medium transition-all min-w-[80px]',
          value === 'sale'
            ? 'bg-[#212529] text-white'
            : 'bg-white text-[#495057] hover:bg-[#F8F9FA]'
        )}
      >
        For Sale
      </button>
    </div>
  )
}
