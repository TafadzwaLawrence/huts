/**
 * Lead magnet email automation
 * Handles the drip sequence for lead magnet email campaigns
 */

import { createClient } from '@/lib/supabase/server'
import { getResend } from '@/lib/resend'
import { BuyingGuideWelcomeEmail } from '@/emails/BuyingGuideWelcomeEmail'
import { BuyingGuidePDFEmail } from '@/emails/BuyingGuidePDFEmail'
import { BuyingGuideTipsEmail } from '@/emails/BuyingGuideTipsEmail'

export type LeadMagnetSource = 'buying_guide' | 'rental_yield' | 'valuation_tool'
export type EmailSequenceStage = 'pending' | 'welcome_sent' | 'guide_sent' | 'tips_sent' | 'completed'

interface LeadMagnetEmailConfig {
  source: LeadMagnetSource
  name: string
  welcomeTemplate: (props: any) => React.ReactElement
  pdfTemplate: (props: any) => React.ReactElement
  tipsTemplate: (props: any) => React.ReactElement
  welcomeSubject: string
  pdfSubject: string
  tipsSubject: string
}

/**
 * Email configurations by lead magnet source
 */
const emailConfigs: Record<LeadMagnetSource, LeadMagnetEmailConfig> = {
  buying_guide: {
    source: 'buying_guide',
    name: 'Ultimate Guide to Buying Property in Zimbabwe',
    welcomeTemplate: BuyingGuideWelcomeEmail,
    pdfTemplate: BuyingGuidePDFEmail,
    tipsTemplate: BuyingGuideTipsEmail,
    welcomeSubject: "Welcome! Here's Your Free Property Buying Guide",
    pdfSubject: 'Your Ultimate Guide to Buying Property in Zimbabwe is here',
    tipsSubject: 'Secret strategies from successful Zimbabwe property buyers',
  },
  rental_yield: {
    source: 'rental_yield',
    name: "Landlord's Guide to Maximizing Rental Yield in Zimbabwe",
    welcomeTemplate: BuyingGuideWelcomeEmail,
    pdfTemplate: BuyingGuidePDFEmail,
    tipsTemplate: BuyingGuideTipsEmail,
    welcomeSubject: "Welcome to Rental Success!",
    pdfSubject: "Your Landlord's Guide to Rental Yield is ready",
    tipsSubject: 'How successful landlords maximize their returns in Zimbabwe',
  },
  valuation_tool: {
    source: 'valuation_tool',
    name: 'Home Valuation Tool Results',
    welcomeTemplate: BuyingGuideWelcomeEmail,
    pdfTemplate: BuyingGuidePDFEmail,
    tipsTemplate: BuyingGuideTipsEmail,
    welcomeSubject: 'Your Property Valuation Report is ready',
    pdfSubject: 'Detailed valuation analysis for your property',
    tipsSubject: 'Next steps for selling your property in Zimbabwe',
  },
}

/**
 * Trigger the welcome email for a lead
 * Call this immediately after lead signup
 */
export async function sendLeadMagnetWelcomeEmail(
  leadId: string,
  email: string,
  firstName: string,
  source: LeadMagnetSource
) {
  try {
    const supabase = await createClient()
    const config = emailConfigs[source]

    if (!config) {
      console.error('[Email] Unknown lead magnet source:', source)
      return false
    }

    let resend
    try {
      resend = getResend()
    } catch (err) {
      console.error('[Email] Resend not configured:', err)
      return false
    }

    const { error } = await resend.emails.send({
      from: 'Huts <noreply@huts.co.zw>',
      to: email,
      subject: config.welcomeSubject,
      react: config.welcomeTemplate({ buyerName: firstName }),
    })

    if (error) {
      console.error('[Email] Welcome email error:', error)
      return false
    }

    console.log(`[Email Sequence] Welcome email sent to ${email} (source: ${source})`)

    // Update lead stage
    await supabase
      .from('leads')
      .update({ email_sequence_stage: 'welcome_sent' })
      .eq('id', leadId)

    return true
  } catch (error) {
    console.error('[Email Sequence] Welcome email error:', error)
    return false
  }
}

/**
 * Trigger the PDF email for a lead (typically day 1 after signup)
 * This would be called by a scheduled job (pg_cron, external scheduler, etc.)
 */
export async function sendLeadMagnetPDFEmail(
  leadId: string,
  email: string,
  firstName: string,
  source: LeadMagnetSource
) {
  try {
    const supabase = await createClient()
    const config = emailConfigs[source]

    if (!config) {
      console.error('[Email] Unknown lead magnet source:', source)
      return false
    }

    let resend
    try {
      resend = getResend()
    } catch (err) {
      console.error('[Email] Resend not configured:', err)
      return false
    }

    const { error } = await resend.emails.send({
      from: 'Huts <noreply@huts.co.zw>',
      to: email,
      subject: config.pdfSubject,
      react: config.pdfTemplate({ buyerName: firstName }),
      // TODO: Attach PDF when PDF generation is added
      // attachments: [
      //   {
      //     filename: 'buying-guide.pdf',
      //     content: pdfBuffer,
      //   }
      // ]
    })

    if (error) {
      console.error('[Email] PDF email error:', error)
      return false
    }

    console.log(`[Email Sequence] PDF email sent to ${email}`)

    // Update lead stage
    await supabase
      .from('leads')
      .update({ email_sequence_stage: 'guide_sent' })
      .eq('id', leadId)

    return true
  } catch (error) {
    console.error('[Email Sequence] PDF email error:', error)
    return false
  }
}

/**
 * Trigger the tips email for a lead (typically day 3 after signup)
 * This would be called by a scheduled job
 */
export async function sendLeadMagnetTipsEmail(
  leadId: string,
  email: string,
  firstName: string,
  source: LeadMagnetSource
) {
  try {
    const supabase = await createClient()
    const config = emailConfigs[source]

    if (!config) {
      console.error('[Email] Unknown lead magnet source:', source)
      return false
    }

    let resend
    try {
      resend = getResend()
    } catch (err) {
      console.error('[Email] Resend not configured:', err)
      return false
    }

    const { error } = await resend.emails.send({
      from: 'Huts <noreply@huts.co.zw>',
      to: email,
      subject: config.tipsSubject,
      react: config.tipsTemplate({ buyerName: firstName }),
    })

    if (error) {
      console.error('[Email] Tips email error:', error)
      return false
    }

    console.log(`[Email Sequence] Tips email sent to ${email}`)

    // Update lead stage
    await supabase
      .from('leads')
      .update({ email_sequence_stage: 'tips_sent' })
      .eq('id', leadId)

    return true
  } catch (error) {
    console.error('[Email Sequence] Tips email error:', error)
    return false
  }
}

/**
 * Helper: Batch process leads for email sequence
 * Call this periodically (e.g., every 24h via cron)
 * Sends day 1 emails for leads that need them
 */
export async function processLeadMagnetEmailBatch() {
  try {
    const supabase = await createClient()

    // Find leads that need welcome sent (pending)
    const { data: pendingLeads } = await supabase
      .from('leads')
      .select('id, name, email, lead_magnet_source')
      .eq('email_sequence_stage', 'pending')
      .limit(50)

    if (!pendingLeads || pendingLeads.length === 0) {
      console.log('[Email Batch] No pending leads to process')
      return
    }

    for (const lead of pendingLeads) {
      await sendLeadMagnetWelcomeEmail(
        lead.id,
        lead.email,
        lead.name,
        (lead.lead_magnet_source as LeadMagnetSource) || 'buying_guide'
      )
    }

    console.log(`[Email Batch] Processed ${pendingLeads.length} pending leads`)
  } catch (error) {
    console.error('[Email Batch] Error:', error)
  }
}
