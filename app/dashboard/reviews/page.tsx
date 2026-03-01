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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-[#E9ECEF]">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#212529] mb-1">My reviews</h1>
            <p className="text-sm text-[#495057]">Manage your property reviews and see landlord responses</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-[#E9ECEF] p-5 hover:border-[#212529] hover:shadow-sm transition-all">
            <div className="flex items-center justify-between mb-3">
              <Star size={20} className="text-[#495057]" />
            </div>
            <p className="text-3xl font-bold text-[#212529] mb-1">{reviews?.length || 0}</p>
            <p className="text-sm text-[#495057]">Total Reviews</p>
          </div>

          <div className="bg-white rounded-lg border border-[#E9ECEF] p-5 hover:border-[#212529] hover:shadow-sm transition-all">
            <div className="flex items-center justify-between mb-3">
              <Star size={20} className="fill-black text-black" />
            </div>
            <p className="text-3xl font-bold text-[#212529] mb-1">
              {reviews && reviews.length > 0
                ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                : '0.0'}
            </p>
            <p className="text-sm text-[#495057]">Avg Rating Given</p>
          </div>

          <div className="bg-white rounded-lg border border-[#E9ECEF] p-5 hover:border-[#212529] hover:shadow-sm transition-all">
            <div className="flex items-center justify-between mb-3">
              <Edit size={20} className="text-[#495057]" />
            </div>
            <p className="text-3xl font-bold text-[#212529] mb-1">
              {reviews?.filter((r) => r.review_responses).length || 0}
            </p>
            <p className="text-sm text-[#495057]">With Response</p>
          </div>
        </div>

        {/* Reviews List */}
        {!reviews || reviews.length === 0 ? (
          <div className="bg-white border border-[#E9ECEF] rounded-lg p-10 text-center">
            <Star size={48} className="mx-auto text-[#ADB5BD] mb-4" />
            <h3 className="text-xl font-bold text-[#212529] mb-2">
              No reviews yet
            </h3>
            <p className="text-sm text-[#495057] mb-6">
              Start exploring properties and share your experiences
            </p>
            <Link
              href="/"
              className="inline-block bg-black text-white px-6 py-2.5 rounded-lg border border-black hover:bg-[#212529] transition-colors"
            >
              Browse properties
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white border border-[#E9ECEF] rounded-lg overflow-hidden"
              >
                {/* Property Info */}
                <Link
                  href={`/property/${review.properties?.slug || review.properties?.id}`}
                  className="block p-4 border-b border-[#E9ECEF] hover:bg-[#F8F9FA] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-[#212529]">
                        {review.properties?.title}
                      </h3>
                      <p className="text-sm text-[#495057]">
                        {review.properties?.location} · ${review.properties?.price}/mo
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          size={16}
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
                <div className="p-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-base font-semibold text-[#212529]">
                        {review.title}
                      </h4>
                      {review.editable_until &&
                        new Date(review.editable_until) > new Date() && (
                          <Link
                            href={`/dashboard/reviews/${review.id}/edit`}
                            className="p-1.5 hover:bg-[#E9ECEF] rounded-lg transition-colors"
                            title="Edit review"
                          >
                            <Edit size={16} className="text-[#495057]" />
                          </Link>
                        )}
                    </div>
                    <p className="text-sm text-[#495057] leading-relaxed">
                      {review.comment}
                    </p>
                    <p className="text-xs text-[#ADB5BD] mt-2">
                      {timeAgo(review.created_at)}
                      {review.edited && ' (edited)'}
                    </p>
                  </div>

                  {/* Landlord Response */}
                  {review.review_responses && (
                    <div className="ml-3 pl-3 border-l border-[#E9ECEF] space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[#212529]">
                          Response from{' '}
                          {review.review_responses.profiles?.name ||
                            'Property Owner'}
                        </span>
                      </div>
                      <p className="text-sm text-[#495057]">
                        {review.review_responses.response}
                      </p>
                      <span className="text-xs text-[#ADB5BD]">
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
