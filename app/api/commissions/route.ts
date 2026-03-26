import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CreateCommissionRequest, UpdateCommissionRequest } from '@/types'

export const dynamic = 'force-dynamic'

// GET /api/commissions - Get commissions for current agent
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get agent record for current user
    const { data: agent } = await supabase
      .from('agents')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!agent) {
      return NextResponse.json({ error: 'Agent profile not found' }, { status: 404 })
    }

    // Get commissions for this agent
    let query = supabase
      .from('commissions')
      .select(`
        *,
        transactions (
          id,
          transaction_type,
          final_price,
          commission_amount,
          closing_date,
          properties (
            id,
            title,
            address
          )
        ),
        agents (
          id,
          full_name,
          email,
          phone,
          brokerages (
            id,
            name
          )
        )
      `)
      .eq('agent_id', agent.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: commissions, error } = await query

    if (error) throw error

    // Transform the data
    const transformedCommissions = commissions?.map((commission: any) => ({
      ...commission,
      transaction: commission.transactions ? {
        id: commission.transactions.id,
        type: commission.transactions.transaction_type,
        final_price: commission.transactions.final_price,
        commission_amount: commission.transactions.commission_amount,
        closing_date: commission.transactions.closing_date,
        property: commission.transactions.properties
      } : undefined,
      agent: commission.agents ? {
        ...commission.agents,
        brokerage: commission.agents.brokerages
      } : undefined
    })) || []

    return NextResponse.json({ data: transformedCommissions })
  } catch (error) {
    console.error('Error fetching commissions:', error)
    return NextResponse.json({ error: 'Failed to fetch commissions' }, { status: 500 })
  }
}

// POST /api/commissions - Create commission record (admin/agent only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body: CreateCommissionRequest = await request.json()

    // Validate required fields
    if (!body.transaction_id || !body.agent_id || !body.total_commission || !body.agent_split_pct) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check permissions - admin or agent involved in transaction
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'

    // Check if user is the agent or admin
    const { data: agent } = await supabase
      .from('agents')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const isAgent = agent?.id === body.agent_id

    if (!isAdmin && !isAgent) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Verify transaction exists and is closed
    const { data: transaction } = await supabase
      .from('transactions')
      .select('id, status, commission_amount')
      .eq('id', body.transaction_id)
      .single()

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    if (transaction.status !== 'closed') {
      return NextResponse.json({ error: 'Can only create commissions for closed transactions' }, { status: 400 })
    }

    // Calculate agent commission
    const agentCommission = (body.total_commission * body.agent_split_pct) / 100
    const brokerageCommission = body.brokerage_split_pct
      ? (body.total_commission * body.brokerage_split_pct) / 100
      : body.total_commission - agentCommission

    // Create commission record
    const { data: commission, error } = await supabase
      .from('commissions')
      .insert({
        transaction_id: body.transaction_id,
        agent_id: body.agent_id,
        total_commission: body.total_commission,
        agent_split_pct: body.agent_split_pct,
        agent_commission: agentCommission,
        brokerage_split_pct: body.brokerage_split_pct,
        brokerage_commission: brokerageCommission,
        notes: body.notes
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      data: commission,
      message: 'Commission record created successfully'
    })
  } catch (error) {
    console.error('Error creating commission:', error)
    return NextResponse.json({ error: 'Failed to create commission' }, { status: 500 })
  }
}