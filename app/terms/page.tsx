import { Metadata } from 'next'

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

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container-main max-w-7xl py-8 md:py-12 px-4">
        <h1 className="text-page-title mb-2">Terms of Service</h1>
        <p className="text-sm text-[#495057] mb-12">Last updated: February 10, 2026</p>

        <main className="max-w-4xl space-y-12">
          <p className="text-base text-[#495057] leading-relaxed border-b border-[#E9ECEF] pb-8">
            Welcome to Huts. These Terms of Service govern your use of our property marketplace platform. By accessing or using Huts, you agree to be bound by these terms. Please read them carefully.
          </p>

          {/* Agreement to Terms */}
          <section id="agreement">
            <h2 className="text-section-title mb-4">Agreement to Terms</h2>
            <div className="space-y-4 text-[#495057] leading-relaxed">
              <p>By accessing or using Huts ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Platform.</p>
              <p>These Terms constitute a legally binding agreement between you and Huts. We reserve the right to modify these Terms at any time. Your continued use of the Platform after changes are posted constitutes acceptance of the modified Terms.</p>
            </div>
          </section>

          {/* Account Registration */}
          <section id="account">
            <h2 className="text-section-title mb-4">Account Registration</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-subsection-title mb-3">Eligibility</h3>
                <p className="text-[#495057] leading-relaxed">You must be at least 18 years old to use Huts. By creating an account, you represent that you meet this age requirement and have the legal capacity to enter into binding agreements.</p>
              </div>
              <div>
                <h3 className="text-subsection-title mb-3">Account Security</h3>
                <p className="text-[#495057] leading-relaxed mb-3">You are responsible for:</p>
                <ul className="list-disc list-inside text-[#495057] space-y-2 ml-2">
                  <li>Maintaining the confidentiality of your password</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized access</li>
                  <li>Providing accurate and complete information</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Landlord Responsibilities */}
          <section id="landlords">
            <h2 className="text-section-title mb-4">Landlord Responsibilities</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-subsection-title mb-3">Property Listings</h3>
                <p className="text-[#495057] leading-relaxed mb-3">When listing a property, you represent and warrant that:</p>
                <ul className="list-disc list-inside text-[#495057] space-y-2 ml-2">
                  <li>You have the legal right to list the property</li>
                  <li>All information provided is accurate and complete</li>
                  <li>Photos accurately represent the property's current condition</li>
                  <li>The property complies with all local housing regulations</li>
                  <li>You will not discriminate based on race, religion, gender, or other protected classes</li>
                </ul>
              </div>
              <div>
                <h3 className="text-subsection-title mb-3">Prohibited Content</h3>
                <p className="text-[#495057] leading-relaxed mb-3">Listings must not contain:</p>
                <ul className="list-disc list-inside text-[#495057] space-y-2 ml-2">
                  <li>False, misleading, or deceptive information</li>
                  <li>Duplicate listings of the same property</li>
                  <li>Contact information in photos or descriptions (use our messaging system)</li>
                  <li>Offensive, inappropriate, or copyrighted content</li>
                </ul>
              </div>
              <div>
                <h3 className="text-subsection-title mb-3">Inquiry Response</h3>
                <p className="text-[#495057] leading-relaxed">Landlords are expected to respond to legitimate inquiries within 48 hours. Failure to respond may result in reduced visibility or account suspension.</p>
              </div>
            </div>
          </section>

          {/* Renter Responsibilities */}
          <section id="renters">
            <h2 className="text-section-title mb-4">Renter Responsibilities</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-subsection-title mb-3">Inquiries</h3>
                <p className="text-[#495057] leading-relaxed mb-3">When contacting landlords, you agree to:</p>
                <ul className="list-disc list-inside text-[#495057] space-y-2 ml-2">
                  <li>Provide accurate contact information</li>
                  <li>Communicate respectfully and professionally</li>
                  <li>Not spam or harass landlords</li>
                  <li>Only inquire about properties you're genuinely interested in</li>
                </ul>
              </div>
              <div>
                <h3 className="text-subsection-title mb-3">Property Viewing</h3>
                <p className="text-[#495057] leading-relaxed">Huts facilitates connections but is not responsible for property viewings, lease agreements, or payments. All rental transactions occur directly between renters and landlords.</p>
              </div>
            </div>
          </section>

          {/* Fees and Payments */}
          <section id="fees">
            <h2 className="text-section-title mb-4">Fees and Payments</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-subsection-title mb-3">Subscription Plans</h3>
                <p className="text-[#495057] leading-relaxed">Huts offers free and paid subscription plans for landlords. Subscription fees are billed monthly or annually and are non-refundable except as required by law.</p>
              </div>
              <div>
                <h3 className="text-subsection-title mb-3">Payment Processing</h3>
                <p className="text-[#495057] leading-relaxed">Payments are processed through third-party payment processors. You agree to comply with their terms and conditions.</p>
              </div>
              <div>
                <h3 className="text-subsection-title mb-3">Cancellation</h3>
                <p className="text-[#495057] leading-relaxed">You may cancel your subscription at any time. Your access will continue until the end of the current billing period. No partial refunds are provided.</p>
              </div>
            </div>
          </section>

          {/* Prohibited Uses */}
          <section id="prohibited">
            <h2 className="text-section-title mb-4">Prohibited Uses</h2>
            <p className="text-[#495057] leading-relaxed mb-4">You may not use Huts to:</p>
            <ul className="list-disc list-inside text-[#495057] space-y-2 ml-2">
              <li>Violate any laws or regulations</li>
              <li>Engage in fraudulent or deceptive practices</li>
              <li>Scrape, harvest, or collect user data</li>
              <li>Transmit viruses, malware, or harmful code</li>
              <li>Interfere with the Platform's operation</li>
              <li>Impersonate others or create fake accounts</li>
              <li>Post spam or unsolicited advertisements</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section id="intellectual">
            <h2 className="text-section-title mb-4">Intellectual Property</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-subsection-title mb-3">Platform Content</h3>
                <p className="text-[#495057] leading-relaxed">The Huts platform, including its design, code, logos, and trademarks, is owned by Huts and protected by copyright and intellectual property laws.</p>
              </div>
              <div>
                <h3 className="text-subsection-title mb-3">User Content</h3>
                <p className="text-[#495057] leading-relaxed">You retain ownership of content you upload (photos, descriptions, etc.) but grant Huts a non-exclusive, worldwide license to use, display, and distribute this content on the Platform.</p>
              </div>
            </div>
          </section>

          {/* Disclaimers */}
          <section id="disclaimers">
            <h2 className="text-section-title mb-4">Disclaimers</h2>
            <p className="text-[#495057] leading-relaxed mb-4">Huts is provided "as is" without warranties of any kind. We do not:</p>
            <ul className="list-disc list-inside text-[#495057] space-y-2 ml-2">
              <li>Verify the accuracy of property listings</li>
              <li>Conduct background checks on users</li>
              <li>Guarantee property availability or condition</li>
              <li>Participate in rental transactions or negotiations</li>
              <li>Guarantee the Platform will be error-free or uninterrupted</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section id="liability">
            <h2 className="text-section-title mb-4">Limitation of Liability</h2>
            <p className="text-[#495057] leading-relaxed">To the maximum extent permitted by law, Huts and its affiliates shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of the Platform. Our total liability shall not exceed the amount you paid us in the past 12 months.</p>
          </section>

          {/* Termination */}
          <section id="termination">
            <h2 className="text-section-title mb-4">Termination</h2>
            <p className="text-[#495057] leading-relaxed mb-4">We reserve the right to suspend or terminate your account at any time for:</p>
            <ul className="list-disc list-inside text-[#495057] space-y-2 ml-2">
              <li>Violation of these Terms</li>
              <li>Fraudulent or illegal activity</li>
              <li>Abuse of the Platform or other users</li>
              <li>Non-payment of subscription fees</li>
            </ul>
          </section>

          {/* Governing Law */}
          <section id="governing">
            <h2 className="text-section-title mb-4">Governing Law</h2>
            <p className="text-[#495057] leading-relaxed">These Terms are governed by the laws of Zimbabwe. Any disputes shall be resolved in the courts of Harare, Zimbabwe.</p>
          </section>

          {/* Contact */}
          <section id="contact">
            <h2 className="text-section-title mb-4">Contact Us</h2>
            <p className="text-[#495057] leading-relaxed">If you have questions about these Terms, please contact us:</p>
            <p className="text-[#495057] leading-relaxed mt-4">
              <strong className="text-[#212529]">Email:</strong> legal@huts.co.zw<br />
              <strong className="text-[#212529]">Address:</strong> 123 Samora Machel Avenue, Harare, Zimbabwe
            </p>
          </section>
        </main>
      </div>
    </div>
  )
}
