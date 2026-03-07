import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH /api/agreements/[id] – terminate or complete an agreement
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
    const { status, notes } = body

    if (!status || !['active', 'completed', 'terminated'].includes(status)) {
      return NextResponse.json(
        { error: 'status must be one of: active, completed, terminated' },
        { status: 400 }
      )
    }

    // Verify ownership
    const { data: agreement, error: fetchError } = await supabase
      .from('rental_agreements')
      .select('id, landlord_id, property_id, agreement_type')
      .eq('id', params.id)
      .single()

    if (fetchError || !agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    if (agreement.landlord_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the landlord can update an agreement' },
        { status: 403 }
      )
    }

    const updateData: Record<string, unknown> = { status }
    if (notes !== undefined) updateData.notes = notes

    const { data, error } = await supabase
      .from('rental_agreements')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    // If terminated or completed, re-activate the property listing
    if (status === 'terminated' || status === 'completed') {
      await supabase
        .from('properties')
        .update({ status: 'active' })
        .eq('id', agreement.property_id)
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[Agreements][PATCH] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/agreements/[id] – get single agreement with payments
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

    const { data, error } = await supabase
      .from('rental_agreements')
      .select(`
        id, property_id, agreement_type, status,
        lease_start_date, lease_end_date,
        monthly_rent, deposit_amount, agreed_sale_price, notes,
        created_at, updated_at,
        property:properties!rental_agreements_property_id_fkey(
          id, title, slug, address, city, listing_type,
          property_images(url, is_primary)
        ),
        landlord:profiles!rental_agreements_landlord_id_fkey(id, name, avatar_url, phone, email),
        tenant:profiles!rental_agreements_tenant_id_fkey(id, name, avatar_url, phone, email),
        rent_payments(
          id, due_date, amount, status, paid_at, payment_method, notes, created_at
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
      }
      throw error
    }

    // RLS already enforces access, but double-check
    if (!data) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[Agreements][GET] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
