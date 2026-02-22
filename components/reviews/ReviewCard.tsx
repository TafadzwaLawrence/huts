'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown, MessageCircle, Edit, Trash2, Flag } from 'lucide-react'
import { ReviewWithAuthor } from '@/types/reviews'
import RatingStars from './RatingStars'
import { cn } from '@/lib/utils'
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

interface ReviewCardProps {
  review: ReviewWithAuthor
  currentUserId?: string
  propertyOwnerId?: string
  onVote?: (reviewId: string, helpful: boolean) => void
  onRespond?: (reviewId: string) => void
  onEdit?: (reviewId: string) => void
  onDelete?: (reviewId: string) => void
  onFlag?: (reviewId: string) => void
  className?: string
}

export default function ReviewCard({
  review,
  currentUserId,
  propertyOwnerId,
  onVote,
  onRespond,
  onEdit,
  onDelete,
  onFlag,
  className
}: ReviewCardProps) {
  const [showResponse, setShowResponse] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [loading, setLoading] = useState(false)

  const isAuthor = currentUserId === review.author_id
  const isPropertyOwner = currentUserId === propertyOwnerId
  const isEditable = isAuthor && review.editable_until && new Date(review.editable_until) > new Date()

  const handleVote = async (helpful: boolean) => {
    if (onVote && review.id) {
      await onVote(review.id, helpful)
    }
  }

  const handleSubmitResponse = async () => {
    if (!responseText.trim() || !review.id) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/reviews/${review.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: responseText })
      })

      if (response.ok) {
        setShowResponse(false)
        setResponseText('')
        if (onRespond) onRespond(review.id)
      }
    } catch (error) {
      console.error('Failed to submit response:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('border border-border rounded-lg p-6 space-y-4', className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            {review.profiles?.avatar_url ? (
              <img
                src={review.profiles.avatar_url}
                alt={review.profiles.name || 'User'}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-muted-foreground font-semibold">
                {review.profiles?.name?.[0]?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">
                {review.profiles?.name || 'Anonymous'}
              </span>
              {review.is_verified && (
                <span className="bg-black text-white text-xs px-2 py-0.5 rounded">
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RatingStars rating={review.rating} size={ICON_SIZES.sm} showNumber={false} />
              <span>·</span>
              <span>{review.created_at ? timeAgo(review.created_at) : 'Recently'}</span>
              {review.edited && <span className="text-xs">(edited)</span>}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isEditable && onEdit && (
            <button
              onClick={() => onEdit(review.id)}
              className="p-2 hover:bg-muted rounded transition-colors"
              title="Edit review"
            >
              <Edit size={ICON_SIZES.md} className="text-foreground" />
            </button>
          )}
          {isAuthor && onDelete && (
            <button
              onClick={() => onDelete(review.id)}
              className="p-2 hover:bg-muted rounded transition-colors"
              title="Delete review"
            >
              <Trash2 size={ICON_SIZES.md} className="text-foreground" />
            </button>
          )}
          {!isAuthor && onFlag && (
            <button
              onClick={() => onFlag(review.id)}
              className="p-2 hover:bg-muted rounded transition-colors"
              title="Flag review"
            >
              <Flag size={ICON_SIZES.md} className="text-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Review Content */}
      <div className="space-y-2">
        <h4 className="text-card-title-sm">{review.title}</h4>
        <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
      </div>

      {/* Helpful Votes */}
      <div className="flex items-center gap-4 pt-2 border-t border-border">
        <span className="text-secondary">Was this helpful?</span>
        <button
          onClick={() => handleVote(true)}
          className={cn(
            'flex items-center gap-1 px-3 py-1 rounded border-2 transition-all',
            review.user_vote === true
              ? 'bg-black text-white border-black'
              : 'border-border hover:border-border'
          )}
        >
          <ThumbsUp size={ICON_SIZES.sm} />
          <span className="text-sm">{review._count?.helpful_votes || 0}</span>
        </button>
        <button
          onClick={() => handleVote(false)}
          className={cn(
            'flex items-center gap-1 px-3 py-1 rounded border-2 transition-all',
            review.user_vote === false
              ? 'bg-black text-white border-black'
              : 'border-border hover:border-border'
          )}
        >
          <ThumbsDown size={ICON_SIZES.sm} />
          <span className="text-sm">{review._count?.not_helpful_votes || 0}</span>
        </button>
      </div>

      {/* Landlord Response */}
      {review.review_responses && (
        <div className="ml-8 pl-4 border-l-2 border-border space-y-2">
          <div className="flex items-center gap-2">
            <MessageCircle size={ICON_SIZES.sm} className="text-foreground" />
            <span className="text-label">
              Response from {review.review_responses.profiles?.name || 'Property Owner'}
            </span>
          </div>
          <p className="text-secondary">{review.review_responses.response}</p>
          <span className="text-small">
            {review.review_responses.created_at ? timeAgo(review.review_responses.created_at) : 'Recently'}
          </span>
        </div>
      )}

      {/* Response Form (Property Owner Only) */}
      {isPropertyOwner && !review.review_responses && (
        <div className="ml-8 space-y-2">
          {!showResponse ? (
            <button
              onClick={() => setShowResponse(true)}
              className="flex items-center gap-2 text-secondary hover:text-foreground transition-colors"
            >
              <MessageCircle size={ICON_SIZES.sm} />
              Respond to this review
            </button>
          ) : (
            <div className="space-y-2">
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Write your response (10-1000 characters)"
                rows={3}
                className="w-full px-3 py-2 border-2 border-border rounded focus:border-black focus:outline-none transition-colors resize-none text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitResponse}
                  disabled={loading || responseText.length < 10}
                  className="bg-black text-white px-4 py-1 rounded text-sm border-2 border-black hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Response'}
                </button>
                <button
                  onClick={() => {
                    setShowResponse(false)
                    setResponseText('')
                  }}
                  disabled={loading}
                  className="bg-transparent text-black px-4 py-1 rounded text-sm border-2 border-border hover:border-black transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
