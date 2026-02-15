import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resend } from '@/lib/resend'
import NewReviewEmail from '@/emails/NewReviewEmail'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
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

    // Send email notification to landlord
    try {
      // Get property details and landlord info
      const { data: property } = await supabase
        .from('properties')
        .select('title, slug, user_id')
        .eq('id', property_id)
        .single()

      if (property) {
        // Get reviewer name
        const { data: reviewer } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single()

        // Get landlord name and email from profiles
        const { data: landlordProfile } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', property.user_id)
          .single()

        const landlordEmail = landlordProfile?.email

        if (landlordEmail) {
          const propertySlug = property.slug || property_id
          const { error: emailError } = await resend.emails.send({
            from: 'Huts <noreply@huts.co.zw>',
            to: landlordEmail,
            subject: `New ${rating}-star review for ${property.title}`,
            react: NewReviewEmail({
              landlordName: landlordProfile?.name || 'Property Owner',
              propertyTitle: property.title,
              reviewerName: reviewer?.name || 'A renter',
              rating,
              reviewTitle: title,
              reviewComment: comment,
              propertyUrl: `https://www.huts.co.zw/property/${propertySlug}`,
              reviewUrl: 'https://www.huts.co.zw/dashboard/property-reviews',
            }),
          })

          if (emailError) {
            console.error('[Review Email] Resend error:', emailError)
          } else {
            console.log('[Review Email] Sent to landlord:', landlordEmail)
          }
        }
      }
    } catch (emailError) {
      console.error('[Review Email] error:', emailError)
      // Don't fail the request if email fails
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
