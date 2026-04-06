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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#E9ECEF]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#ADB5BD] mb-6">
            <Link href="/" className="hover:text-[#495057] transition-colors">Home</Link>
            <ChevronRight size={11} />
            <span className="text-[#495057]">Guides</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-[#212529] mb-1">
            Master Zimbabwe Real Estate
          </h1>
          <p className="text-sm text-[#ADB5BD]">
            Download {guides.length} free guides packed with expert insights, practical checklists, and market data.
          </p>
        </div>
      </div>

      {/* Featured Guides - Start Here */}
      <section className="py-12 md:py-16 bg-[#F8F9FA]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-lg font-bold text-[#212529] mb-2">Start Here</h2>
            <p className="text-sm text-[#ADB5BD]">The most essential guides to kickstart your real estate journey</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {highPriority.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} featured />
            ))}
          </div>
        </div>
      </section>

      {/* Secondary Guides - Go Deeper */}
      <section className="py-12 md:py-16 bg-white border-t border-[#E9ECEF]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-lg font-bold text-[#212529] mb-2">Go Deeper</h2>
            <p className="text-sm text-[#ADB5BD]">Advanced strategies and specialized tools for specific situations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {secondary.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} />
            ))}
          </div>
        </div>
      </section>

      {/* Bonus Guides */}
      <section className="py-12 md:py-16 bg-[#F8F9FA] border-t border-[#E9ECEF]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-lg font-bold text-[#212529] mb-2">Bonus Resources</h2>
            <p className="text-sm text-[#ADB5BD]">Specialized guides and references for particular interests</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bonus.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} compact />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 md:py-16 bg-white border-t border-[#E9ECEF]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-lg font-bold text-[#212529] mb-2">
            All guides are completely free
          </h2>
          <p className="text-sm text-[#ADB5BD] max-w-2xl mx-auto">
            Download instantly and start making smarter real estate decisions today.
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
        <div className="group h-full cursor-pointer rounded-lg border border-[#E9ECEF] bg-white p-6 transition-all duration-300 hover:border-[#212529] hover:shadow-md">
          {/* Category Badge */}
          <div className="mb-4 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F8F9FA] px-3 py-1 text-xs font-semibold text-[#212529]">
              <Icon className="h-3 w-3" />
              {config.label}
            </div>
            {guide.popular && (
              <div className="flex items-center gap-1 text-xs font-semibold text-[#495057]">
                <Star className="h-3 w-3 fill-[#212529] text-[#212529]" />
                Popular
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="mb-3 text-lg font-bold text-[#212529] transition-colors group-hover:text-[#495057]">
            {guide.title}
          </h3>

          {/* Description */}
          <p className="mb-4 text-[#495057] line-clamp-2 text-sm">
            {guide.description}
          </p>

          {/* Meta Info */}
          <div className="mb-4 flex items-center gap-3 text-xs text-[#ADB5BD]">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {guide.readTime}
            </span>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between border-t border-[#E9ECEF] pt-4">
            <span className="text-sm font-semibold text-[#212529] transition-colors group-hover:text-[#495057]">
              Download Guide
            </span>
            <ArrowRight className="h-4 w-4 text-[#212529] transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    )
  }

  if (compact) {
    return (
      <Link href={`/guides/${guide.slug}`}>
        <div className="group h-full cursor-pointer rounded-lg border border-[#E9ECEF] bg-white p-5 transition-all duration-300 hover:border-[#212529] hover:shadow-md">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#F8F9FA] px-2.5 py-0.5 text-xs font-semibold text-[#212529]">
            <Icon className="h-3 w-3" />
            {config.label}
          </div>
          <h3 className="mb-2 text-base font-bold text-[#212529] transition-colors group-hover:text-[#495057] line-clamp-2">
            {guide.title}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#ADB5BD]">{guide.readTime}</span>
            <ChevronRight className="h-4 w-4 text-[#ADB5BD] transition-all group-hover:text-[#212529] group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    )
  }

  // Default card (secondary)
  return (
    <Link href={`/guides/${guide.slug}`}>
      <div className="group flex h-full cursor-pointer flex-col rounded-lg border border-[#E9ECEF] bg-white p-6 transition-all duration-300 hover:border-[#212529] hover:shadow-md">
        <div className="mb-4 flex items-start justify-between">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#F8F9FA] px-3 py-1 text-xs font-semibold text-[#212529]">
            <Icon className="h-3 w-3" />
            {config.label}
          </div>
          {guide.popular && (
            <div className="flex items-center gap-1 text-xs font-semibold text-[#495057]">
              <Star className="h-3 w-3 fill-[#212529] text-[#212529]" />
              Popular
            </div>
          )}
        </div>

        <h3 className="mb-3 text-lg font-bold text-[#212529] transition-colors group-hover:text-[#495057] line-clamp-2">
          {guide.title}
        </h3>

        <p className="mb-4 text-sm text-[#495057] line-clamp-2 flex-1">
          {guide.description}
        </p>

        <div className="flex items-center justify-between border-t border-[#E9ECEF] pt-4">
          <span className="text-xs text-[#ADB5BD]">{guide.readTime}</span>
          <div className="flex items-center gap-1 text-sm font-semibold text-[#212529] transition-colors group-hover:text-[#495057]">
            Download
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  )
}