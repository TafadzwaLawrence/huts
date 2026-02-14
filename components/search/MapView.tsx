'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in Leaflet
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

interface Property {
  id: string
  title: string
  slug: string
  listing_type: 'rent' | 'sale' | null
  price: number | null
  sale_price: number | null
  beds: number
  baths: number
  sqft: number | null
  city: string
  neighborhood: string | null
  property_type: string | null
  lat: number
  lng: number
  property_images: Array<{ url: string; is_primary: boolean; alt_text?: string }>
}

interface MapViewProps {
  properties: Property[]
  selectedProperty: string | null
  onPropertySelect: (id: string | null) => void
}

export default function MapView({ properties, selectedProperty, onPropertySelect }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<{ [key: string]: L.Marker }>({})

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Create map centered on Harare, Zimbabwe
    const map = L.map(mapContainerRef.current, {
      center: [-17.8252, 31.0335],
      zoom: 12,
      zoomControl: true,
    })

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Update markers when properties change
  useEffect(() => {
    if (!mapRef.current) return

    const map = mapRef.current

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove())
    markersRef.current = {}

    if (properties.length === 0) return

    // Create custom icon for property markers
    const createCustomIcon = (isSelected: boolean) =>
      L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="relative">
            <div class="${
              isSelected ? 'bg-[#212529]' : 'bg-white'
            } border-2 border-[#212529] rounded-full w-10 h-10 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${
                isSelected ? '#FFFFFF' : '#212529'
              }" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      })

    // Add markers for each property
    properties.forEach((property) => {
      const isSelected = property.id === selectedProperty
      const primaryImage = property.property_images.find(img => img.is_primary) || property.property_images[0]
      const imageUrl = primaryImage?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop'

      const marker = L.marker([property.lat, property.lng], {
        icon: createCustomIcon(isSelected),
      }).addTo(map)

      // Determine listing type and format price
      const listingType = property.listing_type || 'rent'
      const isForSale = listingType === 'sale'
      const price = isForSale && property.sale_price
        ? property.sale_price
        : property.price || property.sale_price || 0
      const formattedPrice = `$${(price / 100).toLocaleString()}`

      // Create popup content
      const popupContent = `
        <div class="p-2 min-w-[250px]">
          <img 
            src="${imageUrl}" 
            alt="${property.title}"
            class="w-full h-32 object-cover rounded-md mb-2"
          />
          <div class="mb-1">
            <span class="font-bold text-[#212529]">${formattedPrice}</span>
            <span class="text-xs text-[#495057]">${isForSale ? '' : '/mo'}</span>
            ${isForSale ? '<span class="ml-2 text-xs font-semibold bg-white text-black px-2 py-0.5 rounded border border-[#E9ECEF]">FOR SALE</span>' : ''}
          </div>
          <h4 class="font-semibold text-sm text-[#212529] mb-1">${property.title}</h4>
          <p class="text-xs text-[#495057] mb-2">${property.neighborhood ? property.neighborhood + ', ' : ''}${property.city}</p>
          <div class="flex gap-3 text-xs text-[#495057] mb-3">
            <span>${property.beds} bed</span>
            <span>${property.baths} bath</span>
            ${property.sqft ? `<span>${property.sqft} sqft</span>` : ''}
          </div>
          <a 
            href="/property/${property.slug || property.id}"
            class="block w-full text-center bg-[#212529] text-white py-2 rounded-md text-sm font-medium hover:bg-black transition-colors"
          >
            View Details
          </a>
        </div>
      `

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup',
      })

      // Handle marker click
      marker.on('click', () => {
        onPropertySelect(property.id)
      })

      // Auto-open popup for selected property
      if (isSelected) {
        marker.openPopup()
      }

      markersRef.current[property.id] = marker
    })

    // Fit map bounds to show all properties
    if (properties.length > 0) {
      const bounds = L.latLngBounds(properties.map((p) => [p.lat, p.lng]))
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [properties, selectedProperty, onPropertySelect])

  return (
    <>
      <div ref={mapContainerRef} className="h-full w-full" />
      <style jsx global>{`
        .custom-marker {
          background: transparent;
          border: none;
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
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
    </>
  )
}
