import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MapPin, ArrowRight, Home, DollarSign, ChevronRight } from 'lucide-react'
import AreasMapSearch from '@/components/areas/AreasMapSearch'
import NeighborhoodsGrid from '@/components/areas/NeighborhoodsGrid'

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
  
  // Fetch properties with coordinates for map
  const { data: properties } = await supabase
    .from('properties')
    .select(`
      id,
      slug,
      title,
      price,
      sale_price,
      listing_type,
      bedrooms,
      bathrooms,
      lat,
      lng,
      city,
      area,
      status,
      property_images (url)
    `)
    .eq('status', 'active')
    .not('lat', 'is', null)
    .not('lng', 'is', null)
    .order('created_at', { ascending: false })
    .limit(500)
  
  // Get unique cities for tabs
  const cities = areas ? Array.from(new Set(areas.map(a => a.city))).sort() : []
  
  // Get market stats
  const totalProperties = areas?.reduce((sum, a) => sum + (a.property_count || 0), 0) || 0
  const avgPriceOverall = areas?.filter(a => a.avg_rent).reduce((sum, a) => sum + (a.avg_rent || 0), 0) / (areas?.filter(a => a.avg_rent).length || 1)
  const activeAreas = areas?.filter(a => (a.property_count || 0) > 0).length || 0

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-[#E9ECEF]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#ADB5BD] mb-6">
              <Link href="/" className="hover:text-[#495057] transition-colors">Home</Link>
              <ChevronRight size={11} />
              <span className="text-[#495057]">Neighborhoods</span>
            </nav>
            <h1 className="text-2xl md:text-3xl font-bold text-[#212529] mb-1">
              Explore neighborhoods
            </h1>
            <p className="text-sm text-[#ADB5BD]">
              Browse properties across {activeAreas} neighborhoods. Find local insights and your perfect area.
            </p>
          </div>
        </div>

        {/* Featured Areas (Top 3 by Property Count) */}
        {areas && areas.length > 0 && (
          <section className="py-12 md:py-16 bg-[#F8F9FA]">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="text-lg font-bold text-[#212529] mb-2">Most Popular Neighborhoods</h2>
                <p className="text-sm text-[#ADB5BD]">Top areas with the most available properties</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {areas.slice(0, 3).map((area, index) => (
                  <Link
                    key={area.id}
                    href={`/areas/${area.slug}`}
                    className="group relative bg-white border border-[#E9ECEF] rounded-lg p-6 hover:border-[#212529] hover:shadow-md transition-all duration-300 overflow-hidden"
                  >
                    {/* Rank Badge */}
                    <div className="absolute top-4 right-4 w-10 h-10 bg-[#212529] text-white rounded-full flex items-center justify-center font-bold text-lg">
                      #{index + 1}
                    </div>

                    {/* Content */}
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-[#212529] mb-2 pr-12">
                        {area.name}
                      </h3>
                      <div className="flex items-center text-sm text-[#495057] mb-3">
                        <MapPin size={14} className="mr-1.5 text-[#ADB5BD]" />
                        {area.city}
                      </div>
                      {area.description && (
                        <p className="text-sm text-[#495057] line-clamp-2 leading-relaxed">
                          {area.description}
                        </p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E9ECEF]">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Home size={16} className="text-[#212529]" />
                          <span className="text-xl font-bold text-[#212529]">
                            {area.property_count}
                          </span>
                        </div>
                        <p className="text-xs text-[#ADB5BD]">Properties</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <DollarSign size={16} className="text-[#212529]" />
                          <span className="text-xl font-bold text-[#212529]">
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
                    <div className="mt-4 flex items-center justify-between text-sm font-medium text-[#212529]">
                      <span>View details</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Neighborhoods — city-tabbed compact browser */}
        <section className="py-12 md:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-lg font-bold text-[#212529] mb-1">All Neighborhoods</h2>
              <p className="text-sm text-[#ADB5BD]">Browse all {areas?.length || 0} areas across Zimbabwe</p>
            </div>

            {areas && areas.length > 0 ? (
              <NeighborhoodsGrid areas={areas} />
            ) : (
              /* Empty State */
              <div className="text-center py-16">
                <MapPin size={40} className="mx-auto text-[#ADB5BD] mb-4" />
                <h3 className="text-lg font-bold text-[#212529] mb-2">No area guides yet</h3>
                <p className="text-sm text-[#495057] mb-6">Check back soon for local neighborhood guides</p>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 bg-[#212529] text-white px-6 py-3 rounded-lg font-medium hover:bg-black transition-colors"
                >
                  Browse All Properties
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  )
}
