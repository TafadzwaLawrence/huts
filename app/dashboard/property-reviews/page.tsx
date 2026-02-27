import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Star, MessageCircle, Flag, Home } from 'lucide-react'
import Link from 'next/link'
import { ICON_SIZES } from '@/lib/constants'

// Simple relative time formatter
function formatDistanceToNow(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
  return `${Math.floor(diffInSeconds / 31536000)} years ago`
}

export const metadata = {
  title: 'Property Reviews | Huts',
  description: 'Manage reviews for your properties'
}

export default async function PropertyReviewsPage() {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signup?redirect=/dashboard/property-reviews')
  }

  // Fetch landlord's properties
  const { data: properties } = await supabase
    .from('properties')
    .select('id, title, location, slug')
    .eq('user_id', user.id)

  if (!properties || properties.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-[#212529] mb-6">
            Property Reviews
          </h1>
          <div className="bg-white border-2 border-[#E9ECEF] rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-[#F8F9FA] rounded-full flex items-center justify-center mx-auto mb-6">
              <Home size={ICON_SIZES['2xl']} className="text-[#ADB5BD]" />
            </div>
            <h3 className="text-xl font-bold text-[#212529] mb-2">
              No properties yet
            </h3>
            <p className="text-[#495057] mb-6">
              List your first property to start receiving reviews
            </p>
            <Link
              href="/dashboard/new-property"
              className="inline-block bg-[#212529] text-white px-6 py-3 rounded-xl font-medium hover:bg-black hover:shadow-lg transition-all"
            >
              List a Property
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Fetch all reviews for landlord's properties
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      properties!inner (
        id,
        slug,
        title,
        location,
        user_id
      ),
      profiles:author_id (
        name,
        avatar_url
      ),
      review_responses (
        *
      )
    `)
    .in(
      'property_id',
      properties.map((p) => p.id)
    )
    .order('created_at', { ascending: false })

  // Calculate stats
  const totalReviews = reviews?.length || 0
  const averageRating =
    reviews && reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0
  const needsResponse =
    reviews?.filter((r) => !r.review_responses || r.review_responses.length === 0)
      .length || 0
  const flaggedReviews = reviews?.filter((r) => r.status === 'flagged').length || 0

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#212529] mb-2">
            Property Reviews
          </h1>
          <p className="text-[#495057] text-lg">
            Manage and respond to reviews for your properties
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border-2 border-[#E9ECEF] rounded-2xl p-6 hover:border-[#ADB5BD] transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#495057] font-medium mb-1">Total Reviews</p>
                <p className="text-4xl font-bold text-[#212529]">{totalReviews}</p>
              </div>
              <div className="w-14 h-14 bg-[#F8F9FA] rounded-2xl flex items-center justify-center">
                <Star size={ICON_SIZES.xl} className="text-[#212529]" />
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-[#E9ECEF] rounded-2xl p-6 hover:border-[#ADB5BD] transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#495057] font-medium mb-1">Avg Rating</p>
                <p className="text-4xl font-bold text-[#212529]">
                  {averageRating.toFixed(1)}
                </p>
              </div>
              <div className="w-14 h-14 bg-[#F8F9FA] rounded-2xl flex items-center justify-center">
                <Star size={ICON_SIZES.xl} className="fill-[#212529] text-[#212529]" />
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-[#E9ECEF] rounded-2xl p-6 hover:border-[#ADB5BD] transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#495057] font-medium mb-1">Needs Response</p>
                <p className="text-4xl font-bold text-[#212529]">{needsResponse}</p>
              </div>
              <div className="w-14 h-14 bg-[#F8F9FA] rounded-2xl flex items-center justify-center">
                <MessageCircle size={ICON_SIZES.xl} className="text-[#212529]" />
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-[#E9ECEF] rounded-2xl p-6 hover:border-[#ADB5BD] transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#495057] font-medium mb-1">Flagged</p>
                <p className="text-4xl font-bold text-[#212529]">
                  {flaggedReviews}
                </p>
              </div>
              <div className="w-14 h-14 bg-[#F8F9FA] rounded-2xl flex items-center justify-center">
                <Flag size={ICON_SIZES.xl} className="text-[#212529]" />
              </div>
            </div>
          </div>
        </div>

        {/* Reviews by Property */}
        {!reviews || reviews.length === 0 ? (
          <div className="bg-white border-2 border-[#E9ECEF] rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-[#F8F9FA] rounded-full flex items-center justify-center mx-auto mb-6">
              <Star size={ICON_SIZES['2xl']} className="text-[#ADB5BD]" />
            </div>
            <h3 className="text-xl font-bold text-[#212529] mb-2">
              No reviews yet
            </h3>
            <p className="text-[#495057]">
              Your properties haven't received any reviews yet
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {properties.map((property) => {
              const propertyReviews = reviews.filter(
                (r) => r.property_id === property.id
              )

              if (propertyReviews.length === 0) return null

              const propertyAvgRating =
                propertyReviews.reduce((acc, r) => acc + r.rating, 0) /
                propertyReviews.length

              return (
                <div
                  key={property.id}
                  className="bg-white border-2 border-[#E9ECEF] rounded-2xl overflow-hidden hover:border-[#212529] transition-all"
                >
                  {/* Property Header */}
                  <div className="bg-[#F8F9FA] p-6 border-b-2 border-[#E9ECEF]">
                    <div className="flex items-center justify-between">
                      <div>
                        <Link
                          href={`/property/${property.slug || property.id}`}
                          className="text-xl font-bold text-[#212529] hover:underline"
                        >
                          {property.title}
                        </Link>
                        <p className="text-sm text-[#495057] mt-1">
                          {property.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end mb-1">
                          <Star size={ICON_SIZES.lg} className="fill-[#212529] text-[#212529]" />
                          <span className="text-2xl font-bold text-[#212529]">
                            {propertyAvgRating.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-sm text-[#495057]">
                          {propertyReviews.length}{' '}
                          {propertyReviews.length === 1 ? 'review' : 'reviews'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reviews */}
                  <div className="divide-y divide-[#E9ECEF]">
                    {propertyReviews.map((review) => (
                      <div key={review.id} className="p-6 space-y-4">
                        {/* Review Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-[#F8F9FA] flex items-center justify-center">
                              {review.profiles?.avatar_url ? (
                                <img
                                  src={review.profiles.avatar_url}
                                  alt={review.profiles.name || 'User'}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-[#495057] font-bold text-lg">
                                  {review.profiles?.name?.[0]?.toUpperCase() || 'U'}
                                </span>
                              )}
                            </div>
                            <div>
                              <span className="font-semibold text-[#212529]">
                                {review.profiles?.name || 'Anonymous'}
                              </span>
                              <div className="flex items-center gap-2 text-sm text-[#495057]">
                                <div className="flex">
                                  {Array.from({ length: 5 }, (_, i) => (
                                    <Star
                                      key={i}
                                      size={ICON_SIZES.sm}
                                      className={
                                        i < review.rating
                                          ? 'fill-[#212529] text-[#212529]'
                                          : 'text-[#ADB5BD]'
                                      }
                                    />
                                  ))}
                                </div>
                                <span>·</span>
                                <span>
                                  {formatDistanceToNow(new Date(review.created_at))}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Review Content */}
                        <div>
                          <h4 className="font-bold text-[#212529] mb-2">
                            {review.title}
                          </h4>
                          <p className="text-[#495057] leading-relaxed">
                            {review.comment}
                          </p>
                        </div>

                        {/* Response */}
                        {review.review_responses &&
                        review.review_responses.length > 0 ? (
                          <div className="ml-8 pl-4 border-l-2 border-[#E9ECEF] bg-[#F8F9FA] -ml-6 pl-10 py-4 -mb-6 -mx-6 px-6">
                            <p className="text-sm font-semibold text-[#212529] mb-2">
                              Your Response
                            </p>
                            <p className="text-sm text-[#495057]">
                              {review.review_responses[0].response}
                            </p>
                          </div>
                        ) : (
                          <Link
                            href={`/dashboard/property-reviews/${review.id}/respond`}
                            className="inline-flex items-center gap-2 text-sm bg-[#212529] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-black hover:shadow-lg transition-all"
                          >
                            <MessageCircle size={ICON_SIZES.md} />
                            Respond to Review
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
