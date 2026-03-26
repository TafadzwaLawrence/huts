import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { applyPaymentToObligations } from '@/lib/financial-engine'

export const dynamic = 'force-dynamic'

// GET /api/agreements/[id]/payments – list payments for an agreement
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

    // Verify the user is a party to this agreement (RLS handles it, but we also need the data)
    const { data: agreement } = await supabase
      .from('rental_agreements')
      .select('id, landlord_id, tenant_id, monthly_rent')
      .eq('id', params.id)
      .single()

    if (!agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('rent_payments')
      .select('*')
      .eq('agreement_id', params.id)
      .order('due_date', { ascending: true })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[Payments][GET] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/agreements/[id]/payments – log a payment (landlord only)
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
    const { due_date, amount, status, paid_at, payment_method, notes, reference_id } = body

    if (!due_date || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: due_date, amount' },
        { status: 400 }
      )
    }

    // Verify landlord ownership
    const { data: agreement } = await supabase
      .from('rental_agreements')
      .select('id, landlord_id')
      .eq('id', params.id)
      .single()

    if (!agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    if (agreement.landlord_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the landlord can log payments' },
        { status: 403 }
      )
    }

    // Insert into rent_payments (legacy table kept for backwards compat)
    const { data, error } = await supabase
      .from('rent_payments')
      .insert({
        agreement_id: params.id,
        due_date,
        amount,
        status: status || 'paid',
        paid_at: paid_at || new Date().toISOString(),
        payment_method: payment_method || null,
        notes: notes || null,
      })
      .select()
      .single()

    if (error) throw error

    // Also apply to lease_obligations and write ledger entry (new engine)
    // Non-fatal: if no obligations exist yet (pre-038 agreements), skip gracefully
    try {
      await applyPaymentToObligations(
        supabase,
        params.id,
        Number(amount),
        payment_method || 'manual',
        reference_id || null,
        user.id
      )
    } catch (_engineError) {
      // Obligations may not exist for this agreement yet — that's OK
      console.warn('[Payments] applyPaymentToObligations skipped (no obligations):', _engineError)
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('[Payments][POST] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
