'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
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
} from 'lucide-react'
import { ICON_SIZES } from '@/lib/constants'

type PropertyWithStats = any // TODO: Type this properly

type SortOption = 'newest' | 'oldest' | 'most-views' | 'most-inquiries' | 'price-high' | 'price-low'
type StatusFilter = 'all' | 'active' | 'inactive'
type TypeFilter = 'all' | 'rent' | 'sale'
type VerificationFilter = 'all' | 'pending' | 'approved' | 'rejected'

export default function MyPropertiesList({ properties }: { properties: PropertyWithStats[] }) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [resendingId, setResendingId] = useState<string | null>(null)

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
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mb-6 border border-border">
          <Building2 size={ICON_SIZES['2xl']} className="text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">No properties yet</h2>
        <p className="text-muted-foreground mb-8 max-w-sm text-center">
          Start earning by listing your first property. It only takes a few minutes.
        </p>
        <Link
          href="/dashboard/new-property"
          className="inline-flex items-center gap-2 bg-foreground text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-black hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <Sparkles size={ICON_SIZES.lg} />
          List Your First Property
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Properties</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.total} {stats.total === 1 ? 'property' : 'properties'} &middot; {stats.active} active
          </p>
        </div>
      </div>

      {/* Pending Verification Banner */}
      {stats.pending > 0 && (
        <div className="bg-amber-50 border border-amber-400/40 rounded-xl px-5 py-4 flex items-start sm:items-center gap-3">
          <ShieldAlert size={ICON_SIZES.lg} className="text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {stats.pending} {stats.pending === 1 ? 'property' : 'properties'} pending verification
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Our team is reviewing your listing. This usually takes less than 24 hours.
            </p>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-border p-4 hover:border-muted-foreground transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
              <Eye size={ICON_SIZES.lg} className="text-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-foreground tabular-nums">{stats.totalViews.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total views</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 hover:border-muted-foreground transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
              <Heart size={ICON_SIZES.lg} className="text-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-foreground tabular-nums">{stats.totalSaves.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Saves</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 hover:border-muted-foreground transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageSquare size={ICON_SIZES.lg} className="text-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-foreground tabular-nums">{stats.totalInquiries}</p>
              <p className="text-xs text-muted-foreground">Inquiries</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 hover:border-muted-foreground transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
              <BarChart3 size={ICON_SIZES.lg} className="text-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-foreground tabular-nums">
                {stats.totalViews > 0 ? `${((stats.totalInquiries / stats.totalViews) * 100).toFixed(1)}%` : '—'}
              </p>
              <p className="text-xs text-muted-foreground">Conversion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar — Search + Filters + Sort */}
      <div className="bg-white rounded-xl border border-border p-3 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, city, or neighborhood..."
            className="w-full pl-9 pr-4 py-2.5 text-sm text-foreground bg-muted border border-border rounded-lg placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:bg-white transition-colors"
          />
        </div>

        {/* Filters row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Type pills */}
            <div className="flex items-center bg-muted rounded-lg p-0.5 border border-border">
              {(['all', 'rent', 'sale'] as TypeFilter[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    typeFilter === t 
                      ? 'bg-foreground text-white shadow-sm' 
                      : 'text-foreground hover:bg-white'
                  }`}
                >
                  {t === 'all' ? 'All' : t === 'rent' ? `Rent (${stats.rent})` : `Sale (${stats.sale})`}
                </button>
              ))}
            </div>

            {/* Status pills */}
            <div className="flex items-center bg-muted rounded-lg p-0.5 border border-border">
              {(['all', 'active', 'inactive'] as StatusFilter[]).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                    statusFilter === s 
                      ? 'bg-foreground text-white shadow-sm' 
                      : 'text-foreground hover:bg-white'
                  }`}
                >
                  {s === 'active' && <CheckCircle2 size={ICON_SIZES.xs} />}
                  {s === 'inactive' && <Clock size={ICON_SIZES.xs} />}
                  {s === 'all' ? 'All' : s === 'active' ? `Active (${stats.active})` : `Inactive (${stats.inactive})`}
                </button>
              ))}
            </div>

            {/* Verification pills */}
            {(stats.pending > 0 || stats.rejected > 0) && (
              <div className="flex items-center bg-muted rounded-lg p-0.5 border border-border">
                {(['all', 'pending', 'approved', 'rejected'] as VerificationFilter[]).map(v => {
                  const count = v === 'pending' ? stats.pending : v === 'approved' ? stats.verified : v === 'rejected' ? stats.rejected : stats.total
                  if (v !== 'all' && count === 0) return null
                  return (
                    <button
                      key={v}
                      onClick={() => setVerificationFilter(v)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                        verificationFilter === v 
                          ? 'bg-foreground text-white shadow-sm' 
                          : 'text-foreground hover:bg-white'
                      }`}
                    >
                      {v === 'pending' && <ShieldAlert size={ICON_SIZES.xs} />}
                      {v === 'approved' && <ShieldCheck size={ICON_SIZES.xs} />}
                      {v === 'rejected' && <ShieldX size={ICON_SIZES.xs} />}
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
              className="appearance-none pl-3 pr-8 py-2 bg-muted border border-border rounded-lg text-xs font-semibold text-foreground hover:border-muted-foreground focus:border-foreground focus:outline-none transition-all cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="most-views">Most views</option>
              <option value="most-inquiries">Most inquiries</option>
              <option value="price-high">Price high</option>
              <option value="price-low">Price low</option>
            </select>
            <ArrowUpDown size={ICON_SIZES.xs} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground px-1">
        {filteredProperties.length === properties.length
          ? `${properties.length} ${properties.length === 1 ? 'property' : 'properties'}`
          : `${filteredProperties.length} of ${properties.length} properties`}
      </p>

      {/* Property List */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter size={ICON_SIZES.xl} className="text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">No properties match</h3>
          <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters or search</p>
          <button
            onClick={() => {
              setStatusFilter('all')
              setTypeFilter('all')
              setVerificationFilter('all')
              setSearchQuery('')
            }}
            className="text-sm font-semibold text-foreground underline underline-offset-4 hover:text-black"
          >
            Clear all filters
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
                className={`group bg-white rounded-xl border overflow-hidden transition-all duration-200 hover:shadow-md ${
                  isPending ? 'border-amber-400/50' : isRejected ? 'border-warning/40' : 'border-border hover:border-foreground'
                }`}
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <Link 
                    href={`/property/${property.slug || property.id}`}
                    className="relative w-full sm:w-52 md:w-56 h-48 sm:h-auto flex-shrink-0 overflow-hidden bg-muted"
                  >
                    {image ? (
                      <img 
                        src={image.url} 
                        alt={property.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center min-h-[160px]">
                        <Building2 size={ICON_SIZES['2xl']} className="text-muted-foreground" />
                      </div>
                    )}
                    {/* Top-left badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase tracking-wide backdrop-blur-sm ${
                        isForSale 
                          ? 'bg-foreground/90 text-white' 
                          : 'bg-white/90 text-foreground'
                      }`}>
                        {isForSale ? 'Sale' : 'Rent'}
                      </span>
                      {/* Verification badge */}
                      {verificationStatus !== 'approved' && (
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-md flex items-center gap-1 backdrop-blur-sm ${
                          isPending
                            ? 'bg-amber-400/90 text-foreground'
                            : 'bg-warning/90 text-white'
                        }`}>
                          {isPending ? <ShieldAlert size={ICON_SIZES.xs} /> : <ShieldX size={ICON_SIZES.xs} />}
                          {isPending ? 'Pending' : 'Rejected'}
                        </span>
                      )}
                    </div>
                    {/* Bottom-left status */}
                    <div className="absolute bottom-3 left-3">
                      <span className={`px-2 py-1 text-[10px] font-semibold rounded-md flex items-center gap-1 backdrop-blur-sm ${
                        isActive 
                          ? 'bg-success/90 text-white' 
                          : 'bg-muted-foreground/80 text-white'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-muted-foreground'}`} />
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
                            className="text-base font-bold text-foreground hover:underline underline-offset-2 line-clamp-1 block"
                          >
                            {property.title}
                          </Link>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                            <MapPin size={ICON_SIZES.xs} className="flex-shrink-0 text-muted-foreground" />
                            <span className="line-clamp-1">
                              {[property.neighborhood, property.city].filter(Boolean).join(', ') || property.address}
                            </span>
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-foreground tabular-nums">
                            ${price ? (price / 100).toLocaleString() : '0'}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                            {isForSale ? 'sale price' : 'per month'}
                          </p>
                        </div>
                      </div>

                      {/* Property specs + date */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                        {property.beds > 0 && (
                          <span className="flex items-center gap-1">
                            <Bed size={ICON_SIZES.xs} className="text-muted-foreground" /> 
                            <span className="font-semibold text-foreground">{property.beds}</span> bed
                          </span>
                        )}
                        {property.baths > 0 && (
                          <span className="flex items-center gap-1">
                            <Bath size={ICON_SIZES.xs} className="text-muted-foreground" /> 
                            <span className="font-semibold text-foreground">{property.baths}</span> bath
                          </span>
                        )}
                        {property.sqft > 0 && (
                          <span className="flex items-center gap-1">
                            <Square size={ICON_SIZES.xs} className="text-muted-foreground" /> 
                            <span className="font-semibold text-foreground">{property.sqft.toLocaleString()}</span> sqft
                          </span>
                        )}
                        <span className="ml-auto flex items-center gap-1 text-muted-foreground">
                          <Calendar size={ICON_SIZES.xs} /> {formatTimeAgo(property.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Bottom row: stats bar + actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
                      {/* Inline stats */}
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Eye size={ICON_SIZES.xs} className="text-muted-foreground" />
                          <span className="font-bold text-foreground tabular-nums">{property.stats.views}</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Heart size={ICON_SIZES.xs} className="text-muted-foreground" />
                          <span className="font-bold text-foreground tabular-nums">{property.stats.saves}</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MessageSquare size={ICON_SIZES.xs} className="text-muted-foreground" />
                          <span className="font-bold text-foreground tabular-nums">{property.stats.inquiries}</span>
                        </span>
                        {property.stats.views > 0 && (
                          <span className="hidden sm:flex items-center gap-1 text-[10px] font-semibold text-success bg-success/10 px-2 py-1 rounded-md">
                            <TrendingUp size={ICON_SIZES.xs} />
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
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-foreground bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/50 rounded-lg transition-all disabled:opacity-50"
                            title="Resend verification email"
                          >
                            {resendingId === property.id ? (
                              <Loader2 size={ICON_SIZES.sm} className="animate-spin" />
                            ) : (
                              <Mail size={ICON_SIZES.sm} />
                            )}
                            <span className="hidden sm:inline">Resend</span>
                          </button>
                        )}
                        <Link
                          href={`/property/${property.slug || property.id}`}
                          target="_blank"
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all border border-border"
                          title="View listing"
                        >
                          <ExternalLink size={ICON_SIZES.sm} />
                        </Link>
                        <Link
                          href={`/dashboard/edit-property/${property.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-foreground hover:bg-black rounded-lg transition-all"
                        >
                          <Pencil size={ICON_SIZES.sm} />
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
    </div>
  )
}
