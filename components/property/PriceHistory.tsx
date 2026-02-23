'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react'

interface PriceHistoryEntry {
  id: string
  old_price: number | null
  new_price: number | null
  old_sale_price: number | null
  new_sale_price: number | null
  changed_at: string
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
        .select('id, old_price, new_price, old_sale_price, new_sale_price, changed_at')
        .eq('property_id', propertyId)
        .order('changed_at', { ascending: false })
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
    const oldVal = isSale ? entry.old_sale_price : entry.old_price
    const newVal = isSale ? entry.new_sale_price : entry.new_price
    if (!oldVal || !newVal) return { direction: 'neutral' as const, percent: 0 }
    const diff = newVal - oldVal
    const percent = Math.abs((diff / oldVal) * 100)
    return {
      direction: diff > 0 ? 'up' as const : diff < 0 ? 'down' as const : 'neutral' as const,
      percent: Math.round(percent * 10) / 10,
    }
  }

  // Build visual timeline data - find min/max for chart scaling
  const prices = history
    .map(e => isSale ? (e.new_sale_price || 0) : (e.new_price || 0))
    .filter(p => p > 0)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const range = maxPrice - minPrice || 1

  return (
    <div className="mb-8">
      <h2 className="text-base font-bold text-[#212529] mb-4">Price History</h2>

      {/* Mini bar chart */}
      <div className="flex items-end gap-1 h-16 mb-4 px-1">
        {[...history].reverse().map((entry, i) => {
          const price = isSale ? (entry.new_sale_price || 0) : (entry.new_price || 0)
          const height = price > 0 ? Math.max(8, ((price - minPrice) / range) * 100) : 8
          const change = getChange(entry)
          return (
            <div
              key={entry.id}
              className="flex-1 rounded-t transition-all"
              style={{ height: `${height}%` }}
              title={`${formatAmount(price)} on ${new Date(entry.changed_at).toLocaleDateString()}`}
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
          const newPrice = isSale ? entry.new_sale_price : entry.new_price
          const oldPrice = isSale ? entry.old_sale_price : entry.old_price
          const date = new Date(entry.changed_at)

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
                    {newPrice ? formatAmount(newPrice) : 'N/A'}
                  </span>
                  {change.direction !== 'neutral' && oldPrice && (
                    <span className={`flex items-center gap-0.5 text-xs ${
                      change.direction === 'down' ? 'text-[#51CF66]' : 'text-[#FF6B6B]'
                    }`}>
                      {change.direction === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {change.percent}%
                    </span>
                  )}
                </div>
                {oldPrice && (
                  <p className="text-xs text-[#ADB5BD]">
                    from {formatAmount(oldPrice)}
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
