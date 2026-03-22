import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { UpdateCommissionRequest } from '@/types'

// GET /api/commissions/[id] - Get specific commission
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const commissionId = params.id

    // Get commission with related data
    const { data: commission, error } = await supabase
      .from('commissions')
      .select(`
        *,
        transactions (
          id,
          transaction_type,
          final_price,
          commission_amount,
          closing_date,
          status,
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
          user_id,
          brokerages (
            id,
            name,
            commission_split_pct
          )
        )
      `)
      .eq('id', commissionId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Commission not found' }, { status: 404 })
      }
      throw error
    }

    // Check permissions - agent, admin, or brokerage manager
    const isAgent = commission.agents?.user_id === user.id
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    const isAdmin = profile?.role === 'admin'

    if (!isAgent && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Transform the data
    const transformedCommission = {
      ...commission,
      transaction: commission.transactions,
      agent: {
        ...commission.agents,
        brokerage: commission.agents?.brokerages
      }
    }

    return NextResponse.json({ data: transformedCommission })
  } catch (error) {
    console.error('Error fetching commission:', error)
    return NextResponse.json({ error: 'Failed to fetch commission' }, { status: 500 })
  }
}

// PATCH /api/commissions/[id] - Update commission
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const commissionId = params.id
    const body: UpdateCommissionRequest = await request.json()

    // Get current commission
    const { data: currentCommission } = await supabase
      .from('commissions')
      .select('agent_id, status')
      .eq('id', commissionId)
      .single()

    if (!currentCommission) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 })
    }

    // Check permissions - agent or admin
    const { data: agent } = await supabase
      .from('agents')
      .select('user_id')
      .eq('id', currentCommission.agent_id)
      .single()

    const isAgent = agent?.user_id === user.id
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    const isAdmin = profile?.role === 'admin'

    if (!isAgent && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Agents can only update status to 'paid' if they were pending
    if (isAgent && !isAdmin) {
      if (body.status && body.status !== 'paid') {
        return NextResponse.json({ error: 'Agents can only mark commissions as paid' }, { status: 403 })
      }
      if (currentCommission.status !== 'pending') {
        return NextResponse.json({ error: 'Can only update pending commissions' }, { status: 400 })
      }
    }

    // Update commission
    const updateData: any = { ...body }
    if (body.status === 'paid' && !body.paid_at) {
      updateData.paid_at = new Date().toISOString()
    }

    const { data: updatedCommission, error } = await supabase
      .from('commissions')
      .update(updateData)
      .eq('id', commissionId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      data: updatedCommission,
      message: 'Commission updated successfully'
    })
  } catch (error) {
    console.error('Error updating commission:', error)
    return NextResponse.json({ error: 'Failed to update commission' }, { status: 500 })
  }
}