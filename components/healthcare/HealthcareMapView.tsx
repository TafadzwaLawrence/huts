'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, List, Map as MapIcon, Search } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const Map = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

// Fix Leaflet default marker icon paths for Next.js
// This must run on client side only
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
}

interface HealthcareFacility {
  id: string
  name: string
  province: string
  district: string
  facility_type: string
  latitude: number
  longitude: number
  elevation?: number
  year_built?: number
}

interface HealthcareMapViewProps {
  facilities: HealthcareFacility[]
}

export default function HealthcareMapView({ facilities }: HealthcareMapViewProps) {
  const [view, setView] = useState<'map' | 'list'>('map')
  const [searchTerm, setSearchTerm] = useState('')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Filter facilities by search term
  const filteredFacilities = facilities.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.province.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Zimbabwe center coordinates
  const zimbabweCenter = { lat: -19.015438, lng: 29.154857 }

  return (
    <div className="space-y-4">
      {/* View Toggle and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ADB5BD]" size={18} />
          <input
            type="text"
            placeholder="Search by facility name, district, or province..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-[#E9ECEF] rounded-xl text-[#212529] placeholder:text-[#ADB5BD] focus:outline-none focus:border-[#212529] transition-all"
          />
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-[#F8F9FA] p-1 rounded-lg border border-[#E9ECEF]">
          <button
            onClick={() => setView('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
              view === 'map'
                ? 'bg-white text-[#212529] shadow-sm'
                : 'text-[#495057] hover:text-[#212529]'
            }`}
          >
            <MapIcon size={16} />
            Map View
          </button>
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
              view === 'list'
                ? 'bg-white text-[#212529] shadow-sm'
                : 'text-[#495057] hover:text-[#212529]'
            }`}
          >
            <List size={16} />
            List View
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-[#495057]">
        Showing <span className="font-bold text-[#212529]">{filteredFacilities.length}</span> of {facilities.length} facilities
      </div>

      {/* Map View */}
      {view === 'map' && isClient && (
        <div className="w-full h-[600px] rounded-xl overflow-hidden border-2 border-[#E9ECEF] shadow-lg">
          <Map
            center={[zimbabweCenter.lat, zimbabweCenter.lng]}
            zoom={7}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredFacilities.map((facility) => (
              <Marker
                key={facility.id}
                position={[facility.latitude, facility.longitude]}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-[#212529] mb-1">{facility.name}</h3>
                    <p className="text-sm text-[#495057] mb-1">{facility.facility_type}</p>
                    <p className="text-xs text-[#ADB5BD]">
                      {facility.district}, {facility.province}
                    </p>
                    {facility.year_built && facility.year_built > 0 && (
                      <p className="text-xs text-[#ADB5BD] mt-1">
                        Built: {facility.year_built}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </Map>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFacilities.map((facility) => (
            <div
              key={facility.id}
              className="bg-white border-2 border-[#E9ECEF] rounded-xl p-4 hover:border-[#212529] transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#F8F9FA] rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin size={20} className="text-[#212529]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#212529] mb-1">{facility.name}</h3>
                  <p className="text-sm text-[#495057] mb-2">{facility.facility_type}</p>
                  <div className="flex items-center text-xs text-[#ADB5BD] mb-1">
                    <MapPin size={12} className="mr-1" />
                    {facility.district}, {facility.province}
                  </div>
                  {facility.year_built && facility.year_built > 0 && (
                    <p className="text-xs text-[#ADB5BD]">Built: {facility.year_built}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredFacilities.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-[#F8F9FA] rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin size={32} className="text-[#ADB5BD]" />
          </div>
          <h3 className="text-xl font-bold text-[#212529] mb-2">No facilities found</h3>
          <p className="text-[#495057]">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  )
}
