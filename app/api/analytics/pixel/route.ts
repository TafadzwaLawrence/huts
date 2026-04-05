import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lead_magnet_id, source, timestamp } = body

    if (!lead_magnet_id) {
      return NextResponse.json(
        { error: 'Missing lead magnet ID' },
        { status: 400 }
      )
    }

    // Log pixel tracking event (used for ad attribution, UTM tracking, etc.)
    console.log('[Pixel Track]', {
      lead_magnet_id,
      source: source || 'direct',
      timestamp,
      user_agent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for'),
    })

    // In production, you'd send this to your analytics service
    // (Google Analytics, Segment, Mixpanel, etc.)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('[Pixel] Error:', error)
    return NextResponse.json(
      { error: 'Pixel tracking failed' },
      { status: 500 }
    )
  }
}
