import { Metadata } from 'next'
import Link from 'next/link'
import { Search, Home, User, MessageCircle, FileText, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Help Center - Huts',
  description: 'Get help with listing your property, searching for rentals, and using Huts. Guides for landlords and renters in Zimbabwe.',
  openGraph: {
    title: 'Help Center | Huts',
    description: 'Guides and support for listing properties and finding rentals on Huts.',
    url: 'https://www.huts.co.zw/help',
  },
  alternates: {
    canonical: 'https://www.huts.co.zw/help',
  },
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-border bg-white py-20 md:py-32">
        <div className="container-main text-center">
          <h1 className="text-page-title mb-6">
            How can we help you?
          </h1>
          <p className="text-body-lg max-w-2xl mx-auto mb-10">
            Search our help center or browse popular topics below
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center border-2 border-border rounded-lg bg-white focus-within:border-foreground transition-colors">
              <Search size={20} className="ml-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for help..."
                className="flex-1 px-4 py-4 outline-none bg-transparent text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 md:py-32">
        <div className="container-main">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* For Renters */}
            <div className="border-2 border-border rounded-xl p-8 hover:border-foreground hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-6">
                <Search size={24} className="text-foreground" />
              </div>
              <h3 className="text-subsection-title mb-3">For Renters</h3>
              <p className="text-secondary mb-6">
                Find answers about searching, viewing properties, and applying.
              </p>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground hover:underline">
                    How to search for properties
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground hover:underline">
                    Contacting landlords
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground hover:underline">
                    Saving favorite properties
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground hover:underline">
                    Understanding listings
                  </Link>
                </li>
              </ul>
            </div>

            {/* For Landlords */}
            <div className="border-2 border-border rounded-xl p-8 hover:border-foreground hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-6">
                <Home size={24} className="text-foreground" />
              </div>
              <h3 className="text-subsection-title mb-3">For Landlords</h3>
              <p className="text-secondary mb-6">
                Learn how to list properties and manage inquiries.
              </p>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground hover:underline">
                    How to list a property
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground hover:underline">
                    Best practices for photos
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground hover:underline">
                    Managing inquiries
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground hover:underline">
                    Editing your listings
                  </Link>
                </li>
              </ul>
            </div>

            {/* Account & Billing */}
            <div className="border-2 border-border rounded-xl p-8 hover:border-foreground hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-6">
                <User size={24} className="text-foreground" />
              </div>
              <h3 className="text-subsection-title mb-3">Account & Billing</h3>
              <p className="text-secondary mb-6">
                Manage your account, subscription, and payments.
              </p>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground hover:underline">
                    Creating an account
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground hover:underline">
                    Updating profile
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground hover:underline">
                    Subscription plans
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground hover:underline">
                    Payment methods
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-20 md:py-32 bg-muted border-t border-border">
        <div className="container-main max-w-4xl">
          <h2 className="text-section-title mb-12">Popular Articles</h2>
          
          <div className="space-y-4">
            {[
              'How long does it take for my listing to appear?',
              'What information should I include in my property description?',
              'How do I report a suspicious listing?',
              'Can I list multiple properties?',
              'What are the best times to list a property?',
              'How do I verify my identity?',
            ].map((article, index) => (
              <Link
                key={index}
                href="#"
                className="block bg-white border border-border rounded-lg p-6 hover:border-foreground hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FileText size={20} className="text-muted-foreground" />
                    <span className="font-medium text-foreground group-hover:underline">{article}</span>
                  </div>
                  <ArrowRight size={18} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-white border-t border-border">
        <div className="container-main text-center max-w-2xl">
          <MessageCircle size={48} className="mx-auto text-foreground mb-6" />
          <h2 className="text-section-title mb-4">
            Still need help?
          </h2>
          <p className="text-muted-foreground mb-8">
            Can&apos;t find what you&apos;re looking for? Get in touch with our support team.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-foreground text-white px-8 py-4 rounded-lg font-semibold hover:bg-black hover:shadow-xl transition-all"
          >
            Contact Support
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'How long does it take for my listing to appear?',
                acceptedAnswer: { '@type': 'Answer', text: 'Listings are reviewed within 24 hours and appear on the site once approved by our verification team.' },
              },
              {
                '@type': 'Question',
                name: 'Can I list multiple properties?',
                acceptedAnswer: { '@type': 'Answer', text: 'Yes, you can list unlimited properties for free on Huts. There are no limits on the number of listings per landlord.' },
              },
              {
                '@type': 'Question',
                name: 'How do I search for properties?',
                acceptedAnswer: { '@type': 'Answer', text: 'Use the search page to filter properties by location, price range, number of bedrooms, property type, and listing type (rent or sale).' },
              },
              {
                '@type': 'Question',
                name: 'Is Huts free to use?',
                acceptedAnswer: { '@type': 'Answer', text: 'Yes, Huts is completely free for both renters and landlords. There are no hidden fees or subscriptions.' },
              },
              {
                '@type': 'Question',
                name: 'How do I contact a landlord?',
                acceptedAnswer: { '@type': 'Answer', text: 'You can send an inquiry directly from any property listing page. The landlord will receive a notification and can respond through our messaging system.' },
              },
              {
                '@type': 'Question',
                name: 'How do I report a suspicious listing?',
                acceptedAnswer: { '@type': 'Answer', text: 'If you encounter a suspicious listing, contact our support team at support@huts.co.zw and we will investigate immediately.' },
              },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.huts.co.zw' },
              { '@type': 'ListItem', position: 2, name: 'Help Center', item: 'https://www.huts.co.zw/help' },
            ],
          }),
        }}
      />
    </div>
  )
}
