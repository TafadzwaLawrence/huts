import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, User, Home, Building2 } from 'lucide-react'
import { ICON_SIZES } from '@/lib/constants'
import HomeSearchBar from '@/components/search/HomeSearchBar'
import FeaturedPropertiesShowcase from '@/components/property/FeaturedPropertiesShowcase'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Huts — Find Properties for Rent & Sale in Zimbabwe',
  description: 'Browse thousands of verified rental properties and homes for sale in Zimbabwe. Apartments, houses & rooms in Harare, Bulawayo, Gweru and more.',
  openGraph: {
    title: 'Huts — Property Rentals & Sales in Zimbabwe',
    description: 'Find apartments, houses, and rooms for rent or sale. Verified listings across Zimbabwe.',
    url: 'https://www.huts.co.zw',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Huts property marketplace' }],
  },
  alternates: {
    canonical: 'https://www.huts.co.zw',
  },
}

export const revalidate = 60

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: { name: string | null; role: string | null; avatar_url: string | null } | null = null
  if (user) {
    const { data, error } = await supabase
      .from('profiles')
      .select('name, role, avatar_url')
      .eq('id', user.id)
      .single()
    
    if (error) {
      console.error('Error fetching profile:', error)
    } else {
      profile = data
    }
  }

  const isLandlord = profile?.role === 'landlord'
  const firstName = profile?.name?.split(' ')[0] ?? 'there'

  // Debug logging
  console.log('User:', user ? 'logged in' : 'not logged in')
  console.log('Profile:', profile ? 'exists' : 'null')
  console.log('Profile role:', profile?.role)
  console.log('isLandlord:', isLandlord)

  // Fetch featured properties
  let transformedProperties: any[] = []
  let fetchError: string | null = null
  
  try {
    const { data: featuredProperties, error: propertiesError } = await supabase
      .from('properties')
      .select(`
        id,
        slug,
        title,
        price,
        sale_price,
        nightly_price,
        rental_period,
        bedrooms,
        bathrooms,
        square_feet,
        address,
        city,
        listing_type,
        status,
        verification_status,
        created_at
      `)
      .eq('verification_status', 'approved')
      .order('created_at', { ascending: false })
      .limit(20)

    if (propertiesError) {
      console.error('Error fetching featured properties:', propertiesError)
      fetchError = propertiesError.message
    } else if (featuredProperties && featuredProperties.length > 0) {
      const propertyIds = featuredProperties.map(p => p.id)
      
      const { data: allImages, error: imagesError } = await supabase
        .from('property_images')
        .select('property_id, url, is_primary')
        .in('property_id', propertyIds)
        .order('is_primary', { ascending: false })
      
      if (imagesError) console.error('Error fetching property images:', imagesError)
      
      const imagesByProperty: Record<string, any[]> = {}
      if (allImages) {
        for (const img of allImages) {
          if (!imagesByProperty[img.property_id]) imagesByProperty[img.property_id] = []
          imagesByProperty[img.property_id].push(img)
        }
      }
      
      transformedProperties = featuredProperties
        .map(property => {
          const propertyImages = imagesByProperty[property.id] || []
          const primaryImage = propertyImages.find(img => img.is_primary)?.url || propertyImages[0]?.url || ''
          return {
            id: property.id,
            slug: property.slug,
            title: property.title,
            price: property.price,
            sale_price: property.sale_price,
            nightly_price: property.nightly_price,
            rental_period: property.rental_period,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            square_feet: property.square_feet,
            address: property.address,
            city: property.city,
            listing_type: property.listing_type,
            primary_image: primaryImage,
          }
        })
        .filter(p => p.primary_image)
    }
  } catch (err) {
    console.error('Exception fetching featured properties:', err)
    fetchError = err instanceof Error ? err.message : 'Unknown error'
  }

  return (
    <div>
      {/* HERO SECTION */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/pexels-rdne-8293778.jpg"
            alt="Hero background"
            fill
            className="object-cover w-full h-full grayscale"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/40 z-[1]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 lg:py-40">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white tracking-tight mb-6">
              Find your
              <span className="relative mx-3">
                <span className="relative z-10">perfect</span>
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-white/40" viewBox="0 0 200 12" preserveAspectRatio="none">
                  <path d="M0,8 Q50,0 100,8 T200,8" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                </svg>
              </span>
              home
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-10">
              The simplest way to discover rental properties or homes for sale.
            </p>
            <HomeSearchBar />
          </div>
        </div>
      </section>

      {/* WELCOME BANNER - Enhanced Zillow style */}
      <section className="py-8 bg-white border-b border-[#E9ECEF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {user && profile ? (
              // Logged-in state
              <div className="bg-gradient-to-r from-[#F8F9FA] to-white rounded-lg border border-[#E9ECEF] p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-[#212529] flex items-center justify-center overflow-hidden shadow-sm">
                      {profile.avatar_url ? (
                        <Image
                          src={profile.avatar_url}
                          alt={profile.name ?? 'User'}
                          width={56}
                          height={56}
                          className="object-cover w-full h-full"
                        />
                      ) : isLandlord ? (
                        <Building2 size={28} className="text-white" />
                      ) : (
                        <Home size={28} className="text-white" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-lg font-bold text-[#212529]">
                      Welcome back, {firstName}! 👋
                    </h2>
                    <p className="text-sm text-[#495057] mt-1">
                      {isLandlord 
                        ? "Your properties are performing well. Check your inquiries and update your listings."
                        : "Continue exploring homes that match your preferences. Your saved searches are ready."
                      }
                    </p>
                    <div className="flex flex-wrap gap-3 mt-4 justify-center sm:justify-start">
                      <Link
                        href={isLandlord ? '/dashboard/my-properties' : '/search'}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[#212529] px-5 py-2 rounded-lg hover:bg-black transition-colors shadow-sm"
                      >
                        {isLandlord ? 'Go to Dashboard' : 'Browse homes'}
                        <ArrowRight size={14} />
                      </Link>
                      {!isLandlord && (
                        <Link
                          href="/saved-searches"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#495057] border border-[#E9ECEF] px-5 py-2 rounded-lg hover:bg-[#F8F9FA] transition-colors"
                        >
                          Saved searches
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Logged-out state
              <div className="bg-gradient-to-r from-[#F8F9FA] to-white rounded-lg border border-[#E9ECEF] p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#212529] to-[#495057] rounded-full flex items-center justify-center shadow-sm">
                      <User size={28} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-lg font-bold text-[#212529]">
                      Get personalized home recommendations
                    </h2>
                    <p className="text-sm text-[#495057] mt-1 max-w-md">
                      Sign in to save your favorite properties, get alerts on price drops, and receive tailored suggestions based on your activity.
                    </p>
                    <div className="flex flex-wrap gap-3 mt-4 justify-center sm:justify-start">
                      <Link
                        href="/auth/signup"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[#212529] px-5 py-2 rounded-lg hover:bg-black transition-colors shadow-sm"
                      >
                        Sign in / Sign up
                        <ArrowRight size={14} />
                      </Link>
                      <Link
                        href="/search"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#495057] border border-[#E9ECEF] px-5 py-2 rounded-lg hover:bg-[#F8F9FA] transition-colors"
                      >
                        Start searching
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      {transformedProperties.length > 0 && (
        <FeaturedPropertiesShowcase properties={transformedProperties} />
      )}

      {/* ACTION CARDS */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Buy a home */}
            <div className="group">
              <div className="relative h-48 rounded-lg overflow-hidden mb-5 bg-[#F8F9FA] border border-[#E9ECEF]">
                <Image
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop"
                  alt="Buy a home"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <h3 className="text-xl font-bold text-[#212529] mb-2">Buy a home</h3>
              <p className="text-sm text-[#495057] leading-relaxed mb-4">
                Browse photos, check pricing and neighborhood details on homes for sale in Zimbabwe. Find a home you love.
              </p>
              <Link
                href="/search?type=sale"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#212529] hover:underline"
              >
                Browse homes
                <ArrowRight size={ICON_SIZES.sm} />
              </Link>
            </div>

            {/* Rent a home */}
            <div className="group">
              <div className="relative h-48 rounded-lg overflow-hidden mb-5 bg-[#F8F9FA] border border-[#E9ECEF]">
                <Image
                  src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop"
                  alt="Rent a home"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <h3 className="text-xl font-bold text-[#212529] mb-2">Rent a home</h3>
              <p className="text-sm text-[#495057] leading-relaxed mb-4">
                We&apos;re creating a seamless online experience — from searching on the largest rental network, to messaging landlords, to moving in.
              </p>
              <Link
                href="/search?type=rent"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#212529] hover:underline"
              >
                Find rentals
                <ArrowRight size={ICON_SIZES.sm} />
              </Link>
            </div>

            {/* List a property */}
            <div className="group">
              <div className="relative h-48 rounded-lg overflow-hidden mb-5 bg-[#F8F9FA] border border-[#E9ECEF]">
                <Image
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop"
                  alt="List a property"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <h3 className="text-xl font-bold text-[#212529] mb-2">List a property</h3>
              <p className="text-sm text-[#495057] leading-relaxed mb-4">
                No matter what type of property you have, we can help you connect with quality renters and buyers. List free in minutes.
              </p>
              <Link
                href="/dashboard/new-property"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#212529] hover:underline"
              >
                See your options
                <ArrowRight size={ICON_SIZES.sm} />
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
            '@type': 'RealEstateAgent',
            name: 'Huts',
            url: 'https://www.huts.co.zw',
            logo: 'https://www.huts.co.zw/logo.png',
            description: "Zimbabwe's property marketplace connecting renters and buyers with landlords and sellers",
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
            description: 'Find apartments, houses, and rooms for rent or sale in Zimbabwe',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://www.huts.co.zw/search?q={search_term_string}',
              },
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
    </div>
  )
}