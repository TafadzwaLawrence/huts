import { Metadata } from 'next'
import Link from 'next/link'
import { Check, ArrowRight, Sparkles, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pricing — Free Property Listings | Huts',
  description: 'List your property for free on Huts. No hidden fees, no subscriptions. Connect directly with renters and buyers in Zimbabwe at zero cost.',
  openGraph: {
    title: 'Free Property Listings | Huts',
    description: 'List rental properties and homes for sale for free on Huts. No fees, no subscriptions.',
    url: 'https://www.huts.co.zw/pricing',
  },
  alternates: {
    canonical: 'https://www.huts.co.zw/pricing',
  },
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#E9ECEF]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#ADB5BD] mb-6">
            <Link href="/" className="hover:text-[#495057] transition-colors">Home</Link>
            <ChevronRight size={11} />
            <span className="text-[#495057]">Pricing</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-[#212529] mb-1">
            Simple, transparent pricing
          </h1>
          <p className="text-sm text-[#ADB5BD]">
            No fees. No subscriptions. No hidden charges. Just list your property and connect with renters.
          </p>
        </div>
      </div>

      {/* Pricing Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Features List */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-bold text-[#212529] mb-6">Everything included</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-[#F8F9FA] rounded-lg border border-[#E9ECEF]">
                  <Check size={18} className="text-[#212529] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#212529]">Unlimited property listings</p>
                    <p className="text-xs text-[#ADB5BD] mt-0.5">List as many properties as you want, no limits</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-[#F8F9FA] rounded-lg border border-[#E9ECEF]">
                  <Check size={18} className="text-[#212529] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#212529]">Upload up to 10 photos per property</p>
                    <p className="text-xs text-[#ADB5BD] mt-0.5">Showcase your properties with high-quality images</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-[#F8F9FA] rounded-lg border border-[#E9ECEF]">
                  <Check size={18} className="text-[#212529] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#212529]">Direct messaging with renters</p>
                    <p className="text-xs text-[#ADB5BD] mt-0.5">Communicate directly without sharing phone numbers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-[#F8F9FA] rounded-lg border border-[#E9ECEF]">
                  <Check size={18} className="text-[#212529] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#212529]">Appear in search results</p>
                    <p className="text-xs text-[#ADB5BD] mt-0.5">Get discovered by quality renters actively searching</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-[#F8F9FA] rounded-lg border border-[#E9ECEF]">
                  <Check size={18} className="text-[#212529] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#212529]">Property analytics</p>
                    <p className="text-xs text-[#ADB5BD] mt-0.5">Track views and engagement on your listings</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-[#F8F9FA] rounded-lg border border-[#E9ECEF]">
                  <Check size={18} className="text-[#212529] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#212529]">Review management</p>
                    <p className="text-xs text-[#ADB5BD] mt-0.5">Build trust with verified renter reviews</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg p-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white rounded-full text-xs text-[#212529] font-medium mb-3 border border-[#E9ECEF]">
                    <Sparkles size={12} />
                    100% Free
                  </div>
                  <p className="text-4xl font-bold text-[#212529] mb-1">$0</p>
                  <p className="text-xs text-[#ADB5BD]">forever</p>
                </div>

                <Link
                  href="/dashboard/new-property"
                  className="block w-full text-center px-6 py-3 bg-[#212529] text-white rounded-lg font-medium hover:bg-black transition-colors mb-4"
                >
                  Get Started
                </Link>
                <p className="text-xs text-[#ADB5BD] text-center">No credit card required</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* FAQ Section */}
      <section className="border-t border-[#E9ECEF] bg-[#F8F9FA] py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-bold text-[#212529] mb-6">
            Questions?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-[#E9ECEF] rounded-lg p-5 hover:border-[#212529] transition-colors">
              <h3 className="font-medium text-[#212529] mb-2">Why is it free?</h3>
              <p className="text-sm text-[#495057]">We're building the best rental platform in Zimbabwe. Right now, we're focused on growing our community of landlords and renters.</p>
            </div>

            <div className="bg-white border border-[#E9ECEF] rounded-lg p-5 hover:border-[#212529] transition-colors">
              <h3 className="font-medium text-[#212529] mb-2">Will you charge in the future?</h3>
              <p className="text-sm text-[#495057]">We may introduce optional premium features later, but basic listing will always remain free.</p>
            </div>

            <div className="bg-white border border-[#E9ECEF] rounded-lg p-5 hover:border-[#212529] transition-colors">
              <h3 className="font-medium text-[#212529] mb-2">How many properties can I list?</h3>
              <p className="text-sm text-[#495057]">As many as you want! There's no limit on the number of properties you can list.</p>
            </div>

            <div className="bg-white border border-[#E9ECEF] rounded-lg p-5 hover:border-[#212529] transition-colors">
              <h3 className="font-medium text-[#212529] mb-2">How do I get started?</h3>
              <p className="text-sm text-[#495057]">Click the "Get Started" button and sign up. You can create your first listing in just a few minutes.</p>
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="border-t border-[#E9ECEF] py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-[#212529] mb-3">
            Ready to start listing?
          </h2>
          <p className="text-sm text-[#ADB5BD] mb-8">
            Join landlords across Zimbabwe connecting with quality tenants today.
          </p>
          <Link
            href="/dashboard/new-property"
            className="inline-flex items-center gap-2 bg-[#212529] text-white px-8 py-3 rounded-lg font-medium hover:bg-black transition-colors"
          >
            List Your Property
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}
