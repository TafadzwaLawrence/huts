/**
 * Type definitions for area guide data collection pipeline
 */

export interface RawAreaData {
  name: string
  city: string
  neighborhood?: string
  priority?: number
}

export interface ScrapedMarketData {
  avg_price?: number
  listing_count?: number
  popular_amenities?: string[]
  last_updated: Date
}

export interface NearbySchool {
  name: string
  level: 'primary' | 'secondary' | 'tertiary' | 'combined'
  distance_km?: number
}

export interface ProcessedAreaGuide {
  slug: string
  name: string
  city: string
  neighborhood?: string | null
  description: string
  content: string
  meta_title: string
  meta_description: string
  avg_rent?: number | null
  property_count?: number
  bounds_ne_lat?: number | null
  bounds_ne_lng?: number | null
  bounds_sw_lat?: number | null
  bounds_sw_lng?: number | null
}

export interface InsertResult {
  inserted: number
  failed: Array<{
    area: ProcessedAreaGuide
    error: string
  }>
  skipped: number
}

export interface GenerationContext {
  area: RawAreaData
  marketData?: ScrapedMarketData
  nearbySchools?: NearbySchool[]
}
