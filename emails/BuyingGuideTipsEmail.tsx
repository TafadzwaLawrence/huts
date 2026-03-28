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

interface BuyingGuideTipsEmailProps {
  buyerName: string
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'https://www.huts.co.zw'

export const BuyingGuideTipsEmail = ({
  buyerName = 'Buyer',
}: BuyingGuideTipsEmailProps) => (
  <Html>
    <Head />
    <Preview>Secret strategies from successful Zimbabwe property buyers</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Row>
            <Text style={heading}>Insider Tips: What Successful Buyers Do</Text>
          </Row>

          <Hr style={hr} />

          <Row>
            <Text style={paragraph}>
              Hi {buyerName},
            </Text>
          </Row>

          <Row>
            <Text style={paragraph}>
              By now you should have read through <strong>The Ultimate Guide to Buying Property in Zimbabwe</strong>. Today, we're sharing strategies that successful property buyers use to get the best deals and avoid costly mistakes.
            </Text>
          </Row>

          <Row>
            <Text style={subheading}>🎯 Strategic Insider Tips</Text>
          </Row>

          <Row>
            <Text style={bulletPoint}>
              <strong>Tip 1: Research Comparable Sales</strong><br />
              Before making an offer, compare at least 3–5 similar properties in the same suburb. Huts makes this easy with our comparison tool.
            </Text>
          </Row>

          <Row>
            <Text style={bulletPoint}>
              <strong>Tip 2: Hire a Reputable Conveyancer Early</strong><br />
              Don't wait until you've made an offer. Interview conveyancers (£250–500 typical fee) before entering negotiations so you know your legal timeline and costs.
            </Text>
          </Row>

          <Row>
            <Text style={bulletPoint}>
              <strong>Tip 3: Get Pre-Approval (If Using Finance)</strong><br />
              Contact banks (CABS, Stanbic, NMB) for mortgage pre-approval before searching. This strengthens your negotiating position with sellers.
            </Text>
          </Row>

          <Row>
            <Text style={bulletPoint}>
              <strong>Tip 4: Negotiate Realistically</strong><br />
              In Zimbabwe, most sellers expect 5–10% below asking price. Study market rates and be prepared to justify your offer with comps.
            </Text>
          </Row>

          <Row>
            <Text style={bulletPoint}>
              <strong>Tip 5: Verify the Title Deed BEFORE Making an Offer</strong><br />
              Your conveyancer can check the Deeds Registry. Don't skip this—it's the single most important step to avoid fraudulent sales.
            </Text>
          </Row>

          <Row>
            <Text style={bulletPoint}>
              <strong>Tip 6: Check for Unpaid Rates</strong><br />
              Contact the local council and confirm the property has no outstanding municipal rates. Many deals collapse here.
            </Text>
          </Row>

          <Hr style={hr} />

          <Row>
            <Text style={subheading}>📚 Want More Guidance?</Text>
          </Row>

          <Row>
            <Text style={paragraph}>
              If you'd like to discuss your specific situation (e.g., "I'm a first-time buyer," "I'm relocating to Harare," "I need financing advice"), visit our Help Center or send us your questions.
            </Text>
          </Row>

          <Button style={button} href={`${baseUrl}/properties-for-rent-zimbabwe?listing_type=sale`}>
              Continue Browsing on Huts
            </Button>

          <Hr style={hr} />

          <Row>
            <Text style={paragraph}>
              That's it for this week's buyer education series. You now have the knowledge to confidently navigate property buying in Zimbabwe.
            </Text>
          </Row>

          <Row>
            <Text style={footer}>
              Need help? Contact our support team at{' '}
              <Link href={`${baseUrl}/help`} style={link}>
                huts.co.zw/help
              </Link>
              . We're here to support your property journey.
            </Text>
          </Row>

          <Row>
            <Text style={footerSmall}>
              © 2026 Huts. Making Property Buying Simple in Zimbabwe. | Harare, Zimbabwe
            </Text>
          </Row>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default BuyingGuideTipsEmail

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
  margin: '16px 0 8px 0',
}

const bulletPoint = {
  color: '#212529',
  fontSize: '13px',
  lineHeight: '1.8',
  margin: '12px 0',
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
