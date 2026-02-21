import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — Huts',
  description: 'Learn how Huts collects, uses, and protects your personal information when using our Zimbabwe property marketplace.',
  openGraph: {
    title: 'Privacy Policy | Huts',
    description: 'How Huts handles and protects your personal data.',
    url: 'https://www.huts.co.zw/privacy',
  },
  alternates: {
    canonical: 'https://www.huts.co.zw/privacy',
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container-main max-w-4xl py-20 md:py-32">
        <h1 className="text-page-title mb-6">
          Privacy Policy
        </h1>
        <p className="text-small mb-12">
          Last updated: February 10, 2026
        </p>

        <div className="prose prose-slate max-w-none">
          <div className="space-y-12">
            {/* Introduction */}
            <section>
              <h2 className="text-section-title mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Huts ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform at huts.com.
              </p>
              <p className="text-[#495057] leading-relaxed">
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-section-title mb-4">2. Information We Collect</h2>
              
              <h3 className="text-subsection-title mb-3 mt-6">2.1 Personal Information</h3>
              <p className="text-[#495057] leading-relaxed mb-3">
                When you create an account, we collect:
              </p>
              <ul className="list-disc list-inside text-[#495057] space-y-2 ml-4">
                <li>Full name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Profile photo (optional)</li>
                <li>Account type (landlord or renter)</li>
              </ul>

              <h3 className="text-subsection-title mb-3 mt-6">2.2 Property Information</h3>
              <p className="text-[#495057] leading-relaxed mb-3">
                When listing a property, we collect:
              </p>
              <ul className="list-disc list-inside text-[#495057] space-y-2 ml-4">
                <li>Property address and location</li>
                <li>Property photos</li>
                <li>Pricing and availability</li>
                <li>Property features and amenities</li>
              </ul>

              <h3 className="text-subsection-title mb-3 mt-6">2.3 Usage Data</h3>
              <p className="text-[#495057] leading-relaxed">
                We automatically collect information about your device and how you interact with our platform, including IP address, browser type, pages visited, and time spent on pages.
              </p>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-section-title mb-4">3. How We Use Your Information</h2>
              <p className="text-[#495057] leading-relaxed mb-3">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-[#495057] space-y-2 ml-4">
                <li>Create and manage your account</li>
                <li>Facilitate property listings and searches</li>
                <li>Process inquiries between renters and landlords</li>
                <li>Send transactional emails (listing confirmations, inquiry notifications)</li>
                <li>Improve our platform and user experience</li>
                <li>Prevent fraud and maintain security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            {/* Information Sharing */}
            <section>
              <h2 className="text-section-title mb-4">4. Information Sharing</h2>
              <p className="text-[#495057] leading-relaxed mb-3">
                We do not sell your personal information. We may share information in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-[#495057] space-y-2 ml-4">
                <li><strong>With landlords:</strong> When you inquire about a property, your name and contact information is shared with the landlord</li>
                <li><strong>Service providers:</strong> We share data with third-party services (email, hosting, analytics) necessary to operate our platform</li>
                <li><strong>Legal requirements:</strong> We may disclose information if required by law or to protect our rights</li>
              </ul>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-section-title mb-4">5. Data Security</h2>
              <p className="text-[#495057] leading-relaxed">
                We implement industry-standard security measures to protect your information, including encryption, secure servers, and access controls. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-section-title mb-4">6. Your Rights</h2>
              <p className="text-[#495057] leading-relaxed mb-3">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-[#495057] space-y-2 ml-4">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your account and data</li>
                <li>Opt-out of marketing communications</li>
                <li>Export your data in a portable format</li>
              </ul>
              <p className="text-[#495057] leading-relaxed mt-4">
                To exercise these rights, contact us at <a href="mailto:privacy@huts.com" className="text-[#212529] font-medium hover:underline">privacy@huts.com</a>
              </p>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-section-title mb-4">7. Cookies</h2>
              <p className="text-[#495057] leading-relaxed">
                We use cookies and similar tracking technologies to maintain your session, remember your preferences, and analyze platform usage. You can control cookies through your browser settings, but disabling them may limit functionality.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-section-title mb-4">8. Children's Privacy</h2>
              <p className="text-[#495057] leading-relaxed">
                Huts is not intended for users under 18 years of age. We do not knowingly collect information from children. If you believe we have collected information from a minor, please contact us immediately.
              </p>
            </section>

            {/* Changes */}
            <section>
              <h2 className="text-section-title mb-4">9. Changes to This Policy</h2>
              <p className="text-[#495057] leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a notice on our platform. Your continued use of Huts after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-section-title mb-4">10. Contact Us</h2>
              <p className="text-[#495057] leading-relaxed mb-4">
                If you have questions about this Privacy Policy, please contact us:
              </p>
              <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg p-6">
                <p className="text-[#495057]">
                  <strong className="text-[#212529]">Email:</strong> <a href="mailto:privacy@huts.com" className="text-[#212529] hover:underline">privacy@huts.com</a><br />
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
