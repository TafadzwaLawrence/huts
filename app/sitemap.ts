import { MetadataRoute } from 'next'
import { createStaticClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createStaticClient()
  const baseUrl = 'https://www.huts.co.zw'

  // Fetch all active properties with error handling
  let properties: Array<{ slug: string; updated_at: string; listing_type: string | null }> = []
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('slug, updated_at, listing_type')
      .eq('status', 'active')
      .eq('verification_status', 'approved')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('[Sitemap] Properties query error:', error)
    } else {
      properties = data || []
    }
  } catch (err) {
    console.error('[Sitemap] Properties fetch exception:', err)
  }

  // Fetch all area guide pages with error handling
  let areas: Array<{ slug: string; updated_at: string }> = []
  try {
    const { data, error } = await supabase
      .from('area_guides')
      .select('slug, updated_at')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('[Sitemap] Areas query error:', error)
    } else {
      areas = data || []
    }
  } catch (err) {
    console.error('[Sitemap] Areas fetch exception:', err)
  }

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search?type=rent`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/search?type=sale`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/areas`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/student-housing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // Property routes
  const propertyRoutes: MetadataRoute.Sitemap = properties.map((property) => ({
    url: `${baseUrl}/property/${property.slug}`,
    lastModified: new Date(property.updated_at),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Area routes
  const areaRoutes: MetadataRoute.Sitemap = areas.map((area) => ({
    url: `${baseUrl}/areas/${area.slug}`,
    lastModified: new Date(area.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...propertyRoutes, ...areaRoutes]
}
