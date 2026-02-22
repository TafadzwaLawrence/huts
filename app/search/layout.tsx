import type { Metadata } from 'next'
import Link from 'next/link'
import { createStaticClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Search Properties for Rent & Sale in Zimbabwe',
  description: 'Search and filter rental properties and homes for sale across Zimbabwe. Find apartments, houses, studios in Harare, Bulawayo, Gweru by location, price, and amenities.',
  keywords: ['rent house Zimbabwe', 'buy property Zimbabwe', 'apartments Harare', 'houses Bulawayo', 'property search Zimbabwe', 'accommodation Zimbabwe'],
  openGraph: {
    title: 'Search Properties for Rent & Sale | Huts',
    description: 'Find your perfect rental or home for sale in Zimbabwe. Filter by city, price, bedrooms, and more.',
    url: 'https://www.huts.co.zw/search',
  },
  alternates: {
    canonical: 'https://www.huts.co.zw/search',
  },
}

export default async function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch data for SEO-visible content (crawlable links)
  const supabase = createStaticClient()

  const [
    { data: recentProperties },
    { data: neighborhoodData },
    { count: totalCount },
  ] = await Promise.all([
    supabase
      .from('properties')
      .select('id, title, slug, city, neighborhood, listing_type, beds, baths, price, sale_price')
      .eq('status', 'active')
      .eq('verification_status', 'approved')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('properties')
      .select('neighborhood, city')
      .eq('status', 'active')
      .eq('verification_status', 'approved')
      .not('neighborhood', 'is', null),
    supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('verification_status', 'approved'),
  ])

  // Build unique neighborhoods
  const neighborhoods = Object.values(
    (neighborhoodData || []).reduce((acc: Record<string, { name: string; city: string; count: number }>, p: any) => {
      const key = `${p.neighborhood}|${p.city}`
      if (!acc[key]) acc[key] = { name: p.neighborhood, city: p.city, count: 0 }
      acc[key].count++
      return acc
    }, {})
  )
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 12)

  return (
    <>
      {children}

      {/* Server-rendered SEO content — crawlable by search engines */}
      <section className="bg-[#F8F9FA] border-t border-[#E9ECEF] py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#212529] mb-4">
            Browse {totalCount || 0}+ Properties Across Zimbabwe
          </h2>
          <p className="text-[#495057] mb-8 max-w-2xl">
            Discover verified rental properties and homes for sale in Zimbabwe&apos;s most popular neighborhoods. 
            Filter by location, price, bedrooms, and property type to find your perfect home.
          </p>

          {/* Popular neighborhoods with crawlable links */}
          {(neighborhoods as any[]).length > 0 && (
            <div className="mb-10">
              <h3 className="text-lg font-semibold text-[#212529] mb-4">Popular Neighborhoods</h3>
              <div className="flex flex-wrap gap-2">
                {(neighborhoods as any[]).map((n: any) => (
                  <Link
                    key={`${n.name}-${n.city}`}
                    href={`/search?neighborhood=${encodeURIComponent(n.name)}&city=${encodeURIComponent(n.city)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E9ECEF] rounded-full text-sm text-[#495057] hover:border-[#212529] hover:text-[#212529] transition-colors"
                  >
                    {n.name}, {n.city}
                    <span className="text-xs text-[#ADB5BD]">({n.count})</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick filter links — crawlable by Google */}
          <div className="mb-10">
            <h3 className="text-lg font-semibold text-[#212529] mb-4">Browse by Type</h3>
            <div className="flex flex-wrap gap-3">
              <Link href="/search?type=rent" className="px-4 py-2 bg-white border border-[#E9ECEF] rounded-lg text-sm font-medium text-[#212529] hover:border-[#212529] transition-colors">
                All Rentals
              </Link>
              <Link href="/search?type=sale" className="px-4 py-2 bg-white border border-[#E9ECEF] rounded-lg text-sm font-medium text-[#212529] hover:border-[#212529] transition-colors">
                All Homes for Sale
              </Link>
              <Link href="/search?beds=1&type=rent" className="px-4 py-2 bg-white border border-[#E9ECEF] rounded-lg text-sm font-medium text-[#495057] hover:border-[#212529] transition-colors">
                1 Bedroom Rentals
              </Link>
              <Link href="/search?beds=2&type=rent" className="px-4 py-2 bg-white border border-[#E9ECEF] rounded-lg text-sm font-medium text-[#495057] hover:border-[#212529] transition-colors">
                2 Bedroom Rentals
              </Link>
              <Link href="/search?beds=3&type=rent" className="px-4 py-2 bg-white border border-[#E9ECEF] rounded-lg text-sm font-medium text-[#495057] hover:border-[#212529] transition-colors">
                3+ Bedroom Rentals
              </Link>
              <Link href="/student-housing" className="px-4 py-2 bg-white border border-[#E9ECEF] rounded-lg text-sm font-medium text-[#495057] hover:border-[#212529] transition-colors">
                Student Housing
              </Link>
            </div>
          </div>

          {/* Recent property listings — crawlable links */}
          {recentProperties && recentProperties.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-[#212529] mb-4">Recently Listed Properties</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recentProperties.map((p: any) => (
                  <li key={p.id}>
                    <Link
                      href={`/property/${p.slug || p.id}`}
                      className="block p-3 bg-white border border-[#E9ECEF] rounded-lg hover:border-[#212529] hover:shadow-sm transition-all"
                    >
                      <span className="block text-sm font-medium text-[#212529] line-clamp-1">{p.title}</span>
                      <span className="block text-xs text-[#495057] mt-1">
                        {p.neighborhood ? `${p.neighborhood}, ` : ''}{p.city} · {p.beds} bed · {p.baths} bath
                        {p.listing_type === 'sale' ? ' · For Sale' : ' · For Rent'}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* More internal links */}
          <div className="mt-10 pt-8 border-t border-[#E9ECEF] flex flex-wrap gap-4 text-sm">
            <Link href="/areas" className="text-[#495057] hover:text-[#212529] hover:underline">Browse by Area</Link>
            <Link href="/student-housing" className="text-[#495057] hover:text-[#212529] hover:underline">Student Housing</Link>
            <Link href="/pricing" className="text-[#495057] hover:text-[#212529] hover:underline">List Your Property Free</Link>
            <Link href="/help" className="text-[#495057] hover:text-[#212529] hover:underline">Help Center</Link>
            <Link href="/contact" className="text-[#495057] hover:text-[#212529] hover:underline">Contact Us</Link>
          </div>
        </div>
      </section>

      {/* JSON-LD for search page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SearchResultsPage',
            name: 'Search Properties in Zimbabwe',
            description: 'Search rental properties and homes for sale across Zimbabwe',
            url: 'https://www.huts.co.zw/search',
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: totalCount || 0,
              itemListElement: (recentProperties || []).slice(0, 10).map((p: any, i: number) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: `https://www.huts.co.zw/property/${p.slug || p.id}`,
                name: p.title,
              })),
            },
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
              { '@type': 'ListItem', position: 2, name: 'Search Properties', item: 'https://www.huts.co.zw/search' },
            ],
          }),
        }}
      />
    </>
  )
}
