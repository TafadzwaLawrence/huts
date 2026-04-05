import { Metadata } from 'next'
import { LeadMagnetLandingPage } from '@/components/lead-magnets/LeadMagnetLandingPage'

export const metadata: Metadata = {
  title: 'Property Renovation ROI Guide | Zimbabwe Home Improvement | Huts',
  description:
    'Learn which renovations add the most value in Zimbabwe. Cost estimates, timelines, and contractor referrals.',
}

const features = [
  'High-ROI renovation projects',
  'Material cost estimates (ZWL & USD)',
  'Labor cost breakdowns by location',
  'Timeline projections',
  'Before & after examples',
  'Kitchen renovation strategies',
  'Bathroom upgrade impact',
  'Exterior improvements',
  'Energy-saving upgrades',
  'Trusted contractor referrals',
]

export default function RenovationROIGuidePage() {
  return (
    <LeadMagnetLandingPage
      slug="renovation-roi-guide"
      features={features}
      cta="Get Renovation Guide"
    />
  )
}
