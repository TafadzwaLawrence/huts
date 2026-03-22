import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[Delete Account] Missing env vars')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const adminClient = createAdminClient()
    const uid = user.id

    // Step 1: Delete from tables that DIRECTLY reference auth.users(id).
    // These are NOT covered by the profiles cascade, so they must be
    // removed first — otherwise Supabase's internal auth delete may fail.

    // saved_searches.user_id → auth.users (migration 017)
    await adminClient.from('saved_searches').delete().eq('user_id', uid)

    // agent_profiles.user_id → auth.users (migration 021)
    await adminClient.from('agent_profiles').delete().eq('user_id', uid)

    // agents.user_id → auth.users (migration 030)
    await adminClient.from('agents').delete().eq('user_id', uid)

    // Step 2: Delete the profiles row.
    // This cascades to properties, messages, reviews, notifications,
    // saved_properties, conversations, and all other app tables.
    const { error: profileError } = await adminClient
      .from('profiles')
      .delete()
      .eq('id', uid)

    if (profileError) {
      console.error('[Delete Account] Profile delete failed:', profileError)
      return NextResponse.json({ error: 'Failed to clean up account data' }, { status: 500 })
    }

    // Step 3: Delete the auth user. The database is now clean, so
    // Supabase's internal cascade has nothing that can raise an error.
    const res = await fetch(`${supabaseUrl}/auth/v1/admin/users/${uid}`, {
      method: 'DELETE',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    })

    if (!res.ok) {
      const body = await res.text()
      console.error('[Delete Account] Auth delete failed:', res.status, body)
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Delete Account] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
