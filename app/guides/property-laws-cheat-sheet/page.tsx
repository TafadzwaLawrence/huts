import { Metadata } from 'next'
import { LeadMagnetLandingPage } from '@/components/lead-magnets/LeadMagnetLandingPage'

export const metadata: Metadata = {
  title: 'Zimbabwe Property Laws & Regulations Cheat Sheet | Legal Guide | Huts',
  description:
    'Essential legal guide covering Urban Councils Act, Deeds Registry, ZIMRA taxes, and landlord-tenant laws in Zimbabwe.',
}

const features = [
  'Urban Councils Act explained',
  'Regional Town Planning Act summary',
  'Deeds Registry requirements',
  'ZIMRA property tax guide',
  'Tenant rights and protections',
  'Landlord legal obligations',
  'VACANT possession act',
  'Dispute resolution procedures',
  'Property transfer process',
  'Quick reference FAQs',
]

export default function PropertyLawsCheatSheetPage() {
  return (
    <LeadMagnetLandingPage
      slug="property-laws-cheat-sheet"
      features={features}
      cta="Get Legal Cheat Sheet"
    />
  )
}
