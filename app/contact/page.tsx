import { Metadata } from 'next'
import { Mail, Phone, MapPin, Send, MessageSquare, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { ICON_SIZES } from '@/lib/brand'

export const metadata: Metadata = {
  title: 'Contact Us - Huts',
  description: 'Get in touch with the Huts team. We\'re here to help with any questions about finding or listing rental properties in Zimbabwe.',
  openGraph: {
    title: 'Contact Us | Huts',
    description: 'Get in touch with the Huts team for help with renting or listing properties in Zimbabwe.',
    url: 'https://www.huts.co.zw/contact',
  },
  alternates: {
    canonical: 'https://www.huts.co.zw/contact',
  },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#E9ECEF]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#ADB5BD] mb-6">
            <Link href="/" className="hover:text-[#495057] transition-colors">Home</Link>
            <ChevronRight size={11} />
            <span className="text-[#495057]">Contact Us</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-[#212529] mb-1">
            Get in touch
          </h1>
          <p className="text-sm text-[#ADB5BD]">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </div>

      {/* Contact Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-bold text-[#212529] mb-6">Send us a message</h2>
              
              <form className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-[#212529] mb-2">
                      First Name <span className="text-[#FF6B6B]">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      className="w-full px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] placeholder:text-[#ADB5BD] focus:outline-none focus:border-[#212529] transition-colors bg-white"
                      placeholder="John"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-[#212529] mb-2">
                      Last Name <span className="text-[#FF6B6B]">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      className="w-full px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] placeholder:text-[#ADB5BD] focus:outline-none focus:border-[#212529] transition-colors bg-white"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#212529] mb-2">
                    Email <span className="text-[#FF6B6B]">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] placeholder:text-[#ADB5BD] focus:outline-none focus:border-[#212529] transition-colors bg-white"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[#212529] mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] placeholder:text-[#ADB5BD] focus:outline-none focus:border-[#212529] transition-colors bg-white"
                    placeholder="+263 71 234 5678"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-[#212529] mb-2">
                    Subject <span className="text-[#FF6B6B]">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] focus:outline-none focus:border-[#212529] transition-colors bg-white"
                  >
                    <option value="">Select a subject</option>
                    <option value="listing">Listing a property</option>
                    <option value="searching">Searching for a property</option>
                    <option value="technical">Technical support</option>
                    <option value="billing">Billing & payments</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[#212529] mb-2">
                    Message <span className="text-[#FF6B6B]">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="w-full px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] placeholder:text-[#ADB5BD] focus:outline-none focus:border-[#212529] transition-colors resize-none bg-white"
                    placeholder="How can we help you?"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#212529] text-white px-6 py-3 rounded-lg font-medium hover:bg-black transition-colors"
                >
                  Send Message
                  <Send size={16} />
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-1">
              <h2 className="text-lg font-bold text-[#212529] mb-4">Get in touch</h2>
              <p className="text-sm text-[#495057] mb-6">
                Multiple ways to reach us. Choose what works best for you.
              </p>

              <div className="space-y-3">
                {/* Email */}
                <div className="p-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg hover:border-[#212529] transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    <Mail size={18} className="text-[#212529] flex-shrink-0 mt-0.5" />
                    <h3 className="text-sm font-medium text-[#212529]">Email</h3>
                  </div>
                  <a 
                    href="mailto:hello@huts.com" 
                    className="text-sm text-[#495057] hover:text-[#212529] hover:underline block"
                  >
                    hello@huts.com
                  </a>
                  <p className="text-xs text-[#ADB5BD] mt-2">Respond within 24 hours</p>
                </div>

                {/* Phone */}
                <div className="p-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg hover:border-[#212529] transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    <Phone size={18} className="text-[#212529] flex-shrink-0 mt-0.5" />
                    <h3 className="text-sm font-medium text-[#212529]">Phone</h3>
                  </div>
                  <a 
                    href="tel:+263786470999" 
                    className="text-sm text-[#495057] hover:text-[#212529] hover:underline block"
                  >
                    +263 78 647 0999
                  </a>
                  <p className="text-xs text-[#ADB5BD] mt-2">Mon-Fri 8:00 AM - 6:00 PM CAT</p>
                </div>

                {/* Office */}
                <div className="p-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg hover:border-[#212529] transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    <MapPin size={18} className="text-[#212529] flex-shrink-0 mt-0.5" />
                    <h3 className="text-sm font-medium text-[#212529]">Office</h3>
                  </div>
                  <p className="text-sm text-[#495057]">
                    123 Samora Machel Avenue<br />
                    Harare, Zimbabwe
                  </p>
                </div>

                {/* WhatsApp */}
                <div className="p-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg hover:border-[#212529] transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    <MessageSquare size={18} className="text-[#212529] flex-shrink-0 mt-0.5" />
                    <h3 className="text-sm font-medium text-[#212529]">WhatsApp</h3>
                  </div>
                  <a 
                    href="https://wa.me/263786470999" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#495057] hover:text-[#212529] hover:underline block"
                  >
                    +263 78 647 0999
                  </a>
                  <p className="text-xs text-[#ADB5BD] mt-2">Chat anytime</p>
                </div>
              </div>

              {/* FAQ Link */}
              <div className="mt-6 p-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg hover:border-[#212529] transition-colors">
                <h3 className="text-sm font-medium text-[#212529] mb-2">Before you contact us...</h3>
                <p className="text-xs text-[#495057] mb-3">
                  Check our Help Center for quick answers.
                </p>
                <a 
                  href="/help"
                  className="text-xs text-[#212529] font-medium hover:text-black transition-colors inline-flex items-center gap-1"
                >
                  Visit Help Center
                  <ChevronRight size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            name: 'Contact Huts',
            description: 'Get in touch with the Huts team for help with renting or listing properties in Zimbabwe.',
            url: 'https://www.huts.co.zw/contact',
            mainEntity: {
              '@type': 'Organization',
              name: 'Huts',
              url: 'https://www.huts.co.zw',
              email: 'hello@huts.co.zw',
              telephone: '+263786470999',
              address: {
                '@type': 'PostalAddress',
                streetAddress: '123 Samora Machel Avenue',
                addressLocality: 'Harare',
                addressCountry: 'ZW',
              },
            },
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
              { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://www.huts.co.zw/contact' },
            ],
          }),
        }}
      />
    </div>
  )
}
