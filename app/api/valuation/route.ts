import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address') || ''
  const city = searchParams.get('city') || 'Harare'

  if (!address.trim()) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  try {
    const supabase = await createClient()

    // Find comparable properties in the same city/neighborhood
    let query = supabase
      .from('properties')
      .select(`
        id, title, slug, price, sale_price, sqft, beds, baths,
        neighborhood, city, listing_type, property_type,
        property_images(url, is_primary)
      `)
      .eq('status', 'active')
      .eq('city', city)
      .limit(50)

    // Try to match neighborhood
    if (address.length > 2) {
      query = query.ilike('neighborhood', `%${address}%`)
    }

    const { data: comparables, error } = await query

    if (error) throw error

    // If no neighborhood match, broaden to city
    let allComparables = comparables || []
    if (allComparables.length < 3) {
      const { data: cityComps } = await supabase
        .from('properties')
        .select(`
          id, title, slug, price, sale_price, sqft, beds, baths,
          neighborhood, city, listing_type, property_type,
          property_images(url, is_primary)
        `)
        .eq('status', 'active')
        .eq('city', city)
        .limit(30)

      allComparables = cityComps || []
    }

    if (allComparables.length === 0) {
      return NextResponse.json({
        error: 'No comparable properties found in this area'
      }, { status: 404 })
    }

    // Calculate market stats
    const prices = allComparables.map(p =>
      p.listing_type === 'sale' ? (p.sale_price || p.price || 0) : (p.price || 0)
    ).filter(p => p > 0)

    const sqftPrices = allComparables
      .filter(p => p.sqft && p.sqft > 0)
      .map(p => {
        const price = p.listing_type === 'sale' ? (p.sale_price || p.price || 0) : (p.price || 0)
        return price / (p.sqft || 1)
      })

    const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
    const median = (arr: number[]) => {
      if (!arr.length) return 0
      const sorted = [...arr].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
    }

    const avgPrice = Math.round(avg(prices))
    const medianPrice = Math.round(median(prices))
    const avgSqftPrice = Math.round(avg(sqftPrices))

    // Estimated value = median of comparables
    const estimatedValue = medianPrice

    // Confidence based on number of comparables
    const confidence = allComparables.length >= 10 ? 'high' : allComparables.length >= 5 ? 'medium' : 'low'

    // Format comparables for response
    const formattedComparables = allComparables.slice(0, 9).map(comp => {
      const imgs = (comp.property_images as Array<{ url: string; is_primary: boolean }>) || []
      const primary = imgs.find(i => i.is_primary) || imgs[0]
      return {
        id: comp.id,
        title: comp.title,
        slug: comp.slug,
        price: comp.price || 0,
        sale_price: comp.sale_price,
        sqft: comp.sqft,
        beds: comp.beds,
        baths: comp.baths,
        neighborhood: comp.neighborhood || city,
        listing_type: comp.listing_type,
        primary_image: primary?.url || null,
      }
    })

    return NextResponse.json({
      estimated_value: estimatedValue,
      price_per_sqft: avgSqftPrice,
      comparable_count: allComparables.length,
      confidence,
      comparables: formattedComparables,
      market_stats: {
        avg_price: avgPrice,
        median_price: medianPrice,
        total_listings: allComparables.length,
        avg_sqft_price: avgSqftPrice,
      },
    })
  } catch (error) {
    console.error('[Valuation] error:', error)
    return NextResponse.json({ error: 'Failed to get valuation' }, { status: 500 })
  }
}
