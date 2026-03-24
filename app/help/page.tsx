'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search, Home, MessageCircle, ChevronRight, ChevronDown,
  Phone, Mail, MapPin, Shield, ArrowRight,
} from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
  category: string
}

const faqs: FAQItem[] = [
  {
    category: 'Getting Started',
    question: 'How do I create an account?',
    answer: 'Click "Sign In" in the top right corner, then select "Sign Up". You can create an account using your email address or sign in with Google. It only takes 30 seconds and is completely free.',
  },
  {
    category: 'Getting Started',
    question: 'Is Huts free to use?',
    answer: 'Yes! Huts is completely free for both renters and landlords. There are no listing fees, no subscription costs, and no hidden charges. We believe in making property search accessible to everyone in Zimbabwe.',
  },
  {
    category: 'For Renters',
    question: 'How do I search for properties?',
    answer: 'Use the search page to filter by location, price range (rent or sale), number of bedrooms/bathrooms, property type, and more. You can also view properties on the map to see their exact location relative to schools, healthcare facilities, and other amenities.',
  },
  {
    category: 'For Renters',
    question: 'How do I contact a landlord?',
    answer: 'Each property listing has a "Contact Landlord" or "Send Inquiry" button. Click it to send a direct message. The landlord will receive a notification and can respond through our secure messaging system accessible in your dashboard.',
  },
  {
    category: 'For Renters',
    question: 'Can I save properties to view later?',
    answer: 'Yes! Click the heart icon on any property listing to save it to your favorites. Access all your saved properties anytime from your dashboard under "Saved Properties".',
  },
  {
    category: 'For Renters',
    question: 'What does "Student Housing" mean?',
    answer: 'Properties tagged as "Student Housing" are specifically suitable for university/college students. They are typically located near campuses, have flexible lease terms, and may offer amenities like shared kitchens or study areas.',
  },
  {
    category: 'For Landlords',
    question: 'How do I list a property?',
    answer: 'After creating an account, click "+ List Property" in the navigation bar. Fill in property details, upload high-quality photos (up to 1GB via our fast upload system), set your price, and publish. Listings are reviewed within 24 hours.',
  },
  {
    category: 'For Landlords',
    question: 'How long does verification take?',
    answer: "Property verification typically takes 24-48 hours. Our team reviews all details, photos, and information to ensure quality. You'll receive an email notification once your listing goes live.",
  },
  {
    category: 'For Landlords',
    question: 'Can I list multiple properties?',
    answer: 'Absolutely! There\'s no limit to the number of properties you can list. Manage all your listings from your dashboard under "My Properties" where you can edit, pause, or delete listings anytime.',
  },
  {
    category: 'For Landlords',
    question: 'What makes a good property listing?',
    answer: 'Include clear, well-lit photos from multiple angles. Write detailed descriptions highlighting key features, nearby amenities, and neighborhood info. Accurate pricing and complete details get 3x more inquiries than incomplete listings.',
  },
  {
    category: 'For Landlords',
    question: 'How do I manage inquiries?',
    answer: 'All inquiries appear in your dashboard under "Messages". You\'ll receive email notifications for new messages. Respond quickly—landlords who reply within 24 hours receive 5x more lease conversions.',
  },
  {
    category: 'Features',
    question: 'What is the map view feature?',
    answer: 'Our interactive map shows exact property locations along with nearby schools (primary, secondary, tertiary) and healthcare facilities (hospitals, clinics). This helps you evaluate neighborhoods and commute times before scheduling viewings.',
  },
  {
    category: 'Features',
    question: 'How do property reviews work?',
    answer: 'Renters who have contacted a landlord about a property can leave reviews. Reviews help build trust and provide honest feedback. Landlords can respond to reviews. All reviews are moderated for quality.',
  },
  {
    category: 'Features',
    question: 'What are Area Guides?',
    answer: 'Area Guides provide neighborhood insights including average rent prices, property types, local amenities, and community information for popular areas like Harare, Bulawayo, and other cities across Zimbabwe.',
  },
  {
    category: 'Safety & Trust',
    question: 'How do I report a suspicious listing?',
    answer: 'If you encounter a listing that seems fraudulent or violates our terms, click the "Report" button on the listing page or contact support@huts.co.zw immediately. We investigate all reports within 4 hours.',
  },
  {
    category: 'Safety & Trust',
    question: 'How can I verify a landlord is legitimate?',
    answer: 'Look for the "Verified" badge on profiles. Check property reviews from other renters. Always visit the property in person before paying deposits. Never send money to someone you have not met or whose property you have not seen.',
  },
  {
    category: 'Safety & Trust',
    question: 'What payment methods are safe?',
    answer: 'We recommend in-person payments or bank transfers only after signing a lease agreement. Never pay via mobile money to unverified contacts. Huts does not handle payments—all transactions are between landlord and renter.',
  },
  {
    category: 'Technical',
    question: "Why can't I see property photos?",
    answer: 'Photos may take a few seconds to load. Try refreshing the page or clearing your browser cache. If issues persist, the landlord may have removed images. Contact us if you continue experiencing problems.',
  },
  {
    category: 'Technical',
    question: "The map isn't loading. What should I do?",
    answer: "Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge). Check your internet connection. Disable browser extensions that might block maps. If the issue persists, contact support with your browser version.",
  },
]

const CATEGORIES = ['All', 'Getting Started', 'For Renters', 'For Landlords', 'Features', 'Safety & Trust', 'Technical']

const TOPIC_CARDS = [
  {
    icon: Search,
    title: 'For Renters',
    desc: 'Search, save, and contact landlords easily.',
    points: ['Advanced search filters', 'Direct secure messaging', 'Map view with amenities'],
    category: 'For Renters',
  },
  {
    icon: Home,
    title: 'For Landlords',
    desc: 'List your properties and manage everything from one place.',
    points: ['Free unlimited listings', '1 GB fast photo uploads', 'Inquiry management'],
    category: 'For Landlords',
  },
  {
    icon: MapPin,
    title: 'Platform Features',
    desc: 'Maps, schools, healthcare, reviews, and more.',
    points: ['Nearby schools & clinics', 'Interactive map view', 'Property reviews & ratings'],
    category: 'Features',
  },
  {
    icon: Shield,
    title: 'Safety & Trust',
    desc: 'Verified listings and fraud prevention built in.',
    points: ['Verified landlord badges', 'Fraud protection tools', 'Report suspicious activity'],
    category: 'Safety & Trust',
  },
]

function FAQRow({
  faq, index, open, setOpen,
}: {
  faq: FAQItem
  index: number
  open: number | null
  setOpen: (i: number | null) => void
}) {
  const isOpen = open === index
  return (
    <div className="bg-white border border-[#E9ECEF] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(isOpen ? null : index)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#F9FAFB] transition-colors"
      >
        <div className="flex-1 pr-4 min-w-0">
          <span className="text-[10px] font-semibold text-[#ADB5BD] uppercase tracking-widest block mb-0.5">
            {faq.category}
          </span>
          <p className="text-sm font-semibold text-[#212529] leading-snug">{faq.question}</p>
        </div>
        <ChevronDown
          size={16}
          className={`text-[#9CA3AF] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-0 border-t border-[#F3F4F6]">
          <p className="text-sm text-[#495057] leading-relaxed pt-4">{faq.answer}</p>
        </div>
      )}
    </div>
  )
}

export default function HelpPage() {
  const [openFAQ, setOpenFAQ]            = useState<number | null>(null)
  const [searchQuery, setSearchQuery]    = useState('')
  const [selectedCategory, setSelected] = useState('All')

  const isFiltering = searchQuery !== '' || selectedCategory !== 'All'

  const filteredFAQs = faqs.filter(faq => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = !q || faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q)
    const matchesCat    = selectedCategory === 'All' || faq.category === selectedCategory
    return matchesSearch && matchesCat
  })

  return (
    <div className="min-h-screen bg-white">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="border-b border-[#E9ECEF]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#ADB5BD] mb-6">
            <Link href="/" className="hover:text-[#495057] transition-colors">Home</Link>
            <ChevronRight size={11} />
            <span className="text-[#495057]">Help Center</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-[#212529] mb-1">Help Center</h1>
          <p className="text-sm text-[#ADB5BD]">
            Guides and answers for landlords, renters, and agents in Zimbabwe
          </p>
        </div>
      </div>

      {/* ── Sticky filter bar ───────────────────────────────────────────── */}
      <div className="border-b border-[#E9ECEF] bg-[#F8F9FA] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ADB5BD] pointer-events-none" />
            <input
              type="text"
              placeholder="Search help articles…"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSelected('All') }}
              className="w-full pl-8 pr-3 py-2 text-sm border border-[#E9ECEF] rounded-lg bg-white text-[#212529] placeholder:text-[#ADB5BD] focus:outline-none focus:border-[#212529] transition-colors"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelected(e.target.value)}
            className="py-2 pl-3 pr-7 text-sm border border-[#E9ECEF] rounded-lg bg-white text-[#212529] focus:outline-none focus:border-[#212529] transition-colors appearance-none cursor-pointer"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {isFiltering && (
            <button
              onClick={() => { setSearchQuery(''); setSelected('All') }}
              className="text-xs text-[#ADB5BD] hover:text-[#495057] transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {isFiltering ? (
          /* ── Filtered FAQ list ──────────────────────────────────────── */
          <>
            <p className="text-sm text-[#495057] mb-6">
              <span className="font-semibold text-[#212529]">{filteredFAQs.length}</span>{' '}
              result{filteredFAQs.length !== 1 ? 's' : ''}
              {selectedCategory !== 'All' && (
                <span className="text-[#ADB5BD]"> · {selectedCategory}</span>
              )}
            </p>

            {filteredFAQs.length === 0 ? (
              <div className="text-center py-20 border border-[#E9ECEF] rounded-xl">
                <Search size={28} className="mx-auto text-[#ADB5BD] mb-3" />
                <p className="text-sm font-semibold text-[#212529] mb-1">No results found</p>
                <p className="text-sm text-[#ADB5BD]">Try a different keyword or category</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFAQs.map((faq, i) => (
                  <FAQRow key={i} faq={faq} index={i} open={openFAQ} setOpen={setOpenFAQ} />
                ))}
              </div>
            )}
          </>
        ) : (
          /* ── Default view ───────────────────────────────────────────── */
          <>
            {/* Topic cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {TOPIC_CARDS.map(card => {
                const Icon = card.icon
                return (
                  <button
                    key={card.category}
                    onClick={() => setSelected(card.category)}
                    className="group text-left bg-white border border-[#E9ECEF] rounded-xl p-5 hover:border-[#212529] hover:shadow-sm transition-all"
                  >
                    <div className="w-9 h-9 rounded-lg border border-[#E9ECEF] bg-[#F8F9FA] flex items-center justify-center mb-4 group-hover:border-[#D1D5DB] transition-colors">
                      <Icon size={16} className="text-[#6B7280] group-hover:text-[#212529] transition-colors" />
                    </div>
                    <p className="text-sm font-semibold text-[#212529] mb-1">{card.title}</p>
                    <p className="text-xs text-[#9CA3AF] leading-relaxed mb-3">{card.desc}</p>
                    <ul className="space-y-1">
                      {card.points.map(pt => (
                        <li key={pt} className="text-xs text-[#6B7280] flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-[#D1D5DB] shrink-0" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </button>
                )
              })}
            </div>

            {/* All FAQs */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#212529]">Frequently asked questions</h2>
              <p className="text-xs text-[#ADB5BD]">{faqs.length} articles</p>
            </div>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <FAQRow key={i} faq={faq} index={i} open={openFAQ} setOpen={setOpenFAQ} />
              ))}
            </div>
          </>
        )}

        {/* Still need help */}
        <div className="mt-12 border-t border-[#E9ECEF] pt-10">
          <p className="text-xs font-semibold text-[#ADB5BD] uppercase tracking-widest mb-5">Still need help?</p>
          <div className="grid sm:grid-cols-3 gap-4">
            <a
              href="mailto:hello@huts.co.zw"
              className="group flex items-start gap-4 p-5 bg-white border border-[#E9ECEF] rounded-xl hover:border-[#212529] hover:shadow-sm transition-all"
            >
              <div className="w-9 h-9 rounded-lg border border-[#E9ECEF] flex items-center justify-center shrink-0 group-hover:border-[#D1D5DB] transition-colors">
                <Mail size={16} className="text-[#6B7280]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#212529]">Email us</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">hello@huts.co.zw</p>
                <p className="text-xs text-[#9CA3AF]">Response within 24 hours</p>
              </div>
            </a>

            <a
              href="tel:+263786470999"
              className="group flex items-start gap-4 p-5 bg-white border border-[#E9ECEF] rounded-xl hover:border-[#212529] hover:shadow-sm transition-all"
            >
              <div className="w-9 h-9 rounded-lg border border-[#E9ECEF] flex items-center justify-center shrink-0 group-hover:border-[#D1D5DB] transition-colors">
                <Phone size={16} className="text-[#6B7280]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#212529]">Call us</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">+263 78 647 0999</p>
                <p className="text-xs text-[#9CA3AF]">Mon–Fri, 8am–6pm</p>
              </div>
            </a>

            <Link
              href="/contact"
              className="group flex items-start gap-4 p-5 bg-white border border-[#E9ECEF] rounded-xl hover:border-[#212529] hover:shadow-sm transition-all"
            >
              <div className="w-9 h-9 rounded-lg border border-[#E9ECEF] flex items-center justify-center shrink-0 group-hover:border-[#D1D5DB] transition-colors">
                <MessageCircle size={16} className="text-[#6B7280]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#212529]">Contact form</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">Fill out our detailed form</p>
                <p className="text-xs text-[#212529] flex items-center gap-1 mt-1">
                  Get started <ArrowRight size={11} />
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.slice(0, 10).map(faq => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: { '@type': 'Answer', text: faq.answer },
            })),
          }),
        }}
      />
    </div>
  )
}
