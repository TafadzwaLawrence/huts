import { Metadata } from 'next'
import { LeadMagnetLandingPage } from '@/components/lead-magnets/LeadMagnetLandingPage'

export const metadata: Metadata = {
  title: 'Weekly Property Market Report Newsletter | Zimbabwe Real Estate | Huts',
  description:
    'Subscribe to weekly property market insights, new listings, price trends, and expert analysis for Zimbabwe.',
}

const features = [
  'Weekly market trend analysis',
  'New listing highlights',
  'Price movement tracking by suburb',
  'Expert market commentary',
  'Exclusive agent interviews',
  'Investment opportunity spotlights',
  'Legal and tax updates',
  'Community news and developments',
  'Special promotions and deals',
  'Subscriber-only discounts',
]

export default function MarketReportNewsletterPage() {
  return (
    <LeadMagnetLandingPage
      slug="market-report-newsletter"
      features={features}
      cta="Subscribe to Newsletter"
    />
  )
}
