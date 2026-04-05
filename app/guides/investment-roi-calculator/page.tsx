import { Metadata } from 'next'
import { LeadMagnetLandingPage } from '@/components/lead-magnets/LeadMagnetLandingPage'

export const metadata: Metadata = {
  title: 'Property Investment ROI Calculator | Short-term vs Long-term | Huts',
  description:
    'Compare rental yield between traditional rentals and vacation rentals (Airbnb). Zimbabwe property investment analysis.',
}

const features = [
  'Compare traditional vs. short-term rental yields',
  'Airbnb occupancy rate analysis',
  'Tourism season impact calculator',
  'Management cost breakdowns',
  'Tax implications for both models',
  'Location-specific ROI recommendations',
  'Monthly revenue projections',
  'Competitive pricing analysis',
  'Risk assessment tools',
  ' 5-year investment forecast',
]

export default function ROICalculatorPage() {
  return (
    <LeadMagnetLandingPage
      slug="investment-roi-calculator"
      features={features}
      cta="Get ROI Calculator"
    />
  )
}
