import { Metadata } from 'next'
import { LeadMagnetLandingPage } from '@/components/lead-magnets/LeadMagnetLandingPage'

export const metadata: Metadata = {
  title:
    'Free Home Valuation Tool | Zimbabwe Property Value Estimator | Huts',
  description:
    'Get an instant estimate of your Zimbabwe property value. Powered by real market data and thousands of comparable sales.',
  keywords: [
    'property valuation Zimbabwe',
    'property value estimator',
    'how much is my house worth',
    'property appraisal',
    'home value',
  ],
  openGraph: {
    title: 'Home Valuation Tool - Instant Property Value Estimator',
    description:
      'Find out what your property is worth in seconds using our advanced valuation algorithm.',
    type: 'article',
    url: 'https://huts.zw/guides/home-valuation-tool',
  },
}

const features = [
  'Instant property value estimate in USD',
  'Based on real market data and comparable sales',
  'Suburb-by-suburb analysis',
  'Historical price trends for your area',
  'Detailed valuation report emailed to you',
  'Mortgage pre-approval guidance',
  'Investor analysis and ROI potential',
  'Price trend predictions',
  'Comparative market analysis',
  'No credit card or obligation required',
]

const testimonials = [
  {
    author: 'Tendai Makwanya',
    role: 'Property Seller, Harare',
    text: 'The valuation tool gave me confidence in my asking price. I listed at the recommended price and sold in 3 weeks!',
  },
  {
    author: 'Grace Muwende',
    role: 'Investor, Victoria Falls',
    text: 'The valuation report with trend analysis helped me negotiate a 12% better purchase price. Absolutely brilliant tool.',
  },
]

export default function ValuationToolPage() {
  return (
    <LeadMagnetLandingPage
      slug="home-valuation-tool"
      heroImage="/guides/valuation-hero.jpg"
      features={features}
      testimonials={testimonials}
      cta="Get Valuation Report"
    />
  )
}
