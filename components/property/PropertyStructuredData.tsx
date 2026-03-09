/**
 * JSON-LD structured data for property listings.
 * Uses @graph to combine residence + offer schemas — the pattern Google recommends
 * for real estate listings to enable rich results with price, beds, baths.
 * https://schema.org/Accommodation  https://schema.org/SingleFamilyResidence
 */

import type { Property } from '@/types'

interface PropertyStructuredDataProps {
  property: Property & {
    property_images?: { url: string }[]
    profiles?: { name: string; phone?: string; email?: string }
  }
  slug: string
}

/** Map Huts property_type values to specific schema.org types */
function toSchemaType(propertyType: string | null | undefined, isSale: boolean): string {
  const map: Record<string, string> = {
    apartment: 'Apartment',
    flat: 'Apartment',
    studio: 'Apartment',
    house: 'SingleFamilyResidence',
    villa: 'SingleFamilyResidence',
    cottage: 'House',
    townhouse: 'Townhouse',
    room: 'Room',
  }
  const key = propertyType?.toLowerCase() ?? ''
  return map[key] ?? (isSale ? 'SingleFamilyResidence' : 'Accommodation')
}

export default function PropertyStructuredData({
  property,
  slug,
}: PropertyStructuredDataProps) {
  const isRental = property.listing_type === 'rent' || (!property.listing_type && property.price)
  const isSale = property.listing_type === 'sale' || property.sale_price
  const schemaType = toSchemaType(property.property_type, !!isSale)
  const propertyUrl = `https://www.huts.co.zw/property/${slug}`
  const images = property.property_images?.map((img: any) => img.url) ?? []
  const description =
    property.description ||
    `${property.beds} bedroom, ${property.baths} bathroom ${property.property_type || 'property'} in ${property.city}, Zimbabwe`

  // Shared address
  const address = {
    '@type': 'PostalAddress',
    addressLocality: property.city,
    addressRegion: property.neighborhood || property.city,
    addressCountry: 'ZW',
  }

  // Base residence entity (common to both listing types)
  const residenceEntity = {
    '@type': schemaType,
    '@id': `${propertyUrl}#property`,
    name: property.title,
    description,
    url: propertyUrl,
    address,
    numberOfBedrooms: property.beds,
    numberOfBathroomsTotal: property.baths,
    ...(property.sqft
      ? {
          floorSize: {
            '@type': 'QuantitativeValue',
            value: property.sqft,
            unitCode: 'FTK',
          },
        }
      : {}),
    ...(images.length ? { image: images } : {}),
  }

  const amenitiesArray = Array.isArray(property.amenities)
    ? (property.amenities as string[])
    : []

  const sellerEntity = property.profiles
    ? {
        '@type': 'Person',
        name: property.profiles.name,
        telephone: property.profiles.phone,
        email: property.profiles.email,
      }
    : undefined

  // Rental-specific schema
  if (isRental) {
    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          ...residenceEntity,
          amenityFeature: amenitiesArray.map((a: string) => ({
            '@type': 'LocationFeatureSpecification',
            name: a,
          })),
        },
        {
          '@type': 'Offer',
          '@id': `${propertyUrl}#offer`,
          itemOffered: { '@id': `${propertyUrl}#property` },
          price: property.price,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: property.price,
            priceCurrency: 'USD',
            unitText: 'MONTH',
          },
          ...(sellerEntity ? { seller: sellerEntity } : {}),
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

  // Sale-specific schema
  if (isSale) {
    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          ...residenceEntity,
          amenityFeature: amenitiesArray.map((a: string) => ({
            '@type': 'LocationFeatureSpecification',
            name: a,
          })),
        },
        {
          '@type': 'Offer',
          '@id': `${propertyUrl}#offer`,
          itemOffered: { '@id': `${propertyUrl}#property` },
          price: property.sale_price,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          ...(sellerEntity ? { seller: sellerEntity } : {}),
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

  return null
}
