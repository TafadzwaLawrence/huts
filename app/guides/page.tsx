import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, BookOpen } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Free Real Estate Guides | Zimbabwe | Huts',
  description:
    'Download free guides on buying, selling, renting, and investing in Zimbabwe property. Expert insights and practical checklists.',
  keywords: [
    'real estate guides Zimbabwe',
    'property buying guide',
    'rental guide',
    'investing guide',
  ],
}

const guides = [
  {
    slug: 'buying-guide-zimbabwe',
    title: 'The Ultimate Guide to Buying Property in Zimbabwe',
    description: 'Complete step-by-step guide with costs, legal requirements, and red flags.',
    category: 'buyer',
    priority: 1,
  },
  {
    slug: 'landlord-rental-yield',
    title: 'Landlord\'s Guide to Maximizing Rental Yield',
    description: 'Suburb analysis, tenant screening, and pricing strategies.',
    category: 'landlord',
    priority: 1,
  },
  {
    slug: 'home-valuation-tool',
    title: 'Home Valuation Tool & Property Estimator',
    description: 'Get instant estimates of your property value based on real market data.',
    category: 'buyer',
    priority: 1,
  },
  {
    slug: 'rental-affordability-calculator',
    title: 'Rental Affordability Calculator & Budget Planner',
    description: 'Calculate your ideal rental budget including utilities and commuting.',
    category: 'renter',
    priority: 2,
  },
  {
    slug: 'relocation-guide',
    title: 'Moving to Harare, Bulawayo & Victoria Falls Guide',
    description: 'Hyper-local guides with suburbs, costs, amenities, and safety ratings.',
    category: 'renter',
    priority: 2,
  },
  {
    slug: 'agent-commission-calculator',
    title: 'Real Estate Agent Commission Calculator & Toolkit',
    description: 'Professional templates for proposals, marketing, and client management.',
    category: 'agent',
    priority: 2,
  },
  {
    slug: 'investment-roi-calculator',
    title: 'Property Investment ROI Calculator',
    description: 'Compare traditional rentals vs. short-term rentals (Airbnb) with location analysis.',
    category: 'landlord',
    priority: 2,
  },
  {
    slug: 'property-laws-cheat-sheet',
    title: 'Zimbabwe Property Laws & Regulations Cheat Sheet',
    description: 'Essential legal reference covering taxes, tenant rights, and obligations.',
    category: 'buyer',
    priority: 3,
  },
  {
    slug: 'renovation-roi-guide',
    title: 'Property Renovation ROI Guide',
    description: 'Learn high-value renovations with cost estimates and contractor referrals.',
    category: 'buyer',
    priority: 3,
  },
  {
    slug: 'market-report-newsletter',
    title: 'Weekly Property Market Report Newsletter',
    description: 'Subscribe to weekly trends, new listings, and expert analysis.',
    category: 'buyer',
    priority: 3,
  },
]

const categoryColors = {
  buyer: 'bg-blue-50 border-blue-200',
  renter: 'bg-green-50 border-green-200',
  landlord: 'bg-purple-50 border-purple-200',
  agent: 'bg-orange-50 border-orange-200',
}

const categoryLabels = {
  buyer: 'For Buyers',
  renter: 'For Renters',
  landlord: 'For Landlords',
  agent: 'For Agents',
}

export default function GuidesPage() {
  const highPriority = guides.filter((g) => g.priority === 1)
  const secondary = guides.filter((g) => g.priority === 2)
  const bonus = guides.filter((g) => g.priority === 3)

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="bg-charcoal text-white py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Free Guides
            </span>
          </div>
          <h1 className="text-4xl font-bold sm:text-5xl mb-6">
            Master Zimbabwe Real Estate
          </h1>
          <p className="text-lg text-off-white max-w-2xl">
            Download our free guides packed with expert insights, practical
            checklists, and market data to help you buy, sell, or invest
            smarter.
          </p>
        </div>
      </section>

      {/* Quick Win Guides (Priority 1) */}
      <section className="border-b border-light-gray py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-2 text-3xl font-bold text-charcoal">
            Start Here
          </h2>
          <p className="mb-8 text-dark-gray">
            The 3 most essential guides to get your real estate journey started.
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {highPriority.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} />
            ))}
          </div>
        </div>
      </section>

      {/* Secondary Guides */}
      <section className="border-b border-light-gray bg-off-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-2 text-3xl font-bold text-charcoal">
            Go Deeper
          </h2>
          <p className="mb-8 text-dark-gray">
            Advanced strategies and specialized tools for specific situations.
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {secondary.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} minimal />
            ))}
          </div>
        </div>
      </section>

      {/* Bonus Guides */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-2 text-3xl font-bold text-charcoal">
            Bonus Resources
          </h2>
          <p className="mb-8 text-dark-gray">
            Specialized guides and references for particular interests.
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {bonus.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} minimal />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-light-gray bg-charcoal text-white py-16">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            All guides are completely free.
          </h2>
          <p className="mb-8 text-off-white">
            Download instantly and start making smarter real estate decisions
            today.
          </p>
        </div>
      </section>
    </div>
  )
}

interface GuideCardProps {
  guide: (typeof guides)[0]
  minimal?: boolean
}

function GuideCard({ guide, minimal = false }: GuideCardProps) {
  const bgColor =
    categoryColors[guide.category as keyof typeof categoryColors] ||
    'bg-light-gray border-light-gray'
  const label =
    categoryLabels[guide.category as keyof typeof categoryLabels] ||
    'Resource'

  return (
    <Link href={`/guides/${guide.slug}`}>
      <div
        className={`h-full rounded-lg border-2 ${bgColor} p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group`}
      >
        <div className="flex items-start justify-between mb-4">
          <span className="inline-block bg-charcoal text-white text-xs font-semibold px-2 py-1 rounded">
            {label}
          </span>
          <ChevronRight className="text-charcoal opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <h3 className="mb-2 font-bold text-charcoal text-lg group-hover:text-charcoal transition-colors">
          {guide.title}
        </h3>

        {!minimal && (
          <p className="text-dark-gray text-sm">{guide.description}</p>
        )}

        {!minimal && (
          <div className="mt-4 flex items-center text-charcoal font-semibold text-sm">
            Download →
          </div>
        )}
      </div>
    </Link>
  )
}
