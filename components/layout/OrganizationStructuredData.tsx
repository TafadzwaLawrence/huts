import { SOCIAL_LINKS } from '@/lib/constants'

/**
 * Organization + LocalBusiness structured data for the Huts brand.
 * Helps search engines understand the business and show rich results.
 */

export default function OrganizationStructuredData() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://www.huts.co.zw/#organization',
        name: 'Huts',
        alternateName: "Zimbabwe's Property Marketplace",
        description:
          'Find apartments, houses, and rooms for rent or sale across Zimbabwe. Browse verified properties in Harare, Bulawayo, and beyond.',
        url: 'https://www.huts.co.zw',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.huts.co.zw/huts-high-resolution-logo.png',
          width: 512,
          height: 512,
        },
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: 'support@huts.co.zw',
        },
        sameAs: [
          SOCIAL_LINKS.twitter,
          SOCIAL_LINKS.facebook,
          SOCIAL_LINKS.instagram,
          SOCIAL_LINKS.linkedin,
          SOCIAL_LINKS.youtube,
        ],
        areaServed: {
          '@type': 'Country',
          name: 'Zimbabwe',
        },
      },
      {
        '@type': 'RealEstateAgent',
        '@id': 'https://www.huts.co.zw/#localbusiness',
        name: 'Huts',
        description:
          'Zimbabwe\'s leading property marketplace for rentals and sales. Find verified apartments, houses, and rooms in Harare, Bulawayo, Gweru and beyond.',
        url: 'https://www.huts.co.zw',
        logo: 'https://www.huts.co.zw/huts-high-resolution-logo.png',
        image: 'https://www.huts.co.zw/huts-high-resolution-logo.png',
        email: 'support@huts.co.zw',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Harare',
          addressCountry: 'ZW',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: -17.8252,
          longitude: 31.0335,
        },
        areaServed: [
          { '@type': 'City', name: 'Harare' },
          { '@type': 'City', name: 'Bulawayo' },
          { '@type': 'City', name: 'Gweru' },
          { '@type': 'City', name: 'Mutare' },
          { '@type': 'Country', name: 'Zimbabwe' },
        ],
        priceRange: '$$',
        openingHours: 'Mo-Su 00:00-23:59',
        hasMap: 'https://www.google.com/maps/place/Harare,+Zimbabwe',
        sameAs: [
          SOCIAL_LINKS.twitter,
          SOCIAL_LINKS.facebook,
          SOCIAL_LINKS.instagram,
          SOCIAL_LINKS.linkedin,
          SOCIAL_LINKS.youtube,
        ],
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
