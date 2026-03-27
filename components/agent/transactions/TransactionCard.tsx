'use client'

import Link from 'next/link'
import { MapPin, Users, DollarSign, Calendar, FileText, TrendingUp } from 'lucide-react'
import type { TransactionWithParticipants } from '@/types'
import { TransactionStatus } from './TransactionStatus'
import { formatSalePrice } from '@/lib/utils'
import { getProgressPercentage } from '@/lib/transaction-workflow'

type TransactionCardData = TransactionWithParticipants & {
  property?: { id: string; title: string; address: string }
  listing_price?: number
  commission_rate?: number
  commission_amount?: number
}

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

export function TransactionCard({ transaction: rawTransaction }: TransactionCardProps) {
  const transaction = rawTransaction as TransactionCardData
  const closingDateFormatted = formatDate(transaction.closing_date)
  const isSale = transaction.transaction_type === 'sale'
  const typeLabel = (transaction.transaction_type ?? 'unknown').replace('_', ' ')
  const progressPct = getProgressPercentage(transaction.status as any)
  const isTerminal = transaction.status === 'cancelled' || transaction.status === 'expired'
  const isClosed = transaction.status === 'closed'

  const priceDisplay = transaction.final_price
    ? isSale ? formatSalePrice(transaction.final_price) : `$${(transaction.final_price / 100).toLocaleString()}/mo`
    : transaction.listing_price
    ? isSale ? formatSalePrice(transaction.listing_price) : `$${(transaction.listing_price / 100).toLocaleString()}/mo`
    : null

  const commissionDisplay = transaction.commission_amount
    ? `$${transaction.commission_amount.toLocaleString()} commission`
    : transaction.commission_rate
    ? `${transaction.commission_rate}% commission`
    : null

  return (
    <div className="bg-white border border-[#E9ECEF] rounded-xl overflow-hidden hover:border-[#D1D5DB] hover:shadow-sm transition-all">
      {/* Workflow progress bar */}
      {!isTerminal && !isClosed && (
        <div className="h-1 bg-[#F3F4F6] w-full">
          <div
            className="h-full bg-[#212529] transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}
      {isClosed && <div className="h-1 bg-[#22C55E] w-full" />}
      {isTerminal && !isClosed && <div className="h-1 bg-[#EF4444] w-full" />}

      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            {/* Property title */}
            {transaction.property?.title && (
              <p className="text-[13px] font-bold text-[#212529] truncate mb-1">
                {transaction.property.title}
              </p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-[#9CA3AF]">
                TXN-{transaction.id.slice(0, 8).toUpperCase()}
              </span>
              <TransactionStatus status={transaction.status} />
              <span className="capitalize text-[11px] font-medium text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-md">
                {typeLabel}
              </span>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <Link
              href={`/agent/transactions/${transaction.id}`}
              className="px-3 py-1.5 text-xs font-medium bg-[#212529] text-white rounded-lg hover:bg-black transition-colors"
            >
              View Details
            </Link>
          </div>
        </div>

        {/* Property address */}
        {transaction.property?.address && (
          <p className="text-xs text-[#9CA3AF] flex items-center gap-1 mb-3">
            <MapPin size={11} />
            {transaction.property.address}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6B7280]">
          {priceDisplay && (
            <span className="flex items-center gap-1 font-medium text-[#212529]">
              <DollarSign size={12} />
              {priceDisplay}
            </span>
          )}
          {commissionDisplay && (
            <span className="flex items-center gap-1 text-[#22C55E] font-medium">
              <TrendingUp size={12} />
              {commissionDisplay}
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

        {/* Workflow steps mini-bar */}
        {!isTerminal && !isClosed && (
          <div className="flex items-center gap-1 mt-3">
            {['Active', 'Offer', 'Contract', 'Closed'].map((label, i) => {
              const stepPct = [0, 33, 66, 100][i]
              const done = progressPct > stepPct
              const current = !done && progressPct >= (i === 0 ? 0 : [0, 33, 66, 100][i - 1])
              return (
                <div key={label} className="flex-1">
                  <div className={`h-1 rounded-full transition-colors ${
                    done ? 'bg-[#212529]' : current ? 'bg-[#9CA3AF]' : 'bg-[#F3F4F6]'
                  }`} />
                  <p className={`text-[10px] mt-0.5 ${
                    done || current ? 'text-[#495057]' : 'text-[#D1D5DB]'
                  }`}>{label}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}