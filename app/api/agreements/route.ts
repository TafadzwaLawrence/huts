import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET /api/agreements – list agreements for the current user
export async function GET() {
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
          id, title, slug, address, city, listing_type, status,
          property_images(url, is_primary)
        ),
        landlord:profiles!rental_agreements_landlord_id_fkey(id, full_name, avatar_url, phone),
        tenant:profiles!rental_agreements_tenant_id_fkey(id, full_name, avatar_url, phone)
      `)
      .or(`landlord_id.eq.${user.id},tenant_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ data })
  } catch (error) {
    console.error('[Agreements] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/agreements – create a new rental/sale agreement
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const {
      property_id,
      tenant_id,
      conversation_id,
      agreement_type,
      lease_start_date,
      lease_end_date,
      monthly_rent,
      deposit_amount,
      agreed_sale_price,
      notes,
    } = body

    // Validate required fields
    if (!property_id || !tenant_id || !agreement_type || !lease_start_date) {
      return NextResponse.json(
        { error: 'Missing required fields: property_id, tenant_id, agreement_type, lease_start_date' },
        { status: 400 }
      )
    }

    if (!['rent', 'sale'].includes(agreement_type)) {
      return NextResponse.json({ error: 'agreement_type must be rent or sale' }, { status: 400 })
    }

    // Verify the current user is the landlord of this property
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('id, user_id, listing_type, status')
      .eq('id', property_id)
      .single()

    if (propError || !property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    if (property.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the property landlord can create an agreement' },
        { status: 403 }
      )
    }

    // Prevent landlord from agreeing with themselves
    if (tenant_id === user.id) {
      return NextResponse.json(
        { error: 'Cannot create an agreement with yourself' },
        { status: 400 }
      )
    }

    // Create the agreement
    const { data: agreement, error: agreementError } = await supabase
      .from('rental_agreements')
      .insert({
        property_id,
        landlord_id: user.id,
        tenant_id,
        conversation_id: conversation_id || null,
        agreement_type,
        lease_start_date,
        lease_end_date: lease_end_date || null,
        monthly_rent: monthly_rent || 0,
        deposit_amount: deposit_amount || 0,
        agreed_sale_price: agreed_sale_price || null,
        notes: notes || null,
      })
      .select()
      .single()

    if (agreementError) {
      // Unique constraint: one active agreement per property
      if (agreementError.code === '23505') {
        return NextResponse.json(
          { error: 'This property already has an active agreement. Please terminate it first.' },
          { status: 409 }
        )
      }
      throw agreementError
    }

    // Update property status: 'rented' for rent, 'sold' for sale
    const newStatus = agreement_type === 'sale' ? 'sold' : 'rented'
    const { error: statusError } = await supabase
      .from('properties')
      .update({ status: newStatus })
      .eq('id', property_id)

    if (statusError) {
      console.error('[Agreements] Failed to update property status:', statusError)
      // Don't fail the whole request – agreement was created
    }

    // Auto-generate first 12 rent payment records for rental agreements
    if (agreement_type === 'rent' && monthly_rent) {
      const payments = []
      const start = new Date(lease_start_date)
      for (let i = 0; i < 12; i++) {
        const due = new Date(start)
        due.setMonth(due.getMonth() + i)
        payments.push({
          agreement_id: agreement.id,
          due_date: due.toISOString().split('T')[0],
          amount: monthly_rent,
          status: 'pending',
        })
      }
      await supabase.from('rent_payments').insert(payments)
    }

    return NextResponse.json({ data: agreement }, { status: 201 })
  } catch (error) {
    console.error('[Agreements] POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
