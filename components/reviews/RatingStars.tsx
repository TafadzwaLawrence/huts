'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingStarsProps {
  rating: number
  maxRating?: number
  size?: number
  showNumber?: boolean
  interactive?: boolean
  onRatingChange?: (rating: number) => void
  className?: string
}

export default function RatingStars({
  rating,
  maxRating = 5,
  size = 16,
  showNumber = true,
  interactive = false,
  onRatingChange,
  className
}: RatingStarsProps) {
  const handleClick = (newRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(newRating)
    }
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: maxRating }, (_, i) => {
        const starValue = i + 1
        const isFilled = starValue <= Math.round(rating)
        
        return (
          <Star
            key={i}
            size={size}
            className={cn(
              'transition-colors',
              isFilled ? 'fill-black text-black' : 'text-medium-gray',
              interactive && 'cursor-pointer hover:fill-dark-gray hover:text-dark-gray'
            )}
            onClick={() => handleClick(starValue)}
          />
        )
      })}
      {showNumber && (
        <span className="ml-1 text-sm font-medium text-charcoal">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
