import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/search',
          '/property',
          '/areas',
          '/properties-for-rent-zimbabwe',
          '/rentals-in-harare',
          '/student-housing',
          '/rent-vs-buy',
          '/home-value',
          '/about',
          '/contact',
          '/help',
          '/pricing',
          '/privacy',
          '/terms',
          '/blog',
          '/guides',
          '/faq',
        ],
        disallow: [
          '/dashboard/',
          '/api/',
          '/auth/',
          '/settings/',
          '/admin/',
          '/uploadthing/',
          '/_next/',
          '/*?*sort=*',      // Block sorting params
          '/*?*page=*',      // Block pagination params
          '/*?*filter=*',    // Block filter params
        ],
      },
    ],
    sitemap: 'https://www.huts.co.zw/sitemap.xml',
  }
}