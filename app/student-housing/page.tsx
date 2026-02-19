import { Metadata } from 'next'
import Link from 'next/link'
import { GraduationCap, Home, Users, Zap, ArrowRight, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PropertyGrid } from '@/components/property/PropertyGrid'

export const metadata: Metadata = {
  title: 'Student Housing & Accommodations | Huts',
  description: 'Find furnished, shared, and utility-inclusive student housing near universities. Perfect for college students seeking affordable, convenient living spaces.',
  openGraph: {
    title: 'Student Housing & Accommodations | Huts',
    description: 'Find furnished, shared, and utility-inclusive student housing near universities.',
    type: 'website',
  },
}

async function getStudentProperties() {
  const supabase = await createClient()
  
  const { data: properties, error } = await supabase
    .from('properties')
    .select(`
      id,
      title,
      slug,
      listing_type,
      price,
      sale_price,
      beds,
      baths,
      sqft,
      city,
      neighborhood,
      property_type,
      lat,
      lng,
      furnished,
      shared_rooms,
      utilities_included,
      property_images(url, is_primary, alt_text),
      profiles(name, avatar_url, verified)
    `)
    .eq('property_type', 'student')
    .eq('status', 'active')
    .eq('verification_status', 'approved')
    .order('created_at', { ascending: false })
    .limit(12)

  if (error) {
    console.error('Error fetching student properties:', error)
    return []
  }

  return properties || []
}

export default async function StudentHousingPage() {
  const studentProperties = await getStudentProperties()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#212529] to-[#495057] text-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4 text-blue-200">
              <GraduationCap size={24} />
              <span className="font-semibold text-sm uppercase tracking-wider">Student Accommodations</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Find Your Perfect Student Housing
            </h1>
            
            <p className="text-lg text-gray-200 mb-8 leading-relaxed">
              Discover furnished apartments, shared rooms, and utilities-included housing designed for students. Flexible leases, great locations near universities, and affordable monthly rates.
            </p>

            <Link
              href="/search?type=rent&studentHousingOnly=true"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Browse Student Housing
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="bg-[#F8F9FA] py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#212529] mb-4 text-center">
            What Makes Student Housing Special
          </h2>
          <p className="text-center text-[#495057] mb-12 max-w-2xl mx-auto">
            Student accommodations come with features designed for college and university life.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Home size={32} className="text-blue-500" />,
                title: 'Furnished & Ready',
                description: 'Move-in ready spaces with furniture, reducing your initial costs and hassle.'
              },
              {
                icon: <Users size={32} className="text-green-500" />,
                title: 'Shared Room Options',
                description: 'Connect with other students through shared accommodation arrangements at lower costs.'
              },
              {
                icon: <Zap size={32} className="text-amber-500" />,
                title: 'Utilities Included',
                description: 'No surprise bills—water, electricity, and internet are included in your monthly rent.'
              },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl border-2 border-[#E9ECEF] hover:border-[#212529] hover:shadow-lg transition-all duration-200">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-[#212529] mb-3">{feature.title}</h3>
                <p className="text-[#495057] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#212529] mb-2">
                Featured Student Housing
              </h2>
              <p className="text-[#495057]">
                {studentProperties.length} student properties available
              </p>
            </div>
            <Link
              href="/search?type=rent&studentHousingOnly=true"
              className="text-sm font-semibold text-blue-500 hover:text-blue-600 flex items-center gap-2 transition-colors"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {studentProperties.length > 0 ? (
            <PropertyGrid properties={studentProperties as any} />
          ) : (
            <div className="text-center py-16">
              <p className="text-[#495057] text-lg mb-4">No student housing available yet.</p>
              <p className="text-[#ADB5BD]">Check back soon or browse other listings.</p>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-blue-50 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#212529] mb-12 text-center">
            Benefits for Student Renters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              'Semester-based lease terms with flexible end dates',
              'Summer sublet-friendly policies perfect for breaks',
              'Proximity to universities and college campuses',
              'Community atmosphere with other student renters',
              'No long-term commitment required',
              'Affordable month-to-month options available',
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 mt-1 font-bold text-sm">
                  ✓
                </div>
                <p className="text-[#212529] font-medium text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#212529] text-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Find Your Student Housing?
          </h2>
          <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
            Start browsing verified, student-friendly properties today. Filter by furnished status, shared rooms, utilities included, and proximity to your university.
          </p>
          <Link
            href="/search?type=rent&studentHousingOnly=true"
            className="inline-flex items-center gap-2 px-10 py-4 bg-blue-500 hover:bg-blue-600 font-semibold rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl text-white"
          >
            Start Searching
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
