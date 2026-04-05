import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendLeadMagnetEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      lead_magnet_id,
      email,
      name,
      phone,
      location,
      user_type,
      additional_data = {},
      source_page,
    } = body

    // Validation
    if (!lead_magnet_id || !email) {
      return NextResponse.json(
        { error: 'Lead magnet ID and email are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get lead magnet details
    const { data: leadMagnet, error: magnetError } = await supabase
      .from('lead_magnets')
      .select('*')
      .eq('id', lead_magnet_id)
      .eq('is_active', true)
      .single()

    if (magnetError || !leadMagnet) {
      return NextResponse.json(
        { error: 'Lead magnet not found' },
        { status: 404 }
      )
    }

    // Get client IP and user agent for tracking
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-client-ip') ||
      'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Check if email already downloaded this magnet (prevent duplicates)
    const { data: existingDownload } = await supabase
      .from('lead_magnet_downloads')
      .select('id')
      .eq('lead_magnet_id', lead_magnet_id)
      .eq('email', email)
      .single()

    if (existingDownload) {
      return NextResponse.json(
        {
          success: true,
          message: 'You already have this lead magnet. Check your email.',
          data: existingDownload,
        },
        { status: 200 }
      )
    }

    // Insert download record
    const { data: download, error: insertError } = await supabase
      .from('lead_magnet_downloads')
      .insert({
        lead_magnet_id,
        email,
        name,
        phone,
        location,
        user_type,
        additional_data,
        ip_address: ip,
        user_agent: userAgent,
        source_page,
      })
      .select()
      .single()

    if (insertError) {
      console.error('[Lead Magnet] Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to process download' },
        { status: 500 }
      )
    }

    // Send welcome email with lead magnet
    try {
      await sendLeadMagnetEmail({
        email,
        name: name || 'there',
        leadMagnetTitle: leadMagnet.title,
        downloadUrl: leadMagnet.file_url,
        leadMagnetSlug: leadMagnet.slug,
      })
    } catch (emailError) {
      console.error('[Lead Magnet] Email send error:', emailError)
      // Don't fail the request if email fails, they still got their lead magnet
    }

    // Trigger automation workflow if email setting allows
    try {
      // Get associated workflow
      const { data: workflow } = await supabase
        .from('email_automation_workflows')
        .select('id')
        .eq('trigger_lead_magnet_id', lead_magnet_id)
        .eq('is_active', true)
        .single()

      if (workflow) {
        // Queue automation (this would typically be a background job)
        // For now, log for manual processing or queue with a background service
        console.log(`[Lead Magnet] Queue automation workflow: ${workflow.id}`)
      }
    } catch (workflowError) {
      console.error('[Lead Magnet] Workflow error:', workflowError)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Download successful! Check your email.',
        data: download,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Lead Magnet] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Fetch lead magnet details (for frontend)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const id = searchParams.get('id')

    if (!slug && !id) {
      return NextResponse.json(
        { error: 'Slug or ID required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    let query = supabase
      .from('lead_magnets')
      .select('*')
      .eq('is_active', true)

    if (slug) {
      query = query.eq('slug', slug)
    } else if (id) {
      query = query.eq('id', id)
    }

    const { data: leadMagnet, error } = await query.single()

    if (error || !leadMagnet) {
      return NextResponse.json(
        { error: 'Lead magnet not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: leadMagnet }, { status: 200 })
  } catch (error) {
    console.error('[Lead Magnet GET] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
