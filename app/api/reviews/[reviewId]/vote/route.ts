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

    const { helpful } = await request.json()

    if (typeof helpful !== 'boolean') {
      return NextResponse.json(
        { error: 'helpful must be a boolean' },
        { status: 400 }
      )
    }

    // Check if review exists
    const { data: review } = await supabase
      .from('reviews')
      .select('id')
      .eq('id', params.reviewId)
      .single()

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    // Check if user has already voted
    const { data: existingVote } = await supabase
      .from('review_votes')
      .select('helpful')
      .eq('review_id', params.reviewId)
      .eq('user_id', user.id)
      .single()

    if (existingVote) {
      // Update existing vote
      const { error } = await supabase
        .from('review_votes')
        .update({ helpful })
        .eq('review_id', params.reviewId)
        .eq('user_id', user.id)

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update vote' },
          { status: 500 }
        )
      }

      return NextResponse.json({ message: 'Vote updated successfully' })
    } else {
      // Create new vote
      const { error } = await supabase
        .from('review_votes')
        .insert({
          review_id: params.reviewId,
          user_id: user.id,
          helpful
        })

      if (error) {
        return NextResponse.json(
          { error: 'Failed to create vote' },
          { status: 500 }
        )
      }

      return NextResponse.json({ message: 'Vote created successfully' }, { status: 201 })
    }
  } catch (error) {
    console.error('Review vote error:', error)
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

    const { error } = await supabase
      .from('review_votes')
      .delete()
      .eq('review_id', params.reviewId)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete vote' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Vote removed successfully' })
  } catch (error) {
    console.error('Review vote delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
