import { createClient } from '@supabase/supabase-js'
import { config } from '../config'
import type { Database } from '../../types/database'

/**
 * Admin Supabase client with service role key
 * Bypasses RLS policies for data insertion
 * 
 * ⚠️ SECURITY: Only use in trusted server-side scripts
 */
export function createAdminClient() {
  return createClient<Database>(
    config.supabase.url,
    config.supabase.serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

/**
 * Query existing area guide slugs to prevent duplicates
 */
export async function getExistingSlugs(): Promise<Set<string>> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('area_guides')
    .select('slug') as any
  
  if (error) {
    console.error('Error fetching existing slugs:', error)
    return new Set()
  }
  
  return new Set(data?.map((row: any) => row.slug) || [])
}

/**
 * Get distinct cities and neighborhoods from properties table
 */
export async function getExistingAreas(): Promise<Array<{ city: string; neighborhood: string | null }>> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('properties')
    .select('city, neighborhood')
    .eq('status', 'active')
    .not('neighborhood', 'is', null) as any
  
  if (error) {
    console.error('Error fetching areas from properties:', error)
    return []
  }
  
  // Deduplicate
  const uniqueAreas = new Map<string, Set<string>>()
  
  data?.forEach(({ city, neighborhood }: any) => {
    if (!city || !neighborhood) return
    
    const normalizedCity = city.trim()
    const normalizedNeighborhood = neighborhood.trim()
    
    if (!uniqueAreas.has(normalizedCity)) {
      uniqueAreas.set(normalizedCity, new Set())
    }
    uniqueAreas.get(normalizedCity)!.add(normalizedNeighborhood)
  })
  
  // Flatten to array
  const result: Array<{ city: string; neighborhood: string | null }> = []
  uniqueAreas.forEach((neighborhoods, city) => {
    neighborhoods.forEach(neighborhood => {
      result.push({ city, neighborhood })
    })
  })
  
  return result
}

/**
 * Query schools near an area (simplified - just by city for now)
 */
export async function getNearbySchools(city: string): Promise<Array<{
  name: string
  school_level: string
  address?: string
}>> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('schools')
    .select('name, school_level, address')
    .eq('city', city)
    .limit(10)
  
  if (error) {
    console.error(`Error fetching schools for ${city}:`, error)
    return []
  }
  
  return data || []
}
