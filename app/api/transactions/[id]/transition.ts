import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isValidTransition, validateTransitionFields, getNextStateFromAction } from '@/lib/transaction-workflow'
import type { Database } from '@/types/database'

export const dynamic = 'force-dynamic'

interface TransitionRequest {
  toState: string
  actionType: string
  metadata?: Record<string, any>
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const transactionId = params.id
    const body = (await request.json()) as TransitionRequest

    // Validate request body
    if (!body.toState) {
      return NextResponse.json(
        { error: 'Missing required field: toState' },
        { status: 400 }
      )
    }

    // Fetch transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*, transaction_participants!inner(*)')
      .eq('id', transactionId)
      .single()

    if (transactionError || !transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Check if user is a participant in the transaction
    const isParticipant = transaction.transaction_participants.some(
      (p: any) => p.profile_id === user.id
    )

    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Only transaction participants can update status' },
        { status: 403 }
      )
    }

    const currentState = transaction.status as string
    const toState = body.toState as string

    // Validate state transition
    if (!isValidTransition(currentState as any, toState as any)) {
      return NextResponse.json(
        {
          error: `Cannot transition from ${currentState} to ${toState}`,
          currentState,
          toState,
        },
        { status: 400 }
      )
    }

    // Validate required fields for transition
    const transactionData = {
      offer_price: transaction.offer_price,
      offer_date: transaction.offer_date,
      final_price: transaction.final_price,
      contract_date: transaction.contract_date,
      closing_date: transaction.closing_date,
      financing_type: transaction.financing_type,
      ...body.metadata,
    }

    const fieldValidation = validateTransitionFields(
      currentState as any,
      toState as any,
      transactionData
    )

    if (!fieldValidation.valid) {
      return NextResponse.json(
        {
          error: 'Missing required fields for state transition',
          missingFields: fieldValidation.missingFields,
        },
        { status: 400 }
      )
    }

    // Update transaction status
    const { data: updatedTransaction, error: updateError } = await supabase
      .from('transactions')
      .update({
        status: toState,
        ...(body.metadata && body.metadata),
        updated_at: new Date().toISOString(),
      })
      .eq('id', transactionId)
      .select()
      .single()

    if (updateError) {
      console.error('[Workflow] Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update transaction status' },
        { status: 500 }
      )
    }

    // If transitioning to closed, create commission records
    if (toState === 'closed') {
      const { error: commissionError } = await supabase.rpc(
        'fn_create_commission_record',
        {
          p_transaction_id: transactionId,
          p_percentage: 5, // Default 5% commission
        }
      )

      if (commissionError) {
        console.error('[Workflow] Commission creation error:', commissionError)
        // Don't fail the transition if commission creation fails
        // This can be retried later
      }
    }

    return NextResponse.json({
      success: true,
      transaction: updatedTransaction,
      message: `Transaction transitioned from ${currentState} to ${toState}`,
    })
  } catch (error) {
    console.error('[Workflow] Transition error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
