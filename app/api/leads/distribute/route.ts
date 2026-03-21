/**
 * POST /api/leads/distribute
 * 
 * Distribute a new lead to the best-matched agent using configured algorithm
 * Handles round-robin, performance-based, geographic, and specialty-based assignment
 * 
 * Request body:
 * {
 *   leadType: 'buyer_lead' | 'seller_lead' | 'rental_lead' | 'property_valuation' | 'general_inquiry',
 *   contactName: string,
 *   contactEmail?: string,
 *   contactPhone?: string,
 *   message?: string,
 *   propertyId?: string,
 *   budgetMin?: number,
 *   budgetMax?: number,
 *   preferredAreas?: string[],
 *   timeline?: string,
 *   financingStatus?: 'unknown' | 'not_ready' | 'pre_approved' | 'pre_qualified',
 *   brokerage_id?: string  // If omitting, uses default/round-robin
 * }
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import {
  calculateLeadScore,
  calculateProfileCompleteness,
  calculateAgentFitScore,
  calculateAssignmentScore,
  calculateLeadUrgencyBonus,
} from '@/lib/agent-metrics'
import type {
  CreateLeadRequest,
  AppointmentStatus,
} from '@/types/agent-system'
import { AssignmentMode } from '@/types/agent-system'

// Type for agents in assignment pool
interface AgentForAssignment {
  id: string
  avg_rating: number | null
  office_city: string | null
  specializations: string[] | null
  total_reviews: number | null
  is_featured: boolean
  is_premier: boolean
  created_at: string
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 1. Parse and validate request
    const body: CreateLeadRequest = await request.json()

    if (!body.leadType || !body.contactName) {
      return NextResponse.json(
        { error: 'Missing required fields: leadType, contactName' },
        { status: 400 },
      )
    }

    // Get user info if authenticated (optional for leads)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // 2. Calculate lead score
    const profileCompleteness = calculateProfileCompleteness(
      body.contactName,
      body.contactEmail,
      body.contactPhone,
      body.message,
    )

    const leadScore = calculateLeadScore(
      profileCompleteness,
      body.financingStatus ?? undefined,
      body.timeline || '3_months',
    )

    // Apply urgency bonus (fresh leads get higher score)
    const urgencyBonus = calculateLeadUrgencyBonus(new Date())
    const adjustedLeadScore = Math.min(
      leadScore.totalScore * (1 + urgencyBonus * 0.2),
      100,
    )

    // 3. Create lead record (unassigned initially)
    const { data: newLead, error: leadError } = await supabase
      .from('leads')
      .insert({
        lead_type: body.leadType,
        contact_name: body.contactName,
        contact_email: body.contactEmail,
        contact_phone: body.contactPhone,
        message: body.message,
        property_id: body.propertyId,
        budget_min: body.budgetMin,
        budget_max: body.budgetMax,
        preferred_areas: body.preferredAreas,
        timeline: body.timeline,
        financing_status: body.financingStatus,
        lead_score: adjustedLeadScore,
        profile_completeness_pct: profileCompleteness,
        status: 'new',
        user_agent: request.headers.get('user-agent'),
        ip_address:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip'),
      })
      .select()
      .single()

    if (leadError || !newLead) {
      console.error('Failed to create lead:', leadError)
      return NextResponse.json(
        { error: 'Failed to create lead record' },
        { status: 500 },
      )
    }

    // 4. Determine brokerage and assignment mode
    let brokerageId = body.brokerageId

    // If no brokerage specified, try to find default
    if (!brokerageId) {
      // For MVP: use first active brokerage or null (standalone agents)
      const { data: brokerages } = await supabase
        .from('brokerages')
        .select('id, assignment_mode')
        .limit(1)
        .single()

      brokerageId = brokerages?.id
    }

    // Get assignment mode from brokerage config
    let assignmentMode = AssignmentMode.RoundRobin
    if (brokerageId) {
      const { data: brokerage } = await supabase
        .from('brokerages')
        .select('assignment_mode')
        .eq('id', brokerageId)
        .single()

      if (brokerage?.assignment_mode) {
        assignmentMode = brokerage.assignment_mode as AssignmentMode
      }
    }

    // 5. Find eligible agents
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, avg_rating, office_city, specializations, total_reviews, is_featured, is_premier, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (agentsError || !agents || agents.length === 0) {
      // No agents available - mark as 'assigned' but no agent
      await supabase
        .from('leads')
        .update({
          status: 'assigned',
          auto_assigned_at: new Date().toISOString(),
          claim_deadline_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        })
        .eq('id', newLead.id)

      return NextResponse.json(
        {
          leadId: newLead.id,
          assignedAgentId: null,
          assignedTeamId: null,
          assignmentMode: 'no_agents_available',
          assignmentReason: 'No active agents available',
          claimDeadlineAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          lead: newLead,
        },
        { status: 400 },
      )
    }

    // 6. Assign lead based on algorithm
    let selectedAgent = agents[0]
    let assignmentReason = 'Default: first available agent'

    if (assignmentMode === 'round_robin') {
      // Assign to agent with oldest 'auto_assigned_at', cycling through pool
      // For MVP: just pick first, later optimize with RPC function
      selectedAgent = agents[0]
      assignmentReason = `Round-robin: ${selectedAgent.id}`
    } else if (assignmentMode === 'performance_based') {
      // Sort by rating (highest first) and pick top
      const agentScores = agents.map((agent) => {
        const fitScore = calculateAgentFitScore(
          agent as any,
          body.preferredAreas,
          body.specializations,
        )
        const assignmentScore = calculateAssignmentScore(leadScore, fitScore)
        return { agent, assignmentScore, fitScore }
      })

      const bestMatch = agentScores.sort(
        (a, b) => b.assignmentScore - a.assignmentScore,
      )[0]

      selectedAgent = bestMatch.agent
      assignmentReason = `Performance-based: score ${bestMatch.assignmentScore.toFixed(2)}`
    } else if (assignmentMode === 'geographic') {
      // Filter by service area match
      const geoFiltered = agents.filter((agent) => {
        if (!agent.office_city || !body.preferredAreas) return true
        return body.preferredAreas.some((area) =>
          agent.office_city
            ?.toLowerCase()
            .includes(area.toLowerCase()),
        )
      })

      selectedAgent = geoFiltered.length > 0 ? geoFiltered[0] : agents[0]
      assignmentReason = `Geographic: ${selectedAgent.office_city || 'default city'}`
    } else if (assignmentMode === 'specialty') {
      // Filter by specialization match
      const specFiltered = agents.filter(
        (agent) =>
          agent.specializations &&
          agent.specializations.length > 0,
      )

      selectedAgent = specFiltered.length > 0 ? specFiltered[0] : agents[0]
      assignmentReason = `Specialty: ${selectedAgent.specializations?.join(', ') || 'default'}`
    }

    // Set assignment times
    const assignAt = new Date()
    const claimDeadlineAt = new Date(assignAt.getTime() + 5 * 60 * 1000) // 5 minutes
    const expiresAt = new Date(assignAt.getTime() + 15 * 60 * 1000) // 15 minutes total

    // 7. Update lead with assignment
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        assigned_to: selectedAgent.id,
        status: 'assigned',
        auto_assigned_at: assignAt.toISOString(),
        claim_deadline_at: claimDeadlineAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .eq('id', newLead.id)

    if (updateError) {
      console.error('Failed to assign lead:', updateError)
      return NextResponse.json(
        { error: 'Failed to assign lead to agent' },
        { status: 500 },
      )
    }

    // 8. Create distribution history record
    const { error: historyError } = await supabase
      .from('lead_distribution_history')
      .insert({
        lead_id: newLead.id,
        assigned_agent_id: selectedAgent.id,
        assignment_mode: assignmentMode,
        assignment_reason: assignmentReason,
        assignment_status: 'assigned',
        assigned_at: assignAt.toISOString(),
      })

    if (historyError) {
      console.error('Failed to log distribution history:', historyError)
      // Not critical - continue without logging
    }

    // 9. Return success response
    return NextResponse.json(
      {
        leadId: newLead.id,
        assignedAgentId: selectedAgent.id,
        assignedTeamId: null, // Teams in Phase 2
        assignmentMode,
        assignmentReason,
        claimDeadlineAt: claimDeadlineAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        lead: {
          ...newLead,
          lead_score: adjustedLeadScore,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Lead distribution error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
