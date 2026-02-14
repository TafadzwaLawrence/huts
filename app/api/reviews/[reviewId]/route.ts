import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data: review, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles:author_id (
          name,
          avatar_url
        ),
        review_responses (
          *,
          profiles:landlord_id (
            name,
            avatar_url
          )
        )
      `)
      .eq('id', params.reviewId)
      .single()

    if (error || !review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ review })
  } catch (error) {
    console.error('Get review error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    const { rating, title, comment } = await request.json()

    // Validate input
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (comment && (comment.length < 50 || comment.length > 2000)) {
      return NextResponse.json(
        { error: 'Comment must be between 50 and 2000 characters' },
        { status: 400 }
      )
    }

    // Check if review exists and user is the author
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('author_id, editable_until')
      .eq('id', params.reviewId)
      .single()

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    if (existingReview.author_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Check if still editable (7-day window)
    const editableUntil = new Date(existingReview.editable_until!)
    if (editableUntil < new Date()) {
      return NextResponse.json(
        { error: 'Review edit window has expired (7 days)' },
        { status: 400 }
      )
    }

    // Update review
    const updateData: any = { edited: true }
    if (rating) updateData.rating = rating
    if (title) updateData.title = title
    if (comment) updateData.comment = comment

    const { data: review, error } = await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', params.reviewId)
      .select(`
        *,
        profiles:author_id (
          name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update review' },
        { status: 500 }
      )
    }

    return NextResponse.json({ review })
  } catch (error) {
    console.error('Update review error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Check if review exists and user is the author
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('author_id')
      .eq('id', params.reviewId)
      .single()

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    if (existingReview.author_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Soft delete by updating status
    const { error } = await supabase
      .from('reviews')
      .update({ status: 'deleted' })
      .eq('id', params.reviewId)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete review' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Review deleted successfully' })
  } catch (error) {
    console.error('Delete review error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
