import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ChevronRight, 
  CheckCircle, 
  Clock,
  FileText,
  Users,
  Star,
  ArrowRight,
  BookOpen,
  AlertCircle
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'The Ultimate Guide to Buying Property in Zimbabwe | Huts',
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
    title: 'The Ultimate Guide to Buying Property in Zimbabwe',
    description:
      'Master the property buying process with our comprehensive guide.',
    type: 'article',
    url: 'https://huts.co.zw/guides/buying-guide-zimbabwe',
  },
}

// OPTIMIZED: Removed suburb-specific and overly detailed financing
const features = [
  'Step-by-step buying process explained',
  'Complete breakdown of all costs and fees involved',
  'How to verify title deeds and check for red flags',
  'Legal requirements and regulations in Zimbabwe',
  'Tax implications and how to minimize transfer costs',
  'Comprehensive property inspection checklist',
  'Common mistakes first-time buyers make',
  'Overview of financing options and mortgage tips',
  'Negotiation strategies that work in Zimbabwe',
]

const testimonials = [
  {
    author: 'John Mwemba',
    role: 'First-time Buyer, Harare',
    text: 'This guide saved me thousands. I avoided a property with serious title issues thanks to the red flags checklist.',
    rating: 5,
  },
  {
    author: 'Sarah Ncube',
    role: 'Property Investor, Bulawayo',
    text: 'The cost breakdown alone was worth the download. Now I understand exactly what I need to budget for.',
    rating: 5,
  },
]

export default function BuyingGuidePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header with Breadcrumb */}
      <div className="border-b border-[#E9ECEF]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#ADB5BD] mb-6">
            <Link href="/" className="hover:text-[#495057] transition-colors">Home</Link>
            <ChevronRight size={11} />
            <Link href="/guides" className="hover:text-[#495057] transition-colors">Guides</Link>
            <ChevronRight size={11} />
            <span className="text-[#495057]">Buying Guide</span>
          </nav>
          
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F8F9FA] px-3 py-1 text-xs font-semibold text-[#212529] mb-4">
              <BookOpen className="h-3 w-3" />
              Free Downloadable Guide
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#212529] mb-4">
              The Ultimate Guide to Buying Property in Zimbabwe
            </h1>
            <p className="text-sm md:text-base text-[#495057] mb-6">
              Complete step-by-step guide to property purchase process in Zimbabwe. 
              Learn costs, legal requirements, red flags, and how to avoid costly mistakes.
            </p>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs text-[#495057]">
                <CheckCircle className="h-3.5 w-3.5 text-[#212529]" />
                <span>15,000+ Downloads</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#495057]">
                <Clock className="h-3.5 w-3.5 text-[#212529]" />
                <span>25 min read</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#495057]">
                <FileText className="h-3.5 w-3.5 text-[#212529]" />
                <span>PDF Format</span>
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
            {/* Hero Image */}
            <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-[#E9ECEF] bg-[#F8F9FA]">
              <div className="absolute inset-0 flex items-center justify-center text-[#ADB5BD]">
                <span className="text-sm">Guide cover image placeholder</span>
              </div>
            </div>

            {/* What You'll Learn Section */}
            <section>
              <h2 className="text-lg font-bold text-[#212529] mb-4">What You'll Learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-[#212529] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[#495057]">{feature}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Critical Warning Box */}
            <section className="bg-[#F8F9FA] rounded-lg p-6 border-l-4 border-[#212529]">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-[#212529] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-[#212529] mb-1">Critical: Title Deed Verification</h3>
                  <p className="text-sm text-[#495057]">
                    Title fraud is one of the biggest risks when buying property in Zimbabwe. 
                    This guide shows you exactly how to verify ownership and spot red flags before signing anything.
                  </p>
                </div>
              </div>
            </section>

            {/* Why This Guide Section */}
            <section className="bg-white rounded-lg p-6 border border-[#E9ECEF]">
              <h2 className="text-lg font-bold text-[#212529] mb-3">Why This Guide?</h2>
              <p className="text-sm text-[#495057] mb-4">
                Buying property in Zimbabwe can be complex, especially for first-time buyers. 
                This guide breaks down everything you need to know, from finding the right 
                property to signing the final paperwork.
              </p>
              <div className="flex items-center gap-4 text-xs text-[#495057]">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  Written by local experts
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  Updated with 2025 data
                </span>
              </div>
            </section>

            {/* Testimonials */}
            <section>
              <h2 className="text-lg font-bold text-[#212529] mb-4">What Readers Say</h2>
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

          {/* Right Column - Sticky CTA Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 rounded-lg border border-[#E9ECEF] bg-white p-6 shadow-sm">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-[#212529] mb-2">Free Download</div>
                <p className="text-xs text-[#ADB5BD]">Instant access • No credit card required</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-xs text-[#495057]">
                  <CheckCircle className="h-3.5 w-3.5 text-[#212529]" />
                  <span>24/7 Instant Access</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#495057]">
                  <CheckCircle className="h-3.5 w-3.5 text-[#212529]" />
                  <span>PDF Format - 25 pages</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#495057]">
                  <CheckCircle className="h-3.5 w-3.5 text-[#212529]" />
                  <span>Updated for 2025</span>
                </div>
              </div>

              <button className="w-full bg-[#212529] text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#495057] transition-colors mb-4">
                Download Free Guide
              </button>

              <p className="text-[10px] text-center text-[#ADB5BD]">
                By downloading, you agree to receive email updates. 
                You can unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Guides Section */}
      <div className="border-t border-[#E9ECEF] bg-[#F8F9FA] py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#212529]">You Might Also Like</h2>
            <Link href="/guides" className="text-xs text-[#495057] hover:text-[#212529] transition-colors flex items-center gap-1">
              View all guides
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RelatedGuideCard
              title="Landlord's Guide to Maximizing Rental Yield"
              slug="landlord-rental-yield"
              readTime="12 min read"
            />
            <RelatedGuideCard
              title="Home Valuation Tool & Property Estimator"
              slug="home-valuation-tool"
              readTime="8 min read"
            />
            <RelatedGuideCard
              title="Zimbabwe Property Laws & Regulations Cheat Sheet"
              slug="property-laws-cheat-sheet"
              readTime="25 min read"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function RelatedGuideCard({ title, slug, readTime }: { title: string; slug: string; readTime: string }) {
  return (
    <Link href={`/guides/${slug}`}>
      <div className="group h-full cursor-pointer rounded-lg border border-[#E9ECEF] bg-white p-5 transition-all duration-300 hover:border-[#212529] hover:shadow-md">
        <h3 className="text-base font-bold text-[#212529] mb-2 transition-colors group-hover:text-[#495057] line-clamp-2">
          {title}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#ADB5BD]">{readTime}</span>
          <ChevronRight className="h-4 w-4 text-[#ADB5BD] transition-all group-hover:text-[#212529] group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}