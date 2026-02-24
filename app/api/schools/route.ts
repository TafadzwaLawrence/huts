import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'edge'

/**
 * GET /api/schools
 * Fetch schools within map bounds, optionally filtered by school level
 * Query params:
 * - north, south, east, west: map bounds
 * - level: comma-separated list of school levels (primary,secondary,tertiary,combined)
 * - city: filter by city
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const north = searchParams.get('north')
    const south = searchParams.get('south')
    const east = searchParams.get('east')
    const west = searchParams.get('west')
    const levelParam = searchParams.get('level') // e.g., "primary,secondary"
    const city = searchParams.get('city')

    const supabase = await createClient()

    let query = supabase
      .from('schools')
      .select('id, name, school_level, school_type, address, city, lat, lng, rating, phone, website')

    // Filter by bounds if provided
    if (north && south && east && west) {
      const northNum = parseFloat(north)
      const southNum = parseFloat(south)
      const eastNum = parseFloat(east)
      const westNum = parseFloat(west)

      query = query
        .gte('lat', southNum)
        .lte('lat', northNum)
        .gte('lng', westNum)
        .lte('lng', eastNum)
    }

    // Filter by school level
    if (levelParam) {
      const levels = levelParam.split(',').filter(Boolean)
      if (levels.length > 0) {
        query = query.in('school_level', levels)
      }
    }

    // Filter by city
    if (city) {
      query = query.eq('city', city)
    }

    // Order by name
    query = query.order('name', { ascending: true })

    // Limit to 500 schools max
    query = query.limit(500)

    const { data: schools, error } = await query

    if (error) {
      console.error ('[Schools API] Error:', error)
      return NextResponse.json({ error: 'Failed to fetch schools' }, { status: 500 })
    }

    return NextResponse.json({
      schools: schools || [],
      count: schools?.length || 0,
    })
  } catch (error) {
    console.error('[Schools API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
