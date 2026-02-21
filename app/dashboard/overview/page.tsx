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
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-small uppercase tracking-wider mb-2">{dateString}</p>
            <h1 className="text-page-title">
              {greeting}, {firstName}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {isLandlord ? (
              <Link
                href="/dashboard/my-properties"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border px-4 py-2 rounded-lg hover:border-foreground transition-all"
              >
                <Building2 size={15} />
                My Properties
              </Link>
            ) : (
              <Link
                href="/search"
                className="inline-flex items-center gap-2 text-sm font-medium text-white bg-[#212529] px-4 py-2 rounded-lg hover:bg-black transition-all"
              >
                <Search size={15} />
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
            className="group bg-card rounded-xl border border-border p-5 hover:border-foreground transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center group-hover:bg-foreground transition-colors">
                {isLandlord ? (
                  <Building2 size={17} className="text-muted-foreground group-hover:text-white transition-colors" />
                ) : (
                  <Heart size={17} className="text-muted-foreground group-hover:text-white transition-colors" />
                )}
              </div>
              <ArrowUpRight size={14} className="text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-stat-sm">{isLandlord ? propertyCount || 0 : savedCount || 0}</p>
            <p className="text-stat-label mt-0.5">
              {isLandlord ? 'Properties' : 'Saved'}
            </p>
          </Link>

          {/* Conversations */}
          <OpenChatButton className="group bg-card rounded-xl border border-border p-5 hover:border-foreground transition-all hover:shadow-md relative text-left cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center group-hover:bg-foreground transition-colors relative">
                <MessageSquare size={17} className="text-muted-foreground group-hover:text-white transition-colors" />
              </div>
              {(conversationCount || 0) > 0 && (
                <span className="w-5 h-5 bg-foreground text-background text-[10px] font-bold rounded-full flex items-center justify-center">
                  {conversationCount! > 9 ? '9+' : conversationCount}
                </span>
              )}
            </div>
            <p className="text-stat-sm">{conversationCount || 0}</p>
            <p className="text-stat-label mt-0.5">Conversations</p>
          </OpenChatButton>

          {/* Landlord: Views */}
          {isLandlord && (
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center">
                  <Eye size={17} className="text-muted-foreground" />
                </div>
              </div>
              <p className="text-stat-sm">{totalViews}</p>
              <p className="text-stat-label mt-0.5">Total Views</p>
            </div>
          )}

          {/* Reviews / Browse */}
          {isLandlord ? (
            <Link 
              href="/dashboard/reviews"
              className="group bg-card rounded-xl border border-border p-5 hover:border-foreground transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center group-hover:bg-foreground transition-colors">
                  <Star size={17} className="text-muted-foreground group-hover:text-white transition-colors" />
                </div>
                <ArrowUpRight size={14} className="text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-stat-sm">{reviewCount || 0}</p>
              <p className="text-stat-label mt-0.5">Reviews</p>
            </Link>
          ) : (
            <Link 
              href="/areas"
              className="group bg-card rounded-xl border border-border p-5 hover:border-foreground transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center group-hover:bg-foreground transition-colors">
                  <MapPin size={17} className="text-muted-foreground group-hover:text-white transition-colors" />
                </div>
                <ArrowUpRight size={14} className="text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-stat-sm">Explore</p>
              <p className="text-stat-label mt-0.5">Area Guides</p>
            </Link>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left Column - Properties */}
          <div className="lg:col-span-3 space-y-6">

            {/* Landlord: My Properties List */}
            {isLandlord && userProperties && userProperties.length > 0 && (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h2 className="text-label">Your Listings</h2>
                  <Link href="/dashboard/my-properties" className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 transition-colors">
                    View all <ChevronRight size={13} />
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
                        className="group rounded-xl border border-border hover:border-foreground overflow-hidden transition-all hover:shadow-sm"
                      >
                        <div className="flex gap-0">
                          {/* Thumbnail */}
                          <div className="relative w-28 sm:w-36 flex-shrink-0 bg-muted">
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
                                <Home size={22} className="text-muted-foreground" />
                              </div>
                            )}
                            {/* Listing type badge on image */}
                            <div className="absolute top-2 left-2">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                property.listing_type === 'sale'
                                  ? 'bg-[#212529] text-white'
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
                                  className="text-sm font-semibold text-foreground truncate hover:underline underline-offset-2 block"
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
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 bg-[#FF6B6B]/10 text-[#F03E3E]">
                                        <ShieldX size={11} />
                                        Rejected
                                      </span>
                                    )
                                  }
                                  if (vs === 'pending') {
                                    return (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 bg-amber-50 text-amber-600">
                                        <ShieldAlert size={11} />
                                        Pending
                                      </span>
                                    )
                                  }
                                  // vs === 'approved' — show listing status
                                  if (st === 'rented' || st === 'sold') {
                                    return (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 bg-blue-50 text-blue-600">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        {st === 'rented' ? 'Rented' : 'Sold'}
                                      </span>
                                    )
                                  }
                                  if (st === 'draft') {
                                    return (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 bg-[#ADB5BD]/10 text-[#868E96]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#ADB5BD]" />
                                        Draft
                                      </span>
                                    )
                                  }
                                  // active + approved
                                  return (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 bg-[#51CF66]/10 text-[#37B24D]">
                                      <ShieldCheck size={11} />
                                      Live
                                    </span>
                                  )
                                })()}
                              </div>
                              {location && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                                  <MapPin size={11} />
                                  {location}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-base font-bold text-foreground">
                                {priceDisplay}
                              </p>
                              <div className="flex items-center gap-2">
                                {/* Show retry verification for pending/rejected properties */}
                                {(property.verification_status === 'pending' || property.verification_status === 'rejected') && (
                                  <RetryVerificationButton propertyId={property.id} />
                                )}
                                <Link
                                  href={`/dashboard/edit-property/${property.id}`}
                                  className="text-[11px] font-medium text-muted-foreground hover:text-foreground border border-border hover:border-muted-foreground px-2.5 py-1 rounded-md transition-colors"
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
              <div className="bg-card rounded-xl border border-border p-8 text-center">
                <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 size={24} className="text-muted-foreground" />
                </div>
                <h3 className="text-card-title-sm mb-1">No properties yet</h3>
                <p className="text-secondary mb-5 max-w-xs mx-auto">
                  List your first property and start receiving inquiries from verified renters.
                </p>
                <Link
                  href="/dashboard/new-property"
                  className="inline-flex items-center gap-2 bg-[#212529] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-black transition-colors"
                >
                  Create listing
                  <ArrowRight size={15} />
                </Link>
              </div>
            )}

            {/* Renter: Recently Added */}
            {!isLandlord && recentProperties && recentProperties.length > 0 && (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h2 className="text-label">Recently Added</h2>
                  <Link href="/search" className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 transition-colors">
                    View all <ChevronRight size={13} />
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
                        className="group rounded-lg overflow-hidden border border-border hover:border-foreground hover:shadow-sm transition-all"
                      >
                        <div className="relative h-28 bg-muted">
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
                              <Home size={20} className="text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute bottom-2 left-2 bg-card/95 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-foreground">
                            {priceDisplay}
                          </div>
                          {property.listing_type === 'sale' && (
                            <div className="absolute top-2 right-2 bg-[#212529] text-white px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                              Sale
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-xs font-medium text-foreground truncate group-hover:underline underline-offset-2">{property.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                            <MapPin size={10} />
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
                    <Sparkles size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-white mb-1">Start saving favorites</h3>
                    <p className="text-sm text-white/70 mb-4">
                      Browse properties and tap the heart icon to save them here for easy comparison.
                    </p>
                    <Link 
                      href="/search" 
                      className="inline-flex items-center gap-1.5 bg-white text-[#212529] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#F8F9FA] transition-colors"
                    >
                      <Search size={14} />
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
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="text-label">Recent Messages</h2>
                <OpenChatButton className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 transition-colors">
                  All <ChevronRight size={13} />
                </OpenChatButton>
              </div>
              {recentConversations && recentConversations.length > 0 ? (
                <div className="divide-y divide-border">
                  {recentConversations.map((convo: any) => {
                    const otherPerson = convo.profiles
                    const property = convo.properties
                    return (
                      <OpenChatConversation
                        key={convo.id}
                        conversationId={convo.id}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted transition-colors group w-full text-left"
                      >
                        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-xs font-bold text-muted-foreground">
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
                            <p className="text-sm font-medium text-foreground truncate">{otherPerson?.name || 'User'}</p>
                            {convo.last_message_at && (
                              <span className="text-[10px] text-muted-foreground flex-shrink-0">{formatTimeAgo(convo.last_message_at)}</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {convo.last_message_preview || (property?.title ? `Re: ${property.title}` : 'No messages yet')}
                          </p>
                        </div>
                      </OpenChatConversation>
                    )
                  })}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <MessageSquare size={20} className="mx-auto text-border mb-2" />
                  <p className="text-xs text-muted-foreground">No conversations yet</p>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-label">Quick Links</h2>
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
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center group-hover:bg-foreground transition-colors flex-shrink-0">
                      <Icon size={14} className="text-muted-foreground group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-[10px] text-muted-foreground">{desc}</p>
                    </div>
                    <ChevronRight size={14} className="text-border group-hover:text-muted-foreground transition-colors flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Landlord: Performance Snapshot */}
            {isLandlord && (propertyCount || 0) > 0 && (
              <div className="bg-[#212529] rounded-xl p-5 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 size={16} className="text-white/60" />
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
