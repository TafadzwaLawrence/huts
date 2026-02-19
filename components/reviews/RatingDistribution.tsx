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
    <div className={cn('space-y-2', className)}>
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = distribution[rating as keyof typeof distribution]
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0

        return (
          <div key={rating} className="flex items-center gap-2">
            <span className="w-12 text-sm text-muted-foreground">
              {rating} star
            </span>
            
            <div className="flex-1 h-2 bg-[#E9ECEF] rounded-full overflow-hidden">
              <div
                className="h-full bg-black transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            
            <span className="w-12 text-sm text-muted-foreground text-right">
              {count}
            </span>
          </div>
        )
      })}
    </div>
  )
}
