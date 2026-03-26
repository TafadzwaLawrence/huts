import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET /api/agreements/[id]/disputes – list disputes (both parties)
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
      .select('id')
      .eq('id', params.id)
      .single()

    if (!agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('payment_disputes')
      .select(`
        *,
        tenant:profiles!payment_disputes_tenant_id_fkey(full_name, email),
        obligation:lease_obligations!payment_disputes_obligation_id_fkey(type, description, amount, due_date)
      `)
      .eq('agreement_id', params.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ data })
  } catch (error) {
    console.error('[Disputes] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/agreements/[id]/disputes – tenant opens a dispute
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
    const { reason, obligation_id } = body

    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { error: 'reason must be at least 10 characters' },
        { status: 400 }
      )
    }

    // Verify this user is the tenant on this agreement
    const { data: agreement } = await supabase
      .from('rental_agreements')
      .select('id, tenant_id, landlord_id')
      .eq('id', params.id)
      .single()

    if (!agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    if (agreement.tenant_id !== user.id) {
      return NextResponse.json({ error: 'Only the tenant can open a dispute' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('payment_disputes')
      .insert({
        agreement_id: params.id,
        obligation_id: obligation_id ?? null,
        tenant_id: user.id,
        reason: reason.trim(),
        status: 'open',
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('[Disputes] POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
