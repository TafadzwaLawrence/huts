import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { UpdateTransactionRequest } from '@/types'

export const dynamic = 'force-dynamic'

// GET /api/transactions/[id] - Get specific transaction
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

    const transactionId = params.id

    // Get transaction with all related data
    const { data: transaction, error } = await supabase
      .from('transactions')
      .select(`
        *,
        transaction_participants (
          id,
          profile_id,
          role,
          commission_split_pct,
          commission_amount,
          can_contact,
          preferred_contact_method,
          profiles (
            id,
            name,
            email,
            avatar_url,
            phone
          )
        ),
        properties (
          id,
          title,
          address,
          price,
          sale_price,
          listing_type,
          bedrooms,
          bathrooms,
          square_feet,
          property_images (
            id,
            url,
            is_primary
          )
        ),
        transaction_documents (
          id,
          document_type,
          title,
          description,
          file_path,
          file_name,
          file_size_bytes,
          mime_type,
          is_private,
          is_executed,
          executed_at,
          uploaded_by,
          created_at,
          profiles!transaction_documents_uploaded_by_fkey (
            name,
            avatar_url
          )
        ),
        commissions (
          id,
          agent_id,
          total_commission,
          agent_split_pct,
          agent_commission,
          brokerage_commission,
          status,
          paid_at,
          payment_method,
          agents (
            id,
            user_id,
            full_name,
            email,
            phone
          )
        )
      `)
      .eq('id', transactionId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
      }
      throw error
    }

    // Check if user has access to this transaction
    const isParticipant = transaction.transaction_participants?.some(
      (p: any) => p.profile_id === user.id
    )
    const isCreator = transaction.created_by === user.id
    const isAdmin = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      .then(({ data }) => data?.role === 'admin')

    if (!isParticipant && !isCreator && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Transform the data
    const transformedTransaction = {
      ...transaction,
      participants: transaction.transaction_participants?.map((p: any) => ({
        ...p,
        profile: p.profiles
      })) || [],
      property: transaction.properties,
      documents: transaction.transaction_documents?.map((d: any) => ({
        ...d,
        uploaded_by_profile: d.profiles
      })) || [],
      commissions: transaction.commissions?.map((c: any) => ({
        ...c,
        agent: c.agents
      })) || []
    }

    return NextResponse.json({ data: transformedTransaction })
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json({ error: 'Failed to fetch transaction' }, { status: 500 })
  }
}

// PATCH /api/transactions/[id] - Update transaction
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

    const transactionId = params.id
    const body: UpdateTransactionRequest = await request.json()

    // Check if user has permission to update this transaction
    const { data: transaction } = await supabase
      .from('transactions')
      .select('created_by')
      .eq('id', transactionId)
      .single()

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Check permissions - creator, participant with agent role, or admin
    const { data: participant } = await supabase
      .from('transaction_participants')
      .select('role')
      .eq('transaction_id', transactionId)
      .eq('profile_id', user.id)
      .single()

    const isCreator = transaction.created_by === user.id
    const isAgentParticipant = participant?.role?.includes('agent')
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    const isAdmin = profile?.role === 'admin'

    if (!isCreator && !isAgentParticipant && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Update transaction
    const { data: updatedTransaction, error } = await supabase
      .from('transactions')
      .update(body)
      .eq('id', transactionId)
      .select()
      .single()

    if (error) throw error

    // If status changed to 'closed', create commission records
    if (body.status === 'closed' && updatedTransaction.commission_amount) {
      // Get agent participants
      const { data: agentParticipants } = await supabase
        .from('transaction_participants')
        .select(`
          profile_id,
          role,
          commission_split_pct,
          agents!inner(id)
        `)
        .eq('transaction_id', transactionId)
        .in('role', ['listing_agent', 'selling_agent', 'buyer_agent'])

      // Create commission records for each agent
      for (const participant of agentParticipants || []) {
        const agentData = participant.agents as any
        if (agentData && participant.commission_split_pct) {
          await supabase.rpc('fn_create_commission_record', {
            p_transaction_id: transactionId,
            p_agent_id: agentData.id
          })
        }
      }
    }

    return NextResponse.json({
      data: updatedTransaction,
      message: 'Transaction updated successfully'
    })
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 })
  }
}

// DELETE /api/transactions/[id] - Delete transaction (only if active)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const transactionId = params.id

    // Check if transaction exists and can be deleted
    const { data: transaction } = await supabase
      .from('transactions')
      .select('status, created_by')
      .eq('id', transactionId)
      .single()

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Only allow deletion of active transactions by creator or admin
    if (transaction.status !== 'active') {
      return NextResponse.json({ error: 'Cannot delete non-active transactions' }, { status: 400 })
    }

    const isCreator = transaction.created_by === user.id
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    const isAdmin = profile?.role === 'admin'

    if (!isCreator && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Delete transaction (cascade will handle related records)
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)

    if (error) throw error

    return NextResponse.json({ message: 'Transaction deleted successfully' })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 })
  }
}