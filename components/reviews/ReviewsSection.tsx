'use client'

import { useState, useEffect } from 'react'
import { ReviewStats } from '@/types/reviews'
import RatingStars from './RatingStars'
import RatingDistribution from './RatingDistribution'
import ReviewsList from './ReviewsList'
import ReviewForm from './ReviewForm'
import { cn } from '@/lib/utils'
import { ICON_SIZES } from '@/lib/constants'

interface ReviewsSectionProps {
  propertyId: string
  propertyOwnerId: string
  currentUserId?: string
  canReview?: boolean
  className?: string
}

export default function ReviewsSection({
  propertyId,
  propertyOwnerId,
  currentUserId,
  canReview = false,
  className
}: ReviewsSectionProps) {
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  })
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/properties/${propertyId}/reviews?page=1&limit=1`)
      const data = await response.json()
      setStats(data.stats)
    } catch (error) {
      console.error('Failed to fetch review stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [propertyId])

  const handleReviewSuccess = () => {
    setShowReviewForm(false)
    fetchStats() // Refresh stats
  }

  if (loading) {
    return (
      <div className={cn('animate-pulse space-y-4', className)}>
        <div className="h-32 bg-[#E9ECEF] rounded-lg" />
        <div className="h-64 bg-[#E9ECEF] rounded-lg" />
      </div>
    )
  }

  return (
    <section className={cn('space-y-6', className)}>
      {/* Stats Header */}
      <div className="border-b border-[#E9ECEF] pb-6">
        <h2 className="text-2xl font-bold text-[#212529] mb-6">
          Guest Reviews
        </h2>
        
        {stats.totalReviews > 0 ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Average Rating */}
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-[#212529]">
                  {stats.averageRating.toFixed(1)}
                </span>
                <span className="text-base text-[#495057]">out of 5</span>
              </div>
              <RatingStars
                rating={stats.averageRating}
                size={20}
                showNumber={false}
                className="mb-3"
              />
              <p className="text-sm text-[#495057]">
                {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
              </p>

              {/* Write Review Button */}
              {canReview && !showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="mt-4 px-5 py-2.5 bg-[#212529] text-white rounded-lg text-sm font-medium hover:bg-black transition-colors"
                >
                  Write a review
                </button>
              )}
            </div>

            {/* Rating Distribution */}
            <div>
              <RatingDistribution
                distribution={stats.ratingDistribution}
                totalReviews={stats.totalReviews}
              />
            </div>
          </div>
        ) : (
          <div className="py-8">
            <p className="text-base text-[#495057] mb-4">
              No reviews yet
            </p>
            {canReview && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-5 py-2.5 bg-[#212529] text-white rounded-lg text-sm font-medium hover:bg-black transition-colors"
              >
                Write the first review
              </button>
            )}
          </div>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <ReviewForm
          propertyId={propertyId}
          onSuccess={handleReviewSuccess}
          onCancel={() => setShowReviewForm(false)}
        />
      )}

      {/* Reviews List */}
      <ReviewsList
        propertyId={propertyId}
        currentUserId={currentUserId}
        propertyOwnerId={propertyOwnerId}
      />
    </section>
  )
}
