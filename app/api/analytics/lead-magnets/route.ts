import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      lead_magnet_id,
      lead_magnet_slug,
      event_type,
      timestamp,
      page_url,
      referrer,
    } = body

    // Validate input
    if (!lead_magnet_id || !event_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Note: In a real implementation, you'd store these events
    // in a separate analytics table for performance reasons.
    // For now, we're just logging them.

    console.log('[Lead Magnet Analytics]', {
      lead_magnet_id,
      lead_magnet_slug,
      event_type,
      timestamp,
      page_url,
      referrer,
    })

    // Optional: Store in analytics table (Supabase or external service)
    // const supabase = await createClient()
    // await supabase.from('lead_magnet_analytics').insert({
    //   lead_magnet_id,
    //   event_type,
    //   timestamp,
    //   page_url,
    //   referrer,
    // })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('[Analytics] Error:', error)
    // Don't expose error details publicly
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}
