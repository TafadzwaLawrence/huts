import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, MapPin, Home, ArrowRight, Building2, Key } from 'lucide-react'
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
      <section className="relative bg-white overflow-hidden">
        <div className="container-main relative py-20 md:py-32 lg:py-40">
          <div className="max-w-4xl mx-auto text-center">
            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-[#212529] tracking-tight mb-4">
              Rentals. Homes.
            </h1>
            <p className="text-lg md:text-xl text-[#495057] mb-10">
              Your next home is one search away.
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

      {/* ACTION CARDS */}
      <section className="py-12 md:py-16 bg-[#F8F9FA]">
        <div className="container-main">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Rent a home */}
            <Link href="/search?type=rent" className="group">
              <div className="bg-white border-2 border-[#E9ECEF] rounded-2xl p-8 hover:border-[#212529] hover:shadow-lg transition-all duration-300 h-full">
                <div className="w-12 h-12 bg-[#F8F9FA] rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#212529] transition-colors">
                  <Home size={ICON_SIZES.xl} className="text-[#495057] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-[#212529] mb-2">Rent a home</h3>
                <p className="text-sm text-[#495057] mb-4">Browse verified rental listings across Zimbabwe.</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#212529]">
                  Find rentals <ArrowRight size={ICON_SIZES.sm} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>

            {/* Buy a home */}
            <Link href="/search?type=sale" className="group">
              <div className="bg-white border-2 border-[#E9ECEF] rounded-2xl p-8 hover:border-[#212529] hover:shadow-lg transition-all duration-300 h-full">
                <div className="w-12 h-12 bg-[#F8F9FA] rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#212529] transition-colors">
                  <Building2 size={ICON_SIZES.xl} className="text-[#495057] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-[#212529] mb-2">Buy a home</h3>
                <p className="text-sm text-[#495057] mb-4">Find homes for sale in your preferred neighborhood.</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#212529]">
                  Browse homes <ArrowRight size={ICON_SIZES.sm} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>

            {/* List a property */}
            <Link href="/dashboard/new-property" className="group">
              <div className="bg-white border-2 border-[#E9ECEF] rounded-2xl p-8 hover:border-[#212529] hover:shadow-lg transition-all duration-300 h-full">
                <div className="w-12 h-12 bg-[#F8F9FA] rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#212529] transition-colors">
                  <Key size={ICON_SIZES.xl} className="text-[#495057] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-[#212529] mb-2">List a property</h3>
                <p className="text-sm text-[#495057] mb-4">Post your rental or home for sale — free and easy.</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#212529]">
                  Get started <ArrowRight size={ICON_SIZES.sm} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
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
