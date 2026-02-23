/**
 * Organization structured data for the Huts brand.
 * Helps search engines understand the business and show rich results.
 */

export default function OrganizationStructuredData() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Huts',
    alternateName: "Zimbabwe's Property Marketplace",
    description:
      'Find apartments, houses, and rooms for rent or sale across Zimbabwe. Browse verified properties in Harare, Bulawayo, and beyond.',
    url: 'https://www.huts.co.zw',
    logo: 'https://www.huts.co.zw/huts-high-resolution-logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@huts.co.zw',
    },
    sameAs: [
      'https://twitter.com/huts',
      'https://www.facebook.com/huts',
      'https://www.instagram.com/huts',
    ],
    areaServed: {
      '@type': 'Country',
      name: 'Zimbabwe',
    },
    serviceType: ['Property Rental', 'Property Sales', 'Real Estate Listings'],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
    />
  )
}
