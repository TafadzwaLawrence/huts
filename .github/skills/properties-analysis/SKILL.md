---
name: properties-analysis
description: Analyze property performance, market positioning, pricing optimization, and investment metrics for Huts rental/sales platform. Use for market analysis, comparative pricing, engagement metrics, listing quality scoring, and investment calculations.
---

# Property Analysis Skill

## Purpose
Provides comprehensive property analytics for the Huts platform, helping landlords optimize listings, understand market positioning, and track performance. Includes tools for both rental and sale property analysis.

## When to Use This Skill
- Analyzing property performance (views, inquiries, saves)
- Suggesting competitive pricing based on market data
- Calculating investment metrics (ROI, rental yield)
- Comparing properties to market benchmarks
- Scoring listing quality and completeness
- Identifying improvement opportunities

---

## 1. Property Performance Analysis

### Engagement Metrics Query
```typescript
// lib/analysis/engagement.ts
import { createClient } from '@/lib/supabase/server'

export interface EngagementMetrics {
  propertyId: string
  views: {
    total: number
    last7Days: number
    last30Days: number
    trend: 'up' | 'down' | 'stable'
  }
  inquiries: {
    total: number
    unread: number
    conversionRate: number // inquiries / views
  }
  saves: number
  averageTimeOnMarket: number
}

export async function getPropertyEngagement(propertyId: string): Promise<EngagementMetrics> {
  const supabase = await createClient()
  
  const [viewsResult, inquiriesResult, savesResult] = await Promise.all([
    // Views analytics
    supabase.rpc('get_property_view_stats', { p_property_id: propertyId }),
    // Inquiries count
    supabase
      .from('inquiries')
      .select('id, status, created_at')
      .eq('property_id', propertyId),
    // Saves count
    supabase
      .from('saved_properties')
      .select('user_id', { count: 'exact' })
      .eq('property_id', propertyId)
  ])

  // Calculate metrics
  const views = viewsResult.data || { total: 0, last7: 0, last30: 0 }
  const inquiries = inquiriesResult.data || []
  const saves = savesResult.count || 0

  return {
    propertyId,
    views: {
      total: views.total,
      last7Days: views.last7,
      last30Days: views.last30,
      trend: calculateTrend(views.last7, views.last30)
    },
    inquiries: {
      total: inquiries.length,
      unread: inquiries.filter(i => i.status === 'unread').length,
      conversionRate: views.total > 0 ? (inquiries.length / views.total) * 100 : 0
    },
    saves,
    averageTimeOnMarket: 0 // calculated separately
  }
}

function calculateTrend(recent: number, older: number): 'up' | 'down' | 'stable' {
  const weeklyAvgRecent = recent / 7
  const weeklyAvgOlder = (older - recent) / 23
  const diff = weeklyAvgRecent - weeklyAvgOlder
  if (diff > 0.5) return 'up'
  if (diff < -0.5) return 'down'
  return 'stable'
}
```

### Database Function for View Stats
```sql
-- Add to migrations
CREATE OR REPLACE FUNCTION get_property_view_stats(p_property_id UUID)
RETURNS TABLE (
  total BIGINT,
  last7 BIGINT,
  last30 BIGINT,
  unique_viewers BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE viewed_at >= NOW() - INTERVAL '7 days') as last7,
    COUNT(*) FILTER (WHERE viewed_at >= NOW() - INTERVAL '30 days') as last30,
    COUNT(DISTINCT COALESCE(viewer_id::text, session_id)) as unique_viewers
  FROM property_views
  WHERE property_id = p_property_id;
END;
$$ LANGUAGE plpgsql STABLE;
```

---

## 2. Market Comparative Analysis

### Comparable Properties Query
```typescript
// lib/analysis/market.ts
export interface ComparableProperty {
  id: string
  title: string
  price: number
  beds: number
  baths: number
  sqft: number | null
  pricePerSqft: number | null
  similarity: number // 0-100 score
}

export interface MarketAnalysis {
  propertyId: string
  comparables: ComparableProperty[]
  marketPosition: 'below' | 'average' | 'above' | 'premium'
  suggestedPrice: {
    min: number
    max: number
    optimal: number
  }
  pricePerSqft: {
    property: number | null
    marketAverage: number
    percentile: number
  }
}

export async function getMarketAnalysis(
  propertyId: string
): Promise<MarketAnalysis> {
  const supabase = await createClient()
  
  // Get target property
  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single()
  
  if (!property) throw new Error('Property not found')

  // Find comparable properties (same city, similar beds/type)
  const { data: comparables } = await supabase
    .from('properties')
    .select('id, title, price, beds, baths, sqft, listing_type')
    .eq('city', property.city)
    .eq('status', 'active')
    .eq('listing_type', property.listing_type)
    .gte('beds', Math.max(0, property.beds - 1))
    .lte('beds', property.beds + 1)
    .neq('id', propertyId)
    .limit(20)

  const compList = (comparables || []).map(comp => {
    const similarity = calculateSimilarity(property, comp)
    const priceField = property.listing_type === 'sale' ? 'sale_price' : 'price'
    return {
      ...comp,
      price: comp[priceField] || comp.price,
      pricePerSqft: comp.sqft ? comp.price / comp.sqft : null,
      similarity
    }
  }).sort((a, b) => b.similarity - a.similarity)

  // Calculate market stats
  const prices = compList.map(c => c.price).filter(Boolean)
  const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : property.price
  const minPrice = Math.min(...prices, property.price)
  const maxPrice = Math.max(...prices, property.price)

  const propertyPrice = property.listing_type === 'sale' ? property.sale_price : property.price
  const position = getMarketPosition(propertyPrice, avgPrice, minPrice, maxPrice)

  return {
    propertyId,
    comparables: compList.slice(0, 5),
    marketPosition: position,
    suggestedPrice: {
      min: Math.round(avgPrice * 0.9),
      max: Math.round(avgPrice * 1.1),
      optimal: Math.round(avgPrice)
    },
    pricePerSqft: {
      property: property.sqft ? propertyPrice / property.sqft : null,
      marketAverage: calculateAvgPricePerSqft(compList),
      percentile: calculatePricePercentile(propertyPrice, prices)
    }
  }
}

function calculateSimilarity(target: any, comp: any): number {
  let score = 100
  
  // Beds difference (-10 per bed)
  score -= Math.abs(target.beds - comp.beds) * 10
  
  // Baths difference (-5 per bath)
  score -= Math.abs(target.baths - comp.baths) * 5
  
  // Property type match (+20)
  if (target.property_type === comp.property_type) score += 20
  
  // Sqft within 20% (+15)
  if (target.sqft && comp.sqft) {
    const sqftDiff = Math.abs(target.sqft - comp.sqft) / target.sqft
    if (sqftDiff <= 0.2) score += 15
    else score -= sqftDiff * 20
  }
  
  return Math.max(0, Math.min(100, score))
}

function getMarketPosition(price: number, avg: number, min: number, max: number): string {
  const normalized = (price - min) / (max - min || 1)
  if (normalized < 0.25) return 'below'
  if (normalized < 0.5) return 'average'
  if (normalized < 0.75) return 'above'
  return 'premium'
}
```

---

## 3. Listing Quality Score

### Quality Assessment
```typescript
// lib/analysis/quality.ts
export interface QualityScore {
  overall: number // 0-100
  breakdown: {
    photos: { score: number; max: number; feedback: string }
    description: { score: number; max: number; feedback: string }
    details: { score: number; max: number; feedback: string }
    pricing: { score: number; max: number; feedback: string }
    amenities: { score: number; max: number; feedback: string }
  }
  improvements: string[]
}

export async function calculateListingQuality(propertyId: string): Promise<QualityScore> {
  const supabase = await createClient()
  
  const [propertyResult, imagesResult] = await Promise.all([
    supabase.from('properties').select('*').eq('id', propertyId).single(),
    supabase.from('property_images').select('id').eq('property_id', propertyId)
  ])

  const property = propertyResult.data
  const imageCount = imagesResult.data?.length || 0
  const improvements: string[] = []

  // Photo score (max 25)
  let photoScore = 0
  if (imageCount >= 10) photoScore = 25
  else if (imageCount >= 5) photoScore = 20
  else if (imageCount >= 3) photoScore = 15
  else if (imageCount >= 1) photoScore = 10
  if (imageCount < 5) improvements.push('Add more photos (aim for 5-10)')

  // Description score (max 25)
  let descScore = 0
  const descLength = property?.description?.length || 0
  if (descLength >= 500) descScore = 25
  else if (descLength >= 300) descScore = 20
  else if (descLength >= 150) descScore = 15
  else if (descLength >= 50) descScore = 10
  if (descLength < 300) improvements.push('Write a more detailed description (300+ characters)')

  // Details score (max 20)
  let detailScore = 0
  if (property?.sqft) detailScore += 5
  else improvements.push('Add square footage')
  if (property?.neighborhood) detailScore += 5
  else improvements.push('Add neighborhood info')
  if (property?.available_from) detailScore += 5
  if (property?.year_built) detailScore += 5

  // Amenities score (max 15)
  const amenities = property?.amenities || []
  let amenityScore = Math.min(15, (Array.isArray(amenities) ? amenities.length : 0) * 3)
  if (amenityScore < 9) improvements.push('Add more amenities to attract renters')

  // Pricing score (max 15)
  let pricingScore = 15 // Base score
  if (!property?.deposit && property?.listing_type === 'rent') {
    pricingScore -= 5
    improvements.push('Add deposit information')
  }

  const overall = photoScore + descScore + detailScore + amenityScore + pricingScore

  return {
    overall,
    breakdown: {
      photos: { score: photoScore, max: 25, feedback: `${imageCount} photos uploaded` },
      description: { score: descScore, max: 25, feedback: `${descLength} characters` },
      details: { score: detailScore, max: 20, feedback: 'Property specifications' },
      pricing: { score: pricingScore, max: 15, feedback: 'Pricing transparency' },
      amenities: { score: amenityScore, max: 15, feedback: `${(amenities as any[]).length} amenities listed` }
    },
    improvements
  }
}
```

---

## 4. Investment Analysis (Sale Properties)

### ROI & Investment Metrics
```typescript
// lib/analysis/investment.ts
export interface InvestmentMetrics {
  salePrice: number
  estimatedRent: number
  annualGrossIncome: number
  estimatedExpenses: {
    propertyTax: number
    insurance: number
    maintenance: number
    vacancy: number
    total: number
  }
  netOperatingIncome: number
  capRate: number
  grossRentMultiplier: number
  cashOnCashReturn: number
  monthlyMortgage: number
  monthlyNetCashFlow: number
}

export async function calculateInvestmentMetrics(
  propertyId: string,
  downPaymentPercent: number = 20,
  interestRate: number = 6.5,
  termYears: number = 30
): Promise<InvestmentMetrics> {
  const supabase = await createClient()
  
  // Get property
  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single()

  if (!property || property.listing_type !== 'sale') {
    throw new Error('Property not found or not for sale')
  }

  const salePrice = property.sale_price

  // Estimate monthly rent from comparable rentals
  const { data: rentComps } = await supabase
    .from('properties')
    .select('price')
    .eq('city', property.city)
    .eq('listing_type', 'rent')
    .eq('status', 'active')
    .gte('beds', Math.max(0, property.beds - 1))
    .lte('beds', property.beds + 1)
    .limit(10)

  const rentPrices = rentComps?.map(r => r.price).filter(Boolean) || []
  const estimatedRent = rentPrices.length 
    ? Math.round(rentPrices.reduce((a, b) => a + b, 0) / rentPrices.length)
    : Math.round(salePrice * 0.006) // 0.6% rule fallback

  // Annual calculations
  const annualGross = estimatedRent * 12
  
  // Expenses (typical percentages)
  const expenses = {
    propertyTax: property.property_tax_annual || Math.round(salePrice * 0.01), // 1% if unknown
    insurance: Math.round(salePrice * 0.003), // 0.3%
    maintenance: Math.round(annualGross * 0.1), // 10% of rent
    vacancy: Math.round(annualGross * 0.05), // 5% vacancy
    total: 0
  }
  expenses.total = expenses.propertyTax + expenses.insurance + expenses.maintenance + expenses.vacancy

  // HOA if applicable
  const hoaAnnual = (property.hoa_fee_monthly || 0) * 12
  expenses.total += hoaAnnual

  // Key metrics
  const noi = annualGross - expenses.total
  const capRate = (noi / salePrice) * 100
  const grm = salePrice / annualGross

  // Mortgage calculation
  const loanAmount = salePrice * (1 - downPaymentPercent / 100)
  const monthlyRate = interestRate / 100 / 12
  const numPayments = termYears * 12
  const monthlyMortgage = monthlyRate > 0
    ? Math.round(loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1))
    : Math.round(loanAmount / numPayments)

  // Cash on cash return
  const downPayment = salePrice * (downPaymentPercent / 100)
  const monthlyCashFlow = estimatedRent - (expenses.total / 12) - monthlyMortgage
  const annualCashFlow = monthlyCashFlow * 12
  const cashOnCash = downPayment > 0 ? (annualCashFlow / downPayment) * 100 : 0

  return {
    salePrice,
    estimatedRent,
    annualGrossIncome: annualGross,
    estimatedExpenses: expenses,
    netOperatingIncome: noi,
    capRate: Math.round(capRate * 100) / 100,
    grossRentMultiplier: Math.round(grm * 100) / 100,
    cashOnCashReturn: Math.round(cashOnCash * 100) / 100,
    monthlyMortgage,
    monthlyNetCashFlow: Math.round(monthlyCashFlow)
  }
}
```

---

## 5. Dashboard Analytics Component

### Implementation Pattern
```tsx
// components/dashboard/PropertyAnalytics.tsx
'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Eye, MessageSquare, Heart, Star } from 'lucide-react'

interface AnalyticsProps {
  propertyId: string
}

export function PropertyAnalytics({ propertyId }: AnalyticsProps) {
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null)
  const [quality, setQuality] = useState<QualityScore | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [engagementRes, qualityRes] = await Promise.all([
          fetch(`/api/properties/${propertyId}/analytics`),
          fetch(`/api/properties/${propertyId}/quality`)
        ])
        setMetrics(await engagementRes.json())
        setQuality(await qualityRes.json())
      } finally {
        setLoading(false)
      }
    }
    loadAnalytics()
  }, [propertyId])

  if (loading) return <AnalyticsSkeleton />

  const TrendIcon = metrics?.views.trend === 'up' ? TrendingUp : 
                   metrics?.views.trend === 'down' ? TrendingDown : Minus

  return (
    <div className="space-y-6">
      {/* Performance Stats */}
      <div className="flex items-center gap-8 text-sm">
        <div className="flex items-center gap-2">
          <Eye size={16} className="text-[#6C757D]" />
          <span className="font-medium">{metrics?.views.total || 0}</span>
          <span className="text-[#6C757D]">views</span>
          <TrendIcon size={14} className={
            metrics?.views.trend === 'up' ? 'text-green-600' :
            metrics?.views.trend === 'down' ? 'text-red-500' : 'text-[#6C757D]'
          } />
        </div>
        <div className="w-px h-4 bg-[#E9ECEF]" />
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-[#6C757D]" />
          <span className="font-medium">{metrics?.inquiries.total || 0}</span>
          <span className="text-[#6C757D]">inquiries</span>
        </div>
        <div className="w-px h-4 bg-[#E9ECEF]" />
        <div className="flex items-center gap-2">
          <Heart size={16} className="text-[#6C757D]" />
          <span className="font-medium">{metrics?.saves || 0}</span>
          <span className="text-[#6C757D]">saves</span>
        </div>
      </div>

      {/* Quality Score */}
      {quality && (
        <div className="border border-[#E9ECEF] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Listing Quality</span>
            <span className="text-lg font-semibold">{quality.overall}/100</span>
          </div>
          <div className="w-full bg-[#E9ECEF] rounded-full h-2">
            <div 
              className="bg-[#212529] h-2 rounded-full transition-all"
              style={{ width: `${quality.overall}%` }}
            />
          </div>
          {quality.improvements.length > 0 && (
            <ul className="mt-3 space-y-1">
              {quality.improvements.slice(0, 3).map((tip, i) => (
                <li key={i} className="text-xs text-[#6C757D] flex items-center gap-2">
                  <Star size={12} />
                  {tip}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Conversion Rate */}
      {metrics && metrics.views.total > 0 && (
        <div className="text-sm text-[#6C757D]">
          <span className="font-medium text-[#212529]">
            {metrics.inquiries.conversionRate.toFixed(1)}%
          </span>
          {' '}conversion rate (inquiries / views)
        </div>
      )}
    </div>
  )
}
```

---

## 6. API Routes

### Analytics Endpoint
```typescript
// app/api/properties/[propertyId]/analytics/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { propertyId: string } }
) {
  const supabase = await createClient()
  const { propertyId } = params

  // Verify ownership
  const { data: { user } } = await supabase.auth.getUser()
  const { data: property } = await supabase
    .from('properties')
    .select('user_id')
    .eq('id', propertyId)
    .single()

  if (!property || property.user_id !== user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // Get engagement metrics
  const metrics = await getPropertyEngagement(propertyId)
  
  return NextResponse.json(metrics)
}
```

---

## 7. Best Practices

### Performance
- **Cache market data**: Use SWR or React Query with 5-minute stale time
- **Batch analytics queries**: Use Promise.all for parallel fetches
- **Materialized views**: Use for frequently-accessed aggregations (property_ratings, property_sale_stats)

### Database Indexing
```sql
-- Essential indexes for analysis queries
CREATE INDEX idx_views_property_date ON property_views(property_id, viewed_at DESC);
CREATE INDEX idx_inquiries_property_date ON inquiries(property_id, created_at DESC);
CREATE INDEX idx_properties_market_search ON properties(city, listing_type, beds, status);
```

### Security
- Always verify property ownership before returning analytics
- Sanitize all user inputs in queries
- Use RLS policies for data access control

### Caching Strategy
```typescript
// Use SWR for client-side caching
import useSWR from 'swr'

export function usePropertyAnalytics(propertyId: string) {
  return useSWR(
    `/api/properties/${propertyId}/analytics`,
    fetcher,
    { 
      revalidateOnFocus: false,
      dedupingInterval: 60000 // 1 minute
    }
  )
}
```

---

## 8. Key Metrics Reference

| Metric | Formula | Good Target |
|--------|---------|-------------|
| Conversion Rate | Inquiries ÷ Views × 100 | > 3% |
| Quality Score | Weighted sum of listing completeness | > 80 |
| Cap Rate | NOI ÷ Purchase Price × 100 | 5-10% |
| Gross Rent Multiplier | Sale Price ÷ Annual Rent | 10-15 |
| Cash on Cash | Annual Cash Flow ÷ Down Payment × 100 | > 8% |
| Price per Sqft | Price ÷ Square Footage | Market dependent |

---

## 9. Implementation Checklist

- [ ] Create `lib/analysis/` directory with module files
- [ ] Add database functions for view stats
- [ ] Add necessary indexes for performance
- [ ] Create API routes under `/api/properties/[id]/analytics`
- [ ] Build dashboard analytics components
- [ ] Add SWR hooks for client-side data fetching
- [ ] Implement caching for market comparison data
- [ ] Add RLS policies for analytics tables