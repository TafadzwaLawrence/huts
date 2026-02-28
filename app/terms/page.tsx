import { Metadata } from 'next'
import Link from 'next/link'
import { FileText, ChevronRight } from 'lucide-react'
import { ICON_SIZES } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Terms of Service — Huts',
  description: 'Read the terms and conditions for using the Huts property marketplace in Zimbabwe.',
  openGraph: {
    title: 'Terms of Service | Huts',
    description: 'Terms and conditions for using the Huts property marketplace.',
    url: 'https://www.huts.co.zw/terms',
  },
  alternates: {
    canonical: 'https://www.huts.co.zw/terms',
  },
}

const sections = [
  { id: 'agreement', title: 'Agreement to Terms' },
  { id: 'account', title: 'Account Registration' },
  { id: 'landlords', title: 'Landlord Responsibilities' },
  { id: 'renters', title: 'Renter Responsibilities' },
  { id: 'fees', title: 'Fees and Payments' },
  { id: 'prohibited', title: 'Prohibited Uses' },
  { id: 'intellectual', title: 'Intellectual Property' },
  { id: 'disclaimers', title: 'Disclaimers' },
  { id: 'liability', title: 'Limitation of Liability' },
  { id: 'termination', title: 'Termination' },
  { id: 'governing', title: 'Governing Law' },
  { id: 'contact', title: 'Contact Us' },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#F8F9FA] to-white border-b border-[#E9ECEF] py-12 md:py-16">
        <div className="container-main max-w-7xl">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-[#495057]">
            <Link href="/" className="hover:text-[#212529] transition-colors">Home</Link>
            <ChevronRight size={ICON_SIZES.sm} className="text-[#ADB5BD]" />
            <span className="text-[#212529] font-medium">Terms of Service</span>
          </nav>

          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 bg-[#212529] rounded-2xl flex items-center justify-center">
                <FileText size={ICON_SIZES.xl} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-[#212529] tracking-tight">
                  Terms of Service
                </h1>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 bg-white border border-[#E9ECEF] px-4 py-2 rounded-full text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-[#495057]">Last updated: <strong className="text-[#212529]">February 10, 2026</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-main max-w-7xl py-12 md:py-16">
        <div className="grid lg:grid-cols-[280px_1fr] gap-12">
          {/* Sticky TOC Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl p-6">
                <h2 className="text-sm font-bold text-[#212529] uppercase tracking-wide mb-4">
                  On This Page
                </h2>
                <nav className="space-y-1">
                  {sections.map((section, index) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="block text-sm text-[#495057] hover:text-[#212529] hover:bg-white px-3 py-2 rounded-lg transition-all group"
                    >
                      <span className="font-medium">{index + 1}.</span> {section.title}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Quick Links */}
              <div className="mt-6 p-6 bg-white border border-[#E9ECEF] rounded-2xl">
                <h3 className="text-sm font-bold text-[#212529] mb-4">Related</h3>
                <div className="space-y-3">
                  <Link href="/privacy" className="flex items-center justify-between text-sm text-[#495057] hover:text-[#212529] transition-colors group">
                    <span>Privacy Policy</span>
                    <ChevronRight size={ICON_SIZES.sm} className="text-[#ADB5BD] group-hover:text-[#212529]" />
                  </Link>
                  <Link href="/contact" className="flex items-center justify-between text-sm text-[#495057] hover:text-[#212529] transition-colors group">
                    <span>Contact Support</span>
                    <ChevronRight size={ICON_SIZES.sm} className="text-[#ADB5BD] group-hover:text-[#212529]" />
                  </Link>
                  <Link href="/help" className="flex items-center justify-between text-sm text-[#495057] hover:text-[#212529] transition-colors group">
                    <span>Help Center</span>
                    <ChevronRight size={ICON_SIZES.sm} className="text-[#ADB5BD] group-hover:text-[#212529]" />
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="max-w-3xl">
            <div className="prose prose-slate max-w-none">
              <p className="text-lg text-[#495057] leading-relaxed mb-12 pb-8 border-b border-[#E9ECEF]">
                Welcome to Huts. These Terms of Service govern your use of our property marketplace platform. By accessing or using Huts, you agree to be bound by these terms. Please read them carefully.
              </p>

              <div className="space-y-16">
              <div className="space-y-16">
                {/* Agreement */}
                <section id="agreement" className="scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#212529] text-white rounded-xl flex items-center justify-center font-bold text-lg">
                      1
                    </div>
                    <h2 className="text-3xl font-bold text-[#212529]">Agreement to Terms</h2>
                  </div>
                  <div className="ml-13 space-y-4">
                    <p className="text-[#495057] leading-relaxed">
                      By accessing or using Huts ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Platform.
                    </p>
                    <p className="text-[#495057] leading-relaxed">
                      These Terms constitute a legally binding agreement between you and Huts. We reserve the right to modify these Terms at any time. Your continued use of the Platform after changes are posted constitutes acceptance of the modified Terms.
                    </p>
                  </div>
                </section>

                {/* Account Registration */}
                <section id="account" className="scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#212529] text-white rounded-xl flex items-center justify-center font-bold text-lg">
                      2
                    </div>
                    <h2 className="text-3xl font-bold text-[#212529]">Account Registration</h2>
                  </div>
                  <div className="ml-13 space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-[#212529] mb-3">2.1 Eligibility</h3>
                      <p className="text-[#495057] leading-relaxed">
                        You must be at least 18 years old to use Huts. By creating an account, you represent that you meet this age requirement and have the legal capacity to enter into binding agreements.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-[#212529] mb-3">2.2 Account Security</h3>
                      <p className="text-[#495057] leading-relaxed mb-3">
                        You are responsible for:
                      </p>
                      <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-6">
                        <ul className="space-y-3">
                          <li className="flex items-start gap-3 text-[#495057]">
                            <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                            <span>Maintaining the confidentiality of your password</span>
                          </li>
                          <li className="flex items-start gap-3 text-[#495057]">
                            <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                            <span>All activities that occur under your account</span>
                          </li>
                          <li className="flex items-start gap-3 text-[#495057]">
                            <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                            <span>Notifying us immediately of any unauthorized access</span>
                          </li>
                          <li className="flex items-start gap-3 text-[#495057]">
                            <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                            <span>Providing accurate and complete information</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* For Landlords */}
                <section id="landlords" className="scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#212529] text-white rounded-xl flex items-center justify-center font-bold text-lg">
                      3
                    </div>
                    <h2 className="text-3xl font-bold text-[#212529]">Landlord Responsibilities</h2>
                  </div>
                  <div className="ml-13 space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-[#212529] mb-3">3.1 Property Listings</h3>
                      <p className="text-[#495057] leading-relaxed mb-3">
                        When listing a property, you represent and warrant that:
                      </p>
                      <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-6">
                        <ul className="space-y-3">
                          <li className="flex items-start gap-3 text-[#495057]">
                            <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                            <span>You have the legal right to list the property</span>
                          </li>
                          <li className="flex items-start gap-3 text-[#495057]">
                            <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                            <span>All information provided is accurate and complete</span>
                          </li>
                          <li className="flex items-start gap-3 text-[#495057]">
                            <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                            <span>Photos accurately represent the property's current condition</span>
                          </li>
                          <li className="flex items-start gap-3 text-[#495057]">
                            <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                            <span>The property complies with all local housing regulations</span>
                          </li>
                          <li className="flex items-start gap-3 text-[#495057]">
                            <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                            <span>You will not discriminate based on race, religion, gender, or other protected classes</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-[#212529] mb-3">3.2 Prohibited Content</h3>
                      <p className="text-[#495057] leading-relaxed mb-3">
                        Listings must not contain:
                      </p>
                      <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-6">
                        <ul className="space-y-3">
                          <li className="flex items-start gap-3 text-[#495057]">
                            <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                            <span>False, misleading, or deceptive information</span>
                          </li>
                          <li className="flex items-start gap-3 text-[#495057]">
                            <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                            <span>Duplicate listings of the same property</span>
                          </li>
                          <li className="flex items-start gap-3 text-[#495057]">
                            <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                            <span>Contact information in photos or descriptions (use our messaging system)</span>
                          </li>
                          <li className="flex items-start gap-3 text-[#495057]">
                            <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                            <span>Offensive, inappropriate, or copyrighted content</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-[#212529] mb-3">3.3 Inquiry Response</h3>
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
                        <p className="text-[#495057] leading-relaxed">
                          <strong className="text-[#212529]">Response Expectation:</strong> Landlords are expected to respond to legitimate inquiries within 48 hours. Failure to respond may result in reduced visibility or account suspension.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* For Renters */}
                <section id="renters" className="scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#212529] text-white rounded-xl flex items-center justify-center font-bold text-lg">
                      4
                    </div>
                    <h2 className="text-3xl font-bold text-[#212529]">Renter Responsibilities</h2>
                  </div>
                  <div className="ml-13 space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-[#212529] mb-3">4.1 Inquiries</h3>
                    <div>
                      <h3 className="text-xl font-bold text-[#212529] mb-3">4.1 Inquiries</h3>
                      <p className="text-[#495057] leading-relaxed mb-3">
                        When contacting landlords, you agree to:
                      </p>
                      <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-6">
                        <ul className="space-y-3">
                          <li className="flex items-start gap-3 text-[#495057]">
                            <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                            <span>Provide accurate contact information</span>
                          </li>
                          <li className="flex items-start gap-3 text-[#495057]">
                            <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                            <span>Communicate respectfully and professionally</span>
                          </li>
                          <li className="flex items-start gap-3 text-[#495057]">
                            <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                            <span>Not spam or harass landlords</span>
                          </li>
                          <li className="flex items-start gap-3 text-[#495057]">
                            <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                            <span>Only inquire about properties you're genuinely interested in</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-[#212529] mb-3">4.2 Property Viewing</h3>
                      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
                        <p className="text-[#495057] leading-relaxed">
                          <strong className="text-[#212529]">Important:</strong> Huts facilitates connections but is not responsible for property viewings, lease agreements, or payments. All rental transactions occur directly between renters and landlords.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Fees and Payments */}
                <section id="fees" className="scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#212529] text-white rounded-xl flex items-center justify-center font-bold text-lg">
                      5
                    </div>
                    <h2 className="text-3xl font-bold text-[#212529]">Fees and Payments</h2>
                  </div>
                  <div className="ml-13 space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-[#212529] mb-3">5.1 Subscription Plans</h3>
                      <p className="text-[#495057] leading-relaxed">
                        Huts offers free and paid subscription plans for landlords. Subscription fees are billed monthly or annually and are non-refundable except as required by law.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-[#212529] mb-3">5.2 Payment Processing</h3>
                      <p className="text-[#495057] leading-relaxed">
                        Payments are processed through third-party payment processors. You agree to comply with their terms and conditions.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-[#212529] mb-3">5.3 Cancellation</h3>
                      <p className="text-[#495057] leading-relaxed">
                        You may cancel your subscription at any time. Your access will continue until the end of the current billing period. No partial refunds are provided.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Prohibited Uses */}
                <section id="prohibited" className="scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#212529] text-white rounded-xl flex items-center justify-center font-bold text-lg">
                      6
                    </div>
                    <h2 className="text-3xl font-bold text-[#212529]">Prohibited Uses</h2>
                  </div>
                  <div className="ml-13">
                    <p className="text-[#495057] leading-relaxed mb-4">
                      You may not use Huts to:
                    </p>
                    <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-6">
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3 text-[#495057]">
                          <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                          <span>Violate any laws or regulations</span>
                        </li>
                        <li className="flex items-start gap-3 text-[#495057]">
                          <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                          <span>Engage in fraudulent or deceptive practices</span>
                        </li>
                        <li className="flex items-start gap-3 text-[#495057]">
                          <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                          <span>Scrape, harvest, or collect user data</span>
                        </li>
                        <li className="flex items-start gap-3 text-[#495057]">
                          <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                          <span>Transmit viruses, malware, or harmful code</span>
                        </li>
                        <li className="flex items-start gap-3 text-[#495057]">
                          <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                          <span>Interfere with the Platform's operation</span>
                        </li>
                        <li className="flex items-start gap-3 text-[#495057]">
                          <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                          <span>Impersonate others or create fake accounts</span>
                        </li>
                        <li className="flex items-start gap-3 text-[#495057]">
                          <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                          <span>Post spam or unsolicited advertisements</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Intellectual Property */}
                <section id="intellectual" className="scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#212529] text-white rounded-xl flex items-center justify-center font-bold text-lg">
                      7
                    </div>
                    <h2 className="text-3xl font-bold text-[#212529]">Intellectual Property</h2>
                  </div>
                  <div className="ml-13 space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-[#212529] mb-3">7.1 Platform Content</h3>
                      <p className="text-[#495057] leading-relaxed">
                        The Huts platform, including its design, code, logos, and trademarks, is owned by Huts and protected by copyright and intellectual property laws.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-[#212529] mb-3">7.2 User Content</h3>
                      <p className="text-[#495057] leading-relaxed">
                        You retain ownership of content you upload (photos, descriptions, etc.) but grant Huts a non-exclusive, worldwide license to use, display, and distribute this content on the Platform.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Disclaimers */}
                <section id="disclaimers" className="scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#212529] text-white rounded-xl flex items-center justify-center font-bold text-lg">
                      8
                    </div>
                    <h2 className="text-3xl font-bold text-[#212529]">Disclaimers</h2>
                  </div>
                  <div className="ml-13">
                    <p className="text-[#495057] leading-relaxed mb-4">
                      Huts is provided "as is" without warranties of any kind. We do not:
                    </p>
                    <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-6">
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3 text-[#495057]">
                          <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                          <span>Verify the accuracy of property listings</span>
                        </li>
                        <li className="flex items-start gap-3 text-[#495057]">
                          <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                          <span>Conduct background checks on users</span>
                        </li>
                        <li className="flex items-start gap-3 text-[#495057]">
                          <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                          <span>Guarantee property availability or condition</span>
                        </li>
                        <li className="flex items-start gap-3 text-[#495057]">
                          <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                          <span>Participate in rental transactions or negotiations</span>
                        </li>
                        <li className="flex items-start gap-3 text-[#495057]">
                          <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                          <span>Guarantee the Platform will be error-free or uninterrupted</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Limitation of Liability */}
                <section id="liability" className="scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#212529] text-white rounded-xl flex items-center justify-center font-bold text-lg">
                      9
                    </div>
                    <h2 className="text-3xl font-bold text-[#212529]">Limitation of Liability</h2>
                  </div>
                  <div className="ml-13">
                    <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl">
                      <p className="text-[#495057] leading-relaxed">
                        To the maximum extent permitted by law, Huts and its affiliates shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of the Platform. Our total liability shall not exceed the amount you paid us in the past 12 months.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Termination */}
                <section id="termination" className="scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#212529] text-white rounded-xl flex items-center justify-center font-bold text-lg">
                      10
                    </div>
                    <h2 className="text-3xl font-bold text-[#212529]">Termination</h2>
                  </div>
                  <div className="ml-13">
                    <p className="text-[#495057] leading-relaxed mb-4">
                      We reserve the right to suspend or terminate your account at any time for:
                    </p>
                    <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-6">
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3 text-[#495057]">
                          <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                          <span>Violation of these Terms</span>
                        </li>
                        <li className="flex items-start gap-3 text-[#495057]">
                          <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                          <span>Fraudulent or illegal activity</span>
                        </li>
                        <li className="flex items-start gap-3 text-[#495057]">
                          <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                          <span>Abuse of the Platform or other users</span>
                        </li>
                        <li className="flex items-start gap-3 text-[#495057]">
                          <span className="w-1.5 h-1.5 bg-[#212529] rounded-full mt-2 flex-shrink-0"></span>
                          <span>Non-payment of subscription fees</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Governing Law */}
                <section id="governing" className="scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#212529] text-white rounded-xl flex items-center justify-center font-bold text-lg">
                      11
                    </div>
                    <h2 className="text-3xl font-bold text-[#212529]">Governing Law</h2>
                  </div>
                  <div className="ml-13">
                    <p className="text-[#495057] leading-relaxed">
                      These Terms are governed by the laws of Zimbabwe. Any disputes shall be resolved in the courts of Harare, Zimbabwe.
                    </p>
                  </div>
                </section>

                {/* Contact */}
                <section id="contact" className="scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#212529] text-white rounded-xl flex items-center justify-center font-bold text-lg">
                      12
                    </div>
                    <h2 className="text-3xl font-bold text-[#212529]">Contact Us</h2>
                  </div>
                  <div className="ml-13">
                    <p className="text-[#495057] leading-relaxed mb-6">
                      If you have questions about these Terms, please contact us:
                    </p>
                    <div className="bg-gradient-to-br from-[#F8F9FA] to-white border-2 border-[#E9ECEF] rounded-2xl p-8">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <div className="text-sm font-bold text-[#ADB5BD] uppercase tracking-wide mb-2">Email</div>
                          <a href="mailto:legal@huts.co.zw" className="text-lg font-semibold text-[#212529] hover:underline">
                            legal@huts.co.zw
                          </a>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#ADB5BD] uppercase tracking-wide mb-2">Address</div>
                          <p className="text-lg text-[#495057]">
                            123 Samora Machel Avenue<br />
                            Harare, Zimbabwe
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-16 pt-12 border-t-2 border-[#E9ECEF]">
              <div className="bg-[#212529] text-white rounded-2xl p-8 md:p-10">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Ready to Get Started?
                </h3>
                <p className="text-white/80 text-lg mb-8 leading-relaxed max-w-2xl">
                  Join thousands of landlords and renters using Huts to find their perfect property match. Start browsing or list your first property today—completely free.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/search"
                    className="inline-flex items-center justify-center gap-2 bg-white text-[#212529] px-8 py-4 rounded-xl font-bold hover:bg-[#F8F9FA] transition-all"
                  >
                    Browse Properties
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all"
                  >
                    List Your Property
                  </Link>
                </div>
              </div>
            </div>

            {/* Back Link */}
            <div className="mt-12 pt-8 border-t border-[#E9ECEF]">
              <Link 
                href="/"
                className="inline-flex items-center gap-2 text-[#495057] hover:text-[#212529] font-medium transition-colors"
              >
                <ChevronRight size={ICON_SIZES.md} className="rotate-180" />
                Back to Home
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
