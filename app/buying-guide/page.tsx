import { Metadata } from 'next'
import BuyingGuideForm from '@/components/lead-magnets/BuyingGuideForm'
import { Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'The Ultimate Guide to Buying Property in Zimbabwe',
  description:
    'Master the art of buying property in Zimbabwe. Learn the step-by-step process, cost breakdown, red flags to avoid, and city-specific guides for Harare, Bulawayo, and beyond.',
  openGraph: {
    title: 'The Ultimate Guide to Buying Property in Zimbabwe',
    description:
      'Master the buying process with our comprehensive guide. Avoid costly mistakes and negotiate confidently.',
    type: 'website',
    url: 'https://www.huts.co.zw/buying-guide',
    images: [
      {
        url: 'https://www.huts.co.zw/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Buying Property Guide',
      },
    ],
  },
  keywords: [
    'buying property Zimbabwe',
    'property purchase guide',
    'Harare property buying',
    'Bulawayo property guide',
    'property transfer Zimbabwe',
    'conveyancing guide',
    'property costs Zimbabwe',
  ],
}

export default function BuyingGuidePage() {
  const benefits = [
    {
      title: 'Step-by-Step Process',
      description: 'From offer to transfer: exactly what happens at each stage',
    },
    {
      title: 'Complete Cost Breakdown',
      description: 'Transfer fees, stamp duty, conveyancing, and everything in between',
    },
    {
      title: 'Red Flags Checklist',
      description: 'Title deed issues, unpaid rates, boundary disputes, and more',
    },
    {
      title: 'City-Specific Guides',
      description: 'Different rules for Harare, Bulawayo, Mutare, and Victoria Falls',
    },
    {
      title: 'Legal Checklist',
      description: 'Before, during, and after your purchase — never miss a step',
    },
    {
      title: 'Expert Insider Tips',
      description: 'Strategies used by successful Zimbabwe property buyers',
    },
  ]

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-[#f8f9fa] py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            {/* Left Column: Content */}
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-[#212529] leading-tight mb-6">
                Master the Art of Buying Property in Zimbabwe
              </h1>

              <p className="text-lg text-[#495057] leading-relaxed mb-8">
                Buying property in Zimbabwe involves unique complexities—from title deed verification to navigating
                different council processes in each city. This comprehensive guide walks you through every step,
                eliminating costly mistakes and empowering confident negotiations.
              </p>

              <div className="space-y-3 mb-8">
                <p className="text-sm font-semibold text-[#212529] uppercase tracking-wide">What's Inside:</p>
                <ul className="space-y-2">
                  {[
                    '5 detailed chapters covering the entire buying process',
                    'Complete cost breakdown with real examples',
                    'Red flags checklist to identify fraudulent deals',
                    'City-specific guides (Harare, Bulawayo, Mutare, Victoria Falls)',
                    'Legal checklist from offer to registration',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check size={18} className="text-[#51CF66] flex-shrink-0 mt-0.5" />
                      <span className="text-[#212529]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-sm text-[#7c8288] mb-6">
                ✉️ Instant delivery to your email • 📱 Mobile-friendly PDF • 🔒 Privacy guaranteed
              </p>
            </div>

            {/* Right Column: Form */}
            <div className="bg-white rounded-lg border border-[#E9ECEF] p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-[#212529] mb-2">Get the Free Guide</h2>
              <p className="text-[#495057] text-sm mb-6">
                Plus, receive insider tips on how successful Zimbabwe property buyers negotiate better deals.
              </p>

              <BuyingGuideForm />

              <div className="mt-6 pt-6 border-t border-[#E9ECEF]">
                <p className="text-xs text-[#7c8288]">
                  We're committed to your privacy. You'll receive the guide immediately, plus two follow-up emails
                  over the next 3 days with additional buyer insights. Unsubscribe anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#E9ECEF]">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-[#212529] mb-12 text-center">What You'll Learn</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="p-6 border border-[#E9ECEF] rounded-lg hover:border-[#ADB5BD] transition-colors">
                <h3 className="text-lg font-semibold text-[#212529] mb-2">{benefit.title}</h3>
                <p className="text-[#495057] text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chapter Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#f8f9fa]">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-[#212529] mb-8 text-center">5 Chapters of Essential Knowledge</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-[#212529] mb-2">Chapter 1: The Buying Process</h3>
              <p className="text-[#495057]">
                Walk through each stage from making an offer to final transfer registration. Understand what happens at
                each step, typical timelines, and contingencies to include in your offer.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#212529] mb-2">Chapter 2: Complete Cost Breakdown</h3>
              <p className="text-[#495057]">
                No surprises at closing. Learn about transfer duty, conveyancing fees, stamp duty, valuation costs, and
                more with realistic examples based on property price ranges common in Zimbabwe.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#212529] mb-2">Chapter 3: Red Flags & Pitfalls</h3>
              <p className="text-[#495057]">
                Identify title deed issues, unpaid municipal rates, boundary disputes, structural defects, zoning
                violations, and other deal-killers before committing your earnest money.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#212529] mb-2">Chapter 4: City-Specific Guides</h3>
              <p className="text-[#495057]">
                Different cities = different processes. Get city-by-city information for Harare, Bulawayo, Mutare,
                Victoria Falls, and other regions, including market nuances and local council contacts.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#212529] mb-2">Chapter 5: Your Legal Checklist</h3>
              <p className="text-[#495057]">
                A comprehensive checklist covering everything from pre-offer research to post-registration steps. Print
                it out and check off each step as you go.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Trust */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#E9ECEF]">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-[#212529] mb-8">Who This Guide Is For</h2>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { title: 'First-Time Buyers', desc: 'No experience required. We explain every concept clearly.' },
              {
                title: 'Relocating Professionals',
                desc: 'Understand the process and city-specific considerations quickly.',
              },
              { title: 'Investors', desc: 'Learn cost structures and legal requirements to evaluate deals.' },
            ].map((group, idx) => (
              <div key={idx} className="p-6 border border-[#E9ECEF] rounded-lg bg-[#f8f9fa]">
                <h3 className="font-semibold text-[#212529] mb-2">{group.title}</h3>
                <p className="text-sm text-[#495057]">{group.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-[#495057] text-lg leading-relaxed">
            Whether you're buying your first home, relocating to Zimbabwe, or expanding your property portfolio, this
            guide provides the clarity and confidence you need to make informed decisions.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#f8f9fa] border-t border-[#E9ECEF]">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-[#212529] mb-6">Ready to Become a Confident Buyer?</h2>

          <p className="text-lg text-[#495057] mb-8">
            Get instant access to the complete guide, plus expert tips delivered to your inbox over the next 3 days.
          </p>

          <div className="bg-white rounded-lg border border-[#E9ECEF] p-8 max-w-md mx-auto">
            <BuyingGuideForm />
          </div>

          <p className="text-sm text-[#7c8288] mt-6">
            Join hundreds of Zimbabwe property buyers who are making smarter decisions.
          </p>
        </div>
      </section>

      {/* FAQ-style Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-[#212529] mb-8 text-center">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-[#212529] mb-2">How long is the guide?</h3>
              <p className="text-[#495057] text-sm">
                The comprehensive guide is 15–20 pages with detailed explanations, checklists, and examples tailored to
                Zimbabwe's property market.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-[#212529] mb-2">Will I get spammed?</h3>
              <p className="text-[#495057] text-sm">
                No. You'll receive the guide immediately, plus two follow-up emails over 3 days with additional buyer
                tips. You can unsubscribe anytime.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-[#212529] mb-2">Is this legal advice?</h3>
              <p className="text-[#495057] text-sm">
                No. This guide provides general information about Zimbabwe's property buying process. Always consult a
                qualified conveyancer and tax advisor for your specific situation.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-[#212529] mb-2">Can I share this with my partner?</h3>
              <p className="text-[#495057] text-sm">
                Absolutely! The guide is yours to share. If your partner wants personalized tips, they can sign up with
                their own email.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#212529] text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Get Started Today</h2>
        <p className="mb-6 text-[#e9ecef]">Your free guide is just one click away</p>
        <a
          href="#form"
          className="inline-block bg-white text-[#212529] font-semibold px-6 py-3 rounded hover:bg-[#f8f9fa] transition-colors"
        >
          Download Free Guide
        </a>
      </section>
    </main>
  )
}
