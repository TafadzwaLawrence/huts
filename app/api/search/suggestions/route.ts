import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] })
  }

  const supabase = await createClient()
  const searchTerm = `%${q}%`

  // Query cities, neighborhoods, and property titles in parallel
  const [
    { data: cities },
    { data: neighborhoods },
    { data: properties }
  ] = await Promise.all([
    supabase
      .from('properties')
      .select('city')
      .eq('status', 'active')
      .eq('verification_status', 'approved')
      .ilike('city', searchTerm)
      .limit(20),

    supabase
      .from('properties')
      .select('neighborhood, city')
      .eq('status', 'active')
      .eq('verification_status', 'approved')
      .not('neighborhood', 'is', null)
      .ilike('neighborhood', searchTerm)
      .limit(20),

    supabase
      .from('properties')
      .select('id, title, slug, city, neighborhood, listing_type')
      .eq('status', 'active')
      .eq('verification_status', 'approved')
      .ilike('title', searchTerm)
      .limit(5),
  ])

  // Deduplicate cities
  const citySet = new Set(cities?.map(c => c.city) || [])
  const uniqueCities = Array.from(citySet)
    .slice(0, 5)
    .map(city => ({ type: 'city' as const, label: city, value: city }))

  // Deduplicate neighborhoods
  const seen = new Set<string>()
  const uniqueNeighborhoods = (neighborhoods || [])
    .filter(n => {
      const key = n.neighborhood
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 5)
    .map(n => ({
      type: 'neighborhood' as const,
      label: `${n.neighborhood}, ${n.city}`,
      value: n.neighborhood,
      city: n.city,
    }))

  // Property results
  const propertyResults = (properties || []).map(p => ({
    type: 'property' as const,
    label: p.title,
    value: p.slug || p.id,
    city: p.city,
    neighborhood: p.neighborhood,
    listing_type: p.listing_type,
  }))

  const suggestions = [
    ...uniqueCities,
    ...uniqueNeighborhoods,
    ...propertyResults,
  ]

  return NextResponse.json({ suggestions })
}
