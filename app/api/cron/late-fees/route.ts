import { NextRequest, NextResponse } from 'next/server'

// POST /api/cron/late-fees
// Called by a Vercel cron job (vercel.json: "0 6 * * *")
// Marks overdue obligations and generates late fee charges.
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized calls
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service-role client for cron (bypasses RLS)
    const { createAdminClient } = await import('@/lib/supabase/server')
    const adminDb = createAdminClient()

    const { error } = await adminDb.rpc('fn_process_late_fees')
    if (error) throw error

    console.log('[Cron] Late fees processed at', new Date().toISOString())
    return NextResponse.json({ success: true, processed_at: new Date().toISOString() })
  } catch (error) {
    console.error('[Cron] Late fees error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
