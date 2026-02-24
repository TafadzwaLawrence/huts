/**
 * JSON-LD structured data for property listings.
 * Helps Google understand property details for rich search results.
 * https://developers.google.com/search/docs/appearance/structured-data/home-activities
 */

import type { Property } from '@/types'

interface PropertyStructuredDataProps {
  property: Property & {
    property_images?: { url: string }[]
    profiles?: { name: string; phone?: string; email?: string }
  }
  slug: string
}

export default function PropertyStructuredData({
  property,
  slug,
}: PropertyStructuredDataProps) {
  const isRental = property.listing_type === 'rent' || (!property.listing_type && property.price)
  const isSale = property.listing_type === 'sale' || property.sale_price

  // Base schema for both rental and sale
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': isSale ? 'SingleFamilyResidence' : 'Accommodation',
    name: property.title,
    description: property.description || `${property.beds} bedroom, ${property.baths} bathroom ${property.property_type || 'property'} in ${property.city}, Zimbabwe`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.city,
      addressRegion: property.neighborhood || property.city,
      addressCountry: 'ZW',
    },
    numberOfRooms: property.beds,
    numberOfBathroomsTotal: property.baths,
    floorSize: property.sqft
      ? {
          '@type': 'QuantitativeValue',
          value: property.sqft,
          unitCode: 'FTK', // square feet
        }
      : undefined,
    image: property.property_images?.map((img: any) => img.url) || [],
    url: `https://www.huts.co.zw/property/${slug}`,
  }

  // Rental-specific schema
  if (isRental) {
    const amenitiesArray = Array.isArray(property.amenities) 
      ? property.amenities as string[]
      : []

    const rentalSchema = {
      ...baseSchema,
      offers: {
        '@type': 'Offer',
        price: property.price,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: property.price,
          priceCurrency: 'USD',
          unitText: 'MONTH',
        },
        seller: property.profiles
          ? {
              '@type': 'Person',
              name: property.profiles.name,
              telephone: property.profiles.phone,
              email: property.profiles.email,
            }
          : undefined,
      },
      amenityFeature: amenitiesArray.map((amenity: string) => ({
        '@type': 'LocationFeatureSpecification',
        name: amenity,
      })),
    }

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(rentalSchema) }}
      />
    )
  }

  // Sale-specific schema
  if (isSale) {
    const amenitiesArray = Array.isArray(property.amenities) 
      ? property.amenities as string[]
      : []

    const saleSchema = {
      ...baseSchema,
      offers: {
        '@type': 'Offer',
        price: property.sale_price,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        seller: property.profiles
          ? {
              '@type': 'Person',
              name: property.profiles.name,
              telephone: property.profiles.phone,
              email: property.profiles.email,
            }
          : undefined,
      },
      amenityFeature: amenitiesArray.map((amenity: string) => ({
        '@type': 'LocationFeatureSpecification',
        name: amenity,
      })),
    }

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(saleSchema) }}
      />
    )
  }

  return null
}
