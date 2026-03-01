'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { 
  Building2, 
  Eye, 
  Heart, 
  MessageSquare, 
  ExternalLink, 
  Pencil,
  Sparkles,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowUpDown,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Mail,
  Loader2,
  BarChart3,
  Search,
  Filter,
  Trash2,
} from 'lucide-react'
import { ICON_SIZES } from '@/lib/constants'

type PropertyWithStats = any // TODO: Type this properly

type SortOption = 'newest' | 'oldest' | 'most-views' | 'most-inquiries' | 'price-high' | 'price-low'
type StatusFilter = 'all' | 'active' | 'inactive'
type TypeFilter = 'all' | 'rent' | 'sale'
type VerificationFilter = 'all' | 'pending' | 'approved' | 'rejected'

export default function MyPropertiesList({ properties }: { properties: PropertyWithStats[] }) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [resendingId, setResendingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const resendVerification = async (propertyId: string) => {
    setResendingId(propertyId)
    try {
      const res = await fetch('/api/properties/verify/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      })
      const data = await res.json()
      if (!res.ok) {
        console.error('[Verification] Resend error:', res.status, JSON.stringify(data))
        toast.error(data.error || 'Failed to resend verification email')
      } else {
        toast.success('Verification email sent to admin!')
      }
    } catch (error) {
      console.error('[Verification] Resend network error:', error)
      toast.error('Failed to resend verification email')
    } finally {
      setResendingId(null)
    }
  }

  const handleDelete = async (propertyId: string) => {
    setDeleting(true)
    try {
      const supabase = createClient()
      // Use RPC function to bypass RLS issues
      const { data, error } = await supabase
        .rpc('delete_property', { p_property_id: propertyId })
      
      if (error) throw error
      
      toast.success('Property deleted successfully')
      setDeleteConfirm(null)
      // Refresh the page to show updated list
      router.refresh()
    } catch (error: any) {
      console.error('[Delete] Error:', error)
      toast.error(error.message || 'Failed to delete property')
    } finally {
      setDeleting(false)
    }
  }

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    let filtered = properties.filter(p => {
      const statusMatch = statusFilter === 'all' || p.status === statusFilter
      const typeMatch = typeFilter === 'all' || 
        (typeFilter === 'rent' && (!p.listing_type || p.listing_type === 'rent')) ||
        (typeFilter === 'sale' && p.listing_type === 'sale')
      const verifyMatch = verificationFilter === 'all' || 
        (p.verification_status || 'approved') === verificationFilter
      const searchMatch = !searchQuery.trim() || 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.neighborhood?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address?.toLowerCase().includes(searchQuery.toLowerCase())
      return statusMatch && typeMatch && verifyMatch && searchMatch
    })

    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'most-views':
          return b.stats.views - a.stats.views
        case 'most-inquiries':
          return b.stats.inquiries - a.stats.inquiries
        case 'price-high': {
          const pB = b.listing_type === 'sale' ? b.sale_price : b.price
          const pA = a.listing_type === 'sale' ? a.sale_price : a.price
          return (pB || 0) - (pA || 0)
        }
        case 'price-low': {
          const pB2 = b.listing_type === 'sale' ? b.sale_price : b.price
          const pA2 = a.listing_type === 'sale' ? a.sale_price : a.price
          return (pA2 || 0) - (pB2 || 0)
        }
        default:
          return 0
      }
    })

    return filtered
  }, [properties, statusFilter, typeFilter, verificationFilter, sortBy, searchQuery])

  const stats = useMemo(() => ({
    total: properties.length,
    active: properties.filter((p: any) => p.status === 'active').length,
    inactive: properties.filter((p: any) => p.status !== 'active').length,
    rent: properties.filter((p: any) => !p.listing_type || p.listing_type === 'rent').length,
    sale: properties.filter((p: any) => p.listing_type === 'sale').length,
    pending: properties.filter((p: any) => (p.verification_status || 'approved') === 'pending').length,
    verified: properties.filter((p: any) => (p.verification_status || 'approved') === 'approved').length,
    rejected: properties.filter((p: any) => p.verification_status === 'rejected').length,
    totalViews: properties.reduce((sum: number, p: any) => sum + p.stats.views, 0),
    totalSaves: properties.reduce((sum: number, p: any) => sum + p.stats.saves, 0),
    totalInquiries: properties.reduce((sum: number, p: any) => sum + p.stats.inquiries, 0),
  }), [properties])

  const formatTimeAgo = (dateStr: string) => {
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    if (days < 30) return `${Math.floor(days / 7)}w ago`
    if (days < 365) return `${Math.floor(days / 30)}mo ago`
    return `${Math.floor(days / 365)}y ago`
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-[#F8F9FA] rounded-lg flex items-center justify-center mb-4 border border-[#E9ECEF]">
          <Building2 size={32} className="text-[#ADB5BD]" />
        </div>
        <h2 className="text-xl font-bold text-[#212529] mb-2">No properties yet</h2>
        <p className="text-sm text-[#495057] mb-6 max-w-sm text-center">
          List your first property to get started.
        </p>
        <Link
          href="/dashboard/new-property"
          className="inline-flex items-center gap-2 bg-[#212529] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-black transition-colors"
        >
          <Sparkles size={20} />
          List property
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#212529]">My properties</h1>
          <p className="text-sm text-[#495057] mt-1">
            {stats.total} {stats.total === 1 ? 'property' : 'properties'} &middot; {stats.active} active
          </p>
        </div>
      </div>

      {/* Pending Verification Banner */}
      {stats.pending > 0 && (
        <div className="bg-[#fff8e1] border border-[#ffc107]/30 rounded-lg px-4 py-3 flex items-start sm:items-center gap-3">
          <ShieldAlert size={20} className="text-[#f59f00] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#212529]">
              {stats.pending} {stats.pending === 1 ? 'property' : 'properties'} pending verification
            </p>
            <p className="text-xs text-[#495057] mt-0.5">
              Usually reviewed within 24 hours.
            </p>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-[#E9ECEF] p-4 hover:border-[#495057] transition-colors">
          <div className="flex items-center gap-2">
            <Eye size={18} className="text-[#495057]" />
            <div className="min-w-0">
              <p className="text-lg font-bold text-[#212529] tabular-nums">{stats.totalViews.toLocaleString()}</p>
              <p className="text-xs text-[#495057]">Views</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-[#E9ECEF] p-4 hover:border-[#495057] transition-colors">
          <div className="flex items-center gap-2">
            <Heart size={18} className="text-[#495057]" />
            <div className="min-w-0">
              <p className="text-lg font-bold text-[#212529] tabular-nums">{stats.totalSaves.toLocaleString()}</p>
              <p className="text-xs text-[#495057]">Saves</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-[#E9ECEF] p-4 hover:border-[#495057] transition-colors">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-[#495057]" />
            <div className="min-w-0">
              <p className="text-lg font-bold text-[#212529] tabular-nums">{stats.totalInquiries}</p>
              <p className="text-xs text-[#495057]">Inquiries</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-[#E9ECEF] p-4 hover:border-[#495057] transition-colors">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-[#495057]" />
            <div className="min-w-0">
              <p className="text-lg font-bold text-[#212529] tabular-nums">
                {stats.totalViews > 0 ? `${((stats.totalInquiries / stats.totalViews) * 100).toFixed(1)}%` : '—'}
              </p>
              <p className="text-xs text-[#495057]">Conversion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar — Search + Filters + Sort */}
      <div className="bg-white rounded-lg border border-[#E9ECEF] p-3 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#ADB5BD]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search properties..."
            className="w-full pl-9 pr-4 py-2 text-sm text-[#212529] bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg placeholder:text-[#ADB5BD] focus:border-[#495057] focus:outline-none focus:bg-white transition-colors"
          />
        </div>

        {/* Filters row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Type pills */}
            <div className="flex items-center bg-[#F8F9FA] rounded-lg p-0.5">
              {(['all', 'rent', 'sale'] as TypeFilter[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    typeFilter === t 
                      ? 'bg-[#212529] text-white' 
                      : 'text-[#495057] hover:text-[#212529]'
                  }`}
                >
                  {t === 'all' ? 'All' : t === 'rent' ? `Rent (${stats.rent})` : `Sale (${stats.sale})`}
                </button>
              ))}
            </div>

            {/* Status pills */}
            <div className="flex items-center bg-[#F8F9FA] rounded-lg p-0.5">
              {(['all', 'active', 'inactive'] as StatusFilter[]).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                    statusFilter === s 
                      ? 'bg-[#212529] text-white' 
                      : 'text-[#495057] hover:text-[#212529]'
                  }`}
                >
                  {s === 'active' && <CheckCircle2 size={12} />}
                  {s === 'inactive' && <Clock size={12} />}
                  {s === 'all' ? 'All' : s === 'active' ? `Active (${stats.active})` : `Inactive (${stats.inactive})`}
                </button>
              ))}
            </div>

            {/* Verification pills */}
            {(stats.pending > 0 || stats.rejected > 0) && (
              <div className="flex items-center bg-[#F8F9FA] rounded-lg p-0.5">
                {(['all', 'pending', 'approved', 'rejected'] as VerificationFilter[]).map(v => {
                  const count = v === 'pending' ? stats.pending : v === 'approved' ? stats.verified : v === 'rejected' ? stats.rejected : stats.total
                  if (v !== 'all' && count === 0) return null
                  return (
                    <button
                      key={v}
                      onClick={() => setVerificationFilter(v)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                        verificationFilter === v 
                          ? 'bg-[#212529] text-white' 
                          : 'text-[#495057] hover:text-[#212529]'
                      }`}
                    >
                      {v === 'pending' && <ShieldAlert size={12} />}
                      {v === 'approved' && <ShieldCheck size={12} />}
                      {v === 'rejected' && <ShieldX size={12} />}
                      {v === 'all' ? 'All' : `${v.charAt(0).toUpperCase() + v.slice(1)} (${count})`}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sort */}
          <div className="relative flex-shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none pl-3 pr-8 py-2 bg-white border border-[#E9ECEF] rounded-lg text-xs font-medium text-[#495057] hover:border-[#495057] focus:border-[#212529] focus:outline-none transition-colors cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="most-views">Most views</option>
              <option value="most-inquiries">Most inquiries</option>
              <option value="price-high">Price high</option>
              <option value="price-low">Price low</option>
            </select>
            <ArrowUpDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#495057] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-[#495057] px-1">
        {filteredProperties.length === properties.length
          ? `${properties.length} ${properties.length === 1 ? 'property' : 'properties'}`
          : `${filteredProperties.length} of ${properties.length} properties`}
      </p>

      {/* Property List */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#E9ECEF] p-10 text-center">
          <div className="w-14 h-14 bg-[#F8F9FA] rounded-lg flex items-center justify-center mx-auto mb-3">
            <Filter size={28} className="text-[#ADB5BD]" />
          </div>
          <h3 className="text-base font-semibold text-[#212529] mb-1">No matches</h3>
          <p className="text-sm text-[#495057] mb-4">Try adjusting your filters</p>
          <button
            onClick={() => {
              setStatusFilter('all')
              setTypeFilter('all')
              setVerificationFilter('all')
              setSearchQuery('')
            }}
            className="text-sm font-medium text-[#212529] hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProperties.map((property: any) => {
            const image = property.property_images?.find((img: any) => img.is_primary) 
              || property.property_images?.sort((a: any, b: any) => a.order - b.order)[0]
            const isActive = property.status === 'active'
            const isForSale = property.listing_type === 'sale'
            const verificationStatus = property.verification_status || 'approved'
            const price = isForSale ? property.sale_price : property.price
            const isPending = verificationStatus === 'pending'
            const isRejected = verificationStatus === 'rejected'

            return (
              <div
                key={property.id}
                className={`group bg-white rounded-lg border overflow-hidden transition-colors ${
                  isPending ? 'border-[#ffc107]/40' : isRejected ? 'border-[#FF6B6B]/30' : 'border-[#E9ECEF] hover:border-[#495057]'
                }`}
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <Link 
                    href={`/property/${property.slug || property.id}`}
                    className="relative w-full sm:w-52 md:w-56 h-48 sm:h-auto flex-shrink-0 overflow-hidden bg-[#F8F9FA]"
                  >
                    {image ? (
                      <img 
                        src={image.url} 
                        alt={property.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center min-h-[160px]">
                        <Building2 size={ICON_SIZES['2xl']} className="text-[#ADB5BD]" />
                      </div>
                    )}
                    {/* Top-left badges */}
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wide backdrop-blur-sm ${
                        isForSale 
                          ? 'bg-[#212529]/90 text-white' 
                          : 'bg-white/90 text-[#212529]'
                      }`}>
                        {isForSale ? 'Sale' : 'Rent'}
                      </span>
                      {/* Verification badge */}
                      {verificationStatus !== 'approved' && (
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded flex items-center gap-1 backdrop-blur-sm ${
                          isPending
                            ? 'bg-[#ffc107]/90 text-[#212529]'
                            : 'bg-[#FF6B6B]/90 text-white'
                        }`}>
                          {isPending ? <ShieldAlert size={10} /> : <ShieldX size={10} />}
                          {isPending ? 'Pending' : 'Rejected'}
                        </span>
                      )}
                    </div>
                    {/* Bottom-left status */}
                    <div className="absolute bottom-3 left-3">
                      <span className={`px-2 py-1 text-[10px] font-semibold rounded-md flex items-center gap-1 backdrop-blur-sm ${
                        isActive 
                          ? 'bg-[#51CF66]/90 text-white' 
                          : 'bg-[#495057]/80 text-white'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-[#ADB5BD]'}`} />
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">
                    {/* Top row: title + price */}
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <Link 
                            href={`/property/${property.slug || property.id}`}
                            className="text-base font-bold text-[#212529] hover:underline underline-offset-2 line-clamp-1 block"
                          >
                            {property.title}
                          </Link>
                          <p className="text-xs text-[#495057] flex items-center gap-1.5 mt-1">
                            <MapPin size={ICON_SIZES.xs} className="flex-shrink-0 text-[#ADB5BD]" />
                            <span className="line-clamp-1">
                              {[property.neighborhood, property.city].filter(Boolean).join(', ') || property.address}
                            </span>
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-[#212529] tabular-nums">
                            ${price ? (price / 100).toLocaleString() : '0'}
                          </p>
                          <p className="text-[10px] text-[#495057] font-medium uppercase tracking-wide">
                            {isForSale ? 'sale price' : 'per month'}
                          </p>
                        </div>
                      </div>

                      {/* Property specs + date */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#495057] mb-3">
                        {property.beds > 0 && (
                          <span className="flex items-center gap-1">
                            <Bed size={14} className="text-[#ADB5BD]" /> 
                            <span className="font-semibold text-[#212529]">{property.beds}</span> bed
                          </span>
                        )}
                        {property.baths > 0 && (
                          <span className="flex items-center gap-1">
                            <Bath size={14} className="text-[#ADB5BD]" /> 
                            <span className="font-semibold text-[#212529]">{property.baths}</span> bath
                          </span>
                        )}
                        {property.sqft > 0 && (
                          <span className="flex items-center gap-1">
                            <Square size={14} className="text-[#ADB5BD]" /> 
                            <span className="font-semibold text-[#212529]">{property.sqft.toLocaleString()}</span> sqft
                          </span>
                        )}
                        <span className="ml-auto flex items-center gap-1 text-[#ADB5BD]">
                          <Calendar size={12} /> {formatTimeAgo(property.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Bottom row: stats bar + actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#F0F0F0]">
                      {/* Inline stats */}
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-xs text-[#495057]">
                          <Eye size={14} className="text-[#ADB5BD]" />
                          <span className="font-bold text-[#212529] tabular-nums">{property.stats.views}</span>
                        </span>
                        <span className="flex items-center gap-1 text-xs text-[#495057]">
                          <Heart size={14} className="text-[#ADB5BD]" />
                          <span className="font-bold text-[#212529] tabular-nums">{property.stats.saves}</span>
                        </span>
                        <span className="flex items-center gap-1 text-xs text-[#495057]">
                          <MessageSquare size={14} className="text-[#ADB5BD]" />
                          <span className="font-bold text-[#212529] tabular-nums">{property.stats.inquiries}</span>
                        </span>
                        {property.stats.views > 0 && (
                          <span className="hidden sm:flex items-center gap-1 text-[10px] font-semibold text-[#51CF66] bg-[#51CF66]/10 px-2 py-0.5 rounded">
                            <TrendingUp size={12} />
                            {((property.stats.inquiries / property.stats.views) * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {isPending && (
                          <button
                            onClick={() => resendVerification(property.id)}
                            disabled={resendingId === property.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#212529] bg-[#ffc107]/15 hover:bg-[#ffc107]/25 border border-[#ffc107]/50 rounded-lg transition-colors disabled:opacity-50"
                            title="Resend verification email"
                          >
                            {resendingId === property.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Mail size={16} />
                            )}
                            <span className="hidden sm:inline">Resend</span>
                          </button>
                        )}
                        <Link
                          href={`/property/${property.slug || property.id}`}
                          target="_blank"
                          className="p-1.5 text-[#495057] hover:text-[#212529] hover:bg-[#F8F9FA] rounded-lg transition-colors border border-[#E9ECEF]"
                          title="View listing"
                        >
                          <ExternalLink size={16} />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm({ id: property.id, title: property.title })}
                          className="p-1.5 text-[#495057] hover:text-[#FF6B6B] hover:bg-[#FF6B6B]/10 rounded-lg transition-colors border border-[#E9ECEF] hover:border-[#FF6B6B]/30"
                          title="Delete property"
                        >
                          <Trash2 size={16} />
                        </button>
                        <Link
                          href={`/dashboard/edit-property/${property.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#212529] hover:bg-black rounded-lg transition-colors"
                        >
                          <Pencil size={16} />
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" 
          onClick={() => setDeleteConfirm(null)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl" 
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-[#FF6B6B]/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-[#FF6B6B]" />
            </div>
            <h3 className="text-lg font-bold text-[#212529] text-center mb-2">Delete this property?</h3>
            <p className="text-sm text-[#495057] text-center mb-1 font-semibold">
              {deleteConfirm.title}
            </p>
            <p className="text-xs text-[#ADB5BD] text-center mb-6">
              This will permanently remove the listing, images, reviews, and analytics. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 border border-[#E9ECEF] text-[#212529] rounded-lg text-sm font-semibold hover:border-[#212529] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirm.id)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-[#FF6B6B] text-white rounded-lg text-sm font-semibold hover:bg-red-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
