import { Metadata } from 'next'
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react'
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
      {/* Hero */}
      <section className="border-b border-border bg-white py-20 md:py-32">
        <div className="container-main text-center">
          <h1 className="text-page-title mb-6">
            Get in touch
          </h1>
          <p className="text-body-lg max-w-2xl mx-auto">
            Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 md:py-32">
        <div className="container-main max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-section-title mb-6">Send us a message</h2>
              
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-label mb-2">
                      First Name <span className="text-warning">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      className="w-full px-4 py-3 border-2 border-border rounded-md text-foreground focus:outline-none focus:border-foreground transition-colors bg-white"
                      placeholder="John"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-label mb-2">
                      Last Name <span className="text-warning">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      className="w-full px-4 py-3 border-2 border-border rounded-md text-foreground focus:outline-none focus:border-foreground transition-colors bg-white"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-label mb-2">
                    Email <span className="text-warning">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border-2 border-border rounded-md text-foreground focus:outline-none focus:border-foreground transition-colors bg-white"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-label mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-4 py-3 border-2 border-border rounded-md text-foreground focus:outline-none focus:border-foreground transition-colors bg-white"
                    placeholder="+263 71 234 5678"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-label mb-2">
                    Subject <span className="text-warning">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-4 py-3 border-2 border-border rounded-md text-foreground focus:outline-none focus:border-foreground transition-colors bg-white"
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
                  <label htmlFor="message" className="block text-label mb-2">
                    Message <span className="text-warning">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    className="w-full px-4 py-3 border-2 border-border rounded-md text-foreground focus:outline-none focus:border-foreground transition-colors resize-none bg-white"
                    placeholder="How can we help you?"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 bg-foreground text-white px-6 py-4 rounded-lg font-semibold hover:bg-black hover:shadow-xl transition-all"
                >
                  Send Message
                  <Send size={ICON_SIZES.lg} />
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="lg:pl-8">
              <h2 className="text-section-title mb-6">Contact Information</h2>
              <p className="text-secondary mb-8">
                Have an urgent issue? Reach out to us directly using any of the methods below.
              </p>

              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail size={ICON_SIZES.xl} className="text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-card-title-sm mb-1">Email</h3>
                    <a 
                      href="mailto:hello@huts.com" 
                      className="text-muted-foreground hover:text-foreground hover:underline"
                    >
                      hello@huts.com
                    </a>
                    <p className="text-small mt-1">We typically respond within 24 hours</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone size={ICON_SIZES.xl} className="text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-card-title-sm mb-1">Phone</h3>
                    <a 
                      href="tel:+263786470999" 
                      className="text-muted-foreground hover:text-foreground hover:underline"
                    >
                      +263 78 647 0999
                    </a>
                    <p className="text-small mt-1">Mon-Fri 8:00 AM - 6:00 PM CAT</p>
                  </div>
                </div>

                {/* Office */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin size={ICON_SIZES.xl} className="text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-card-title-sm mb-1">Office</h3>
                    <p className="text-muted-foreground">
                      123 Samora Machel Avenue<br />
                      Harare, Zimbabwe
                    </p>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={ICON_SIZES.xl} className="text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-card-title-sm mb-1">WhatsApp</h3>
                    <a 
                      href="https://wa.me/263786470999" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground hover:underline"
                    >
                      +263 78 647 0999
                    </a>
                    <p className="text-small mt-1">Message us anytime on WhatsApp</p>
                  </div>
                </div>
              </div>

              {/* FAQ Link */}
              <div className="mt-12 p-6 bg-muted border border-border rounded-lg">
                <h3 className="text-card-title-sm mb-2">Before you contact us...</h3>
                <p className="text-secondary mb-4">
                  Many common questions are answered in our Help Center. Check there first for quick answers.
                </p>
                <a 
                  href="/help"
                  className="text-sm text-foreground font-medium hover:underline inline-flex items-center gap-2"
                >
                  Visit Help Center
                  <Send size={ICON_SIZES.sm} />
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
