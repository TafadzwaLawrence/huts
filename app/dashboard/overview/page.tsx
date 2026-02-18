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
} from 'lucide-react'

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
    supabase.from('properties').select('id, title, slug, status, price, sale_price, listing_type, city, neighborhood, created_at, property_images(url, is_primary)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
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
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs text-[#ADB5BD] font-medium uppercase tracking-wider mb-2">{dateString}</p>
            <h1 className="text-2xl md:text-3xl font-bold text-[#212529] tracking-tight">
              {greeting}, {firstName}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {isLandlord ? (
              <Link
                href="/dashboard/my-properties"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#495057] hover:text-[#212529] border border-[#E9ECEF] px-4 py-2 rounded-lg hover:border-[#212529] transition-all"
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
            className="group bg-white rounded-xl border border-[#E9ECEF] p-5 hover:border-[#212529] transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-[#F8F9FA] rounded-lg flex items-center justify-center group-hover:bg-[#212529] transition-colors">
                {isLandlord ? (
                  <Building2 size={17} className="text-[#495057] group-hover:text-white transition-colors" />
                ) : (
                  <Heart size={17} className="text-[#495057] group-hover:text-white transition-colors" />
                )}
              </div>
              <ArrowUpRight size={14} className="text-[#ADB5BD] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-2xl font-bold text-[#212529] tabular-nums">{isLandlord ? propertyCount || 0 : savedCount || 0}</p>
            <p className="text-xs text-[#ADB5BD] font-medium mt-0.5">
              {isLandlord ? 'Properties' : 'Saved'}
            </p>
          </Link>

          {/* Conversations */}
          <Link 
            href="/dashboard/messages"
            className="group bg-white rounded-xl border border-[#E9ECEF] p-5 hover:border-[#212529] transition-all hover:shadow-md relative"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-[#F8F9FA] rounded-lg flex items-center justify-center group-hover:bg-[#212529] transition-colors relative">
                <MessageSquare size={17} className="text-[#495057] group-hover:text-white transition-colors" />
              </div>
              {(conversationCount || 0) > 0 && (
                <span className="w-5 h-5 bg-[#212529] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {conversationCount! > 9 ? '9+' : conversationCount}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-[#212529] tabular-nums">{conversationCount || 0}</p>
            <p className="text-xs text-[#ADB5BD] font-medium mt-0.5">Conversations</p>
          </Link>

          {/* Landlord: Views */}
          {isLandlord && (
            <div className="bg-white rounded-xl border border-[#E9ECEF] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 bg-[#F8F9FA] rounded-lg flex items-center justify-center">
                  <Eye size={17} className="text-[#495057]" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#212529] tabular-nums">{totalViews}</p>
              <p className="text-xs text-[#ADB5BD] font-medium mt-0.5">Total Views</p>
            </div>
          )}

          {/* Reviews / Browse */}
          {isLandlord ? (
            <Link 
              href="/dashboard/reviews"
              className="group bg-white rounded-xl border border-[#E9ECEF] p-5 hover:border-[#212529] transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 bg-[#F8F9FA] rounded-lg flex items-center justify-center group-hover:bg-[#212529] transition-colors">
                  <Star size={17} className="text-[#495057] group-hover:text-white transition-colors" />
                </div>
                <ArrowUpRight size={14} className="text-[#ADB5BD] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-bold text-[#212529] tabular-nums">{reviewCount || 0}</p>
              <p className="text-xs text-[#ADB5BD] font-medium mt-0.5">Reviews</p>
            </Link>
          ) : (
            <Link 
              href="/areas"
              className="group bg-white rounded-xl border border-[#E9ECEF] p-5 hover:border-[#212529] transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 bg-[#F8F9FA] rounded-lg flex items-center justify-center group-hover:bg-[#212529] transition-colors">
                  <MapPin size={17} className="text-[#495057] group-hover:text-white transition-colors" />
                </div>
                <ArrowUpRight size={14} className="text-[#ADB5BD] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-bold text-[#212529]">Explore</p>
              <p className="text-xs text-[#ADB5BD] font-medium mt-0.5">Area Guides</p>
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
                  <h2 className="text-sm font-semibold text-[#212529]">Your Listings</h2>
                  <Link href="/dashboard/my-properties" className="text-xs text-[#495057] hover:text-[#212529] font-medium flex items-center gap-1 transition-colors">
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
                        className="group rounded-xl border border-[#F1F3F5] hover:border-[#212529] overflow-hidden transition-all hover:shadow-sm"
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
                                <Home size={22} className="text-[#ADB5BD]" />
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
                                  className="text-sm font-semibold text-[#212529] truncate hover:underline underline-offset-2 block"
                                >
                                  {property.title}
                                </Link>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${
                                  property.status === 'active' ? 'bg-[#51CF66]/10 text-[#37B24D]' :
                                  property.status === 'draft' ? 'bg-[#ADB5BD]/10 text-[#868E96]' :
                                  property.status === 'rented' || property.status === 'sold' ? 'bg-blue-50 text-blue-600' :
                                  'bg-[#FF6B6B]/10 text-[#F03E3E]'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                    property.status === 'active' ? 'bg-[#51CF66]' :
                                    property.status === 'draft' ? 'bg-[#ADB5BD]' :
                                    property.status === 'rented' || property.status === 'sold' ? 'bg-blue-500' :
                                    'bg-[#FF6B6B]'
                                  }`} />
                                  {property.status}
                                </span>
                              </div>
                              {location && (
                                <p className="text-xs text-[#ADB5BD] flex items-center gap-1 mb-2">
                                  <MapPin size={11} />
                                  {location}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-base font-bold text-[#212529]">
                                {priceDisplay}
                              </p>
                              <Link
                                href={`/dashboard/edit-property/${property.id}`}
                                className="text-[11px] font-medium text-[#495057] hover:text-[#212529] border border-[#E9ECEF] hover:border-[#ADB5BD] px-2.5 py-1 rounded-md transition-colors"
                              >
                                Edit
                              </Link>
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
                  <Building2 size={24} className="text-[#ADB5BD]" />
                </div>
                <h3 className="font-semibold text-[#212529] mb-1">No properties yet</h3>
                <p className="text-sm text-[#495057] mb-5 max-w-xs mx-auto">
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
              <div className="bg-white rounded-xl border border-[#E9ECEF] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F3F5]">
                  <h2 className="text-sm font-semibold text-[#212529]">Recently Added</h2>
                  <Link href="/search" className="text-xs text-[#495057] hover:text-[#212529] font-medium flex items-center gap-1 transition-colors">
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
                        className="group rounded-lg overflow-hidden border border-[#F1F3F5] hover:border-[#212529] hover:shadow-sm transition-all"
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
                              <Home size={20} className="text-[#ADB5BD]" />
                            </div>
                          )}
                          <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-[#212529]">
                            {priceDisplay}
                          </div>
                          {property.listing_type === 'sale' && (
                            <div className="absolute top-2 right-2 bg-[#212529] text-white px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                              Sale
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-xs font-medium text-[#212529] truncate group-hover:underline underline-offset-2">{property.title}</p>
                          <p className="text-[10px] text-[#ADB5BD] mt-0.5 flex items-center gap-1">
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
                    <h3 className="font-semibold text-base mb-1">Start saving favorites</h3>
                    <p className="text-sm text-white/60 mb-4">
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
            <div className="bg-white rounded-xl border border-[#E9ECEF] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F3F5]">
                <h2 className="text-sm font-semibold text-[#212529]">Recent Messages</h2>
                <Link href="/dashboard/messages" className="text-xs text-[#495057] hover:text-[#212529] font-medium flex items-center gap-1 transition-colors">
                  All <ChevronRight size={13} />
                </Link>
              </div>
              {recentConversations && recentConversations.length > 0 ? (
                <div className="divide-y divide-[#F1F3F5]">
                  {recentConversations.map((convo: any) => {
                    const otherPerson = convo.profiles
                    const property = convo.properties
                    return (
                      <Link
                        key={convo.id}
                        href="/dashboard/messages"
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#FAFAFA] transition-colors group"
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
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <MessageSquare size={20} className="mx-auto text-[#E9ECEF] mb-2" />
                  <p className="text-xs text-[#ADB5BD]">No conversations yet</p>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl border border-[#E9ECEF] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#F1F3F5]">
                <h2 className="text-sm font-semibold text-[#212529]">Quick Links</h2>
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
                    <div className="w-8 h-8 bg-[#F8F9FA] rounded-lg flex items-center justify-center group-hover:bg-[#212529] transition-colors flex-shrink-0">
                      <Icon size={14} className="text-[#495057] group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#212529]">{label}</p>
                      <p className="text-[10px] text-[#ADB5BD]">{desc}</p>
                    </div>
                    <ChevronRight size={14} className="text-[#E9ECEF] group-hover:text-[#ADB5BD] transition-colors flex-shrink-0" />
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
                    <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider mt-0.5">Listings</p>
                  </div>
                  <div className="bg-white/[0.06] rounded-lg p-3">
                    <p className="text-xl font-bold tabular-nums">{totalViews}</p>
                    <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider mt-0.5">Views</p>
                  </div>
                  <div className="bg-white/[0.06] rounded-lg p-3">
                    <p className="text-xl font-bold tabular-nums">{conversationCount || 0}</p>
                    <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider mt-0.5">Inquiries</p>
                  </div>
                  <div className="bg-white/[0.06] rounded-lg p-3">
                    <p className="text-xl font-bold tabular-nums">{reviewCount || 0}</p>
                    <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider mt-0.5">Reviews</p>
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
