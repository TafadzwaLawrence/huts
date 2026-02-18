'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Building2, 
  MapPin, 
  Home,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react'
import { formatPrice, formatSalePrice } from '@/lib/utils'

interface Property {
  id: string
  title: string
  slug: string
  status: string
  verification_status: string
  listing_type: string | null
  price: number | null
  sale_price: number | null
  city: string
  neighborhood: string | null
  property_type: string | null
  beds: number
  baths: number
  sqft: number | null
  created_at: string
  verified_at: string | null
  user_id: string
  profiles: { name: string | null; email: string; avatar_url: string | null }
  property_images: Array<{ url: string; is_primary: boolean }>
}

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/properties?status=${statusFilter}&page=${page}&limit=20`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setProperties(data.properties)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
  }, [statusFilter])

  useEffect(() => {
    fetchProperties()
  }, [page, statusFilter])

  const statusIcon = (vs: string) => {
    if (vs === 'approved') return <ShieldCheck size={13} className="text-[#51CF66]" />
    if (vs === 'rejected') return <ShieldX size={13} className="text-[#FF6B6B]" />
    return <ShieldAlert size={13} className="text-amber-500" />
  }

  const statusBadge = (vs: string) => {
    const styles: Record<string, string> = {
      approved: 'bg-[#51CF66]/10 text-[#37B24D]',
      rejected: 'bg-[#FF6B6B]/10 text-[#F03E3E]',
      pending: 'bg-amber-50 text-amber-600',
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${styles[vs] || styles.pending}`}>
        {statusIcon(vs)}
        {vs.charAt(0).toUpperCase() + vs.slice(1)}
      </span>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#212529]">All Properties</h1>
          <p className="text-sm text-[#ADB5BD] mt-1">{total} total</p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-0.5 bg-[#F8F9FA] p-0.5 rounded-full border border-[#E9ECEF]">
          {['all', 'approved', 'pending', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                statusFilter === s
                  ? 'bg-[#212529] text-white shadow-sm'
                  : 'text-[#495057] hover:text-[#212529]'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-[#E9ECEF] overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-[#F1F3F5]">
              <div className="w-14 h-14 bg-[#E9ECEF] rounded-lg animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#E9ECEF] rounded animate-pulse w-1/2" />
                <div className="h-3 bg-[#E9ECEF] rounded animate-pulse w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E9ECEF] py-20 text-center">
          <Building2 size={40} className="mx-auto text-[#E9ECEF] mb-3" />
          <h3 className="font-semibold text-[#212529] mb-1">No properties found</h3>
          <p className="text-sm text-[#ADB5BD]">
            {statusFilter !== 'all' ? `No ${statusFilter} properties` : 'No properties in the system'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-[#E9ECEF] overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-[#F8F9FA] text-[10px] font-semibold text-[#ADB5BD] uppercase tracking-wider border-b border-[#E9ECEF]">
              <div className="col-span-5">Property</div>
              <div className="col-span-2">Owner</div>
              <div className="col-span-1">Type</div>
              <div className="col-span-1">Price</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Date</div>
              <div className="col-span-1"></div>
            </div>

            <div className="divide-y divide-[#F1F3F5]">
              {properties.map((property) => {
                const primaryImage = property.property_images?.find(img => img.is_primary) || property.property_images?.[0]
                const listingType = property.listing_type || 'rent'
                const isForSale = listingType === 'sale'
                const displayPrice = isForSale && property.sale_price
                  ? formatSalePrice(property.sale_price)
                  : property.price
                    ? formatPrice(property.price)
                    : '$0'
                const owner = property.profiles

                return (
                  <div key={property.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center px-5 py-3.5 hover:bg-[#FAFAFA] transition-colors">
                    {/* Property */}
                    <div className="md:col-span-5 flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#F8F9FA] flex-shrink-0">
                        {primaryImage?.url ? (
                          <Image src={primaryImage.url} alt="" fill className="object-cover" sizes="48px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Home size={16} className="text-[#ADB5BD]" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#212529] truncate">{property.title}</p>
                        <p className="text-xs text-[#ADB5BD] flex items-center gap-1 truncate">
                          <MapPin size={10} />
                          {property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}
                        </p>
                      </div>
                    </div>

                    {/* Owner */}
                    <div className="md:col-span-2 min-w-0 hidden md:block">
                      <p className="text-xs text-[#495057] truncate">{owner?.name || 'Unknown'}</p>
                      <p className="text-[10px] text-[#ADB5BD] truncate">{owner?.email}</p>
                    </div>

                    {/* Type */}
                    <div className="md:col-span-1 hidden md:block">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isForSale ? 'bg-[#212529] text-white' : 'bg-[#F8F9FA] text-[#495057]'
                      }`}>
                        {isForSale ? 'Sale' : 'Rent'}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="md:col-span-1 hidden md:block">
                      <p className="text-sm font-semibold text-[#212529]">{displayPrice}</p>
                    </div>

                    {/* Status */}
                    <div className="md:col-span-1">
                      {statusBadge(property.verification_status)}
                    </div>

                    {/* Date */}
                    <div className="md:col-span-1 hidden md:block">
                      <p className="text-xs text-[#ADB5BD]">
                        {new Date(property.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-1 flex justify-end">
                      <Link
                        href={`/property/${property.slug || property.id}`}
                        target="_blank"
                        className="p-2 text-[#ADB5BD] hover:text-[#212529] transition-colors"
                      >
                        <ExternalLink size={14} />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-[#E9ECEF] text-[#495057] hover:border-[#212529] disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-[#495057] px-3">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-[#E9ECEF] text-[#495057] hover:border-[#212529] disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
