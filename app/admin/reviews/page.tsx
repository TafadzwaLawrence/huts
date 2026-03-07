'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, Trash2, Flag, ExternalLink, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader, AdminEmptyState, AdminPagination } from '@/components/admin'

interface Review {
  id: string
  rating: number
  comment_text: string
  created_at: string
  helpful_count: number
  not_helpful_count: number
  is_verified_tenant: boolean
  author_id: string
  property_id: string
  profiles: { name: string | null; email: string } | null
  properties: { title: string; slug: string; city: string } | null
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/reviews?status=${statusFilter}&page=${page}&limit=20`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setReviews(data.reviews)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { setPage(1) }, [statusFilter])
  useEffect(() => { fetchReviews() }, [page, statusFilter])

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Permanently delete this review? This cannot be undone.')) return
    setDeletingId(reviewId)
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Review deleted')
      fetchReviews()
    } catch {
      toast.error('Failed to delete review')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdminPageHeader
        title="Reviews"
        description={`${total} total reviews`}
        action={
          <div className="flex items-center gap-0.5 bg-[#F8F9FA] p-0.5 rounded-full border border-[#E9ECEF]">
            {[
              { value: 'all', label: 'All' },
              { value: 'flagged', label: 'Flagged (3+ not helpful)' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                  statusFilter === f.value
                    ? 'bg-[#212529] text-white shadow-sm'
                    : 'text-[#495057] hover:text-[#212529]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        }
      />

      {loading ? (
        <div className="bg-white rounded-xl border border-[#E9ECEF] overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-5 py-4 border-b border-[#E9ECEF] space-y-2">
              <div className="h-4 bg-[#E9ECEF] rounded animate-pulse w-1/3" />
              <div className="h-3 bg-[#E9ECEF] rounded animate-pulse w-2/3" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <AdminEmptyState
          icon={MessageSquare}
          title="No reviews found"
          description="No reviews match the current filter"
        />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-[#E9ECEF] overflow-hidden divide-y divide-[#E9ECEF]">
            {reviews.map((review) => (
              <div key={review.id} className="px-5 py-4 hover:bg-[#F8F9FA] transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Rating + meta */}
                    <div className="flex items-center gap-1 mb-1 flex-wrap">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < review.rating ? 'fill-[#212529] text-[#212529]' : 'text-[#E9ECEF]'}
                        />
                      ))}
                      <span className="text-xs text-[#ADB5BD] ml-1">
                        {new Date(review.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </span>
                      {review.is_verified_tenant && (
                        <span className="ml-1 px-1.5 py-0.5 bg-[#F8F9FA] border border-[#E9ECEF] rounded text-[10px] text-[#495057] font-medium">
                          Verified
                        </span>
                      )}
                      {review.not_helpful_count >= 3 && (
                        <span className="ml-1 px-1.5 py-0.5 bg-red-50 border border-red-200 rounded text-[10px] text-red-600 font-medium flex items-center gap-0.5">
                          <Flag size={9} /> Flagged
                        </span>
                      )}
                    </div>

                    {/* Comment */}
                    <p className="text-sm text-[#212529] line-clamp-2">{review.comment_text}</p>

                    {/* Author + property */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-[#ADB5BD] flex-wrap">
                      <span>
                        By:{' '}
                        <span className="text-[#495057] font-medium">
                          {review.profiles?.name || review.profiles?.email || 'Unknown'}
                        </span>
                      </span>
                      <span>·</span>
                      {review.properties ? (
                        <Link
                          href={`/property/${review.properties.slug}`}
                          target="_blank"
                          className="text-[#495057] hover:text-[#212529] flex items-center gap-1 transition-colors"
                        >
                          {review.properties.title}
                          <ExternalLink size={10} />
                        </Link>
                      ) : (
                        <span>Property deleted</span>
                      )}
                      <span>·</span>
                      <span>{review.helpful_count} helpful · {review.not_helpful_count} not helpful</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={deletingId === review.id}
                    className="p-2 text-[#ADB5BD] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                    title="Delete review"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <AdminPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}
