import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH /api/agreements/[id]/payments/[paymentId] – mark a payment as paid/overdue/waived
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; paymentId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { status, paid_at, payment_method, notes } = body

    if (!status || !['pending', 'paid', 'overdue', 'waived'].includes(status)) {
      return NextResponse.json(
        { error: 'status must be one of: pending, paid, overdue, waived' },
        { status: 400 }
      )
    }

    // Verify landlord access
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
        { error: 'Only the landlord can update payments' },
        { status: 403 }
      )
    }

    const updateData: Record<string, unknown> = { status }
    if (status === 'paid') {
      updateData.paid_at = paid_at || new Date().toISOString()
    }
    if (payment_method !== undefined) updateData.payment_method = payment_method
    if (notes !== undefined) updateData.notes = notes

    const { data, error } = await supabase
      .from('rent_payments')
      .update(updateData)
      .eq('id', params.paymentId)
      .eq('agreement_id', params.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[Payments][PATCH] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
