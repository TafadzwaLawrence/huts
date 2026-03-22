'use client'

import { format } from 'date-fns'
import { MapPin, Users, DollarSign, Calendar, FileText } from 'lucide-react'
import type { TransactionWithParticipants } from '@/types'
import { TransactionStatus } from './TransactionStatus'
import { formatPrice, formatSalePrice } from '@/lib/utils'

interface TransactionCardProps {
  transaction: TransactionWithParticipants
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const property = transaction.property
  const primaryImage = property?.property_images?.find(img => img.is_primary) || property?.property_images?.[0]

  return (
    <div className="bg-white border border-light-gray rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-charcoal">
              {property?.title || 'Untitled Property'}
            </h3>
            <TransactionStatus status={transaction.status} />
          </div>

          {property?.address && (
            <div className="flex items-center text-dark-gray text-sm mb-2">
              <MapPin size={14} className="mr-1" />
              {property.address}
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-dark-gray">
            <span className="capitalize">{transaction.transaction_type}</span>
            {transaction.final_price && (
              <div className="flex items-center">
                <DollarSign size={14} className="mr-1" />
                {transaction.listing_type === 'sale'
                  ? formatSalePrice(transaction.final_price)
                  : formatPrice(transaction.final_price)
                }
              </div>
            )}
            {transaction.closing_date && (
              <div className="flex items-center">
                <Calendar size={14} className="mr-1" />
                Closes {format(new Date(transaction.closing_date), 'MMM d, yyyy')}
              </div>
            )}
          </div>
        </div>

        {primaryImage && (
          <div className="ml-4">
            <img
              src={primaryImage.url}
              alt={property?.title || 'Property'}
              className="w-20 h-20 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
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