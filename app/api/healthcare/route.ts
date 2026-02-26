import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'edge'

/**
 * GET /api/healthcare
 * Fetch healthcare facilities within map bounds, optionally filtered by facility type
 * Query params:
 * - north, south, east, west: map bounds
 * - type: comma-separated list of facility types
 * - province: filter by province
 * - district: filter by district
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const north = searchParams.get('north')
    const south = searchParams.get('south')
    const east = searchParams.get('east')
    const west = searchParams.get('west')
    const typeParam = searchParams.get('type')
    const province = searchParams.get('province')
    const district = searchParams.get('district')

    const supabase = await createClient()

    let query = supabase
      .from('healthcare_facilities')
      .select('id, name, facility_type, province, district, latitude, longitude, year_built')

    // Filter by bounds if provided
    if (north && south && east && west) {
      const northNum = parseFloat(north)
      const southNum = parseFloat(south)
      const eastNum = parseFloat(east)
      const westNum = parseFloat(west)

      query = query
        .gte('latitude', southNum)
        .lte('latitude', northNum)
        .gte('longitude', westNum)
        .lte('longitude', eastNum)
    }

    // Filter by facility type
    if (typeParam) {
      const types = typeParam.split(',').filter(Boolean)
      if (types.length > 0) {
        query = query.in('facility_type', types)
      }
    }

    // Filter by province
    if (province) {
      query = query.eq('province', province)
    }

    // Filter by district
    if (district) {
      query = query.eq('district', district)
    }

    // Order by name
    query = query.order('name', { ascending: true })

    // Limit to 500 facilities max to avoid performance issues
    query = query.limit(500)

    const { data: facilities, error } = await query

    if (error) {
      console.error('[Healthcare API] Error:', error)
      return NextResponse.json({ error: 'Failed to fetch healthcare facilities' }, { status: 500 })
    }

    return NextResponse.json({
      facilities: facilities || [],
      count: facilities?.length || 0,
    })
  } catch (error) {
    console.error('[Healthcare API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
