import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SendMessageRequest } from '@/types'

export const dynamic = 'force-dynamic'

// GET /api/messages/threads/[id] - Get specific thread with messages
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

    const threadId = params.id

    // Get thread with messages
    const { data: thread, error } = await supabase
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
      .eq('id', threadId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
      }
      throw error
    }

    // Check if user has access to this thread
    const isCreator = thread.created_by === user.id
    const hasMessages = thread.messages?.some(
      (msg: any) => msg.sender_id === user.id || msg.recipient_id === user.id
    )

    if (!isCreator && !hasMessages) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Mark messages as read for current user
    await supabase
      .from('messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('thread_id', threadId)
      .eq('recipient_id', user.id)
      .eq('is_read', false)

    // Transform the data
    const transformedThread = {
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
    }

    return NextResponse.json({ data: transformedThread })
  } catch (error) {
    console.error('Error fetching message thread:', error)
    return NextResponse.json({ error: 'Failed to fetch message thread' }, { status: 500 })
  }
}

// POST /api/messages/threads/[id] - Send message in thread
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

    const threadId = params.id
    const body: SendMessageRequest = await request.json()

    // Validate required fields
    if (!body.content) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    // Verify thread exists and user has access
    const { data: thread } = await supabase
      .from('message_threads')
      .select(`
        id,
        messages (
          sender_id,
          recipient_id
        )
      `)
      .eq('id', threadId)
      .single()

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    // Check if user is a participant in this thread
    const participants = new Set()
    thread.messages?.forEach((msg: any) => {
      participants.add(msg.sender_id)
      participants.add(msg.recipient_id)
    })

    if (!participants.has(user.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Determine recipient (the other participant in the thread)
    const otherParticipants = Array.from(participants).filter(id => id !== user.id)
    if (otherParticipants.length === 0) {
      return NextResponse.json({ error: 'No recipient found in thread' }, { status: 400 })
    }

    const recipientId = otherParticipants[0] // For now, assume 1-on-1 conversations

    // Create message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        thread_id: threadId,
        sender_id: user.id,
        recipient_id: recipientId,
        content: body.content,
        message_type: body.message_type || 'text',
        attachment_url: body.attachment_url,
        attachment_name: body.attachment_name,
        attachment_size_bytes: body.attachment_size_bytes
      })
      .select(`
        *,
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
      `)
      .single()

    if (error) throw error

    // Transform message for response
    const transformedMessage = {
      ...message,
      sender_profile: message.sender,
      recipient_profile: message.recipient
    }

    return NextResponse.json({
      data: transformedMessage,
      message: 'Message sent successfully'
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}