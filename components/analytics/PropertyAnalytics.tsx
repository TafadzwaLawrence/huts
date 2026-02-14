'use client'

import { useEffect, useState } from 'react'
import { 
  Eye, MessageSquare, Heart, TrendingUp, TrendingDown, Minus,
  Star, AlertCircle, CheckCircle, ArrowRight
} from 'lucide-react'
import type { EngagementMetrics, QualityScore, MarketAnalysis } from '@/lib/analysis'

interface PropertyAnalyticsProps {
  propertyId: string
  compact?: boolean
}

interface AnalyticsData {
  engagement: EngagementMetrics
  quality: QualityScore
  market: MarketAnalysis
}

export function PropertyAnalytics({ propertyId, compact = false }: PropertyAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true)
        const res = await fetch(`/api/properties/${propertyId}/analytics`)
        if (!res.ok) throw new Error('Failed to load analytics')
        const analytics = await res.json()
        setData(analytics)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadAnalytics()
  }, [propertyId])

  if (loading) return <AnalyticsSkeleton compact={compact} />
  if (error) return <div className="text-sm text-red-500">{error}</div>
  if (!data) return null

  const { engagement, quality, market } = data

  // Trend icon
  const TrendIcon = engagement.views.trend === 'up' ? TrendingUp 
    : engagement.views.trend === 'down' ? TrendingDown 
    : Minus
  const trendColor = engagement.views.trend === 'up' ? 'text-green-600' 
    : engagement.views.trend === 'down' ? 'text-red-500' 
    : 'text-[#6C757D]'

  if (compact) {
    return (
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-1.5">
          <Eye size={14} className="text-[#6C757D]" />
          <span className="font-medium">{engagement.views.total}</span>
          <TrendIcon size={12} className={trendColor} />
        </div>
        <div className="flex items-center gap-1.5">
          <MessageSquare size={14} className="text-[#6C757D]" />
          <span className="font-medium">{engagement.inquiries.total}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Heart size={14} className="text-[#6C757D]" />
          <span className="font-medium">{engagement.saves}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#F8F9FA] rounded">
          <span className="font-semibold">{quality.grade}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Engagement Stats */}
      <div>
        <h4 className="text-sm font-medium text-[#495057] mb-3">Performance</h4>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-[#6C757D]" />
            <span className="font-semibold">{engagement.views.total}</span>
            <span className="text-[#6C757D] text-sm">views</span>
            <TrendIcon size={14} className={trendColor} />
          </div>
          <div className="w-px h-4 bg-[#E9ECEF]" />
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-[#6C757D]" />
            <span className="font-semibold">{engagement.inquiries.total}</span>
            <span className="text-[#6C757D] text-sm">inquiries</span>
            {engagement.inquiries.unread > 0 && (
              <span className="px-1.5 py-0.5 bg-[#212529] text-white text-xs rounded-full">
                {engagement.inquiries.unread} new
              </span>
            )}
          </div>
          <div className="w-px h-4 bg-[#E9ECEF]" />
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-[#6C757D]" />
            <span className="font-semibold">{engagement.saves}</span>
            <span className="text-[#6C757D] text-sm">saves</span>
          </div>
        </div>
        {engagement.views.total > 0 && (
          <p className="text-xs text-[#6C757D] mt-2">
            <span className="font-medium text-[#212529]">
              {engagement.inquiries.conversionRate.toFixed(1)}%
            </span>
            {' '}conversion rate (inquiries ÷ views)
          </p>
        )}
      </div>

      {/* Quality Score */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-[#495057]">Listing Quality</h4>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{quality.overall}</span>
            <span className="text-sm text-[#6C757D]">/100</span>
            <span className={`px-2 py-0.5 rounded text-sm font-semibold ${
              quality.grade === 'A' ? 'bg-green-100 text-green-700' :
              quality.grade === 'B' ? 'bg-blue-100 text-blue-700' :
              quality.grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {quality.grade}
            </span>
          </div>
        </div>
        <div className="w-full bg-[#E9ECEF] rounded-full h-2">
          <div 
            className="bg-[#212529] h-2 rounded-full transition-all duration-500"
            style={{ width: `${quality.overall}%` }}
          />
        </div>
        
        {/* Score breakdown */}
        <div className="grid grid-cols-5 gap-3 mt-3">
          {Object.entries(quality.breakdown).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-xs text-[#6C757D] capitalize">{key}</div>
              <div className="text-sm font-medium">{value.score}/{value.max}</div>
            </div>
          ))}
        </div>

        {/* Improvements */}
        {quality.improvements.length > 0 && (
          <div className="mt-4 space-y-2">
            <h5 className="text-xs font-medium text-[#6C757D] uppercase">Suggested Improvements</h5>
            {quality.improvements.slice(0, 3).map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Star size={14} className={
                  tip.priority === 'high' ? 'text-red-500' :
                  tip.priority === 'medium' ? 'text-yellow-500' :
                  'text-[#6C757D]'
                } />
                <div>
                  <span className="text-[#212529]">{tip.suggestion}</span>
                  <span className="text-[#6C757D] text-xs block">{tip.impact}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Market Position */}
      <div>
        <h4 className="text-sm font-medium text-[#495057] mb-3">Market Position</h4>
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1.5 rounded border ${
            market.marketPosition === 'below' ? 'border-green-300 bg-green-50 text-green-700' :
            market.marketPosition === 'average' ? 'border-[#E9ECEF] bg-[#F8F9FA] text-[#495057]' :
            market.marketPosition === 'above' ? 'border-yellow-300 bg-yellow-50 text-yellow-700' :
            'border-red-300 bg-red-50 text-red-700'
          }`}>
            <span className="text-sm font-medium capitalize">{market.marketPosition} market</span>
          </div>
          <ArrowRight size={16} className="text-[#6C757D]" />
          <div className="text-sm">
            <span className="text-[#6C757D]">Suggested:</span>
            <span className="font-semibold ml-1">
              ${(market.suggestedPrice.optimal / 100).toLocaleString()}
              {market.listingType === 'rent' && '/mo'}
            </span>
          </div>
        </div>
        
        {market.comparables.length > 0 && (
          <p className="text-xs text-[#6C757D] mt-2">
            Based on {market.comparables.length} similar listings in your area
          </p>
        )}
      </div>
    </div>
  )
}

function AnalyticsSkeleton({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-4 w-12 bg-[#E9ECEF] rounded animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="h-4 w-24 bg-[#E9ECEF] rounded animate-pulse" />
        <div className="flex gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-6 w-20 bg-[#E9ECEF] rounded animate-pulse" />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-32 bg-[#E9ECEF] rounded animate-pulse" />
        <div className="h-2 w-full bg-[#E9ECEF] rounded animate-pulse" />
      </div>
    </div>
  )
}
