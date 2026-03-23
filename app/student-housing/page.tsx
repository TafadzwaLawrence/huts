import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  GraduationCap, Home, Users, Zap, ArrowRight, MapPin,
  Sofa, Wifi, CheckCircle, Shield, Search, Bed, Bath, Square,
  Building2, ChevronDown, BookOpen, Bus, Coffee, ChevronRight
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

// Zimbabwe universities with their cities and campus locations
const UNIVERSITIES = [
  // --- Major public universities ---
  { name: 'University of Zimbabwe', short: 'UZ', city: 'Harare', area: 'Mount Pleasant', icon: GraduationCap },
  { name: 'National University of Science & Technology', short: 'NUST', city: 'Bulawayo', area: 'Ascot', icon: Building2 },
  { name: 'Midlands State University', short: 'MSU', city: 'Gweru', area: 'Senga', icon: BookOpen },
  { name: 'Chinhoyi University of Technology', short: 'CUT', city: 'Chinhoyi', area: 'Chinhoyi', icon: Building2 },
  { name: 'Bindura University of Science Education', short: 'BUSE', city: 'Bindura', area: 'Bindura', icon: BookOpen },
  { name: 'Great Zimbabwe University', short: 'GZU', city: 'Masvingo', area: 'Mucheke', icon: GraduationCap },
  { name: 'Harare Institute of Technology', short: 'HIT', city: 'Harare', area: 'Belvedere', icon: Building2 },
  { name: 'Lupane State University', short: 'LSU', city: 'Lupane', area: 'Lupane', icon: BookOpen },
  { name: 'Gwanda State University', short: 'GSU', city: 'Gwanda', area: 'Gwanda', icon: GraduationCap },
  // --- Private & church universities ---
  { name: 'Africa University', short: 'AU', city: 'Mutare', area: 'Old Mutare', icon: GraduationCap },
  { name: 'Solusi University', short: 'SU', city: 'Bulawayo', area: 'Solusi (50km west)', icon: BookOpen },
  { name: 'Catholic University of Zimbabwe', short: 'CUZ', city: 'Harare', area: 'Harare', icon: Building2 },
  { name: 'Arrupe Jesuit University', short: 'AJU', city: 'Harare', area: 'Mount Pleasant', icon: BookOpen },
  { name: 'Reformed Church University', short: 'RCU', city: 'Masvingo', area: 'Masvingo', icon: GraduationCap },
  { name: 'Zimbabwe Ezekiel Guti University', short: 'ZEGU', city: 'Bindura', area: 'Bindura', icon: Building2 },
  { name: "Women's University in Africa", short: 'WUA', city: 'Marondera', area: 'Marondera', icon: BookOpen },
  { name: 'Zimbabwe Open University', short: 'ZOU', city: 'Harare', area: 'Mount Pleasant', icon: GraduationCap },
]

async function getStudentProperties() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('properties')
    .select(`
      id, title, slug, listing_type, price, sale_price,
      bedrooms, bathrooms, square_feet, city, area, property_type,
      furnished, shared_rooms, utilities_included,
      property_images(url, is_primary, alt_text),
      profiles(full_name, avatar_url, verified)
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
      bedrooms, bathrooms, square_feet, city, area, property_type,
      furnished, shared_rooms, utilities_included,
      property_images(url, is_primary, alt_text),
      profiles(full_name, avatar_url, verified)
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
      <section className="bg-[#212529] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-white/30 mb-10">
            <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-white/50">Student Housing</span>
          </nav>

          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-5">
            Student Accommodation · Zimbabwe
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.06] mb-6">
            Student housing<br />
            <span className="text-white/40">near your campus.</span>
          </h1>
          <p className="text-base md:text-lg text-white/50 mb-10 max-w-lg leading-relaxed">
            Furnished rooms, shared accommodation, and affordable rentals near universities across Zimbabwe.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/search?type=rent&studentHousingOnly=true"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#212529] px-6 py-3 rounded-lg font-semibold text-sm hover:bg-[#F8F9FA] transition-colors"
            >
              <Search size={15} />
              Browse Student Housing
            </Link>
            <a
              href="#universities"
              className="inline-flex items-center justify-center gap-2 text-white/60 border border-white/10 px-6 py-3 rounded-lg font-medium text-sm hover:border-white/20 hover:text-white/80 transition-colors"
            >
              Find by University
              <ChevronDown size={14} />
            </a>
          </div>

          <div className="mt-14 pt-8 border-t border-white/[0.06] flex gap-10">
            {[
              { value: '17', label: 'Universities' },
              { value: '100%', label: 'Verified' },
              { value: '$0', label: 'Agent Fees' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-white/30 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="border-b border-[#E9ECEF]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E9ECEF]">
            {[
              { icon: Sofa,  title: 'Furnished & Ready',    desc: 'Beds, desks, and wardrobes included — move in with just your bags.' },
              { icon: Users, title: 'Shared Room Options',  desc: 'Split costs with fellow students in shared rooms and common areas.' },
              { icon: Zap,   title: 'Utilities Included',   desc: 'Water, electricity, and Wi-Fi in one monthly payment. No surprises.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 px-6 py-8">
                <Icon size={18} className="text-[#495057] mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-[#212529] text-sm mb-1">{title}</p>
                  <p className="text-sm text-[#ADB5BD] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UNIVERSITIES */}
      <section id="universities" className="py-16 md:py-24 scroll-mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#212529] mb-2">Find housing near your university</h2>
            <p className="text-[#ADB5BD] text-sm">{UNIVERSITIES.length} universities across Zimbabwe</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#E9ECEF] border border-[#E9ECEF] rounded-xl overflow-hidden">
            {UNIVERSITIES.map(({ name, short, city, area }) => (
              <Link
                key={short}
                href={`/search?type=rent&city=${encodeURIComponent(city)}`}
                className="group bg-white px-5 py-4 hover:bg-[#F8F9FA] transition-colors flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold text-[#212529]">{short}</span>
                    <span className="text-xs text-[#ADB5BD] truncate hidden sm:block">{name}</span>
                  </div>
                  <p className="text-xs text-[#ADB5BD] mt-0.5 flex items-center gap-1">
                    <MapPin size={10} />
                    {area !== city ? `${area}, ${city}` : city}
                  </p>
                </div>
                <ArrowRight size={13} className="text-[#ADB5BD] group-hover:text-[#212529] shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* LISTINGS */}
      <section className="py-16 md:py-24 bg-[#F8F9FA] border-t border-[#E9ECEF]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#212529] mb-1">
                {isShowingFallback ? 'Budget-friendly rentals' : 'Student housing'}
              </h2>
              <p className="text-sm text-[#ADB5BD]">
                {isShowingFallback
                  ? 'Affordable rooms and apartments for students'
                  : `${displayProperties.length} ${displayProperties.length === 1 ? 'property' : 'properties'} available`}
              </p>
            </div>
            <Link
              href="/search?type=rent&studentHousingOnly=true"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#495057] hover:text-[#212529] transition-colors shrink-0"
            >
              View all <ArrowRight size={13} />
            </Link>
          </div>

          {displayProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayProperties.map((property: any) => {
                const primaryImage = property.property_images?.find((img: any) => img.is_primary) || property.property_images?.[0]
                const imageUrl = primaryImage?.url

                return (
                  <Link key={property.id} href={`/property/${property.slug || property.id}`} className="group">
                    <article className="bg-white border border-[#E9ECEF] rounded-xl overflow-hidden hover:border-[#212529] hover:shadow-md transition-all duration-200">
                      <div className="relative h-44 overflow-hidden bg-[#F8F9FA]">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={primaryImage?.alt_text || property.title}
                            fill
                            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Home className="text-[#E9ECEF]" size={36} />
                          </div>
                        )}
                        {property.price && (
                          <div className="absolute bottom-2.5 left-2.5 bg-black/80 text-white px-2.5 py-1 rounded text-xs font-semibold">
                            {formatPrice(property.price)}<span className="opacity-60">/mo</span>
                          </div>
                        )}
                        {property.property_type === 'student' && (
                          <div className="absolute top-2.5 left-2.5 flex gap-1">
                            {property.furnished && (
                              <span className="bg-white/90 text-[#212529] px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-0.5">
                                <Sofa size={9} /> Furnished
                              </span>
                            )}
                            {property.utilities_included && (
                              <span className="bg-white/90 text-[#212529] px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-0.5">
                                <Zap size={9} /> Bills incl.
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-[#212529] text-sm mb-1 line-clamp-1">{property.title}</h3>
                        <p className="text-xs text-[#ADB5BD] mb-3 flex items-center gap-1">
                          <MapPin size={10} />
                          {property.area ? `${property.area}, ` : ''}{property.city}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-[#495057] pt-3 border-t border-[#F1F3F5]">
                          <span className="flex items-center gap-1"><Bed size={11} className="text-[#ADB5BD]" />{property.bedrooms} bed</span>
                          <span className="flex items-center gap-1"><Bath size={11} className="text-[#ADB5BD]" />{property.bathrooms} bath</span>
                          {property.square_feet && (
                            <span className="flex items-center gap-1"><Square size={11} className="text-[#ADB5BD]" />{property.square_feet} ft²</span>
                          )}
                        </div>
                      </div>
                    </article>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-[#E9ECEF] rounded-xl p-12 text-center">
              <GraduationCap size={32} className="mx-auto text-[#ADB5BD] mb-4" />
              <h3 className="text-lg font-bold text-[#212529] mb-2">No student housing listed yet</h3>
              <p className="text-sm text-[#ADB5BD] mb-6 max-w-sm mx-auto">Be the first to list accommodation and help students find a home near campus.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/dashboard/new-property" className="inline-flex items-center gap-2 bg-[#212529] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-black transition-colors">
                  List Student Housing <ArrowRight size={14} />
                </Link>
                <Link href="/search?type=rent" className="inline-flex items-center gap-2 text-[#495057] border border-[#E9ECEF] px-5 py-2.5 rounded-lg text-sm font-semibold hover:border-[#212529] transition-colors">
                  <Search size={14} /> Browse All Rentals
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CHECKLIST */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#212529] mb-2">What to look for</h2>
            <p className="text-sm text-[#ADB5BD]">A quick checklist for students searching for accommodation</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: MapPin,       title: 'Proximity to campus',     desc: 'Walking distance or reliable kombi routes save time and money.' },
              { icon: Wifi,         title: 'Reliable internet',        desc: 'Confirm Wi-Fi speed before signing. Essential for assignments and online lectures.' },
              { icon: Shield,       title: 'Safe neighbourhood',       desc: 'Well-lit areas with security features, especially for late-night study sessions.' },
              { icon: Bus,          title: 'Public transport access',  desc: 'Check kombi routes and proximity to bus stops for affordable city travel.' },
              { icon: Coffee,       title: 'Nearby amenities',         desc: 'Shops, food, and study spots within walking distance.' },
              { icon: CheckCircle,  title: 'Flexible lease terms',     desc: 'Semester or month-to-month leases work best around academic calendars.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 p-4 rounded-lg border border-[#E9ECEF] hover:border-[#212529] transition-colors">
                <Icon size={15} className="text-[#495057] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#212529] mb-0.5">{title}</p>
                  <p className="text-xs text-[#ADB5BD] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-[#F8F9FA] border-t border-[#E9ECEF]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#212529] mb-2">Common questions</h2>
          <p className="text-sm text-[#ADB5BD] mb-10">Everything students ask about renting in Zimbabwe</p>

          <div className="divide-y divide-[#E9ECEF] border border-[#E9ECEF] rounded-xl overflow-hidden bg-white">
            {[
              { q: 'Do I need a deposit?',                    a: 'Most landlords require one month deposit plus one month rent upfront. Some student-specific properties offer reduced deposits or payment plans — check individual listings.' },
              { q: 'Can I share a room to reduce costs?',     a: 'Yes. Many listings on Huts offer shared room options. Look for the "Shared" badge when browsing.' },
              { q: 'Are utilities included in the rent?',     a: 'It depends on the listing. Properties with a "Bills incl." badge cover water, electricity, and often Wi-Fi. Always confirm with the landlord.' },
              { q: 'Can I rent for just one semester?',       a: 'Many landlords near universities offer semester-based or month-to-month leases. Use search filters or message landlords directly to negotiate terms.' },
              { q: 'How do I know a listing is legitimate?',  a: 'Every property on Huts is verified before publishing. Look for the verified badge and always communicate through our in-app messaging — never pay outside the platform.' },
            ].map(({ q, a }, idx) => (
              <details key={idx} className="group">
                <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-sm font-semibold text-[#212529] list-none hover:bg-[#F8F9FA] transition-colors">
                  {q}
                  <ChevronDown size={14} className="text-[#ADB5BD] group-open:rotate-180 transition-transform shrink-0 ml-4" />
                </summary>
                <div className="px-5 pb-4 text-sm text-[#495057] leading-relaxed border-t border-[#F1F3F5]">
                  <p className="pt-3">{a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#212529] text-white py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <GraduationCap size={28} className="mx-auto mb-6 text-white/20" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Ready to find your student home?
          </h2>
          <p className="text-white/40 text-sm mb-8 max-w-md mx-auto leading-relaxed">
            Verified, student-friendly properties near your university. No agent fees, no hassle.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/search?type=rent&studentHousingOnly=true"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#212529] px-6 py-3 rounded-lg font-semibold text-sm hover:bg-[#F8F9FA] transition-colors"
            >
              Start Searching <ArrowRight size={14} />
            </Link>
            <Link
              href="/dashboard/new-property"
              className="inline-flex items-center justify-center gap-2 text-white/60 border border-white/10 px-6 py-3 rounded-lg font-medium text-sm hover:border-white/20 hover:text-white/80 transition-colors"
            >
              List Student Housing
            </Link>
          </div>
          <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-wrap items-center justify-center gap-6 text-xs text-white/20">
            <span className="flex items-center gap-1.5"><Shield size={11} /> Verified Listings</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={11} /> Free for Students</span>
            <span className="flex items-center gap-1.5"><GraduationCap size={11} /> Campus-Nearby</span>
          </div>
        </div>
      </section>

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Student Housing Near Universities in Zimbabwe',
        description: 'Find affordable student accommodation near UZ, NUST, MSU, and other Zimbabwean universities.',
        url: 'https://www.huts.co.zw/student-housing',
        isPartOf: { '@type': 'WebSite', name: 'Huts', url: 'https://www.huts.co.zw' },
      })}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'Do I need a deposit for student housing?',    acceptedAnswer: { '@type': 'Answer', text: 'Most landlords require a one-month deposit plus one month rent upfront. Some student-specific properties offer reduced deposits or payment plans.' } },
          { '@type': 'Question', name: 'Can I share a room to reduce costs?',          acceptedAnswer: { '@type': 'Answer', text: 'Yes. Many properties on Huts offer shared room options specifically for students. Look for listings with the "Shared" badge.' } },
          { '@type': 'Question', name: 'Are utilities included in the rent?',          acceptedAnswer: { '@type': 'Answer', text: 'It depends on the property. Listings with a "Bills incl." badge include water, electricity, and often Wi-Fi in the monthly rent.' } },
          { '@type': 'Question', name: 'Can I rent for just one semester?',            acceptedAnswer: { '@type': 'Answer', text: 'Many landlords near universities offer flexible lease terms including semester-based leases.' } },
          { '@type': 'Question', name: 'How do I verify a listing is legitimate?',    acceptedAnswer: { '@type': 'Answer', text: 'Every property on Huts goes through our verification process before being published. Look for the verified badge.' } },
        ],
      })}} />
    </div>
  )
}
