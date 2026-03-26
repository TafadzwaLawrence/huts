import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET /api/appointments - List agent's appointments
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { data: agent } = await supabase
      .from('agents')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!agent) {
      return NextResponse.json({ error: 'Agent profile not found' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const appointmentType = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('appointments')
      .select(`
        *,
        client:clients(id, first_name, last_name, email, phone),
        property:properties(id, title, address, city),
        attendees:appointment_attendees(*)
      `, { count: 'exact' })
      .eq('agent_id', agent.id)
      .order('scheduled_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (status) {
      const statuses = status.split(',')
      query = query.in('status', statuses)
    }

    if (appointmentType) {
      query = query.eq('appointment_type', appointmentType)
    }

    if (startDate) {
      query = query.gte('scheduled_at', startDate)
    }

    if (endDate) {
      query = query.lte('scheduled_at', endDate)
    }

    const { data: appointments, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      appointments,
      pagination: {
        total: count ?? 0,
        limit,
        offset,
        hasMore: (count ?? 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error('[Appointments GET] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/appointments - Schedule a new appointment
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { data: agent } = await supabase
      .from('agents')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!agent) {
      return NextResponse.json({ error: 'Agent profile not found' }, { status: 403 })
    }

    const body = await request.json()
    const {
      appointmentType,
      title,
      description,
      scheduledAt,
      durationMinutes = 60,
      location,
      clientId,
      propertyId,
    } = body

    if (!appointmentType || !title || !scheduledAt) {
      return NextResponse.json(
        { error: 'appointmentType, title, and scheduledAt are required' },
        { status: 400 }
      )
    }

    const validTypes = ['tour', 'open_house', 'consultation', 'meeting', 'inspection', 'appraisal']
    if (!validTypes.includes(appointmentType)) {
      return NextResponse.json(
        { error: `appointmentType must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Check for scheduling conflicts (same agent, overlapping time)
    const scheduledEnd = new Date(
      new Date(scheduledAt).getTime() + durationMinutes * 60 * 1000
    ).toISOString()

    const { data: conflicts } = await supabase
      .from('appointments')
      .select('id, title, scheduled_at')
      .eq('agent_id', agent.id)
      .in('status', ['scheduled', 'confirmed'])
      .lt('scheduled_at', scheduledEnd)
      .gt('scheduled_at', new Date(new Date(scheduledAt).getTime() - durationMinutes * 60 * 1000).toISOString())

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        {
          error: 'Scheduling conflict detected',
          conflicts: conflicts.map(c => ({ id: c.id, title: c.title, scheduledAt: c.scheduled_at })),
        },
        { status: 409 }
      )
    }

    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        agent_id: agent.id,
        appointment_type: appointmentType,
        title,
        description: description || null,
        scheduled_at: scheduledAt,
        duration_minutes: durationMinutes,
        location: location || null,
        client_id: clientId || null,
        property_id: propertyId || null,
        status: 'scheduled',
      })
      .select(`
        *,
        client:clients(id, first_name, last_name, email, phone),
        property:properties(id, title, address, city)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, appointment }, { status: 201 })
  } catch (error) {
    console.error('[Appointments POST] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
