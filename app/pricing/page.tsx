import { Metadata } from 'next'
import Link from 'next/link'
import { Check, ArrowRight, Sparkles } from 'lucide-react'

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
      {/* Hero */}
      <section className="border-b border-border bg-white py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm text-foreground mb-6">
            <Sparkles size={14} />
            100% Free
          </div>
          <h1 className="text-page-title mb-6">
            Free for everyone
          </h1>
          <p className="text-body-lg max-w-2xl mx-auto">
            No fees. No subscriptions. No hidden charges. Just list your property and connect with renters.
          </p>
        </div>
      </section>

      {/* Single Free Plan */}
      <section className="py-20 md:py-32">
        <div className="max-w-xl mx-auto px-4">
          <div className="border-2 border-foreground rounded-2xl p-8 md:p-10 bg-white">
            <div className="text-center mb-8">
              <h3 className="text-section-title mb-2">Everything included</h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-foreground">$0</span>
                <span className="text-muted-foreground">forever</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check size={20} className="text-foreground flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">Unlimited property listings</span>
              </li>
              <li className="flex items-start gap-3">
                <Check size={20} className="text-foreground flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">Upload up to 10 photos per property</span>
              </li>
              <li className="flex items-start gap-3">
                <Check size={20} className="text-foreground flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">Direct messaging with renters</span>
              </li>
              <li className="flex items-start gap-3">
                <Check size={20} className="text-foreground flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">Appear in search results</span>
              </li>
              <li className="flex items-start gap-3">
                <Check size={20} className="text-foreground flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">Property analytics</span>
              </li>
              <li className="flex items-start gap-3">
                <Check size={20} className="text-foreground flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">Review management</span>
              </li>
            </ul>

            <Link
              href="/dashboard/new-property"
              className="block w-full text-center px-6 py-3 bg-foreground text-white rounded-lg font-semibold hover:bg-black transition-all"
            >
              List Your Property
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32 bg-muted border-t border-border">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-section-title text-center mb-12">
            Questions?
          </h2>
          
          <div className="space-y-4">
            <div className="bg-white border border-border rounded-lg p-5">
              <h3 className="text-card-title-sm mb-1">Why is it free?</h3>
              <p className="text-secondary">We're building the best rental platform in Zimbabwe. Right now, we're focused on growing our community of landlords and renters.</p>
            </div>

            <div className="bg-white border border-border rounded-lg p-5">
              <h3 className="text-card-title-sm mb-1">Will you charge in the future?</h3>
              <p className="text-secondary">We may introduce optional premium features later, but basic listing will always remain free.</p>
            </div>

            <div className="bg-white border border-border rounded-lg p-5">
              <h3 className="text-card-title-sm mb-1">How many properties can I list?</h3>
              <p className="text-secondary">As many as you want! There's no limit on the number of properties you can list.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white border-t border-border">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-section-title mb-4">
            Start listing today
          </h2>
          <p className="text-muted-foreground mb-8">
            Join landlords across Zimbabwe connecting with quality tenants.
          </p>
          <Link
            href="/dashboard/new-property"
            className="inline-flex items-center gap-2 bg-foreground text-white px-8 py-4 rounded-lg font-semibold hover:bg-black transition-all"
          >
            List Your Property
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
