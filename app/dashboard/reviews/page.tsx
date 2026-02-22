'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Star, Edit } from 'lucide-react'
import Link from 'next/link'
import { ICON_SIZES } from '@/lib/constants'

// Simple time ago formatter
function timeAgo(date: string) {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  }
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit)
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`
    }
  }
  return 'just now'
}

export default function MyReviewsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [reviews, setReviews] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/dashboard')
        return
      }

      // Fetch user's reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select(`
          *,
          properties (
            id,
            title,
            location,
            price
          ),
          review_responses (
            *,
            profiles:landlord_id (
              name,
              avatar_url
            )
          )
        `)
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })

      // Get profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setReviews(reviewsData || [])
      setProfile(profileData)
      setLoading(false)
    }

    loadData()
  }, [router, supabase])

  if (loading) {
    return <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-page-title mb-2">My Reviews</h1>
          <p className="text-muted-foreground">
            Manage your property reviews and see landlord responses
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-[#E9ECEF] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary mb-1">Total Reviews</p>
                <p className="text-stat">
                  {reviews?.length || 0}
                </p>
              </div>
              <Star size={ICON_SIZES['2xl']} className="text-[#ADB5BD]" />
            </div>
          </div>

          <div className="bg-white border border-[#E9ECEF] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary mb-1">Avg Rating Given</p>
                <p className="text-stat">
                  {reviews && reviews.length > 0
                    ? (
                        reviews.reduce((acc, r) => acc + r.rating, 0) /
                        reviews.length
                      ).toFixed(1)
                    : '0.0'}
                </p>
              </div>
              <Star size={ICON_SIZES['2xl']} className="fill-black text-black" />
            </div>
          </div>

          <div className="bg-white border border-[#E9ECEF] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary mb-1">With Response</p>
                <p className="text-stat">
                  {reviews?.filter((r) => r.review_responses).length || 0}
                </p>
              </div>
              <Edit size={ICON_SIZES['2xl']} className="text-[#ADB5BD]" />
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {!reviews || reviews.length === 0 ? (
          <div className="bg-white border border-[#E9ECEF] rounded-lg p-12 text-center">
            <Star size={ICON_SIZES['3xl']} className="mx-auto text-[#ADB5BD] mb-4" />
            <h3 className="text-subsection-title mb-2">
              No reviews yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Start exploring properties and share your experiences
            </p>
            <Link
              href="/"
              className="inline-block bg-black text-white px-6 py-2 rounded border-2 border-black hover:bg-[#212529] hover:-translate-y-0.5 transition-all"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white border border-[#E9ECEF] rounded-lg overflow-hidden"
              >
                {/* Property Info */}
                <Link
                  href={`/property/${review.properties?.id}`}
                  className="block p-4 border-b border-[#E9ECEF] hover:bg-[#F8F9FA] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-card-title-sm">
                        {review.properties?.title}
                      </h3>
                      <p className="text-secondary">
                        {review.properties?.location} · ${review.properties?.price}/mo
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          size={ICON_SIZES.md}
                          className={
                            i < review.rating
                              ? 'fill-black text-black'
                              : 'text-[#ADB5BD]'
                          }
                        />
                      ))}
                    </div>
                  </div>
                </Link>

                {/* Review Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-card-title-sm">
                        {review.title}
                      </h4>
                      {review.editable_until &&
                        new Date(review.editable_until) > new Date() && (
                          <Link
                            href={`/dashboard/reviews/${review.id}/edit`}
                            className="p-2 hover:bg-[#E9ECEF] rounded transition-colors"
                            title="Edit review"
                          >
                            <Edit size={ICON_SIZES.md} className="text-[#495057]" />
                          </Link>
                        )}
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {review.comment}
                    </p>
                    <p className="text-small mt-2">
                      {timeAgo(review.created_at)}
                      {review.edited && ' (edited)'}
                    </p>
                  </div>

                  {/* Landlord Response */}
                  {review.review_responses && (
                    <div className="ml-4 pl-4 border-l-2 border-[#E9ECEF] space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-label">
                          Response from{' '}
                          {review.review_responses.profiles?.name ||
                            'Property Owner'}
                        </span>
                      </div>
                      <p className="text-secondary">
                        {review.review_responses.response}
                      </p>
                      <span className="text-small">
                        {timeAgo(review.review_responses.created_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
