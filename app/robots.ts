import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/search',
          '/search?*',
          '/property/',
          '/areas/',
          '/student-housing',
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
          '/admin/',
          '/uploadthing/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/auth/',
          '/settings/',
          '/admin/',
        ],
      },
    ],
    sitemap: 'https://www.huts.co.zw/sitemap.xml',
    host: 'https://www.huts.co.zw',
  }
}
