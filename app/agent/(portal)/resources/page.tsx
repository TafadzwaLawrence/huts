'use client'

import Link from 'next/link'
import {
  ChevronRight,
  FileText,
  TrendingUp,
  Calculator,
  MapPin,
  MessageCircle,
  Phone,
  Mail,
  BookOpen,
  Users,
  DollarSign,
  Home,
  Inbox,
  Calendar,
  Shield,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'

// ─── Data ────────────────────────────────────────────────────────────────────

const TOOL_CARDS = [
  {
    icon: Calculator,
    title: 'Mortgage Calculator',
    desc: 'Share with buyers to estimate monthly repayments, down payment, and total ownership cost.',
    href: '/property/search',          // opens any property which has the calculator
    external: false,
    cta: 'Open Calculator',
  },
  {
    icon: TrendingUp,
    title: 'My Commissions',
    desc: 'Track paid, pending, and projected earnings across all active transactions.',
    href: '/agent/commissions',
    external: false,
    cta: 'View Commissions',
  },
  {
    icon: Home,
    title: 'My Properties',
    desc: 'See all listings you manage — edit details, update pricing, or remove sold/rented units.',
    href: '/agent/my-properties',
    external: false,
    cta: 'Manage Listings',
  },
  {
    icon: MapPin,
    title: 'Area Guides',
    desc: 'Neighbourhood insights you can share with clients — average rents, schools, amenities.',
    href: '/areas',
    external: false,
    cta: 'Browse Areas',
  },
]

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Capture the Lead',
    desc: 'Add every new enquiry under Leads before first contact so nothing slips through. Tag the lead type (Buyer, Seller, Rental) to filter later.',
    href: '/agent/leads',
    action: 'Go to Leads',
    icon: Inbox,
  },
  {
    step: '02',
    title: 'Convert to Client',
    desc: 'Once a lead has agreed to work with you, convert them to a Client. This unlocks the full relationship timeline and document history.',
    href: '/agent/clients',
    action: 'Go to Clients',
    icon: Users,
  },
  {
    step: '03',
    title: 'List the Property',
    desc: 'Use "List Property" to publish on Huts. High-quality photos and a detailed description get 3× more enquiries.',
    href: '/agent/new-property',
    action: 'List Property',
    icon: Home,
  },
  {
    step: '04',
    title: 'Schedule Viewings',
    desc: 'Log every viewing in your Calendar. Confirmed appointments reduce no-shows and keep clients engaged.',
    href: '/agent/calendar',
    action: 'Open Calendar',
    icon: Calendar,
  },
  {
    step: '05',
    title: 'Open a Transaction',
    desc: 'When an offer is accepted, open a Transaction to track the deal from offer to handover in one place.',
    href: '/agent/transactions',
    action: 'View Transactions',
    icon: FileText,
  },
  {
    step: '06',
    title: 'Close & Collect Commission',
    desc: 'Mark the transaction complete. Your commission record updates automatically and appears in your earnings history.',
    href: '/agent/commissions',
    action: 'View Commissions',
    icon: DollarSign,
  },
]

const FAQ_ITEMS = [
  {
    q: 'How do I list a property on behalf of a client?',
    a: 'Go to "List Property" in the nav or quick-add menu. Fill in the owner\'s details in the property form — the property will appear under your managed listings and flag you as the listing agent.',
  },
  {
    q: 'How does commission tracking work?',
    a: 'When you create a transaction, you set the sale/rental price and commission percentage. Once the transaction is marked complete, a commission record is generated automatically and shows in your Commissions dashboard.',
  },
  {
    q: 'What is the difference between a Lead and a Client?',
    a: 'A Lead is anyone who has expressed interest but not yet committed. A Client is a contact you have a working agreement with. Convert leads to clients once they sign an agency mandate or booking form.',
  },
  {
    q: 'Can I manage properties for multiple owners?',
    a: 'Yes. Each property you list is linked to your agent profile regardless of who the owner is. All your managed listings appear together under "My Properties".',
  },
  {
    q: 'How do I get a Premier badge?',
    a: 'Premier status is granted by the Huts team based on verified listing volume, review ratings, and platform activity. Contact support to learn more about eligibility.',
  },
  {
    q: 'How do I share an area guide with a client?',
    a: 'Navigate to Areas, open the relevant area guide, and copy the URL from your browser. You can share that link directly via WhatsApp, email, or your messaging thread in the portal.',
  },
]

// ─── Sub-components ──────────────────────────────────────────────────────────

function ToolCard({
  icon: Icon,
  title,
  desc,
  href,
  external,
  cta,
}: (typeof TOOL_CARDS)[number]) {
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="group flex flex-col bg-white border border-[#E9ECEF] rounded-xl p-5 hover:border-[#212529] hover:shadow-sm transition-all"
    >
      <div className="w-9 h-9 rounded-lg border border-[#E9ECEF] bg-[#F8F9FA] flex items-center justify-center mb-4 group-hover:border-[#D1D5DB] transition-colors">
        <Icon size={16} className="text-[#6B7280] group-hover:text-[#212529] transition-colors" />
      </div>
      <p className="text-sm font-semibold text-[#212529] mb-1">{title}</p>
      <p className="text-xs text-[#9CA3AF] leading-relaxed flex-1 mb-4">{desc}</p>
      <span className="flex items-center gap-1 text-xs font-semibold text-[#212529]">
        {cta}
        {external ? <ExternalLink size={11} /> : <ArrowRight size={11} />}
      </span>
    </Link>
  )
}

function WorkflowStep({
  step,
  title,
  desc,
  href,
  action,
  icon: Icon,
  last,
}: (typeof WORKFLOW_STEPS)[number] & { last: boolean }) {
  return (
    <div className="flex gap-4">
      {/* Spine */}
      <div className="flex flex-col items-center shrink-0">
        <div className="w-8 h-8 rounded-full bg-[#212529] text-white text-xs font-bold flex items-center justify-center shrink-0">
          {step}
        </div>
        {!last && <div className="w-px flex-1 bg-[#E9ECEF] mt-2" />}
      </div>
      {/* Content */}
      <div className={`pb-8 ${last ? '' : ''}`}>
        <div className="flex items-center gap-2 mb-1">
          <Icon size={14} className="text-[#9CA3AF]" />
          <p className="text-sm font-semibold text-[#212529]">{title}</p>
        </div>
        <p className="text-xs text-[#6B7280] leading-relaxed mb-2">{desc}</p>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#212529] hover:underline"
        >
          {action} <ArrowRight size={10} />
        </Link>
      </div>
    </div>
  )
}

function FAQRow({
  q,
  a,
  open,
  onToggle,
}: {
  q: string
  a: string
  open: boolean
  onToggle: () => void
}) {
  return (
    <div className="bg-white border border-[#E9ECEF] rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#F9FAFB] transition-colors"
      >
        <p className="text-sm font-semibold text-[#212529] pr-4 leading-snug">{q}</p>
        <ChevronRight
          size={15}
          className={`text-[#9CA3AF] shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 pt-0 border-t border-[#F3F4F6]">
          <p className="text-sm text-[#495057] leading-relaxed pt-4">{a}</p>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

import { useState } from 'react'

export default function AgentResourcesPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-[#F8F9FA]">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E9ECEF]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#ADB5BD] mb-5">
            <Link href="/agent/overview" className="hover:text-[#495057] transition-colors">Overview</Link>
            <ChevronRight size={11} />
            <span className="text-[#495057]">Resources</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-[#212529] mb-1">Agent Resources</h1>
          <p className="text-sm text-[#ADB5BD]">
            Tools, workflows, and answers built specifically for agents on the Huts platform.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

        {/* ── Tools & Links ───────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#212529]">Quick access</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TOOL_CARDS.map(card => (
              <ToolCard key={card.title} {...card} />
            ))}
          </div>
        </section>

        {/* ── Deal Workflow ────────────────────────────────────────────── */}
        <section>
          <div className="mb-6">
            <h2 className="text-base font-semibold text-[#212529] mb-1">
              End-to-end deal workflow
            </h2>
            <p className="text-xs text-[#9CA3AF]">
              Follow these six steps to take every deal from first contact to closed commission.
            </p>
          </div>
          <div className="bg-white border border-[#E9ECEF] rounded-xl p-6">
            {WORKFLOW_STEPS.map((s, i) => (
              <WorkflowStep key={s.step} {...s} last={i === WORKFLOW_STEPS.length - 1} />
            ))}
          </div>
        </section>

        {/* ── Platform Tips ────────────────────────────────────────────── */}
        <section>
          <h2 className="text-base font-semibold text-[#212529] mb-4">Platform tips</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: BookOpen,
                title: 'Better listing photos = more leads',
                body: 'Upload a minimum of 6 images. Include exterior, living room, kitchen, master bedroom, bathroom, and the view. Well-photographed listings get 3× more enquiries.',
              },
              {
                icon: Shield,
                title: 'Complete your agent profile',
                body: 'Agents with a full bio, service areas, and a profile photo receive more direct lead submissions from the Find an Agent page.',
              },
              {
                icon: TrendingUp,
                title: 'Respond to leads within 1 hour',
                body: 'Response time under 1 hour increases conversion to client by 40%. Use the Messages section to reply instantly from desktop or mobile.',
              },
              {
                icon: Users,
                title: 'Use Area Guides in client pitches',
                body: 'Share area guide links when presenting to buyers or tenants — they include school maps, healthcare locations, and rental benchmarks.',
              },
            ].map(tip => {
              const Icon = tip.icon
              return (
                <div key={tip.title} className="bg-white border border-[#E9ECEF] rounded-xl p-5 flex gap-4">
                  <div className="w-8 h-8 rounded-lg border border-[#E9ECEF] bg-[#F8F9FA] flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-[#6B7280]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#212529] mb-1">{tip.title}</p>
                    <p className="text-xs text-[#6B7280] leading-relaxed">{tip.body}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#212529]">Frequently asked questions</h2>
            <p className="text-xs text-[#ADB5BD]">{FAQ_ITEMS.length} articles</p>
          </div>
          <div className="space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <FAQRow
                key={i}
                q={item.q}
                a={item.a}
                open={openFAQ === i}
                onToggle={() => setOpenFAQ(openFAQ === i ? null : i)}
              />
            ))}
          </div>
        </section>

        {/* ── Support ─────────────────────────────────────────────────── */}
        <section>
          <div className="border-t border-[#E9ECEF] pt-10">
            <p className="text-xs font-semibold text-[#ADB5BD] uppercase tracking-widest mb-5">Need help?</p>
            <div className="grid sm:grid-cols-3 gap-4">
              <a
                href="mailto:agents@huts.co.zw"
                className="group flex items-start gap-4 p-5 bg-white border border-[#E9ECEF] rounded-xl hover:border-[#212529] hover:shadow-sm transition-all"
              >
                <div className="w-9 h-9 rounded-lg border border-[#E9ECEF] flex items-center justify-center shrink-0 group-hover:border-[#D1D5DB] transition-colors">
                  <Mail size={16} className="text-[#6B7280]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#212529]">Agent support</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">agents@huts.co.zw</p>
                  <p className="text-xs text-[#9CA3AF]">Response within 4 hours</p>
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
                  <p className="text-xs text-[#9CA3AF] mt-0.5">Detailed enquiries</p>
                  <p className="text-xs text-[#212529] flex items-center gap-1 mt-1">
                    Get started <ArrowRight size={11} />
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
