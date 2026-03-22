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

    // Step 1: Delete all application data using the admin client.
    // Deleting from profiles cascades to properties, messages,
    // reviews, notifications, and all other related tables.
    const { error: profileError } = await adminClient
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (profileError) {
      console.error('[Delete Account] Profile delete failed:', profileError)
      // Non-fatal — profile may already be gone; continue to auth delete
    }

    // Step 2: Delete the auth user via REST API.
    // With application data already removed, Supabase has nothing
    // left to cascade and the deletion succeeds cleanly.
    const res = await fetch(`${supabaseUrl}/auth/v1/admin/users/${user.id}`, {
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
