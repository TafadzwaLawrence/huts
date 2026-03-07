import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const { due_date, amount, status, paid_at, payment_method, notes } = body

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

    const { data, error } = await supabase
      .from('rent_payments')
      .insert({
        agreement_id: params.id,
        due_date,
        amount,
        status: status || 'pending',
        paid_at: paid_at || null,
        payment_method: payment_method || null,
        notes: notes || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('[Payments][POST] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
