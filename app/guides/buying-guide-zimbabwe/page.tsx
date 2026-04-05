import { Metadata } from 'next'
import { LeadMagnetLandingPage } from '@/components/lead-magnets/LeadMagnetLandingPage'

export const metadata: Metadata = {
  title:
    'The Ultimate Guide to Buying Property in Zimbabwe | Huts',
  description:
    'Complete step-by-step guide to property purchase process in Zimbabwe. Learn costs, legal requirements, red flags, and how to avoid costly mistakes.',
  keywords: [
    'Zimbabwe property buying guide',
    'property purchase process',
    'title deeds',
    'transfer costs',
    'capital gains tax',
  ],
  openGraph: {
    title:
      'The Ultimate Guide to Buying Property in Zimbabwe',
    description:
      'Master the property buying process with our comprehensive guide.',
    type: 'article',
    url: 'https://huts.zw/guides/buying-guide-zimbabwe',
  },
}

const features = [
  'Step-by-step buying process explained',
  'Breakdown of all costs and fees involved',
  'How to verify title deeds and check for red flags',
  'Suburb-specific guides for Harare, Bulawayo, and major cities',
  'Legal requirements and regulations',
  'Tax implications and how to minimize costs',
  'Checklist for your property inspection',
  'Common mistakes to avoid',
  'Financing options and mortgage tips',
]

const testimonials = [
  {
    author: 'John Mwemba',
    role: 'First-time Buyer, Harare',
    text: 'This guide saved me thousands. I avoided a property with serious title issues thanks to the red flags checklist.',
  },
  {
    author: 'Sarah Ncube',
    role: 'Property Investor, Bulawayo',
    text: 'The suburb rankings and market analysis were invaluable. Now I understand pricing better than ever.',
  },
]

export default function BuyingGuidePage() {
  return (
    <LeadMagnetLandingPage
      slug="buying-guide-zimbabwe"
      heroImage="/guides/buying-hero.jpg"
      features={features}
      testimonials={testimonials}
      cta="Download Free Guide"
    />
  )
}
