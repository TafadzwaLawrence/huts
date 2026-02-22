import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Home, DollarSign, ArrowRight } from 'lucide-react'

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

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-[#F8F9FA] border-b border-[#E9ECEF] py-16 md:py-24">
        <div className="container-main max-w-6xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#212529] mb-6 tracking-tight">
            Explore Neighborhoods
          </h1>
          <p className="text-lg md:text-xl text-[#495057] max-w-2xl mx-auto leading-relaxed">
            Browse rental properties by area. Get local insights, average prices, and find your perfect neighborhood.
          </p>
        </div>
      </section>

      {/* Areas Grid */}
      <section className="py-16 md:py-20">
        <div className="container-main">
          {areas && areas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {areas.map((area) => (
                <Link
                  key={area.id}
                  href={`/areas/${area.slug}`}
                  className="group block bg-white border-2 border-[#E9ECEF] rounded-xl p-6 hover:border-[#212529] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Header */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-[#212529] mb-2 group-hover:underline underline-offset-2">
                      {area.name}
                    </h3>
                    <div className="flex items-center text-sm text-[#495057]">
                      <MapPin size={14} className="mr-1.5 text-[#ADB5BD]" />
                      {area.neighborhood ? `${area.neighborhood}, ` : ''}{area.city}
                    </div>
                  </div>

                  {/* Description */}
                  {area.description && (
                    <p className="text-sm text-[#495057] mb-4 line-clamp-2 leading-relaxed">
                      {area.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-[#F8F9FA]">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Home size={16} className="text-[#ADB5BD]" />
                        <span className="text-xl font-bold text-[#212529]">
                          {area.property_count}
                        </span>
                      </div>
                      <p className="text-xs text-[#ADB5BD]">Properties</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <DollarSign size={16} className="text-[#ADB5BD]" />
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
                  <div className="mt-4 pt-4 border-t-2 border-[#F8F9FA] flex items-center justify-between text-sm font-medium text-[#212529]">
                    <span>View area guide</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
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

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Browse Neighborhoods in Zimbabwe',
            description: 'Explore rental properties and homes for sale by neighborhood across Zimbabwe.',
            url: 'https://www.huts.co.zw/areas',
            isPartOf: { '@type': 'WebSite', url: 'https://www.huts.co.zw' },
            ...(areas && areas.length > 0 && {
              mainEntity: {
                '@type': 'ItemList',
                numberOfItems: areas.length,
                itemListElement: areas.map((area: any, i: number) => ({
                  '@type': 'ListItem',
                  position: i + 1,
                  name: area.name,
                  url: `https://www.huts.co.zw/areas/${area.slug}`,
                })),
              },
            }),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.huts.co.zw' },
              { '@type': 'ListItem', position: 2, name: 'Areas', item: 'https://www.huts.co.zw/areas' },
            ],
          }),
        }}
      />
    </div>
  )
}
