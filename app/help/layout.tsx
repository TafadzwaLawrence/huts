import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help Center - Huts',
  description: 'Get help with listing your property, searching for rentals, and using Huts. Guides for landlords and renters in Zimbabwe.',
  openGraph: {
    title: 'Help Center | Huts',
    description: 'Guides and support for listing properties and finding rentals on Huts.',
    url: 'https://www.huts.co.zw/help',
  },
  alternates: {
    canonical: 'https://www.huts.co.zw/help',
  },
}

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
