import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/appointments/[appointmentId] - Get single appointment
export async function GET(
  request: NextRequest,
  { params }: { params: { appointmentId: string } }
) {
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

    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *,
        client:clients(id, first_name, last_name, email, phone),
        property:properties(id, title, address, city),
        attendees:appointment_attendees(*)
      `)
      .eq('id', params.appointmentId)
      .eq('agent_id', agent.id)
      .single()

    if (error || !appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    return NextResponse.json({ appointment })
  } catch (error) {
    console.error('[Appointment GET] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/appointments/[appointmentId] - Update appointment
export async function PATCH(
  request: NextRequest,
  { params }: { params: { appointmentId: string } }
) {
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

    const { data: existing } = await supabase
      .from('appointments')
      .select('id, status')
      .eq('id', params.appointmentId)
      .eq('agent_id', agent.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    const body = await request.json()
    const allowedFields = [
      'title', 'description', 'scheduled_at', 'duration_minutes', 'location',
      'status', 'client_feedback', 'agent_notes', 'follow_up_required',
      'client_id', 'property_id',
    ]

    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data: appointment, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', params.appointmentId)
      .select(`
        *,
        client:clients(id, first_name, last_name, email, phone),
        property:properties(id, title, address, city)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, appointment })
  } catch (error) {
    console.error('[Appointment PATCH] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/appointments/[appointmentId] - Cancel appointment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { appointmentId: string } }
) {
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

    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', params.appointmentId)
      .eq('agent_id', agent.id)

    if (error) throw error

    return NextResponse.json({ success: true, message: 'Appointment cancelled' })
  } catch (error) {
    console.error('[Appointment DELETE] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
