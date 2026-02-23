import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    const city = searchParams.get('city')
    const listingType = searchParams.get('listingType')
    const price = searchParams.get('price')
    const salePrice = searchParams.get('salePrice')
    const beds = searchParams.get('beds')

    if (!propertyId || !city) {
      return NextResponse.json({ error: 'Missing required params' }, { status: 400 })
    }

    const supabase = await createClient()

    let query = supabase
      .from('properties')
      .select('id, title, slug, price, sale_price, listing_type, beds, baths, sqft, city, neighborhood, property_images(url, is_primary)')
      .eq('status', 'active')
      .eq('verification_status', 'approved')
      .neq('id', propertyId)
      .eq('city', city)
      .limit(8)

    if (listingType) {
      query = query.eq('listing_type', listingType)
    }

    // Price range filtering: ±40% of the original price
    if (listingType === 'sale' && salePrice) {
      const p = parseInt(salePrice)
      query = query
        .gte('sale_price', Math.round(p * 0.6))
        .lte('sale_price', Math.round(p * 1.4))
    } else if (price) {
      const p = parseInt(price)
      query = query
        .gte('price', Math.round(p * 0.6))
        .lte('price', Math.round(p * 1.4))
    }

    // Same bedroom count ±1
    if (beds) {
      const b = parseInt(beds)
      query = query
        .gte('beds', Math.max(1, b - 1))
        .lte('beds', b + 1)
    }

    const { data: properties, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ properties: properties || [] })
  } catch (error) {
    console.error('[Similar Properties] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
