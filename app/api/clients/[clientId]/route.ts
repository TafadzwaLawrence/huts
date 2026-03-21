import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/clients/[clientId] - Get single client
export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
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

    const { data: client, error } = await supabase
      .from('clients')
      .select(`
        *,
        notes:client_notes(*)
      `)
      .eq('id', params.clientId)
      .eq('agent_id', agent.id)
      .single()

    if (error || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    return NextResponse.json({ client })
  } catch (error) {
    console.error('[Client GET] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/clients/[clientId] - Update client
export async function PATCH(
  request: NextRequest,
  { params }: { params: { clientId: string } }
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

    // Verify ownership
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('id', params.clientId)
      .eq('agent_id', agent.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const body = await request.json()
    const allowedFields = [
      'first_name', 'last_name', 'email', 'phone', 'client_type',
      'preferred_areas', 'budget_min', 'budget_max', 'timeline',
      'special_requirements', 'is_active', 'last_contacted_at',
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

    const { data: client, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', params.clientId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, client })
  } catch (error) {
    console.error('[Client PATCH] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/clients/[clientId] - Soft delete (deactivate) client
export async function DELETE(
  request: NextRequest,
  { params }: { params: { clientId: string } }
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
      .from('clients')
      .update({ is_active: false })
      .eq('id', params.clientId)
      .eq('agent_id', agent.id)

    if (error) throw error

    return NextResponse.json({ success: true, message: 'Client deactivated' })
  } catch (error) {
    console.error('[Client DELETE] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
