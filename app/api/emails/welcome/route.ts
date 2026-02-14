import { NextRequest, NextResponse } from 'next/server'
import { resend } from '@/lib/resend'
import { WelcomeEmail } from '@/emails/WelcomeEmail'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, role } = body

    if (!email || !name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await resend.emails.send({
      from: 'Huts <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to Huts!',
      react: WelcomeEmail({ name, role }),
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      messageId: data?.id 
    })
  } catch (error) {
    console.error('Welcome email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
