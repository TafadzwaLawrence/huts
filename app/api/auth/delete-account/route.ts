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

    const admin = createAdminClient()
    const uid = user.id

    // ── Step 1: Get user's property IDs ──────────────────────────────
    const { data: userProperties } = await admin
      .from('properties')
      .select('id')
      .eq('user_id', uid)
    const propIds = (userProperties || []).map((p) => p.id)

    // ── Step 2: Get review IDs that would trigger refresh_property_ratings ──
    // We must delete reviews EXPLICITLY to avoid the materialized-view
    // refresh trigger (REFRESH MATERIALIZED VIEW CONCURRENTLY crashes
    // inside a transaction if migration 024 was not applied).
    const reviewIds: string[] = []

    const { data: authoredReviews } = await admin
      .from('reviews')
      .select('id')
      .eq('author_id', uid)
    if (authoredReviews) reviewIds.push(...authoredReviews.map((r) => r.id))

    if (propIds.length > 0) {
      const { data: propReviews } = await admin
        .from('reviews')
        .select('id')
        .in('property_id', propIds)
      if (propReviews) reviewIds.push(...propReviews.map((r) => r.id))
    }

    const uniqueReviewIds = Array.from(new Set(reviewIds))

    // ── Step 3: Delete review leaf tables, then reviews ──────────────
    if (uniqueReviewIds.length > 0) {
      await admin.from('review_votes').delete().in('review_id', uniqueReviewIds)
      await admin.from('review_responses').delete().in('review_id', uniqueReviewIds)
      await admin.from('reviews').delete().in('id', uniqueReviewIds)
    }
    // Also delete any remaining votes this user cast on OTHER reviews
    await admin.from('review_votes').delete().eq('user_id', uid)

    // ── Step 4: Delete remaining property dependents ─────────────────
    if (propIds.length > 0) {
      await admin.from('property_images').delete().in('property_id', propIds)
      await admin.from('saved_properties').delete().in('property_id', propIds)
      await admin.from('properties').delete().in('id', propIds)
    }

    // ── Step 5: Delete user's saved properties & conversations ───────
    await admin.from('saved_properties').delete().eq('user_id', uid)
    await admin
      .from('conversations')
      .delete()
      .or(`renter_id.eq.${uid},landlord_id.eq.${uid}`)
    await admin.from('messages').delete().eq('sender_id', uid)

    // ── Step 6: Delete direct auth.users FK references ───────────────
    await admin.from('agents').delete().eq('user_id', uid)
    // Tables that may or may not exist (silently ignored if missing)
    await admin.from('saved_searches').delete().eq('user_id', uid)

    // ── Step 7: Delete profile (cascades any remaining app data) ─────
    const { error: profileError } = await admin
      .from('profiles')
      .delete()
      .eq('id', uid)

    if (profileError) {
      console.error('[Delete Account] Profile delete failed:', profileError)
    }

    // ── Step 8: Delete auth user ─────────────────────────────────────
    // All application data is gone; Supabase cascade is now a no-op.
    const res = await fetch(`${supabaseUrl}/auth/v1/admin/users/${uid}`, {
      method: 'DELETE',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
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
