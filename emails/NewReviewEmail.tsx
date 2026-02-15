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
  Hr
} from '@react-email/components'

interface NewReviewEmailProps {
  landlordName: string
  propertyTitle: string
  reviewerName: string
  rating: number
  reviewTitle: string
  reviewComment: string
  propertyUrl: string
  reviewUrl: string
}

export default function NewReviewEmail({
  landlordName = 'Property Owner',
  propertyTitle = 'Your Property',
  reviewerName = 'Guest',
  rating = 5,
  reviewTitle = 'Great stay!',
  reviewComment = 'Had an amazing experience at this property...',
  propertyUrl = 'https://www.huts.co.zw/property/123',
  reviewUrl = 'https://www.huts.co.zw/dashboard/property-reviews'
}: NewReviewEmailProps) {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)

  return (
    <Html>
      <Head />
      <Preview>
        New {String(rating)}-star review for {propertyTitle}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>HUTS</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={h2}>You've received a new review!</Heading>
            
            <Text style={text}>Hi {landlordName},</Text>
            
            <Text style={text}>
              Good news! {reviewerName} just left a {rating}-star review for your property <strong>{propertyTitle}</strong>.
            </Text>

            {/* Rating */}
            <Section style={ratingBox}>
              <Text style={starsText}>{stars}</Text>
              <Text style={ratingNumber}>{rating}/5</Text>
            </Section>

            {/* Review Content */}
            <Section style={reviewBox}>
              <Text style={reviewTitleText}>{reviewTitle}</Text>
              <Text style={reviewCommentText}>{reviewComment}</Text>
              <Text style={reviewerText}>— {reviewerName}</Text>
            </Section>

            {/* CTA */}
            <Text style={text}>
              Responding to reviews shows future guests that you care about their experience.
            </Text>

            <Button style={button} href={reviewUrl}>
              View & Respond to Review
            </Button>

            <Hr style={hr} />

            {/* Footer */}
            <Text style={footer}>
              <a href={propertyUrl} style={link}>
                View Property
              </a>
              {' · '}
              <a href={reviewUrl} style={link}>
                Manage Reviews
              </a>
            </Text>

            <Text style={footer}>
              Huts · Connecting landlords with renters
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles - Black & White theme
const main = {
  backgroundColor: '#F8F9FA',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
}

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px'
}

const header = {
  textAlign: 'center' as const,
  paddingBottom: '32px'
}

const h1 = {
  color: '#000000',
  fontSize: '32px',
  fontWeight: '900',
  letterSpacing: '2px',
  margin: '0'
}

const content = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E9ECEF',
  borderRadius: '8px',
  padding: '40px'
}

const h2 = {
  color: '#212529',
  fontSize: '24px',
  fontWeight: '600',
  margin: '0 0 24px'
}

const text = {
  color: '#495057',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0'
}

const ratingBox = {
  backgroundColor: '#F8F9FA',
  border: '2px solid #E9ECEF',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center' as const,
  margin: '24px 0'
}

const starsText = {
  fontSize: '32px',
  margin: '0 0 8px',
  color: '#000000'
}

const ratingNumber = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#212529',
  margin: '0'
}

const reviewBox = {
  borderLeft: '4px solid #000000',
  paddingLeft: '16px',
  margin: '24px 0'
}

const reviewTitleText = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#212529',
  margin: '0 0 8px'
}

const reviewCommentText = {
  fontSize: '16px',
  color: '#495057',
  lineHeight: '24px',
  margin: '0 0 12px'
}

const reviewerText = {
  fontSize: '14px',
  color: '#ADB5BD',
  fontStyle: 'italic',
  margin: '0'
}

const button = {
  backgroundColor: '#000000',
  color: '#FFFFFF',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '14px 24px',
  borderRadius: '6px',
  border: '2px solid #000000',
  margin: '24px 0'
}

const hr = {
  borderColor: '#E9ECEF',
  margin: '32px 0'
}

const footer = {
  color: '#ADB5BD',
  fontSize: '14px',
  textAlign: 'center' as const,
  margin: '8px 0'
}

const link = {
  color: '#495057',
  textDecoration: 'underline'
}
