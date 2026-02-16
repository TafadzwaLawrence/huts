import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Hr,
  Row,
  Column,
} from '@react-email/components'
import * as React from 'react'

interface PropertyVerificationEmailProps {
  propertyTitle: string
  propertyAddress: string
  propertyCity: string
  propertyType: string
  listingType: 'rent' | 'sale'
  price: string
  beds: number
  baths: number
  ownerName: string
  ownerEmail: string
  propertyUrl: string
  approveUrl: string
  rejectUrl: string
  imageUrl?: string
}

export const PropertyVerificationEmail = ({
  propertyTitle,
  propertyAddress,
  propertyCity,
  propertyType,
  listingType,
  price,
  beds,
  baths,
  ownerName,
  ownerEmail,
  propertyUrl,
  approveUrl,
  rejectUrl,
  imageUrl,
}: PropertyVerificationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>New property needs verification: {propertyTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>HUTS</Text>
            <Text style={headerSubtitle}>Property Verification</Text>
          </Section>

          <Heading style={h1}>New Property Submitted</Heading>

          <Text style={text}>
            A new property has been listed and requires your verification before
            it goes live on the platform.
          </Text>

          {/* Property Image */}
          {imageUrl && (
            <Section style={imageContainer}>
              <Img
                src={imageUrl}
                alt={propertyTitle}
                width="560"
                height="280"
                style={propertyImage}
              />
            </Section>
          )}

          {/* Property Details */}
          <Section style={detailsBox}>
            <Text style={detailsTitle}>Property Details</Text>

            <Section style={detailRow}>
              <Text style={label}>Title</Text>
              <Text style={value}>{propertyTitle}</Text>
            </Section>

            <Section style={detailRow}>
              <Text style={label}>Type</Text>
              <Text style={value}>
                {propertyType} &bull; For {listingType === 'rent' ? 'Rent' : 'Sale'}
              </Text>
            </Section>

            <Section style={detailRow}>
              <Text style={label}>Price</Text>
              <Text style={value}>
                {price}{listingType === 'rent' ? '/month' : ''}
              </Text>
            </Section>

            <Section style={detailRow}>
              <Text style={label}>Specs</Text>
              <Text style={value}>
                {beds} bed &bull; {baths} bath
              </Text>
            </Section>

            <Section style={detailRow}>
              <Text style={label}>Location</Text>
              <Text style={value}>
                {propertyAddress}, {propertyCity}
              </Text>
            </Section>
          </Section>

          {/* Owner Info */}
          <Section style={ownerBox}>
            <Text style={detailsTitle}>Property Owner</Text>

            <Section style={detailRow}>
              <Text style={label}>Name</Text>
              <Text style={value}>{ownerName}</Text>
            </Section>

            <Section style={detailRow}>
              <Text style={label}>Email</Text>
              <Text style={value}>{ownerEmail}</Text>
            </Section>
          </Section>

          <Text style={instructionText}>
            Please contact the property owner to verify this listing is
            legitimate, then approve or reject it using the buttons below.
          </Text>

          {/* Action Buttons */}
          <Section style={buttonContainer}>
            <Button style={approveButton} href={approveUrl}>
              Approve Property
            </Button>
          </Section>

          <Section style={buttonContainer}>
            <Button style={rejectButton} href={rejectUrl}>
              Reject Property
            </Button>
          </Section>

          <Section style={buttonContainer}>
            <Button style={viewButton} href={propertyUrl}>
              View Property
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={footer}>
            This email was sent to the Huts admin team. Only authorized
            administrators can approve or reject property listings.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default PropertyVerificationEmail

// Styles
const main = {
  backgroundColor: '#f8f9fa',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Inter",sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  border: '1px solid #e9ecef',
  borderRadius: '12px',
  overflow: 'hidden' as const,
}

const header = {
  backgroundColor: '#212529',
  padding: '24px 32px',
  textAlign: 'center' as const,
}

const logoText = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '800',
  letterSpacing: '4px',
  margin: '0 0 4px',
}

const headerSubtitle = {
  color: '#adb5bd',
  fontSize: '13px',
  fontWeight: '500',
  textTransform: 'uppercase' as const,
  letterSpacing: '2px',
  margin: '0',
}

const h1 = {
  color: '#212529',
  fontSize: '24px',
  fontWeight: '700',
  margin: '32px 32px 0',
}

const text = {
  color: '#495057',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 32px',
}

const imageContainer = {
  margin: '24px 32px',
}

const propertyImage = {
  width: '100%',
  height: 'auto',
  borderRadius: '8px',
  objectFit: 'cover' as const,
}

const detailsBox = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '20px 24px',
  margin: '24px 32px',
  border: '1px solid #e9ecef',
}

const ownerBox = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '20px 24px',
  margin: '0 32px 24px',
  border: '1px solid #e9ecef',
}

const detailsTitle = {
  color: '#212529',
  fontSize: '14px',
  fontWeight: '700',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 16px',
}

const detailRow = {
  margin: '0 0 12px',
}

const label = {
  color: '#6c757d',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 2px',
}

const value = {
  color: '#212529',
  fontSize: '15px',
  fontWeight: '500',
  margin: '0',
}

const instructionText = {
  color: '#495057',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '16px 32px 24px',
  padding: '16px',
  backgroundColor: '#fff3cd',
  borderRadius: '8px',
  border: '1px solid #ffc107',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '8px 32px',
}

const approveButton = {
  backgroundColor: '#212529',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 48px',
  width: '80%',
}

const rejectButton = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  color: '#FF6B6B',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 48px',
  border: '2px solid #FF6B6B',
  width: '80%',
}

const viewButton = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  color: '#495057',
  fontSize: '14px',
  fontWeight: '500',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '10px 48px',
  border: '1px solid #e9ecef',
  width: '80%',
}

const divider = {
  borderTop: '1px solid #e9ecef',
  margin: '24px 32px',
}

const footer = {
  color: '#adb5bd',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 32px 32px',
  textAlign: 'center' as const,
}
