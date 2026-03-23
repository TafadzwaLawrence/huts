import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/agreements/[id]/deposit – list deposit transactions (both parties)
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { data: agreement } = await supabase
      .from('rental_agreements')
      .select('id, deposit_amount, currency')
      .eq('id', params.id)
      .single()

    if (!agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    const { data: transactions, error } = await supabase
      .from('deposit_transactions')
      .select('*, created_by_profile:profiles!deposit_transactions_created_by_fkey(full_name)')
      .eq('agreement_id', params.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Calculate deposit balance
    const depositBalance = (transactions ?? []).reduce((sum, t) => {
      if (t.type === 'received') return sum + Number(t.amount)
      return sum - Number(t.amount)  // deduction or refund reduces deposit balance
    }, 0)

    return NextResponse.json({
      data: transactions,
      deposit_amount: agreement.deposit_amount,
      deposit_balance: depositBalance,
      currency: agreement.currency,
    })
  } catch (error) {
    console.error('[Deposit] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/agreements/[id]/deposit – record deposit transaction (landlord only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { type, amount, reason } = body

    if (!type || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: type, amount' },
        { status: 400 }
      )
    }

    if (!['received', 'deduction', 'refund'].includes(type)) {
      return NextResponse.json({ error: 'type must be received, deduction, or refund' }, { status: 400 })
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'amount must be a positive number (cents)' }, { status: 400 })
    }

    const { data: agreement } = await supabase
      .from('rental_agreements')
      .select('id, landlord_id, currency')
      .eq('id', params.id)
      .single()

    if (!agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    if (agreement.landlord_id !== user.id) {
      return NextResponse.json({ error: 'Only the landlord can record deposit transactions' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('deposit_transactions')
      .insert({
        agreement_id: params.id,
        type,
        amount,
        reason: reason || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    // Also create a ledger entry for deposit tracking
    const ledgerType = type === 'received' ? 'deposit' : type === 'deduction' ? 'charge' : 'refund'
    await supabase.from('financial_ledger_entries').insert({
      agreement_id: params.id,
      type: ledgerType,
      amount,
      currency: agreement.currency ?? 'usd',
      description: reason || `Deposit ${type}`,
      created_by: user.id,
    })

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('[Deposit] POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
