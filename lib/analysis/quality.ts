import { createClient } from '@/lib/supabase/server'

export interface QualityBreakdown {
  score: number
  max: number
  feedback: string
}

export interface QualityScore {
  overall: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  breakdown: {
    photos: QualityBreakdown
    description: QualityBreakdown
    details: QualityBreakdown
    pricing: QualityBreakdown
    amenities: QualityBreakdown
  }
  improvements: Array<{
    priority: 'high' | 'medium' | 'low'
    suggestion: string
    impact: string
  }>
  completeness: number
}

/**
 * Calculate comprehensive listing quality score
 */
export async function calculateListingQuality(propertyId: string): Promise<QualityScore> {
  const supabase = await createClient()

  const [propertyResult, imagesResult] = await Promise.all([
    supabase.from('properties').select('*').eq('id', propertyId).single(),
    supabase.from('property_images').select('id, is_primary').eq('property_id', propertyId)
  ])

  const property = propertyResult.data
  if (!property) throw new Error('Property not found')

  const images = imagesResult.data || []
  const improvements: QualityScore['improvements'] = []

  // ============ PHOTOS (max 25 points) ============
  let photoScore = 0
  const imageCount = images.length
  const hasPrimary = images.some(img => img.is_primary)

  if (imageCount >= 10) {
    photoScore = 25
  } else if (imageCount >= 7) {
    photoScore = 22
  } else if (imageCount >= 5) {
    photoScore = 18
  } else if (imageCount >= 3) {
    photoScore = 12
  } else if (imageCount >= 1) {
    photoScore = 6
  }

  if (!hasPrimary && imageCount > 0) {
    photoScore -= 2
  }

  if (imageCount < 5) {
    improvements.push({
      priority: 'high',
      suggestion: `Add ${5 - imageCount} more photos`,
      impact: 'Properties with 5+ photos get 3x more inquiries'
    })
  }
  if (imageCount > 0 && imageCount < 10) {
    improvements.push({
      priority: 'medium',
      suggestion: 'Add more photos showing different rooms and angles',
      impact: 'Comprehensive photo sets build trust with renters'
    })
  }

  // ============ DESCRIPTION (max 25 points) ============
  let descScore = 0
  const description = property.description || ''
  const descLength = description.length
  const wordCount = description.split(/\s+/).filter(Boolean).length

  if (descLength >= 500 && wordCount >= 80) {
    descScore = 25
  } else if (descLength >= 350) {
    descScore = 20
  } else if (descLength >= 200) {
    descScore = 15
  } else if (descLength >= 100) {
    descScore = 10
  } else if (descLength >= 50) {
    descScore = 5
  }

  // Check for key phrases
  const hasKeyFeatures = /feature|highlight|include|offer|enjoy/i.test(description)
  const hasLocation = /located|near|close to|walking|minutes/i.test(description)
  const hasCallToAction = /contact|schedule|viewing|tour|inquire/i.test(description)

  if (hasKeyFeatures) descScore = Math.min(25, descScore + 1)
  if (hasLocation) descScore = Math.min(25, descScore + 1)
  if (hasCallToAction) descScore = Math.min(25, descScore + 1)

  if (descLength < 300) {
    improvements.push({
      priority: 'high',
      suggestion: 'Write a more detailed description (300+ characters)',
      impact: 'Detailed descriptions reduce unnecessary inquiries'
    })
  }
  if (!hasLocation) {
    improvements.push({
      priority: 'medium',
      suggestion: 'Add nearby landmarks, transport, and amenities to description',
      impact: 'Location context helps renters visualize the area'
    })
  }

  // ============ DETAILS (max 20 points) ============
  let detailScore = 0
  const detailChecks = [
    { field: property.sqft, points: 4, name: 'square footage' },
    { field: property.neighborhood, points: 4, name: 'neighborhood' },
    { field: property.available_from, points: 3, name: 'availability date' },
    { field: property.year_built, points: 3, name: 'year built' },
    { field: property.lot_size_sqft, points: 3, name: 'lot size' },
    { field: property.parking_spaces !== null, points: 3, name: 'parking info' }
  ]

  const missingDetails: string[] = []
  for (const check of detailChecks) {
    if (check.field) {
      detailScore += check.points
    } else {
      missingDetails.push(check.name)
    }
  }

  if (missingDetails.length > 0) {
    const topMissing = missingDetails.slice(0, 2).join(', ')
    improvements.push({
      priority: missingDetails.includes('square footage') ? 'high' : 'medium',
      suggestion: `Add ${topMissing}`,
      impact: 'Complete listings rank higher in search results'
    })
  }

  // ============ AMENITIES (max 15 points) ============
  let amenityScore = 0
  const amenities = property.amenities || []
  const amenityCount = Array.isArray(amenities) ? amenities.length : 0

  if (amenityCount >= 8) {
    amenityScore = 15
  } else if (amenityCount >= 5) {
    amenityScore = 12
  } else if (amenityCount >= 3) {
    amenityScore = 8
  } else if (amenityCount >= 1) {
    amenityScore = 4
  }

  if (amenityCount < 5) {
    improvements.push({
      priority: 'medium',
      suggestion: `Add ${5 - amenityCount} more amenities`,
      impact: 'Amenities are top filters renters use in search'
    })
  }

  // ============ PRICING (max 15 points) ============
  let pricingScore = 15 // Start with full points

  const isRental = property.listing_type === 'rent'
  const isSale = property.listing_type === 'sale'

  if (isRental) {
    if (!property.deposit) {
      pricingScore -= 5
      improvements.push({
        priority: 'medium',
        suggestion: 'Add deposit amount',
        impact: 'Transparent pricing builds trust'
      })
    }
    if (!property.lease_term) {
      pricingScore -= 3
      improvements.push({
        priority: 'low',
        suggestion: 'Specify lease term',
        impact: 'Helps renters plan their move'
      })
    }
  }

  if (isSale) {
    if (!property.property_tax_annual) {
      pricingScore -= 3
      improvements.push({
        priority: 'low',
        suggestion: 'Add annual property tax info',
        impact: 'Buyers factor taxes into affordability'
      })
    }
  }

  // ============ CALCULATE TOTALS ============
  const overall = photoScore + descScore + detailScore + amenityScore + pricingScore

  // Calculate completeness percentage
  const totalFields = 15
  let filledFields = 0
  if (property.title) filledFields++
  if (property.description && property.description.length >= 50) filledFields++
  if (property.sqft) filledFields++
  if (property.neighborhood) filledFields++
  if (property.address) filledFields++
  if (property.city) filledFields++
  if (property.beds) filledFields++
  if (property.baths) filledFields++
  if (property.price || property.sale_price) filledFields++
  if (imageCount >= 1) filledFields++
  if (amenityCount >= 1) filledFields++
  if (property.available_from) filledFields++
  if (property.deposit || isSale) filledFields++
  if (property.lat && property.lng) filledFields++
  if (property.meta_description) filledFields++

  const completeness = Math.round((filledFields / totalFields) * 100)

  // Determine grade
  let grade: QualityScore['grade']
  if (overall >= 85) grade = 'A'
  else if (overall >= 70) grade = 'B'
  else if (overall >= 55) grade = 'C'
  else if (overall >= 40) grade = 'D'
  else grade = 'F'

  // Sort improvements by priority
  improvements.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  return {
    overall,
    grade,
    breakdown: {
      photos: {
        score: photoScore,
        max: 25,
        feedback: `${imageCount} photo${imageCount !== 1 ? 's' : ''} uploaded`
      },
      description: {
        score: descScore,
        max: 25,
        feedback: `${wordCount} words (${descLength} characters)`
      },
      details: {
        score: detailScore,
        max: 20,
        feedback: `${detailChecks.filter(c => c.field).length}/${detailChecks.length} fields completed`
      },
      amenities: {
        score: amenityScore,
        max: 15,
        feedback: `${amenityCount} amenities listed`
      },
      pricing: {
        score: pricingScore,
        max: 15,
        feedback: 'Pricing transparency'
      }
    },
    improvements: improvements.slice(0, 5),
    completeness
  }
}

/**
 * Get quality scores for multiple properties (for dashboard overview)
 */
export async function getBatchQualityScores(
  propertyIds: string[]
): Promise<Map<string, { overall: number; grade: QualityScore['grade'] }>> {
  const results = new Map()
  
  // Process in parallel batches of 5
  const batchSize = 5
  for (let i = 0; i < propertyIds.length; i += batchSize) {
    const batch = propertyIds.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map(async (id) => {
        try {
          const quality = await calculateListingQuality(id)
          return { id, overall: quality.overall, grade: quality.grade }
        } catch {
          return { id, overall: 0, grade: 'F' as const }
        }
      })
    )
    
    for (const result of batchResults) {
      results.set(result.id, { overall: result.overall, grade: result.grade })
    }
  }

  return results
}
