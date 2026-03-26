/**
 * POST /api/leads/[leadId]/claim
 * 
 * Agent claims a lead that was assigned to them
 * Updates lead status to 'claimed' and records claim time in distribution history
 * 
 * Requires:
 * - Authentication (agent must be logged in)
 * - Lead must be in 'assigned' status
 * - Lead's claim_deadline_at must not have passed
 * - Agent must be the assigned_to agent
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getClaimWindowSecondsRemaining, isClaimWindowOpen } from '@/lib/agent-metrics'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: {
    leadId: string
  }
}

export async function POST(request: Request, { params }: RouteParams) {
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

    const { leadId } = params

    if (!leadId) {
      return NextResponse.json(
        { error: 'Missing leadId parameter' },
        { status: 400 },
      )
    }

    // 2. Get the lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // 3. Verify agent is the assigned_to agent
    const { data: assignedAgent, error: agentError } = await supabase
      .from('agents')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (agentError || !assignedAgent) {
      return NextResponse.json(
        { error: 'You are not registered as an agent' },
        { status: 403 },
      )
    }

    if (lead.assigned_to !== assignedAgent.id) {
      return NextResponse.json(
        { error: 'This lead is not assigned to you' },
        { status: 403 },
      )
    }

    // 4. Check if lead is still in claimable status
    if (lead.status !== 'assigned') {
      return NextResponse.json(
        {
          error: `Lead is already ${lead.status}. Cannot claim.`,
          leadStatus: lead.status,
        },
        { status: 409 },
      )
    }

    // 5. Check if claim window is still open
    if (!isClaimWindowOpen(lead.auto_assigned_at, lead.claim_deadline_at)) {
      const secondsRemaining = getClaimWindowSecondsRemaining(
        lead.claim_deadline_at,
      )

      return NextResponse.json(
        {
          error: 'Claim window has expired. Lead will be reassigned.',
          secondsRemaining,
        },
        { status: 410 }, // 410 Gone
      )
    }

    // 6. Update lead to claimed status
    const now = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        status: 'claimed',
        claimed_at: now,
      })
      .eq('id', leadId)

    if (updateError) {
      console.error('Failed to claim lead:', updateError)
      return NextResponse.json(
        { error: 'Failed to claim lead' },
        { status: 500 },
      )
    }

    // 7. Update distribution history with claim info
    const claimTime = lead.auto_assigned_at
      ? new Date(now).getTime() - new Date(lead.auto_assigned_at).getTime()
      : 0
    const responseMinutes = Math.round(claimTime / (1000 * 60))

    const { error: historyError } = await supabase
      .from('lead_distribution_history')
      .update({
        assignment_status: 'claimed',
        response_at: now,
        response_time_minutes: responseMinutes,
      })
      .eq('lead_id', leadId)
      .eq('assigned_agent_id', assignedAgent.id)

    if (historyError) {
      console.error('Failed to update distribution history:', historyError)
      // Not critical - continue anyway
    }

    // 8. Send success response
    // Fetch updated lead
    const { data: updatedLead, error: refetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (refetchError) {
      return NextResponse.json(
        {
          success: true,
          leadId,
          message: 'Lead claimed successfully (could not fetch updated record)',
        },
        { status: 200 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        lead: updatedLead,
        message: `Lead claimed! You claimed this lead in ${responseMinutes} minute${responseMinutes !== 1 ? 's' : ''}.`,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Claim lead error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

/**
 * GET /api/leads/[leadId]/claim/status
 * 
 * Check if lead is still claimable (for countdown timer in UI)
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient()

    const { leadId } = params

    if (!leadId) {
      return NextResponse.json(
        { error: 'Missing leadId parameter' },
        { status: 400 },
      )
    }

    // Get the lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('status, claim_deadline_at, auto_assigned_at')
      .eq('id', leadId)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Check if claimable
    const isClaimable = lead.status === 'assigned'
    const secondsRemaining = getClaimWindowSecondsRemaining(
      lead.claim_deadline_at,
    )
    const isWindowOpen = secondsRemaining > 0

    return NextResponse.json(
      {
        leadId,
        status: lead.status,
        isClaimable: isClaimable && isWindowOpen,
        secondsRemaining,
        windowOpen: isWindowOpen,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Get claim status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
