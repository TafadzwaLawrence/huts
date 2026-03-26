import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET /api/clients - List agent's clients
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (agentError || !agent) {
      return NextResponse.json({ error: 'Agent profile not found' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const clientType = searchParams.get('clientType')
    const isActive = searchParams.get('isActive')
    const search = searchParams.get('search')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('clients')
      .select(`
        *,
        notes:client_notes(id, note_text, is_internal, created_at)
      `, { count: 'exact' })
      .eq('agent_id', agent.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (clientType) {
      const types = clientType.split(',')
      query = query.in('client_type', types)
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data: clients, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      clients,
      pagination: {
        total: count ?? 0,
        limit,
        offset,
        hasMore: (count ?? 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error('[Clients GET] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/clients - Create a new client
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (agentError || !agent) {
      return NextResponse.json({ error: 'Agent profile not found' }, { status: 403 })
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      clientType,
      sourceLeadId,
      preferredAreas,
      budgetMin,
      budgetMax,
      timeline,
      specialRequirements,
    } = body

    if (!firstName || !lastName || !email || !clientType) {
      return NextResponse.json(
        { error: 'firstName, lastName, email, and clientType are required' },
        { status: 400 }
      )
    }

    const validClientTypes = ['buyer', 'seller', 'renter', 'landlord', 'mixed']
    if (!validClientTypes.includes(clientType)) {
      return NextResponse.json(
        { error: `clientType must be one of: ${validClientTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        agent_id: agent.id,
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        client_type: clientType,
        source_lead_id: sourceLeadId || null,
        preferred_areas: preferredAreas || null,
        budget_min: budgetMin || null,
        budget_max: budgetMax || null,
        timeline: timeline || null,
        special_requirements: specialRequirements || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, client }, { status: 201 })
  } catch (error) {
    console.error('[Clients POST] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
