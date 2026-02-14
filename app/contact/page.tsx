import { Metadata } from 'next'
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us - Huts',
  description: 'Get in touch with the Huts team. We\'re here to help with any questions about finding or listing rental properties.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-[#E9ECEF] bg-white py-20 md:py-32">
        <div className="container-main text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#212529] mb-6">
            Get in touch
          </h1>
          <p className="text-lg text-[#495057] max-w-2xl mx-auto">
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
              <h2 className="text-2xl font-bold text-[#212529] mb-6">Send us a message</h2>
              
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-[#212529] mb-2">
                      First Name <span className="text-[#FF6B6B]">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] focus:outline-none focus:border-[#212529] transition-colors bg-white"
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
                      className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] focus:outline-none focus:border-[#212529] transition-colors bg-white"
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
                    className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] focus:outline-none focus:border-[#212529] transition-colors bg-white"
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
                    className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] focus:outline-none focus:border-[#212529] transition-colors bg-white"
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
                    className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] focus:outline-none focus:border-[#212529] transition-colors bg-white"
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
                    rows={6}
                    required
                    className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] focus:outline-none focus:border-[#212529] transition-colors resize-none bg-white"
                    placeholder="How can we help you?"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#212529] text-white px-6 py-4 rounded-lg font-semibold hover:bg-black hover:shadow-xl transition-all"
                >
                  Send Message
                  <Send size={18} />
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="lg:pl-8">
              <h2 className="text-2xl font-bold text-[#212529] mb-6">Contact Information</h2>
              <p className="text-[#495057] mb-8">
                Have an urgent issue? Reach out to us directly using any of the methods below.
              </p>

              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#F8F9FA] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail size={24} className="text-[#212529]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#212529] mb-1">Email</h3>
                    <a 
                      href="mailto:hello@huts.com" 
                      className="text-[#495057] hover:text-[#212529] hover:underline"
                    >
                      hello@huts.com
                    </a>
                    <p className="text-xs text-[#ADB5BD] mt-1">We typically respond within 24 hours</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#F8F9FA] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone size={24} className="text-[#212529]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#212529] mb-1">Phone</h3>
                    <a 
                      href="tel:+263712345678" 
                      className="text-[#495057] hover:text-[#212529] hover:underline"
                    >
                      +263 71 234 5678
                    </a>
                    <p className="text-xs text-[#ADB5BD] mt-1">Mon-Fri 8:00 AM - 6:00 PM CAT</p>
                  </div>
                </div>

                {/* Office */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#F8F9FA] rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin size={24} className="text-[#212529]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#212529] mb-1">Office</h3>
                    <p className="text-[#495057]">
                      123 Samora Machel Avenue<br />
                      Harare, Zimbabwe
                    </p>
                  </div>
                </div>

                {/* Support */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#F8F9FA] rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={24} className="text-[#212529]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#212529] mb-1">Live Chat</h3>
                    <p className="text-[#495057] mb-2">
                      Chat with our support team
                    </p>
                    <button className="text-sm text-[#212529] font-medium border-2 border-[#212529] px-4 py-2 rounded-md hover:bg-[#212529] hover:text-white transition-all">
                      Start Chat
                    </button>
                  </div>
                </div>
              </div>

              {/* FAQ Link */}
              <div className="mt-12 p-6 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg">
                <h3 className="font-semibold text-[#212529] mb-2">Before you contact us...</h3>
                <p className="text-sm text-[#495057] mb-4">
                  Many common questions are answered in our Help Center. Check there first for quick answers.
                </p>
                <a 
                  href="/help"
                  className="text-sm text-[#212529] font-medium hover:underline inline-flex items-center gap-2"
                >
                  Visit Help Center
                  <Send size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
