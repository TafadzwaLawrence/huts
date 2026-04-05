import { Resend } from 'resend'
import LeadMagnetEmail from '@/emails/LeadMagnetEmail'

// Initialize lazily to avoid build-time errors when env vars aren't available
let _resend: Resend | null = null

export function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not defined')
    }
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

// Keep backward-compatible export (lazy getter)
export const resend = new Proxy({} as Resend, {
  get(_, prop) {
    return (getResend() as any)[prop]
  }
})

// Lead magnet email sending
export interface SendLeadMagnetEmailProps {
  email: string
  name: string
  leadMagnetTitle: string
  downloadUrl: string
  leadMagnetSlug: string
}

export async function sendLeadMagnetEmail({
  email,
  name,
  leadMagnetTitle,
  downloadUrl,
  leadMagnetSlug,
}: SendLeadMagnetEmailProps) {
  try {
    const result = await getResend().emails.send({
      from: 'Huts <noreply@huts.zw>',
      to: email,
      subject: `Your Guide: ${leadMagnetTitle} is Ready! 📚`,
      react: LeadMagnetEmail({
        name,
        leadMagnetTitle,
        downloadUrl,
        leadMagnetSlug,
      }),
    })

    return result
  } catch (error) {
    console.error('[Resend] Send lead magnet email error:', error)
    throw error
  }
}
