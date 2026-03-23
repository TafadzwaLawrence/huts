'use client'

import { MapPin, Users, DollarSign, Calendar, FileText } from 'lucide-react'
import type { TransactionWithParticipants } from '@/types'
import { TransactionStatus } from './TransactionStatus'
import { formatSalePrice } from '@/lib/utils'

interface TransactionCardProps {
  transaction: TransactionWithParticipants
}

// Helper to format date without external library
function formatDate(dateString: string | null | undefined): string | null {
  if (!dateString) return null
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return null
  }
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const closingDateFormatted = formatDate(transaction.closing_date)
  const isSale = transaction.transaction_type === 'sale'
  const typeLabel = (transaction.transaction_type ?? 'unknown').replace('_', ' ')

  return (
    <div className="bg-white border border-[#E9ECEF] rounded-xl p-5 hover:border-[#D1D5DB] hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap mb-2">
            <h3 className="text-sm font-semibold text-[#111827]">
              TXN-{transaction.id.slice(0, 8).toUpperCase()}
            </h3>
            <TransactionStatus status={transaction.status} />
            <span className="capitalize text-[11px] font-medium text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-md">
              {typeLabel}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6B7280]">
            {transaction.final_price && (
              <span className="flex items-center gap-1">
                <DollarSign size={12} />
                {isSale ? formatSalePrice(transaction.final_price) : `$${transaction.final_price.toLocaleString()}`}
              </span>
            )}
            {closingDateFormatted && (
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                Closing {closingDateFormatted}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users size={12} />
              {transaction.participants?.length || 0} participant{(transaction.participants?.length || 0) !== 1 ? 's' : ''}
            </span>
            {transaction.documents && transaction.documents.length > 0 && (
              <span className="flex items-center gap-1">
                <FileText size={12} />
                {transaction.documents.length} doc{transaction.documents.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <button className="px-3 py-1.5 text-xs font-medium bg-[#111827] text-white rounded-lg hover:bg-black transition-colors">
            View Details
          </button>
          <button className="px-3 py-1.5 text-xs font-medium border border-[#E9ECEF] text-[#495057] rounded-lg hover:border-[#111827] hover:text-[#111827] transition-colors">
            Message
          </button>
        </div>
      </div>
    </div>
  )
}