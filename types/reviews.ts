import { Database } from './database'

export type Review = Database['public']['Tables']['reviews']['Row']
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert']
export type ReviewUpdate = Database['public']['Tables']['reviews']['Update']

export type ReviewResponse = Database['public']['Tables']['review_responses']['Row']
export type ReviewResponseInsert = Database['public']['Tables']['review_responses']['Insert']

export type ReviewVote = Database['public']['Tables']['review_votes']['Row']

export type ReviewWithAuthor = Review & {
  profiles: {
    name: string | null
    avatar_url: string | null
    verified: boolean
  }
  review_responses?: ReviewResponse & {
    profiles: {
      name: string | null
      avatar_url: string | null
    }
  }
  _count?: {
    helpful_votes: number
    not_helpful_votes: number
  }
  user_vote?: boolean | null
}

export type ReviewFormData = {
  rating: number
  title: string
  comment: string
}

export type ReviewStats = {
  totalReviews: number
  averageRating: number
  ratingDistribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

export type ReviewSortOption = 'recent' | 'highest' | 'lowest'

export interface PropertyRating {
  property_id: string
  review_count: number
  average_rating: number
  five_star_count: number
  four_star_count: number
  three_star_count: number
  two_star_count: number
  one_star_count: number
}
