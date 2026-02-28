import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Search, Home, Bed, Bath, Square, ArrowRight, Check, Building2, TrendingUp } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { ICON_SIZES } from '@/lib/constants'
import SaveButton from '@/components/property/SaveButton'

export const metadata: Metadata = {
  title: 'Properties for Rent in Zimbabwe — Houses, Apartments & Rooms | Huts',
  description: 'Find rental properties across Zimbabwe. 100+ verified apartments, houses, and rooms in Harare, Bulawayo, Gweru, Mutare, and all major cities. Affordable rent, verified landlords, direct contact.',
  keywords: [
    'properties for rent in Zimbabwe',
    'Zimbabwe rentals',
    'rent property Zimbabwe',
    'apartments for rent Zimbabwe',
    'houses for rent Zimbabwe',
    'accommodation Zimbabwe',
    'rental properties Harare',
    'rental properties Bulawayo',
    'Gweru rentals',
    'Mutare accommodation',
    'find place to rent Zimbabwe',
    'rental listings Zimbabwe',
  ],
  openGraph: {
    title: 'Properties for Rent in Zimbabwe | Huts',
    description: '100+ verified rental properties across Zimbabwe. Harare, Bulawayo, Gweru, and more.',
    url: 'https://www.huts.co.zw/properties-for-rent-zimbabwe',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  alternates: {
    canonical: 'https://www.huts.co.zw/properties-for-rent-zimbabwe',
  },
}

// ISR
export const revalidate = 3600

export default async function ZimbabweRentalsPage() {
  const supabase = await createClient()

  // Fetch latest rental properties across Zimbabwe
  const { data: properties } = await supabase
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
      property_type,
      created_at,
      property_images(url, is_primary)
    `)
    .eq('status', 'active')
    .eq('verification_status', 'approved')
    .eq('listing_type', 'rent')
    .order('created_at', { ascending: false })
    .limit(24)

  // Get total count
  const { count: totalCount } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .eq('verification_status', 'approved')
    .eq('listing_type', 'rent')

  // Get cities with counts
  const { data: cityData } = await supabase
    .from('properties')
    .select('city')
    .eq('status', 'active')
    .eq('verification_status', 'approved')
    .eq('listing_type', 'rent')

  const cityCounts = cityData?.reduce((acc: any, prop: any) => {
    if (!acc[prop.city]) acc[prop.city] = 0
    acc[prop.city]++
    return acc
  }, {})

  const topCities = Object.entries(cityCounts || {})
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }))

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-white via-[#F8F9FA] to-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #212529 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
        
        <div className="container-main max-w-7xl relative">
          <nav className="mb-8 flex items-center gap-2 text-sm text-[#495057]">
            <Link href="/" className="hover:text-[#212529]">Home</Link>
            <span>/</span>
            <span className="text-[#212529] font-medium">Rentals in Zimbabwe</span>
          </nav>

          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#212529] mb-8 tracking-tight leading-tight">
              Find Properties for Rent<br className="hidden md:block" /> in Zimbabwe
            </h1>
            <p className="text-xl md:text-2xl text-[#495057] mb-10 leading-relaxed max-w-3xl mx-auto">
              Browse <strong>{totalCount?.toLocaleString() || '0'} verified rental properties</strong> across Zimbabwe. Apartments, houses, and rooms in Harare, Bulawayo, Gweru, Mutare, and every major city. Connect directly with landlords. Zero fees.
            </p>

            {/* Search */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#212529]/20 to-[#495057]/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-white rounded-2xl shadow-2xl border-2 border-[#E9ECEF] p-2">
                  <div className="flex flex-col md:flex-row gap-2">
                    <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-[#F8F9FA] rounded-xl">
                      <Search size={ICON_SIZES.lg} className="text-[#495057]" />
                      <input
                        type="text"
                        placeholder="Search by city or neighborhood..."
                        className="w-full bg-transparent outline-none text-[#212529] placeholder:text-[#ADB5BD] font-medium"
                      />
                    </div>
                    <Link
                      href="/search?type=rent"
                      className="flex items-center justify-center gap-2 bg-[#212529] text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition-all hover:shadow-2xl"
                    >
                      Search Rentals
                      <ArrowRight size={ICON_SIZES.lg} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
              {[
                { value: totalCount?.toLocaleString() || '0', label: 'Active Listings' },
                { value: topCities.length.toString(), label: 'Cities Covered' },
                { value: 'Free', label: 'To Join' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-4xl md:text-5xl font-bold text-[#212529] mb-2">{stat.value}</div>
                  <div className="text-sm text-[#ADB5BD]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className="py-16 md:py-20 bg-[#F8F9FA] border-y border-[#E9ECEF]">
        <div className="container-main">
          <h2 className="text-3xl md:text-4xl font-bold text-[#212529] mb-10 text-center">
            Browse Rentals by City
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {topCities.map(({ name, count }: any) => (
              <Link
                key={name}
                href={`/search?city=${encodeURIComponent(name)}&type=rent`}
                className="group bg-white border-2 border-[#E9ECEF] rounded-2xl p-6 text-center hover:border-[#212529] hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="w-14 h-14 bg-[#F8F9FA] group-hover:bg-[#212529] rounded-xl flex items-center justify-center mx-auto mb-4 transition-colors">
                  <MapPin size={ICON_SIZES.xl} className="text-[#495057] group-hover:text-white transition-colors" />
                </div>
                <div className="text-3xl font-bold text-[#212529] mb-2">{count}</div>
                <div className="font-semibold text-[#495057] mb-1">{name}</div>
                <div className="text-xs text-[#ADB5BD]">properties</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Properties */}
      <section className="py-16 md:py-24">
        <div className="container-main">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#212529] mb-2">
                Latest Rental Properties
              </h2>
              <p className="text-[#495057]">Recently listed across Zimbabwe</p>
            </div>
            <Link
              href="/search?type=rent"
              className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-[#212529] border-2 border-[#E9ECEF] px-6 py-3 rounded-full hover:border-[#212529] hover:bg-[#212529] hover:text-white transition-all"
            >
              View all <ArrowRight size={ICON_SIZES.md} />
            </Link>
          </div>

          {properties && properties.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {properties.map((property: any) => {
                const primaryImage = property.property_images?.find((img: any) => img.is_primary) || property.property_images?.[0]
                const imageUrl = primaryImage?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop'
                
                return (
                  <Link
                    key={property.id}
                    href={`/property/${property.slug || property.id}`}
                    className="group"
                  >
                    <article className="border border-[#E9ECEF] rounded-2xl overflow-hidden bg-white hover:border-[#212529] hover:shadow-xl transition-all duration-300">
                      <div className="relative h-52 overflow-hidden bg-[#F8F9FA]">
                        <Image
                          src={imageUrl}
                          alt={property.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                        <div className="absolute bottom-3 left-3">
                          <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg">
                            <span className="text-lg font-bold text-[#212529]">
                              {formatPrice(property.price)}
                            </span>
                            <span className="text-xs text-[#495057] ml-0.5">/mo</span>
                          </div>
                        </div>
                        <SaveButton className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white hover:scale-110 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center shadow-sm" />
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-[#212529] mb-2 line-clamp-1 group-hover:underline">
                          {property.title}
                        </h3>
                        <div className="flex items-center text-[#495057] text-sm mb-3">
                          <MapPin size={ICON_SIZES.sm} className="mr-1.5 text-[#ADB5BD]" />
                          <span className="truncate">{property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm pt-3 border-t border-[#E9ECEF]">
                          <span className="flex items-center gap-1">
                            <Bed size={ICON_SIZES.sm} className="text-[#ADB5BD]" />
                            <span className="font-semibold text-[#212529]">{property.beds}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Bath size={ICON_SIZES.sm} className="text-[#ADB5BD]" />
                            <span className="font-semibold text-[#212529]">{property.baths}</span>
                          </span>
                          {property.sqft && (
                            <span className="flex items-center gap-1">
                              <Square size={ICON_SIZES.sm} className="text-[#ADB5BD]" />
                              <span className="font-semibold text-[#212529]">{property.sqft}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-16 md:py-20 bg-[#F8F9FA] border-t border-[#E9ECEF]">
        <div className="container-main max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-[#212529] mb-8">
            Your Guide to Renting Property in Zimbabwe
          </h2>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-[#495057] leading-relaxed mb-8">
              Finding quality rental accommodation in Zimbabwe has never been easier. Huts connects renters directly with verified landlords across all major cities and towns. Whether you're moving to Harare for work, studying in Gweru, or relocating to Bulawayo, our platform offers transparent pricing, instant messaging, and a streamlined rental process.
            </p>

            <h3 className="text-2xl font-bold text-[#212529] mb-4 mt-10">
              Popular Cities for Rentals in Zimbabwe
            </h3>
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              {[
                { city: 'Harare', desc: 'Capital city with the largest selection of apartments, houses, and rooms across diverse neighborhoods.' },
                { city: 'Bulawayo', desc: 'Zimbabwe\'s second city offering affordable rental options in established suburbs.' },
                { city: 'Gweru', desc: 'Central location with student-friendly accommodation near Midlands State University.' },
                { city: 'Mutare', desc: 'Eastern highlands city with scenic properties and growing rental market.' },
              ].map((item) => (
                <div key={item.city} className="bg-white border-2 border-[#E9ECEF] rounded-xl p-6">
                  <h4 className="font-bold text-[#212529] text-xl mb-3 flex items-center gap-2">
                    <MapPin size={ICON_SIZES.lg} className="text-[#495057]" />
                    {item.city}
                  </h4>
                  <p className="text-[#495057] leading-relaxed mb-4">{item.desc}</p>
                  <Link
                    href={`/search?city=${encodeURIComponent(item.city)}&type=rent`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#212529] hover:underline"
                  >
                    View {item.city} rentals <ArrowRight size={ICON_SIZES.sm} />
                  </Link>
                </div>
              ))}
            </div>

            <h3 className="text-2xl font-bold text-[#212529] mb-6 mt-12">
              Types of Rental Properties Available
            </h3>
            <div className="space-y-4 mb-10">
              {[
                { type: 'Apartments', desc: '1–3 bedroom units in secure complexes with amenities like parking, WiFi, and 24/7 security.' },
                { type: 'Houses', desc: 'Family homes with 2–5 bedrooms, gardens, and private parking in residential suburbs.' },
                { type: 'Rooms', desc: 'Affordable single rooms in shared houses, ideal for students and young professionals.' },
                { type: 'Cottages', desc: 'Self-contained units on larger properties, offering privacy and independence.' },
              ].map((item) => (
                <div key={item.type} className="flex items-start gap-4 bg-white border border-[#E9ECEF] rounded-xl p-5">
                  <div className="w-10 h-10 bg-[#F8F9FA] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Home size={ICON_SIZES.lg} className="text-[#212529]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#212529] mb-1">{item.type}</h4>
                    <p className="text-sm text-[#495057] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-2xl font-bold text-[#212529] mb-6 mt-12">
              Average Rental Costs Across Zimbabwe
            </h3>
            <div className="bg-white border-2 border-[#E9ECEF] rounded-2xl p-6 md:p-8 mb-10">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#F1F3F5]">
                  <span className="font-medium text-[#495057]">1-bedroom apartment</span>
                  <span className="font-bold text-[#212529]">$200–$600/month</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-[#F1F3F5]">
                  <span className="font-medium text-[#495057]">2-bedroom apartment</span>
                  <span className="font-bold text-[#212529]">$400–$1,000/month</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-[#F1F3F5]">
                  <span className="font-medium text-[#495057]">3-bedroom house</span>
                  <span className="font-bold text-[#212529]">$600–$1,500/month</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#495057]">Room in shared house</span>
                  <span className="font-bold text-[#212529]">$150–$400/month</span>
                </div>
              </div>
              <p className="text-sm text-[#ADB5BD] mt-6">
                * Prices vary by location, amenities, and property condition. Premium areas like Borrowdale and Chisipite command higher rates.
              </p>
            </div>

            <div className="bg-[#212529] text-white rounded-2xl p-8 md:p-10">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Start Your Property Search Today
              </h3>
              <p className="text-white/80 text-lg mb-8 leading-relaxed">
                Join thousands of renters who found their perfect home on Huts. Browse verified listings, connect directly with landlords, and move in faster—completely free.
              </p>
              <Link
                href="/search?type=rent"
                className="inline-flex items-center gap-3 bg-white text-[#212529] px-8 py-4 rounded-xl font-bold hover:bg-[#F8F9FA] transition-all text-lg"
              >
                <Search size={ICON_SIZES.xl} />
                Browse All Rentals
                <ArrowRight size={ICON_SIZES.lg} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Properties for Rent in Zimbabwe',
            description: 'Find rental properties across Zimbabwe. 100+ verified apartments, houses, and rooms in all major cities.',
            url: 'https://www.huts.co.zw/properties-for-rent-zimbabwe',
            isPartOf: { '@type': 'WebSite', url: 'https://www.huts.co.zw' },
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.huts.co.zw' },
                { '@type': 'ListItem', position: 2, name: 'Rentals in Zimbabwe' },
              ],
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'How much does it cost to rent an apartment in Zimbabwe?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Rental prices in Zimbabwe vary by location and property type. 1-bedroom apartments typically range from $200–$600/month, 2-bedroom apartments from $400–$1,000/month, and 3-bedroom houses from $600–$1,500/month. Room rentals in shared houses start from $150/month.',
                },
              },
              {
                '@type': 'Question',
                name: 'Are all properties on Huts verified?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes, every property listing on Huts is manually reviewed and verified before going live. We check photos, confirm landlord identity, and verify pricing accuracy to ensure you only see legitimate, active rentals.',
                },
              },
              {
                '@type': 'Question',
                name: 'Which cities in Zimbabwe have the most rental properties?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Harare, as the capital, has the largest selection of rental properties, followed by Bulawayo, Gweru, and Mutare. Huts covers properties across all major cities and towns throughout Zimbabwe.',
                },
              },
            ],
          }),
        }}
      />
    </div>
  )
}
