import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  try {
    const supabase = await createClient()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sort = searchParams.get('sort') || 'recent' // recent, highest, lowest
    
    const offset = (page - 1) * limit

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Build sort order
    let orderBy: any = { created_at: { ascending: false } }
    if (sort === 'highest') {
      orderBy = { rating: { ascending: false } }
    } else if (sort === 'lowest') {
      orderBy = { rating: { ascending: true } }
    }

    // Fetch reviews
    const { data: reviews, error } = await supabase
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
      .eq('property_id', params.propertyId)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      )
    }

    // Get vote counts and user votes for each review
    const reviewsWithVotes = await Promise.all(
      reviews.map(async (review) => {
        // Get helpful vote count
        const { count: helpfulCount } = await supabase
          .from('review_votes')
          .select('*', { count: 'exact', head: true })
          .eq('review_id', review.id)
          .eq('helpful', true)

        // Get not helpful vote count
        const { count: notHelpfulCount } = await supabase
          .from('review_votes')
          .select('*', { count: 'exact', head: true })
          .eq('review_id', review.id)
          .eq('helpful', false)

        // Get user's vote if logged in
        let userVote = null
        if (user) {
          const { data: vote } = await supabase
            .from('review_votes')
            .select('helpful')
            .eq('review_id', review.id)
            .eq('user_id', user.id)
            .single()

          userVote = vote?.helpful ?? null
        }

        return {
          ...review,
          _count: {
            helpful_votes: helpfulCount || 0,
            not_helpful_votes: notHelpfulCount || 0
          },
          user_vote: userVote
        }
      })
    )

    // Get total count
    const { count: totalCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('property_id', params.propertyId)
      .eq('status', 'published')

    // Get rating stats
    const { data: ratingData } = await supabase
      .from('property_ratings')
      .select('*')
      .eq('property_id', params.propertyId)
      .single()

    const stats = ratingData ? {
      totalReviews: ratingData.review_count,
      averageRating: ratingData.average_rating,
      ratingDistribution: {
        5: ratingData.five_star_count,
        4: ratingData.four_star_count,
        3: ratingData.three_star_count,
        2: ratingData.two_star_count,
        1: ratingData.one_star_count
      }
    } : {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    }

    return NextResponse.json({
      reviews: reviewsWithVotes,
      stats,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Fetch reviews error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
