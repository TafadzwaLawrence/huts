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
    <div className={cn('space-y-4', className)}>
      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-card-title">
          Reviews ({reviews.length})
        </h3>
        
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-2 px-3 py-2 border-2 border-[#E9ECEF] rounded hover:border-[#495057] transition-colors"
          >
            <span className="text-sm">
              {sortOptions.find((opt) => opt.value === sortBy)?.label}
            </span>
            <ChevronDown size={ICON_SIZES.md} className="text-[#495057]" />
          </button>

          {showSortMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-[#E9ECEF] rounded shadow-lg z-10">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortBy(option.value)
                    setShowSortMenu(false)
                    setPage(1)
                  }}
                  className={cn(
                    'w-full text-left px-4 py-2 text-sm hover:bg-[#E9ECEF] transition-colors',
                    sortBy === option.value && 'bg-[#E9ECEF] font-medium'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 && !loading ? (
        <div className="text-center py-12 border border-[#E9ECEF] rounded-lg">
          <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
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
            <div className="text-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="bg-transparent text-black px-6 py-2 rounded border-2 border-[#495057] hover:border-black hover:border-[3px] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="inline w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Reviews'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
