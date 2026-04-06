'use client'

import Link from 'next/link'
import { useState } from 'react'
import { 
  ChevronRight, 
  CheckCircle, 
  Clock,
  Users,
  Star,
  ArrowRight,
  Calculator,
  DollarSign,
  AlertCircle,
  Download,
  Home,
  FileText,
  Scale,
  Landmark,
  Building,
  Shield,
  Briefcase,
  BookOpen,
  Gavel,
  Receipt,
  Key,
  FileCheck,
  AlertTriangle,
  TrendingUp,
  MapPin  
} from 'lucide-react'

// Legal topics data
const legalTopics = [
  {
    id: 'urban-councils',
    title: 'Urban Councils Act (Chapter 29:15)',
    icon: Building,
    summary: 'Governs municipal governance, property rates, building permits, and development approvals.',
    keyPoints: [
      'Property rates calculated based on property value',
      'Building permits required for any construction/renovation',
      'Council approval needed for change of land use',
      'Penalties for unapproved developments',
      'Right to appeal council decisions',
    ],
    penalties: 'Fines of up to Level 5 (approx. USD 600) or imprisonment for unauthorized developments',
  },
  {
    id: 'regional-planning',
    title: 'Regional Town and Country Planning Act',
    icon: MapPin,
    summary: 'Controls land use, zoning regulations, and development permits across Zimbabwe.',
    keyPoints: [
      'All land development requires planning permission',
      'Zoning determines permitted property use',
      'Subdivision of land requires council approval',
      'Environmental impact assessments may be required',
      'Development charges apply for new construction',
    ],
    penalties: 'Stop orders on construction + fines of up to Level 6 (approx. USD 800)',
  },
  {
    id: 'deeds-registry',
    title: 'Deeds Registries Act (Chapter 20:05)',
    icon: FileText,
    summary: 'Governs registration of property ownership, transfers, mortgages, and deeds.',
    keyPoints: [
      'All property transfers must be registered at Deeds Office',
      'Title deeds are conclusive proof of ownership',
      'Transfer duty payable within 30 days of transaction',
      'Mortgages must be registered to be enforceable',
      'Property searches essential before purchase',
    ],
    penalties: 'Unregistered transfers invalid - property ownership not recognized',
  },
  {
    id: 'zimra-tax',
    title: 'ZIMRA Property Tax Guide',
    icon: Receipt,
    summary: 'Tax obligations for property owners, sellers, and landlords.',
    keyPoints: [
      'Capital Gains Tax: 5-20% on property sales',
      'Withholding Tax: 15% on property sales by non-residents',
      'Rental Income Tax: Based on progressive rates (0-40%)',
      '1% Wealth Tax on properties valued over $100,000',
      'Annual property tax returns required',
    ],
    penalties: 'Interest at 25% per annum + penalties for late payment',
  },
  {
    id: 'tenant-rights',
    title: 'Landlord-Tenant Laws',
    icon: Users,
    summary: 'Rights and obligations under rental agreements and the VACANT Possession Act.',
    keyPoints: [
      'Written lease agreements legally required',
      'Security deposit max 2-3 months rent',
      '24-hour notice required for inspections',
      'Tenants cannot be evicted without court order',
      'Landlord must maintain property habitability',
    ],
    penalties: 'Illegal eviction = damages + legal costs for landlord',
  },
  {
    id: 'vacant-act',
    title: 'VACANT Possession Act',
    icon: Key,
    summary: 'Procedures for property handover, evictions, and vacant possession.',
    keyPoints: [
      'Vacant possession means property empty of people and belongings',
      'Eviction requires court order (no self-help evictions)',
      'Minimum notice periods: 30-90 days depending on lease',
      'Sheriff of the Court executes evictions',
      'Alternative dispute resolution encouraged',
    ],
    penalties: 'Self-help eviction = criminal offense + civil liability',
  },
]

// Quick reference FAQs
const quickFAQs = [
  {
    q: "Do I need a lawyer to buy property in Zimbabwe?",
    a: "While not legally required, it's highly recommended. A conveyancing lawyer handles title searches, transfer documents, and registration at Deeds Office."
  },
  {
    q: "How long does property transfer take?",
    a: "Typically 30-60 days from offer acceptance to registration, depending on Deeds Office processing times."
  },
  {
    q: "Can foreigners buy property in Zimbabwe?",
    a: "Yes, but require approval from the Minister of Local Government. Agricultural land restrictions apply."
  },
  {
    q: "What taxes apply when selling property?",
    a: "Capital Gains Tax (5-20%), Withholding Tax (15% for non-residents), and transfer fees."
  },
  {
    q: "How are property rates calculated?",
    a: "Based on property valuation by local council. Rates vary by city (Harare, Bulawayo, etc.)"
  }
]

// Legal topic component
function LegalTopicCard({ topic }: { topic: typeof legalTopics[0] }) {
  const Icon = topic.icon
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-[#E9ECEF] rounded-lg p-5 hover:border-[#212529] transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-[#212529]" />
          <h3 className="text-md font-bold text-[#212529]">{topic.title}</h3>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-[#495057] hover:text-[#212529]"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      </div>
      
      <p className="text-sm text-[#495057] mb-3">{topic.summary}</p>
      
      {expanded && (
        <div className="space-y-3 mt-4 pt-3 border-t border-[#E9ECEF]">
          <div>
            <h4 className="text-sm font-semibold text-[#212529] mb-2">Key Provisions:</h4>
            <ul className="space-y-1">
              {topic.keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#495057]">
                  <CheckCircle className="h-3.5 w-3.5 text-[#212529] mt-0.5 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#F8F9FA] p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-[#212529]">Penalties for Non-Compliance:</h4>
                <p className="text-xs text-[#495057] mt-1">{topic.penalties}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Main Component
export default function PropertyLawsCheatSheetPage() {
  const featuresList = [
    'Urban Councils Act explained (rates, permits, approvals)',
    'Regional Town and Country Planning Act summary (zoning, development)',
    'Deeds Registries Act requirements (title deeds, transfers)',
    'ZIMRA property tax guide (CGT, withholding tax, rental tax)',
    'Tenant rights and protections under Zimbabwe law',
    'Landlord legal obligations and VACANT Possession Act',
    'Property transfer process step-by-step',
    'Dispute resolution procedures (Rent Board, courts)',
    'Quick reference FAQ section',
    'Penalties for non-compliance by act',
    'Required documentation checklist',
    'Key deadlines and filing requirements',
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Breadcrumb */}
      <div className="border-b border-[#E9ECEF]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#ADB5BD] mb-6">
            <Link href="/" className="hover:text-[#495057] transition-colors">Home</Link>
            <ChevronRight size={11} />
            <Link href="/guides" className="hover:text-[#495057] transition-colors">Guides</Link>
            <ChevronRight size={11} />
            <span className="text-[#495057]">Legal Cheat Sheet</span>
          </nav>
          
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F8F9FA] px-3 py-1 text-xs font-semibold text-[#212529] mb-4">
              <Gavel className="h-3 w-3" />
              Free Legal Reference
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#212529] mb-4">
              Zimbabwe Property Laws & Regulations Cheat Sheet
            </h1>
            <p className="text-sm md:text-base text-[#495057] mb-6">
              Essential legal guide covering Urban Councils Act, Deeds Registry, ZIMRA taxes, 
              landlord-tenant laws, and property transfer procedures. Updated for 2025.
            </p>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs text-[#495057]">
                <CheckCircle className="h-3.5 w-3.5 text-[#212529]" />
                <span>6 Major Acts Covered</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#495057]">
                <Landmark className="h-3.5 w-3.5 text-[#212529]" />
                <span>ZIMRA Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#495057]">
                <Clock className="h-3.5 w-3.5 text-[#212529]" />
                <span>20 min read</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Legal Disclaimer */}
            <div className="bg-[#F8F9FA] rounded-lg p-4 border-l-4 border-[#212529]">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-[#212529] flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#212529] mb-1">Legal Disclaimer</p>
                  <p className="text-xs text-[#495057]">
                    This guide provides general information only and does not constitute legal advice. 
                    Laws may change, and individual circumstances vary. Always consult a qualified legal 
                    professional for specific property matters in Zimbabwe.
                  </p>
                </div>
              </div>
            </div>

            {/* Overview Section */}
            <section className="bg-white rounded-lg p-6 border border-[#E9ECEF]">
              <h2 className="text-lg font-bold text-[#212529] mb-3">Understanding Zimbabwe's Property Legal Framework</h2>
              <p className="text-sm text-[#495057] mb-4">
                Zimbabwe's property laws are governed by several key acts that regulate ownership, transfers, 
                taxation, and landlord-tenant relationships. Understanding these laws is essential for buyers, 
                sellers, landlords, and tenants to ensure compliance and protect their rights.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-[#495057]">
                  <CheckCircle className="h-4 w-4 text-[#212529]" />
                  <span>Deeds Registry Act</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#495057]">
                  <CheckCircle className="h-4 w-4 text-[#212529]" />
                  <span>Urban Councils Act</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#495057]">
                  <CheckCircle className="h-4 w-4 text-[#212529]" />
                  <span>Regional Planning Act</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#495057]">
                  <CheckCircle className="h-4 w-4 text-[#212529]" />
                  <span>VACANT Possession Act</span>
                </div>
              </div>
            </section>

            {/* Legal Topics */}
            <section>
              <h2 className="text-lg font-bold text-[#212529] mb-4">Key Legislation & Regulations</h2>
              <div className="space-y-4">
                {legalTopics.map((topic) => (
                  <LegalTopicCard key={topic.id} topic={topic} />
                ))}
              </div>
            </section>

            {/* Quick Reference FAQ */}
            <section className="bg-[#F8F9FA] rounded-lg p-6 border border-[#E9ECEF]">
              <h3 className="text-md font-bold text-[#212529] mb-4 flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                Quick Reference FAQs
              </h3>
              <div className="space-y-3">
                {quickFAQs.map((faq, i) => (
                  <div key={i} className="border-b border-[#E9ECEF] pb-3 last:border-0 last:pb-0">
                    <p className="text-sm font-semibold text-[#212529] mb-1">{faq.q}</p>
                    <p className="text-sm text-[#495057]">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Property Transfer Process */}
            <section className="bg-white rounded-lg p-6 border border-[#E9ECEF]">
              <h3 className="text-md font-bold text-[#212529] mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Property Transfer Process (Step-by-Step)
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#212529] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#212529]">Offer & Acceptance</h4>
                    <p className="text-sm text-[#495057]">Signed agreement of sale between buyer and seller</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#212529] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#212529]">Property Due Diligence</h4>
                    <p className="text-sm text-[#495057]">Title deed search, rates clearance, zoning verification</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#212529] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#212529]">Tax Compliance</h4>
                    <p className="text-sm text-[#495057]">Capital Gains Tax clearance from ZIMRA</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#212529] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#212529]">Transfer Documents</h4>
                    <p className="text-sm text-[#495057]">Prepare and sign transfer documents with conveyancer</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#212529] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">5</div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#212529]">Deeds Office Registration</h4>
                    <p className="text-sm text-[#495057]">Submit documents to Deeds Office (30-60 days processing)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#212529] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">6</div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#212529]">Transfer & Possession</h4>
                    <p className="text-sm text-[#495057]">New title deeds issued, property handover completed</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Features Grid */}
            <section>
              <h2 className="text-lg font-bold text-[#212529] mb-4">What's Included in the Cheat Sheet</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {featuresList.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-[#212529] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[#495057]">{feature}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-8 space-y-6">
              {/* Download CTA Card */}
              <div className="rounded-lg border border-[#212529] bg-white p-5 shadow-sm">
                <div className="text-center mb-4">
                  <div className="text-xl font-bold text-[#212529] mb-1">Free Download</div>
                  <p className="text-xs text-[#ADB5BD]">Legal Reference Cheat Sheet</p>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-[#495057]">
                    <CheckCircle className="h-3 w-3 text-[#212529]" />
                    <span>6 major acts summarized</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#495057]">
                    <CheckCircle className="h-3 w-3 text-[#212529]" />
                    <span>Penalties & compliance</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#495057]">
                    <CheckCircle className="h-3 w-3 text-[#212529]" />
                    <span>Tax rates & deadlines</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#495057]">
                    <CheckCircle className="h-3 w-3 text-[#212529]" />
                    <span>Transfer checklist</span>
                  </div>
                </div>
                <button className="w-full bg-[#212529] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#495057] transition-colors flex items-center justify-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Cheat Sheet
                </button>
              </div>

              {/* Key Contacts Card */}
              <div className="rounded-lg border border-[#E9ECEF] bg-white p-5">
                <h3 className="text-sm font-bold text-[#212529] mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Key Contacts
                </h3>
                <div className="space-y-2 text-xs">
                  <p><strong className="text-[#212529]">Deeds Registry (Harare):</strong> +263 24 2700111</p>
                  <p><strong className="text-[#212529]">ZIMRA Head Office:</strong> +263 24 2758931</p>
                  <p><strong className="text-[#212529]">Harare City Council:</strong> +263 24 2701711</p>
                  <p><strong className="text-[#212529]">Rent Board (Harare):</strong> +263 24 2703553</p>
                </div>
              </div>

              {/* Key Deadline Card */}
              <div className="rounded-lg border border-[#E9ECEF] bg-[#F8F9FA] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-[#212529]" />
                  <span className="text-xs font-semibold text-[#212529]">Key Deadlines</span>
                </div>
                <ul className="text-xs text-[#495057] space-y-1">
                  <li>• Transfer duty: 30 days from transaction</li>
                  <li>• Capital Gains Tax: Within 30 days of sale</li>
                  <li>• Property rates: Quarterly (March, June, Sept, Dec)</li>
                  <li>• Annual tax returns: April 30</li>
                </ul>
              </div>

              {/* Data Source */}
              <div className="rounded-lg border border-[#E9ECEF] bg-white p-4">
                <p className="text-xs text-[#ADB5BD]">
                  Based on current legislation as of 2025. Laws subject to change. 
                  Verify with official government publications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Guides Section */}
      <div className="border-t border-[#E9ECEF] bg-[#F8F9FA] py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#212529]">You Might Also Like</h2>
            <Link href="/guides" className="text-xs text-[#495057] hover:text-[#212529] transition-colors flex items-center gap-1">
              View all guides
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RelatedGuideCard
              title="The Ultimate Guide to Buying Property in Zimbabwe"
              slug="buying-guide-zimbabwe"
              readTime="25 min read"
            />
            <RelatedGuideCard
              title="Landlord's Guide to Maximizing Rental Yield"
              slug="landlord-rental-yield"
              readTime="20 min read"
            />
            <RelatedGuideCard
              title="Relocation Guide - Moving to Harare & Bulawayo"
              slug="relocation-guide"
              readTime="30 min read"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function RelatedGuideCard({ title, slug, readTime }: { title: string; slug: string; readTime: string }) {
  return (
    <Link href={`/guides/${slug}`}>
      <div className="group h-full cursor-pointer rounded-lg border border-[#E9ECEF] bg-white p-5 transition-all duration-300 hover:border-[#212529] hover:shadow-md">
        <h3 className="text-base font-bold text-[#212529] mb-2 transition-colors group-hover:text-[#495057] line-clamp-2">
          {title}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#ADB5BD]">{readTime}</span>
          <ChevronRight className="h-4 w-4 text-[#ADB5BD] transition-all group-hover:text-[#212529] group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}