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
          '/properties-for-rent-zimbabwe',
          '/rentals-in-harare',
          '/student-housing',
          '/rent-vs-buy',
          '/home-value',
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
