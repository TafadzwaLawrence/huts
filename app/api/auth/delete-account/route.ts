import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

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

    const admin = createAdminClient()
    const uid = user.id

    // ── Strategy A: Use the DB-level RPC (requires migration 034) ────
    // This runs everything in a single SQL function that handles the
    // materialized-view trigger safely.
    const { error: rpcError } = await admin.rpc('delete_user_completely', {
      target_user_id: uid,
    })

    if (!rpcError) {
      return NextResponse.json({ success: true })
    }

    console.warn('[Delete Account] RPC unavailable, using fallback:', rpcError.message)

    // ── Strategy B: Manual cleanup + soft-delete ─────────────────────
    // The refresh_property_ratings trigger uses REFRESH MATERIALIZED
    // VIEW CONCURRENTLY which crashes inside PostgREST transactions.
    // We do best-effort cleanup, then soft-delete the auth user to
    // avoid GoTrue's CASCADE hitting the same broken trigger.

    // Best-effort: delete application data (errors are non-fatal)
    try {
      const { data: userProperties } = await admin
        .from('properties')
        .select('id')
        .eq('user_id', uid)
      const propIds = (userProperties || []).map((p) => p.id)

      // Review leaf tables
      const reviewIds: string[] = []
      const { data: authored } = await admin
        .from('reviews')
        .select('id')
        .eq('author_id', uid)
      if (authored) reviewIds.push(...authored.map((r) => r.id))

      if (propIds.length > 0) {
        const { data: propRevs } = await admin
          .from('reviews')
          .select('id')
          .in('property_id', propIds)
        if (propRevs) reviewIds.push(...propRevs.map((r) => r.id))
      }

      const uniqRevIds = Array.from(new Set(reviewIds))
      if (uniqRevIds.length > 0) {
        await admin.from('review_votes').delete().in('review_id', uniqRevIds)
        await admin.from('review_responses').delete().in('review_id', uniqRevIds)
        // Reviews delete may fail due to trigger — that's OK for fallback
        await admin.from('reviews').delete().in('id', uniqRevIds)
      }
      await admin.from('review_votes').delete().eq('user_id', uid)

      if (propIds.length > 0) {
        await admin.from('property_images').delete().in('property_id', propIds)
        await admin.from('saved_properties').delete().in('property_id', propIds)
        await admin.from('properties').delete().in('id', propIds)
      }

      await admin.from('saved_properties').delete().eq('user_id', uid)
      await admin
        .from('conversations')
        .delete()
        .or(`renter_id.eq.${uid},landlord_id.eq.${uid}`)
      await admin.from('messages').delete().eq('sender_id', uid)
      await admin.from('agents').delete().eq('user_id', uid)
      await admin.from('saved_searches').delete().eq('user_id', uid)
      await admin.from('profiles').delete().eq('id', uid)
    } catch (cleanupErr) {
      console.warn('[Delete Account] Cleanup error (non-fatal):', cleanupErr)
    }

    // Soft-delete: marks user as deleted without triggering CASCADE.
    // The user cannot log in and the email is freed for re-signup.
    const { error: softDeleteError } = await admin.auth.admin.deleteUser(uid, true)

    if (softDeleteError) {
      console.error('[Delete Account] Soft delete failed:', softDeleteError)
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Delete Account] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
