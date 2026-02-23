'use client'

import { 
  Wifi, Car, PawPrint, Dumbbell, Waves, Shield, 
  ThermometerSun, Trees, Sparkles, Zap, Home
} from 'lucide-react'

const HIGHLIGHT_MAP: Record<string, { icon: any; label: string; color: string }> = {
  'Pool': { icon: Waves, label: 'Has Pool', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  'Gym': { icon: Dumbbell, label: 'Fitness Center', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  'Pet-friendly': { icon: PawPrint, label: 'Pet Friendly', color: 'bg-green-50 text-green-700 border-green-200' },
  'Security': { icon: Shield, label: '24/7 Security', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  'Garden': { icon: Trees, label: 'Garden/Yard', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'Air conditioning': { icon: ThermometerSun, label: 'Central A/C', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  'WiFi': { icon: Wifi, label: 'WiFi Included', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  'Parking': { icon: Car, label: 'Parking Available', color: 'bg-gray-50 text-gray-700 border-gray-200' },
}

interface PropertyHighlightsProps {
  amenities: string[]
  yearBuilt?: number | null
  isNewListing?: boolean
}

export default function PropertyHighlights({ amenities, yearBuilt, isNewListing }: PropertyHighlightsProps) {
  const highlights: { icon: any; label: string; color: string }[] = []

  if (isNewListing) {
    highlights.push({ icon: Sparkles, label: 'New Listing', color: 'bg-amber-50 text-amber-700 border-amber-200' })
  }

  if (yearBuilt && yearBuilt >= new Date().getFullYear() - 5) {
    highlights.push({ icon: Home, label: 'Recently Built', color: 'bg-teal-50 text-teal-700 border-teal-200' })
  }

  for (const amenity of amenities) {
    if (HIGHLIGHT_MAP[amenity]) {
      highlights.push(HIGHLIGHT_MAP[amenity])
    }
    if (highlights.length >= 4) break
  }

  if (highlights.length === 0) return null

  return (
    <div className="mb-8">
      <h2 className="text-base font-bold text-[#212529] mb-3">What&apos;s special</h2>
      <div className="flex flex-wrap gap-2">
        {highlights.map((h, i) => {
          const Icon = h.icon
          return (
            <div
              key={i}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${h.color}`}
            >
              <Icon size={16} />
              {h.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}
