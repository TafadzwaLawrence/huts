import { Metadata } from 'next'
import { LeadMagnetLandingPage } from '@/components/lead-magnets/LeadMagnetLandingPage'

export const metadata: Metadata = {
  title: 'Relocation Guide | Moving to Harare, Bulawayo & Zimbabwe | Huts',
  description:
    'Complete guides for relocating to major Zimbabwe cities. Suburbs, costs, amenities, safety ratings, and community info.',
}

const features = [
  'Suburb rankings by income level',
  'Safety ratings for each area',
  'School and education options',
  'Shopping centers and amenities',
  'Healthcare facilities nearby',
  'Transportation and commute times',
  'Average rental and purchase prices',
  'Community demographics',
  'Cost of living breakdowns',
  'Moving checklists',
]

export default function RelocationGuidePage() {
  return (
    <LeadMagnetLandingPage
      slug="relocation-guide"
      features={features}
      cta="Get Relocation Guide"
    />
  )
}
