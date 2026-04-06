import { Metadata } from 'next'
import Link from 'next/link'
import { 
  ChevronRight, 
  BookOpen, 
  Star, 
  TrendingUp, 
  Shield, 
  Calculator,
  FileText,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Download,
  MapPin,
  Clock
} from 'lucide-react'

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
    readTime: '15 min read',
    popular: true,
  },
  {
    slug: 'landlord-rental-yield',
    title: 'Landlord\'s Guide to Maximizing Rental Yield',
    description: 'Suburb analysis, tenant screening, and pricing strategies.',
    category: 'landlord',
    priority: 1,
    readTime: '12 min read',
    popular: true,
  },
  {
    slug: 'home-valuation-tool',
    title: 'Home Valuation Tool & Property Estimator',
    description: 'Get instant estimates of your property value based on real market data.',
    category: 'buyer',
    priority: 1,
    readTime: '8 min read',
    popular: false,
  },
  {
    slug: 'rental-affordability-calculator',
    title: 'Rental Affordability Calculator & Budget Planner',
    description: 'Calculate your ideal rental budget including utilities and commuting.',
    category: 'renter',
    priority: 2,
    readTime: '10 min read',
    popular: false,
  },
  {
    slug: 'relocation-guide',
    title: 'Moving to Harare, Bulawayo & Victoria Falls Guide',
    description: 'Hyper-local guides with suburbs, costs, amenities, and safety ratings.',
    category: 'renter',
    priority: 2,
    readTime: '20 min read',
    popular: true,
  },
  {
    slug: 'agent-commission-calculator',
    title: 'Real Estate Agent Commission Calculator & Toolkit',
    description: 'Professional templates for proposals, marketing, and client management.',
    category: 'agent',
    priority: 2,
    readTime: '10 min read',
    popular: false,
  },
  {
    slug: 'investment-roi-calculator',
    title: 'Property Investment ROI Calculator',
    description: 'Compare traditional rentals vs. short-term rentals (Airbnb) with location analysis.',
    category: 'landlord',
    priority: 2,
    readTime: '12 min read',
    popular: false,
  },
  {
    slug: 'property-laws-cheat-sheet',
    title: 'Zimbabwe Property Laws & Regulations Cheat Sheet',
    description: 'Essential legal reference covering taxes, tenant rights, and obligations.',
    category: 'buyer',
    priority: 3,
    readTime: '25 min read',
    popular: false,
  },
  {
    slug: 'renovation-roi-guide',
    title: 'Property Renovation ROI Guide',
    description: 'Learn high-value renovations with cost estimates and contractor referrals.',
    category: 'buyer',
    priority: 3,
    readTime: '14 min read',
    popular: false,
  },
  {
    slug: 'market-report-newsletter',
    title: 'Weekly Property Market Report Newsletter',
    description: 'Subscribe to weekly trends, new listings, and expert analysis.',
    category: 'buyer',
    priority: 3,
    readTime: '5 min read',
    popular: false,
  },
]

const categoryConfig = {
  buyer: {
    label: 'For Buyers',
    icon: TrendingUp,
  },
  renter: {
    label: 'For Renters',
    icon: Shield,
  },
  landlord: {
    label: 'For Landlords',
    icon: Calculator,
  },
  agent: {
    label: 'For Agents',
    icon: Star,
  },
}

export default function GuidesPage() {
  const highPriority = guides.filter((g) => g.priority === 1)
  const secondary = guides.filter((g) => g.priority === 2)
  const bonus = guides.filter((g) => g.priority === 3)

  return (
    <div className="w-full bg-white">
      {/* Hero Section - Pure B&W */}
      <section className="border-b border-light-gray bg-white py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">
              <BookOpen className="h-4 w-4" />
              Free Educational Resources
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-black sm:text-5xl lg:text-6xl">
              Master Zimbabwe Real Estate
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-dark-gray sm:text-lg">
              Download free guides packed with expert insights, practical checklists, 
              and market data to help you buy, sell, or invest smarter.
            </p>
            
            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-dark-gray">
                <CheckCircle className="h-4 w-4 text-black" />
                <span>10+ Expert Guides</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-dark-gray">
                <CheckCircle className="h-4 w-4 text-black" />
                <span>Free Instant Download</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-dark-gray">
                <CheckCircle className="h-4 w-4 text-black" />
                <span>15,000+ Users</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Win Guides - Featured Section */}
      <section className="border-b border-light-gray bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-light-gray px-3 py-1 text-sm font-semibold text-black">
              <Sparkles className="h-4 w-4" />
              Featured Resources
            </div>
            <h2 className="mb-3 text-3xl font-bold text-black sm:text-4xl">
              Start Here
            </h2>
            <p className="mx-auto max-w-2xl text-dark-gray">
              The most essential guides to kickstart your real estate journey
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {highPriority.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} featured />
            ))}
          </div>
        </div>
      </section>

      {/* Secondary Guides */}
      <section className="border-b border-light-gray bg-off-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-black sm:text-4xl">
              Go Deeper
            </h2>
            <p className="mx-auto max-w-2xl text-dark-gray">
              Advanced strategies and specialized tools for specific situations
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {secondary.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} />
            ))}
          </div>
        </div>
      </section>

      {/* Bonus Guides */}
      <section className="border-b border-light-gray bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-black sm:text-4xl">
              Bonus Resources
            </h2>
            <p className="mx-auto max-w-2xl text-dark-gray">
              Specialized guides and references for particular interests
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {bonus.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} compact />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Pure B&W */}
      <section className="bg-black py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            All guides are completely free
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-base text-off-white sm:text-lg">
            Download instantly and start making smarter real estate decisions today.
            No credit card required, no spam.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-off-white">
              <Download className="h-4 w-4" />
              Instant Access
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-off-white">
              <FileText className="h-4 w-4" />
              PDF Format
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-off-white">
              <CheckCircle className="h-4 w-4" />
              No Email Required*
            </div>
          </div>
          <p className="mt-6 text-sm text-medium-gray">
            *Some premium guides may require email for access
          </p>
        </div>
      </section>
    </div>
  )
}

interface GuideCardProps {
  guide: typeof guides[0]
  featured?: boolean
  compact?: boolean
}

function GuideCard({ guide, featured = false, compact = false }: GuideCardProps) {
  const config = categoryConfig[guide.category as keyof typeof categoryConfig]
  const Icon = config.icon

  if (featured) {
    return (
      <Link href={`/guides/${guide.slug}`}>
        <div className="group h-full cursor-pointer rounded-lg border border-light-gray bg-white p-6 transition-all duration-300 hover:border-charcoal hover:shadow-lg">
          {/* Category Badge */}
          <div className="mb-4 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full bg-light-gray px-3 py-1 text-xs font-semibold text-black">
              <Icon className="h-3 w-3" />
              {config.label}
            </div>
            {guide.popular && (
              <div className="flex items-center gap-1 text-xs font-semibold text-dark-gray">
                <Star className="h-3 w-3 fill-black text-black" />
                Popular
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="mb-3 text-xl font-bold text-black transition-colors group-hover:text-charcoal">
            {guide.title}
          </h3>

          {/* Description */}
          <p className="mb-4 text-dark-gray line-clamp-2">
            {guide.description}
          </p>

          {/* Meta Info */}
          <div className="mb-4 flex items-center gap-3 text-sm text-medium-gray">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {guide.readTime}
            </span>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between border-t border-light-gray pt-4">
            <span className="text-sm font-semibold text-black transition-colors group-hover:text-charcoal">
              Download Free Guide
            </span>
            <ArrowRight className="h-4 w-4 text-black transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    )
  }

  if (compact) {
    return (
      <Link href={`/guides/${guide.slug}`}>
        <div className="group h-full cursor-pointer rounded-lg border border-light-gray bg-white p-5 transition-all duration-300 hover:border-charcoal hover:shadow-md">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-light-gray px-2.5 py-0.5 text-xs font-semibold text-black">
            <Icon className="h-3 w-3" />
            {config.label}
          </div>
          <h3 className="mb-2 text-base font-bold text-black transition-colors group-hover:text-charcoal line-clamp-2">
            {guide.title}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-xs text-medium-gray">{guide.readTime}</span>
            <ChevronRight className="h-4 w-4 text-medium-gray transition-all group-hover:text-black group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    )
  }

  // Default card (secondary)
  return (
    <Link href={`/guides/${guide.slug}`}>
      <div className="group flex h-full cursor-pointer flex-col rounded-lg border border-light-gray bg-white p-6 transition-all duration-300 hover:border-charcoal hover:shadow-lg">
        <div className="mb-4 flex items-start justify-between">
          <div className="inline-flex items-center gap-2 rounded-full bg-light-gray px-3 py-1 text-xs font-semibold text-black">
            <Icon className="h-3 w-3" />
            {config.label}
          </div>
          {guide.popular && (
            <div className="flex items-center gap-1 text-xs font-semibold text-dark-gray">
              <Star className="h-3 w-3 fill-black text-black" />
              Popular
            </div>
          )}
        </div>

        <h3 className="mb-3 text-lg font-bold text-black transition-colors group-hover:text-charcoal line-clamp-2">
          {guide.title}
        </h3>

        <p className="mb-4 text-sm text-dark-gray line-clamp-2 flex-1">
          {guide.description}
        </p>

        <div className="flex items-center justify-between border-t border-light-gray pt-4">
          <span className="text-xs text-medium-gray">{guide.readTime}</span>
          <div className="flex items-center gap-1 text-sm font-semibold text-black transition-colors group-hover:text-charcoal">
            Download
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  )
}