/**
 * GET /api/leads
 * 
 * List leads for the authenticated agent
 * Includes filtering, sorting, and pagination
 * 
 * Query parameters:
 * - status: comma-separated list of statuses (new,assigned,claimed,contacted,in_progress,converted,closed,lost,spam)
 * - leadType: comma-separated lead types (buyer_lead,seller_lead,rental_lead,property_valuation,general_inquiry)
 * - sortBy: 'score' (default), 'date', 'urgency'
 * - limit: number of results (default 20, max 100)
 * - offset: pagination offset (default 0)
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface LeadQuery {
  status?: string
  leadType?: string
  sortBy?: string
  limit?: string
  offset?: string
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // 1. Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      )
    }

    // 2. Get agent record
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (agentError || !agent) {
      return NextResponse.json(
        { error: 'You are not registered as an agent' },
        { status: 403 },
      )
    }

    // 3. Parse query parameters
    const url = new URL(request.url)
    const statusParam = url.searchParams.get('status')
    const leadTypeParam = url.searchParams.get('leadType')
    const sortByParam = url.searchParams.get('sortBy') || 'score'
    const limitParam = Math.min(
      parseInt(url.searchParams.get('limit') || '20'),
      100,
    )
    const offsetParam = parseInt(url.searchParams.get('offset') || '0')

    // 4. Build query
    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('assigned_agent_id', agent.id)

    // Filter by status
    if (statusParam) {
      const statuses = statusParam.split(',')
      query = query.in('status', statuses)
    }

    // Filter by lead type
    if (leadTypeParam) {
      const leadTypes = leadTypeParam.split(',')
      query = query.in('lead_type', leadTypes)
    }

    // 5. Sort results
    switch (sortByParam) {
      case 'urgency':
        // Newer leads with higher scores first (ASAP urgency)
        query = query.order('lead_score', { ascending: false }).order('created_at', { ascending: false })
        break
      case 'date':
        // Most recent first
        query = query.order('created_at', { ascending: false })
        break
      case 'score':
      default:
        // Highest score first (quality leads)
        query = query.order('lead_score', { ascending: false })
        break
    }

    // 6. Paginate
    query = query.range(offsetParam, offsetParam + limitParam - 1)

    // 7. Execute query
    const {
      data: leads,
      error: leadsError,
      count,
    } = await query

    if (leadsError) {
      console.error('Failed to fetch leads:', leadsError)
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 },
      )
    }

    // 8. Enrich response with agent and distribution info
    const leadsWithDetails = await Promise.all(
      (leads || []).map(async (lead) => {
        // Get distribution history
        const { data: distHistory } = await supabase
          .from('lead_distribution_history')
          .select('*')
          .eq('lead_id', lead.id)
          .order('assigned_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        return {
          ...lead,
          distributionInfo: distHistory,
        }
      }),
    )

    // 9. Return success response
    return NextResponse.json(
      {
        leads: leadsWithDetails,
        pagination: {
          total: count || 0,
          limit: limitParam,
          offset: offsetParam,
          hasMore: (offsetParam + limitParam) < (count || 0),
        },
        filters: {
          status: statusParam,
          leadType: leadTypeParam,
          sortBy: sortByParam,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('List leads error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

/**
 * PATCH /api/leads/[leadId]
 * 
 * Update lead status and notes
 * Only agent assigned to lead can update
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    // 1. Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      )
    }

    // 2. Get agent record
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (agentError || !agent) {
      return NextResponse.json(
        { error: 'You are not registered as an agent' },
        { status: 403 },
      )
    }

    // 3. Parse request body
    const body = await request.json()
    const { leadId, status, agentNotes } = body

    if (!leadId) {
      return NextResponse.json(
        { error: 'Missing leadId' },
        { status: 400 },
      )
    }

    // 4. Verify agent owns this lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id, assigned_to')
      .eq('id', leadId)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    if (lead.assigned_to !== agent.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this lead' },
        { status: 403 },
      )
    }

    // 5. Validate status if provided
    const validStatuses = [
      'new',
      'assigned',
      'claimed',
      'contacted',
      'in_progress',
      'converted',
      'closed',
      'lost',
      'spam',
    ]
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status: ${status}` },
        { status: 400 },
      )
    }

    // 6. Update lead
    const updatePayload: any = {}
    if (status) updatePayload.status = status
    if (agentNotes !== undefined) updatePayload.agent_notes = agentNotes

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 },
      )
    }

    const { error: updateError } = await supabase
      .from('leads')
      .update(updatePayload)
      .eq('id', leadId)

    if (updateError) {
      console.error('Failed to update lead:', updateError)
      return NextResponse.json(
        { error: 'Failed to update lead' },
        { status: 500 },
      )
    }

    // 7. Fetch updated lead
    const { data: updatedLead, error: refetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (refetchError) {
      return NextResponse.json(
        { error: 'Lead updated but could not fetch updated record' },
        { status: 200 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        lead: updatedLead,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Update lead error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
