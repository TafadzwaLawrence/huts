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

  return (
    <div className="bg-white border border-light-gray rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-charcoal">
              Transaction {transaction.id.slice(0, 8)}
            </h3>
            <TransactionStatus status={transaction.status} />
          </div>

          <div className="flex items-center gap-4 text-sm text-dark-gray mb-3">
            <div className="capitalize px-2 py-1 bg-light-gray rounded text-xs font-medium">
              {transaction.transaction_type}
            </div>
            {transaction.final_price && (
              <div className="flex items-center">
                <DollarSign size={14} className="mr-1" />
                {isSale ? formatSalePrice(transaction.final_price) : `$${transaction.final_price.toLocaleString()}`}
              </div>
            )}
            {closingDateFormatted && (
              <div className="flex items-center">
                <Calendar size={14} className="mr-1" />
                {closingDateFormatted}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-light-gray pt-3">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center text-dark-gray">
            <Users size={14} className="mr-1" />
            {transaction.participants?.length || 0} participants
          </div>

          {transaction.documents && transaction.documents.length > 0 && (
            <div className="flex items-center text-dark-gray">
              <FileText size={14} className="mr-1" />
              {transaction.documents.length} documents
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm bg-black text-white rounded hover:bg-charcoal transition-colors">
            View Details
          </button>
          <button className="px-3 py-1 text-sm border border-dark-gray text-charcoal rounded hover:bg-light-gray transition-colors">
            Message
          </button>
        </div>
      </div>
    </div>
  )
}