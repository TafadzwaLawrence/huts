import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service - Huts',
  description: 'Read the terms and conditions for using Huts rental property platform.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container-main max-w-4xl py-20 md:py-32">
        <h1 className="text-page-title mb-6">
          Terms of Service
        </h1>
        <p className="text-small mb-12">
          Last updated: February 10, 2026
        </p>

        <div className="prose prose-slate max-w-none">
          <div className="space-y-12">
            {/* Agreement */}
            <section>
              <h2 className="text-section-title mb-4">1. Agreement to Terms</h2>
              <p className="text-[#495057] leading-relaxed mb-4">
                By accessing or using Huts ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Platform.
              </p>
              <p className="text-[#495057] leading-relaxed">
                These Terms constitute a legally binding agreement between you and Huts. We reserve the right to modify these Terms at any time.
              </p>
            </section>

            {/* Account Registration */}
            <section>
              <h2 className="text-section-title mb-4">2. Account Registration</h2>
              
              <h3 className="text-subsection-title mb-3 mt-6">2.1 Eligibility</h3>
              <p className="text-[#495057] leading-relaxed mb-4">
                You must be at least 18 years old to use Huts. By creating an account, you represent that you meet this age requirement.
              </p>

              <h3 className="text-subsection-title mb-3 mt-6">2.2 Account Security</h3>
              <p className="text-[#495057] leading-relaxed mb-3">
                You are responsible for:
              </p>
              <ul className="list-disc list-inside text-[#495057] space-y-2 ml-4">
                <li>Maintaining the confidentiality of your password</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized access</li>
                <li>Providing accurate and complete information</li>
              </ul>
            </section>

            {/* For Landlords */}
            <section>
              <h2 className="text-section-title mb-4">3. Landlord Responsibilities</h2>
              
              <h3 className="text-subsection-title mb-3 mt-6">3.1 Property Listings</h3>
              <p className="text-[#495057] leading-relaxed mb-3">
                When listing a property, you represent and warrant that:
              </p>
              <ul className="list-disc list-inside text-[#495057] space-y-2 ml-4">
                <li>You have the legal right to list the property</li>
                <li>All information provided is accurate and complete</li>
                <li>Photos accurately represent the property's current condition</li>
                <li>The property complies with all local housing regulations</li>
                <li>You will not discriminate based on race, religion, gender, or other protected classes</li>
              </ul>

              <h3 className="text-subsection-title mb-3 mt-6">3.2 Prohibited Content</h3>
              <p className="text-[#495057] leading-relaxed mb-3">
                Listings must not contain:
              </p>
              <ul className="list-disc list-inside text-[#495057] space-y-2 ml-4">
                <li>False, misleading, or deceptive information</li>
                <li>Duplicate listings of the same property</li>
                <li>Contact information in photos or descriptions (use our messaging system)</li>
                <li>Offensive, inappropriate, or copyrighted content</li>
              </ul>

              <h3 className="text-subsection-title mb-3 mt-6">3.3 Inquiry Response</h3>
              <p className="text-[#495057] leading-relaxed">
                Landlords are expected to respond to legitimate inquiries within 48 hours. Failure to respond may result in reduced visibility or account suspension.
              </p>
            </section>

            {/* For Renters */}
            <section>
              <h2 className="text-section-title mb-4">4. Renter Responsibilities</h2>
              
              <h3 className="text-subsection-title mb-3 mt-6">4.1 Inquiries</h3>
              <p className="text-[#495057] leading-relaxed mb-3">
                When contacting landlords, you agree to:
              </p>
              <ul className="list-disc list-inside text-[#495057] space-y-2 ml-4">
                <li>Provide accurate contact information</li>
                <li>Communicate respectfully and professionally</li>
                <li>Not spam or harass landlords</li>
                <li>Only inquire about properties you're genuinely interested in</li>
              </ul>

              <h3 className="text-subsection-title mb-3 mt-6">4.2 Property Viewing</h3>
              <p className="text-[#495057] leading-relaxed">
                Huts facilitates connections but is not responsible for property viewings, lease agreements, or payments. All rental transactions occur directly between renters and landlords.
              </p>
            </section>

            {/* Fees and Payments */}
            <section>
              <h2 className="text-section-title mb-4">5. Fees and Payments</h2>
              
              <h3 className="text-subsection-title mb-3 mt-6">5.1 Subscription Plans</h3>
              <p className="text-[#495057] leading-relaxed mb-4">
                Huts offers free and paid subscription plans for landlords. Subscription fees are billed monthly or annually and are non-refundable except as required by law.
              </p>

              <h3 className="text-subsection-title mb-3 mt-6">5.2 Payment Processing</h3>
              <p className="text-[#495057] leading-relaxed mb-4">
                Payments are processed through third-party payment processors. You agree to comply with their terms and conditions.
              </p>

              <h3 className="text-subsection-title mb-3 mt-6">5.3 Cancellation</h3>
              <p className="text-[#495057] leading-relaxed">
                You may cancel your subscription at any time. Your access will continue until the end of the current billing period. No partial refunds are provided.
              </p>
            </section>

            {/* Prohibited Uses */}
            <section>
              <h2 className="text-section-title mb-4">6. Prohibited Uses</h2>
              <p className="text-[#495057] leading-relaxed mb-3">
                You may not use Huts to:
              </p>
              <ul className="list-disc list-inside text-[#495057] space-y-2 ml-4">
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
            <section>
              <h2 className="text-section-title mb-4">7. Intellectual Property</h2>
              
              <h3 className="text-subsection-title mb-3 mt-6">7.1 Platform Content</h3>
              <p className="text-[#495057] leading-relaxed mb-4">
                The Huts platform, including its design, code, logos, and trademarks, is owned by Huts and protected by copyright and intellectual property laws.
              </p>

              <h3 className="text-subsection-title mb-3 mt-6">7.2 User Content</h3>
              <p className="text-[#495057] leading-relaxed">
                You retain ownership of content you upload (photos, descriptions, etc.) but grant Huts a non-exclusive, worldwide license to use, display, and distribute this content on the Platform.
              </p>
            </section>

            {/* Disclaimers */}
            <section>
              <h2 className="text-section-title mb-4">8. Disclaimers</h2>
              <p className="text-[#495057] leading-relaxed mb-3">
                Huts is provided "as is" without warranties of any kind. We do not:
              </p>
              <ul className="list-disc list-inside text-[#495057] space-y-2 ml-4">
                <li>Verify the accuracy of property listings</li>
                <li>Conduct background checks on users</li>
                <li>Guarantee property availability or condition</li>
                <li>Participate in rental transactions or negotiations</li>
                <li>Guarantee the Platform will be error-free or uninterrupted</li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-section-title mb-4">9. Limitation of Liability</h2>
              <p className="text-[#495057] leading-relaxed">
                To the maximum extent permitted by law, Huts and its affiliates shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of the Platform. Our total liability shall not exceed the amount you paid us in the past 12 months.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-section-title mb-4">10. Termination</h2>
              <p className="text-[#495057] leading-relaxed mb-3">
                We reserve the right to suspend or terminate your account at any time for:
              </p>
              <ul className="list-disc list-inside text-[#495057] space-y-2 ml-4">
                <li>Violation of these Terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Abuse of the Platform or other users</li>
                <li>Non-payment of subscription fees</li>
              </ul>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-section-title mb-4">11. Governing Law</h2>
              <p className="text-[#495057] leading-relaxed">
                These Terms are governed by the laws of Zimbabwe. Any disputes shall be resolved in the courts of Harare, Zimbabwe.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-section-title mb-4">12. Contact Us</h2>
              <p className="text-[#495057] leading-relaxed mb-4">
                If you have questions about these Terms, please contact us:
              </p>
              <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg p-6">
                <p className="text-[#495057]">
                  <strong className="text-[#212529]">Email:</strong> <a href="mailto:legal@huts.com" className="text-[#212529] hover:underline">legal@huts.com</a><br />
                  <strong className="text-[#212529]">Address:</strong> 123 Samora Machel Avenue, Harare, Zimbabwe
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-16 pt-8 border-t border-[#E9ECEF]">
          <Link 
            href="/"
            className="text-[#212529] font-medium hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
