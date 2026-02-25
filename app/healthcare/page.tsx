import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import HealthcareMapView from '@/components/healthcare/HealthcareMapView'
import { MapPin, Building2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Healthcare Facilities in Zimbabwe | Huts',
  description: 'Browse all healthcare facilities across Zimbabwe. Find hospitals, clinics, and rural health centers near you.',
  openGraph: {
    title: 'Healthcare Facilities in Zimbabwe | Huts',
    description: 'Browse 1,688 healthcare facilities across Zimbabwe including hospitals, clinics, and health centers.',
    url: 'https://www.huts.co.zw/healthcare',
  },
  alternates: {
    canonical: 'https://www.huts.co.zw/healthcare',
  },
}

export const revalidate = 3600 // Revalidate every hour

export default async function HealthcarePage() {
  const supabase = await createClient()

  // Fetch all healthcare facilities
  const { data: facilities, error } = await supabase
    .from('healthcare_facilities')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching healthcare facilities:', error)
  }

  // Get stats
  const totalFacilities = facilities?.length || 0
  const provinces = facilities ? Array.from(new Set(facilities.map(f => f.province))).sort() : []
  const facilityTypes = facilities 
    ? Array.from(new Set(facilities.map(f => f.facility_type))).sort()
    : []

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-[#F8F9FA] border-b border-[#E9ECEF] py-12 md:py-16">
        <div className="container-main max-w-7xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#212529] rounded-xl flex items-center justify-center">
                <Building2 size={28} className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#212529] mb-4 tracking-tight">
              Healthcare Facilities in Zimbabwe
            </h1>
            <p className="text-lg md:text-xl text-[#495057] max-w-3xl mx-auto leading-relaxed">
              Browse all {totalFacilities.toLocaleString()} healthcare facilities across Zimbabwe's {provinces.length} provinces.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="bg-white border-2 border-[#E9ECEF] rounded-xl p-6 text-center hover:border-[#212529] transition-all">
              <div className="text-3xl font-bold text-[#212529] mb-2">
                {totalFacilities.toLocaleString()}
              </div>
              <p className="text-sm text-[#ADB5BD] font-medium">Total Facilities</p>
            </div>
            <div className="bg-white border-2 border-[#E9ECEF] rounded-xl p-6 text-center hover:border-[#212529] transition-all">
              <div className="text-3xl font-bold text-[#212529] mb-2">
                {provinces.length}
              </div>
              <p className="text-sm text-[#ADB5BD] font-medium">Provinces</p>
            </div>
            <div className="bg-white border-2 border-[#E9ECEF] rounded-xl p-6 text-center hover:border-[#212529] transition-all">
              <div className="text-3xl font-bold text-[#212529] mb-2">
                {facilityTypes.length}
              </div>
              <p className="text-sm text-[#ADB5BD] font-medium">Facility Types</p>
            </div>
          </div>
        </div>
      </section>

      {/* Map View */}
      <section className="py-8">
        <div className="container-main max-w-7xl">
          <HealthcareMapView facilities={facilities || []} />
        </div>
      </section>

      {/* Facility Types Legend */}
      <section className="py-12 bg-[#F8F9FA]">
        <div className="container-main max-w-7xl">
          <h2 className="text-2xl font-bold text-[#212529] mb-6">Facility Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {facilityTypes.map(type => {
              const count = facilities?.filter(f => f.facility_type === type).length || 0
              return (
                <div key={type} className="bg-white border border-[#E9ECEF] rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-[#212529]" />
                      <span className="font-medium text-[#212529]">{type}</span>
                    </div>
                    <span className="text-xl font-bold text-[#212529]">{count}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
