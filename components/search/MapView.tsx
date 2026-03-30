'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
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
  rental_period?: 'monthly' | 'nightly' | null
  nightly_price?: number | null
  price: number | null
  sale_price: number | null
  bedrooms: number
  bathrooms: number
  square_feet: number | null
  city: string
  area: string | null
  lat: number
  lng: number
  property_images: Array<{ id?: string; url: string; is_primary: boolean; alt_text?: string | null }>
}

interface MapViewProps {
  properties: Property[]
  schools?: any[]
  healthcareFacilities?: any[]
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

export default function MapView({ properties, schools = [], healthcareFacilities = [], selectedProperty, onPropertySelect, onBoundsChange, showSchools, schoolLevels, onSchoolFilterChange }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<{ [key: string]: L.Marker }>({})
  const schoolMarkersRef = useRef<{ [key: string]: L.Marker }>({})
  const healthcareMarkersRef = useRef<{ [key: string]: L.Marker }>({})
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null)
  const schoolClusterGroupRef = useRef<L.MarkerClusterGroup | null>(null)
  const healthcareClusterGroupRef = useRef<L.MarkerClusterGroup | null>(null)
  const [showZoomHint, setShowZoomHint] = useState(false)
  const [showHealthcare, setShowHealthcare] = useState(true)
  const [overlayExpanded, setOverlayExpanded] = useState(showSchools)
  const [isLoadingSchools, setIsLoadingSchools] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const userLocationCircleRef = useRef<L.CircleMarker | null>(null)
  const userLocationPulseRef = useRef<L.CircleMarker | null>(null)
  const hasFittedBoundsRef = useRef(false)
  const isUserInteractingRef = useRef(false)
  // Store callbacks in refs so the map init effect never re-runs
  const onBoundsChangeRef = useRef(onBoundsChange)
  onBoundsChangeRef.current = onBoundsChange
  const onPropertySelectRef = useRef(onPropertySelect)
  onPropertySelectRef.current = onPropertySelect

  // Sanitise a string for safe use inside HTML attributes and text nodes
  const sanitize = (str: string) =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')

  // Fit map to current property results
  const fitToResults = () => {
    const map = mapRef.current
    if (!map || properties.length === 0) return
    const bounds = L.latLngBounds(properties.map((p) => [p.lat, p.lng]))
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
  }

  // Get user's live location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const map = mapRef.current
        if (!map) { setIsLocating(false); return }

        // Remove previous location markers
        if (userLocationCircleRef.current) userLocationCircleRef.current.remove()
        if (userLocationPulseRef.current) userLocationPulseRef.current.remove()

        // Add pulse ring
        userLocationPulseRef.current = L.circleMarker([latitude, longitude], {
          radius: 18,
          fillColor: '#3B82F6',
          fillOpacity: 0.15,
          color: '#3B82F6',
          weight: 1,
          opacity: 0.3,
        }).addTo(map)

        // Add solid dot
        userLocationCircleRef.current = L.circleMarker([latitude, longitude], {
          radius: 7,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          color: '#FFFFFF',
          weight: 2,
          opacity: 1,
        }).addTo(map)

        map.setView([latitude, longitude], 14)
        setIsLocating(false)
      },
      (error) => {
        console.error('Geolocation error:', error)
        const messages: Record<number, string> = {
          1: 'Location permission denied. Click the lock icon in your address bar to allow location access, then try again.',
          2: 'Could not determine your location. Please try again.',
          3: 'Location request timed out. Please try again.',
        }
        toast.error(messages[error.code] || 'Unable to get your location.')
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  // Initialize map — runs once, never re-creates
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: [-17.8252, 31.0335],
      zoom: 12,
      zoomControl: true,
    })

    // Use OpenStreetMap tiles with CartoDB Voyager fallback on connection errors
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    })
    let tileErrorHandled = false
    tileLayer.on('tileerror', () => {
      if (!tileErrorHandled) {
        tileErrorHandled = true
        tileLayer.setUrl('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png')
      }
    })
    tileLayer.addTo(map)

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

    // School cluster group
    const schoolClusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 40,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 16,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount()
        return L.divIcon({
          html: `<div class="cluster-marker cluster-school"><span>${count}</span></div>`,
          className: 'custom-cluster-icon',
          iconSize: L.point(32, 32),
        })
      },
    })
    map.addLayer(schoolClusterGroup)
    schoolClusterGroupRef.current = schoolClusterGroup

    // Healthcare cluster group
    const healthcareClusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 40,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 16,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount()
        return L.divIcon({
          html: `<div class="cluster-marker cluster-healthcare"><span>${count}</span></div>`,
          className: 'custom-cluster-icon',
          iconSize: L.point(32, 32),
        })
      },
    })
    map.addLayer(healthcareClusterGroup)
    healthcareClusterGroupRef.current = healthcareClusterGroup

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
      schoolClusterGroupRef.current = null
      healthcareClusterGroupRef.current = null
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
      const isNightly = property.listing_type === 'rent' && property.rental_period === 'nightly' && property.nightly_price != null
      const priceCents = isSale
        ? property.sale_price ?? 0
        : isNightly
        ? property.nightly_price ?? 0
        : property.price ?? 0
      const priceLabel = formatMarkerPrice(priceCents, isSale)

      const priceSuffix = isSale ? '' : isNightly ? '/night' : '/mo'
      const icon = L.divIcon({
        className: 'price-marker',
        html: `<div class="pm ${isSelected ? 'pm-active' : ''} ${isSale ? 'pm-sale' : 'pm-rent'}">${priceLabel}${priceSuffix}</div>`,
        iconSize: [90, 36],
        iconAnchor: [45, 36],
      })

      const marker = L.marker([property.lat, property.lng], { icon })

      // Popup — all user data sanitised to prevent XSS
      const primaryImage = property.property_images.find(img => img.is_primary) || property.property_images[0]
      const imageUrl = primaryImage?.url || ''
      const formattedPrice = `$${(priceCents / 100).toLocaleString()}`
      const popupPriceSuffix = isSale ? '' : isNightly ? '/night' : '/mo'
      const safeTitle = sanitize(property.title)
      const safeArea = property.area ? sanitize(property.area) + ', ' : ''
      const safeCity = sanitize(property.city)
      const safeSlug = sanitize(property.slug || property.id)
      const safeImageUrl = imageUrl.startsWith('http') ? imageUrl : ''
      marker.bindPopup(`
        <div class="p-2 min-w-[220px]">
          ${safeImageUrl ? `<img src="${safeImageUrl}" alt="${safeTitle}" width="220" height="112" class="w-full h-28 object-cover rounded-md mb-2" loading="lazy" />` : ''}
          <div class="font-bold text-[#212529] mb-0.5">${formattedPrice}${popupPriceSuffix}</div>
          <div class="font-semibold text-sm text-[#212529] mb-0.5 line-clamp-1">${safeTitle}</div>
          <div class="text-xs text-[#495057] mb-2">${safeArea}${safeCity}</div>
          <div class="flex gap-3 text-xs text-[#495057] mb-2">
            <span>${property.bedrooms} bd</span>
            <span>${property.bathrooms} ba</span>
            ${property.square_feet ? `<span>${property.square_feet} sqft</span>` : ''}
          </div>
          <a href="/property/${safeSlug}" class="block text-center bg-[#212529] text-white py-1.5 rounded-md text-xs font-medium hover:bg-black transition-colors">View</a>
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

  // Update school markers when schools change — uses cluster group
  useEffect(() => {
    const schoolClusterGroup = schoolClusterGroupRef.current
    if (!schoolClusterGroup) return

    schoolClusterGroup.clearLayers()
    schoolMarkersRef.current = {}

    if (!schools || schools.length === 0) {
      setIsLoadingSchools(false)
      return
    }

    setIsLoadingSchools(true)

    requestAnimationFrame(() => {
      const iconColors: Record<string, { bg: string; border: string; icon: string }> = {
        primary:   { bg: '#3B82F6', border: '#1E40AF', icon: '🏫' },
        secondary: { bg: '#10B981', border: '#047857', icon: '🎓' },
        tertiary:  { bg: '#8B5CF6', border: '#5B21B6', icon: '🎓' },
        combined:  { bg: '#F59E0B', border: '#B45309', icon: '🏫' },
      }
      const levelLabel: Record<string, string> = {
        primary:   'Primary School',
        secondary: 'Secondary School',
        tertiary:  'University/College',
        combined:  'Combined School',
      }

      schools.forEach((school) => {
        const colors = iconColors[school.school_level] || iconColors.primary
        const safeLevel = sanitize(school.school_level || '')
        const icon = L.divIcon({
          className: 'school-marker',
          html: `<div class="sm sm-${safeLevel}" style="background: ${colors.bg}; border-color: ${colors.border};"><span class="sm-icon">${colors.icon}</span></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 18],
        })
        const marker = L.marker([school.lat, school.lng], { icon })
        const safeName    = sanitize(school.name || '')
        const safeAddress = school.address ? `<div class="text-xs text-[#495057] mb-1">${sanitize(school.address)}</div>` : ''
        const safePhone   = school.phone ? `<div class="text-xs text-[#495057] mb-1">📞 ${sanitize(school.phone)}</div>` : ''
        const safeWebsite = school.website && school.website.startsWith('http')
          ? `<a href="${sanitize(school.website)}" target="_blank" rel="noopener noreferrer" class="text-xs text-[#006AFF] hover:underline">Visit website →</a>`
          : ''
        marker.bindPopup(`
          <div class="p-2 min-w-[200px]">
            <div class="font-bold text-[#212529] mb-1">${safeName}</div>
            <div class="text-xs text-[#495057] mb-2">${levelLabel[school.school_level] || 'School'}</div>
            ${safeAddress}
            ${school.rating ? `<div class="text-xs text-[#495057] mb-2">Rating: ${Number(school.rating).toFixed(1)}/10</div>` : ''}
            ${safePhone || safeWebsite ? `<div class="border-t border-[#E9ECEF] pt-2 mt-2">${safePhone}${safeWebsite}</div>` : ''}
          </div>
        `, { maxWidth: 240, className: 'custom-popup' })
        schoolClusterGroup.addLayer(marker)
        schoolMarkersRef.current[school.id] = marker
      })
      setTimeout(() => setIsLoadingSchools(false), 300)
    })
  }, [schools])

  // Show/hide healthcare cluster group when toggle changes
  useEffect(() => {
    const map = mapRef.current
    const hcGroup = healthcareClusterGroupRef.current
    if (!map || !hcGroup) return
    if (showHealthcare) {
      if (!map.hasLayer(hcGroup)) map.addLayer(hcGroup)
    } else {
      if (map.hasLayer(hcGroup)) map.removeLayer(hcGroup)
    }
  }, [showHealthcare])

  // Update healthcare markers when facilities change — uses cluster group
  useEffect(() => {
    const healthcareClusterGroup = healthcareClusterGroupRef.current
    if (!healthcareClusterGroup) return

    healthcareClusterGroup.clearLayers()
    healthcareMarkersRef.current = {}

    if (!healthcareFacilities || healthcareFacilities.length === 0) return

    healthcareFacilities.forEach((facility) => {
      const icon = L.divIcon({
        className: 'healthcare-marker',
        html: `<div style="width:14px;height:14px;background:#EF4444;border:1.5px solid #B91C1C;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;box-shadow:0 1px 3px rgba(0,0,0,0.2);"><span style="color:white;font-weight:bold;">+</span></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })
      const marker = L.marker([facility.latitude, facility.longitude], { icon })
      const safeName     = sanitize(facility.name || '')
      const safeType     = sanitize(facility.facility_type || 'Healthcare Facility')
      const safeDistrict = sanitize(facility.district || '')
      const safeProvince = sanitize(facility.province || '')
      marker.bindPopup(`
        <div class="p-2 min-w-[200px]">
          <div class="font-bold text-[#212529] mb-1">${safeName}</div>
          <div class="text-xs text-[#495057] mb-2">${safeType}</div>
          <div class="text-xs text-[#495057] mb-1">${safeDistrict}, ${safeProvince}</div>
          ${facility.year_built && facility.year_built > 0 ? `<div class="text-xs text-[#495057]">Built: ${Number(facility.year_built)}</div>` : ''}
        </div>
      `, { maxWidth: 240, className: 'custom-popup' })
      healthcareClusterGroup.addLayer(marker)
      healthcareMarkersRef.current[facility.id] = marker
    })
  }, [healthcareFacilities])

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

      {/* Result count pill */}
      {properties.length > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] pointer-events-none">
          <div className="bg-white/95 backdrop-blur-sm border border-[#E9ECEF] rounded-full px-3 py-1.5 shadow-md text-xs text-[#495057]">
            <span className="font-semibold text-[#212529]">{properties.length}</span> homes on map
          </div>
        </div>
      )}

      {/* Fit to results button */}
      {properties.length > 0 && (
        <button
          onClick={fitToResults}
          title="Fit map to all results"
          className="absolute bottom-[3.75rem] right-4 z-[400] w-9 h-9 bg-white rounded-lg shadow-lg border border-[#E9ECEF] flex items-center justify-center hover:bg-[#F8F9FA] transition-colors"
        >
          <svg className="h-4 w-4 text-[#495057]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
          </svg>
        </button>
      )}

      {/* Live location button */}
      <button
        onClick={getUserLocation}
        disabled={isLocating}
        title="Go to my location"
        className="absolute bottom-6 right-4 z-[400] w-9 h-9 bg-white rounded-lg shadow-lg border border-[#E9ECEF] flex items-center justify-center hover:bg-[#F8F9FA] transition-colors cursor-pointer disabled:opacity-50"
      >
        {isLocating ? (
          <svg className="animate-spin h-4 w-4 text-[#495057]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg className="h-4 w-4 text-[#495057]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v3m0 14v3m10-10h-3M5 12H2" />
          </svg>
        )}
      </button>

      {/* Layers control overlay */}
      <div className="absolute top-4 right-4 z-[400] pointer-events-auto">
        <div className="bg-white rounded-lg shadow-lg border border-[#E9ECEF] overflow-hidden min-w-[160px]">
          {/* Header */}
          <button
            onClick={() => setOverlayExpanded(!overlayExpanded)}
            className="w-full px-3 py-2 flex items-center justify-between gap-2 hover:bg-[#F8F9FA] transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#495057]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 16l4.553-2.276A1 1 0 0021 19.382V8.618a1 1 0 00-.553-.894L15 5m0 16V5m0 0L9 7" />
              </svg>
              <span className="text-sm font-semibold text-[#212529]">Layers</span>
              {isLoadingSchools && showSchools && (
                <svg className="animate-spin h-3 w-3 text-[#495057]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
            </div>
            <svg
              className={`w-3.5 h-3.5 text-[#495057] transition-transform ${overlayExpanded ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {overlayExpanded && (
            <div className="px-3 py-2 border-t border-[#E9ECEF] space-y-3">

              {/* Healthcare toggle */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showHealthcare}
                    onChange={(e) => setShowHealthcare(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[#E9ECEF] text-[#212529] focus:ring-[#212529] focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-xs">🏥</span>
                  <span className="text-xs text-[#212529] font-medium">Healthcare</span>
                </label>
              </div>

              {/* Schools section */}
              <div className="border-t border-[#E9ECEF] pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSchools}
                    onChange={(e) => onSchoolFilterChange(e.target.checked, schoolLevels)}
                    className="w-3.5 h-3.5 rounded border-[#E9ECEF] text-[#212529] focus:ring-[#212529] focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-xs">🏫</span>
                  <span className="text-xs text-[#212529] font-medium">Schools</span>
                </label>

                {showSchools && (
                  <div className="pt-1.5 pl-5 space-y-1.5">
                    <p className="text-[10px] font-semibold text-[#495057] uppercase tracking-wide mb-1">Level</p>
                    {[
                      { value: 'primary',   label: 'Primary',    emoji: '🏫' },
                      { value: 'secondary', label: 'Secondary',  emoji: '🎓' },
                      { value: 'tertiary',  label: 'University', emoji: '🎓' },
                      { value: 'combined',  label: 'Combined',   emoji: '🏫' },
                    ].map((level) => {
                      const currentLevels = schoolLevels.split(',').filter(Boolean)
                      const isChecked = currentLevels.includes(level.value)
                      return (
                        <label key={level.value} className="flex items-center gap-2 cursor-pointer group">
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
                            className="w-3.5 h-3.5 rounded border-[#E9ECEF] text-[#212529] focus:ring-[#212529] focus:ring-offset-0 cursor-pointer"
                          />
                          <span className="text-xs">{level.emoji}</span>
                          <span className="text-xs text-[#495057] group-hover:text-[#212529] transition-colors">{level.label}</span>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
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
        .cluster-school {
          background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
          border: 2.5px solid #fff;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
          color: #fff;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .cluster-school:hover {
          transform: scale(1.2);
        }
        .cluster-healthcare {
          background: linear-gradient(135deg, #EF4444 0%, #B91C1C 100%);
          border: 2.5px solid #fff;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
          color: #fff;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .cluster-healthcare:hover {
          transform: scale(1.2);
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
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 1.5px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
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
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 5px solid;
          border-top-color: inherit;
        }
        .sm-icon {
          font-size: 9px;
          line-height: 1;
        }
      `}</style>
    </>
  )
}
