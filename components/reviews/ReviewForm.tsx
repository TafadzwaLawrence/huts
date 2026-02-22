'use client'

import { useState } from 'react'
import { Star, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReviewFormData } from '@/types/reviews'
import { ICON_SIZES } from '@/lib/constants'

interface ReviewFormProps {
  propertyId: string
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
}

export default function ReviewForm({
  propertyId,
  onSuccess,
  onCancel,
  className
}: ReviewFormProps) {
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 0,
    title: '',
    comment: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hoverRating, setHoverRating] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.rating === 0) {
      setError('Please select a rating')
      return
    }

    if (formData.comment.length < 50) {
      setError('Review must be at least 50 characters')
      return
    }

    if (formData.comment.length > 2000) {
      setError('Review must be less than 2000 characters')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/reviews/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: propertyId,
          ...formData
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review')
      }

      // Reset form
      setFormData({ rating: 0, title: '', comment: '' })
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('space-y-4 border border-border rounded-lg p-6', className)}
    >
      <h3 className="text-subsection-title">Write a Review</h3>

      {error && (
        <div className="bg-accent-red/10 border border-accent-red text-accent-red px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      {/* Star Rating */}
      <div className="space-y-2">
        <label className="text-label">
          Rating <span className="text-accent-red">*</span>
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={ICON_SIZES['2xl']}
              className={cn(
                'cursor-pointer transition-colors',
                star <= (hoverRating || formData.rating)
                  ? 'fill-black text-black'
                  : 'text-foreground hover:text-foreground'
              )}
              onClick={() => setFormData({ ...formData, rating: star })}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            />
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="text-label">
          Title <span className="text-accent-red">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Summarize your experience"
          className="w-full px-3 py-2 border-2 border-border rounded focus:border-black focus:outline-none transition-colors"
          required
        />
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <label htmlFor="comment" className="text-label">
          Your Review <span className="text-accent-red">*</span>
        </label>
        <textarea
          id="comment"
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          placeholder="Share details about your experience (minimum 50 characters)"
          rows={6}
          className="w-full px-3 py-2 border-2 border-border rounded focus:border-black focus:outline-none transition-colors resize-none"
          required
        />
        <p className="text-secondary">
          {formData.comment.length}/2000 characters
          {formData.comment.length < 50 && formData.comment.length > 0 && (
            <span className="text-accent-red ml-2">
              (Minimum 50 characters)
            </span>
          )}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-6 py-2 rounded border-2 border-black hover:bg-muted hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loading ? (
            <>
              <Loader2 className="inline w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Review'
          )}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="bg-transparent text-black px-6 py-2 rounded border-2 border-border hover:border-black hover:border-[3px] transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
