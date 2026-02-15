import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/search',
          '/property/',
          '/areas/',
          '/contact',
          '/help',
          '/pricing',
          '/privacy',
          '/terms',
        ],
        disallow: [
          '/dashboard/',
          '/api/',
          '/auth/',
          '/settings/',
          '/uploadthing/',
        ],
      },
    ],
    sitemap: 'https://www.huts.co.zw/sitemap.xml',
  }
}
