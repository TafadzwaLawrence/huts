import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Search, MapPin, Bed, Bath, Square, Home, ArrowRight, Shield, Clock, Smartphone, Car, Plus, CheckCircle2, Building2, Filter, MessageCircle, Calendar, CheckCircle, Key, Sparkles, Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatSalePrice } from '@/lib/utils'
import SaveButton from '@/components/property/SaveButton'

export const metadata: Metadata = {
  title: 'Huts — Find Your Perfect Rental in Zimbabwe',
  description: 'Browse thousands of verified rental properties across Zimbabwe. Apartments, houses, rooms in Harare, Bulawayo, Gweru, and more. Your home is one search away.',
  openGraph: {
    title: 'Huts — Property Rentals in Zimbabwe',
    description: 'Find apartments, houses, and rooms for rent. Verified listings across Zimbabwe.',
    url: 'https://www.huts.co.zw',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Huts property rentals' }],
  },
  alternates: {
    canonical: 'https://www.huts.co.zw',
  },
}

// ISR - Revalidate every 60 seconds for fresh data while caching for speed
export const revalidate = 60

function formatPriceLocal(cents: number): string {
  return `$${(cents / 100).toLocaleString()}`
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

export default async function HomePage() {
  const supabase = await createClient()

  // Parallelize all DB queries for faster loading
  const [
    { data: rentalProperties },
    { data: saleProperties },
    { count: totalListings },
    { data: neighborhoodData },
    { count: totalRenters },
    { count: totalLandlords },
    { count: verifiedProperties },
    { data: recentLandlords },
    { data: featuredReviews }
  ] = await Promise.all([
    // Fetch featured rental properties (latest 6 active properties)
    supabase
      .from('properties')
      .select(`
        id,
        title,
        slug,
        price,
        listing_type,
        beds,
        baths,
        sqft,
        city,
        neighborhood,
        created_at,
        property_images(url, is_primary)
      `)
      .eq('status', 'active')
      .eq('listing_type', 'rent')
      .order('created_at', { ascending: false })
      .limit(6),

    // Fetch featured sale properties (latest 6 active properties)
    supabase
      .from('properties')
      .select(`
        id,
        title,
        slug,
        sale_price,
        listing_type,
        beds,
        baths,
        sqft,
        parking_spaces,
        city,
        neighborhood,
        created_at,
        property_images(url, is_primary)
      `)
      .eq('status', 'active')
      .eq('listing_type', 'sale')
      .order('created_at', { ascending: false })
      .limit(6),

    // Get total active listings count
    supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),

    // Fetch popular neighborhoods based on property count
    supabase
      .from('properties')
      .select('neighborhood, city')
      .eq('status', 'active')
      .not('neighborhood', 'is', null),

    // Get total renters count
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'renter'),

    // Get total landlords count
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'landlord'),

    // Get verified/active properties count (all active are considered verified)
    supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),

    // Get recent landlords for testimonial section
    supabase
      .from('profiles')
      .select('id, name, avatar_url, created_at')
      .eq('role', 'landlord')
      .order('created_at', { ascending: false })
      .limit(10),

    // Get a featured review (5-star review with comment)
    supabase
      .from('reviews')
      .select(`
        id,
        rating,
        title,
        comment,
        author_id,
        property_id,
        created_at,
        profiles:author_id(name, avatar_url),
        properties:property_id(neighborhood, city)
      `)
      .eq('rating', 5)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(1)
  ])

  // Count properties by neighborhood
  const neighborhoodCounts = neighborhoodData?.reduce((acc: any, prop: any) => {
    const key = `${prop.neighborhood}|${prop.city}`
    if (!acc[key]) {
      acc[key] = { name: prop.neighborhood, city: prop.city, count: 0 }
    }
    acc[key].count++
    return acc
  }, {})

  // Calculate stats for "Why Choose Huts" section
  const uniqueNeighborhoods = Object.keys(neighborhoodCounts || {}).length
  const happyRenters = totalRenters || 0
  const verifiedListingsPercent = 100 // All listings are manually verified
  const avgResponseHours = 2 // Target response time

  // Get featured testimonial from reviews
  const featuredReview = featuredReviews?.[0]
  const reviewAuthor = featuredReview?.profiles as any
  const reviewProperty = featuredReview?.properties as any

  // Sort by count and get top 6
  const popularAreas = Object.values(neighborhoodCounts || {})
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 6)
    .map((area: any) => ({
      ...area,
      slug: slugify(area.name)
    }))

  return (
    <div>
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-b from-white via-white to-[#F8F9FA] overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#212529]/[0.02] rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#212529]/[0.02] rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.015]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="container-main relative py-16 md:py-24 lg:py-32">
          <div className="max-w-5xl mx-auto">
            {/* Headline */}
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-[#212529] mb-6">
                Find your
                <span className="relative mx-3">
                  <span className="relative z-10">perfect</span>
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#212529]/10" viewBox="0 0 200 12" preserveAspectRatio="none">
                    <path d="M0,8 Q50,0 100,8 T200,8" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                  </svg>
                </span>
                home
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-[#495057] max-w-2xl mx-auto leading-relaxed">
                The simplest way to discover rental properties or homes for sale.
                <span className="hidden sm:inline"><br /></span>
                <span className="text-[#ADB5BD]">No clutter, no noise — just homes.</span>
              </p>
            </div>
            
            {/* Search Bar - Prominent */}
            <div className="max-w-3xl mx-auto mb-8">
              <div className="relative group/search">
                {/* Animated glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#212529]/20 via-[#495057]/20 to-[#212529]/20 rounded-2xl blur-xl opacity-50 group-hover/search:opacity-75 transition-opacity duration-300" />
                
                <div className="relative bg-white rounded-2xl shadow-2xl border-2 border-[#E9ECEF] p-2 group-hover/search:border-[#495057] transition-colors duration-300">
                  <div className="flex flex-col md:flex-row gap-2">
                    {/* Location Input */}
                    <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-[#F8F9FA] rounded-xl hover:bg-[#F1F3F5] transition-all duration-200 group/location">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover/location:shadow transition-shadow">
                        <MapPin size={20} className="text-[#212529] group-hover/location:scale-110 transition-transform" />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="search-location" className="block text-[10px] font-bold text-[#ADB5BD] uppercase tracking-wider mb-0.5">Location</label>
                        <input
                          id="search-location"
                          type="text"
                          placeholder="Where do you want to live?"
                          className="w-full bg-transparent outline-none text-[#212529] placeholder:text-[#ADB5BD] text-sm font-medium focus:placeholder:text-[#495057] transition-colors"
                        />
                      </div>
                    </div>

                    {/* Property Type */}
                    <div className="hidden md:flex items-center gap-3 px-4 py-3 bg-[#F8F9FA] rounded-xl hover:bg-[#F1F3F5] transition-all duration-200 group/type min-w-[180px]">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover/type:shadow transition-shadow">
                        <Home size={20} className="text-[#212529] group-hover/type:scale-110 transition-transform" />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="search-type" className="block text-[10px] font-bold text-[#ADB5BD] uppercase tracking-wider mb-0.5">Type</label>
                        <select 
                          id="search-type"
                          className="w-full bg-transparent outline-none text-[#212529] text-sm font-medium appearance-none cursor-pointer focus:text-[#000]"
                        >
                          <option>Any type</option>
                          <option>For Rent</option>
                          <option>For Sale</option>
                        </select>
                      </div>
                    </div>

                    {/* Search Button */}
                    <Link
                      href="/search"
                      className="group/btn flex items-center justify-center gap-2 bg-[#212529] text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 min-h-[56px]"
                    >
                      <Search size={20} className="group-hover/btn:scale-110 transition-transform" />
                      <span>Search</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-sm text-[#495057] font-medium mr-1">Popular:</span>
              {[
                { name: 'Avondale', count: '42' },
                { name: 'Borrowdale', count: '38' },
                { name: 'Mount Pleasant', count: '27' },
                { name: 'City Centre', count: '51' },
              ].map((area) => (
                <Link
                  key={area.name}
                  href={`/search?area=${area.name.toLowerCase().replace(' ', '-')}`}
                  className="group/area inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#E9ECEF] rounded-full text-sm font-semibold text-[#495057] hover:border-[#212529] hover:text-[#212529] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <MapPin size={14} className="text-[#ADB5BD] group-hover/area:text-[#212529] transition-colors" />
                  <span>{area.name}</span>
                  <span className="text-[10px] font-bold text-[#495057] bg-[#F8F9FA] px-2 py-0.5 rounded-full group-hover/area:bg-[#212529] group-hover/area:text-white transition-colors">
                    {area.count}
                  </span>
                </Link>
              ))}
            </div>

            {/* Stats Row */}
            <div className="mt-16 pt-12 border-t border-[#E9ECEF]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto text-center">
                {[
                  { value: `${totalListings || 0}`, label: 'Active Listings' },
                  { value: `${Object.keys(neighborhoodCounts || {}).length}`, label: 'Neighborhoods' },
                  { value: '24h', label: 'Avg. Response' },
                  { value: '100%', label: 'Verified' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl md:text-3xl font-bold text-[#212529] mb-1">{stat.value}</div>
                    <div className="text-xs md:text-sm text-[#ADB5BD] font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED RENTALS */}
      <section className="py-12 md:py-16 bg-[#F8F9FA] relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#212529]/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#212529]/5 to-transparent rounded-full blur-3xl" />
        
        <div className="container-main relative">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-[#212529] rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                <Home size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#212529] tracking-tight mb-2">
                  Featured Rentals
                </h2>
                <p className="text-[#495057] text-sm md:text-base">Hand-picked rental listings updated daily</p>
              </div>
            </div>
            <Link
              href="/search?type=rent"
              className="group/btn inline-flex items-center gap-2 text-sm font-bold text-[#212529] bg-white border-2 border-[#E9ECEF] px-6 py-3 rounded-full hover:border-[#212529] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <span>View all rentals</span>
              <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {/* Rental Property Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {rentalProperties && rentalProperties.length > 0 ? (
              rentalProperties.map((property: any, index: number) => {
                const primaryImage = property.property_images?.find((img: any) => img.is_primary) || property.property_images?.[0]
                const imageUrl = primaryImage?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop'
                
                return (
                  <Link
                    key={property.id}
                    href={`/property/${property.slug || property.id}`}
                    className="group"
                  >
                    <article className="relative border-2 border-[#E9ECEF] rounded-xl overflow-hidden bg-white hover:border-[#212529] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                      {/* Image */}
                      <div className="relative h-64 overflow-hidden bg-[#E9ECEF]">
                        <Image
                          src={imageUrl}
                          alt={property.title}
                          fill
                          className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        
                        {/* Overlay gradient on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Save Button */}
                        <SaveButton className="absolute top-4 right-4 p-2.5 bg-white/95 backdrop-blur-sm rounded-full hover:bg-white hover:scale-110 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center shadow-md" />
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        {/* Price */}
                        <div className="flex items-baseline justify-between mb-3">
                          <span className="text-2xl font-bold text-[#212529] tracking-tight">
                            {formatPriceLocal(property.price)}
                          </span>
                          <span className="text-sm text-[#ADB5BD] font-medium">/month</span>
                        </div>

                        <h3 className="font-semibold text-[#212529] text-lg mb-3 leading-snug line-clamp-2 min-h-[3.5rem]">
                          {property.title}
                        </h3>
                        
                        <div className="flex items-center text-[#495057] text-sm mb-5">
                          <MapPin size={15} className="mr-1.5 flex-shrink-0 text-[#ADB5BD]" />
                          <span className="truncate">{property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}</span>
                        </div>

                        {/* Features - Enhanced */}
                        <div className="flex items-center gap-5 text-sm text-[#495057] pt-5 border-t-2 border-[#F8F9FA]">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Bed size={16} className="text-[#ADB5BD]" />
                            <span className="text-[#212529]">{property.beds}</span> bed
                          </span>
                          <span className="flex items-center gap-1.5 font-medium">
                            <Bath size={16} className="text-[#ADB5BD]" />
                            <span className="text-[#212529]">{property.baths}</span> bath
                          </span>
                          {property.sqft && (
                            <span className="flex items-center gap-1.5 font-medium">
                              <Square size={16} className="text-[#ADB5BD]" />
                              <span className="text-[#212529]">{property.sqft}</span> sqft
                            </span>
                          )}
                        </div>

                        {/* View Details Link - Appears on hover */}
                        <div className="mt-5 pt-5 border-t-2 border-[#F8F9FA] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="flex items-center justify-between text-sm font-medium text-[#212529]">
                            <span>View details</span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                )
              })
            ) : (
              <div className="col-span-full">
                <div className="bg-white border-2 border-dashed border-[#E9ECEF] rounded-2xl p-12 md:p-16 text-center">
                  {/* Decorative icons */}
                  <div className="flex justify-center items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-[#F8F9FA] rounded-2xl flex items-center justify-center border border-[#E9ECEF] rotate-[-6deg]">
                      <Home size={28} className="text-[#ADB5BD]" />
                    </div>
                    <div className="w-20 h-20 bg-[#212529] rounded-2xl flex items-center justify-center shadow-xl">
                      <Building2 size={36} className="text-white" />
                    </div>
                    <div className="w-16 h-16 bg-[#F8F9FA] rounded-2xl flex items-center justify-center border border-[#E9ECEF] rotate-[6deg]">
                      <MapPin size={28} className="text-[#ADB5BD]" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-bold text-[#212529] mb-3">No rentals listed yet</h3>
                  <p className="text-[#495057] text-lg mb-8 max-w-md mx-auto">
                    Be the first landlord to list a rental property and reach thousands of potential renters.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/dashboard/new-property"
                      className="group inline-flex items-center justify-center gap-2 bg-[#212529] text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-black hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                      <Plus size={20} />
                      List Your Property
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      href="/search?type=rent"
                      className="inline-flex items-center justify-center gap-2 bg-white text-[#212529] border-2 border-[#E9ECEF] px-8 py-4 rounded-xl font-semibold text-base hover:border-[#212529] hover:shadow-md transition-all"
                    >
                      <Search size={18} />
                      Browse All Areas
                    </Link>
                  </div>
                  
                  {/* Trust indicators */}
                  <div className="mt-10 pt-8 border-t border-[#E9ECEF] flex flex-wrap justify-center gap-6 text-sm text-[#ADB5BD]">
                    <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#212529]" /> Free to list</span>
                    <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#212529]" /> Verified renters</span>
                    <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#212529]" /> Secure messaging</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* View All Rentals CTA */}
          {rentalProperties && rentalProperties.length > 0 && (
            <div className="mt-12 text-center">
              <Link 
                href="/search?type=rent" 
                className="group inline-flex items-center gap-3 bg-[#212529] text-white px-10 py-4 rounded-full font-semibold text-base hover:bg-black hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <Search size={18} />
                Browse all rentals
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-[#ADB5BD] text-sm mt-4">Explore all available rental properties in Zimbabwe</p>
            </div>
          )}
        </div>
      </section>

      {/* HOMES FOR SALE */}
      <section className="py-12 md:py-16 bg-[#F8F9FA] relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#212529]/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#212529]/5 to-transparent rounded-full blur-3xl" />
        
        <div className="container-main relative">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-[#212529] rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Building2 size={24} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-3xl md:text-4xl font-bold text-[#212529] tracking-tight">Homes for Sale</h2>
                </div>
                <p className="text-[#495057]">Find your dream home and make it yours</p>
              </div>
            </div>
            <Link
              href="/search?type=sale"
              className="group inline-flex items-center gap-2 text-sm font-medium text-[#212529] bg-white border-2 border-[#E9ECEF] px-5 py-2.5 rounded-full hover:border-[#212529] hover:shadow-md transition-all"
            >
              View all homes
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {/* Sale Property Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {saleProperties && saleProperties.length > 0 ? (
              saleProperties.map((property: any, index: number) => {
                const primaryImage = property.property_images?.find((img: any) => img.is_primary) || property.property_images?.[0]
                const imageUrl = primaryImage?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop'
                
                return (
                  <Link
                    key={property.id}
                    href={`/property/${property.slug || property.id}`}
                    className="group"
                  >
                    <article className="relative border-2 border-[#E9ECEF] rounded-xl overflow-hidden bg-white hover:border-[#212529] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                      {/* Image */}
                      <div className="relative h-64 overflow-hidden bg-[#E9ECEF]">
                        <Image
                          src={imageUrl}
                          alt={property.title}
                          fill
                          className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        
                        {/* Overlay gradient on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Save Button */}
                        <SaveButton className="absolute top-4 right-4 p-2.5 bg-white/95 backdrop-blur-sm rounded-full hover:bg-white hover:scale-110 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center shadow-md" />
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        {/* Price */}
                        <div className="flex items-baseline justify-between mb-3">
                          <span className="text-2xl font-bold text-[#212529] tracking-tight">
                            {formatSalePrice(property.sale_price)}
                          </span>
                        </div>

                        <h3 className="font-semibold text-[#212529] text-lg mb-3 leading-snug line-clamp-2 min-h-[3.5rem]">
                          {property.title}
                        </h3>
                        
                        <div className="flex items-center text-[#495057] text-sm mb-5">
                          <MapPin size={15} className="mr-1.5 flex-shrink-0 text-[#ADB5BD]" />
                          <span className="truncate">{property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}</span>
                        </div>

                        {/* Features - Enhanced */}
                        <div className="flex items-center gap-5 text-sm text-[#495057] pt-5 border-t-2 border-[#F8F9FA]">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Bed size={16} className="text-[#ADB5BD]" />
                            <span className="text-[#212529]">{property.beds}</span> bed
                          </span>
                          <span className="flex items-center gap-1.5 font-medium">
                            <Bath size={16} className="text-[#ADB5BD]" />
                            <span className="text-[#212529]">{property.baths}</span> bath
                          </span>
                          {property.sqft && (
                            <span className="flex items-center gap-1.5 font-medium">
                              <Square size={16} className="text-[#ADB5BD]" />
                              <span className="text-[#212529]">{property.sqft}</span> sqft
                            </span>
                          )}
                        </div>

                        {/* View Details Link - Appears on hover */}
                        <div className="mt-5 pt-5 border-t-2 border-[#F8F9FA] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="flex items-center justify-between text-sm font-medium text-[#212529]">
                            <span>View details</span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                )
              })
            ) : (
              <div className="col-span-full">
                <div className="bg-white border-2 border-dashed border-[#E9ECEF] rounded-2xl p-12 md:p-16 text-center">
                  {/* Decorative icons */}
                  <div className="flex justify-center items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-[#F8F9FA] rounded-2xl flex items-center justify-center border border-[#E9ECEF] rotate-[-6deg]">
                      <Home size={28} className="text-[#ADB5BD]" />
                    </div>
                    <div className="w-20 h-20 bg-[#212529] rounded-2xl flex items-center justify-center shadow-xl">
                      <Building2 size={36} className="text-white" />
                    </div>
                    <div className="w-16 h-16 bg-[#F8F9FA] rounded-2xl flex items-center justify-center border border-[#E9ECEF] rotate-[6deg]">
                      <MapPin size={28} className="text-[#ADB5BD]" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-bold text-[#212529] mb-3">No homes for sale yet</h3>
                  <p className="text-[#495057] text-lg mb-8 max-w-md mx-auto">
                    Be the first to list a property for sale and reach thousands of potential buyers.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/dashboard/new-property"
                      className="group inline-flex items-center justify-center gap-2 bg-[#212529] text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-black hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                      <Plus size={20} />
                      List Your Property
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      href="/search?type=rent"
                      className="inline-flex items-center justify-center gap-2 bg-white text-[#212529] border-2 border-[#E9ECEF] px-8 py-4 rounded-xl font-semibold text-base hover:border-[#212529] hover:shadow-md transition-all"
                    >
                      <Search size={18} />
                      Browse Rentals Instead
                    </Link>
                  </div>
                  
                  {/* Trust indicators */}
                  <div className="mt-10 pt-8 border-t border-[#E9ECEF] flex flex-wrap justify-center gap-6 text-sm text-[#ADB5BD]">
                    <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#212529]" /> Free to list</span>
                    <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#212529]" /> Verified buyers</span>
                    <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#212529]" /> Secure messaging</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* View All Sales CTA */}
          {saleProperties && saleProperties.length > 0 && (
            <div className="mt-12 text-center">
              <Link 
                href="/search?type=sale" 
                className="group inline-flex items-center gap-3 bg-[#212529] text-white px-10 py-4 rounded-full font-semibold text-base hover:bg-black hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <Search size={18} />
                Browse all homes for sale
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-[#ADB5BD] text-sm mt-4">Explore all available properties for sale in Zimbabwe</p>
            </div>
          )}
        </div>
      </section>

      {/* POPULAR AREAS */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-[#F8F9FA] via-white to-[#F8F9FA] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#212529]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#212529]/5 rounded-full blur-3xl" />
        
        <div className="container-main relative">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#212529] rounded-full px-5 py-2.5 mb-6">
              <MapPin size={14} className="text-white" />
              <span className="text-xs font-semibold tracking-widest uppercase text-white">Explore Zimbabwe</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#212529] tracking-tight mb-4">
              Popular Neighborhoods
            </h2>
            <p className="text-lg text-[#495057] max-w-2xl mx-auto">
              Discover properties in Zimbabwe&apos;s most sought-after areas
            </p>
          </div>
          
          {popularAreas.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5">
              {popularAreas.map((area: any, index: number) => (
                <Link
                  key={area.slug}
                  href={`/search?neighborhood=${encodeURIComponent(area.name)}&city=${encodeURIComponent(area.city)}`}
                  className="group relative bg-white border-2 border-[#E9ECEF] rounded-2xl p-6 text-center hover:border-[#212529] hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
                >
                  {/* Background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#F8F9FA] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-[#F8F9FA] group-hover:bg-[#212529] rounded-xl flex items-center justify-center mx-auto mb-4 transition-colors">
                      <MapPin size={22} className="text-[#495057] group-hover:text-white transition-colors" />
                    </div>
                    
                    {/* Count */}
                    <div className="text-3xl font-bold text-[#212529] mb-2 group-hover:scale-110 transition-transform">
                      {area.count}
                    </div>
                    
                    {/* Name */}
                    <div className="text-sm font-semibold text-[#212529] mb-1 line-clamp-1">{area.name}</div>
                    <div className="text-xs text-[#ADB5BD]">{area.city}</div>
                    
                    {/* View arrow */}
                    <div className="mt-4 pt-3 border-t border-[#E9ECEF] opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-medium text-[#212529] flex items-center justify-center gap-1">
                        Explore <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* Empty State - Enhanced */
            <div className="max-w-2xl mx-auto">
              <div className="relative bg-white border-2 border-dashed border-[#E9ECEF] rounded-3xl p-12 md:p-16 text-center overflow-hidden">
                {/* Decorative floating pins */}
                <div className="absolute top-8 left-8 w-10 h-10 bg-[#F8F9FA] rounded-full flex items-center justify-center opacity-50 animate-pulse">
                  <MapPin size={18} className="text-[#ADB5BD]" />
                </div>
                <div className="absolute top-12 right-12 w-8 h-8 bg-[#F8F9FA] rounded-full flex items-center justify-center opacity-40 animate-pulse" style={{ animationDelay: '1s' }}>
                  <MapPin size={14} className="text-[#ADB5BD]" />
                </div>
                <div className="absolute bottom-8 left-16 w-8 h-8 bg-[#F8F9FA] rounded-full flex items-center justify-center opacity-40 animate-pulse" style={{ animationDelay: '2s' }}>
                  <MapPin size={14} className="text-[#ADB5BD]" />
                </div>
                <div className="absolute bottom-12 right-8 w-10 h-10 bg-[#F8F9FA] rounded-full flex items-center justify-center opacity-50 animate-pulse" style={{ animationDelay: '0.5s' }}>
                  <MapPin size={18} className="text-[#ADB5BD]" />
                </div>
                
                {/* Main icon */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-[#212529]/5 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                  </div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-[#212529] to-[#495057] rounded-2xl flex items-center justify-center mx-auto shadow-xl">
                    <MapPin size={36} className="text-white" />
                  </div>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold text-[#212529] mb-4">
                  Neighborhoods Coming Soon
                </h3>
                <p className="text-[#495057] mb-8 text-lg max-w-md mx-auto leading-relaxed">
                  We&apos;re mapping Zimbabwe&apos;s best neighborhoods. Be the first to list a property and put your area on the map!
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                  <Link
                    href="/dashboard/new-property"
                    className="group inline-flex items-center gap-3 bg-[#212529] text-white px-8 py-4 rounded-2xl font-bold hover:bg-black hover:-translate-y-1 hover:shadow-xl transition-all"
                  >
                    <Plus size={20} />
                    List Your Property
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/search"
                    className="inline-flex items-center gap-2 text-[#495057] hover:text-[#212529] font-medium transition-colors"
                  >
                    Browse all properties
                    <ArrowRight size={16} />
                  </Link>
                </div>
                
                {/* Areas preview */}
                <div className="pt-8 border-t border-[#E9ECEF]">
                  <p className="text-xs text-[#ADB5BD] uppercase tracking-widest mb-4 font-semibold">Popular areas in Zimbabwe</p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {['Borrowdale', 'Avondale', 'Mount Pleasant', 'Highlands', 'Gunhill', 'Chisipite'].map((area) => (
                      <span key={area} className="px-4 py-2 bg-[#F8F9FA] rounded-full text-sm text-[#495057] font-medium">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* View All CTA */}
          {popularAreas.length > 0 && (
            <div className="text-center mt-12">
              <Link
                href="/areas"
                className="group inline-flex items-center gap-2 bg-transparent text-[#212529] px-8 py-4 rounded-xl font-semibold border-2 border-[#E9ECEF] hover:border-[#212529] hover:bg-[#F8F9FA] transition-all"
              >
                View all neighborhoods
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-[#F8F9FA] via-white to-[#F8F9FA] relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#212529]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#212529]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#212529]/3 via-transparent to-[#212529]/3 rounded-full blur-3xl" />
        
        <div className="container-main relative">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-[#212529] rounded-full px-5 py-2.5 mb-8">
              <Sparkles size={14} className="text-yellow-400" />
              <span className="text-xs font-semibold tracking-widest uppercase text-white">Simple Process</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#212529] tracking-tight mb-6">
              How Huts Works
            </h2>
            <p className="text-lg md:text-xl text-[#495057] max-w-2xl mx-auto leading-relaxed">
              Your journey to the perfect home in three simple steps
            </p>
          </div>
          
          {/* Timeline Steps */}
          <div className="relative max-w-6xl mx-auto">
            {/* Desktop connector line */}
            <div className="hidden lg:block absolute top-32 left-[16.67%] right-[16.67%] h-1 bg-gradient-to-r from-[#212529] via-[#495057] to-[#212529]">
              <div className="absolute inset-0 bg-[#212529] animate-pulse" style={{ animationDuration: '3s' }} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
              {[
                {
                  step: '01',
                  title: 'Search & Discover',
                  desc: 'Browse properties using smart filters for location, price, and amenities. Our interactive map helps you explore neighborhoods like a local.',
                  icon: Search,
                  features: [
                    { icon: Filter, text: 'Smart filters' },
                    { icon: MapPin, text: 'Interactive map' },
                    { icon: Heart, text: 'Save favorites' },
                  ],
                  gradient: 'from-[#212529] to-[#495057]',
                },
                {
                  step: '02',
                  title: 'Connect & Tour',
                  desc: 'Reach landlords instantly with our built-in messaging. Schedule viewings directly and get answers in real-time.',
                  icon: MessageCircle,
                  features: [
                    { icon: Smartphone, text: 'Direct messaging' },
                    { icon: Calendar, text: 'Book viewings' },
                    { icon: Clock, text: 'Fast responses' },
                  ],
                  gradient: 'from-[#495057] to-[#212529]',
                },
                {
                  step: '03',
                  title: 'Apply & Move In',
                  desc: 'Submit your application online with a few clicks. Sign digitally, get approved, and move into your new home hassle-free.',
                  icon: Home,
                  features: [
                    { icon: Shield, text: 'Secure process' },
                    { icon: CheckCircle, text: 'Quick approval' },
                    { icon: Key, text: 'Get your keys' },
                  ],
                  gradient: 'from-[#212529] to-[#495057]',
                },
              ].map(({ step, title, desc, icon: Icon, features, gradient }, index) => (
                <div key={step} className="relative group">
                  <div className="relative bg-white p-8 lg:p-10 rounded-3xl border-2 border-[#E9ECEF] hover:border-[#212529] shadow-lg hover:shadow-2xl transition-all duration-500 h-full group-hover:-translate-y-2">
                    {/* Hover gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#F8F9FA] to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Step number badge - floats above card */}
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center ring-4 ring-white shadow-lg`}>
                        <span className="text-white font-bold text-sm">{step}</span>
                      </div>
                    </div>
                    
                    {/* Icon */}
                    <div className="relative mb-8 pt-4">
                      <div className="relative w-20 h-20 mx-auto">
                        {/* Background glow */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity`} />
                        {/* Icon container */}
                        <div className={`relative w-full h-full bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl`}>
                          <Icon size={32} className="text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative text-center">
                      <h3 className="text-xl lg:text-2xl font-bold text-[#212529] mb-4">{title}</h3>
                      <p className="text-[#495057] leading-relaxed mb-8">{desc}</p>
                      
                      {/* Features with icons */}
                      <div className="flex flex-wrap justify-center gap-3">
                        {features.map(({ icon: FeatureIcon, text }) => (
                          <div key={text} className="inline-flex items-center gap-2 bg-[#F8F9FA] group-hover:bg-white px-4 py-2 rounded-full border border-[#E9ECEF] group-hover:border-[#212529]/20 transition-all">
                            <FeatureIcon size={14} className="text-[#212529]" />
                            <span className="text-sm font-medium text-[#495057]">{text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-20">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/search"
                className="group relative inline-flex items-center gap-3 bg-[#212529] text-white px-10 py-5 rounded-2xl font-bold text-lg hover:-translate-y-1 transition-all shadow-xl hover:shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative">Start Your Search</span>
                <ArrowRight size={20} className="relative group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-sm text-[#495057]">
                <span className="text-[#212529] font-semibold">500+</span> properties waiting for you
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="py-12 md:py-16 bg-[#212529] text-white relative overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/3 rounded-full blur-3xl" />
        
        <div className="container-main relative">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2.5 mb-8 border border-white/10">
              <span className="text-xs font-semibold tracking-widest uppercase">Why choose Huts</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Built on trust
            </h2>
            <p className="text-lg md:text-xl text-[#ADB5BD] max-w-2xl mx-auto leading-relaxed">
              We verify every listing so you can search with confidence
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 max-w-6xl mx-auto">
            
            {/* Verified Listings - Featured Card */}
            <div className="group relative md:col-span-2 lg:col-span-1 lg:row-span-2">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
              <div className="relative h-full p-8 md:p-10 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/30 transition-all duration-500 flex flex-col">
                {/* Icon badge */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl">
                  <Shield size={30} className="text-[#212529]" />
                </div>
                
                {/* Big number with unit */}
                <div className="mb-6">
                  <span className="text-7xl md:text-8xl font-bold tracking-tighter bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent">
                    100
                  </span>
                  <span className="text-3xl md:text-4xl font-bold text-white/60 ml-1">%</span>
                </div>
                
                <h3 className="text-2xl font-bold mb-4 tracking-tight">Verified Listings</h3>
                <p className="text-[#ADB5BD] leading-relaxed mb-8 flex-grow">
                  Every property is manually reviewed by our team. We check photos, verify landlords, and ensure accurate details before any listing goes live.
                </p>
                
                {/* Checkmarks */}
                <div className="space-y-3">
                  {['Photo verification', 'Landlord identity check', 'Price accuracy'].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                        <svg className="w-3 h-3 text-[#212529]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-white/80">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Updated Daily */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative h-full p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/30 transition-all duration-500">
                <div className="flex items-start justify-between mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <Clock size={22} className="text-[#212529]" />
                  </div>
                </div>
                
                <div className="mb-4">
                  <span className="text-5xl font-bold tracking-tighter">24</span>
                  <span className="text-2xl font-bold text-white/50 ml-1">hrs</span>
                </div>
                
                <h3 className="text-lg font-bold mb-2">Updated Daily</h3>
                <p className="text-sm text-[#ADB5BD] leading-relaxed">
                  Fresh listings every day. Stale properties auto-removed.
                </p>
              </div>
            </div>

            {/* Local Focus */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative h-full p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/30 transition-all duration-500">
                <div className="flex items-start justify-between mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <MapPin size={22} className="text-[#212529]" />
                  </div>
                </div>
                
                <div className="mb-4">
                  <span className="text-5xl font-bold tracking-tighter">{uniqueNeighborhoods || 50}</span>
                  <span className="text-2xl font-bold text-white/50 ml-1">+</span>
                </div>
                
                <h3 className="text-lg font-bold mb-2">Neighborhoods</h3>
                <p className="text-sm text-[#ADB5BD] leading-relaxed">
                  Hyper-local insights, walkability scores & area guides.
                </p>
              </div>
            </div>

            {/* Stats Row */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              {/* Happy Renters */}
              <div className="group relative">
                <div className="relative p-6 md:p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/30 transition-all duration-500 text-center">
                  <div className="text-4xl md:text-5xl font-bold tracking-tighter mb-2">
                    {happyRenters || 500}<span className="text-white/50">+</span>
                  </div>
                  <p className="text-sm text-[#ADB5BD]">Happy renters</p>
                </div>
              </div>
              
              {/* Response Time */}
              <div className="group relative">
                <div className="relative p-6 md:p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/30 transition-all duration-500 text-center">
                  <div className="text-4xl md:text-5xl font-bold tracking-tighter mb-2">
                    &lt;2<span className="text-white/50">h</span>
                  </div>
                  <p className="text-sm text-[#ADB5BD]">Avg. response time</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom strip */}
          <div className="mt-20 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm">
            {[
              { icon: Shield, text: 'SSL Secured' },
              { icon: Clock, text: '24/7 Support' },
              { icon: MapPin, text: 'Zimbabwe Coverage' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors">
                <Icon size={16} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-white via-[#F8F9FA] to-white relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#212529]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#212529]/5 rounded-full blur-3xl" />
        
        <div className="container-main relative">
          <div className="max-w-5xl mx-auto">
            <div className="relative bg-[#212529] rounded-3xl overflow-hidden">
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#212529] via-[#495057] to-[#212529] opacity-50" />
              
              {/* Grid pattern overlay */}
              <div className="absolute inset-0 opacity-[0.05]" style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '32px 32px'
              }} />
              
              {/* Floating decorative shapes */}
              <div className="absolute top-10 left-10 w-24 h-24 border border-white/10 rounded-2xl rotate-12" />
              <div className="absolute bottom-10 right-10 w-16 h-16 border border-white/10 rounded-xl -rotate-12" />
              <div className="absolute top-1/2 right-20 w-8 h-8 bg-white/5 rounded-lg rotate-45" />
              
              {/* Gradient orbs */}
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-3xl" />
              
              <div className="relative px-8 py-16 md:px-16 md:py-20 lg:py-24">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                  {/* Left Content */}
                  <div>
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 mb-6">
                      <span className="text-sm text-white/80 font-medium">Landlords are listing now</span>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                      Got a property
                      <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-white/60 to-white/40">to list?</span>
                    </h2>
                    
                    <p className="text-lg text-white/70 mb-8 leading-relaxed max-w-md">
                      Join thousands of landlords who trust Huts to connect with quality renters. 
                      List your property in minutes.
                    </p>

                    {/* Benefits */}
                    <div className="space-y-4 mb-10">
                      {[
                        { icon: Clock, text: 'List in under 5 minutes', highlight: true },
                        { icon: Shield, text: '100% free — no hidden fees' },
                        { icon: Smartphone, text: 'Instant inquiry notifications' },
                      ].map(({ icon: Icon, text, highlight }) => (
                        <div key={text} className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${highlight ? 'bg-[#212529]' : 'bg-white/10'}`}>
                            <Icon size={16} className="text-white" />
                          </div>
                          <span className={`font-medium ${highlight ? 'text-white' : 'text-white/70'}`}>{text}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link
                        href="/dashboard/new-property"
                        className="group relative inline-flex items-center justify-center gap-2 bg-white text-[#212529] px-8 py-4 rounded-2xl font-bold text-base hover:-translate-y-1 transition-all shadow-2xl hover:shadow-white/20 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#212529]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        <span className="relative">Post Your Property</span>
                        <ArrowRight size={18} className="relative group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center gap-2 bg-transparent text-white px-8 py-4 rounded-2xl font-semibold text-base border-2 border-white/20 hover:border-white/40 hover:bg-white/5 transition-all"
                      >
                        Sign In
                        <ArrowRight size={16} className="text-white/60" />
                      </Link>
                    </div>
                  </div>
                  
                  {/* Right Content - Stats Card */}
                  <div className="hidden lg:block">
                    <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="text-center p-4 bg-white/5 rounded-2xl">
                          <p className="text-4xl font-bold text-white mb-1">{totalLandlords || 0}+</p>
                          <p className="text-sm text-white/50">Active Landlords</p>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-2xl">
                          <p className="text-4xl font-bold text-white mb-1">{totalListings || 0}+</p>
                          <p className="text-sm text-white/50">Properties Listed</p>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-2xl">
                          <p className="text-4xl font-bold text-white mb-1">24h</p>
                          <p className="text-sm text-white/50">Avg First Inquiry</p>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-2xl">
                          <p className="text-4xl font-bold text-white mb-1">98%</p>
                          <p className="text-sm text-white/50">Satisfied Landlords</p>
                        </div>
                      </div>
                      
                      {/* Testimonial */}
                      <div className="border-t border-white/10 pt-6">
                        <p className="text-white/80 italic mb-4 text-sm leading-relaxed">
                          "{featuredReview ? featuredReview.comment.slice(0, 150) + (featuredReview.comment.length > 150 ? '...' : '') : 'I listed my property and had quality inquiries within hours. The platform is incredibly easy to use!'}"
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/30 to-white/10" />
                          <div>
                            <p className="text-white font-medium text-sm">
                              {featuredReview && reviewAuthor?.name
                                ? reviewAuthor.name.split(' ')[0] + ' ' + (reviewAuthor.name.split(' ')[1]?.[0] || '') + '.'
                                : recentLandlords?.[0]?.name?.split(' ')[0] || 'Huts User'}
                            </p>
                            <p className="text-white/40 text-xs">
                              {featuredReview && reviewProperty
                                ? `Reviewed property in ${reviewProperty.neighborhood || reviewProperty.city || 'Harare'}`
                                : 'Property Owner'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Avatar stack */}
                      <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {[0, 1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded-full bg-gradient-to-br from-white/30 to-white/10 ring-2 ring-[#212529]"
                              style={{ zIndex: 5 - i }}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-white/40">
                          <span className="text-white font-semibold">{totalLandlords || 0}+</span> landlords trust us
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Mobile trust indicator */}
                <div className="lg:hidden mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex -space-x-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-9 h-9 rounded-full bg-gradient-to-br from-white/30 to-white/10 ring-2 ring-[#212529]"
                        style={{ zIndex: 4 - i }}
                      />
                    ))}
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-xs font-semibold ring-2 ring-[#212529]">
                      +{Math.max((totalLandlords || 0) - 4, 99)}
                    </div>
                  </div>
                  <p className="text-sm text-white/60">
                    Already trusted by <span className="font-bold text-white">{totalLandlords || 0}+</span> landlords
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'RealEstateAgent',
            name: 'Huts',
            url: 'https://www.huts.co.zw',
            logo: 'https://www.huts.co.zw/logo.png',
            description: "Zimbabwe's rental property marketplace connecting renters with landlords",
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'ZW',
            },
            areaServed: {
              '@type': 'Country',
              name: 'Zimbabwe',
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            url: 'https://www.huts.co.zw',
            name: 'Huts',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://www.huts.co.zw/search?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
    </div>
  )
}
