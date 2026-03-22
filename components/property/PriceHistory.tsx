'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react'

interface PriceHistoryEntry {
  id: string
  event_type: string
  price: number
  previous_price: number | null
  change_amount: number | null
  change_percent: number | null
  created_at: string
}

interface PriceHistoryProps {
  propertyId: string
  currentPrice: number | null
  currentSalePrice: number | null
  listingType: 'rent' | 'sale' | null
}

export default function PriceHistory({ propertyId, currentPrice, currentSalePrice, listingType }: PriceHistoryProps) {
  const [history, setHistory] = useState<PriceHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      const supabase = createClient()
      const { data } = await supabase
        .from('price_history')
        .select('id, event_type, price, previous_price, change_amount, change_percent, created_at')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false })
        .limit(20)

      setHistory(data || [])
      setLoading(false)
    }
    fetchHistory()
  }, [propertyId])

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-base font-bold text-[#212529] mb-3">Price History</h2>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 bg-[#F8F9FA] rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (history.length === 0) return null

  const isSale = listingType === 'sale'

  const formatAmount = (cents: number) => {
    if (isSale) {
      const dollars = cents / 100
      if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`
      if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(0)}K`
      return `$${dollars.toLocaleString()}`
    }
    return `$${(cents / 100).toFixed(0)}/mo`
  }

  const getChange = (entry: PriceHistoryEntry) => {
    if (!entry.previous_price || !entry.change_percent) return { direction: 'neutral' as const, percent: 0 }
    return {
      direction: entry.price > entry.previous_price ? 'up' as const : 'down' as const,
      percent: Math.abs(Math.round(entry.change_percent * 10) / 10),
    }
  }

  // Build visual timeline data
  const prices = history.map(e => e.price).filter(p => p > 0)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const range = maxPrice - minPrice || 1

  return (
    <div className="mb-8">
      <h2 className="text-base font-bold text-[#212529] mb-4">Price History</h2>

      {/* Mini bar chart */}
      <div className="flex items-end gap-1 h-16 mb-4 px-1">
        {[...history].reverse().map((entry, i) => {
          const height = Math.max(8, ((entry.price - minPrice) / range) * 100)
          const change = getChange(entry)
          return (
            <div
              key={entry.id}
              className="flex-1 rounded-t transition-all"
              style={{ height: `${height}%` }}
              title={`${formatAmount(entry.price)} on ${new Date(entry.created_at).toLocaleDateString()}`}
            >
              <div
                className={`w-full h-full rounded-t ${
                  change.direction === 'down' ? 'bg-[#51CF66]' :
                  change.direction === 'up' ? 'bg-[#FF6B6B]' :
                  'bg-[#ADB5BD]'
                }`}
              />
            </div>
          )
        })}
      </div>

      {/* Timeline entries */}
      <div className="space-y-0">
        {history.map((entry, i) => {
          const change = getChange(entry)
          const date = new Date(entry.created_at)

          return (
            <div
              key={entry.id}
              className="flex items-center gap-3 py-3 border-b border-[#F8F9FA] last:border-0"
            >
              {/* Timeline dot */}
              <div className="flex flex-col items-center">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  change.direction === 'down' ? 'bg-[#51CF66]' :
                  change.direction === 'up' ? 'bg-[#FF6B6B]' :
                  'bg-[#ADB5BD]'
                }`} />
                {i < history.length - 1 && (
                  <div className="w-px h-6 bg-[#E9ECEF] mt-1" />
                )}
              </div>

              {/* Price info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#212529]">
                    {formatAmount(entry.price)}
                  </span>
                  {change.direction !== 'neutral' && (
                    <span className={`flex items-center gap-0.5 text-xs ${
                      change.direction === 'down' ? 'text-[#51CF66]' : 'text-[#FF6B6B]'
                    }`}>
                      {change.direction === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {change.percent}%
                    </span>
                  )}
                </div>
                {entry.previous_price && (
                  <p className="text-xs text-[#ADB5BD]">
                    from {formatAmount(entry.previous_price)}
                  </p>
                )}
              </div>

              {/* Date */}
              <div className="flex items-center gap-1 text-xs text-[#6C757D]">
                <Calendar size={12} />
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
