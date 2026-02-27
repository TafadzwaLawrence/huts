'use client'

import { cn } from '@/lib/utils'

interface RatingDistributionProps {
  distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  totalReviews: number
  className?: string
}

export default function RatingDistribution({
  distribution,
  totalReviews,
  className
}: RatingDistributionProps) {
  return (
    <div className={cn('space-y-2.5', className)}>
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = distribution[rating as keyof typeof distribution]
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0

        return (
          <div key={rating} className="flex items-center gap-3">
            <span className="w-14 text-sm text-[#495057]">
              {rating} star{rating !== 1 ? 's' : ''}
            </span>
            
            <div className="flex-1 h-2 bg-[#E9ECEF] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#212529] transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            
            <span className="w-8 text-sm text-[#495057] text-right">
              {count}
            </span>
          </div>
        )
      })}
    </div>
  )
}
