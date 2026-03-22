import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Use admin client to delete the auth user (cascades to profiles via ON DELETE CASCADE)
    const adminClient = createAdminClient()
    const { error } = await adminClient.auth.admin.deleteUser(user.id)

    if (error) {
      console.error('[Delete Account] error:', error)
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Delete Account] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
