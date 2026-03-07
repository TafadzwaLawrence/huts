import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

// GET /api/admin/conversations/[id] - Get messages for a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const admin = createAdminClient()

    const { data: messages, error } = await admin
      .from('messages')
      .select(
        `
        id, content, created_at, sender_id,
        sender:profiles!messages_sender_id_fkey(name, email, avatar_url)
        `
      )
      .eq('conversation_id', params.id)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ messages: messages || [] })
  } catch (error: any) {
    console.error('[Admin Conversations] messages GET error:', error)
    if (error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
