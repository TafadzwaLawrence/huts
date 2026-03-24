import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type {
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionWithParticipants
} from '@/types'

// GET /api/transactions - List transactions for current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Find transaction IDs where user is a participant (PostgREST can't filter
    // on joined table columns via .or(), so we resolve this with a pre-query)
    const { data: participantRows } = await supabase
      .from('transaction_participants')
      .select('transaction_id')
      .eq('profile_id', user.id)

    const participantTxnIds = (participantRows || []).map((r: any) => r.transaction_id as string)

    let query = supabase
      .from('transactions')
      .select(`
        *,
        transaction_participants (
          id,
          profile_id,
          role,
          commission_split_pct,
          commission_amount,
          can_contact,
          preferred_contact_method,
          profiles (
            id,
            full_name,
            email,
            avatar_url
          )
        ),
        properties (
          id,
          title,
          address,
          price,
          sale_price,
          listing_type,
          property_images (
            id,
            url,
            is_primary
          )
        ),
        transaction_documents (
          id,
          document_type,
          title,
          is_private,
          is_executed,
          created_at
        )
      `)

    // Filter: transactions created by this user OR where they are a participant
    if (participantTxnIds.length > 0) {
      query = query.or(`created_by.eq.${user.id},id.in.(${participantTxnIds.join(',')})`)
    } else {
      query = query.eq('created_by', user.id)
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    if (type) {
      query = query.eq('transaction_type', type)
    }

    const { data: transactions, error } = await query

    if (error) {
      console.error('Supabase query error:', JSON.stringify(error))
      throw error
    }

    // Transform the data to match our types
    const transformedTransactions: TransactionWithParticipants[] = transactions.map((t: any) => ({
      ...t,
      participants: t.transaction_participants?.map((p: any) => ({
        ...p,
        profile: p.profiles
      })) || [],
      property: t.properties ? {
        id: t.properties.id,
        title: t.properties.title,
        address: t.properties.address,
        price: t.properties.price,
        sale_price: t.properties.sale_price
      } : undefined,
      documents: t.transaction_documents || []
    }))

    return NextResponse.json({ data: transformedTransactions })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

// POST /api/transactions - Create new transaction
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body: CreateTransactionRequest = await request.json()

    // Validate required fields
    if (!body.property_id || !body.transaction_type || !body.participants?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify user has permission to create transactions (must be agent or admin)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['agent', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Only agents can create transactions' }, { status: 403 })
    }

    // Verify property exists
    const { data: property } = await supabase
      .from('properties')
      .select('id, user_id')
      .eq('id', body.property_id)
      .single()

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // Calculate commission amount if rate provided
    const commissionAmount = body.commission_rate && body.listing_price
      ? (body.listing_price * body.commission_rate) / 100
      : null

    // Create transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        property_id: body.property_id,
        transaction_type: body.transaction_type,
        listing_price: body.listing_price,
        offer_price: body.offer_price,
        commission_rate: body.commission_rate,
        commission_amount: commissionAmount,
        notes: body.notes,
        created_by: user.id
      })
      .select()
      .single()

    if (transactionError) throw transactionError

    // Add participants
    const participantsData = body.participants.map((p: any) => ({
      transaction_id: transaction.id,
      profile_id: p.profile_id,
      role: p.role,
      commission_split_pct: p.commission_split_pct,
      preferred_contact_method: p.preferred_contact_method || 'email'
    }))

    const { error: participantsError } = await supabase
      .from('transaction_participants')
      .insert(participantsData)

    if (participantsError) throw participantsError

    return NextResponse.json({
      data: transaction,
      message: 'Transaction created successfully'
    })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}