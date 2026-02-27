'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Loader2, Home, DollarSign, Bed, Bath, ExternalLink, Plus } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Dynamic imports for Leaflet (no SSR)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

interface Property {
  id: string
  title: string
  price: number
  beds: number
  baths: number
  lat: number
  lng: number
  city: string
  neighborhood: string | null
  status: string
  property_images: { url: string }[]
}

export default function DashboardMapPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    // Fix Leaflet icon issue
    if (typeof window !== 'undefined') {
      const L = require('leaflet')
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })
    }
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          price,
          beds,
          baths,
          lat,
          lng,
          city,
          neighborhood,
          status,
          property_images (url)
        `)
        .eq('user_id', user.id)
        .not('lat', 'is', null)
        .not('lng', 'is', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProperties(data || [])
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate map center from properties
  const getMapCenter = (): [number, number] => {
    if (properties.length === 0) return [-17.8292, 31.0522] // Default to Harare
    
    const avgLat = properties.reduce((sum, p) => sum + (p.lat || 0), 0) / properties.length
    const avgLng = properties.reduce((sum, p) => sum + (p.lng || 0), 0) / properties.length
    
    return [avgLat, avgLng]
  }

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(cents / 100)
  }

  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#ADB5BD]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E9ECEF] sticky top-0 z-10">
        <div className="container-main py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#212529]">Property Map</h1>
              <p className="text-[#495057]">View all your listings on a map</p>
            </div>
            <Link
              href="/dashboard/new-property"
              className="flex items-center gap-2 bg-[#212529] text-white px-4 py-2 rounded-xl hover:bg-black transition-colors"
            >
              <Plus size={20} />
              Add Property
            </Link>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Sidebar - Property List */}
        <div className="w-96 bg-white border-r border-[#E9ECEF] overflow-y-auto">
          <div className="p-4 border-b border-[#E9ECEF]">
            <p className="text-sm text-[#495057]">
              {properties.length} {properties.length === 1 ? 'property' : 'properties'} with locations
            </p>
          </div>

          {properties.length === 0 ? (
            <div className="p-8 text-center">
              <div className="h-16 w-16 mx-auto bg-[#F8F9FA] rounded-full flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 text-[#ADB5BD]" />
              </div>
              <h3 className="font-semibold text-[#212529] mb-2">No properties with locations</h3>
              <p className="text-sm text-[#495057] mb-4">
                Add locations to your properties to see them on the map
              </p>
              <Link
                href="/dashboard/new-property"
                className="inline-flex items-center gap-2 text-[#212529] font-medium hover:underline"
              >
                <Plus size={16} />
                Add a Property
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#E9ECEF]">
              {properties.map((property) => (
                <button
                  key={property.id}
                  onClick={() => setSelectedProperty(property)}
                  className={`w-full p-4 text-left hover:bg-[#F8F9FA] transition-colors ${
                    selectedProperty?.id === property.id ? 'bg-[#F8F9FA] border-l-4 border-[#212529]' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#E9ECEF] shrink-0">
                      {property.property_images?.[0]?.url ? (
                        <img
                          src={property.property_images[0].url}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="h-8 w-8 text-[#ADB5BD]" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#212529] truncate">{property.title}</h3>
                      <p className="text-sm text-[#495057] truncate">
                        {property.neighborhood || property.city}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-sm text-[#495057]">
                        <span className="flex items-center gap-1">
                          <DollarSign size={14} />
                          {formatPrice(property.price)}/mo
                        </span>
                        <span className="flex items-center gap-1">
                          <Bed size={14} />
                          {property.beds}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bath size={14} />
                          {property.baths}
                        </span>
                      </div>
                      <span className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full ${
                        property.status === 'active'
                          ? 'bg-[#212529]/10 text-[#212529]'
                          : 'bg-[#E9ECEF] text-[#495057]'
                      }`}>
                        {property.status}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={getMapCenter()}
            zoom={properties.length > 0 ? 12 : 10}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {properties.map((property) => (
              <Marker
                key={property.id}
                position={[property.lat, property.lng]}
                eventHandlers={{
                  click: () => setSelectedProperty(property),
                }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    {property.property_images?.[0]?.url && (
                      <img
                        src={property.property_images[0].url}
                        alt={property.title}
                        className="w-full h-24 object-cover rounded-t-lg -mt-3 -mx-3 mb-2"
                        style={{ width: 'calc(100% + 24px)' }}
                      />
                    )}
                    <h3 className="font-semibold text-[#212529] mb-1">{property.title}</h3>
                    <p className="text-sm text-[#495057] mb-2">
                      {property.neighborhood || property.city}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#212529]">
                        {formatPrice(property.price)}/mo
                      </span>
                      <Link
                        href={`/property/${property.slug || property.id}`}
                        className="text-[#212529] hover:underline text-sm flex items-center gap-1"
                      >
                        View <ExternalLink size={12} />
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Stats overlay */}
          <div className="absolute top-4 right-4 bg-white rounded-xl shadow-lg p-4 z-[1000]">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#212529]">{properties.length}</p>
                <p className="text-xs text-[#495057]">Properties</p>
              </div>
              <div className="h-10 w-px bg-[#E9ECEF]" />
              <div className="text-center">
                <p className="text-2xl font-bold text-[#212529]">
                  {properties.filter(p => p.status === 'active').length}
                </p>
                <p className="text-xs text-[#495057]">Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
