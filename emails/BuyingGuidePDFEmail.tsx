import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface BuyingGuidePDFEmailProps {
  buyerName: string
  landingPageUrl?: string
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'https://www.huts.co.zw'

export const BuyingGuidePDFEmail = ({
  buyerName = 'Buyer',
  landingPageUrl = '#',
}: BuyingGuidePDFEmailProps) => (
  <Html>
    <Head />
    <Preview>Your Ultimate Guide to Buying Property in Zimbabwe is here</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Row>
            <Text style={heading}>Your Guide is Ready, {buyerName}!</Text>
          </Row>

          <Hr style={hr} />

          <Row>
            <Text style={paragraph}>
              <strong>The Ultimate Guide to Buying Property in Zimbabwe</strong> is attached to this email. You can download it now and start learning the essentials of property buying in Zimbabwe.
            </Text>
          </Row>

          <Row>
            <Text style={subheading}>Inside Your Guide:</Text>
          </Row>

          <Row>
            <Text style={bulletPoint}>
              📋 <strong>The Complete Buying Process</strong> — Step-by-step from offer through to transfer
            </Text>
          </Row>
          <Row>
            <Text style={bulletPoint}>
              💰 <strong>Cost Breakdown</strong> — All fees explained (transfer, conveyancing, stamp duty, CGT, rates clearance)
            </Text>
          </Row>
          <Row>
            <Text style={bulletPoint}>
              ⚠️ <strong>Red Flags Checklist</strong> — Title deed verification, unpaid property rates, boundary disputes, and more
            </Text>
          </Row>
          <Row>
            <Text style={bulletPoint}>
              🏘️ <strong>City-Specific Guides</strong> — Harare vs. Bulawayo vs. other cities (different councils, different procedures)
            </Text>
          </Row>

          <Hr style={hr} />

          <Row>
            <Text style={paragraph}>
              <strong>Pro Tip:</strong> Save this PDF to your device and refer to it whenever you're considering a property purchase. Many buyers print it out and bring it to meetings with real estate agents and lawyers.
            </Text>
          </Row>

          <Row>
            <Text style={paragraph}>
              Ready to start browsing properties? Check out verified listings on Huts and use this guide to evaluate each one carefully.
            </Text>
          </Row>

          <Row>
            <Button style={button} href={`${baseUrl}/properties-for-rent-zimbabwe?listing_type=sale`}>
              Browse Properties for Sale
            </Button>
          </Row>

          <Hr style={hr} />

          <Row>
            <Text style={paragraph}>
              On <strong>Friday</strong>, we'll send you buyer tips and strategies used by successful property buyers in Zimbabwe. Stay tuned!
            </Text>
          </Row>

          <Row>
            <Text style={footer}>
              Have questions about your guide? Reply to this email or visit{' '}
              <Link href={`${baseUrl}/help`} style={link}>
                our Help Center
              </Link>
              .
            </Text>
          </Row>

          <Row>
            <Text style={footerSmall}>
              © 2026 Huts. Your Trusted Zimbabwe Property Platform. | Harare, Zimbabwe
            </Text>
          </Row>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default BuyingGuidePDFEmail

const main = {
  backgroundColor: '#f8f9fa',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const box = {
  padding: '0 48px',
}

const hr = {
  borderColor: '#e9ecef',
  margin: '20px 0',
}

const paragraph = {
  color: '#212529',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '16px 0',
}

const heading = {
  color: '#212529',
  fontSize: '24px',
  fontWeight: '700',
  margin: '16px 0',
  lineHeight: '1.3',
}

const subheading = {
  color: '#212529',
  fontSize: '16px',
  fontWeight: '600',
  margin: '12px 0',
}

const bulletPoint = {
  color: '#212529',
  fontSize: '14px',
  lineHeight: '1.8',
  margin: '8px 0',
}

const button = {
  backgroundColor: '#000000',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
  margin: '16px 0',
  width: 'fit-content',
}

const link = {
  color: '#0066cc',
  textDecoration: 'underline',
}

const footer = {
  color: '#495057',
  fontSize: '12px',
  lineHeight: '1.6',
  margin: '16px 0',
}

const footerSmall = {
  color: '#7c8288',
  fontSize: '11px',
  lineHeight: '1.5',
  margin: '0',
}
