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
    if (dollars >= 100_000) return `$${Math.round(dollars / 1_000)}K`
    if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(0)}K`
    return `$${Math.round(dollars)}`
  }
  // For rent
  if (dollars >= 10_000) return `$${(dollars / 1_000).toFixed(1)}K`
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(1)}K`
  return `$${Math.round(dollars)}`
}

export default function MapView({ properties, selectedProperty, onPropertySelect, onBoundsChange }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<{ [key: string]: L.Marker }>({})
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null)
  const [showZoomHint, setShowZoomHint] = useState(false)
  const hasFittedBoundsRef = useRef(false)
  const isUserInteractingRef = useRef(false)
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

    // Zoom hint
    const checkZoom = () => setShowZoomHint(map.getZoom() < 10)
    checkZoom()
    map.on('zoomend', checkZoom)

    // Track user interaction vs programmatic moves
    map.on('mousedown', () => { isUserInteractingRef.current = true })
    map.on('touchstart', () => { isUserInteractingRef.current = true })
    map.on('dragstart', () => { isUserInteractingRef.current = true })

    const emitBounds = () => {
      const cb = onBoundsChangeRef.current
      if (!cb) return
      const bounds = map.getBounds()
      cb({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      })
    }

    // Emit bounds after every user-initiated move/zoom
    let boundsTimer: ReturnType<typeof setTimeout>
    map.on('moveend', () => {
      clearTimeout(boundsTimer)
      if (isUserInteractingRef.current) {
        boundsTimer = setTimeout(() => {
          emitBounds()
          isUserInteractingRef.current = false
        }, 150)
      }
    })

    return () => {
      clearTimeout(boundsTimer)
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
        html: `<div class="pm ${isSelected ? 'pm-active' : ''} ${isSale ? 'pm-sale' : 'pm-rent'}">${priceLabel}</div>`,
        iconSize: [80, 36],
        iconAnchor: [40, 36],
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

    // Only fit bounds on first load — don't fight with user panning
    if (!hasFittedBoundsRef.current && properties.length > 0) {
      const bounds = L.latLngBounds(properties.map((p) => [p.lat, p.lng]))
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
      hasFittedBoundsRef.current = true
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
        /* Price markers */
        .price-marker { 
          background: transparent !important; 
          border: none !important;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          overflow: visible;
        }
        .pm {
          background: #fff;
          color: #212529;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 8px;
          border: 2px solid #212529;
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(33, 37, 41, 0.18);
          cursor: pointer;
          transition: all 0.15s ease;
          position: relative;
          line-height: 1;
        }
        .pm::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 5px solid #212529;
        }
        .pm:hover {
          background: #212529;
          color: #fff;
          z-index: 1000 !important;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(33, 37, 41, 0.25);
        }
        .pm:hover::after {
          border-top-color: #212529;
        }
        .pm-active {
          background: #212529;
          color: #fff;
          z-index: 1001 !important;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(33, 37, 41, 0.3);
        }
        .pm-active::after {
          border-top-color: #212529;
        }
        .pm-sale {
          border-color: #0066FF;
        }
        .pm-sale::after {
          border-top-color: #0066FF;
        }
        .pm-sale:hover,
        .pm-sale.pm-active {
          background: #0066FF;
          border-color: #0052CC;
        }
        .pm-sale:hover::after,
        .pm-sale.pm-active::after {
          border-top-color: #0052CC;
        }
        
        /* Cluster markers */
        .custom-cluster-icon { 
          background: transparent; 
          border: none;
        }
        .cluster-marker {
          background: linear-gradient(135deg, #212529 0%, #495057 100%);
          border: 3px solid #fff;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 800;
          color: #fff;
          box-shadow: 0 3px 12px rgba(33, 37, 41, 0.25), 0 1px 4px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cluster-marker:hover {
          transform: scale(1.2);
          box-shadow: 0 5px 20px rgba(33, 37, 41, 0.35), 0 2px 8px rgba(0, 0, 0, 0.2);
          border-width: 3.5px;
        }
        .cluster-small { 
          width: 36px; 
          height: 36px; 
          font-size: 12px;
          border-width: 2.5px;
        }
        .cluster-medium { 
          width: 48px; 
          height: 48px; 
          font-size: 15px;
        }
        .cluster-large { 
          width: 56px; 
          height: 56px; 
          font-size: 17px;
          border-width: 3.5px;
        }
        
        /* Popup styling */
        .leaflet-popup-content-wrapper { 
          padding: 0; 
          border-radius: 12px; 
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1);
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
        .leaflet-popup-close-button {
          color: #495057 !important;
          font-size: 20px !important;
          padding: 8px 10px !important;
        }
        .leaflet-popup-close-button:hover {
          color: #212529 !important;
        }
      `}</style>
    </>
  )
}
