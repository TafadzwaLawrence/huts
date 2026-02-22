import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Search, Home, Bed, Bath, Square, ArrowRight, Check, Building2, Car, Wifi, Shield } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { ICON_SIZES } from '@/lib/constants'
import SaveButton from '@/components/property/SaveButton'

export const metadata: Metadata = {
  title: 'Properties for Rent in Harare, Zimbabwe — Apartments, Houses & Rooms',
  description: 'Find apartments, houses, and rooms for rent in Harare. Browse 100+ verified rental properties in Borrowdale, Avondale, Mount Pleasant, and all Harare neighborhoods. Affordable rent, verified landlords.',
  keywords: [
    'properties for rent in Harare',
    'Harare rentals',
    'apartments for rent Harare',
    'houses for rent Harare',
    'rooms for rent Harare',
    'Harare accommodation',
    'rent in Harare Zimbabwe',
    'Borrowdale rentals',
    'Avondale apartments',
    'Mount Pleasant houses',
    'Harare rental properties',
    'find accommodation Harare',
  ],
  openGraph: {
    title: 'Properties for Rent in Harare, Zimbabwe',
    description: 'Browse 100+ verified rental properties in Harare. Apartments, houses, and rooms across all neighborhoods.',
    url: 'https://www.huts.co.zw/rentals-in-harare',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  alternates: {
    canonical: 'https://www.huts.co.zw/rentals-in-harare',
  },
}

// ISR - Revalidate every 2 hours
export const revalidate = 7200

export default async function HarareRentalsPage() {
  const supabase = await createClient()

  // Fetch properties in Harare
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
    .eq('city', 'Harare')
    .order('created_at', { ascending: false })
    .limit(24)

  // Get total Harare rental count
  const { count: totalCount } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .eq('verification_status', 'approved')
    .eq('listing_type', 'rent')
    .eq('city', 'Harare')

  // Get popular neighborhoods
  const { data: neighborhoods } = await supabase
    .from('properties')
    .select('neighborhood')
    .eq('status', 'active')
    .eq('verification_status', 'approved')
    .eq('city', 'Harare')
    .not('neighborhood', 'is', null)

  const neighborhoodCounts = neighborhoods?.reduce((acc: any, prop: any) => {
    if (!acc[prop.neighborhood]) acc[prop.neighborhood] = 0
    acc[prop.neighborhood]++
    return acc
  }, {})

  const topNeighborhoods = Object.entries(neighborhoodCounts || {})
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 12)
    .map(([name, count]) => ({ name, count }))

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - SEO Optimized */}
      <section className="relative bg-gradient-to-b from-white via-muted to-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        
        <div className="container-main max-w-6xl relative">
          {/* Breadcrumbs */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Rentals in Harare</span>
          </nav>

          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight leading-tight">
              Properties for Rent in Harare, Zimbabwe
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Discover <strong>{totalCount || '100+'} verified rental properties</strong> across Harare. Find apartments, houses, and rooms in Borrowdale, Avondale, Mount Pleasant, and every Harare neighborhood. All listings verified, all landlords checked.
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-border p-2 mb-8">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-muted rounded-xl">
                  <MapPin size={ICON_SIZES.lg} className="text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search neighborhoods in Harare..."
                    className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm font-medium"
                  />
                </div>
                <Link
                  href="/search?city=Harare&type=rent"
                  className="flex items-center justify-center gap-2 bg-foreground text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition-all hover:shadow-2xl"
                >
                  <Search size={ICON_SIZES.lg} />
                  <span>Search</span>
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { value: totalCount || '100+', label: 'Active Listings' },
                { value: topNeighborhoods.length || '20+', label: 'Neighborhoods' },
                { value: '24h', label: 'Avg Response' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white border border-border rounded-xl p-4">
                  <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Neighborhoods */}
      <section className="py-12 md:py-16 bg-muted border-y border-border">
        <div className="container-main">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
            Popular Neighborhoods in Harare
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {topNeighborhoods.map(({ name, count }: any) => (
              <Link
                key={name}
                href={`/search?city=Harare&neighborhood=${encodeURIComponent(name)}&type=rent`}
                className="group bg-white border-2 border-border rounded-xl p-4 text-center hover:border-foreground hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="w-10 h-10 bg-muted group-hover:bg-foreground rounded-lg flex items-center justify-center mx-auto mb-3 transition-colors">
                  <MapPin size={ICON_SIZES.lg} className="text-muted-foreground group-hover:text-white transition-colors" />
                </div>
                <div className="text-xl font-bold text-foreground mb-1">{count}</div>
                <div className="text-sm font-medium text-muted-foreground line-clamp-1">{name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Properties */}
      <section className="py-16 md:py-20">
        <div className="container-main">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Latest Rentals in Harare
            </h2>
            <Link
              href="/search?city=Harare&type=rent"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-foreground border-2 border-border px-5 py-2.5 rounded-full hover:border-foreground hover:bg-foreground hover:text-white transition-all"
            >
              View all <ArrowRight size={ICON_SIZES.sm} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {properties && properties.length > 0 ? (
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
                    <article className="border border-border rounded-2xl overflow-hidden bg-white hover:border-foreground hover:shadow-xl transition-all duration-300">
                      <div className="relative h-48 overflow-hidden bg-muted">
                        <Image
                          src={imageUrl}
                          alt={property.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                        <div className="absolute bottom-3 left-3">
                          <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg">
                            <span className="text-base font-bold text-foreground">
                              {formatPrice(property.price)}
                            </span>
                            <span className="text-xs text-muted-foreground ml-0.5">/mo</span>
                          </div>
                        </div>
                        <SaveButton className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white hover:scale-110 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center shadow-sm" />
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-foreground text-sm mb-2 leading-snug line-clamp-1 group-hover:underline">
                          {property.title}
                        </h3>
                        <div className="flex items-center text-muted-foreground text-xs mb-3">
                          <MapPin size={ICON_SIZES.xs} className="mr-1 flex-shrink-0 text-muted-foreground" />
                          <span className="truncate">{property.neighborhood}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-3 border-t border-border">
                          <span className="flex items-center gap-1">
                            <Bed size={ICON_SIZES.xs} className="text-muted-foreground" />
                            <span className="font-semibold text-foreground">{property.beds}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Bath size={ICON_SIZES.xs} className="text-muted-foreground" />
                            <span className="font-semibold text-foreground">{property.baths}</span>
                          </span>
                          {property.sqft && property.sqft > 0 && (
                            <span className="flex items-center gap-1">
                              <Square size={ICON_SIZES.xs} className="text-muted-foreground" />
                              <span className="font-semibold text-foreground">{property.sqft}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted rounded-2xl border-2 border-dashed border-border">
              <Home size={ICON_SIZES['3xl']} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No properties found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your search or browse all areas</p>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 bg-foreground text-white px-6 py-3 rounded-lg font-medium hover:bg-black transition-all"
              >
                <Search size={ICON_SIZES.lg} />
                Browse All Properties
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 md:py-20 bg-muted border-t border-border">
        <div className="container-main max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Finding Rental Properties in Harare
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Harare, Zimbabwe's capital city, offers diverse rental accommodation options across numerous neighborhoods. Whether you're searching for a modern apartment in Borrowdale, a family house in Mount Pleasant, or an affordable room in Avondale, Huts connects you directly with verified landlords across all Harare suburbs.
            </p>

            <h3 className="text-2xl font-bold text-foreground mb-4 mt-10">
              Popular Areas for Rentals in Harare
            </h3>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {[
                { name: 'Borrowdale', desc: 'Upscale neighborhood with modern apartments and security estates' },
                { name: 'Avondale', desc: 'Established suburb close to shopping, dining, and business hubs' },
                { name: 'Mount Pleasant', desc: 'Family-friendly area with schools and recreational facilities' },
                { name: 'Highlands', desc: 'Quiet residential area with spacious properties' },
                { name: 'Gunhill', desc: 'Convenient location near University of Zimbabwe' },
                { name: 'Chisipite', desc: 'Suburban area known for safe, family-oriented communities' },
              ].map((area) => (
                <div key={area.name} className="bg-white border-2 border-border rounded-xl p-5">
                  <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                    <MapPin size={ICON_SIZES.lg} className="text-muted-foreground" />
                    {area.name}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{area.desc}</p>
                  <Link
                    href={`/search?city=Harare&neighborhood=${encodeURIComponent(area.name)}&type=rent`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-foreground mt-3 hover:underline"
                  >
                    View properties <ArrowRight size={ICON_SIZES.sm} />
                  </Link>
                </div>
              ))}
            </div>

            <h3 className="text-2xl font-bold text-foreground mb-4 mt-10">
              Why Rent in Harare with Huts?
            </h3>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {[
                { icon: Shield, title: '100% Verified', desc: 'All properties and landlords checked' },
                { icon: Home, title: 'Direct Contact', desc: 'Connect with property owners instantly' },
                { icon: Check, title: 'No Fees', desc: 'Browse and apply completely free' },
              ].map((item) => (
                <div key={item.title} className="bg-white border border-border rounded-xl p-5 text-center">
                  <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
                    <item.icon size={ICON_SIZES.xl} className="text-foreground" />
                  </div>
                  <h4 className="font-bold text-foreground mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>

            <h3 className="text-2xl font-bold text-foreground mb-4 mt-10">
              Typical Rental Prices in Harare
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Rental prices in Harare vary by neighborhood, property type, and amenities. Here's a general guide:
            </p>
            <ul className="space-y-2 text-muted-foreground mb-6">
              <li className="flex items-start gap-3">
                <Check size={ICON_SIZES.lg} className="text-foreground mt-0.5 flex-shrink-0" />
                <span><strong>1-bedroom apartments:</strong> $200–$600/month</span>
              </li>
              <li className="flex items-start gap-3">
                <Check size={ICON_SIZES.lg} className="text-foreground mt-0.5 flex-shrink-0" />
                <span><strong>2-bedroom apartments:</strong> $400–$1,000/month</span>
              </li>
              <li className="flex items-start gap-3">
                <Check size={ICON_SIZES.lg} className="text-foreground mt-0.5 flex-shrink-0" />
                <span><strong>3-bedroom houses:</strong> $600–$1,500/month</span>
              </li>
              <li className="flex items-start gap-3">
                <Check size={ICON_SIZES.lg} className="text-foreground mt-0.5 flex-shrink-0" />
                <span><strong>Room rentals:</strong> $150–$400/month</span>
              </li>
            </ul>

            <div className="bg-foreground text-white rounded-2xl p-8 mt-10">
              <h3 className="text-2xl font-bold mb-4">Ready to Find Your Home in Harare?</h3>
              <p className="text-white/80 mb-6 leading-relaxed">
                Browse {totalCount || '100+'} verified rental properties across all Harare neighborhoods. Connect with landlords directly, schedule viewings instantly, and move in faster.
              </p>
              <Link
                href="/search?city=Harare&type=rent"
                className="inline-flex items-center gap-2 bg-white text-foreground px-8 py-4 rounded-xl font-bold hover:bg-muted transition-all"
              >
                <Search size={ICON_SIZES.lg} />
                Start Searching Now
                <ArrowRight size={ICON_SIZES.lg} />
              </Link>
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
            '@type': 'CollectionPage',
            name: 'Properties for Rent in Harare, Zimbabwe',
            description: 'Find apartments, houses, and rooms for rent in Harare. 100+ verified rental properties across all Harare neighborhoods.',
            url: 'https://www.huts.co.zw/rentals-in-harare',
            isPartOf: { '@type': 'WebSite', url: 'https://www.huts.co.zw' },
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.huts.co.zw' },
                { '@type': 'ListItem', position: 2, name: 'Rentals in Harare' },
              ],
            },
          }),
        }}
      />
    </div>
  )
}
