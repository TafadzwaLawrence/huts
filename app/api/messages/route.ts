import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CreateMessageThreadRequest, SendMessageRequest } from '@/types'

// GET /api/messages - Get message threads for current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get('transaction_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get threads where user is a participant
    let query = supabase
      .from('message_threads')
      .select(`
        *,
        messages (
          id,
          sender_id,
          recipient_id,
          content,
          message_type,
          attachment_url,
          attachment_name,
          attachment_size_bytes,
          is_read,
          read_at,
          created_at,
          sender:profiles!messages_sender_id_fkey (
            id,
            name,
            avatar_url
          ),
          recipient:profiles!messages_recipient_id_fkey (
            id,
            name,
            avatar_url
          )
        ),
        transaction:transactions (
          id,
          properties (
            title,
            address
          )
        )
      `)
      .or(`created_by.eq.${user.id},messages.sender_id.eq.${user.id},messages.recipient_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (transactionId) {
      query = query.eq('transaction_id', transactionId)
    }

    const { data: threads, error } = await query

    if (error) throw error

    // Transform the data
    const transformedThreads = threads?.map((thread: any) => ({
      ...thread,
      messages: thread.messages?.map((msg: any) => ({
        ...msg,
        sender_profile: msg.sender,
        recipient_profile: msg.recipient
      })) || [],
      transaction: thread.transaction ? {
        id: thread.transaction.id,
        property_title: thread.transaction.properties?.title,
        property_address: thread.transaction.properties?.address
      } : undefined
    })) || []

    return NextResponse.json({ data: transformedThreads })
  } catch (error) {
    console.error('Error fetching message threads:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST /api/messages/threads - Create new message thread
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body: CreateMessageThreadRequest = await request.json()

    // Validate required fields
    if (!body.recipient_id || !body.initial_message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify recipient exists
    const { data: recipient } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', body.recipient_id)
      .single()

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

    // Check if transaction-specific thread and verify access
    if (body.transaction_id) {
      const { data: transaction } = await supabase
        .from('transactions')
        .select(`
          id,
          transaction_participants!inner(profile_id)
        `)
        .eq('id', body.transaction_id)
        .single()

      if (!transaction) {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
      }

      const isParticipant = transaction.transaction_participants?.some(
        (p: any) => p.profile_id === user.id || p.profile_id === body.recipient_id
      )

      if (!isParticipant) {
        return NextResponse.json({ error: 'Access denied to transaction' }, { status: 403 })
      }
    }

    // Create thread
    const { data: thread, error: threadError } = await supabase
      .from('message_threads')
      .insert({
        transaction_id: body.transaction_id,
        subject: body.subject,
        created_by: user.id
      })
      .select()
      .single()

    if (threadError) throw threadError

    // Create initial message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        thread_id: thread.id,
        sender_id: user.id,
        recipient_id: body.recipient_id,
        content: body.initial_message,
        message_type: 'text'
      })
      .select()
      .single()

    if (messageError) throw messageError

    return NextResponse.json({
      data: {
        thread,
        initial_message: message
      },
      message: 'Message thread created successfully'
    })
  } catch (error) {
    console.error('Error creating message thread:', error)
    return NextResponse.json({ error: 'Failed to create message thread' }, { status: 500 })
  }
}