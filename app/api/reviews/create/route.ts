import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { property_id, rating, title, comment } = await request.json()

    // Validate input
    if (!property_id || !rating || !title || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (comment.length < 50 || comment.length > 2000) {
      return NextResponse.json(
        { error: 'Comment must be between 50 and 2000 characters' },
        { status: 400 }
      )
    }

    // Check if user has already reviewed this property
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('property_id', property_id)
      .eq('author_id', user.id)
      .single()

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this property' },
        { status: 400 }
      )
    }

    // Create review (verification and rate limiting handled by triggers)
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        property_id,
        author_id: user.id,
        rating,
        title,
        comment,
        status: 'published'
      })
      .select(`
        *,
        profiles:author_id (
          name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error('Review creation error:', error)
      
      if (error.message.includes('Daily review limit exceeded')) {
        return NextResponse.json(
          { error: 'You have reached your daily review limit (3 reviews per day)' },
          { status: 429 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      )
    }

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error('Review creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
