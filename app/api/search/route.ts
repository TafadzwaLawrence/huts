import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VALID_SORT_OPTIONS = ['newest', 'price_asc', 'price_desc', 'beds_desc', 'baths_desc', 'sqft_desc'] as const
type SortOption = typeof VALID_SORT_OPTIONS[number]

const PAGE_SIZE = 40

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const supabase = await createClient()

  // Parse parameters
  const q = params.get('q')?.trim() || ''
  const listingType = params.get('type') as 'rent' | 'sale' | null
  const propertyType = params.get('propertyType') || ''
  const minPrice = parseInt(params.get('minPrice') || '0') || 0
  const maxPrice = parseInt(params.get('maxPrice') || '0') || 0
  const beds = parseInt(params.get('beds') || '0') || 0
  const baths = parseInt(params.get('baths') || '0') || 0
  const minSqft = parseInt(params.get('minSqft') || '0') || 0
  const maxSqft = parseInt(params.get('maxSqft') || '0') || 0
  const city = params.get('city')?.trim() || ''
  const neighborhood = params.get('neighborhood')?.trim() || ''
  const student = params.get('student') === '1'
  const sort = (params.get('sort') as SortOption) || 'newest'
  const page = Math.max(1, parseInt(params.get('page') || '1') || 1)

  // Map viewport bounds
  const north = parseFloat(params.get('north') || '') || null
  const south = parseFloat(params.get('south') || '') || null
  const east = parseFloat(params.get('east') || '') || null
  const west = parseFloat(params.get('west') || '') || null

  // Start building query
  let query = supabase
    .from('properties')
    .select(`
      id,
      title,
      slug,
      listing_type,
      price,
      sale_price,
      beds,
      baths,
      sqft,
      city,
      neighborhood,
      property_type,
      lat,
      lng,
      parking_spaces,
      created_at,
      property_images(url, is_primary, alt_text)
    `, { count: 'exact' })
    .eq('status', 'active')
    .eq('verification_status', 'approved')

  // Listing type filter
  if (listingType === 'rent' || listingType === 'sale') {
    query = query.eq('listing_type', listingType)
  }

  // Text search
  if (q) {
    query = query.or(`title.ilike.%${q}%,city.ilike.%${q}%,neighborhood.ilike.%${q}%`)
  }

  // Property type filter
  if (propertyType && propertyType !== 'all') {
    query = query.eq('property_type', propertyType)
  }

  // Student housing filter
  if (student) {
    query = query.eq('property_type', 'student')
  }

  // Price filters (convert dollars to cents)
  if (minPrice > 0) {
    const minCents = minPrice * 100
    if (listingType === 'sale') {
      query = query.gte('sale_price', minCents)
    } else {
      query = query.gte('price', minCents)
    }
  }
  if (maxPrice > 0) {
    const maxCents = maxPrice * 100
    if (listingType === 'sale') {
      query = query.lte('sale_price', maxCents)
    } else {
      query = query.lte('price', maxCents)
    }
  }

  // Bedroom/bathroom filters
  if (beds > 0) {
    query = query.gte('beds', beds)
  }
  if (baths > 0) {
    query = query.gte('baths', baths)
  }

  // Sqft filters
  if (minSqft > 0) {
    query = query.gte('sqft', minSqft)
  }
  if (maxSqft > 0) {
    query = query.lte('sqft', maxSqft)
  }

  // Location filters
  if (city) {
    query = query.ilike('city', `%${city}%`)
  }
  if (neighborhood) {
    query = query.ilike('neighborhood', `%${neighborhood}%`)
  }

  // Map viewport bounds
  if (north !== null && south !== null && east !== null && west !== null) {
    query = query
      .gte('lat', south)
      .lte('lat', north)
      .gte('lng', west)
      .lte('lng', east)
      .not('lat', 'is', null)
      .not('lng', 'is', null)
  }

  // Sorting
  if (VALID_SORT_OPTIONS.includes(sort)) {
    switch (sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'price_asc':
        if (listingType === 'sale') {
          query = query.order('sale_price', { ascending: true, nullsFirst: false })
        } else {
          query = query.order('price', { ascending: true, nullsFirst: false })
        }
        break
      case 'price_desc':
        if (listingType === 'sale') {
          query = query.order('sale_price', { ascending: false, nullsFirst: false })
        } else {
          query = query.order('price', { ascending: false, nullsFirst: false })
        }
        break
      case 'beds_desc':
        query = query.order('beds', { ascending: false })
        break
      case 'baths_desc':
        query = query.order('baths', { ascending: false })
        break
      case 'sqft_desc':
        query = query.order('sqft', { ascending: false, nullsFirst: false })
        break
    }
  } else {
    query = query.order('created_at', { ascending: false })
  }

  // Pagination
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error('[Search] error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }

  return NextResponse.json({
    properties: data || [],
    total: count || 0,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil((count || 0) / PAGE_SIZE),
  })
}
