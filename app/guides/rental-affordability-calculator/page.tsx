import { Metadata } from 'next'
import { LeadMagnetLandingPage } from '@/components/lead-magnets/LeadMagnetLandingPage'

export const metadata: Metadata = {
  title: 'Rental Affordability Calculator | Budget Planner | Huts',
  description:
    'Calculate your ideal rental budget including utilities, security, and commuting costs. Zimbabwe-specific analysis.',
}

const features = [
  'Calculate monthly rental budget from income',
  'Include utilities (ZESA, water, internet)',
  'Factor in security and insurance costs',
  'Commuting cost calculations',
  'ZWL and USD currency support',
  'Savings recommendations',
  'Downloadable budget template',
]

export default function AffordabilityCalculatorPage() {
  return (
    <LeadMagnetLandingPage
      slug="rental-affordability-calculator"
      features={features}
      cta="Get Budget Planner"
    />
  )
}
