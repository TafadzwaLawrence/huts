import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// POST /api/clients/[clientId]/notes - Add a note to a client
export async function POST(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { data: agent } = await supabase
      .from('agents')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!agent) {
      return NextResponse.json({ error: 'Agent profile not found' }, { status: 403 })
    }

    // Verify the client belongs to this agent
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('id', params.clientId)
      .eq('agent_id', agent.id)
      .single()

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const { noteText, isInternal = true } = await request.json()

    if (!noteText?.trim()) {
      return NextResponse.json({ error: 'noteText is required' }, { status: 400 })
    }

    const { data: note, error } = await supabase
      .from('client_notes')
      .insert({
        client_id: params.clientId,
        agent_id: agent.id,
        note_text: noteText.trim(),
        is_internal: isInternal,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, note }, { status: 201 })
  } catch (error) {
    console.error('[Client Notes POST] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
