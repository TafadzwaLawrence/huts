import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { recordAdjustment } from '@/lib/financial-engine'

export const dynamic = 'force-dynamic'

// GET /api/agreements/[id]/adjustments – list adjustments (both parties)
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
      .from('lease_adjustments')
      .select('*, created_by_profile:profiles!lease_adjustments_created_by_fkey(full_name)')
      .eq('agreement_id', params.id)
      .order('applied_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ data })
  } catch (error) {
    console.error('[Adjustments] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/agreements/[id]/adjustments – create adjustment (landlord only)
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

    if (!type || !amount || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: type, amount, reason' },
        { status: 400 }
      )
    }

    if (!['charge', 'credit'].includes(type)) {
      return NextResponse.json({ error: 'type must be charge or credit' }, { status: 400 })
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'amount must be a positive number (cents)' }, { status: 400 })
    }

    const { data: agreement } = await supabase
      .from('rental_agreements')
      .select('id, landlord_id')
      .eq('id', params.id)
      .single()

    if (!agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    if (agreement.landlord_id !== user.id) {
      return NextResponse.json({ error: 'Only the landlord can issue adjustments' }, { status: 403 })
    }

    await recordAdjustment(supabase, params.id, type, amount, reason, user.id)
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('[Adjustments] POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
