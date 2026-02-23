'use client'

import { useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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
  lat: number
  lng: number
  property_images: Array<{ id?: string; url: string; is_primary: boolean; alt_text?: string | null }>
}

interface MapViewProps {
  properties: Property[]
  selectedProperty: string | null
  onPropertySelect: (id: string | null) => void
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void
}

function formatMarkerPrice(cents: number, isSale: boolean): string {
  const dollars = cents / 100
  if (isSale) {
    if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`
    if (dollars >= 1_000) return `$${Math.round(dollars / 1_000)}K`
  }
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(1)}K`
  return `$${Math.round(dollars)}`
}

export default function MapView({ properties, selectedProperty, onPropertySelect, onBoundsChange }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<{ [key: string]: L.Marker }>({})

  const emitBounds = useCallback(() => {
    if (!mapRef.current || !onBoundsChange) return
    const bounds = mapRef.current.getBounds()
    onBoundsChange({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    })
  }, [onBoundsChange])

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: [-17.8252, 31.0335],
      zoom: 12,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map

    map.on('moveend', emitBounds)

    return () => {
      if (mapRef.current) {
        mapRef.current.off('moveend', emitBounds)
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [emitBounds])

  // Update markers when properties change
  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current

    // Remove old markers
    Object.values(markersRef.current).forEach((m) => m.remove())
    markersRef.current = {}

    if (properties.length === 0) return

    properties.forEach((property) => {
      const isSelected = property.id === selectedProperty
      const isSale = property.listing_type === 'sale'
      const price = isSale ? (property.sale_price || 0) : (property.price || 0)
      const priceLabel = formatMarkerPrice(price, isSale)

      const icon = L.divIcon({
        className: 'price-marker',
        html: `<div class="pm ${isSelected ? 'pm-active' : ''}">${priceLabel}</div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      })

      const marker = L.marker([property.lat, property.lng], { icon }).addTo(map)

      // Popup
      const primaryImage = property.property_images.find(img => img.is_primary) || property.property_images[0]
      const imageUrl = primaryImage?.url || ''
      const formattedPrice = `$${(price / 100).toLocaleString()}`
      marker.bindPopup(`
        <div class="p-2 min-w-[220px]">
          ${imageUrl ? `<img src="${imageUrl}" alt="${property.title}" class="w-full h-28 object-cover rounded-md mb-2" />` : ''}
          <div class="font-bold text-[#212529] mb-0.5">${formattedPrice}${!isSale ? '/mo' : ''}</div>
          <div class="font-semibold text-sm text-[#212529] mb-0.5 line-clamp-1">${property.title}</div>
          <div class="text-xs text-[#495057] mb-2">${property.neighborhood ? property.neighborhood + ', ' : ''}${property.city}</div>
          <div class="flex gap-3 text-xs text-[#495057] mb-2">
            <span>${property.beds} bd</span>
            <span>${property.baths} ba</span>
            ${property.sqft ? `<span>${property.sqft} sqft</span>` : ''}
          </div>
          <a href="/property/${property.slug || property.id}" class="block text-center bg-[#212529] text-white py-1.5 rounded-md text-xs font-medium hover:bg-black transition-colors">View</a>
        </div>
      `, { maxWidth: 260, className: 'custom-popup' })

      marker.on('click', () => onPropertySelect(property.id))
      if (isSelected) marker.openPopup()

      markersRef.current[property.id] = marker
    })

    // Fit bounds
    if (properties.length > 0) {
      const bounds = L.latLngBounds(properties.map((p) => [p.lat, p.lng]))
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
    }
  }, [properties, selectedProperty, onPropertySelect])

  return (
    <>
      <div ref={mapContainerRef} className="h-full w-full" />
      <style jsx global>{`
        .price-marker { background: transparent; border: none; }
        .pm {
          background: #fff;
          color: #212529;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 8px;
          border: 1.5px solid #E9ECEF;
          white-space: nowrap;
          box-shadow: 0 1px 4px rgba(0,0,0,0.12);
          cursor: pointer;
          transition: all 0.15s;
          transform: translate(-50%, -100%);
        }
        .pm:hover, .pm-active {
          background: #212529;
          color: #fff;
          border-color: #212529;
          z-index: 1000 !important;
          transform: translate(-50%, -100%) scale(1.1);
        }
        .leaflet-popup-content-wrapper { padding: 0; border-radius: 10px; overflow: hidden; }
        .leaflet-popup-content { margin: 0; width: auto !important; }
        .leaflet-popup-tip-container { display: none; }
        .leaflet-container { font-family: inherit; }
      `}</style>
    </>
  )
}
