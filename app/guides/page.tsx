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
  Download
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
    bgClass: 'bg-gray-50',
    borderClass: 'border-gray-200',
    badgeClass: 'bg-gray-900',
  },
  renter: {
    label: 'For Renters',
    icon: Shield,
    bgClass: 'bg-gray-50',
    borderClass: 'border-gray-200',
    badgeClass: 'bg-gray-800',
  },
  landlord: {
    label: 'For Landlords',
    icon: Calculator,
    bgClass: 'bg-gray-50',
    borderClass: 'border-gray-200',
    badgeClass: 'bg-gray-700',
  },
  agent: {
    label: 'For Agents',
    icon: Star,
    bgClass: 'bg-gray-50',
    borderClass: 'border-gray-200',
    badgeClass: 'bg-gray-600',
  },
}

export default function GuidesPage() {
  const highPriority = guides.filter((g) => g.priority === 1)
  const secondary = guides.filter((g) => g.priority === 2)
  const bonus = guides.filter((g) => g.priority === 3)

  return (
    <div className="w-full bg-white">
      {/* Hero Section - Modern Black & White */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white py-20 sm:py-28 lg:py-32">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white">
              <BookOpen className="h-4 w-4" />
              Free Educational Resources
            </div>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Master Zimbabwe Real Estate
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl">
              Download free guides packed with expert insights, practical checklists, 
              and market data to help you buy, sell, or invest smarter.
            </p>
            
            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-gray-900" />
                <span>10+ Expert Guides</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-gray-900" />
                <span>Free Instant Download</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-gray-900" />
                <span>15,000+ Users</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Win Guides - Featured Section */}
      <section className="border-t border-gray-100 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-900">
              <Sparkles className="h-4 w-4" />
              Featured Resources
            </div>
            <h2 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">
              Start Here
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
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
      <section className="border-t border-gray-100 bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">
              Go Deeper
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
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
      <section className="border-t border-gray-100 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">
              Bonus Resources
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
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

      {/* Final CTA Section */}
      <section className="border-t border-gray-100 bg-gray-900 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            All guides are completely free
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-300">
            Download instantly and start making smarter real estate decisions today.
            No credit card required, no spam.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-gray-300">
              <Download className="h-4 w-4" />
              Instant Access
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-gray-300">
              <FileText className="h-4 w-4" />
              PDF Format
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-gray-300">
              <CheckCircle className="h-4 w-4" />
              No Email Required*
            </div>
          </div>
          <p className="mt-6 text-sm text-gray-400">
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
        <div className="group h-full cursor-pointer rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          {/* Category Badge */}
          <div className="mb-4 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-900">
              <Icon className="h-3 w-3" />
              {config.label}
            </div>
            {guide.popular && (
              <div className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                <Star className="h-3 w-3 fill-gray-900 text-gray-900" />
                Popular
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="mb-3 text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
            {guide.title}
          </h3>

          {/* Description */}
          <p className="mb-4 text-gray-600 line-clamp-2">
            {guide.description}
          </p>

          {/* Meta Info */}
          <div className="mb-4 flex items-center gap-3 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {guide.readTime}
            </span>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
              Download Free Guide
            </span>
            <ArrowRight className="h-4 w-4 text-gray-900 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    )
  }

  if (compact) {
    return (
      <Link href={`/guides/${guide.slug}`}>
        <div className="group h-full cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-300">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-900">
            <Icon className="h-3 w-3" />
            {config.label}
          </div>
          <h3 className="mb-2 text-base font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-2">
            {guide.title}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{guide.readTime}</span>
            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </Link>
    )
  }

  // Default card (secondary)
  return (
    <Link href={`/guides/${guide.slug}`}>
      <div className="group flex h-full cursor-pointer flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="mb-4 flex items-start justify-between">
          <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-900">
            <Icon className="h-3 w-3" />
            {config.label}
          </div>
          {guide.popular && (
            <div className="flex items-center gap-1 text-xs font-semibold text-gray-500">
              <Star className="h-3 w-3 fill-gray-900 text-gray-900" />
              Popular
            </div>
          )}
        </div>

        <h3 className="mb-3 text-lg font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-2">
          {guide.title}
        </h3>

        <p className="mb-4 text-sm text-gray-600 line-clamp-2 flex-1">
          {guide.description}
        </p>

        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-xs text-gray-400">{guide.readTime}</span>
          <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
            Download
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  )
}