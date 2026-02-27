'use client'

import { useState, useEffect } from 'react'
import { ReviewWithAuthor, ReviewSortOption } from '@/types/reviews'
import ReviewCard from './ReviewCard'
import { ChevronDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ICON_SIZES } from '@/lib/constants'

interface ReviewsListProps {
  propertyId: string
  currentUserId?: string
  propertyOwnerId?: string
  initialReviews?: ReviewWithAuthor[]
  className?: string
}

export default function ReviewsList({
  propertyId,
  currentUserId,
  propertyOwnerId,
  initialReviews,
  className
}: ReviewsListProps) {
  const [reviews, setReviews] = useState<ReviewWithAuthor[]>(initialReviews || [])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [sortBy, setSortBy] = useState<ReviewSortOption>('recent')
  const [showSortMenu, setShowSortMenu] = useState(false)

  const fetchReviews = async (pageNum: number, sort: ReviewSortOption, append = false) => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/properties/${propertyId}/reviews?page=${pageNum}&limit=10&sort=${sort}`
      )
      const data = await response.json()

      if (append) {
        setReviews((prev) => [...prev, ...data.reviews])
      } else {
        setReviews(data.reviews)
      }

      setHasMore(data.pagination.page < data.pagination.totalPages)
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!initialReviews) {
      fetchReviews(1, sortBy)
    }
  }, [sortBy])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchReviews(nextPage, sortBy, true)
  }

  const handleVote = async (reviewId: string, helpful: boolean) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ helpful })
      })

      if (response.ok) {
        // Refresh reviews to get updated vote counts
        fetchReviews(1, sortBy)
        setPage(1)
      }
    } catch (error) {
      console.error('Failed to vote:', error)
    }
  }

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId))
      }
    } catch (error) {
      console.error('Failed to delete review:', error)
    }
  }

  const handleRespond = () => {
    // Refresh to show new response
    fetchReviews(1, sortBy)
    setPage(1)
  }

  const sortOptions: { value: ReviewSortOption; label: string }[] = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'highest', label: 'Highest Rated' },
    { value: 'lowest', label: 'Lowest Rated' }
  ]

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Sort */}
      {reviews.length > 0 && (
        <div className="flex items-center justify-between pb-4 border-b border-[#E9ECEF]">
          <h3 className="text-xl font-bold text-[#212529]">
            Reviews ({reviews.length})
          </h3>
          
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-[#495057] hover:text-[#212529] transition-colors"
            >
              {sortOptions.find((opt) => opt.value === sortBy)?.label}
              <ChevronDown size={16} />
            </button>

            {showSortMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowSortMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-44 bg-white border border-[#E9ECEF] rounded-lg shadow-lg z-20">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value)
                        setShowSortMenu(false)
                        setPage(1)
                      }}
                      className={cn(
                        'w-full text-left px-4 py-2.5 text-sm hover:bg-[#F8F9FA] transition-colors first:rounded-t-lg last:rounded-b-lg',
                        sortBy === option.value && 'bg-[#F8F9FA] font-medium text-[#212529]',
                        sortBy !== option.value && 'text-[#495057]'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 && !loading ? (
        <div className="text-center py-16">
          <p className="text-base text-[#495057]">Be the first to review</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                currentUserId={currentUserId}
                propertyOwnerId={propertyOwnerId}
                onVote={handleVote}
                onRespond={handleRespond}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center pt-6">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-2.5 border border-[#212529] text-[#212529] rounded-lg text-sm font-medium hover:bg-[#212529] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  'Show more reviews'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
