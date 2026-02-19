import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getPriceTrends } from '@/lib/analysis'

export const dynamic = 'force-dynamic'

/**
 * Market analytics API - public endpoint for area/market data
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const listingType = (searchParams.get('type') as 'rent' | 'sale') || 'rent'
    const months = parseInt(searchParams.get('months') || '6')

    if (!city) {
      return NextResponse.json(
        { error: 'City parameter is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get market overview
    const { data: activeListings, count } = await supabase
      .from('properties')
      .select('price, sale_price, beds, baths, sqft, property_type, neighborhood', { count: 'exact' })
      .eq('city', city)
      .eq('listing_type', listingType)
      .eq('status', 'active')

    if (!activeListings || activeListings.length === 0) {
      return NextResponse.json({
        city,
        listingType,
        totalListings: 0,
        averagePrice: 0,
        medianPrice: 0,
        priceRange: { min: 0, max: 0 },
        byBedrooms: {},
        byPropertyType: {},
        popularNeighborhoods: [],
        priceTrends: []
      })
    }

    // Get prices
    const prices = activeListings
      .map(p => listingType === 'sale' ? p.sale_price : p.price)
      .filter((p): p is number => p !== null && p > 0)
      .sort((a, b) => a - b)

    const averagePrice = prices.length > 0
      ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
      : 0

    const medianPrice = prices.length > 0
      ? prices[Math.floor(prices.length / 2)]
      : 0

    // Group by bedrooms
    const byBedrooms: Record<string, { count: number; avgPrice: number }> = {}
    const bedroomGroups: Record<string, number[]> = {}
    
    for (const listing of activeListings) {
      const beds = listing.beds.toString()
      const price = listingType === 'sale' ? listing.sale_price : listing.price
      if (!bedroomGroups[beds]) bedroomGroups[beds] = []
      if (price) bedroomGroups[beds].push(price)
    }

    for (const [beds, bedPrices] of Object.entries(bedroomGroups)) {
      byBedrooms[beds] = {
        count: bedPrices.length,
        avgPrice: bedPrices.length > 0
          ? Math.round(bedPrices.reduce((a, b) => a + b, 0) / bedPrices.length)
          : 0
      }
    }

    // Group by property type
    const byPropertyType: Record<string, { count: number; avgPrice: number }> = {}
    const typeGroups: Record<string, number[]> = {}
    
    for (const listing of activeListings) {
      const type = listing.property_type
      const price = listingType === 'sale' ? listing.sale_price : listing.price
      if (!typeGroups[type]) typeGroups[type] = []
      if (price) typeGroups[type].push(price)
    }

    for (const [type, typePrices] of Object.entries(typeGroups)) {
      byPropertyType[type] = {
        count: typePrices.length,
        avgPrice: typePrices.length > 0
          ? Math.round(typePrices.reduce((a, b) => a + b, 0) / typePrices.length)
          : 0
      }
    }

    // Popular neighborhoods
    const neighborhoodCounts: Record<string, number> = {}
    for (const listing of activeListings) {
      if (listing.neighborhood) {
        neighborhoodCounts[listing.neighborhood] = (neighborhoodCounts[listing.neighborhood] || 0) + 1
      }
    }
    const popularNeighborhoods = Object.entries(neighborhoodCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    // Price trends
    const priceTrends = await getPriceTrends(city, listingType, months)

    // Average sqft
    const sqftValues = activeListings
      .map(p => p.sqft)
      .filter((s): s is number => s !== null && s > 0)
    const avgSqft = sqftValues.length > 0
      ? Math.round(sqftValues.reduce((a, b) => a + b, 0) / sqftValues.length)
      : null

    // Price per sqft
    const pricePerSqft = avgSqft && averagePrice > 0
      ? Math.round(averagePrice / avgSqft)
      : null

    return NextResponse.json({
      city,
      listingType,
      totalListings: count || 0,
      averagePrice,
      medianPrice,
      priceRange: {
        min: prices[0] || 0,
        max: prices[prices.length - 1] || 0
      },
      avgSquareFootage: avgSqft,
      avgPricePerSqft: pricePerSqft,
      byBedrooms,
      byPropertyType,
      popularNeighborhoods,
      priceTrends
    })
  } catch (error: any) {
    console.error('Market analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    )
  }
}
