'use client'

import { useState } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { 
  Search, Home, User, MessageCircle, FileText, ArrowRight, 
  ChevronDown, Phone, Mail, MapPin, Building2, Activity,
  Heart, Camera, Shield, Clock, CheckCircle, Users
} from 'lucide-react'

const metadata: Metadata = {
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

interface FAQItem {
  question: string
  answer: string
  category: string
}

const faqs: FAQItem[] = [
  {
    category: 'Getting Started',
    question: 'How do I create an account?',
    answer: 'Click "Sign In" in the top right corner, then select "Sign Up". You can create an account using your email address or sign in with Google. It only takes 30 seconds and is completely free.'
  },
  {
    category: 'Getting Started',
    question: 'Is Huts free to use?',
    answer: 'Yes! Huts is completely free for both renters and landlords. There are no listing fees, no subscription costs, and no hidden charges. We believe in making property search accessible to everyone in Zimbabwe.'
  },
  {
    category: 'For Renters',
    question: 'How do I search for properties?',
    answer: 'Use the search page to filter by location, price range (rent or sale), number of bedrooms/bathrooms, property type, and more. You can also view properties on the map to see their exact location relative to schools, healthcare facilities, and other amenities.'
  },
  {
    category: 'For Renters',
    question: 'How do I contact a landlord?',
    answer: 'Each property listing has a "Contact Landlord" or "Send Inquiry" button. Click it to send a direct message. The landlord will receive a notification and can respond through our secure messaging system accessible in your dashboard.'
  },
  {
    category: 'For Renters',
    question: 'Can I save properties to view later?',
    answer: 'Yes! Click the heart icon on any property listing to save it to your favorites. Access all your saved properties anytime from your dashboard under "Saved Properties".'
  },
  {
    category: 'For Renters',
    question: 'What does "Student Housing" mean?',
    answer: 'Properties tagged as "Student Housing" are specifically suitable for university/college students. They are typically located near campuses, have flexible lease terms, and may offer amenities like shared kitchens or study areas.'
  },
  {
    category: 'For Landlords',
    question: 'How do I list a property?',
    answer: 'After creating an account, click "+ List Property" in the navigation bar. Fill in property details, upload high-quality photos (up to 1GB via our fast upload system), set your price, and publish. Listings are reviewed within 24 hours.'
  },
  {
    category: 'For Landlords',
    question: 'How long does verification take?',
    answer: 'Property verification typically takes 24-48 hours. Our team reviews all details, photos, and information to ensure quality. You\'ll receive an email notification once your listing goes live.'
  },
  {
    category: 'For Landlords',
    question: 'Can I list multiple properties?',
    answer: 'Absolutely! There\'s no limit to the number of properties you can list. Manage all your listings from your dashboard under "My Properties" where you can edit, pause, or delete listings anytime.'
  },
  {
    category: 'For Landlords',
    question: 'What makes a good property listing?',
    answer: 'Include clear, well-lit photos from multiple angles. Write detailed descriptions highlighting key features, nearby amenities, and neighborhood info. Accurate pricing and complete details get 3x more inquiries than incomplete listings.'
  },
  {
    category: 'For Landlords',
    question: 'How do I manage inquiries?',
    answer: 'All inquiries appear in your dashboard under "Messages". You\'ll receive email notifications for new messages. Respond quickly—landlords who reply within 24 hours receive 5x more lease conversions.'
  },
  {
    category: 'Features',
    question: 'What is the map view feature?',
    answer: 'Our interactive map shows exact property locations along with nearby schools (primary, secondary, tertiary) and healthcare facilities (hospitals, clinics). This helps you evaluate neighborhoods and commute times before scheduling viewings.'
  },
  {
    category: 'Features',
    question: 'How do property reviews work?',
    answer: 'Renters who have contacted a landlord about a property can leave reviews. Reviews help build trust and provide honest feedback. Landlords can respond to reviews. All reviews are moderated for quality.'
  },
  {
    category: 'Features',
    question: 'What are Area Guides?',
    answer: 'Area Guides provide neighborhood insights including average rent prices, property types, local amenities, and community information for popular areas like Harare, Bulawayo, and other cities across Zimbabwe.'
  },
  {
    category: 'Safety & Trust',
    question: 'How do I report a suspicious listing?',
    answer: 'If you encounter a listing that seems fraudulent or violates our terms, click the "Report" button on the listing page or contact support@huts.co.zw immediately. We investigate all reports within 4 hours.'
  },
  {
    category: 'Safety & Trust',
    question: 'How can I verify a landlord is legitimate?',
    answer: 'Look for the "Verified" badge on profiles. Check property reviews from other renters. Always visit the property in person before paying deposits. Never send money to someone you haven\'t met or whose property you haven\'t seen.'
  },
  {
    category: 'Safety & Trust',
    question: 'What payment methods are safe?',
    answer: 'We recommend in-person payments or bank transfers only after signing a lease agreement. Never pay via mobile money to unverified contacts. Huts does not handle payments—all transactions are between landlord and renter.'
  },
  {
    category: 'Technical',
    question: 'Why can\'t I see property photos?',
    answer: 'Photos may take a few seconds to load. Try refreshing the page or clearing your browser cache. If issues persist, the landlord may have removed images. Contact us if you continue experiencing problems.'
  },
  {
    category: 'Technical',
    question: 'The map isn\'t loading. What should I do?',
    answer: 'Ensure you\'re using a modern browser (Chrome, Firefox, Safari, Edge). Check your internet connection. Disable browser extensions that might block maps. If the issue persists, contact support with your browser version.'
  }
]

export default function HelpPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const categories = ['All', ...Array.from(new Set(faqs.map(f => f.category)))]

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-[#E9ECEF] bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[#212529] mb-3 text-center">
            How can we help?
          </h1>
          <p className="text-base text-[#495057] mb-8 text-center">
            Find answers and get support
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ADB5BD]" size={20} />
              <input
                type="text"
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-[#E9ECEF] rounded-lg text-[#212529] placeholder:text-[#ADB5BD] focus:outline-none focus:border-[#212529] transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-10 bg-[#F8F9FA]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/dashboard/new-property"
              className="flex flex-col items-center gap-2 p-5 bg-white border border-[#E9ECEF] rounded-lg hover:border-[#212529] transition-colors"
            >
              <Home size={24} className="text-[#212529]" />
              <span className="text-sm font-medium text-[#212529] text-center">List a home</span>
            </Link>

            <Link
              href="/search"
              className="flex flex-col items-center gap-2 p-5 bg-white border border-[#E9ECEF] rounded-lg hover:border-[#212529] transition-colors"
            >
              <Search size={24} className="text-[#212529]" />
              <span className="text-sm font-medium text-[#212529] text-center">Search homes</span>
            </Link>

            <Link
              href="/dashboard/messages"
              className="flex flex-col items-center gap-2 p-5 bg-white border border-[#E9ECEF] rounded-lg hover:border-[#212529] transition-colors"
            >
              <MessageCircle size={24} className="text-[#212529]" />
              <span className="text-sm font-medium text-[#212529] text-center">Messages</span>
            </Link>

            <Link
              href="/contact"
              className="flex flex-col items-center gap-2 p-5 bg-white border border-[#E9ECEF] rounded-lg hover:border-[#212529] transition-colors"
            >
              <Phone size={24} className="text-[#212529]" />
              <span className="text-sm font-medium text-[#212529] text-center">Contact us</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Categories */}
      <section className="py-12 border-b border-[#E9ECEF]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-[#212529] mb-8">Popular topics</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* For Renters */}
            <div className="border border-[#E9ECEF] rounded-lg p-5 hover:border-[#212529] transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <Search size={20} className="text-[#212529]" />
                <h3 className="text-base font-bold text-[#212529]">For Renters</h3>
              </div>
              <p className="text-sm text-[#495057] mb-4">
                Search, save, and contact landlords
              </p>
              <ul className="space-y-2 text-sm text-[#495057]">
                <li>• Advanced search filters</li>
                <li>• Direct messaging</li>
                <li>• Map view with amenities</li>
              </ul>
            </div>

            {/* For Landlords */}
            <div className="border border-[#E9ECEF] rounded-lg p-5 hover:border-[#212529] transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <Home size={20} className="text-[#212529]" />
                <h3 className="text-base font-bold text-[#212529]">For Landlords</h3>
              </div>
              <p className="text-sm text-[#495057] mb-4">
                List properties and manage inquiries
              </p>
              <ul className="space-y-2 text-sm text-[#495057]">
                <li>• Free unlimited listings</li>
                <li>• 1GB photo uploads</li>
                <li>• Inquiry management</li>
              </ul>
            </div>

            {/* Platform Features */}
            <div className="border border-[#E9ECEF] rounded-lg p-5 hover:border-[#212529] transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <MapPin size={20} className="text-[#212529]" />
                <h3 className="text-base font-bold text-[#212529]">Features</h3>
              </div>
              <p className="text-sm text-[#495057] mb-4">
                Maps, schools, healthcare, reviews
              </p>
              <ul className="space-y-2 text-sm text-[#495057]">
                <li>• Nearby schools & clinics</li>
                <li>• Interactive maps</li>
                <li>• Property reviews</li>
              </ul>
            </div>

            {/* Safety & Trust */}
            <div className="border border-[#E9ECEF] rounded-lg p-5 hover:border-[#212529] transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <Shield size={20} className="text-[#212529]" />
                <h3 className="text-base font-bold text-[#212529]">Safety</h3>
              </div>
              <p className="text-sm text-[#495057] mb-4">
                Verification and fraud prevention
              </p>
              <ul className="space-y-2 text-sm text-[#495057]">
                <li>• Verified listings</li>
                <li>• Fraud protection</li>
                <li>• Report suspicious activity</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-[#F8F9FA]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#212529] mb-2">Frequently asked questions</h2>
            <p className="text-sm text-[#495057]">Quick answers to common questions</p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#212529] text-white'
                    : 'bg-white text-[#495057] border border-[#E9ECEF] hover:border-[#495057]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-2">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-[#E9ECEF]">
                <Search size={40} className="mx-auto text-[#ADB5BD] mb-3" />
                <p className="text-sm text-[#495057]">No results found. Try a different search.</p>
              </div>
            ) : (
              filteredFAQs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white border border-[#E9ECEF] rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-[#F8F9FA] transition-colors"
                  >
                    <div className="flex-1 pr-4">
                      <span className="text-xs font-medium text-[#ADB5BD] uppercase tracking-wide mb-1 block">
                        {faq.category}
                      </span>
                      <h3 className="text-base font-semibold text-[#212529]">{faq.question}</h3>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-[#495057] flex-shrink-0 transition-transform ${
                        openFAQ === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFAQ === index && (
                    <div className="px-5 pb-5 pt-0">
                      <p className="text-sm text-[#495057] leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-12 bg-white border-t border-[#E9ECEF]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#212529] mb-2">
              Still need help?
            </h2>
            <p className="text-sm text-[#495057]">
              Our support team is here for you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Email Support */}
            <a
              href="mailto:hello@huts.co.zw"
              className="border border-[#E9ECEF] rounded-lg p-6 hover:border-[#212529] transition-colors"
            >
              <Mail size={24} className="text-[#212529] mb-3" />
              <h3 className="text-base font-bold text-[#212529] mb-1">Email us</h3>
              <p className="text-sm text-[#495057] mb-2">
                Response within 24 hours
              </p>
              <p className="text-sm font-medium text-[#212529]">
                hello@huts.co.zw
              </p>
            </a>

            {/* Phone Support */}
            <a
              href="tel:+263786470999"
              className="border border-[#E9ECEF] rounded-lg p-6 hover:border-[#212529] transition-colors"
            >
              <Phone size={24} className="text-[#212529] mb-3" />
              <h3 className="text-base font-bold text-[#212529] mb-1">Call us</h3>
              <p className="text-sm text-[#495057] mb-2">
                Mon-Fri, 8am-6pm
              </p>
              <p className="text-sm font-medium text-[#212529]">
                +263 78 647 0999
              </p>
            </a>

            {/* Contact Form */}
            <Link
              href="/contact"
              className="border border-[#212529] rounded-lg p-6 hover:bg-[#212529] hover:text-white transition-colors group"
            >
              <MessageCircle size={24} className="text-[#212529] group-hover:text-white mb-3" />
              <h3 className="text-base font-bold text-[#212529] group-hover:text-white mb-1">Contact form</h3>
              <p className="text-sm text-[#495057] group-hover:text-white/80 mb-2">
                Fill out our detailed form
              </p>
              <p className="text-sm font-medium text-[#212529] group-hover:text-white flex items-center gap-1">
                Get started <ArrowRight size={14} />
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.slice(0, 10).map(faq => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: { '@type': 'Answer', text: faq.answer }
            })),
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
