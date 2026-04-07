import { Metadata } from 'next'
import Link from 'next/link'
import { 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  FileText, 
  Users, 
  Star, 
  ArrowRight, 
  TrendingUp, 
  AlertCircle,
  Calculator,
  FileSignature,
  Download,
  DollarSign,
  Percent,
  Building2
} from 'lucide-react'
import { CommissionCalculatorWidget } from './commission-calculator-widget'

export const metadata: Metadata = {
  title: 'Agent Commission Calculator & Proposal Templates | Real Estate Agents | Huts',
  description:
    'Professional tools for real estate agents. Commission calculator, client proposals, and marketing plan templates. Calculate your earnings instantly.',
  keywords: [
    'real estate commission calculator',
    'agent commission calculator',
    'proposal templates for agents',
    'real estate marketing plan',
    'listing presentation tools',
    'Zimbabwe real estate agent',
  ],
  openGraph: {
    title: 'Agent Commission Calculator & Proposal Templates',
    description:
      'Free toolkit for real estate agents: calculate commissions, generate professional proposals, and win more listings.',
    type: 'website',
    url: 'https://huts.co.zw/tools/agent-commission-calculator',
  },
}

const features = [
  'Instant commission calculations with custom splits',
  'Professional proposal templates ready to customize',
  'Marketing plan generator for listing presentations',
  'Pricing strategy worksheets based on market data',
  'Client contract templates & checklists',
  'Performance tracking tools for your business',
  'Listing presentation slide templates',
  'Market analysis templates for buyer meetings',
  'Lead tracking sheets & CRM templates',
]

const testimonials = [
  {
    author: 'Tendai Moyo',
    role: 'Residential Agent, Harare',
    text: 'The commission calculator saves me hours of manual work. My clients love seeing the breakdown during listing presentations.',
    rating: 5,
  },
  {
    author: 'Patricia Dube',
    role: 'Commercial Agent, Bulawayo',
    text: 'The proposal templates look incredibly professional. I closed two deals last month using the marketing plan generator.',
    rating: 5,
  },
]

export default function AgentCommissionCalculatorPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header with Breadcrumb */}
      <div className="border-b border-[#E9ECEF]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#ADB5BD] mb-6">
            <Link href="/" className="hover:text-[#495057] transition-colors">Home</Link>
            <ChevronRight size={11} />
            <Link href="/tools" className="hover:text-[#495057] transition-colors">Tools</Link>
            <ChevronRight size={11} />
            <span className="text-[#495057]">Agent Commission Calculator</span>
          </nav>
          
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F8F9FA] px-3 py-1 text-xs font-semibold text-[#212529] mb-4">
              <Calculator className="h-3 w-3" />
              Free Professional Toolkit
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#212529] mb-4">
              Agent Commission Calculator & Proposal Templates
            </h1>
            <p className="text-sm md:text-base text-[#495057] mb-6">
              Professional tools for real estate agents. Calculate commissions instantly, 
              generate client-ready proposals, and access marketing templates to win more listings.
            </p>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs text-[#495057]">
                <CheckCircle className="h-3.5 w-3.5 text-[#212529]" />
                <span>5,000+ Active Agents</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#495057]">
                <TrendingUp className="h-3.5 w-3.5 text-[#212529]" />
                <span>Real-time Calculator</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#495057]">
                <FileSignature className="h-3.5 w-3.5 text-[#212529]" />
                <span>Editable Templates</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Hero Image / Tool Preview */}
            <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-[#E9ECEF] bg-gradient-to-br from-[#F8F9FA] to-white">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[#ADB5BD] p-6 text-center">
                <Calculator className="h-10 w-10 mb-3 text-[#212529] opacity-40" />
                <span className="text-sm font-medium text-[#212529]">Live commission calculator on the right</span>
                <span className="text-xs mt-1">Adjust property price, rate, and split to see instant results</span>
              </div>
            </div>

            {/* What You'll Get Section */}
            <section>
              <h2 className="text-lg font-bold text-[#212529] mb-4">What's Included in This Toolkit</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-[#212529] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[#495057]">{feature}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Critical Tip Box */}
            <section className="bg-[#F8F9FA] rounded-lg p-6 border-l-4 border-[#212529]">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-[#212529] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-[#212529] mb-1">Pro Tip: Commission Negotiation Strategy</h3>
                  <p className="text-sm text-[#495057]">
                    Always present your value proposition before discussing commission. Use our proposal templates 
                    to showcase your marketing plan, local expertise, and past results. Agents who use structured 
                    proposals close 3x more listings at full commission rates.
                  </p>
                </div>
              </div>
            </section>

            {/* Why This Toolkit Section */}
            <section className="bg-white rounded-lg p-6 border border-[#E9ECEF]">
              <h2 className="text-lg font-bold text-[#212529] mb-3">Why Professional Agents Choose This Toolkit</h2>
              <p className="text-sm text-[#495057] mb-4">
                In Zimbabwe's competitive real estate market, presenting professional calculations and polished proposals 
                sets you apart from the competition. This toolkit combines accurate financial tools with ready-to-use 
                templates that help you win listings, justify your commission, and streamline your workflow.
              </p>
              <div className="flex items-center gap-4 text-xs text-[#495057]">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  Built for Zimbabwe market
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  Updated for 2025 rates
                </span>
              </div>
            </section>

            {/* Testimonials */}
            <section>
              <h2 className="text-lg font-bold text-[#212529] mb-4">What Agents Are Saying</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials.map((testimonial, i) => (
                  <div key={i} className="rounded-lg border border-[#E9ECEF] p-5 bg-white">
                    <div className="flex gap-0.5 mb-3">
                      {[...Array(testimonial.rating)].map((_, j) => (
                        <Star key={j} className="h-3.5 w-3.5 fill-[#212529] text-[#212529]" />
                      ))}
                    </div>
                    <p className="text-sm text-[#495057] mb-3 italic">
                      "{testimonial.text}"
                    </p>
                    <div>
                      <p className="text-sm font-semibold text-[#212529]">{testimonial.author}</p>
                      <p className="text-xs text-[#ADB5BD]">{testimonial.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Sticky Calculator & CTA */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <CommissionCalculatorWidget />
            </div>
          </div>
        </div>
      </div>

      {/* Related Tools Section */}
      <div className="border-t border-[#E9ECEF] bg-[#F8F9FA] py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#212529]">More Tools for Agents</h2>
            <Link href="/tools" className="text-xs text-[#495057] hover:text-[#212529] transition-colors flex items-center gap-1">
              View all tools
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RelatedToolCard
              title="Home Valuation Tool & Property Estimator"
              description="Get instant property valuations based on Zimbabwe market data"
              slug="home-valuation-tool"
            />
            <RelatedToolCard
              title="Mortgage Affordability Calculator"
              description="Help clients understand their buying power with current rates"
              slug="mortgage-calculator"
            />
            <RelatedToolCard
              title="Rental Yield Calculator for Investors"
              description="Calculate ROI on investment properties across Zimbabwe"
              slug="rental-yield-calculator"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function RelatedToolCard({ title, description, slug }: { title: string; description: string; slug: string }) {
  return (
    <Link href={`/tools/${slug}`}>
      <div className="group h-full cursor-pointer rounded-lg border border-[#E9ECEF] bg-white p-5 transition-all duration-300 hover:border-[#212529] hover:shadow-md">
        <h3 className="text-base font-bold text-[#212529] mb-2 transition-colors group-hover:text-[#495057] line-clamp-2">
          {title}
        </h3>
        <p className="text-xs text-[#6C757D] mb-3 line-clamp-2">{description}</p>
        <div className="flex items-center justify-end">
          <ChevronRight className="h-4 w-4 text-[#ADB5BD] transition-all group-hover:text-[#212529] group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}