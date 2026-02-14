import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Plus, 
  Search, 
  Heart, 
  MessageSquare, 
  ArrowRight, 
  Home,
  Sparkles,
  MapPin,
  TrendingUp,
  Clock,
  HelpCircle,
  Building2,
  ChevronRight
} from 'lucide-react'

export default async function DashboardOverviewPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/dashboard')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user stats
  const { count: savedCount } = await supabase
    .from('saved_properties')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: propertyCount } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: inquiryCount } = await supabase
    .from('inquiries')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', user.id)

  // Get recent properties for suggestions (for renters)
  const { data: recentProperties } = await supabase
    .from('properties')
    .select('id, title, slug, city, price, sale_price, listing_type, property_images(url, is_primary)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(3)

  const isLandlord = profile?.role === 'landlord'
  const userName = profile?.name || user.email?.split('@')[0] || 'User'
  const firstName = userName.split(' ')[0]
  
  // Time-based greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-[#495057] font-medium mb-2">{greeting}</p>
          <h1 className="text-3xl md:text-4xl font-bold text-[#212529] mb-2">
            {firstName} 👋
          </h1>
          <p className="text-[#495057] text-lg">
            {isLandlord 
              ? 'Manage your property listings and connect with renters.' 
              : 'Find your perfect home from verified listings.'}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link 
            href={isLandlord ? '/dashboard/my-properties' : '/dashboard/saved'}
            className="bg-white rounded-2xl border-2 border-[#E9ECEF] p-6 hover:border-[#212529] transition-all hover:shadow-xl group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#495057] font-medium mb-1">
                  {isLandlord ? 'Total Properties' : 'Saved Properties'}
                </p>
                <p className="text-4xl font-bold text-[#212529]">{isLandlord ? propertyCount || 0 : savedCount || 0}</p>
              </div>
              <div className="w-14 h-14 bg-[#F8F9FA] rounded-2xl flex items-center justify-center group-hover:bg-[#212529] transition-colors">
                {isLandlord ? (
                  <Building2 size={28} className="text-[#212529] group-hover:text-white transition-colors" />
                ) : (
                  <Heart size={28} className="text-[#212529] group-hover:text-white transition-colors" />
                )}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[#E9ECEF]">
              <p className="text-xs text-[#495057]">
                {isLandlord ? 'Manage your listings' : 'View saved homes'}
              </p>
            </div>
          </Link>

          <Link 
            href="/dashboard/messages"
            className="bg-white rounded-2xl border-2 border-[#E9ECEF] p-6 hover:border-[#212529] transition-all hover:shadow-xl group relative"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#495057] font-medium mb-1">Messages</p>
                <p className="text-4xl font-bold text-[#212529]">{inquiryCount || 0}</p>
              </div>
              <div className="w-14 h-14 bg-[#F8F9FA] rounded-2xl flex items-center justify-center group-hover:bg-[#212529] transition-colors relative">
                <MessageSquare size={28} className="text-[#212529] group-hover:text-white transition-colors" />
                {(inquiryCount || 0) > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-[#FF6B6B] text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {inquiryCount}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[#E9ECEF]">
              <p className="text-xs text-[#495057]">
                {(inquiryCount || 0) > 0 ? `${inquiryCount} new conversation${inquiryCount === 1 ? '' : 's'}` : 'No new messages'}
              </p>
            </div>
          </Link>

          {isLandlord ? (
            <Link 
              href="/dashboard/property-reviews"
              className="bg-white rounded-2xl border-2 border-[#E9ECEF] p-6 hover:border-[#212529] transition-all hover:shadow-xl group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#495057] font-medium mb-1">Analytics</p>
                  <p className="text-4xl font-bold text-[#212529]">—</p>
                </div>
                <div className="w-14 h-14 bg-[#F8F9FA] rounded-2xl flex items-center justify-center group-hover:bg-[#212529] transition-colors">
                  <TrendingUp size={28} className="text-[#212529] group-hover:text-white transition-colors" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#E9ECEF]">
                <p className="text-xs text-[#495057]">Performance metrics</p>
              </div>
            </Link>
          ) : (
            <Link 
              href="/search"
              className="bg-white rounded-2xl border-2 border-[#E9ECEF] p-6 hover:border-[#212529] transition-all hover:shadow-xl group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#495057] font-medium mb-1">Browse</p>
                  <p className="text-4xl font-bold text-[#212529]">∞</p>
                </div>
                <div className="w-14 h-14 bg-[#F8F9FA] rounded-2xl flex items-center justify-center group-hover:bg-[#212529] transition-colors">
                  <Search size={28} className="text-[#212529] group-hover:text-white transition-colors" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#E9ECEF]">
                <p className="text-xs text-[#495057]">Discover properties</p>
              </div>
            </Link>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLandlord ? (
            <>
              <Link
                href="/dashboard/new-property"
                className="group bg-[#212529] text-white rounded-2xl p-6 hover:bg-black transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
                  <Plus size={24} />
                </div>
                <h3 className="font-bold text-lg mb-2">Add new listing</h3>
                <p className="text-sm text-white/70 mb-4">List a property for rent or sale</p>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span>Get started</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                href="/search"
                className="group bg-white border-2 border-[#E9ECEF] rounded-2xl p-6 hover:border-[#212529] transition-all hover:shadow-xl"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#F8F9FA] flex items-center justify-center mb-4 group-hover:bg-[#212529] transition-colors">
                  <Search size={24} className="text-[#212529] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-[#212529]">Browse market</h3>
                <p className="text-sm text-[#495057] mb-4">See what others are listing</p>
                <div className="flex items-center gap-2 text-sm font-medium text-[#495057]">
                  <span>Explore</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                href="/dashboard/my-properties"
                className="group bg-white border-2 border-[#E9ECEF] rounded-2xl p-6 hover:border-[#212529] transition-all hover:shadow-xl"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#F8F9FA] flex items-center justify-center mb-4 group-hover:bg-[#212529] transition-colors">
                  <Building2 size={24} className="text-[#212529] group-hover:text-white transition-colors" />
                </div>
                <div className="mb-2">
                  <h3 className="font-bold text-lg text-[#212529] inline-block">My properties</h3>
                  <span className="ml-2 text-2xl font-bold text-[#212529]">{propertyCount || 0}</span>
                </div>
                <p className="text-sm text-[#495057] mb-4">Manage your listings</p>
                <div className="flex items-center gap-2 text-sm font-medium text-[#495057]">
                  <span>View all</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                href="/areas"
                className="group bg-white border-2 border-[#E9ECEF] rounded-2xl p-6 hover:border-[#212529] transition-all hover:shadow-xl"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#F8F9FA] flex items-center justify-center mb-4 group-hover:bg-[#212529] transition-colors">
                  <MapPin size={24} className="text-[#212529] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-[#212529]">Explore areas</h3>
                <p className="text-sm text-[#495057] mb-4">Area guides & insights</p>
                <div className="flex items-center gap-2 text-sm font-medium text-[#495057]">
                  <span>Browse</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/search"
                className="group bg-[#212529] text-white rounded-2xl p-6 hover:bg-black transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
                  <Search size={24} />
                </div>
                <h3 className="font-bold text-lg mb-2">Find a home</h3>
                <p className="text-sm text-white/70 mb-4">Browse verified listings</p>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span>Start searching</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                href="/dashboard/saved"
                className="group bg-white border-2 border-[#E9ECEF] rounded-2xl p-6 hover:border-[#212529] transition-all hover:shadow-xl"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#F8F9FA] flex items-center justify-center mb-4 group-hover:bg-[#212529] transition-colors">
                  <Heart size={24} className="text-[#212529] group-hover:text-white transition-colors" />
                </div>
                <div className="mb-2">
                  <h3 className="font-bold text-lg text-[#212529] inline-block">Saved</h3>
                  <span className="ml-2 text-2xl font-bold text-[#212529]">{savedCount || 0}</span>
                </div>
                <p className="text-sm text-[#495057] mb-4">Your favorites</p>
                <div className="flex items-center gap-2 text-sm font-medium text-[#495057]">
                  <span>View saved</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                href="/areas"
                className="group bg-white border-2 border-[#E9ECEF] rounded-2xl p-6 hover:border-[#212529] transition-all hover:shadow-xl"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#F8F9FA] flex items-center justify-center mb-4 group-hover:bg-[#212529] transition-colors">
                  <MapPin size={24} className="text-[#212529] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-[#212529]">Explore areas</h3>
                <p className="text-sm text-[#495057] mb-4">Discover neighborhoods</p>
                <div className="flex items-center gap-2 text-sm font-medium text-[#495057]">
                  <span>Browse areas</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                href="/help"
                className="group bg-white border-2 border-[#E9ECEF] rounded-2xl p-6 hover:border-[#212529] transition-all hover:shadow-xl"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#F8F9FA] flex items-center justify-center mb-4 group-hover:bg-[#212529] transition-colors">
                  <HelpCircle size={24} className="text-[#212529] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-[#212529]">Help center</h3>
                <p className="text-sm text-[#495057] mb-4">Get support & answers</p>
                <div className="flex items-center gap-2 text-sm font-medium text-[#495057]">
                  <span>Get help</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </>
          )}
        </div>

        {/* Empty State Tips (for renters with no saved properties) */}
        {!isLandlord && (savedCount || 0) === 0 && (
          <div className="bg-[#212529] rounded-2xl p-8 text-white mt-8">
            <div className="flex flex-col md:flex-row items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Sparkles size={28} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-2xl mb-3">Get started</h3>
                <p className="text-white/80 mb-6 text-lg">
                  Start by browsing properties and saving your favorites. You'll be able to compare them later!
                </p>
                <Link 
                  href="/search" 
                  className="inline-flex items-center gap-2 bg-white text-[#212529] px-6 py-3 rounded-xl font-semibold hover:bg-[#F8F9FA] transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Search size={20} />
                  Start browsing
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Recent Properties Suggestion (for renters) */}
        {!isLandlord && recentProperties && recentProperties.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#212529] mb-1">Recently added</h2>
                <p className="text-sm text-[#495057]">Fresh listings just for you</p>
              </div>
              <Link 
                href="/search" 
                className="text-sm font-medium text-[#495057] hover:text-[#212529] flex items-center gap-1 transition-colors"
              >
                View all
                <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentProperties.map((property) => {
                const primaryImage = property.property_images?.find((img: any) => img.is_primary) || property.property_images?.[0]
                const price = property.listing_type === 'sale' ? property.sale_price : property.price
                const priceDisplay = property.listing_type === 'sale' 
                  ? `$${((price || 0) / 1000).toFixed(0)}K`
                  : `$${(price || 0).toLocaleString()}/mo`
                
                return (
                  <Link
                    key={property.id}
                    href={`/property/${property.slug || property.id}`}
                    className="group bg-white border-2 border-[#E9ECEF] rounded-2xl overflow-hidden hover:border-[#212529] hover:shadow-xl transition-all"
                  >
                    <div className="relative h-48 bg-[#F8F9FA]">
                      {primaryImage?.url ? (
                        <Image
                          src={primaryImage.url}
                          alt={property.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home size={32} className="text-[#ADB5BD]" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-[#212529]/90 text-white px-3 py-1.5 rounded-lg text-sm font-bold backdrop-blur-sm">
                        {priceDisplay}
                      </div>
                      {property.listing_type === 'sale' && (
                        <div className="absolute top-3 right-3 bg-white/90 text-[#212529] px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-sm">
                          FOR SALE
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-[#212529] line-clamp-1 group-hover:underline mb-2">
                        {property.title}
                      </h3>
                      <p className="text-sm text-[#495057] flex items-center gap-1.5">
                        <MapPin size={14} />
                        {property.city}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
