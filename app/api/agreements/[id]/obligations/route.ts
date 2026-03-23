import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateObligationsForPeriod } from '@/lib/financial-engine'

// GET /api/agreements/[id]/obligations – list obligations
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')  // optional filter

    let query = supabase
      .from('lease_obligations')
      .select('*')
      .eq('agreement_id', params.id)
      .order('due_date', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[Obligations] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/agreements/[id]/obligations – generate obligations for a period (landlord only)
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
    const { period_date } = body  // ISO date string within the target month

    if (!period_date) {
      return NextResponse.json({ error: 'Missing required field: period_date' }, { status: 400 })
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
      return NextResponse.json({ error: 'Only the landlord can generate obligations' }, { status: 403 })
    }

    const periodDate = new Date(period_date)
    if (isNaN(periodDate.getTime())) {
      return NextResponse.json({ error: 'Invalid period_date format' }, { status: 400 })
    }

    const obligations = await generateObligationsForPeriod(supabase, params.id, periodDate)
    return NextResponse.json({ data: obligations }, { status: 201 })
  } catch (error) {
    console.error('[Obligations] POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/agreements/[id]/obligations – waive an obligation (landlord only)
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

    const body = await request.json()
    const { obligation_id, status } = body

    if (!obligation_id || !status) {
      return NextResponse.json({ error: 'Missing required fields: obligation_id, status' }, { status: 400 })
    }

    const ALLOWED_STATUS = ['waived', 'delinquent']
    if (!ALLOWED_STATUS.includes(status)) {
      return NextResponse.json({ error: 'status must be waived or delinquent' }, { status: 400 })
    }

    // Verify landlord
    const { data: agreement } = await supabase
      .from('rental_agreements')
      .select('id, landlord_id')
      .eq('id', params.id)
      .single()

    if (!agreement || agreement.landlord_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('lease_obligations')
      .update({ status })
      .eq('id', obligation_id)
      .eq('agreement_id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[Obligations] PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
