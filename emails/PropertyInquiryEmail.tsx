import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface PropertyInquiryEmailProps {
  propertyTitle: string
  propertyUrl: string
  inquirerName: string
  inquirerEmail: string
  inquirerPhone?: string
  message: string
  landlordName: string
}

export const PropertyInquiryEmail = ({
  propertyTitle,
  propertyUrl,
  inquirerName,
  inquirerEmail,
  inquirerPhone,
  message,
  landlordName,
}: PropertyInquiryEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>New inquiry for {propertyTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New Property Inquiry</Heading>
          
          <Text style={text}>Hi {landlordName},</Text>
          
          <Text style={text}>
            You have received a new inquiry for your property:{' '}
            <strong>{propertyTitle}</strong>
          </Text>

          <Section style={inquiryBox}>
            <Text style={label}>From:</Text>
            <Text style={value}>{inquirerName}</Text>
            
            <Text style={label}>Email:</Text>
            <Text style={value}>{inquirerEmail}</Text>
            
            {inquirerPhone && (
              <>
                <Text style={label}>Phone:</Text>
                <Text style={value}>{inquirerPhone}</Text>
              </>
            )}
            
            <Text style={label}>Message:</Text>
            <Text style={messageText}>{message}</Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={propertyUrl}>
              View Property
            </Button>
          </Section>

          <Text style={footer}>
            Reply to this email to respond directly to the inquirer.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default PropertyInquiryEmail

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

const inquiryBox = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
}

const label = {
  color: '#495057',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '16px 0 4px',
}

const value = {
  color: '#212529',
  fontSize: '16px',
  margin: '0 0 16px',
}

const messageText = {
  color: '#212529',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#212529',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
}

const footer = {
  color: '#adb5bd',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0 0',
  textAlign: 'center' as const,
}
