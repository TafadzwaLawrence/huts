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
  Hr,
} from '@react-email/components'
import * as React from 'react'

interface AgentVerificationEmailProps {
  agentName: string
  agentType: string
  profileUrl: string
  portalUrl: string
  /** 'approved' when status→active, 'verified' when verified badge granted */
  action: 'approved' | 'verified'
}

export const AgentVerificationEmail = ({
  agentName,
  agentType,
  profileUrl,
  portalUrl,
  action,
}: AgentVerificationEmailProps) => {
  const isApproval = action === 'approved'

  return (
    <Html>
      <Head />
      <Preview>
        {isApproval
          ? `Your Huts agent profile is now live, ${agentName}!`
          : `Congratulations — you've been verified on Huts, ${agentName}!`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>HUTS</Text>
            <Text style={headerSubtitle}>
              {isApproval ? 'Profile Approved' : 'Verified Badge Granted'}
            </Text>
          </Section>

          <Heading style={h1}>
            {isApproval ? 'Your profile is live!' : 'You\'re now verified!'}
          </Heading>

          <Text style={text}>Hi {agentName},</Text>

          <Text style={text}>
            {isApproval
              ? `Great news — your ${agentType} profile on Huts has been reviewed and approved. You're now live on the platform and potential clients can find you in the agent directory.`
              : `Congratulations! Your Huts profile has been awarded a Verified badge. This badge shows potential clients that you are a trusted and credentialed ${agentType} on the platform.`}
          </Text>

          {/* What this means */}
          <Section style={infoBox}>
            <Text style={infoTitle}>
              {isApproval ? 'What happens next' : 'What the Verified badge means'}
            </Text>
            {isApproval ? (
              <>
                <Text style={bulletItem}>✦ Your profile appears in the Find an Agent directory</Text>
                <Text style={bulletItem}>✦ Clients can contact you directly from your public profile</Text>
                <Text style={bulletItem}>✦ Leads and inquiries will appear in your agent portal</Text>
                <Text style={bulletItem}>✦ Complete your profile to attract more clients</Text>
              </>
            ) : (
              <>
                <Text style={bulletItem}>✦ A verified checkmark appears on your public profile</Text>
                <Text style={bulletItem}>✦ You rank higher in agent search results</Text>
                <Text style={bulletItem}>✦ Clients trust verified agents more — expect more inquiries</Text>
              </>
            )}
          </Section>

          {/* CTA buttons */}
          <Section style={buttonContainer}>
            <Button style={primaryButton} href={portalUrl}>
              Go to Your Portal
            </Button>
          </Section>

          <Section style={buttonContainer}>
            <Button style={secondaryButton} href={profileUrl}>
              View Your Public Profile
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={footer}>
            You received this email because you registered as an agent on Huts Zimbabwe.
            If you have questions, reply to this email or contact us at{' '}
            <a href="mailto:support@huts.co.zw" style={footerLink}>
              support@huts.co.zw
            </a>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default AgentVerificationEmail

// ── Styles ──────────────────────────────────────────────────────────────────

const main = {
  backgroundColor: '#f8f9fa',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
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
  fontSize: '12px',
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
  fontSize: '15px',
  lineHeight: '24px',
  margin: '16px 32px',
}

const infoBox = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '20px 24px',
  margin: '8px 32px 24px',
  border: '1px solid #e9ecef',
}

const infoTitle = {
  color: '#212529',
  fontSize: '13px',
  fontWeight: '700',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 12px',
}

const bulletItem = {
  color: '#495057',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '4px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '8px 32px',
}

const primaryButton = {
  backgroundColor: '#212529',
  borderRadius: '10px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '700',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
}

const secondaryButton = {
  backgroundColor: '#ffffff',
  border: '2px solid #212529',
  borderRadius: '10px',
  color: '#212529',
  fontSize: '14px',
  fontWeight: '700',
  padding: '12px 28px',
  textDecoration: 'none',
  display: 'inline-block',
}

const divider = {
  borderColor: '#e9ecef',
  margin: '32px',
}

const footer = {
  color: '#adb5bd',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0 32px 32px',
  textAlign: 'center' as const,
}

const footerLink = {
  color: '#495057',
}
