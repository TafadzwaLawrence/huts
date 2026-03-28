import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getResend } from '@/lib/resend'
import { BuyingGuideWelcomeEmail } from '@/emails/BuyingGuideWelcomeEmail'
import { BuyingGuidePDFEmail } from '@/emails/BuyingGuidePDFEmail'

export const dynamic = 'force-dynamic'

interface ContactFormData {
  firstName: string
  email: string
  location: string
  message?: string
  leadMagnetSource?: string
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body: ContactFormData = await request.json()

    const { firstName, email, location, message, leadMagnetSource = 'contact_form' } = body

    // Validation
    if (!firstName || !email || !location) {
      return NextResponse.json(
        { error: 'First name, email, and location are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Check if lead already exists
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('email', email)
      .single()

    if (existingLead) {
      return NextResponse.json(
        { error: 'You are already subscribed. Check your email for the guide.' },
        { status: 409 }
      )
    }

    // Insert new lead
    const { data: newLead, error: insertError } = await supabase
      .from('leads')
      .insert({
        name: firstName,
        email,
        location,
        message: message || null,
        lead_type: leadMagnetSource === 'buying_guide' ? 'buyer' : 'general',
        lead_magnet_source: leadMagnetSource,
        email_sequence_stage: 'pending',
        opted_in_at: new Date().toISOString(),
        lead_score: 50, // Base score for lead magnet subscribers
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('[Contact] Lead insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save your information' },
        { status: 500 }
      )
    }

    // Trigger email sequence (immediate async, don't block response)
    if (newLead?.id && leadMagnetSource === 'buying_guide') {
      triggerLeadMagnetSequence(newLead.id, email, firstName).catch((err) => {
        console.error('[Contact] Email sequence error:', err)
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you! Check your email for the guide.',
      leadId: newLead?.id,
    })
  } catch (error: any) {
    console.error('[Contact] Unexpected error:', error?.message || error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Trigger the lead magnet email sequence
 * For MVP: sends welcome email immediately via Resend
 * Future: use Supabase pg_cron for day 1 and day 3 emails
 */
async function triggerLeadMagnetSequence(leadId: string, email: string, firstName: string) {
  try {
    const supabase = await createClient()

    let resend
    try {
      resend = getResend()
    } catch (err) {
      console.error('[Email Sequence] Resend not configured:', err)
      return
    }

    // Send welcome email immediately
    const { error: welcomeError } = await resend.emails.send({
      from: 'Huts <noreply@huts.co.zw>',
      to: email,
      subject: "Welcome! Here's Your Free Property Buying Guide",
      react: BuyingGuideWelcomeEmail({ buyerName: firstName }),
    })

    if (welcomeError) {
      console.error('[Email Sequence] Welcome email error:', welcomeError)
      return
    }

    console.log('[Email Sequence] Welcome email sent to:', email)

    // Update stage
    await supabase
      .from('leads')
      .update({ email_sequence_stage: 'welcome_sent' })
      .eq('id', leadId)

    // TODO: Schedule future emails using Supabase pg_cron
    // Day 1: PDF email with guide attachment
    // Day 3: Tips email
  } catch (error) {
    console.error('[Email Sequence] Error:', error)
  }
}
