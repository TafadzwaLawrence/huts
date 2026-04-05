import { Metadata } from 'next'
import { LeadMagnetLandingPage } from '@/components/lead-magnets/LeadMagnetLandingPage'

export const metadata: Metadata = {
  title:
    'Maximize Rental Yield Guide | Zimbabwe Landlords | Huts',
  description:
    'Proven strategies to maximize rental income in Zimbabwe. Suburb analysis, tenant screening, legal obligations, and pricing strategies.',
  keywords: [
    'rental yield Zimbabwe',
    'how to maximize rent',
    'tenant screening',
    'property management',
    'rental pricing',
  ],
  openGraph: {
    title:
      'Landlord\'s Guide to Maximizing Rental Yield in Zimbabwe',
    description:
      'Increase your rental income with proven strategies and market insights.',
    type: 'article',
    url: 'https://huts.zw/guides/landlord-rental-yield',
  },
}

const features = [
  'Suburb-by-suburb rental yield analysis',
  'How to price your property competitively',
  'Tenant screening checklist (employment, references)',
  'Legal obligations: leases, deposits, VACANT possession',
  'Property tax implications (ZIMRA rental income)',
  'Property maintenance and management costs',
  'Furnished vs. unfurnished ROI comparison',
  'Security deposits and legal requirements',
  'How to handle difficult tenants',
  'Market trends and seasonal pricing',
]

const testimonials = [
  {
    author: 'Michael Dlamini',
    role: 'Property Manager, Harare',
    text: 'The yield analysis by suburb showed me exactly which areas give the best returns. My portfolio is generating 15% higher income.',
  },
  {
    author: 'Thandiwe Mahachi',
    role: 'Landlord, Bulawayo',
    text: 'The tenant screening checklist and legal template saved me from multiple problematic situations. Essential reading!',
  },
]

export default function RentalYieldGuidePage() {
  return (
    <LeadMagnetLandingPage
      slug="landlord-rental-yield"
      heroImage="/guides/landlord-hero.jpg"
      features={features}
      testimonials={testimonials}
      cta="Get Landlord Guide"
    />
  )
}
