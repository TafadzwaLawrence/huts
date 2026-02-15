import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search Properties',
  description: 'Search and filter rental properties across Zimbabwe. Find apartments, houses, studios by location, price, and amenities.',
  openGraph: {
    title: 'Search Properties | Huts',
    description: 'Find your perfect rental in Zimbabwe. Filter by city, price, bedrooms, and more.',
  },
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
