import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Search, 
  Heart, 
  MessageSquare, 
  ArrowRight, 
  Home,
  Sparkles,
  MapPin,
  TrendingUp,
  Eye,
  Building2,
  ChevronRight,
  Star,
  Calendar,
  ArrowUpRight,
  BarChart3,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
} from 'lucide-react'
import RetryVerificationButton from '@/components/dashboard/RetryVerificationButton'
import { OpenChatButton, OpenChatConversation } from '@/components/chat/OpenChatButton'
import { ICON_SIZES } from '@/lib/constants'

function formatTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default async function DashboardOverviewPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/dashboard')
  }

  // Parallelize all queries
  const [
    { data: profile },
    { count: savedCount },
    { count: propertyCount },
    { count: conversationCount },
    { data: recentProperties },
    { data: userProperties },
    { data: recentConversations },
    { count: reviewCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('saved_properties').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('properties').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).or(`landlord_id.eq.${user.id},renter_id.eq.${user.id}`),
    supabase.from('properties').select('id, title, slug, city, neighborhood, price, sale_price, listing_type, property_images(url, is_primary)').eq('status', 'active').eq('verification_status', 'approved').order('created_at', { ascending: false }).limit(4),
    supabase.from('properties').select('id, title, slug, status, verification_status, price, sale_price, listing_type, city, neighborhood, created_at, property_images(url, is_primary)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
    supabase.from('conversations').select('id, last_message_preview, last_message_at, property_id, properties:property_id(title, slug), profiles:renter_id(name, avatar_url)').or(`landlord_id.eq.${user.id},renter_id.eq.${user.id}`).order('last_message_at', { ascending: false }).limit(3),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('author_id', user.id),
  ])

  // Get total views for landlord's properties
  let totalViews = 0
  if (profile?.role === 'landlord' && userProperties && userProperties.length > 0) {
    const propertyIds = userProperties.map(p => p.id)
    const { count } = await supabase
      .from('property_views')
      .select('*', { count: 'exact', head: true })
      .in('property_id', propertyIds)
    totalViews = count || 0
  }

  const isLandlord = profile?.role === 'landlord'
  const userName = profile?.name || user.email?.split('@')[0] || 'User'
  const firstName = userName.split(' ')[0]
  
  // Time-based greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  // Format the current date
  const today = new Date()
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-wider mb-2 text-[#ADB5BD]">{dateString}</p>
            <h1 className="text-page-title">
              {greeting}, {firstName}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {isLandlord ? (
              <Link
                href="/dashboard/my-properties"
                className="btn btn-secondary inline-flex items-center gap-2"
              >
                <Building2 size={ICON_SIZES.sm} />
                My Properties
              </Link>
            ) : (
              <Link
                href="/search"
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <Search size={ICON_SIZES.sm} />
                Find a home
              </Link>
            )}
          </div>
        </div>

        {/* Stat Cards */}
        <div className={`grid gap-3 mb-8 ${isLandlord ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-3'}`}>
          {/* Properties / Saved */}
          <Link 
            href={isLandlord ? '/dashboard/my-properties' : '/dashboard/saved'}
            className="group bg-white rounded-xl border border-[#E9ECEF] p-6 card-hover-subtle"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-[#F8F9FA] rounded-lg flex items-center justify-center group-hover:bg-black transition-colors">
                {isLandlord ? (
                  <Building2 size={ICON_SIZES.md} className="text-[#495057] group-hover:text-white transition-colors" />
                ) : (
                  <Heart size={ICON_SIZES.md} className="text-[#495057] group-hover:text-white transition-colors" />
                )}
              </div>
              <ArrowUpRight size={ICON_SIZES.sm} className="text-[#ADB5BD] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-2xl font-bold text-black tabular-nums">{isLandlord ? propertyCount || 0 : savedCount || 0}</p>
            <p className="text-xs text-[#495057] font-medium mt-0.5">
              {isLandlord ? 'Properties' : 'Saved'}
            </p>
          </Link>

          {/* Conversations */}
          <OpenChatButton className="group bg-white rounded-xl border border-[#E9ECEF] p-6 card-hover-subtle relative text-left cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-[#F8F9FA] rounded-lg flex items-center justify-center group-hover:bg-black transition-colors relative">
                <MessageSquare size={ICON_SIZES.md} className="text-[#495057] group-hover:text-white transition-colors" />
              </div>
              {(conversationCount || 0) > 0 && (
                <span className="w-5 h-5 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {conversationCount! > 9 ? '9+' : conversationCount}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-black tabular-nums">{conversationCount || 0}</p>
            <p className="text-xs text-[#495057] font-medium mt-0.5">Conversations</p>
          </OpenChatButton>

          {/* Landlord: Views */}
          {isLandlord && (
            <div className="bg-white rounded-xl border border-[#E9ECEF] p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 bg-[#F8F9FA] rounded-lg flex items-center justify-center">
                  <Eye size={ICON_SIZES.md} className="text-[#495057]" />
                </div>
              </div>
              <p className="text-2xl font-bold text-black tabular-nums">{totalViews}</p>
              <p className="text-xs text-[#495057] font-medium mt-0.5">Total Views</p>
            </div>
          )}

          {/* Reviews / Browse */}
          {isLandlord ? (
            <Link 
              href="/dashboard/reviews"
              className="group bg-white rounded-xl border border-[#E9ECEF] p-6 card-hover-subtle"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 bg-[#F8F9FA] rounded-lg flex items-center justify-center group-hover:bg-black transition-colors">
                  <Star size={ICON_SIZES.md} className="text-[#495057] group-hover:text-white transition-colors" />
                </div>
                <ArrowUpRight size={ICON_SIZES.sm} className="text-[#ADB5BD] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-bold text-black tabular-nums">{reviewCount || 0}</p>
              <p className="text-xs text-[#495057] font-medium mt-0.5">Reviews</p>
            </Link>
          ) : (
            <Link 
              href="/areas"
              className="group bg-white rounded-xl border border-[#E9ECEF] p-6 card-hover-subtle"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 bg-[#F8F9FA] rounded-lg flex items-center justify-center group-hover:bg-black transition-colors">
                  <MapPin size={ICON_SIZES.md} className="text-[#495057] group-hover:text-white transition-colors" />
                </div>
                <ArrowUpRight size={ICON_SIZES.sm} className="text-[#ADB5BD] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-bold text-black tabular-nums">Explore</p>
              <p className="text-xs text-[#495057] font-medium mt-0.5">Area Guides</p>
            </Link>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left Column - Properties */}
          <div className="lg:col-span-3 space-y-6">

            {/* Landlord: My Properties List */}
            {isLandlord && userProperties && userProperties.length > 0 && (
              <div className="bg-white rounded-xl border border-[#E9ECEF] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F3F5]">
                  <h2 className="text-sm font-semibold text-black">Your Listings</h2>
                  <Link href="/dashboard/my-properties" className="text-xs text-[#495057] hover:text-black font-medium flex items-center gap-1 transition-colors">
                    View all <ChevronRight size={ICON_SIZES.xs} />
                  </Link>
                </div>
                <div className="p-4 space-y-3">
                  {userProperties.map((property) => {
                    const primaryImage = property.property_images?.find((img: any) => img.is_primary) || property.property_images?.[0]
                    const price = property.listing_type === 'sale' ? property.sale_price : property.price
                    const priceDisplay = property.listing_type === 'sale' 
                      ? `$${((price || 0) / 100).toLocaleString()}`
                      : `$${((price || 0) / 100).toLocaleString()}/mo`
                    const location = [property.neighborhood, property.city].filter(Boolean).join(', ')
                    
                    return (
                      <div
                        key={property.id}
                        className="group rounded-xl border border-[#E9ECEF] hover:border-black overflow-hidden transition-all hover:shadow-sm"
                      >
                        <div className="flex gap-0">
                          {/* Thumbnail */}
                          <div className="relative w-28 sm:w-36 flex-shrink-0 bg-[#F8F9FA]">
                            {primaryImage?.url ? (
                              <Image
                                src={primaryImage.url}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="144px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center min-h-[100px]">
                                <Home size={ICON_SIZES.xl} className="text-[#ADB5BD]" />
                              </div>
                            )}
                            {/* Listing type badge on image */}
                            <div className="absolute top-2 left-2">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                property.listing_type === 'sale'
                                  ? 'bg-black text-white'
                                  : 'bg-white/90 text-[#212529] backdrop-blur-sm'
                              }`}>
                                {property.listing_type === 'sale' ? 'Sale' : 'Rent'}
                              </span>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="flex-1 p-3.5 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <Link
                                  href={`/property/${property.slug || property.id}`}
                                  className="text-sm font-semibold text-[#212529] truncate hover:underline underline-offset-2 block"
                                >
                                  {property.title}
                                </Link>
                                {/* Combined status: verification_status takes priority for display */}
                                {(() => {
                                  const vs = property.verification_status || 'pending'
                                  const st = property.status

                                  // Determine display label, colors, icon
                                  if (vs === 'rejected') {
                                    return (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 bg-[#FF6B6B]/10 text-[#FF6B6B]">
                                        <ShieldX size={ICON_SIZES.xs} />
                                        Rejected
                                      </span>
                                    )
                                  }
                                  if (vs === 'pending') {
                                    return (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 bg-[#495057]/10 text-[#495057]">
                                        <ShieldAlert size={ICON_SIZES.xs} />
                                        Pending
                                      </span>
                                    )
                                  }
                                  // vs === 'approved' — show listing status
                                  if (st === 'rented' || st === 'sold') {
                                    return (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 bg-[#212529]/10 text-[#212529]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#212529]" />
                                        {st === 'rented' ? 'Rented' : 'Sold'}
                                      </span>
                                    )
                                  }
                                  if (st === 'draft') {
                                    return (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 bg-[#ADB5BD]/10 text-[#495057]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#ADB5BD]" />
                                        Draft
                                      </span>
                                    )
                                  }
                                  // active + approved
                                  return (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 bg-[#51CF66]/10 text-[#51CF66]">
                                      <ShieldCheck size={ICON_SIZES.xs} />
                                      Live
                                    </span>
                                  )
                                })()}
                              </div>
                              {location && (
                                <p className="text-xs text-[#ADB5BD] flex items-center gap-1 mb-2">
                                <MapPin size={ICON_SIZES.xs} />
                                  {location}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-base font-bold text-[#212529]">
                                {priceDisplay}
                              </p>
                              <div className="flex items-center gap-2">
                                {/* Show retry verification for pending/rejected properties */}
                                {(property.verification_status === 'pending' || property.verification_status === 'rejected') && (
                                  <RetryVerificationButton propertyId={property.id} />
                                )}
                                <Link
                                  href={`/dashboard/edit-property/${property.id}`}
                                  className="text-[11px] font-medium text-[#495057] hover:text-black border border-[#E9ECEF] hover:border-black px-2.5 py-1 rounded-md transition-colors"
                                >
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
              </div>
            )}

            {/* Landlord: Empty Properties State */}
            {isLandlord && (!userProperties || userProperties.length === 0) && (
              <div className="bg-white rounded-xl border border-[#E9ECEF] p-8 text-center">
                <div className="w-14 h-14 bg-[#F8F9FA] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 size={ICON_SIZES.xl} className="text-[#ADB5BD]" />
                </div>
                <h3 className="text-base font-semibold text-black mb-1">No properties yet</h3>
                <p className="text-sm text-[#495057] mb-5 max-w-xs mx-auto">
                  List your first property and start receiving inquiries from verified renters.
                </p>
                <Link
                  href="/dashboard/new-property"
                  className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-black transition-colors"
                >
                  Create listing
                  <ArrowRight size={ICON_SIZES.sm} />
                </Link>
              </div>
            )}

            {/* Renter: Recently Added */}
            {!isLandlord && recentProperties && recentProperties.length > 0 && (
              <div className="bg-white rounded-xl border border-[#E9ECEF] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F3F5]">
                  <h2 className="text-sm font-semibold text-black">Recently Added</h2>
                  <Link href="/search" className="text-xs text-[#495057] hover:text-black font-medium flex items-center gap-1 transition-colors">
                    View all <ChevronRight size={ICON_SIZES.xs} />
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3 p-4">
                  {recentProperties.map((property) => {
                    const primaryImage = property.property_images?.find((img: any) => img.is_primary) || property.property_images?.[0]
                    const price = property.listing_type === 'sale' ? property.sale_price : property.price
                    const priceDisplay = property.listing_type === 'sale' 
                      ? `$${((price || 0) / 100).toLocaleString()}`
                      : `$${((price || 0) / 100).toLocaleString()}/mo`
                    
                    return (
                      <Link
                        key={property.id}
                        href={`/property/${property.slug || property.id}`}
                        className="group rounded-lg overflow-hidden border border-[#E9ECEF] hover:border-black hover:shadow-sm transition-all"
                      >
                        <div className="relative h-28 bg-[#F8F9FA]">
                          {primaryImage?.url ? (
                            <Image
                              src={primaryImage.url}
                              alt={property.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              sizes="(max-width: 768px) 50vw, 25vw"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Home size={ICON_SIZES.lg} className="text-[#ADB5BD]" />
                            </div>
                          )}
                          <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-[#212529]">
                            {priceDisplay}
                          </div>
                          {property.listing_type === 'sale' && (
                            <div className="absolute top-2 right-2 bg-black text-white px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                              Sale
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-xs font-medium text-[#212529] truncate group-hover:underline underline-offset-2">{property.title}</p>
                          <p className="text-[10px] text-[#ADB5BD] mt-0.5 flex items-center gap-1">
                            <MapPin size={ICON_SIZES.xs} />
                            {property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Renter: Empty saved state tip */}
            {!isLandlord && (savedCount || 0) === 0 && (
              <div className="bg-[#212529] rounded-xl p-6 text-white">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={ICON_SIZES.lg} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-white mb-1">Start saving favorites</h3>
                    <p className="text-sm text-white/70 mb-4">
                      Browse properties and tap the heart icon to save them here for easy comparison.
                    </p>
                    <Link 
                      href="/search" 
                      className="btn btn-primary inline-flex items-center gap-1.5"
                    >
                      <Search size={ICON_SIZES.sm} />
                      Browse properties
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Activity & Quick Links */}
          <div className="lg:col-span-2 space-y-6">

            {/* Recent Messages */}
            <div className="bg-white rounded-xl border border-[#E9ECEF] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F3F5]">
                <h2 className="text-sm font-semibold text-black">Recent Messages</h2>
                <OpenChatButton className="text-xs text-[#495057] hover:text-black font-medium flex items-center gap-1 transition-colors">
                  All <ChevronRight size={ICON_SIZES.xs} />
                </OpenChatButton>
              </div>
              {recentConversations && recentConversations.length > 0 ? (
                <div className="divide-y divide-[#E9ECEF]">
                  {recentConversations.map((convo: any) => {
                    const otherPerson = convo.profiles
                    const property = convo.properties
                    return (
                      <OpenChatConversation
                        key={convo.id}
                        conversationId={convo.id}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#F8F9FA] transition-colors group w-full text-left"
                      >
                        <div className="w-9 h-9 rounded-full bg-[#F8F9FA] flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#495057]">
                          {otherPerson?.avatar_url ? (
                            <Image
                              src={otherPerson.avatar_url}
                              alt={otherPerson.name || 'User'}
                              width={36}
                              height={36}
                              className="w-9 h-9 rounded-full object-cover"
                            />
                          ) : (
                            (otherPerson?.name || '?')[0].toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-[#212529] truncate">{otherPerson?.name || 'User'}</p>
                            {convo.last_message_at && (
                              <span className="text-[10px] text-[#ADB5BD] flex-shrink-0">{formatTimeAgo(convo.last_message_at)}</span>
                            )}
                          </div>
                          <p className="text-xs text-[#ADB5BD] truncate mt-0.5">
                            {convo.last_message_preview || (property?.title ? `Re: ${property.title}` : 'No messages yet')}
                          </p>
                        </div>
                      </OpenChatConversation>
                    )
                  })}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <MessageSquare size={ICON_SIZES.lg} className="mx-auto text-[#E9ECEF] mb-2" />
                  <p className="text-xs text-[#ADB5BD]">No conversations yet</p>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl border border-[#E9ECEF] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#F1F3F5]">
                <h2 className="text-sm font-semibold text-black">Quick Links</h2>
              </div>
              <div className="p-2">
                {(isLandlord ? [
                  { href: '/search', label: 'Browse market', desc: 'See competitor listings', icon: Search },
                  { href: '/dashboard/property-reviews', label: 'Property reviews', desc: 'Reviews on your listings', icon: Star },
                  { href: '/areas', label: 'Area guides', desc: 'Neighborhood insights', icon: MapPin },
                  { href: '/settings/profile', label: 'Edit profile', desc: 'Update your information', icon: Calendar },
                ] : [
                  { href: '/dashboard/saved', label: 'Saved properties', desc: `${savedCount || 0} saved`, icon: Heart },
                  { href: '/dashboard/reviews', label: 'My reviews', desc: `${reviewCount || 0} written`, icon: Star },
                  { href: '/areas', label: 'Area guides', desc: 'Explore neighborhoods', icon: MapPin },
                  { href: '/settings/profile', label: 'Edit profile', desc: 'Update your info', icon: Calendar },
                ]).map(({ href, label, desc, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#F8F9FA] transition-colors group"
                  >
                    <div className="w-8 h-8 bg-[#F8F9FA] rounded-lg flex items-center justify-center group-hover:bg-black transition-colors flex-shrink-0">
                      <Icon size={ICON_SIZES.sm} className="text-[#495057] group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#212529]">{label}</p>
                      <p className="text-[10px] text-[#ADB5BD]">{desc}</p>
                    </div>
                    <ChevronRight size={ICON_SIZES.sm} className="text-[#E9ECEF] group-hover:text-[#ADB5BD] transition-colors flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Landlord: Performance Snapshot */}
            {isLandlord && (propertyCount || 0) > 0 && (
              <div className="bg-[#212529] rounded-xl p-5 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 size={ICON_SIZES.md} className="text-white/60" />
                  <h3 className="text-sm font-semibold">Performance</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/[0.06] rounded-lg p-3">
                    <p className="text-xl font-bold tabular-nums">{propertyCount || 0}</p>
                    <p className="text-[10px] text-white/70 font-medium uppercase tracking-wider mt-0.5">Listings</p>
                  </div>
                  <div className="bg-white/[0.06] rounded-lg p-3">
                    <p className="text-xl font-bold tabular-nums">{totalViews}</p>
                    <p className="text-[10px] text-white/70 font-medium uppercase tracking-wider mt-0.5">Views</p>
                  </div>
                  <div className="bg-white/[0.06] rounded-lg p-3">
                    <p className="text-xl font-bold tabular-nums">{conversationCount || 0}</p>
                    <p className="text-[10px] text-white/70 font-medium uppercase tracking-wider mt-0.5">Inquiries</p>
                  </div>
                  <div className="bg-white/[0.06] rounded-lg p-3">
                    <p className="text-xl font-bold tabular-nums">{reviewCount || 0}</p>
                    <p className="text-[10px] text-white/70 font-medium uppercase tracking-wider mt-0.5">Reviews</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
