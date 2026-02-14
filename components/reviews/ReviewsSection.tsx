'use client'

import { useState, useEffect } from 'react'
import { ReviewStats } from '@/types/reviews'
import RatingStars from './RatingStars'
import RatingDistribution from './RatingDistribution'
import ReviewsList from './ReviewsList'
import ReviewForm from './ReviewForm'
import { cn } from '@/lib/utils'

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
        <div className="h-32 bg-light-gray rounded-lg" />
        <div className="h-64 bg-light-gray rounded-lg" />
      </div>
    )
  }

  return (
    <section className={cn('space-y-8', className)}>
      {/* Stats Header */}
      <div className="border border-light-gray rounded-lg p-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Average Rating */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-charcoal">
              Guest Reviews
            </h2>
            
            {stats.totalReviews > 0 ? (
              <>
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-bold text-charcoal">
                    {stats.averageRating.toFixed(1)}
                  </span>
                  <RatingStars
                    rating={stats.averageRating}
                    size={24}
                    showNumber={false}
                    className="mb-2"
                  />
                </div>
                <p className="text-dark-gray">
                  Based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
                </p>
              </>
            ) : (
              <p className="text-dark-gray">No reviews yet</p>
            )}

            {/* Write Review Button */}
            {canReview && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="mt-4 bg-black text-white px-6 py-2 rounded border-2 border-black hover:bg-charcoal hover:-translate-y-0.5 transition-all"
              >
                Write a Review
              </button>
            )}
          </div>

          {/* Rating Distribution */}
          {stats.totalReviews > 0 && (
            <div>
              <h3 className="text-sm font-medium text-charcoal mb-4">
                Rating Distribution
              </h3>
              <RatingDistribution
                distribution={stats.ratingDistribution}
                totalReviews={stats.totalReviews}
              />
            </div>
          )}
        </div>
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
