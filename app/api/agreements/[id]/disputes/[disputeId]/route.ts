import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// PATCH /api/agreements/[id]/disputes/[disputeId] – landlord resolves/dismisses
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; disputeId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { status, resolution_notes } = body

    if (!status) {
      return NextResponse.json({ error: 'Missing required field: status' }, { status: 400 })
    }

    if (!['resolved', 'dismissed'].includes(status)) {
      return NextResponse.json({ error: 'status must be resolved or dismissed' }, { status: 400 })
    }

    // Verify landlord
    const { data: agreement } = await supabase
      .from('rental_agreements')
      .select('id, landlord_id')
      .eq('id', params.id)
      .single()

    if (!agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    if (agreement.landlord_id !== user.id) {
      return NextResponse.json({ error: 'Only the landlord can resolve disputes' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('payment_disputes')
      .update({
        status,
        resolution_notes: resolution_notes || null,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', params.disputeId)
      .eq('agreement_id', params.id)
      .select()
      .single()

    if (error) throw error
    if (!data) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[Disputes] PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
