import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'

interface LeadMagnetEmailProps {
  name: string
  leadMagnetTitle: string
  downloadUrl: string
  leadMagnetSlug: string
}

export default function LeadMagnetEmail({
  name = 'there',
  leadMagnetTitle = 'Your Guide',
  downloadUrl = '',
  leadMagnetSlug = '',
}: LeadMagnetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{leadMagnetTitle} is ready to download</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>HUTS</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={heading}>Your Guide is Ready! 📚</Text>
            <Text style={paragraph}>
              Hi {name},
            </Text>
            <Text style={paragraph}>
              Thank you for your interest in{' '}
              <strong>{leadMagnetTitle}</strong>. Your guide is ready to download!
            </Text>

            <Section style={ctaSection}>
              <Button style={button} href={downloadUrl}>
                Download Your Guide
              </Button>
            </Section>

            <Hr style={divider} />

            <Text style={subheading}>What You&apos;ll Discover</Text>
            <Text style={paragraph}>
              This comprehensive guide covers everything you need to know about
              Zimbabwe&apos;s real estate market. Whether you&apos;re buying,
              selling, or investing, you&apos;ll find actionable insights and
              practical checklists.
            </Text>

            <Hr style={divider} />

            {/* Exclusive Offer */}
            <Section style={offerSection}>
              <Text style={offerHeading}>🎁 Exclusive Offer for You</Text>
              <Text style={paragraph}>
                As a valued member of the Huts community, enjoy priority access
                to new listings and direct connections with verified agents in
                your area.
              </Text>
              <Button style={secondaryButton} href="https://huts.zw">
                Explore Huts Platform
              </Button>
            </Section>

            <Hr style={divider} />

            {/* Footer CTA */}
            <Text style={paragraph}>
              Have questions? Reply to this email or visit our{' '}
              <Link href="https://huts.zw/help" style={link}>
                help center
              </Link>
              .
            </Text>

            <Text style={paragraph}>
              Happy exploring!
              <br />
              <strong>The Huts Team</strong>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You received this email because you downloaded a guide from Huts.
            </Text>
            <Text style={footerText}>
              <Link href="https://huts.zw/privacy" style={link}>
                Privacy Policy
              </Link>{' '}
              |{' '}
              <Link href="https://huts.zw/terms" style={link}>
                Terms of Service
              </Link>{' '}
              |{' '}
              <Link
                href={`https://huts.zw/unsubscribe?email=${encodeURIComponent('EMAIL_ADDRESS')}`}
                style={link}
              >
                Unsubscribe
              </Link>
            </Text>
            <Text style={footerText}>
              © 2026 Huts. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  color: '#212529',
}

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '0',
}

const header = {
  backgroundColor: '#f8f9fa',
  padding: '32px 24px',
  textAlign: 'center' as const,
  borderBottom: '1px solid #e9ecef',
}

const logo = {
  fontSize: '24px',
  fontWeight: '800',
  margin: '0',
  color: '#000000',
  letterSpacing: '2px',
}

const content = {
  padding: '32px 24px',
}

const heading = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#000000',
  margin: '0 0 24px 0',
}

const subheading = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#212529',
  margin: '24px 0 12px 0',
}

const paragraph = {
  fontSize: '16px',
  color: '#495057',
  lineHeight: '1.6',
  margin: '16px 0',
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
  padding: '24px 0',
}

const button = {
  backgroundColor: '#000000',
  color: '#ffffff',
  padding: '14px 32px',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  borderRadius: '4px',
  display: 'inline-block',
  border: 'none',
  cursor: 'pointer',
}

const secondaryButton = {
  backgroundColor: 'transparent',
  color: '#000000',
  padding: '14px 32px',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  border: '2px solid #000000',
  borderRadius: '4px',
  display: 'inline-block',
  cursor: 'pointer',
}

const offerSection = {
  backgroundColor: '#f8f9fa',
  padding: '24px',
  borderRadius: '4px',
  margin: '24px 0',
}

const offerHeading = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#000000',
  margin: '0 0 12px 0',
}

const divider = {
  borderTop: '1px solid #e9ecef',
  margin: '24px 0',
}

const footer = {
  backgroundColor: '#f8f9fa',
  padding: '24px',
  borderTop: '1px solid #e9ecef',
  textAlign: 'center' as const,
}

const footerText = {
  fontSize: '12px',
  color: '#6c757d',
  margin: '8px 0',
}

const link = {
  color: '#000000',
  textDecoration: 'underline',
}
