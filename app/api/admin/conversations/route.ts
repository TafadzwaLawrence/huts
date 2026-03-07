import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

// GET /api/admin/conversations - Read-only list for moderation
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const admin = createAdminClient()

    const { data, count, error } = await admin
      .from('conversations')
      .select(
        `
        id, created_at, last_message_at, unread_count,
        renter_id, landlord_id, property_id,
        properties!conversations_property_id_fkey(title, slug, city),
        renter:profiles!conversations_renter_id_fkey(name, email),
        landlord:profiles!conversations_landlord_id_fkey(name, email)
        `,
        { count: 'exact' }
      )
      .order('last_message_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      conversations: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error: any) {
    console.error('[Admin Conversations] GET error:', error)
    if (error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
