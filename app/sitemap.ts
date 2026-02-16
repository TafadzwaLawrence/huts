import { MetadataRoute } from 'next'
import { createStaticClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createStaticClient()
  const baseUrl = 'https://www.huts.co.zw'

  // Fetch all active properties
  const { data: properties } = await supabase
    .from('properties')
    .select('slug, updated_at')
    .eq('status', 'active')
    .eq('verification_status', 'approved')
    .order('updated_at', { ascending: false })

  // Fetch all area guide pages
  const { data: areas } = await supabase
    .from('areas')
    .select('slug, updated_at')
    .order('updated_at', { ascending: false })

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
      url: `${baseUrl}/areas`,
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
  const propertyRoutes: MetadataRoute.Sitemap = (properties || []).map((property) => ({
    url: `${baseUrl}/property/${property.slug}`,
    lastModified: new Date(property.updated_at),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Area routes
  const areaRoutes: MetadataRoute.Sitemap = (areas || []).map((area) => ({
    url: `${baseUrl}/areas/${area.slug}`,
    lastModified: new Date(area.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...propertyRoutes, ...areaRoutes]
}
