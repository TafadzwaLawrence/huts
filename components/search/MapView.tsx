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
  schools?: any[]
  selectedProperty: string | null
  onPropertySelect: (id: string | null) => void
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void
  showSchools: boolean
  schoolLevels: string
  onSchoolFilterChange: (showSchools: boolean, schoolLevels: string) => void
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

export default function MapView({ properties, schools = [], selectedProperty, onPropertySelect, onBoundsChange, showSchools, schoolLevels, onSchoolFilterChange }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<{ [key: string]: L.Marker }>({})
  const schoolMarkersRef = useRef<{ [key: string]: L.Marker }>({})
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null)
  const [showZoomHint, setShowZoomHint] = useState(false)
  const [schoolsControlExpanded, setSchoolsControlExpanded] = useState(showSchools)
  const [isLoadingSchools, setIsLoadingSchools] = useState(false)
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

  // Update school markers when schools change
  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current

    // Clear previous school markers
    Object.values(schoolMarkersRef.current).forEach(marker => marker.remove())
    schoolMarkersRef.current = {}

    if (!schools || schools.length === 0) {
      setIsLoadingSchools(false)
      return
    }

    // Show loading state
    setIsLoadingSchools(true)

    // Use requestAnimationFrame to allow UI to update before rendering markers
    requestAnimationFrame(() => {
      schools.forEach((school) => {
      // School icon colors based on level
      const iconColors: Record<string, { bg: string; border: string; icon: string }> = {
        primary: { bg: '#3B82F6', border: '#1E40AF', icon: '🏫' }, // Blue
        secondary: { bg: '#10B981', border: '#047857', icon: '🎓' }, // Green
        tertiary: { bg: '#8B5CF6', border: '#5B21B6', icon: '🎓' }, // Purple
        combined: { bg: '#F59E0B', border: '#B45309', icon: '🏫' }, // Amber
      }

      const colors = iconColors[school.school_level] || iconColors.primary

      const icon = L.divIcon({
        className: 'school-marker',
        html: `
          <div class="sm sm-${school.school_level}" style="background: ${colors.bg}; border-color: ${colors.border};">
            <span class="sm-icon">${colors.icon}</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      })

      const marker = L.marker([school.lat, school.lng], { icon })

      // Popup
      const levelLabel: Record<string, string> = {
        primary: 'Primary School',
        secondary: 'Secondary School',
        tertiary: 'University/College',
        combined: 'Combined School',
      }

      marker.bindPopup(`
        <div class="p-2 min-w-[200px]">
          <div class="font-bold text-[#212529] mb-1">${school.name}</div>
          <div class="text-xs text-[#495057] mb-2">${levelLabel[school.school_level] || 'School'}</div>
          ${school.address ? `<div class="text-xs text-[#495057] mb-1">${school.address}</div>` : ''}
          ${school.rating ? `<div class="text-xs text-[#495057] mb-2">Rating: ${school.rating}/10</div>` : ''}
          ${school.phone || school.website ? '<div class="border-t border-[#E9ECEF] pt-2 mt-2">' : ''}
          ${school.phone ? `<div class="text-xs text-[#495057] mb-1">📞 ${school.phone}</div>` : ''}
          ${school.website ? `<a href="${school.website}" target="_blank" rel="noopener" class="text-xs text-[#006AFF] hover:underline">Visit website →</a>` : ''}
          ${school.phone || school.website ? '</div>' : ''}
        </div>
      `, { maxWidth: 240, className: 'custom-popup' })

      marker.addTo(map)
      schoolMarkersRef.current[school.id] = marker
    })

      // Hide loading state after markers are rendered
      setTimeout(() => setIsLoadingSchools(false), 300)
    })
  }, [schools])

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

      {/* Schools control overlay - positioned opposite zoom controls (top-right vs top-left zoom) */}
      <div className="absolute top-4 right-4 z-[400] pointer-events-auto">
        <div className="bg-white rounded-lg shadow-lg border border-[#E9ECEF] overflow-hidden min-w-[200px]">
          {/* Header */}
          <button
            onClick={() => setSchoolsControlExpanded(!schoolsControlExpanded)}
            className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-[#F8F9FA] transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🏫</span>
              <span className="text-sm font-semibold text-[#212529]">Schools</span>
              {isLoadingSchools && showSchools && (
                <svg className="animate-spin h-3.5 w-3.5 text-[#495057]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
            </div>
            <svg
              className={`w-4 h-4 text-[#495057] transition-transform ${schoolsControlExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Expanded content */}
          {schoolsControlExpanded && (
            <div className="px-4 py-3 border-t border-[#E9ECEF] space-y-3">
              {/* Main toggle */}
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSchools}
                  onChange={(e) => {
                    const newShowSchools = e.target.checked
                    onSchoolFilterChange(newShowSchools, schoolLevels)
                  }}
                  className="w-4 h-4 rounded border-[#E9ECEF] text-[#212529] focus:ring-[#212529] focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm text-[#212529] font-medium">Show on map</span>
              </label>

              {/* Level filters */}
              {showSchools && (
                <div className="pt-2 border-t border-[#E9ECEF] space-y-2">
                  <p className="text-xs font-medium text-[#495057] mb-1.5">School Level</p>
                  {[
                    { value: 'primary', label: 'Primary', emoji: '🏫' },
                    { value: 'secondary', label: 'Secondary', emoji: '🎓' },
                    { value: 'tertiary', label: 'University', emoji: '🎓' },
                    { value: 'combined', label: 'Combined', emoji: '🏫' },
                  ].map((level) => {
                    const currentLevels = schoolLevels.split(',').filter(Boolean)
                    const isChecked = currentLevels.includes(level.value)
                    return (
                      <label key={level.value} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const levels = schoolLevels.split(',').filter(Boolean)
                            const newLevels = e.target.checked
                              ? [...levels, level.value]
                              : levels.filter((l) => l !== level.value)
                            onSchoolFilterChange(showSchools, newLevels.join(','))
                          }}
                          className="w-4 h-4 rounded border-[#E9ECEF] text-[#212529] focus:ring-[#212529] focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="text-xs">{level.emoji}</span>
                        <span className="text-sm text-[#495057] group-hover:text-[#212529] transition-colors">{level.label}</span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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

        /* School markers */
        .school-marker {
          background: transparent !important;
          border: none !important;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          overflow: visible;
        }
        .sm {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2.5px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
          position: relative;
        }
        .sm:hover {
          transform: scale(1.15);
          box-shadow: 0 5px 18px rgba(0, 0, 0, 0.3);
          z-index: 1000 !important;
        }
        .sm::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid;
          border-top-color: inherit;
        }
        .sm-icon {
          font-size: 16px;
          line-height: 1;
        }
      `}</style>
    </>
  )
}
