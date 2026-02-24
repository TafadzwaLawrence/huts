'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'

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
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null)
  const [showZoomHint, setShowZoomHint] = useState(false)
  // Store callbacks in refs so the map init effect never re-runs
  const onBoundsChangeRef = useRef(onBoundsChange)
  onBoundsChangeRef.current = onBoundsChange
  const onPropertySelectRef = useRef(onPropertySelect)
  onPropertySelectRef.current = onPropertySelect

  // Initialize map — runs once, never re-creates
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

    // Initialize cluster group
    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 16,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount()
        const size = count < 10 ? 'small' : count < 50 ? 'medium' : 'large'
        return L.divIcon({
          html: `<div class="cluster-marker cluster-${size}"><span>${count}</span></div>`,
          className: 'custom-cluster-icon',
          iconSize: L.point(40, 40),
        })
      },
    })
    map.addLayer(clusterGroup)
    clusterGroupRef.current = clusterGroup

    mapRef.current = map

    // Check zoom level for hint
    const checkZoom = () => {
      setShowZoomHint(map.getZoom() < 10)
    }
    checkZoom()
    map.on('zoomend', checkZoom)

    map.on('moveend', () => {
      const cb = onBoundsChangeRef.current
      if (!cb) return
      const bounds = map.getBounds()
      cb({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      })
    })

    return () => {
      map.off()
      map.remove()
      mapRef.current = null
      clusterGroupRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update markers when properties change
  useEffect(() => {
    if (!mapRef.current || !clusterGroupRef.current) return
    const map = mapRef.current
    const clusterGroup = clusterGroupRef.current

    // Clear cluster group
    clusterGroup.clearLayers()
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

      const marker = L.marker([property.lat, property.lng], { icon })

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

      marker.on('click', () => onPropertySelectRef.current(property.id))
      if (isSelected) marker.openPopup()

      // Add to cluster group instead of directly to map
      clusterGroup.addLayer(marker)
      markersRef.current[property.id] = marker
    })

    // Fit bounds
    if (properties.length > 0) {
      const bounds = L.latLngBounds(properties.map((p) => [p.lat, p.lng]))
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
    }
  }, [properties, selectedProperty])

  return (
    <>
      <div ref={mapContainerRef} className="h-full w-full" />
      
      {/* Zoom hint overlay */}
      {showZoomHint && properties.length > 100 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg border border-[#E9ECEF] text-center pointer-events-none z-[400]">
          <p className="text-sm font-semibold text-[#212529]">Zoom in to see homes</p>
          <p className="text-xs text-[#495057] mt-1">Or adjust your filters</p>
        </div>
      )}

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
        
        /* Cluster markers */
        .custom-cluster-icon { background: transparent; border: none; }
        .cluster-marker {
          background: #fff;
          border: 2px solid #212529;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          color: #212529;
          box-shadow: 0 2px 8px rgba(0,0,0,0.18);
          cursor: pointer;
          transition: all 0.2s;
        }
        .cluster-marker:hover {
          transform: scale(1.15);
          box-shadow: 0 3px 12px rgba(0,0,0,0.25);
        }
        .cluster-small { width: 36px; height: 36px; font-size: 12px; }
        .cluster-medium { width: 44px; height: 44px; font-size: 14px; }
        .cluster-large { width: 52px; height: 52px; font-size: 15px; border-width: 2.5px; }
        
        .leaflet-popup-content-wrapper { padding: 0; border-radius: 10px; overflow: hidden; }
        .leaflet-popup-content { margin: 0; width: auto !important; }
        .leaflet-popup-tip-container { display: none; }
        .leaflet-container { font-family: inherit; }
      `}</style>
    </>
  )
}
