import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, User } from 'lucide-react'
import { ICON_SIZES } from '@/lib/constants'
import HomeSearchBar from '@/components/search/HomeSearchBar'

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
            src="/pexels-rdne-8293778.jpg"
            alt="Hero background"
            fill
            className="object-cover w-full h-full grayscale"
            priority
            sizes="100vw"
          />
        </div>
        <div className="container-main relative z-10 py-20 md:py-32 lg:py-40">
          <div className="max-w-4xl mx-auto text-center">
            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-black tracking-tight mb-6">
              Find your
              <span className="relative mx-3">
                <span className="relative z-10">perfect</span>
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-black/30" viewBox="0 0 200 12" preserveAspectRatio="none">
                  <path d="M0,8 Q50,0 100,8 T200,8" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                </svg>
              </span>
              home
            </h1>
            <p className="text-lg md:text-xl text-[#495057] mb-10">
              The simplest way to discover rental properties or homes for sale.
            </p>
            {/* Search Bar */}
            <HomeSearchBar />
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

      {/* INTERNAL LINKS SECTION - SEO Discovery */}
      <section className="py-12 bg-white border-t border-[#E9ECEF]">
        <div className="container-main">
          <h2 className="text-2xl font-bold text-[#212529] mb-8 text-center">
            Explore Properties by Location & Type
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {/* Rentals by City */}
            <div>
              <h3 className="font-bold text-[#212529] mb-4 text-sm uppercase tracking-wide">
                Rentals by City
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/rentals-in-harare" className="text-[#495057] hover:text-[#212529] hover:underline">
                    Harare Rentals
                  </Link>
                </li>
                <li>
                  <Link href="/search?city=Bulawayo&type=rent" className="text-[#495057] hover:text-[#212529] hover:underline">
                    Bulawayo Rentals
                  </Link>
                </li>
                <li>
                  <Link href="/search?city=Gweru&type=rent" className="text-[#495057] hover:text-[#212529] hover:underline">
                    Gweru Rentals
                  </Link>
                </li>
                <li>
                  <Link href="/search?city=Mutare&type=rent" className="text-[#495057] hover:text-[#212529] hover:underline">
                    Mutare Rentals
                  </Link>
                </li>
                <li>
                  <Link href="/properties-for-rent-zimbabwe" className="text-[#495057] hover:text-[#212529] hover:underline">
                    All Zimbabwe Rentals
                  </Link>
                </li>
              </ul>
            </div>

            {/* Property Types */}
            <div>
              <h3 className="font-bold text-[#212529] mb-4 text-sm uppercase tracking-wide">
                Property Types
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/search?propertyType=apartment" className="text-[#495057] hover:text-[#212529] hover:underline">
                    Apartments
                  </Link>
                </li>
                <li>
                  <Link href="/search?propertyType=house" className="text-[#495057] hover:text-[#212529] hover:underline">
                    Houses
                  </Link>
                </li>
                <li>
                  <Link href="/search?propertyType=room" className="text-[#495057] hover:text-[#212529] hover:underline">
                    Rooms
                  </Link>
                </li>
                <li>
                  <Link href="/search?propertyType=cottage" className="text-[#495057] hover:text-[#212529] hover:underline">
                    Cottages
                  </Link>
                </li>
                <li>
                  <Link href="/student-housing" className="text-[#495057] hover:text-[#212529] hover:underline">
                    Student Housing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Buy or Rent */}
            <div>
              <h3 className="font-bold text-[#212529] mb-4 text-sm uppercase tracking-wide">
                Buy or Rent
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/search?type=rent" className="text-[#495057] hover:text-[#212529] hover:underline">
                    For Rent
                  </Link>
                </li>
                <li>
                  <Link href="/search?type=sale" className="text-[#495057] hover:text-[#212529] hover:underline">
                    For Sale
                  </Link>
                </li>
                <li>
                  <Link href="/rent-vs-buy" className="text-[#495057] hover:text-[#212529] hover:underline">
                    Rent vs Buy Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/home-value" className="text-[#495057] hover:text-[#212529] hover:underline">
                    Get Home Value
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-bold text-[#212529] mb-4 text-sm uppercase tracking-wide">
                Resources
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/areas" className="text-[#495057] hover:text-[#212529] hover:underline">
                    Neighborhood Guides
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-[#495057] hover:text-[#212529] hover:underline">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-[#495057] hover:text-[#212529] hover:underline">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-[#495057] hover:text-[#212529] hover:underline">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION - SEO Optimized for "People Also Ask" */}
      <section className="py-16 bg-[#F8F9FA]">
        <div className="container-main max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-[#212529] mb-10 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-8">
            <div className="bg-white rounded-lg p-6 border border-[#E9ECEF]">
              <h3 className="text-lg font-bold text-[#212529] mb-3">
                How much does it cost to rent in Zimbabwe?
              </h3>
              <p className="text-[#495057] leading-relaxed">
                Rental prices vary by location and property type. In Harare, expect $300-$1,200/month for apartments and $500-$2,000/month for houses. 
                Bulawayo and Gweru are typically 20-30% cheaper. Rooms start from $150/month. Student housing near universities ranges from $200-$500/month.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-[#E9ECEF]">
              <h3 className="text-lg font-bold text-[#212529] mb-3">
                Are properties on Huts verified?
              </h3>
              <p className="text-[#495057] leading-relaxed">
                Yes, all properties undergo manual verification before going live. Our team verifies ownership documentation, photos authenticity, 
                and contact details to prevent scams. Look for the &quot;Verified&quot; badge on listings. We also encourage reviews from renters to maintain quality.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-[#E9ECEF]">
              <h3 className="text-lg font-bold text-[#212529] mb-3">
                Can I list my property for free?
              </h3>
              <p className="text-[#495057] leading-relaxed">
                Absolutely! Listing properties on Huts is completely free for landlords and property owners. Create an account, 
                add your property details and photos, and publish in minutes. There are no hidden fees or commissions. 
                You communicate directly with potential renters or buyers through our secure messaging system.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-[#E9ECEF]">
              <h3 className="text-lg font-bold text-[#212529] mb-3">
                What areas does Huts cover in Zimbabwe?
              </h3>
              <p className="text-[#495057] leading-relaxed">
                We cover all major cities and towns across Zimbabwe including Harare (Borrowdale, Avondale, Mount Pleasant), 
                Bulawayo, Gweru, Mutare, Victoria Falls, Masvingo, and Kwekwe. New areas and neighborhoods are added weekly as more landlords join our platform.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-[#E9ECEF]">
              <h3 className="text-lg font-bold text-[#212529] mb-3">
                How do I contact a landlord about a property?
              </h3>
              <p className="text-[#495057] leading-relaxed">
                Simply create a free account, then click &quot;Contact Landlord&quot; on any property listing. You can send a message directly through our platform. 
                Landlords typically respond within 24 hours. For urgent inquiries, verified landlords also display phone numbers you can call directly.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-[#E9ECEF]">
              <h3 className="text-lg font-bold text-[#212529] mb-3">
                Can I search for properties for sale, not just rentals?
              </h3>
              <p className="text-[#495057] leading-relaxed">
                Yes! Huts supports both rental and sale listings. Use the search filters to select &quot;For Sale&quot; to browse homes, 
                apartments, and land for purchase. Each sale listing includes purchase price, property details, and financing calculators to help you plan your investment.
              </p>
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'How much does it cost to rent in Zimbabwe?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Rental prices vary by location and property type. In Harare, expect $300-$1,200/month for apartments and $500-$2,000/month for houses. Bulawayo and Gweru are typically 20-30% cheaper. Rooms start from $150/month. Student housing near universities ranges from $200-$500/month.',
                },
              },
              {
                '@type': 'Question',
                name: 'Are properties on Huts verified?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes, all properties undergo manual verification before going live. Our team verifies ownership documentation, photos authenticity, and contact details to prevent scams. Look for the "Verified" badge on listings. We also encourage reviews from renters to maintain quality.',
                },
              },
              {
                '@type': 'Question',
                name: 'Can I list my property for free?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Absolutely! Listing properties on Huts is completely free for landlords and property owners. Create an account, add your property details and photos, and publish in minutes. There are no hidden fees or commissions. You communicate directly with potential renters or buyers through our secure messaging system.',
                },
              },
              {
                '@type': 'Question',
                name: 'What areas does Huts cover in Zimbabwe?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'We cover all major cities and towns across Zimbabwe including Harare (Borrowdale, Avondale, Mount Pleasant), Bulawayo, Gweru, Mutare, Victoria Falls, Masvingo, and Kwekwe. New areas and neighborhoods are added weekly as more landlords join our platform.',
                },
              },
              {
                '@type': 'Question',
                name: 'How do I contact a landlord about a property?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Simply create a free account, then click "Contact Landlord" on any property listing. You can send a message directly through our platform. Landlords typically respond within 24 hours. For urgent inquiries, verified landlords also display phone numbers you can call directly.',
                },
              },
              {
                '@type': 'Question',
                name: 'Can I search for properties for sale, not just rentals?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes! Huts supports both rental and sale listings. Use the search filters to select "For Sale" to browse homes, apartments, and land for purchase. Each sale listing includes purchase price, property details, and financing calculators to help you plan your investment.',
                },
              },
            ],
          }),
        }}
      />
    </div>
  )
}
