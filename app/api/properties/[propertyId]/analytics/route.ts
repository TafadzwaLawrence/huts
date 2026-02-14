import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { 
  getPropertyEngagement, 
  getMarketAnalysis, 
  calculateListingQuality,
  calculateInvestmentMetrics 
} from '@/lib/analysis'

export async function GET(
  request: Request,
  { params }: { params: { propertyId: string } }
) {
  try {
    const supabase = await createClient()
    const { propertyId } = params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'

    // Verify property exists and user has access
    const { data: { user } } = await supabase.auth.getUser()
    const { data: property, error } = await supabase
      .from('properties')
      .select('user_id, listing_type')
      .eq('id', propertyId)
      .single()

    if (error || !property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // Only property owner can see analytics
    if (property.user_id !== user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Return specific analysis type or all
    switch (type) {
      case 'engagement':
        const engagement = await getPropertyEngagement(propertyId)
        return NextResponse.json(engagement)

      case 'market':
        const market = await getMarketAnalysis(propertyId)
        return NextResponse.json(market)

      case 'quality':
        const quality = await calculateListingQuality(propertyId)
        return NextResponse.json(quality)

      case 'investment':
        if (property.listing_type !== 'sale') {
          return NextResponse.json(
            { error: 'Investment analysis only available for sale properties' }, 
            { status: 400 }
          )
        }
        const downPayment = searchParams.get('downPayment')
        const interestRate = searchParams.get('interestRate')
        const investment = await calculateInvestmentMetrics(propertyId, {
          downPaymentPercent: downPayment ? parseFloat(downPayment) : undefined,
          interestRate: interestRate ? parseFloat(interestRate) : undefined
        })
        return NextResponse.json(investment)

      case 'all':
      default:
        // Run all analyses in parallel
        const [engagementData, marketData, qualityData] = await Promise.all([
          getPropertyEngagement(propertyId),
          getMarketAnalysis(propertyId),
          calculateListingQuality(propertyId)
        ])

        const response: any = {
          engagement: engagementData,
          market: marketData,
          quality: qualityData
        }

        // Add investment analysis for sale properties
        if (property.listing_type === 'sale') {
          response.investment = await calculateInvestmentMetrics(propertyId)
        }

        return NextResponse.json(response)
    }
  } catch (error: any) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
