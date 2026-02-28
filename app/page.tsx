import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Search, MapPin, ArrowRight, User } from 'lucide-react'
import { ICON_SIZES } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Huts — Find Properties for Rent & Sale in Zimbabwe',
  description: 'Browse thousands of verified rental properties and homes for sale across Zimbabwe. Apartments, houses, rooms in Harare, Bulawayo, Gweru, and more. Your home is one search away.',
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

// ISR - Revalidate every 60 seconds for fresh data while caching for speed
export const revalidate = 60

export default async function HomePage() {
  return (
    <div>
      {/* HERO SECTION */}
      <section className="relative overflow-hidden">
        {/* Background Image (Gustavo Fring) */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/pexels-gustavo-fring-7489107.jpg"
            alt="Hero background"
            fill
            className="object-cover w-full h-full contrast-105 opacity-[0.25]"
            priority
            sizes="100vw"
          />
          {/* Dark overlay for B&W aesthetic */}
          <div className="absolute inset-0 bg-black/15 mix-blend-multiply pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/80" />
        </div>
        <div className="container-main relative z-10 py-20 md:py-32 lg:py-40">
          <div className="max-w-4xl mx-auto text-center">
            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-black tracking-tight mb-6">
              Find your
              <span className="relative mx-3">
                <span className="relative z-10">perfect</span>
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#212529]/30" viewBox="0 0 200 12" preserveAspectRatio="none">
                  <path d="M0,8 Q50,0 100,8 T200,8" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                </svg>
              </span>
              home
            </h1>
            <p className="text-lg md:text-xl text-[#495057] mb-10">
              The simplest way to discover rental properties or homes for sale.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative bg-white rounded-2xl shadow-xl border-2 border-[#E9ECEF] p-2 hover:border-[#495057] transition-colors duration-300">
                <div className="flex flex-col md:flex-row gap-2">
                  {/* Location Input */}
                  <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-[#F8F9FA] rounded-xl">
                    <MapPin size={ICON_SIZES.lg} className="text-[#ADB5BD] flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Search by city, neighborhood, or address"
                      className="w-full bg-transparent outline-none text-[#212529] placeholder:text-[#ADB5BD] text-sm font-medium"
                    />
                  </div>

                  {/* Search Button */}
                  <Link
                    href="/search"
                    className="btn btn-primary flex items-center justify-center gap-2 px-8 py-4 min-h-[52px]"
                  >
                    <Search size={ICON_SIZES.lg} />
                    <span>Search</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GET HOME RECOMMENDATIONS */}
      <section className="py-8 bg-white border-t border-[#E9ECEF]">
        <div className="container-main">
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#F8F9FA] rounded-xl px-6 py-5 border border-[#E9ECEF]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#212529] rounded-full flex items-center justify-center flex-shrink-0">
                <User size={ICON_SIZES.lg} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#212529]">Get home recommendations</h2>
                <p className="text-xs text-[#495057]">Sign in for a more personalized experience.</p>
              </div>
            </div>
            <Link
              href="/auth/signup"
              className="text-sm font-semibold text-[#212529] border-2 border-[#212529] px-5 py-2 rounded-lg hover:bg-[#212529] hover:text-white transition-colors whitespace-nowrap"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ACTION CARDS — Zillow style */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container-main">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Buy a home */}
            <div className="group">
              <div className="relative h-48 rounded-xl overflow-hidden mb-5 bg-[#E9ECEF]">
                <Image
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop"
                  alt="Buy a home"
                  fill
                  className="object-cover group-hover:scale-105 transition-all duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <h3 className="text-xl font-bold text-[#212529] mb-2">Buy a home</h3>
              <p className="text-sm text-[#495057] leading-relaxed mb-4">
                Browse photos, check pricing and neighborhood details on homes for sale in Zimbabwe. Find a home you love.
              </p>
              <Link
                href="/search?type=sale"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#212529] hover:underline"
              >
                Browse homes
                <ArrowRight size={ICON_SIZES.sm} />
              </Link>
            </div>

            {/* Rent a home */}
            <div className="group">
              <div className="relative h-48 rounded-xl overflow-hidden mb-5 bg-[#E9ECEF]">
                <Image
                  src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop"
                  alt="Rent a home"
                  fill
                  className="object-cover group-hover:scale-105 transition-all duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <h3 className="text-xl font-bold text-[#212529] mb-2">Rent a home</h3>
              <p className="text-sm text-[#495057] leading-relaxed mb-4">
                We&apos;re creating a seamless online experience — from searching on the largest rental network, to messaging landlords, to moving in.
              </p>
              <Link
                href="/search?type=rent"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#212529] hover:underline"
              >
                Find rentals
                <ArrowRight size={ICON_SIZES.sm} />
              </Link>
            </div>

            {/* Sell a home */}
            <div className="group">
              <div className="relative h-48 rounded-xl overflow-hidden mb-5 bg-[#E9ECEF]">
                <Image
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop"
                  alt="List a property"
                  fill
                  className="object-cover group-hover:scale-105 transition-all duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <h3 className="text-xl font-bold text-[#212529] mb-2">List a property</h3>
              <p className="text-sm text-[#495057] leading-relaxed mb-4">
                No matter what type of property you have, we can help you connect with quality renters and buyers. List free in minutes.
              </p>
              <Link
                href="/dashboard/new-property"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#212529] hover:underline"
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
