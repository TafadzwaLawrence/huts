import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'chitangalawrence03@gmail.com')
  .split(',')
  .map(e => e.trim())

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if email is in admin whitelist
    if (!ADMIN_EMAILS.includes(email)) {
      return NextResponse.json(
        { error: 'Access denied. Your email is not authorized for admin access.' },
        { status: 401 }
      )
    }

    // Authenticate with Supabase
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Invalid email or password' },
        { status: 401 }
      )
    }

    if (!data.session) {
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    // Session is automatically set by Supabase middleware
    return NextResponse.json(
      { 
        success: true,
        message: 'Admin signed in successfully'
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Admin signin error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
