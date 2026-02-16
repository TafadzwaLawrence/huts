'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Search, Loader2, X, Navigation } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons — module level, same as MapView
const DefaultIcon = L.icon({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

interface LocationPickerProps {
  lat?: number
  lng?: number
  onLocationChange: (lat: number, lng: number, address?: string) => void
  className?: string
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

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)

  // Initialize map — synchronous, no dynamic imports
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const initialCenter: L.LatLngExpression = lat && lng ? [lat, lng] : [-17.8292, 31.0522]
    const initialZoom = lat && lng ? 15 : 12

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    // Add initial marker if position exists
    if (lat && lng) {
      markerRef.current = L.marker([lat, lng]).addTo(map)
    }

    // Click handler
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat: clickLat, lng: clickLng } = e.latlng
      placeMarker(map, clickLat, clickLng)
      setPosition([clickLat, clickLng])
      onLocationChange(clickLat, clickLng)
      reverseGeocode(clickLat, clickLng)
    })

    mapRef.current = map
    setMounted(true)

    // Ensure tiles render fully after mount
    setTimeout(() => map.invalidateSize(), 200)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const placeMarker = (map: L.Map, newLat: number, newLng: number) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([newLat, newLng])
    } else {
      markerRef.current = L.marker([newLat, newLng]).addTo(map)
    }
    map.flyTo([newLat, newLng], 16, { duration: 0.8 })
  }

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

    if (mapRef.current) {
      placeMarker(mapRef.current, newLat, newLng)
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setPosition([latitude, longitude])
        onLocationChange(latitude, longitude)
        reverseGeocode(latitude, longitude)

        if (mapRef.current) {
          placeMarker(mapRef.current, latitude, longitude)
        }
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

  const clearPosition = () => {
    setPosition(null)
    onLocationChange(0, 0, '')
    if (markerRef.current && mapRef.current) {
      mapRef.current.removeLayer(markerRef.current)
      markerRef.current = null
      mapRef.current.flyTo([-17.8292, 31.0522], 12, { duration: 0.8 })
    }
  }

  return (
    <>
      <div className={`space-y-3 ${className || ''}`}>
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#ADB5BD]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchLocation()}
              placeholder="Search for an address..."
              className="w-full pl-9 pr-8 py-3 border-2 border-[#E9ECEF] rounded-xl text-[#212529] bg-white placeholder:text-[#ADB5BD] focus:border-[#212529] focus:outline-none transition-colors text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setSearchResults([])
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ADB5BD] hover:text-[#495057]"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={searchLocation}
            disabled={isSearching}
            className="px-4 py-3 bg-[#212529] text-white rounded-xl hover:bg-black transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </button>
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isLocating}
            className="px-3 py-3 border-2 border-[#E9ECEF] rounded-xl hover:border-[#212529] transition-colors"
            title="Use my location"
          >
            {isLocating ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#495057]" />
            ) : (
              <Navigation className="h-4 w-4 text-[#495057]" />
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
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-[#495057] mt-0.5 shrink-0" />
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
          <div
            ref={mapContainerRef}
            style={{ height: '400px', width: '100%' }}
            className="z-0 bg-[#F8F9FA]"
          />

          {/* Loading overlay before map mounts */}
          {!mounted && (
            <div className="absolute inset-0 bg-[#F8F9FA] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#ADB5BD]" />
            </div>
          )}

          {/* Instructions overlay */}
          {mounted && !position && (
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg z-[1000]">
              <p className="text-sm text-[#212529] flex items-center gap-2 font-medium">
                <MapPin size={15} className="text-[#495057]" />
                Click anywhere on the map to set location
              </p>
            </div>
          )}
        </div>

        {/* Selected Location */}
        {position && (
          <div className="bg-[#F8F9FA] rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-white border border-[#E9ECEF] flex items-center justify-center">
                <MapPin className="h-4 w-4 text-[#212529]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#212529]">Location Selected</p>
                <p className="text-xs text-[#ADB5BD] tabular-nums">
                  {position[0].toFixed(6)}, {position[1].toFixed(6)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearPosition}
              className="text-xs text-[#FF6B6B] hover:text-red-600 font-semibold"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Global Leaflet styles — matches MapView */}
      <style jsx global>{`
        .leaflet-container {
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 8px;
          overflow: hidden;
        }
        .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
        .leaflet-popup-tip-container {
          display: none;
        }
      `}</style>
    </>
  )
}
