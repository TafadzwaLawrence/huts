import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Home, DollarSign, ArrowRight, TrendingUp, Search, Grid3x3 } from 'lucide-react'
import AreaSearchClient from '@/components/areas/AreaSearchClient'

export const metadata: Metadata = {
  title: 'Browse Neighborhoods — Rentals & Homes by Area | Huts',
  description: 'Explore rental properties and homes for sale by neighborhood across Zimbabwe. Get local insights, average prices, and find your perfect area in Harare, Bulawayo, and beyond.',
  openGraph: {
    title: 'Browse Neighborhoods — Rentals & Homes by Area | Huts',
    description: 'Explore properties by neighborhood across Zimbabwe. Local insights, average prices, and verified listings.',
    url: 'https://www.huts.co.zw/areas',
  },
  alternates: {
    canonical: 'https://www.huts.co.zw/areas',
  },
}

export default async function AreasPage() {
  const supabase = await createClient()

  // Fetch all area guides
  const { data: areas } = await supabase
    .from('area_guides')
    .select('*')
    .order('property_count', { ascending: false })
  
  // Get unique cities for tabs
  const cities = areas ? Array.from(new Set(areas.map(a => a.city))).sort() : []
  
  // Get market stats
  const totalProperties = areas?.reduce((sum, a) => sum + (a.property_count || 0), 0) || 0
  const avgPriceOverall = areas?.filter(a => a.avg_rent).reduce((sum, a) => sum + (a.avg_rent || 0), 0) / (areas?.filter(a => a.avg_rent).length || 1)
  const activeAreas = areas?.filter(a => (a.property_count || 0) > 0).length || 0

  return (
    <>
      <AreaSearchClient />
      <div className="min-h-screen bg-white">
        {/* Hero Section with Market Overview */}
        <section className="relative bg-gradient-to-b from-[#F8F9FA] to-white border-b border-[#E9ECEF] py-12 md:py-16 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/pexels-davidmcbee-1546168.jpg"
              alt="Zimbabwe neighborhoods"
              fill
              className="object-cover"
              priority
            />
            {/* Dark Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
          </div>

          <div className="container-main max-w-7xl relative z-10">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
                Explore Neighborhoods
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                Browse {totalProperties.toLocaleString()} properties across {activeAreas} neighborhoods. Find local insights, market trends, and your perfect area.
              </p>
            </div>

            {/* Market Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
              <div className="bg-white/95 backdrop-blur-sm border-2 border-white/20 rounded-xl p-6 text-center hover:bg-white transition-all shadow-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Grid3x3 size={24} className="text-[#212529]" />
                  <span className="text-3xl font-bold text-[#212529]">{activeAreas}</span>
                </div>
                <p className="text-sm text-[#ADB5BD] font-medium">Active Areas</p>
              </div>
              <div className="bg-white/95 backdrop-blur-sm border-2 border-white/20 rounded-xl p-6 text-center hover:bg-white transition-all shadow-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Home size={24} className="text-[#212529]" />
                  <span className="text-3xl font-bold text-[#212529]">{totalProperties.toLocaleString()}</span>
                </div>
                <p className="text-sm text-[#ADB5BD] font-medium">Total Properties</p>
              </div>
              <div className="bg-white/95 backdrop-blur-sm border-2 border-white/20 rounded-xl p-6 text-center hover:bg-white transition-all shadow-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <DollarSign size={24} className="text-[#212529]" />
                  <span className="text-3xl font-bold text-[#212529]">
                    ${Math.round(avgPriceOverall / 100).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-[#ADB5BD] font-medium">Avg Monthly Rent</p>
              </div>
            </div>

            {/* City Tabs */}
            {cities.length > 1 && (
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <Link
                  href="/areas"
                  className="px-6 py-2.5 bg-white text-[#212529] rounded-full font-medium text-sm hover:bg-white/90 transition-all shadow-md"
                >
                  All Cities
                </Link>
                {cities.map(city => (
                  <Link
                    key={city}
                    href={`/areas?city=${encodeURIComponent(city)}`}
                    className="px-6 py-2.5 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white rounded-full font-medium text-sm hover:bg-white/30 transition-all"
                  >
                    {city}
                  </Link>
                ))}
              </div>
            )}

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ADB5BD]" size={20} />
                <input
                  type="text"
                  placeholder="Search neighborhoods by name or location..."
                  className="w-full pl-12 pr-4 py-4 border-2 border-white/20 bg-white/95 backdrop-blur-sm rounded-xl text-[#212529] placeholder:text-[#ADB5BD] focus:outline-none focus:border-white focus:bg-white transition-all shadow-lg"
                  id="area-search-input"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Areas (Top 3 by Property Count) */}
        {areas && areas.length > 0 && (
          <section className="py-12 md:py-16 bg-[#F8F9FA]">
            <div className="container-main max-w-7xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-[#212529] mb-2">Most Popular Neighborhoods</h2>
                  <p className="text-[#495057]">Top areas with the most available properties</p>
                </div>
                <TrendingUp size={28} className="text-[#212529]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {areas.slice(0, 3).map((area, index) => (
                  <Link
                    key={area.id}
                    href={`/areas/${area.slug}`}
                    className="group relative bg-white border-2 border-[#212529] rounded-xl p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
                  >
                    {/* Rank Badge */}
                    <div className="absolute top-4 right-4 w-10 h-10 bg-[#212529] text-white rounded-full flex items-center justify-center font-bold text-lg">
                      #{index + 1}
                    </div>

                    {/* Content */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-[#212529] mb-2 pr-12">
                        {area.name}
                      </h3>
                      <div className="flex items-center text-sm text-[#495057] mb-4">
                        <MapPin size={14} className="mr-1.5 text-[#ADB5BD]" />
                        {area.city}
                      </div>
                      {area.description && (
                        <p className="text-sm text-[#495057] line-clamp-3 leading-relaxed mb-4">
                          {area.description}
                        </p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-[#F8F9FA]">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Home size={18} className="text-[#212529]" />
                          <span className="text-2xl font-bold text-[#212529]">
                            {area.property_count}
                          </span>
                        </div>
                        <p className="text-xs text-[#ADB5BD]">Properties</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <DollarSign size={18} className="text-[#212529]" />
                          <span className="text-2xl font-bold text-[#212529]">
                            {area.avg_rent 
                              ? `$${Math.round(area.avg_rent / 100).toLocaleString()}`
                              : '—'
                            }
                          </span>
                        </div>
                        <p className="text-xs text-[#ADB5BD]">Avg Rent</p>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="mt-6 flex items-center justify-between text-sm font-semibold text-[#212529]">
                      <span>Explore neighborhood</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Areas Grid */}
        <section className="py-16 md:py-20">
          <div className="container-main max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-[#212529] mb-2">All Neighborhoods</h2>
                <p className="text-[#495057]">Browse all {areas?.length || 0} areas in Zimbabwe</p>
              </div>
            </div>

            {areas && areas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" id="areas-grid">
                {areas.map((area) => {
                  const priceLevel = area.avg_rent 
                    ? area.avg_rent / 100 > 600 ? 'Premium' 
                      : area.avg_rent / 100 > 300 ? 'Mid-Range' 
                      : 'Affordable'
                    : null

                  return (
                    <Link
                      key={area.id}
                      href={`/areas/${area.slug}`}
                      className="group block bg-white border-2 border-[#E9ECEF] rounded-xl p-5 hover:border-[#212529] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      {/* Header */}
                      <div className="mb-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold text-[#212529] group-hover:underline underline-offset-2 leading-tight">
                            {area.name}
                          </h3>
                          {priceLevel && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                              priceLevel === 'Premium' ? 'bg-[#212529] text-white' :
                              priceLevel === 'Mid-Range' ? 'bg-[#495057] text-white' :
                              'bg-[#E9ECEF] text-[#495057]'
                            }`}>
                              {priceLevel}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-[#495057]">
                          <MapPin size={12} className="mr-1 text-[#ADB5BD]" />
                          {area.city}
                        </div>
                      </div>

                      {/* Description */}
                      {area.description && (
                        <p className="text-xs text-[#495057] mb-4 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                          {area.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 pt-4 border-t-2 border-[#F8F9FA]">
                        <div>
                          <div className="flex items-center gap-1 mb-0.5">
                            <Home size={14} className="text-[#ADB5BD]" />
                            <span className="text-lg font-bold text-[#212529]">
                              {area.property_count || 0}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#ADB5BD] font-medium">Properties</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 mb-0.5">
                            <DollarSign size={14} className="text-[#ADB5BD]" />
                            <span className="text-lg font-bold text-[#212529]">
                              {area.avg_rent 
                                ? `$${Math.round(area.avg_rent / 100).toLocaleString()}`
                                : '—'
                              }
                            </span>
                          </div>
                          <p className="text-[10px] text-[#ADB5BD] font-medium">Avg Rent</p>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="mt-4 pt-3 border-t-2 border-[#F8F9FA] flex items-center justify-between text-xs font-semibold text-[#212529]">
                        <span>View details</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-20">
                <MapPin size={48} className="mx-auto text-[#ADB5BD] mb-4" />
                <h3 className="text-xl font-bold text-[#212529] mb-2">No area guides yet</h3>
                <p className="text-[#495057] mb-6">Check back soon for local neighborhood guides</p>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 bg-[#212529] text-white px-6 py-3 rounded-lg font-medium hover:bg-black hover:shadow-xl transition-all"
                >
                  Browse All Properties
                  <ArrowRight size={18} />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 bg-[#F8F9FA] border-t border-[#E9ECEF]">
          <div className="container-main text-center max-w-3xl">
            <h2 className="text-3xl font-bold text-[#212529] mb-4">
              Don&apos;t see your area?
            </h2>
            <p className="text-lg text-[#495057] mb-8">
              Search all properties across the city or contact us to add your neighborhood
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-[#212529] text-white px-8 py-4 rounded-lg font-semibold hover:bg-black hover:shadow-xl transition-all"
            >
              Search All Properties
              <ArrowRight size={20} />
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
