import type { GenerationContext, ProcessedAreaGuide } from '../lib/area-guide-types'
import { generateSlug } from '../lib/slug-generator'

/**
 * Template-based content generator for area guides
 * Fallback when OpenAI API is not available
 */

interface ContentTemplate {
  description: string
  sections: {
    overview: string
    location: string
    propertyTypes: string
    amenities: string
    schools: string
    transport: string
    livingCosts: string
  }
}

export function generateTemplateContent(context: GenerationContext): Pick<ProcessedAreaGuide, 'description' | 'content' | 'meta_title' | 'meta_description'> {
  const { area, marketData, nearbySchools } = context
  const { name, city, neighborhood } = area
  
  const template = buildTemplate(context)
  
  return {
    description: template.description,
    content: buildFullContent(template),
    meta_title: `${name} ${city} - Property Rentals & Sales | HUTS`,
    meta_description: template.description.substring(0, 155) + '...',
  }
}

function buildTemplate(context: GenerationContext): ContentTemplate {
  const { area, marketData, nearbySchools } = context
  const { name, city, neighborhood } = area
  
  // Description (150-250 words)
  const description = buildDescription(context)
  
  // Overview section
  const overview = `${name} is ${getAreaType(name)} in ${city}, Zimbabwe. This area offers ${getResidentialCharacter(name)} and is popular among ${getTargetDemographic(name)}. The neighborhood features ${getKeyFeatures(name)}.`
  
  // Location section
  const location = `Located in ${city}, ${name} ${getLocationContext(name, city)}. The area is ${getAccessibilityInfo(name)} and offers convenient access to ${city}'s main commercial and business districts.`
  
  // Property types
  const propertyTypes = `${name} offers a diverse range of property types including ${getPropertyTypes(name)}. ${marketData?.listing_count ? `Currently, there are approximately ${marketData.listing_count} active listings in the area.` : 'The area has a healthy property market with regular availability.'} Properties range from ${getPriceRange(marketData?.avg_price)} depending on size, condition, and specific location within the neighborhood.`
  
  // Amenities
  const amenities = `Residents of ${name} enjoy access to ${getAmenities(name)}. ${marketData?.popular_amenities?.length ? `Popular features include ${marketData.popular_amenities.join(', ')}.` : ''} The area provides essential services including supermarkets, pharmacies, and healthcare facilities.`
  
  // Schools
  const schools = nearbySchools && nearbySchools.length > 0
    ? `${name} is well-served by educational institutions. Nearby schools include ${nearbySchools.slice(0, 5).map(s => s.name).join(', ')}. Parents have access to both primary and secondary education options within reasonable commuting distance.`
    : `${name} has access to educational facilities in ${city}, with several primary and secondary schools serving the area. The neighborhood is convenient for families seeking quality education options.`
  
  // Transport
  const transport = `Transportation in ${name} is ${getTransportInfo(name)}. ${getPublicTransportInfo(city)} The area is accessible via major roads and offers ${getParkingInfo(name)}.`
  
  // Living costs
  const livingCosts = marketData?.avg_price
    ? `The average rental price in ${name} is approximately $${(marketData.avg_price / 100).toFixed(0)} per month. ${getLivingCostContext(marketData.avg_price, name)} Utility costs are typical for ${city}, with most properties offering prepaid electricity metering.`
    : `Rental prices in ${name} vary based on property size and amenities. The area offers ${getPricePositioning(name)} compared to other ${city} suburbs. Prospective tenants should budget for monthly rent, utilities, and maintenance costs.`
  
  return {
    description,
    sections: {
      overview,
      location,
      propertyTypes,
      amenities,
      schools,
      transport,
      livingCosts,
    },
  }
}

function buildDescription(context: GenerationContext): string {
  const { area, marketData, nearbySchools } = context
  const { name, city } = area
  
  const parts: string[] = []
  
  // Opening sentence
  parts.push(`${name} is ${getAreaType(name)} located in ${city}, Zimbabwe.`)
  
  // Character
  parts.push(`Known for its ${getResidentialCharacter(name)}, the area attracts ${getTargetDemographic(name)}.`)
  
  // Amenities
  parts.push(`The neighborhood features ${getKeyFeatures(name)}.`)
  
  // Market info
  if (marketData?.avg_price) {
    parts.push(`Average rental prices are around $${(marketData.avg_price / 100).toFixed(0)} per month.`)
  }
  
  // Schools
  if (nearbySchools && nearbySchools.length > 0) {
    parts.push(`Residents have access to quality schools including ${nearbySchools[0]?.name}.`)
  }
  
  // Closing
  parts.push(`${name} offers ${getLifestyleBenefit(name)} for those seeking ${getLivingStyle(name)} in ${city}.`)
  
  return parts.join(' ')
}

function buildFullContent(template: ContentTemplate): string {
  return `
## Overview

${template.sections.overview}

## Location & Accessibility

${template.sections.location}

## Property Types & Availability

${template.sections.propertyTypes}

## Amenities & Facilities

${template.sections.amenities}

## Schools & Education

${template.sections.schools}

## Transport & Connectivity

${template.sections.transport}

## Living Costs

${template.sections.livingCosts}

## Why Choose ${template.description.split(' is ')[0]}?

This area combines ${getUniqueSellingPoint(template.description.split(' is ')[0])} making it an excellent choice for renters and buyers alike. Whether you're a young professional, growing family, or investor, ${template.description.split(' is ')[0]} offers the amenities and lifestyle you're looking for.
`.trim()
}

// Helper functions for content variation

function getAreaType(name: string): string {
  const types = [
    'a vibrant residential suburb',
    'an established neighborhood',
    'a sought-after residential area',
    'a well-developed suburb',
    'a popular residential district',
  ]
  return types[Math.abs(hashString(name)) % types.length]
}

function getResidentialCharacter(name: string): string {
  const upscale = ['borrowdale', 'glen lorne', 'avondale', 'highlands', 'hillside']
  const family = ['ballantyne', 'marlborough', 'greendale', 'mount pleasant']
  const central = ['eastlea', 'alexandra park', 'milton park']
  
  const nameLower = name.toLowerCase()
  if (upscale.some(n => nameLower.includes(n))) return 'upscale properties and premium amenities'
  if (family.some(n => nameLower.includes(n))) return 'family-friendly environment and peaceful atmosphere'
  if (central.some(n => nameLower.includes(n))) return 'central location and urban convenience'
  return 'diverse community and practical living options'
}

function getTargetDemographic(name: string): string {
  const nameLower = name.toLowerCase()
  if (nameLower.includes('hatfield')) return 'students and young professionals'
  if (nameLower.includes('borrowdale') || nameLower.includes('glen lorne')) return 'executives and diplomatic staff'
  if (nameLower.includes('kuwadzana') || nameLower.includes('warren park')) return 'working families and first-time renters'
  return 'professionals, families, and long-term residents'
}

function getKeyFeatures(name: string): string {
  const features = [
    'modern shopping centers, schools, and healthcare facilities',
    'well-maintained roads, reliable utilities, and security services',
    'parks, recreational areas, and community facilities',
    'convenient access to shops, restaurants, and entertainment venues',
    'established infrastructure and community amenities',
  ]
  return features[Math.abs(hashString(name)) % features.length]
}

function getLocationContext(name: string, city: string): string {
  const nameLower = name.toLowerCase()
  if (nameLower.includes('cbd') || nameLower.includes('central')) return 'in the heart of the city'
  if (nameLower.includes('north')) return 'in the northern suburbs'
  if (nameLower.includes('east')) return 'in the eastern suburbs'
  if (nameLower.includes('chitungwiza')) return 'approximately 25km south of the city center'
  return 'within easy reach of the city center'
}

function getAccessibilityInfo(name: string): string {
  return 'easily accessible via major roads'
}

function getPropertyTypes(name: string): string {
  const nameLower = name.toLowerCase()
  if (nameLower.includes('borrowdale') || nameLower.includes('glen lorne')) {
    return 'spacious family homes, executive residences, and luxury apartments'
  }
  if (nameLower.includes('mbare') || nameLower.includes('kuwadzana')) {
    return 'affordable flats, townhouses, and shared accommodation'
  }
  return 'apartments, townhouses, and stand-alone houses'
}

function getPriceRange(avgPrice?: number): string {
  if (!avgPrice) return 'affordable to mid-range prices'
  const price = avgPrice / 100
  if (price > 800) return 'premium prices of $800 to $2,000+ per month'
  if (price > 400) return '$400 to $1,000 per month'
  return '$150 to $500 per month'
}

function getAmenities(name: string): string {
  return 'shopping centers, medical facilities, banks, and recreational amenities'
}

function getTransportInfo(name: string): string {
  return 'facilitated by both private and public transport options'
}

function getPublicTransportInfo(city: string): string {
  return 'ZUPCO buses and private commuter omnibuses serve the area regularly.'
}

function getParkingInfo(name: string): string {
  return 'adequate parking facilities for residents and visitors'
}

function getLivingCostContext(avgPrice: number, name: string): string {
  const price = avgPrice / 100
  if (price > 800) return 'This reflects the premium nature of the area and quality of facilities.'
  if (price > 400) return 'Prices are competitive given the location and amenities available.'
  return 'The area offers good value for money compared to other suburbs.'
}

function getPricePositioning(name: string): string {
  const nameLower = name.toLowerCase()
  if (nameLower.includes('borrowdale') || nameLower.includes('glen lorne')) return 'premium positioning'
  if (nameLower.includes('mbare') || nameLower.includes('kuwadzana')) return 'affordable options'
  return 'competitive pricing'
}

function getLivingStyle(name: string): string {
  const nameLower = name.toLowerCase()
  if (nameLower.includes('avondale') || nameLower.includes('borrowdale')) return 'upscale urban living'
  if (nameLower.includes('ballantyne') || nameLower.includes('greendale')) return 'peaceful suburban lifestyle'
  return 'convenient city living'
}

function getLifestyleBenefit(name: string): string {
  return 'a balanced lifestyle'
}

function getUniqueSellingPoint(name: string): string {
  return 'convenience, amenities, and community atmosphere'
}

// Simple string hash for consistent pseudo-random selection
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}
