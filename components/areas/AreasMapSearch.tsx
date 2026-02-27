'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Search, MapPin, Loader2, Navigation, X, ChevronLeft, ChevronRight } from 'lucide-react'

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
const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
)
const Polygon = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polygon),
  { ssr: false }
)

interface SearchResult {
  display_name: string
  lat: string
  lon: string
  boundingbox: [string, string, string, string]
  type: string
}

interface Property {
  id: string
  slug: string
  title: string
  price: number
  sale_price: number | null
  listing_type: string
  beds: number
  baths: number
  lat: number
  lng: number
  city: string
  neighborhood: string | null
  property_images: { url: string }[]
}

// Zimbabwe major cities with approximate boundaries
const ZIMBABWE_CITIES = {
  'Harare': {
    center: [-17.8292, 31.0522] as [number, number],
    bounds: [
      [-17.7, 30.95],
      [-17.7, 31.15],
      [-17.95, 31.15],
      [-17.95, 30.95],
    ] as [number, number][],
  },
  'Bulawayo': {
    center: [-20.1487, 28.5783] as [number, number],
    bounds: [
      [-20.05, 28.48],
      [-20.05, 28.68],
      [-20.25, 28.68],
      [-20.25, 28.48],
    ] as [number, number][],
  },
  'Chitungwiza': {
    center: [-18.0133, 31.0717] as [number, number],
    bounds: [
      [-17.95, 31.0],
      [-17.95, 31.15],
      [-18.08, 31.15],
      [-18.08, 31.0],
    ] as [number, number][],
  },
  'Mutare': {
    center: [-18.9707, 32.6699] as [number, number],
    bounds: [
      [-18.9, 32.6],
      [-18.9, 32.75],
      [-19.05, 32.75],
      [-19.05, 32.6],
    ] as [number, number][],
  },
}

// Import useMap for the MapController
let useMapHook: any = null
if (typeof window !== 'undefined') {
  import('react-leaflet').then(mod => {
    useMapHook = mod.useMap
  })
}

// Map Controller Component - Updates map center/zoom
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const [map, setMap] = useState<any>(null)
  
  useEffect(() => {
    if (typeof window !== 'undefined' && !map) {
      import('react-leaflet').then(mod => {
        // Get map instance from event listener
        const handleMapReady = (e: any) => {
          setMap(e.target)
        }
        // We'll set map via useMapEvents instead
      })
    }
  }, [map])
  
  useEffect(() => {
    if (map && center && zoom) {
      map.flyTo(center, zoom, { duration: 1.5 })
    }
  }, [center, zoom, map])
  
  // Use a custom approach to get map instance
  useEffect(() => {
    const mapElement = document.querySelector('.leaflet-container') as any
    if (mapElement && mapElement._leaflet_map) {
      setMap(mapElement._leaflet_map)
    }
  }, [])
  
  return null
}

export default function AreasMapSearch({ 
  properties = []
}: { 
  properties?: Property[] 
}) {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([-19.0, 29.5])
  const [mapZoom, setMapZoom] = useState(7)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locating, setLocating] = useState(false)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [nearbyProperties, setNearbyProperties] = useState<Property[]>([])
  const [showMap, setShowMap] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

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
  }, [])

  // Geocode search using Nominatim (OpenStreetMap)
  const performSearch = async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&q=${encodeURIComponent(query + ', Zimbabwe')}&limit=5&` +
        `countrycodes=zw&addressdetails=1`
      )
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  // Debounced search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value)
    }, 500)
  }

  // Select search result
  const selectSearchResult = (result: SearchResult) => {
    setSelectedResult(result)
    setSearchResults([])
    setSearchQuery(result.display_name)
    setShowMap(true)
    
    const lat = parseFloat(result.lat)
    const lon = parseFloat(result.lon)
    setMapCenter([lat, lon])
    setMapZoom(13)
    
    // Filter properties near this location (within ~5km)
    if (properties.length > 0) {
      const nearby = properties.filter(prop => {
        if (!prop.lat || !prop.lng) return false
        const distance = calculateDistance(lat, lon, prop.lat, prop.lng)
        return distance < 5 // within 5km
      })
      setNearbyProperties(nearby)
    }
  }

  // Get user's live location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation([latitude, longitude])
        setMapCenter([latitude, longitude])
        setMapZoom(14)
        setShowMap(true)
        setSearchQuery('Your current location')
        setLocating(false)
        
        // Find nearby properties
        if (properties.length > 0) {
          const nearby = properties.filter(prop => {
            if (!prop.lat || !prop.lng) return false
            const distance = calculateDistance(latitude, longitude, prop.lat, prop.lng)
            return distance < 3 // within 3km
          })
          setNearbyProperties(nearby)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        alert('Unable to get your location. Please check your browser permissions.')
        setLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  // Select city
  const selectCity = (cityName: string) => {
    const city = ZIMBABWE_CITIES[cityName as keyof typeof ZIMBABWE_CITIES]
    if (city) {
      setSelectedCity(cityName)
      setMapCenter(city.center)
      setMapZoom(12)
      setShowMap(true)
      setSearchQuery(cityName)
      
      // Filter properties in this city
      if (properties.length > 0) {
        const cityProps = properties.filter(prop => 
          prop.city?.toLowerCase() === cityName.toLowerCase()
        )
        setNearbyProperties(cityProps)
      }
    }
  }

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const formatPrice = (price: number, isSale: boolean = false) => {
    const amount = price / 100
    return isSale 
      ? `$${amount.toLocaleString()}` 
      : `$${amount.toLocaleString()}/mo`
  }

  return (
    <div className="space-y-6">
      {/* Search Bar with Live Location */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ADB5BD]" size={20} />
          <input
            type="text"
            placeholder="Search by city, neighborhood, or address..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-24 py-3.5 border-2 border-[#E9ECEF] rounded-lg text-[#212529] placeholder:text-[#ADB5BD] focus:outline-none focus:border-[#212529] transition-all"
          />
          <button
            onClick={getUserLocation}
            disabled={locating}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-[#212529] text-white px-4 py-2 rounded-lg hover:bg-black transition-colors disabled:opacity-50"
            title="Use my location"
          >
            {locating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Navigation size={16} />
            )}
            <span className="text-sm font-medium">Near me</span>
          </button>
          
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('')
                setSearchResults([])
                setSelectedResult(null)
                setShowMap(false)
                setNearbyProperties([])
              }}
              className="absolute right-28 top-1/2 -translate-y-1/2 text-[#ADB5BD] hover:text-[#212529]"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute z-30 w-full max-w-2xl mt-2 bg-white border-2 border-[#212529] rounded-lg shadow-xl max-h-80 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => selectSearchResult(result)}
                className="w-full px-4 py-3 text-left hover:bg-[#F8F9FA] border-b border-[#E9ECEF] last:border-0 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-[#212529] flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-[#212529]">{result.display_name}</p>
                    <p className="text-xs text-[#ADB5BD] mt-0.5">{result.type}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {searching && (
          <div className="absolute z-30 w-full max-w-2xl mt-2 bg-white border border-[#E9ECEF] rounded-lg shadow-lg px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-[#495057]">
              <Loader2 size={16} className="animate-spin" />
              Searching...
            </div>
          </div>
        )}
      </div>

      {/* Quick City Buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        {Object.keys(ZIMBABWE_CITIES).map((cityName) => (
          <button
            key={cityName}
            onClick={() => selectCity(cityName)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              selectedCity === cityName
                ? 'bg-[#212529] text-white'
                : 'bg-white border border-[#E9ECEF] text-[#495057] hover:border-[#212529] hover:text-[#212529]'
            }`}
          >
            <MapPin size={14} className="inline-block mr-1.5" />
            {cityName}
          </button>
        ))}
      </div>

      {/* Map Container */}
      {mounted && showMap && (
        <div className="w-full">
          <div className="bg-white border border-[#E9ECEF] rounded-lg overflow-hidden shadow-lg">
            <div className="bg-[#F8F9FA] border-b border-[#E9ECEF] px-4 py-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#212529]">Map View</h3>
                <p className="text-xs text-[#495057]">
                  {nearbyProperties.length > 0 
                    ? `${nearbyProperties.length} properties found nearby`
                    : 'Search for a location to see nearby properties'
                  }
                </p>
              </div>
              <button
                onClick={() => setShowMap(false)}
                className="text-[#495057] hover:text-[#212529] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ height: '500px', width: '100%' }}>
              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <MapController center={mapCenter} zoom={mapZoom} />
                
                {/* City Boundaries */}
                {selectedCity && ZIMBABWE_CITIES[selectedCity as keyof typeof ZIMBABWE_CITIES] && (
                  <Polygon
                    positions={ZIMBABWE_CITIES[selectedCity as keyof typeof ZIMBABWE_CITIES].bounds}
                    pathOptions={{
                      color: '#212529',
                      weight: 3,
                      fillColor: '#212529',
                      fillOpacity: 0.1,
                      dashArray: '10, 10'
                    }}
                  />
                )}
                
                {/* User Location Circle */}
                {userLocation && (
                  <Circle
                    center={userLocation}
                    radius={3000} // 3km radius
                    pathOptions={{
                      color: '#007bff',
                      weight: 2,
                      fillColor: '#007bff',
                      fillOpacity: 0.1
                    }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-bold">Your Location</p>
                        <p className="text-xs text-[#495057]">
                          Showing properties within 3km
                        </p>
                      </div>
                    </Popup>
                  </Circle>
                )}
                
                {/* Search Result Marker */}
                {selectedResult && (
                  <Marker position={[parseFloat(selectedResult.lat), parseFloat(selectedResult.lon)]}>
                    <Popup>
                      <div className="text-sm">
                        <p className="font-bold">{selectedResult.display_name}</p>
                        <p className="text-xs text-[#495057]">{selectedResult.type}</p>
                      </div>
                    </Popup>
                  </Marker>
                )}
                
                {/* Property Markers */}
                {nearbyProperties.map((property) => (
                  property.lat && property.lng && (
                    <Marker key={property.id} position={[property.lat, property.lng]}>
                      <Popup>
                        <div className="min-w-[250px]">
                          {property.property_images?.[0] && (
                            <img 
                              src={property.property_images[0].url} 
                              alt={property.title}
                              className="w-full h-32 object-cover rounded-lg mb-2"
                            />
                          )}
                          <p className="font-bold text-sm mb-1">{property.title}</p>
                          <p className="text-lg font-bold text-[#212529] mb-2">
                            {formatPrice(
                              property.listing_type === 'sale' ? property.sale_price || 0 : property.price,
                              property.listing_type === 'sale'
                            )}
                          </p>
                          <p className="text-xs text-[#495057] mb-2">
                            {property.beds} bed • {property.baths} bath
                          </p>
                          <a
                            href={`/property/${property.slug || property.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-[#212529] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-black transition-colors"
                          >
                            View Details
                          </a>
                        </div>
                      </Popup>
                    </Marker>
                  )
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Nearby Properties List */}
          {nearbyProperties.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-[#212529] mb-4">
                {userLocation ? 'Properties Near You' : 'Properties in this Area'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nearbyProperties.slice(0, 6).map((property) => (
                  <a
                    key={property.id}
                    href={`/property/${property.slug || property.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white border border-[#E9ECEF] rounded-lg overflow-hidden hover:border-[#495057] transition-colors"
                  >
                    {property.property_images?.[0] && (
                      <img
                        src={property.property_images[0].url}
                        alt={property.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <p className="text-lg font-bold text-[#212529] mb-1">
                        {formatPrice(
                          property.listing_type === 'sale' ? property.sale_price || 0 : property.price,
                          property.listing_type === 'sale'
                        )}
                      </p>
                      <p className="text-sm text-[#495057] mb-2 line-clamp-1">
                        {property.title}
                      </p>
                      <p className="text-xs text-[#ADB5BD]">
                        {property.beds} bed • {property.baths} bath
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
