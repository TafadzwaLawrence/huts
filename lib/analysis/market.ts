import { createClient } from '@/lib/supabase/server'

export interface ComparableProperty {
  id: string
  title: string
  price: number
  beds: number
  baths: number
  sqft: number | null
  propertyType: string
  neighborhood: string | null
  pricePerSqft: number | null
  similarity: number
}

export interface MarketAnalysis {
  propertyId: string
  listingType: 'rent' | 'sale'
  currentPrice: number
  comparables: ComparableProperty[]
  marketPosition: 'below' | 'average' | 'above' | 'premium'
  suggestedPrice: {
    min: number
    max: number
    optimal: number
    confidence: 'low' | 'medium' | 'high'
  }
  pricePerSqft: {
    property: number | null
    marketAverage: number
    marketMin: number
    marketMax: number
    percentile: number
  }
  demandIndicators: {
    avgDaysOnMarket: number
    activeListings: number
    inquiriesPerListing: number
  }
}

/**
 * Get comprehensive market analysis for a property
 */
export async function getMarketAnalysis(propertyId: string): Promise<MarketAnalysis> {
  const supabase = await createClient()

  // Get target property
  const { data: property, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single()

  if (error || !property) throw new Error('Property not found')

  const listingType = property.listing_type || 'rent'
  const currentPrice = listingType === 'sale' ? property.sale_price : property.price

  // Find comparable properties
  const { data: comparables } = await supabase
    .from('properties')
    .select(`
      id, title, price, sale_price, beds, baths, sqft, 
      property_type, neighborhood, listing_type, created_at, status
    `)
    .eq('city', property.city)
    .eq('listing_type', listingType)
    .eq('status', 'active')
    .gte('beds', Math.max(0, property.beds - 1))
    .lte('beds', property.beds + 1)
    .neq('id', propertyId)
    .limit(30)

  const compList = (comparables || []).map(comp => {
    const price = listingType === 'sale' ? comp.sale_price : comp.price
    return {
      id: comp.id,
      title: comp.title,
      price,
      beds: comp.beds,
      baths: comp.baths,
      sqft: comp.sqft,
      propertyType: comp.property_type,
      neighborhood: comp.neighborhood,
      pricePerSqft: comp.sqft && price ? Math.round(price / comp.sqft) : null,
      similarity: calculateSimilarity(property, comp)
    }
  }).sort((a, b) => b.similarity - a.similarity)

  // Calculate market stats
  const prices = compList.map(c => c.price).filter(Boolean) as number[]
  const pricesPerSqft = compList
    .filter(c => c.pricePerSqft)
    .map(c => c.pricePerSqft!) as number[]

  const marketStats = calculateMarketStats(prices)
  const sqftStats = calculateMarketStats(pricesPerSqft)

  // Determine confidence based on sample size
  const confidence = prices.length >= 10 ? 'high' : prices.length >= 5 ? 'medium' : 'low'

  // Calculate suggested price
  const suggestedPrice = calculateSuggestedPrice(property, compList, currentPrice)

  // Calculate price position
  const position = getMarketPosition(currentPrice, marketStats)

  // Calculate demand indicators
  const demandIndicators = await getDemandIndicators(supabase, property.city, listingType)

  return {
    propertyId,
    listingType,
    currentPrice,
    comparables: compList.slice(0, 5),
    marketPosition: position,
    suggestedPrice: {
      ...suggestedPrice,
      confidence
    },
    pricePerSqft: {
      property: property.sqft && currentPrice ? Math.round(currentPrice / property.sqft) : null,
      marketAverage: Math.round(sqftStats.average),
      marketMin: sqftStats.min,
      marketMax: sqftStats.max,
      percentile: property.sqft && currentPrice
        ? calculatePercentile(currentPrice / property.sqft, pricesPerSqft)
        : 50
    },
    demandIndicators
  }
}

/**
 * Calculate similarity score between two properties
 */
function calculateSimilarity(target: any, comp: any): number {
  let score = 100

  // Beds difference (-15 per bed)
  score -= Math.abs(target.beds - comp.beds) * 15

  // Baths difference (-10 per bath)
  score -= Math.abs(target.baths - comp.baths) * 10

  // Property type match (+15)
  if (target.property_type === comp.property_type) {
    score += 15
  } else {
    score -= 10
  }

  // Neighborhood match (+20)
  if (target.neighborhood && comp.neighborhood) {
    if (target.neighborhood.toLowerCase() === comp.neighborhood.toLowerCase()) {
      score += 20
    }
  }

  // Sqft similarity
  if (target.sqft && comp.sqft) {
    const sqftDiff = Math.abs(target.sqft - comp.sqft) / target.sqft
    if (sqftDiff <= 0.1) score += 15 // Within 10%
    else if (sqftDiff <= 0.2) score += 10 // Within 20%
    else if (sqftDiff <= 0.3) score += 5 // Within 30%
    else score -= Math.min(20, sqftDiff * 30)
  }

  return Math.max(0, Math.min(100, score))
}

/**
 * Calculate basic market statistics
 */
function calculateMarketStats(values: number[]): {
  average: number
  median: number
  min: number
  max: number
  stdDev: number
} {
  if (values.length === 0) {
    return { average: 0, median: 0, min: 0, max: 0, stdDev: 0 }
  }

  const sorted = [...values].sort((a, b) => a - b)
  const sum = values.reduce((a, b) => a + b, 0)
  const average = sum / values.length
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)]

  // Standard deviation
  const squaredDiffs = values.map(v => Math.pow(v - average, 2))
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length
  const stdDev = Math.sqrt(avgSquaredDiff)

  return {
    average,
    median,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    stdDev
  }
}

/**
 * Calculate suggested pricing
 */
function calculateSuggestedPrice(
  property: any,
  comparables: ComparableProperty[],
  currentPrice: number
): { min: number; max: number; optimal: number } {
  const prices = comparables.map(c => c.price).filter(Boolean) as number[]
  
  if (prices.length === 0) {
    // No comparables - return current price with buffer
    return {
      min: Math.round(currentPrice * 0.9),
      max: Math.round(currentPrice * 1.1),
      optimal: currentPrice
    }
  }

  const stats = calculateMarketStats(prices)

  // Weight by similarity (top comparables matter more)
  const topComps = comparables.slice(0, 5)
  const weightedSum = topComps.reduce((sum, comp, index) => {
    const weight = (5 - index) / 15 // Decreasing weight
    return sum + (comp.price * weight * (comp.similarity / 100))
  }, 0)
  
  const totalWeight = topComps.reduce((sum, comp, index) => {
    const weight = (5 - index) / 15
    return sum + (weight * (comp.similarity / 100))
  }, 0)

  const weightedAvg = totalWeight > 0 ? weightedSum / totalWeight : stats.average

  // Adjust for property specifics
  let optimal = weightedAvg

  // Premium for more amenities
  const amenities = property.amenities || []
  if (Array.isArray(amenities) && amenities.length >= 5) {
    optimal *= 1.02 // 2% premium
  }

  // Adjust for sqft if significantly different
  if (property.sqft && stats.average > 0) {
    const avgSqft = comparables
      .filter(c => c.sqft)
      .reduce((sum, c) => sum + c.sqft!, 0) / comparables.filter(c => c.sqft).length

    if (avgSqft > 0) {
      const sqftRatio = property.sqft / avgSqft
      if (sqftRatio > 1.1) optimal *= Math.min(1.15, sqftRatio * 0.5 + 0.5)
      if (sqftRatio < 0.9) optimal *= Math.max(0.85, sqftRatio * 0.5 + 0.5)
    }
  }

  return {
    min: Math.round(stats.median * 0.9),
    max: Math.round(stats.median * 1.1),
    optimal: Math.round(optimal)
  }
}

/**
 * Determine market position
 */
function getMarketPosition(
  price: number,
  stats: { average: number; min: number; max: number; stdDev: number }
): 'below' | 'average' | 'above' | 'premium' {
  if (stats.average === 0) return 'average'

  const deviation = (price - stats.average) / (stats.stdDev || stats.average * 0.15)

  if (deviation < -1) return 'below'
  if (deviation < 0.5) return 'average'
  if (deviation < 1.5) return 'above'
  return 'premium'
}

/**
 * Calculate percentile
 */
function calculatePercentile(value: number, sortedArray: number[]): number {
  if (sortedArray.length === 0) return 50
  const sorted = [...sortedArray].sort((a, b) => a - b)
  const index = sorted.findIndex(v => v >= value)
  if (index === -1) return 100
  return Math.round((index / sorted.length) * 100)
}

/**
 * Get demand indicators for the market
 */
async function getDemandIndicators(
  supabase: any,
  city: string,
  listingType: string
): Promise<{ avgDaysOnMarket: number; activeListings: number; inquiriesPerListing: number }> {
  // Get active listings count
  const { count: activeListings } = await supabase
    .from('properties')
    .select('id', { count: 'exact' })
    .eq('city', city)
    .eq('listing_type', listingType)
    .eq('status', 'active')

  // Get properties with their inquiry counts
  const { data: propertiesWithInquiries } = await supabase
    .from('properties')
    .select(`
      id,
      created_at,
      published_at,
      inquiries:inquiries(id)
    `)
    .eq('city', city)
    .eq('listing_type', listingType)
    .eq('status', 'active')
    .limit(50)

  let totalDaysOnMarket = 0
  let totalInquiries = 0
  const validCount = (propertiesWithInquiries || []).length

  for (const prop of propertiesWithInquiries || []) {
    const listedDate = prop.published_at || prop.created_at
    const daysOnMarket = Math.floor(
      (Date.now() - new Date(listedDate).getTime()) / (1000 * 60 * 60 * 24)
    )
    totalDaysOnMarket += daysOnMarket
    totalInquiries += (prop.inquiries?.length || 0)
  }

  return {
    avgDaysOnMarket: validCount > 0 ? Math.round(totalDaysOnMarket / validCount) : 0,
    activeListings: activeListings || 0,
    inquiriesPerListing: validCount > 0 
      ? Math.round((totalInquiries / validCount) * 10) / 10 
      : 0
  }
}

/**
 * Get price trends over time
 */
export async function getPriceTrends(
  city: string,
  listingType: 'rent' | 'sale',
  months: number = 6
): Promise<Array<{ month: string; avgPrice: number; count: number }>> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('properties')
    .select('price, sale_price, created_at, listing_type')
    .eq('city', city)
    .eq('listing_type', listingType)
    .gte('created_at', new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: true })

  // Group by month
  const monthlyData: Record<string, { prices: number[]; count: number }> = {}

  for (const prop of data || []) {
    const date = new Date(prop.created_at)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const price = listingType === 'sale' ? prop.sale_price : prop.price

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { prices: [], count: 0 }
    }
    if (price) {
      monthlyData[monthKey].prices.push(price)
      monthlyData[monthKey].count++
    }
  }

  return Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      avgPrice: data.prices.length > 0
        ? Math.round(data.prices.reduce((a, b) => a + b, 0) / data.prices.length)
        : 0,
      count: data.count
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}
