import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient, createStaticClient } from '@/lib/supabase/server'
import {
  MapPin,
  Home,
  DollarSign,
  TrendingUp,
  Search,
  Bed,
  Bath,
  Square,
} from 'lucide-react'
import SaveButton from '@/components/property/SaveButton'

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createStaticClient()
  
  const { data: area } = await supabase
    .from('area_guides')
    .select('name, city, meta_title, meta_description')
    .eq('slug', params.slug)
    .single()

  if (!area) {
    return {
      title: 'Area Not Found',
    }
  }

  const title = area.meta_title || `${area.name} — Rentals & Homes | Huts`
  const description = area.meta_description || `Find rental properties and homes for sale in ${area.name}, ${area.city || 'Zimbabwe'}. Browse verified listings, average prices, and neighborhood insights.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.huts.co.zw/areas/${params.slug}`,
      type: 'website',
    },
    alternates: {
      canonical: `https://www.huts.co.zw/areas/${params.slug}`,
    },
  }
}

export default async function AreaGuidePage({ params }: PageProps) {
  const supabase = await createClient()

  // Fetch area guide
  const { data: area, error: areaError } = await supabase
    .from('area_guides')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (areaError || !area) {
    notFound()
  }

  // Fetch properties in this area
  let propertiesQuery = supabase
    .from('properties')
    .select(`
      id,
      title,
      slug,
      price,
      beds,
      baths,
      sqft,
      city,
      neighborhood,
      property_images(url, is_primary)
    `)
    .eq('status', 'active')
    .eq('verification_status', 'approved')
    .eq('city', area.city)

  if (area.neighborhood) {
    propertiesQuery = propertiesQuery.eq('neighborhood', area.neighborhood)
  }

  const { data: properties } = await propertiesQuery
    .order('created_at', { ascending: false })
    .limit(12)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-[#F8F9FA] border-b border-[#E9ECEF] py-16 md:py-24">
        <div className="container-main max-w-6xl">
          <div className="max-w-3xl">
            <div className="flex items-center text-sm text-[#495057] mb-4">
              <Link href="/" className="hover:underline">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/areas" className="hover:underline">Areas</Link>
              <span className="mx-2">/</span>
              <span className="text-[#212529]">{area.name}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-[#212529] mb-6 tracking-tight">
              {area.name}
            </h1>

            {area.description && (
              <p className="text-lg text-[#495057] mb-8 leading-relaxed">
                {area.description}
              </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white border-2 border-[#E9ECEF] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Home size={20} className="text-[#212529]" />
                  <span className="text-2xl font-bold text-[#212529]">
                    {area.property_count}
                  </span>
                </div>
                <p className="text-xs text-[#ADB5BD]">Available Properties</p>
              </div>

              {area.avg_rent && (
                <div className="bg-white border-2 border-[#E9ECEF] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={20} className="text-[#212529]" />
                    <span className="text-2xl font-bold text-[#212529]">
                      ${Math.round(area.avg_rent / 100).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#ADB5BD]">Average Rent/Month</p>
                </div>
              )}

              <div className="bg-white border-2 border-[#E9ECEF] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={20} className="text-[#212529]" />
                  <span className="text-2xl font-bold text-[#212529]">
                    {area.neighborhood || area.city}
                  </span>
                </div>
                <p className="text-xs text-[#ADB5BD]">Location</p>
              </div>
            </div>

            {/* CTA */}
            <Link
              href={`/search?city=${encodeURIComponent(area.city)}${area.neighborhood ? `&neighborhood=${encodeURIComponent(area.neighborhood)}` : ''}`}
              className="inline-flex items-center gap-2 bg-[#212529] text-white px-8 py-4 rounded-lg font-semibold hover:bg-black hover:shadow-xl transition-all"
            >
              <Search size={20} />
              Search Properties in {area.neighborhood || area.city}
            </Link>
          </div>
        </div>
      </section>

      {/* Content Section */}
      {area.content && (
        <section className="py-16 md:py-20 border-b border-[#E9ECEF]">
          <div className="container-main max-w-4xl">
            <div className="prose prose-lg max-w-none">
              <div
                className="text-[#495057] leading-relaxed"
                style={{ whiteSpace: 'pre-line' }}
              >
                {area.content}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Properties Section */}
      {properties && properties.length > 0 && (
        <section className="py-16 md:py-20 bg-[#F8F9FA]">
          <div className="container-main">
            <h2 className="text-3xl font-bold text-[#212529] mb-8">
              Available Properties
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property: any) => {
                const primaryImage = property.property_images?.find((img: any) => img.is_primary) || property.property_images?.[0]
                const imageUrl = primaryImage?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop'

                return (
                  <Link
                    key={property.id}
                    href={`/property/${property.slug || property.id}`}
                    className="group block bg-white border-2 border-[#E9ECEF] rounded-lg overflow-hidden hover:border-[#212529] hover:shadow-lg transition-all duration-300"
                  >
                    <div className="relative h-48 bg-[#E9ECEF]">
                      <img
                        src={imageUrl}
                        alt={property.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                      <SaveButton className="absolute top-3 right-3 p-2 bg-white/95 rounded-full hover:scale-110 transition-all shadow-md" />
                    </div>

                    <div className="p-4">
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-xl font-bold text-[#212529]">
                          ${(property.price / 100).toLocaleString()}
                        </span>
                        <span className="text-xs text-[#ADB5BD]">/mo</span>
                      </div>

                      <h3 className="font-semibold text-[#212529] text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
                        {property.title}
                      </h3>

                      <div className="flex items-center text-xs text-[#495057] mb-3">
                        <MapPin size={12} className="mr-1" />
                        {property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#495057] pt-3 border-t border-[#F8F9FA]">
                        <span className="flex items-center gap-1">
                          <Bed size={14} />
                          {property.beds}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bath size={14} />
                          {property.baths}
                        </span>
                        {property.sqft && (
                          <span className="flex items-center gap-1">
                            <Square size={14} />
                            {property.sqft}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {properties.length >= 12 && (
              <div className="text-center mt-12">
                <Link
                  href={`/search?city=${encodeURIComponent(area.city)}${area.neighborhood ? `&neighborhood=${encodeURIComponent(area.neighborhood)}` : ''}`}
                  className="inline-flex items-center gap-2 bg-[#212529] text-white px-8 py-4 rounded-lg font-semibold hover:bg-black hover:shadow-xl transition-all"
                >
                  View All Properties
                  <TrendingUp size={18} />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-[#212529] text-white">
        <div className="container-main text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-4">
            Looking for something else?
          </h2>
          <p className="text-lg text-[#ADB5BD] mb-8">
            Browse properties in other neighborhoods or search across the entire city
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-white text-[#212529] px-8 py-4 rounded-lg font-semibold hover:shadow-xl transition-all"
            >
              <Search size={20} />
              Search All Properties
            </Link>
            <Link
              href="/areas"
              className="inline-flex items-center gap-2 border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#212529] transition-all"
            >
              <MapPin size={20} />
              Browse Areas
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
