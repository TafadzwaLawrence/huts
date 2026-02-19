import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  GraduationCap, Home, Users, Zap, ArrowRight, MapPin,
  Sofa, Wifi, CheckCircle, Shield, Search, Bed, Bath, Square,
  Building2, ChevronDown, BookOpen, Bus, Coffee
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Student Housing Near Universities in Zimbabwe | Huts',
  description: 'Find affordable student accommodation near UZ, NUST, MSU, and other Zimbabwean universities. Furnished rooms, shared housing, and utilities-included rentals for students.',
  keywords: ['student housing Zimbabwe', 'UZ accommodation', 'NUST student housing', 'MSU rooms', 'student rentals Harare', 'student accommodation Bulawayo'],
  openGraph: {
    title: 'Student Housing Near Universities in Zimbabwe | Huts',
    description: 'Affordable furnished rooms and shared accommodation near Zimbabwean universities. Browse verified student-friendly listings.',
    type: 'website',
    url: 'https://www.huts.co.zw/student-housing',
  },
  alternates: {
    canonical: 'https://www.huts.co.zw/student-housing',
  },
}

export const revalidate = 120

// Zimbabwe universities with their cities for search links
const UNIVERSITIES = [
  { name: 'University of Zimbabwe', short: 'UZ', city: 'Harare', area: 'Mount Pleasant', icon: GraduationCap },
  { name: 'NUST', short: 'NUST', city: 'Bulawayo', area: 'Bulawayo', icon: Building2 },
  { name: 'Midlands State University', short: 'MSU', city: 'Gweru', area: 'Gweru', icon: BookOpen },
  { name: 'Chinhoyi University', short: 'CUT', city: 'Chinhoyi', area: 'Chinhoyi', icon: GraduationCap },
  { name: 'Bindura University', short: 'BUSE', city: 'Bindura', area: 'Bindura', icon: BookOpen },
  { name: 'Great Zimbabwe University', short: 'GZU', city: 'Masvingo', area: 'Masvingo', icon: Building2 },
]

async function getStudentProperties() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('properties')
    .select(`
      id, title, slug, listing_type, price, sale_price,
      beds, baths, sqft, city, neighborhood, property_type,
      furnished, shared_rooms, utilities_included,
      property_images(url, is_primary, alt_text),
      profiles(name, avatar_url, verified)
    `)
    .eq('property_type', 'student')
    .eq('status', 'active')
    .eq('verification_status', 'approved')
    .order('created_at', { ascending: false })
    .limit(9)

  if (error) {
    console.error('Error fetching student properties:', error)
    return []
  }
  return data || []
}

async function getAffordableRentals() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('properties')
    .select(`
      id, title, slug, listing_type, price,
      beds, baths, sqft, city, neighborhood, property_type,
      furnished, shared_rooms, utilities_included,
      property_images(url, is_primary, alt_text),
      profiles(name, avatar_url, verified)
    `)
    .eq('status', 'active')
    .eq('verification_status', 'approved')
    .eq('listing_type', 'rent')
    .in('property_type', ['room', 'studio', 'apartment', 'student'])
    .order('price', { ascending: true })
    .limit(6)

  if (error) {
    console.error('Error fetching affordable rentals:', error)
    return []
  }
  return data || []
}

export default async function StudentHousingPage() {
  const [studentProperties, affordableRentals] = await Promise.all([
    getStudentProperties(),
    getAffordableRentals(),
  ])

  const displayProperties = studentProperties.length > 0 ? studentProperties : affordableRentals
  const isShowingFallback = studentProperties.length === 0 && affordableRentals.length > 0

  return (
    <div className="min-h-screen bg-white">
      {/* HERO */}
      <section className="relative bg-[#212529] text-white overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        {/* Gradient orbs */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[100px]" />

        <div className="container-main relative py-20 md:py-28 lg:py-36">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/[0.08] backdrop-blur-sm border border-white/[0.1] rounded-full px-4 py-2 mb-8">
              <GraduationCap size={16} className="text-white/70" />
              <span className="text-xs font-bold uppercase tracking-widest text-white/80">Student Accommodation</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] mb-6">
              Student housing
              <br />
              <span className="text-white/50">near your campus</span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 mb-10 leading-relaxed max-w-xl">
              Furnished rooms, shared accommodation, and affordable rentals
              near universities across Zimbabwe. Move-in ready, student-friendly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/search?type=rent&studentHousingOnly=true"
                className="group inline-flex items-center justify-center gap-2.5 bg-white text-[#212529] px-8 py-4 rounded-xl font-bold text-base hover:-translate-y-0.5 hover:shadow-2xl transition-all"
              >
                <Search size={18} />
                Browse Student Housing
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#universities"
                className="inline-flex items-center justify-center gap-2 bg-white/[0.08] border border-white/[0.12] text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/[0.12] transition-all"
              >
                Find by University
                <ChevronDown size={16} />
              </a>
            </div>

            {/* Quick stats */}
            <div className="mt-14 pt-8 border-t border-white/[0.08] grid grid-cols-3 gap-8 max-w-md">
              {[
                { value: '6+', label: 'Universities' },
                { value: '100%', label: 'Verified' },
                { value: '$0', label: 'Agent Fees' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-white/40 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* KEY FEATURES */}
      <section className="py-16 md:py-24 bg-[#F8F9FA] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #212529 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
        <div className="container-main relative">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-white border border-[#E9ECEF] rounded-full px-4 py-1.5 mb-4">
              <Sofa size={13} className="text-[#495057]" />
              <span className="text-[10px] font-bold text-[#495057] uppercase tracking-widest">Student Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#212529] tracking-tight mb-4">
              Made for student life
            </h2>
            <p className="text-[#495057] text-lg max-w-lg mx-auto">
              Every listing is tailored for university students in Zimbabwe
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {[
              {
                icon: Sofa,
                title: 'Furnished & Ready',
                description: 'Move in with just your bags. Beds, desks, wardrobes, and study spaces included — no extra costs.',
              },
              {
                icon: Users,
                title: 'Shared Room Options',
                description: 'Split costs with fellow students. Shared rooms and common areas that build community and save money.',
              },
              {
                icon: Zap,
                title: 'Utilities Included',
                description: 'Water, electricity, and Wi-Fi bundled into one monthly payment. No surprise bills at end of month.',
              },
            ].map(({ icon: Icon, title, description }, idx) => (
              <div key={idx} className="group bg-white p-8 rounded-2xl border-2 border-[#E9ECEF] hover:border-[#212529] hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-[#F8F9FA] group-hover:bg-[#212529] rounded-xl flex items-center justify-center mb-6 transition-colors duration-300">
                  <Icon size={24} className="text-[#495057] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-[#212529] mb-3">{title}</h3>
                <p className="text-[#495057] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FIND BY UNIVERSITY */}
      <section id="universities" className="py-16 md:py-24 bg-white scroll-mt-20">
        <div className="container-main">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-[#212529] rounded-full px-5 py-2.5 mb-6">
              <MapPin size={14} className="text-white" />
              <span className="text-xs font-semibold tracking-widest uppercase text-white">By Campus</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#212529] tracking-tight mb-4">
              Find housing near your university
            </h2>
            <p className="text-[#495057] text-lg max-w-lg mx-auto">
              Browse student-friendly rentals close to Zimbabwe&apos;s major campuses
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {UNIVERSITIES.map(({ name, short, city, area, icon: Icon }) => (
              <Link
                key={short}
                href={`/search?type=rent&city=${encodeURIComponent(city)}`}
                className="group relative bg-white border-2 border-[#E9ECEF] rounded-2xl p-6 hover:border-[#212529] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#F8F9FA] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#F8F9FA] group-hover:bg-[#212529] rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                    <Icon size={22} className="text-[#495057] group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#212529] text-base mb-1 line-clamp-1">{name}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-[#495057]">
                      <MapPin size={13} className="text-[#ADB5BD] flex-shrink-0" />
                      <span>{area}, {city}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-[#E9ECEF] flex items-center justify-between opacity-70 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-semibold text-[#495057]">Browse rentals nearby</span>
                      <ArrowRight size={14} className="text-[#212529] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="py-16 md:py-24 bg-[#F8F9FA] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#212529]/5 rounded-full blur-3xl" />
        <div className="container-main relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-10 md:mb-14">
            <div>
              <div className="inline-flex items-center gap-2 bg-white border border-[#E9ECEF] rounded-full px-4 py-1.5 mb-4">
                <GraduationCap size={13} className="text-[#495057]" />
                <span className="text-[10px] font-bold text-[#495057] uppercase tracking-widest">
                  {isShowingFallback ? 'Affordable Rentals' : 'Student Housing'}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#212529] tracking-tight mb-2">
                {isShowingFallback ? 'Budget-Friendly Rentals' : 'Featured Student Housing'}
              </h2>
              <p className="text-[#495057]">
                {isShowingFallback
                  ? 'Affordable rooms and apartments perfect for students'
                  : `${studentProperties.length} student ${studentProperties.length === 1 ? 'property' : 'properties'} available`}
              </p>
            </div>
            <Link
              href="/search?type=rent&studentHousingOnly=true"
              className="group inline-flex items-center gap-2.5 text-sm font-semibold text-[#212529] border-2 border-[#E9ECEF] px-5 py-2.5 rounded-full hover:border-[#212529] hover:bg-[#212529] hover:text-white transition-all duration-200"
            >
              <span>View all</span>
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {displayProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {displayProperties.map((property: any) => {
                const primaryImage = property.property_images?.find((img: any) => img.is_primary) || property.property_images?.[0]
                const imageUrl = primaryImage?.url

                return (
                  <Link
                    key={property.id}
                    href={`/property/${property.slug || property.id}`}
                    className="group"
                  >
                    <article className="relative border-2 border-[#E9ECEF] rounded-2xl overflow-hidden bg-white hover:border-[#212529] hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      {/* Image */}
                      <div className="relative h-52 overflow-hidden bg-[#F8F9FA]">
                        {imageUrl ? (
                          <>
                            <Image
                              src={imageUrl}
                              alt={primaryImage?.alt_text || property.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Home className="text-[#ADB5BD]" size={48} />
                          </div>
                        )}

                        {/* Price */}
                        {property.price && (
                          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg">
                            <span className="text-base font-bold text-[#212529]">{formatPrice(property.price)}</span>
                            <span className="text-xs text-[#495057]">/mo</span>
                          </div>
                        )}

                        {/* Student badges */}
                        {property.property_type === 'student' && (
                          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                            {property.furnished && (
                              <div className="bg-[#212529]/90 backdrop-blur-sm text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                                <Sofa size={10} /> Furnished
                              </div>
                            )}
                            {property.shared_rooms && (
                              <div className="bg-[#212529]/90 backdrop-blur-sm text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                                <Users size={10} /> Shared
                              </div>
                            )}
                            {property.utilities_included && (
                              <div className="bg-[#212529]/90 backdrop-blur-sm text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                                <Zap size={10} /> Utilities
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="font-semibold text-[#212529] text-base mb-2 line-clamp-1 group-hover:underline underline-offset-2 decoration-[#212529]/30">
                          {property.title}
                        </h3>
                        <div className="flex items-center text-[#495057] text-sm mb-4">
                          <MapPin size={14} className="mr-1.5 flex-shrink-0 text-[#ADB5BD]" />
                          <span className="truncate">{property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[#495057] pt-4 border-t border-[#F1F3F5]">
                          <span className="flex items-center gap-1.5">
                            <Bed size={15} className="text-[#ADB5BD]" />
                            <span className="font-semibold text-[#212529]">{property.beds}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Bath size={15} className="text-[#ADB5BD]" />
                            <span className="font-semibold text-[#212529]">{property.baths}</span>
                          </span>
                          {property.sqft && (
                            <span className="flex items-center gap-1.5">
                              <Square size={15} className="text-[#ADB5BD]" />
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
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white border-2 border-dashed border-[#E9ECEF] rounded-2xl p-12 md:p-16 text-center">
                <div className="flex justify-center items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-[#F8F9FA] rounded-2xl flex items-center justify-center border border-[#E9ECEF] rotate-[-6deg]">
                    <GraduationCap size={28} className="text-[#ADB5BD]" />
                  </div>
                  <div className="w-20 h-20 bg-[#212529] rounded-2xl flex items-center justify-center shadow-xl">
                    <Home size={36} className="text-white" />
                  </div>
                  <div className="w-16 h-16 bg-[#F8F9FA] rounded-2xl flex items-center justify-center border border-[#E9ECEF] rotate-[6deg]">
                    <MapPin size={28} className="text-[#ADB5BD]" />
                  </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-[#212529] mb-3">No student housing listed yet</h3>
                <p className="text-[#495057] text-lg mb-8 max-w-md mx-auto">
                  Be the first to list student accommodation and help thousands of students find a home near campus.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/dashboard/new-property"
                    className="group inline-flex items-center justify-center gap-2 bg-[#212529] text-white px-8 py-4 rounded-xl font-semibold hover:bg-black hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    List Student Housing
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/search?type=rent"
                    className="inline-flex items-center justify-center gap-2 bg-white text-[#212529] border-2 border-[#E9ECEF] px-8 py-4 rounded-xl font-semibold hover:border-[#212529] hover:shadow-md transition-all"
                  >
                    <Search size={18} />
                    Browse All Rentals
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* WHAT STUDENTS NEED */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-main">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#212529] tracking-tight mb-4">
              What to look for in student housing
            </h2>
            <p className="text-[#495057] text-lg max-w-lg mx-auto">
              A quick guide for students searching for their perfect digs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 max-w-4xl mx-auto">
            {[
              { icon: MapPin, title: 'Proximity to campus', desc: 'Walking distance or reliable transport routes to your university save time and money.' },
              { icon: Wifi, title: 'Reliable internet', desc: 'Essential for assignments, research, and online lectures — check the Wi-Fi speed before signing.' },
              { icon: Shield, title: 'Safe neighbourhood', desc: 'Look for well-lit areas with security features, especially if you study late at the library.' },
              { icon: Bus, title: 'Public transport access', desc: 'Check kombi routes and proximity to bus stops for getting around the city affordably.' },
              { icon: Coffee, title: 'Nearby amenities', desc: 'Shops, restaurants, and study spots within walking distance make student life much easier.' },
              { icon: CheckCircle, title: 'Flexible lease terms', desc: 'Semester-based or month-to-month leases work best for students who travel during breaks.' },
            ].map(({ icon: Icon, title, desc }, idx) => (
              <div key={idx} className="group flex items-start gap-4 p-5 rounded-xl border border-[#E9ECEF] hover:border-[#212529] hover:shadow-lg transition-all duration-300">
                <div className="w-10 h-10 bg-[#F8F9FA] group-hover:bg-[#212529] rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                  <Icon size={18} className="text-[#495057] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-[#212529] mb-1">{title}</h3>
                  <p className="text-sm text-[#495057] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-[#F8F9FA]">
        <div className="container-main">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-[#212529] tracking-tight mb-4">
                Common questions
              </h2>
              <p className="text-[#495057] text-lg">
                Everything students ask about renting in Zimbabwe
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: 'Do I need a deposit for student housing?',
                  a: 'Most landlords require a one-month deposit plus one month rent upfront. Some student-specific properties offer reduced deposits or payment plans — check individual listings for details.'
                },
                {
                  q: 'Can I share a room to reduce costs?',
                  a: 'Yes! Many properties on Huts offer shared room options specifically for students. Look for listings with the "Shared" badge to find shared accommodation near your campus.'
                },
                {
                  q: 'Are utilities included in the rent?',
                  a: 'It depends on the property. Listings with the "Utilities" badge include water, electricity, and often Wi-Fi in the monthly rent. Always confirm with the landlord which utilities are covered.'
                },
                {
                  q: 'Can I rent for just one semester?',
                  a: 'Many landlords near universities offer flexible lease terms including semester-based leases. Use the search filters to find properties with short-term availability, or message landlords to negotiate terms.'
                },
                {
                  q: 'How do I verify a listing is legitimate?',
                  a: 'Every property on Huts goes through our verification process before being published. Look for the verified badge and always use our in-app messaging to communicate with landlords — never pay outside the platform.'
                },
              ].map(({ q, a }, idx) => (
                <details key={idx} className="group bg-white border-2 border-[#E9ECEF] rounded-xl hover:border-[#212529] transition-colors">
                  <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-[#212529] list-none">
                    <span className="pr-4">{q}</span>
                    <ChevronDown size={18} className="text-[#ADB5BD] group-open:rotate-180 transition-transform flex-shrink-0" />
                  </summary>
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-[#495057] leading-relaxed">{a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-[#212529] text-white relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[100px]" />

        <div className="container-main relative">
          <div className="max-w-3xl mx-auto text-center">
            <GraduationCap size={40} className="mx-auto mb-6 text-white/30" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Ready to find your
              <br />
              student home?
            </h2>
            <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto leading-relaxed">
              Search verified, student-friendly properties near your university.
              No agent fees, no hassle — just affordable housing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/search?type=rent&studentHousingOnly=true"
                className="group inline-flex items-center justify-center gap-2.5 bg-white text-[#212529] px-10 py-4 rounded-xl font-bold text-base hover:-translate-y-0.5 hover:shadow-2xl transition-all"
              >
                Start Searching
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/dashboard/new-property"
                className="inline-flex items-center justify-center gap-2 bg-white/[0.08] border border-white/[0.12] text-white px-10 py-4 rounded-xl font-semibold hover:bg-white/[0.12] transition-all"
              >
                List Student Housing
              </Link>
            </div>

            {/* Trust strip */}
            <div className="mt-14 pt-8 border-t border-white/[0.06] flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs tracking-wide">
              {[
                { icon: Shield, text: 'Verified Listings' },
                { icon: CheckCircle, text: 'Free for Students' },
                { icon: GraduationCap, text: 'Campus-Nearby' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-white/30">
                  <Icon size={13} />
                  <span>{text}</span>
                </div>
              ))}
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
            '@type': 'WebPage',
            name: 'Student Housing Near Universities in Zimbabwe',
            description: 'Find affordable student accommodation near UZ, NUST, MSU, and other Zimbabwean universities.',
            url: 'https://www.huts.co.zw/student-housing',
            isPartOf: {
              '@type': 'WebSite',
              name: 'Huts',
              url: 'https://www.huts.co.zw',
            },
            about: {
              '@type': 'Thing',
              name: 'Student Housing in Zimbabwe',
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
              { '@type': 'Question', name: 'Do I need a deposit for student housing?', acceptedAnswer: { '@type': 'Answer', text: 'Most landlords require a one-month deposit plus one month rent upfront. Some student-specific properties offer reduced deposits or payment plans.' } },
              { '@type': 'Question', name: 'Can I share a room to reduce costs?', acceptedAnswer: { '@type': 'Answer', text: 'Yes! Many properties on Huts offer shared room options specifically for students. Look for listings with the "Shared" badge.' } },
              { '@type': 'Question', name: 'Are utilities included in the rent?', acceptedAnswer: { '@type': 'Answer', text: 'It depends on the property. Listings with the "Utilities" badge include water, electricity, and often Wi-Fi in the monthly rent.' } },
              { '@type': 'Question', name: 'Can I rent for just one semester?', acceptedAnswer: { '@type': 'Answer', text: 'Many landlords near universities offer flexible lease terms including semester-based leases.' } },
              { '@type': 'Question', name: 'How do I verify a listing is legitimate?', acceptedAnswer: { '@type': 'Answer', text: 'Every property on Huts goes through our verification process before being published. Look for the verified badge.' } },
            ],
          }),
        }}
      />
    </div>
  )
}
