'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
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
  ChevronDown,
  MoreVertical,
  TrendingUp,
  Copy,
  Archive,
  ArrowUpDown
} from 'lucide-react'

type PropertyWithStats = any // TODO: Type this properly

type SortOption = 'newest' | 'oldest' | 'most-views' | 'most-inquiries' | 'price-high' | 'price-low'
type StatusFilter = 'all' | 'active' | 'inactive'
type TypeFilter = 'all' | 'rent' | 'sale'

export default function MyPropertiesList({ properties }: { properties: PropertyWithStats[] }) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    let filtered = properties.filter(p => {
      const statusMatch = statusFilter === 'all' || p.status === statusFilter
      const typeMatch = typeFilter === 'all' || 
        (typeFilter === 'rent' && (!p.listing_type || p.listing_type === 'rent')) ||
        (typeFilter === 'sale' && p.listing_type === 'sale')
      return statusMatch && typeMatch
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'most-views':
          return b.stats.views - a.stats.views
        case 'most-inquiries':
          return b.stats.inquiries - a.stats.inquiries
        case 'price-high':
          const priceB = b.listing_type === 'sale' ? b.sale_price : b.price
          const priceA = a.listing_type === 'sale' ? a.sale_price : a.price
          return (priceB || 0) - (priceA || 0)
        case 'price-low':
          const priceB2 = b.listing_type === 'sale' ? b.sale_price : b.price
          const priceA2 = a.listing_type === 'sale' ? a.sale_price : a.price
          return (priceA2 || 0) - (priceB2 || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [properties, statusFilter, typeFilter, sortBy])

  const stats = useMemo(() => ({
    total: properties.length,
    active: properties.filter(p => p.status === 'active').length,
    rent: properties.filter(p => !p.listing_type || p.listing_type === 'rent').length,
    sale: properties.filter(p => p.listing_type === 'sale').length,
    totalViews: properties.reduce((sum, p) => sum + p.stats.views, 0),
    totalInquiries: properties.reduce((sum, p) => sum + p.stats.inquiries, 0),
  }), [properties])

  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-12 sm:p-16 text-center">
        <div className="w-24 h-24 bg-[#F8F9FA] rounded-full flex items-center justify-center mx-auto mb-6">
          <Building2 size={40} className="text-[#ADB5BD]" />
        </div>
        <h2 className="text-2xl font-bold text-[#212529] mb-3">No properties yet</h2>
        <p className="text-[#495057] mb-8 max-w-md mx-auto text-lg">
          Start earning by listing your first property. It only takes a few minutes.
        </p>
        <Link
          href="/dashboard/new-property"
          className="inline-flex items-center gap-2 bg-[#212529] text-white px-8 py-4 rounded-xl font-medium hover:bg-black hover:shadow-lg hover:-translate-y-0.5 transition-all text-lg"
        >
          <Sparkles size={20} />
          List Your First Property
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border-2 border-[#E9ECEF] p-6 hover:border-[#ADB5BD] transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#495057] font-medium mb-1">Total Properties</p>
              <p className="text-4xl font-bold text-[#212529]">{stats.total}</p>
            </div>
            <div className="w-14 h-14 bg-[#F8F9FA] rounded-2xl flex items-center justify-center">
              <Building2 size={28} className="text-[#212529]" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#E9ECEF] flex items-center gap-4 text-xs">
            <span className="text-[#495057]">
              <span className="font-bold text-[#212529]">{stats.active}</span> active
            </span>
            <span className="text-[#495057]">
              <span className="font-bold text-[#212529]">{stats.rent}</span> rent
            </span>
            <span className="text-[#495057]">
              <span className="font-bold text-[#212529]">{stats.sale}</span> sale
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-[#E9ECEF] p-6 hover:border-[#ADB5BD] transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#495057] font-medium mb-1">Total Views</p>
              <p className="text-4xl font-bold text-[#212529]">{stats.totalViews.toLocaleString()}</p>
            </div>
            <div className="w-14 h-14 bg-[#F8F9FA] rounded-2xl flex items-center justify-center">
              <Eye size={28} className="text-[#212529]" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#E9ECEF]">
            <p className="text-xs text-[#495057]">
              Avg <span className="font-bold text-[#212529]">{stats.total > 0 ? Math.round(stats.totalViews / stats.total) : 0}</span> views per property
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-[#E9ECEF] p-6 hover:border-[#ADB5BD] transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#495057] font-medium mb-1">Total Inquiries</p>
              <p className="text-4xl font-bold text-[#212529]">{stats.totalInquiries}</p>
            </div>
            <div className="w-14 h-14 bg-[#F8F9FA] rounded-2xl flex items-center justify-center">
              <MessageSquare size={28} className="text-[#212529]" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#E9ECEF]">
            <p className="text-xs text-[#495057]">
              {stats.totalViews > 0 ? (
                <>
                  <span className="font-bold text-[#212529]">{((stats.totalInquiries / stats.totalViews) * 100).toFixed(1)}%</span> conversion rate
                </>
              ) : (
                'No views yet'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border-2 border-[#E9ECEF] p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Left: Filters */}
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Type Filter */}
            <div className="flex items-center bg-[#F8F9FA] rounded-xl p-1 border border-[#E9ECEF]">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  typeFilter === 'all' 
                    ? 'bg-[#212529] text-white shadow-sm' 
                    : 'text-[#495057] hover:text-[#212529]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTypeFilter('rent')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  typeFilter === 'rent' 
                    ? 'bg-[#212529] text-white shadow-sm' 
                    : 'text-[#495057] hover:text-[#212529]'
                }`}
              >
                Rent <span className="opacity-60">({stats.rent})</span>
              </button>
              <button
                onClick={() => setTypeFilter('sale')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  typeFilter === 'sale' 
                    ? 'bg-[#212529] text-white shadow-sm' 
                    : 'text-[#495057] hover:text-[#212529]'
                }`}
              >
                Sale <span className="opacity-60">({stats.sale})</span>
              </button>
            </div>

            <div className="h-8 w-px bg-[#E9ECEF]" />

            {/* Status Filter */}
            <div className="flex items-center bg-[#F8F9FA] rounded-xl p-1 border border-[#E9ECEF]">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === 'all' 
                    ? 'bg-[#212529] text-white shadow-sm' 
                    : 'text-[#495057] hover:text-[#212529]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  statusFilter === 'active' 
                    ? 'bg-[#212529] text-white shadow-sm' 
                    : 'text-[#495057] hover:text-[#212529]'
                }`}
              >
                <CheckCircle2 size={14} />
                Active <span className="opacity-60">({stats.active})</span>
              </button>
              <button
                onClick={() => setStatusFilter('inactive')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  statusFilter === 'inactive' 
                    ? 'bg-[#212529] text-white shadow-sm' 
                    : 'text-[#495057] hover:text-[#212529]'
                }`}
              >
                <Clock size={14} />
                Inactive <span className="opacity-60">({stats.total - stats.active})</span>
              </button>
            </div>
          </div>

          {/* Right: Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#495057] font-medium whitespace-nowrap">Sort by:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none pl-4 pr-10 py-2 bg-white border-2 border-[#E9ECEF] rounded-xl text-sm font-semibold text-[#212529] hover:border-[#212529] focus:border-[#212529] focus:outline-none focus:ring-2 focus:ring-[#212529]/10 transition-all cursor-pointer min-w-[180px]"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="most-views">Most views</option>
                <option value="most-inquiries">Most inquiries</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
              </select>
              <ArrowUpDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#495057] pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E9ECEF] p-12 text-center">
          <div className="w-20 h-20 bg-[#F8F9FA] rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} className="text-[#ADB5BD]" />
          </div>
          <h3 className="text-lg font-semibold text-[#212529] mb-2">No properties found</h3>
          <p className="text-[#495057]">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProperties.map((property, index) => {
            const image = property.property_images?.find((img: any) => img.is_primary) 
              || property.property_images?.sort((a: any, b: any) => a.order - b.order)[0]
            const isActive = property.status === 'active'
            const isForSale = property.listing_type === 'sale'
            const price = isForSale ? property.sale_price : property.price
            const daysAgo = Math.floor((Date.now() - new Date(property.created_at).getTime()) / (1000 * 60 * 60 * 24))

            return (
              <div
                key={property.id}
                className="group bg-white rounded-2xl border-2 border-[#E9ECEF] overflow-hidden hover:border-[#212529] hover:shadow-xl transition-all duration-300"
                style={{ 
                  animation: 'fadeIn 0.5s ease-out',
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both'
                }}
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <Link 
                    href={`/property/${property.slug || property.id}`}
                    className="relative w-full sm:w-64 h-56 sm:h-auto flex-shrink-0 overflow-hidden bg-[#F8F9FA]"
                  >
                    {image ? (
                      <img 
                        src={image.url} 
                        alt={property.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 size={48} className="text-[#ADB5BD]" />
                      </div>
                    )}
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-lg backdrop-blur-sm ${
                        isForSale 
                          ? 'bg-[#212529]/90 text-white' 
                          : 'bg-white/90 text-[#212529] shadow-lg'
                      }`}>
                        {isForSale ? 'FOR SALE' : 'FOR RENT'}
                      </span>
                      <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 backdrop-blur-sm ${
                        isActive 
                          ? 'bg-[#51CF66]/90 text-white' 
                          : 'bg-[#ADB5BD]/90 text-white'
                      }`}>
                        {isActive ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/property/${property.slug || property.id}`}
                          className="text-xl font-bold text-[#212529] hover:underline line-clamp-2 leading-tight mb-2 block"
                        >
                          {property.title}
                        </Link>
                        <p className="text-sm text-[#495057] flex items-center gap-2">
                          <MapPin size={16} className="flex-shrink-0" />
                          <span className="line-clamp-1">
                            {[property.neighborhood, property.city].filter(Boolean).join(', ') || property.address}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right flex-shrink-0">
                          <p className="text-2xl font-bold text-[#212529]">
                            ${price?.toLocaleString()}
                          </p>
                          {!isForSale && <p className="text-xs text-[#495057] font-medium">per month</p>}
                        </div>
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="flex flex-wrap items-center gap-5 mb-5 pb-5 border-b border-[#E9ECEF]">
                      {property.beds && (
                        <span className="flex items-center gap-2 text-[#495057]">
                          <Bed size={18} className="text-[#ADB5BD]" /> 
                          <span className="font-semibold text-[#212529]">{property.beds}</span> bed
                        </span>
                      )}
                      {property.baths && (
                        <span className="flex items-center gap-2 text-[#495057]">
                          <Bath size={18} className="text-[#ADB5BD]" /> 
                          <span className="font-semibold text-[#212529]">{property.baths}</span> bath
                        </span>
                      )}
                      {property.sqft && (
                        <span className="flex items-center gap-2 text-[#495057]">
                          <Square size={18} className="text-[#ADB5BD]" /> 
                          <span className="font-semibold text-[#212529]">{property.sqft.toLocaleString()}</span> sqft
                        </span>
                      )}
                      <div className="ml-auto flex items-center gap-2 text-sm text-[#ADB5BD]">
                        <Calendar size={14} /> 
                        {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`}
                      </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                          <span className="text-2xl font-bold text-[#212529]">{property.stats.views}</span>
                          <span className="text-xs text-[#495057] flex items-center gap-1">
                            <Eye size={12} /> views
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-2xl font-bold text-[#212529]">{property.stats.saves}</span>
                          <span className="text-xs text-[#495057] flex items-center gap-1">
                            <Heart size={12} /> saves
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-2xl font-bold text-[#212529]">{property.stats.inquiries}</span>
                          <span className="text-xs text-[#495057] flex items-center gap-1">
                            <MessageSquare size={12} /> inquiries
                          </span>
                        </div>
                        
                        {property.stats.views > 0 && (
                          <div className="flex items-center gap-2 text-sm text-[#51CF66] bg-[#51CF66]/10 px-3 py-2 rounded-lg font-medium">
                            <TrendingUp size={16} />
                            {((property.stats.inquiries / property.stats.views) * 100).toFixed(1)}% conversion
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/property/${property.slug || property.id}`}
                          target="_blank"
                          className="p-3 text-[#495057] hover:text-[#212529] hover:bg-[#F8F9FA] rounded-xl transition-all border border-[#E9ECEF] hover:border-[#ADB5BD]"
                          title="View listing"
                        >
                          <ExternalLink size={18} />
                        </Link>
                        <Link
                          href={`/dashboard/edit-property/${property.id}`}
                          className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#212529] hover:bg-black rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5"
                        >
                          <Pencil size={16} />
                          Edit Property
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
    </>
  )
}
