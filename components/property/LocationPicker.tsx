'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapPin, Search, Loader2, X, Navigation } from 'lucide-react'
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
const useMapEvents = dynamic(
  () => import('react-leaflet').then((mod) => mod.useMapEvents as any),
  { ssr: false }
) as any

interface LocationPickerProps {
  lat?: number
  lng?: number
  onLocationChange: (lat: number, lng: number, address?: string) => void
  className?: string
}

// Click handler component
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  const MapEventsComponent = require('react-leaflet').useMapEvents
  
  MapEventsComponent({
    click: (e: any) => {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  
  return null
}

export default function LocationPicker({ lat, lng, onLocationChange, className }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    lat && lng ? [lat, lng] : null
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isLocating, setIsLocating] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Fix Leaflet default icon issue
    if (typeof window !== 'undefined') {
      const L = require('leaflet')
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })
    }
  }, [])

  const handleMapClick = useCallback((clickLat: number, clickLng: number) => {
    setPosition([clickLat, clickLng])
    onLocationChange(clickLat, clickLng)
    // Reverse geocode to get address
    reverseGeocode(clickLat, clickLng)
  }, [onLocationChange])

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      )
      const data = await response.json()
      if (data.display_name) {
        onLocationChange(lat, lng, data.display_name)
      }
    } catch (error) {
      console.error('Reverse geocode error:', error)
    }
  }

  const searchLocation = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      )
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const selectSearchResult = (result: any) => {
    const newLat = parseFloat(result.lat)
    const newLng = parseFloat(result.lon)
    setPosition([newLat, newLng])
    onLocationChange(newLat, newLng, result.display_name)
    setSearchResults([])
    setSearchQuery(result.display_name.split(',')[0])
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setPosition([latitude, longitude])
        onLocationChange(latitude, longitude)
        reverseGeocode(latitude, longitude)
        setIsLocating(false)
      },
      (error) => {
        console.error('Geolocation error:', error)
        setIsLocating(false)
        alert('Unable to get your location')
      },
      { enableHighAccuracy: true }
    )
  }

  if (!mounted) {
    return (
      <div className={`bg-[#F8F9FA] rounded-xl h-[400px] flex items-center justify-center ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-[#ADB5BD]" />
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#ADB5BD]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchLocation()}
            placeholder="Search for an address..."
            className="w-full pl-10 pr-4 py-3 border-2 border-[#E9ECEF] rounded-xl focus:border-[#212529] focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('')
                setSearchResults([])
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ADB5BD] hover:text-[#495057]"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={searchLocation}
          disabled={isSearching}
          className="px-5 py-3 bg-[#212529] text-white rounded-xl hover:bg-black transition-colors disabled:opacity-50"
        >
          {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Search'}
        </button>
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={isLocating}
          className="px-4 py-3 border-2 border-[#E9ECEF] rounded-xl hover:border-[#212529] transition-colors"
          title="Use my location"
        >
          {isLocating ? (
            <Loader2 className="h-5 w-5 animate-spin text-[#495057]" />
          ) : (
            <Navigation className="h-5 w-5 text-[#495057]" />
          )}
        </button>
      </div>

      {/* Search Results Dropdown */}
      {searchResults.length > 0 && (
        <div className="bg-white border border-[#E9ECEF] rounded-xl shadow-lg overflow-hidden z-50 relative">
          {searchResults.map((result, index) => (
            <button
              key={index}
              type="button"
              onClick={() => selectSearchResult(result)}
              className="w-full px-4 py-3 text-left hover:bg-[#F8F9FA] transition-colors border-b border-[#E9ECEF] last:border-b-0"
            >
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#495057] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[#212529]">
                    {result.display_name.split(',')[0]}
                  </p>
                  <p className="text-xs text-[#ADB5BD] line-clamp-1">
                    {result.display_name}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Map */}
      <div className="relative rounded-xl overflow-hidden border-2 border-[#E9ECEF]">
        <MapContainer
          center={position || [-17.8292, 31.0522]} // Default to Harare
          zoom={position ? 15 : 12}
          style={{ height: '400px', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {position && <Marker position={position} />}
          <MapClickHandler onMapClick={handleMapClick} />
        </MapContainer>

        {/* Instructions overlay */}
        {!position && (
          <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <p className="text-sm text-[#495057] flex items-center gap-2">
              <MapPin size={16} className="text-[#212529]" />
              Click on the map to set property location
            </p>
          </div>
        )}
      </div>

      {/* Selected Location */}
      {position && (
        <div className="bg-[#F8F9FA] rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#F8F9FA] border border-[#E9ECEF] flex items-center justify-center">
              <MapPin className="h-5 w-5 text-[#212529]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#212529]">Location Selected</p>
              <p className="text-xs text-[#ADB5BD]">
                {position[0].toFixed(6)}, {position[1].toFixed(6)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setPosition(null)
              onLocationChange(0, 0, '')
            }}
            className="text-sm text-[#FF6B6B] hover:text-red-600 font-medium"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  )
}
