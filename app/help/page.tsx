import { Metadata } from 'next'
import Link from 'next/link'
import { Search, Home, User, MessageCircle, FileText, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Help Center - Huts',
  description: 'Get help with listing your property, searching for rentals, and using Huts.',
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-[#E9ECEF] bg-white py-20 md:py-32">
        <div className="container-main text-center">
          <h1 className="text-page-title mb-6">
            How can we help you?
          </h1>
          <p className="text-body-lg max-w-2xl mx-auto mb-10">
            Search our help center or browse popular topics below
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center border-2 border-[#E9ECEF] rounded-lg bg-white focus-within:border-[#212529] transition-colors">
              <Search size={20} className="ml-4 text-[#ADB5BD]" />
              <input
                type="text"
                placeholder="Search for help..."
                className="flex-1 px-4 py-4 outline-none bg-transparent text-[#212529] placeholder:text-[#ADB5BD]"
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
            <div className="border-2 border-[#E9ECEF] rounded-xl p-8 hover:border-[#212529] hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-[#F8F9FA] rounded-lg flex items-center justify-center mb-6">
                <Search size={24} className="text-[#212529]" />
              </div>
              <h3 className="text-subsection-title mb-3">For Renters</h3>
              <p className="text-secondary mb-6">
                Find answers about searching, viewing properties, and applying.
              </p>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="#" className="text-[#495057] hover:text-[#212529] hover:underline">
                    How to search for properties
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-[#495057] hover:text-[#212529] hover:underline">
                    Contacting landlords
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-[#495057] hover:text-[#212529] hover:underline">
                    Saving favorite properties
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-[#495057] hover:text-[#212529] hover:underline">
                    Understanding listings
                  </Link>
                </li>
              </ul>
            </div>

            {/* For Landlords */}
            <div className="border-2 border-[#E9ECEF] rounded-xl p-8 hover:border-[#212529] hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-[#F8F9FA] rounded-lg flex items-center justify-center mb-6">
                <Home size={24} className="text-[#212529]" />
              </div>
              <h3 className="text-subsection-title mb-3">For Landlords</h3>
              <p className="text-secondary mb-6">
                Learn how to list properties and manage inquiries.
              </p>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="#" className="text-[#495057] hover:text-[#212529] hover:underline">
                    How to list a property
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-[#495057] hover:text-[#212529] hover:underline">
                    Best practices for photos
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-[#495057] hover:text-[#212529] hover:underline">
                    Managing inquiries
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-[#495057] hover:text-[#212529] hover:underline">
                    Editing your listings
                  </Link>
                </li>
              </ul>
            </div>

            {/* Account & Billing */}
            <div className="border-2 border-[#E9ECEF] rounded-xl p-8 hover:border-[#212529] hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-[#F8F9FA] rounded-lg flex items-center justify-center mb-6">
                <User size={24} className="text-[#212529]" />
              </div>
              <h3 className="text-subsection-title mb-3">Account & Billing</h3>
              <p className="text-secondary mb-6">
                Manage your account, subscription, and payments.
              </p>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="#" className="text-[#495057] hover:text-[#212529] hover:underline">
                    Creating an account
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-[#495057] hover:text-[#212529] hover:underline">
                    Updating profile
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-[#495057] hover:text-[#212529] hover:underline">
                    Subscription plans
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-[#495057] hover:text-[#212529] hover:underline">
                    Payment methods
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-20 md:py-32 bg-[#F8F9FA] border-t border-[#E9ECEF]">
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
                className="block bg-white border border-[#E9ECEF] rounded-lg p-6 hover:border-[#212529] hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FileText size={20} className="text-[#ADB5BD]" />
                    <span className="font-medium text-[#212529] group-hover:underline">{article}</span>
                  </div>
                  <ArrowRight size={18} className="text-[#ADB5BD] group-hover:text-[#212529] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-white border-t border-[#E9ECEF]">
        <div className="container-main text-center max-w-2xl">
          <MessageCircle size={48} className="mx-auto text-[#212529] mb-6" />
          <h2 className="text-section-title mb-4">
            Still need help?
          </h2>
          <p className="text-muted-foreground mb-8">
            Can't find what you're looking for? Get in touch with our support team.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-[#212529] text-white px-8 py-4 rounded-lg font-semibold hover:bg-black hover:shadow-xl transition-all"
          >
            Contact Support
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
