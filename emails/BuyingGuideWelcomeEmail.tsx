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
import * as React from 'react'

interface BuyingGuideWelcomeEmailProps {
  buyerName: string
  guideDownloadUrl: string
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'https://www.huts.co.zw'

export const BuyingGuideWelcomeEmail = ({
  buyerName = 'Buyer',
  guideDownloadUrl = '#',
}: BuyingGuideWelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to Huts — Your Buying Guide is on its way</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Row>
            <Text style={heading}>Welcome to Huts, {buyerName}!</Text>
          </Row>

          <Hr style={hr} />

          <Row>
            <Text style={paragraph}>
              Thank you for downloading <strong>The Ultimate Guide to Buying Property in Zimbabwe</strong>.
            </Text>
          </Row>

          <Row>
            <Text style={paragraph}>
              We're excited to help you navigate the property buying process with confidence. Whether you're
              purchasing in Harare, Bulawayo, or anywhere else in Zimbabwe, this guide covers everything you
              need to know.
            </Text>
          </Row>

          <Row>
            <Text style={subheading}>What's Inside:</Text>
          </Row>

          <Row>
            <Text style={bulletPoint}>
              ✓ <strong>Step-by-step buying process</strong> — From offer to transfer
            </Text>
          </Row>
          <Row>
            <Text style={bulletPoint}>
              ✓ <strong>Complete cost breakdown</strong> — Transfer fees, stamp duty, conveyancing, and more
            </Text>
          </Row>
          <Row>
            <Text style={bulletPoint}>
              ✓ <strong>Red flags to watch for</strong> — Title deeds, unpaid rates, boundary disputes
            </Text>
          </Row>
          <Row>
            <Text style={bulletPoint}>
              ✓ <strong>City-specific checklists</strong> — Different rules for Harare, Bulawayo, and other areas
            </Text>
          </Row>

          <Hr style={hr} />

          <Row>
            <Text style={paragraph}>
              Your guide will arrive in your inbox tomorrow. In the meantime, explore listings on Huts and get
              a feel for the current market in your area.
            </Text>
          </Row>

          <Row>
            <Button style={button} href={baseUrl}>
              Browse Properties on Huts
            </Button>
          </Row>

          <Hr style={hr} />

          <Row>
            <Text style={footer}>
              Questions? Reply to this email or visit our{' '}
              <Link href={`${baseUrl}/help`} style={link}>
                Help Center
              </Link>
              .
            </Text>
          </Row>

          <Row>
            <Text style={footerSmall}>
              © 2026 Huts. All rights reserved. | Harare, Zimbabwe
            </Text>
          </Row>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default BuyingGuideWelcomeEmail

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
  paddingLeft: '0',
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
