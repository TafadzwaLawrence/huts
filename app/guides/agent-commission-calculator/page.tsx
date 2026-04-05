import { Metadata } from 'next'
import { LeadMagnetLandingPage } from '@/components/lead-magnets/LeadMagnetLandingPage'

export const metadata: Metadata = {
  title: 'Agent Commission Calculator & Proposal Templates | Real Estate Agents | Huts',
  description:
    'Professional tools for real estate agents. Commission calculator, client proposals, and marketing plan templates.',
}

const features = [
  'Automated commission calculations',
  'Professional proposal templates',
  'Marketing plan generator',
  'Pricing strategy worksheets',
  'Client contract templates',
  'Performance tracking tools',
  'Listing presentation slides',
  'Market analysis templates',
  'Lead tracking sheets',
]

export default function AgentCommissionCalculatorPage() {
  return (
    <LeadMagnetLandingPage
      slug="agent-commission-calculator"
      features={features}
      cta="Get Agent Toolkit"
    />
  )
}
