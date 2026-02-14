import { Metadata } from 'next'
import Link from 'next/link'
import { Check, ArrowRight, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pricing - Huts',
  description: 'List your property for free on Huts. No hidden fees, no subscriptions.',
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-[#E9ECEF] bg-white py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F8F9FA] rounded-full text-sm text-[#212529] mb-6">
            <Sparkles size={14} />
            100% Free
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#212529] mb-6">
            Free for everyone
          </h1>
          <p className="text-lg text-[#495057] max-w-2xl mx-auto">
            No fees. No subscriptions. No hidden charges. Just list your property and connect with renters.
          </p>
        </div>
      </section>

      {/* Single Free Plan */}
      <section className="py-20 md:py-32">
        <div className="max-w-xl mx-auto px-4">
          <div className="border-2 border-[#212529] rounded-2xl p-8 md:p-10 bg-white">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-[#212529] mb-2">Everything included</h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-[#212529]">$0</span>
                <span className="text-[#ADB5BD]">forever</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check size={20} className="text-[#212529] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#495057]">Unlimited property listings</span>
              </li>
              <li className="flex items-start gap-3">
                <Check size={20} className="text-[#212529] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#495057]">Upload up to 10 photos per property</span>
              </li>
              <li className="flex items-start gap-3">
                <Check size={20} className="text-[#212529] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#495057]">Direct messaging with renters</span>
              </li>
              <li className="flex items-start gap-3">
                <Check size={20} className="text-[#212529] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#495057]">Appear in search results</span>
              </li>
              <li className="flex items-start gap-3">
                <Check size={20} className="text-[#212529] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#495057]">Property analytics</span>
              </li>
              <li className="flex items-start gap-3">
                <Check size={20} className="text-[#212529] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#495057]">Review management</span>
              </li>
            </ul>

            <Link
              href="/dashboard/new-property"
              className="block w-full text-center px-6 py-3 bg-[#212529] text-white rounded-lg font-semibold hover:bg-black transition-all"
            >
              List Your Property
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32 bg-[#F8F9FA] border-t border-[#E9ECEF]">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#212529] text-center mb-12">
            Questions?
          </h2>
          
          <div className="space-y-4">
            <div className="bg-white border border-[#E9ECEF] rounded-lg p-5">
              <h3 className="font-semibold text-[#212529] mb-1">Why is it free?</h3>
              <p className="text-sm text-[#495057]">We're building the best rental platform in Zimbabwe. Right now, we're focused on growing our community of landlords and renters.</p>
            </div>

            <div className="bg-white border border-[#E9ECEF] rounded-lg p-5">
              <h3 className="font-semibold text-[#212529] mb-1">Will you charge in the future?</h3>
              <p className="text-sm text-[#495057]">We may introduce optional premium features later, but basic listing will always remain free.</p>
            </div>

            <div className="bg-white border border-[#E9ECEF] rounded-lg p-5">
              <h3 className="font-semibold text-[#212529] mb-1">How many properties can I list?</h3>
              <p className="text-sm text-[#495057]">As many as you want! There's no limit on the number of properties you can list.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white border-t border-[#E9ECEF]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#212529] mb-4">
            Start listing today
          </h2>
          <p className="text-[#495057] mb-8">
            Join landlords across Zimbabwe connecting with quality tenants.
          </p>
          <Link
            href="/dashboard/new-property"
            className="inline-flex items-center gap-2 bg-[#212529] text-white px-8 py-4 rounded-lg font-semibold hover:bg-black transition-all"
          >
            List Your Property
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
