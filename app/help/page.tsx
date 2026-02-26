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
      <section className="border-b border-[#E9ECEF] bg-white py-16 md:py-24">
        <div className="container-main text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#212529] mb-4">
            How can we help you?
          </h1>
          <p className="text-lg text-[#495057] max-w-2xl mx-auto mb-8">
            Find answers, guides, and support for everything Huts
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex items-center border-2 border-[#E9ECEF] rounded-lg bg-white focus-within:border-[#212529] transition-colors">
              <Search size={20} className="ml-4 text-[#ADB5BD]" />
              <input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-4 outline-none bg-transparent text-[#212529] placeholder:text-[#ADB5BD]"
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center justify-center gap-8 flex-wrap text-sm">
            <div className="flex items-center gap-2 text-[#495057]">
              <CheckCircle size={16} className="text-[#51CF66]" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2 text-[#495057]">
              <Clock size={16} className="text-[#51CF66]" />
              <span>Avg. Response: 4 hours</span>
            </div>
            <div className="flex items-center gap-2 text-[#495057]">
              <Users size={16} className="text-[#51CF66]" />
              <span>10,000+ Users Helped</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 bg-[#F8F9FA] border-b border-[#E9ECEF]">
        <div className="container-main">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/dashboard/new-property"
              className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-[#E9ECEF] rounded-xl hover:border-[#212529] hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-[#F8F9FA] group-hover:bg-[#212529] rounded-lg flex items-center justify-center transition-colors">
                <Home size={24} className="text-[#212529] group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm font-medium text-[#212529] text-center">List Property</span>
            </Link>

            <Link
              href="/search"
              className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-[#E9ECEF] rounded-xl hover:border-[#212529] hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-[#F8F9FA] group-hover:bg-[#212529] rounded-lg flex items-center justify-center transition-colors">
                <Search size={24} className="text-[#212529] group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm font-medium text-[#212529] text-center">Search Homes</span>
            </Link>

            <Link
              href="/dashboard/messages"
              className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-[#E9ECEF] rounded-xl hover:border-[#212529] hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-[#F8F9FA] group-hover:bg-[#212529] rounded-lg flex items-center justify-center transition-colors">
                <MessageCircle size={24} className="text-[#212529] group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm font-medium text-[#212529] text-center">Messages</span>
            </Link>

            <Link
              href="/contact"
              className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-[#E9ECEF] rounded-xl hover:border-[#212529] hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-[#F8F9FA] group-hover:bg-[#212529] rounded-lg flex items-center justify-center transition-colors">
                <Phone size={24} className="text-[#212529] group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm font-medium text-[#212529] text-center">Contact Us</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Categories */}
      <section className="py-16 md:py-20">
        <div className="container-main">
          <h2 className="text-3xl font-bold text-[#212529] mb-10 text-center">Browse by Topic</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* For Renters */}
            <div className="border-2 border-[#E9ECEF] rounded-xl p-6 hover:border-[#212529] hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-[#F8F9FA] rounded-lg flex items-center justify-center mb-4">
                <Search size={24} className="text-[#212529]" />
              </div>
              <h3 className="text-lg font-bold text-[#212529] mb-2">For Renters</h3>
              <p className="text-sm text-[#495057] mb-4">
                Find homes, contact landlords, save favorites
              </p>
              <ul className="space-y-2 text-sm">
                <li className="text-[#495057] flex items-start gap-2">
                  <CheckCircle size={14} className="mt-0.5 text-[#51CF66] flex-shrink-0" />
                  <span>Advanced search filters</span>
                </li>
                <li className="text-[#495057] flex items-start gap-2">
                  <CheckCircle size={14} className="mt-0.5 text-[#51CF66] flex-shrink-0" />
                  <span>Direct messaging</span>
                </li>
                <li className="text-[#495057] flex items-start gap-2">
                  <CheckCircle size={14} className="mt-0.5 text-[#51CF66] flex-shrink-0" />
                  <span>Map view with amenities</span>
                </li>
              </ul>
            </div>

            {/* For Landlords */}
            <div className="border-2 border-[#E9ECEF] rounded-xl p-6 hover:border-[#212529] hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-[#F8F9FA] rounded-lg flex items-center justify-center mb-4">
                <Home size={24} className="text-[#212529]" />
              </div>
              <h3 className="text-lg font-bold text-[#212529] mb-2">For Landlords</h3>
              <p className="text-sm text-[#495057] mb-4">
                List properties, manage inquiries, get verified
              </p>
              <ul className="space-y-2 text-sm">
                <li className="text-[#495057] flex items-start gap-2">
                  <CheckCircle size={14} className="mt-0.5 text-[#51CF66] flex-shrink-0" />
                  <span>Free unlimited listings</span>
                </li>
                <li className="text-[#495057] flex items-start gap-2">
                  <CheckCircle size={14} className="mt-0.5 text-[#51CF66] flex-shrink-0" />
                  <span>1GB photo uploads</span>
                </li>
                <li className="text-[#495057] flex items-start gap-2">
                  <CheckCircle size={14} className="mt-0.5 text-[#51CF66] flex-shrink-0" />
                  <span>Inquiry management</span>
                </li>
              </ul>
            </div>

            {/* Platform Features */}
            <div className="border-2 border-[#E9ECEF] rounded-xl p-6 hover:border-[#212529] hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-[#F8F9FA] rounded-lg flex items-center justify-center mb-4">
                <MapPin size={24} className="text-[#212529]" />
              </div>
              <h3 className="text-lg font-bold text-[#212529] mb-2">Platform Features</h3>
              <p className="text-sm text-[#495057] mb-4">
                Schools, healthcare, map view, reviews
              </p>
              <ul className="space-y-2 text-sm">
                <li className="text-[#495057] flex items-start gap-2">
                  <CheckCircle size={14} className="mt-0.5 text-[#51CF66] flex-shrink-0" />
                  <span>Nearby schools & clinics</span>
                </li>
                <li className="text-[#495057] flex items-start gap-2">
                  <CheckCircle size={14} className="mt-0.5 text-[#51CF66] flex-shrink-0" />
                  <span>Interactive maps</span>
                </li>
                <li className="text-[#495057] flex items-start gap-2">
                  <CheckCircle size={14} className="mt-0.5 text-[#51CF66] flex-shrink-0" />
                  <span>Property reviews</span>
                </li>
              </ul>
            </div>

            {/* Safety & Trust */}
            <div className="border-2 border-[#E9ECEF] rounded-xl p-6 hover:border-[#212529] hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-[#F8F9FA] rounded-lg flex items-center justify-center mb-4">
                <Shield size={24} className="text-[#212529]" />
              </div>
              <h3 className="text-lg font-bold text-[#212529] mb-2">Safety & Trust</h3>
              <p className="text-sm text-[#495057] mb-4">
                Verification, fraud prevention, reporting
              </p>
              <ul className="space-y-2 text-sm">
                <li className="text-[#495057] flex items-start gap-2">
                  <CheckCircle size={14} className="mt-0.5 text-[#51CF66] flex-shrink-0" />
                  <span>Verified listings</span>
                </li>
                <li className="text-[#495057] flex items-start gap-2">
                  <CheckCircle size={14} className="mt-0.5 text-[#51CF66] flex-shrink-0" />
                  <span>Fraud protection</span>
                </li>
                <li className="text-[#495057] flex items-start gap-2">
                  <CheckCircle size={14} className="mt-0.5 text-[#51CF66] flex-shrink-0" />
                  <span>Report suspicious activity</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20 bg-[#F8F9FA] border-y border-[#E9ECEF]">
        <div className="container-main max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#212529] mb-4">Frequently Asked Questions</h2>
            <p className="text-[#495057]">Get instant answers to common questions</p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-[#212529] text-white shadow-md'
                    : 'bg-white text-[#495057] border border-[#E9ECEF] hover:border-[#212529]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-3">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <Search size={48} className="mx-auto text-[#ADB5BD] mb-4" />
                <p className="text-[#495057]">No results found. Try a different search term.</p>
              </div>
            ) : (
              filteredFAQs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white border border-[#E9ECEF] rounded-xl overflow-hidden transition-all hover:shadow-md"
                >
                  <button
                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-[#F8F9FA] transition-colors"
                  >
                    <div className="flex-1">
                      <span className="text-xs font-medium text-[#ADB5BD] uppercase tracking-wide mb-1 block">
                        {faq.category}
                      </span>
                      <h3 className="font-semibold text-[#212529]">{faq.question}</h3>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`ml-4 text-[#ADB5BD] flex-shrink-0 transition-transform ${
                        openFAQ === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFAQ === index && (
                    <div className="px-6 pb-6">
                      <p className="text-[#495057] leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-16 bg-white border-t border-[#E9ECEF]">
        <div className="container-main">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-[#212529] mb-4">
              Still need help?
            </h2>
            <p className="text-[#495057]">
              Our support team is here for you. Choose the best way to reach us.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Email Support */}
            <a
              href="mailto:hello@huts.co.zw"
              className="border-2 border-[#E9ECEF] rounded-2xl p-8 hover:border-[#212529] hover:shadow-xl transition-all group text-center"
            >
              <div className="w-16 h-16 bg-[#F8F9FA] group-hover:bg-[#212529] rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                <Mail size={32} className="text-[#212529] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-[#212529] mb-2">Email Us</h3>
              <p className="text-sm text-[#495057] mb-3">
                Response within 24 hours
              </p>
              <p className="text-sm font-medium text-[#212529]">
                hello@huts.co.zw
              </p>
            </a>

            {/* Phone Support */}
            <a
              href="tel:+263786470999"
              className="border-2 border-[#E9ECEF] rounded-2xl p-8 hover:border-[#212529] hover:shadow-xl transition-all group text-center"
            >
              <div className="w-16 h-16 bg-[#F8F9FA] group-hover:bg-[#212529] rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                <Phone size={32} className="text-[#212529] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-[#212529] mb-2">Call Us</h3>
              <p className="text-sm text-[#495057] mb-3">
                Monday - Friday, 8am - 6pm
              </p>
              <p className="text-sm font-medium text-[#212529]">
                +263 78 647 0999
              </p>
            </a>

            {/* Contact Form */}
            <Link
              href="/contact"
              className="border-2 border-[#212529] bg-[#212529] rounded-2xl p-8 hover:bg-black hover:border-black hover:shadow-xl transition-all group text-center"
            >
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                <MessageCircle size={32} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Contact Form</h3>
              <p className="text-sm text-white/80 mb-3">
                Fill out our detailed form
              </p>
              <p className="text-sm font-medium text-white flex items-center justify-center gap-2">
                Get Started <ArrowRight size={16} />
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
