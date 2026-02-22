'use client'

import { useEffect, useState } from 'react'
import { 
  Eye, MessageSquare, Heart, TrendingUp, TrendingDown, Minus,
  Star, AlertCircle, CheckCircle, ArrowRight
} from 'lucide-react'
import type { EngagementMetrics, QualityScore, MarketAnalysis } from '@/lib/analysis'
import { ICON_SIZES } from '@/lib/constants'

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
  if (error) return <div className="text-sm text-foreground">{error}</div>
  if (!data) return null

  const { engagement, quality, market } = data

  // Trend icon
  const TrendIcon = engagement.views.trend === 'up' ? TrendingUp 
    : engagement.views.trend === 'down' ? TrendingDown 
    : Minus
  const trendColor = engagement.views.trend === 'up' ? 'text-foreground' 
    : engagement.views.trend === 'down' ? 'text-foreground' 
    : 'text-foreground'

  if (compact) {
    return (
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-1.5">
          <Eye size={ICON_SIZES.sm} className="text-foreground" />
          <span className="font-medium">{engagement.views.total}</span>
          <TrendIcon size={ICON_SIZES.xs} className={trendColor} />
        </div>
        <div className="flex items-center gap-1.5">
          <MessageSquare size={ICON_SIZES.sm} className="text-foreground" />
          <span className="font-medium">{engagement.inquiries.total}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Heart size={ICON_SIZES.sm} className="text-foreground" />
          <span className="font-medium">{engagement.saves}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-muted rounded">
          <span className="font-semibold">{quality.grade}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Engagement Stats */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">Performance</h4>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Eye size={ICON_SIZES.md} className="text-foreground" />
            <span className="font-semibold">{engagement.views.total}</span>
            <span className="text-foreground text-sm">views</span>
            <TrendIcon size={ICON_SIZES.sm} className={trendColor} />
          </div>
          <div className="w-px h-4 bg-muted" />
          <div className="flex items-center gap-2">
            <MessageSquare size={ICON_SIZES.md} className="text-foreground" />
            <span className="font-semibold">{engagement.inquiries.total}</span>
            <span className="text-foreground text-sm">inquiries</span>
            {engagement.inquiries.unread > 0 && (
              <span className="px-1.5 py-0.5 bg-muted text-white text-xs rounded-full">
                {engagement.inquiries.unread} new
              </span>
            )}
          </div>
          <div className="w-px h-4 bg-muted" />
          <div className="flex items-center gap-2">
            <Heart size={ICON_SIZES.md} className="text-foreground" />
            <span className="font-semibold">{engagement.saves}</span>
            <span className="text-foreground text-sm">saves</span>
          </div>
        </div>
        {engagement.views.total > 0 && (
          <p className="text-xs text-foreground mt-2">
            <span className="font-medium text-foreground">
              {engagement.inquiries.conversionRate.toFixed(1)}%
            </span>
            {' '}conversion rate (inquiries ÷ views)
          </p>
        )}
      </div>

      {/* Quality Score */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-foreground">Listing Quality</h4>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{quality.overall}</span>
            <span className="text-sm text-foreground">/100</span>
            <span className={`px-2 py-0.5 rounded text-sm font-semibold ${
              quality.grade === 'A' ? 'bg-muted text-white' :
              quality.grade === 'B' ? 'bg-muted text-white' :
              quality.grade === 'C' ? 'bg-muted text-white' :
              'bg-muted text-foreground'
            }`}>
              {quality.grade}
            </span>
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-muted h-2 rounded-full transition-all duration-500"
            style={{ width: `${quality.overall}%` }}
          />
        </div>
        
        {/* Score breakdown */}
        <div className="grid grid-cols-5 gap-3 mt-3">
          {Object.entries(quality.breakdown).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-xs text-foreground capitalize">{key}</div>
              <div className="text-sm font-medium">{value.score}/{value.max}</div>
            </div>
          ))}
        </div>

        {/* Improvements */}
        {quality.improvements.length > 0 && (
          <div className="mt-4 space-y-2">
            <h5 className="text-xs font-medium text-foreground uppercase">Suggested Improvements</h5>
            {quality.improvements.slice(0, 3).map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Star size={ICON_SIZES.sm} className={
                  tip.priority === 'high' ? 'text-foreground' :
                  tip.priority === 'medium' ? 'text-foreground' :
                  'text-foreground'
                } />
                <div>
                  <span className="text-foreground">{tip.suggestion}</span>
                  <span className="text-foreground text-xs block">{tip.impact}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Market Position */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">Market Position</h4>
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1.5 rounded border ${
            market.marketPosition === 'below' ? 'border-border bg-muted text-foreground' :
            market.marketPosition === 'average' ? 'border-border bg-white text-foreground' :
            market.marketPosition === 'above' ? 'border-border bg-white text-foreground' :
            'border-border bg-muted text-foreground'
          }`}>
            <span className="text-sm font-medium capitalize">{market.marketPosition} market</span>
          </div>
          <ArrowRight size={ICON_SIZES.md} className="text-foreground" />
          <div className="text-sm">
            <span className="text-foreground">Suggested:</span>
            <span className="font-semibold ml-1">
              ${(market.suggestedPrice.optimal / 100).toLocaleString()}
              {market.listingType === 'rent' && '/mo'}
            </span>
          </div>
        </div>
        
        {market.comparables.length > 0 && (
          <p className="text-xs text-foreground mt-2">
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
          <div key={i} className="h-4 w-12 bg-muted rounded animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        <div className="flex gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-6 w-20 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        <div className="h-2 w-full bg-muted rounded animate-pulse" />
      </div>
    </div>
  )
}
