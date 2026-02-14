import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { response } = await request.json()

    if (!response || response.length < 10 || response.length > 1000) {
      return NextResponse.json(
        { error: 'Response must be between 10 and 1000 characters' },
        { status: 400 }
      )
    }

    // Get review and check if user is the property owner
    const { data: review } = await supabase
      .from('reviews')
      .select('property_id')
      .eq('id', params.reviewId)
      .single()

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    // Check if user owns the property
    const { data: property } = await supabase
      .from('properties')
      .select('user_id')
      .eq('id', review.property_id)
      .single()

    if (!property || property.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the property owner can respond to reviews' },
        { status: 403 }
      )
    }

    // Check if response already exists
    const { data: existingResponse } = await supabase
      .from('review_responses')
      .select('id')
      .eq('review_id', params.reviewId)
      .single()

    if (existingResponse) {
      // Update existing response
      const { data: updatedResponse, error } = await supabase
        .from('review_responses')
        .update({ response, updated_at: new Date().toISOString() })
        .eq('review_id', params.reviewId)
        .select(`
          *,
          profiles:landlord_id (
            name,
            avatar_url
          )
        `)
        .single()

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update response' },
          { status: 500 }
        )
      }

      return NextResponse.json({ reviewResponse: updatedResponse })
    } else {
      // Create new response
      const { data: newResponse, error } = await supabase
        .from('review_responses')
        .insert({
          review_id: params.reviewId,
          landlord_id: user.id,
          response
        })
        .select(`
          *,
          profiles:landlord_id (
            name,
            avatar_url
          )
        `)
        .single()

      if (error) {
        return NextResponse.json(
          { error: 'Failed to create response' },
          { status: 500 }
        )
      }

      return NextResponse.json({ reviewResponse: newResponse }, { status: 201 })
    }
  } catch (error) {
    console.error('Review response error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
