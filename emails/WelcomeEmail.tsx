import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface WelcomeEmailProps {
  name: string
  role: 'landlord' | 'renter'
}

export const WelcomeEmail = ({ name, role }: WelcomeEmailProps) => {
  const isLandlord = role === 'landlord'

  return (
    <Html>
      <Head />
      <Preview>Welcome to Huts!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to Huts!</Heading>
          
          <Text style={text}>Hi {name},</Text>
          
          <Text style={text}>
            Thanks for joining Huts, your trusted platform for rental properties.
          </Text>

          {isLandlord ? (
            <Section>
              <Text style={text}>
                As a <strong>landlord</strong>, you can now:
              </Text>
              <ul style={list}>
                <li style={listItem}>List your properties for free</li>
                <li style={listItem}>Connect with potential renters</li>
                <li style={listItem}>Manage inquiries from your dashboard</li>
                <li style={listItem}>Track property views and analytics</li>
              </ul>
            </Section>
          ) : (
            <Section>
              <Text style={text}>
                As a <strong>renter</strong>, you can now:
              </Text>
              <ul style={list}>
                <li style={listItem}>Browse thousands of properties</li>
                <li style={listItem}>Save your favorite listings</li>
                <li style={listItem}>Contact landlords directly</li>
                <li style={listItem}>Get personalized recommendations</li>
              </ul>
            </Section>
          )}

          <Text style={text}>
            If you have any questions, just reply to this email. We're here to help!
          </Text>

          <Text style={footer}>
            Best regards,
            <br />
            The Huts Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default WelcomeEmail

const main = {
  backgroundColor: '#f8f9fa',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Inter",sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
  border: '1px solid #e9ecef',
}

const h1 = {
  color: '#212529',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 24px',
}

const text = {
  color: '#495057',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const list = {
  paddingLeft: '20px',
  margin: '16px 0',
}

const listItem = {
  color: '#495057',
  fontSize: '16px',
  lineHeight: '28px',
  margin: '8px 0',
}

const footer = {
  color: '#495057',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '32px 0 0',
  borderTop: '1px solid #e9ecef',
  paddingTop: '24px',
}
