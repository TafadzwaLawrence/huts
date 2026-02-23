'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { MapPin, Navigation } from 'lucide-react'

interface NeighborhoodSectionProps {
  lat?: number | null
  lng?: number | null
  city: string
  neighborhood?: string | null
  state?: string | null
}

export default function NeighborhoodSection({ lat, lng, city, neighborhood, state }: NeighborhoodSectionProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !mapRef.current || !lat || !lng || mapInstanceRef.current) return

    // Dynamic import of Leaflet
    const initMap = async () => {
      const L = (await import('leaflet')).default
      // @ts-ignore - CSS import handled by webpack
      await import('leaflet/dist/leaflet.css')

      const map = L.map(mapRef.current!, {
        scrollWheelZoom: false,
        zoomControl: true,
        dragging: true,
      }).setView([lat, lng], 15)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      // Property marker
      const markerIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width: 16px; height: 16px; background: #212529; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })

      L.marker([lat, lng], { icon: markerIcon }).addTo(map)

      mapInstanceRef.current = map
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [mounted, lat, lng])

  const locationDisplay = neighborhood && neighborhood !== city
    ? `${neighborhood}, ${city}`
    : city

  return (
    <div className="mb-8">
      <h2 className="text-base font-bold text-[#212529] mb-4">Neighborhood</h2>

      <div className="flex items-center gap-2 mb-3">
        <MapPin size={14} className="text-[#ADB5BD]" />
        <span className="text-sm text-[#495057]">
          {locationDisplay}{state ? `, ${state}` : ''}, Zimbabwe
        </span>
      </div>

      {lat && lng ? (
        <div
          ref={mapRef}
          className="w-full h-[250px] rounded-lg border border-[#E9ECEF] overflow-hidden"
        />
      ) : (
        <div className="w-full h-[200px] bg-[#F8F9FA] rounded-lg border border-[#E9ECEF] flex items-center justify-center">
          <div className="text-center">
            <Navigation size={24} className="text-[#ADB5BD] mx-auto mb-2" />
            <p className="text-sm text-[#ADB5BD]">Map location not available</p>
          </div>
        </div>
      )}

      <div className="mt-3">
        <Link
          href={`/search?city=${encodeURIComponent(city)}${neighborhood ? `&neighborhood=${encodeURIComponent(neighborhood)}` : ''}`}
          className="text-xs font-medium text-[#212529] underline hover:no-underline"
        >
          See more homes in {neighborhood || city}
        </Link>
      </div>
    </div>
  )
}
