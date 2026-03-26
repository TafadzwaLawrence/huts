import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateStatement } from '@/lib/financial-engine'

export const dynamic = 'force-dynamic'

// GET /api/agreements/[id]/statement – fetch or generate a monthly statement
// Query params: ?period=2025-03 (YYYY-MM, defaults to current month)
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

    const { searchParams } = new URL(request.url)
    const periodParam = searchParams.get('period') // "2025-03"

    let periodStart: Date
    let periodEnd: Date

    if (periodParam) {
      const [year, month] = periodParam.split('-').map(Number)
      if (!year || !month || month < 1 || month > 12) {
        return NextResponse.json({ error: 'Invalid period format. Use YYYY-MM' }, { status: 400 })
      }
      periodStart = new Date(year, month - 1, 1)
      periodEnd = new Date(year, month, 0)
    } else {
      const now = new Date()
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    }

    const { data: agreement } = await supabase
      .from('rental_agreements')
      .select('id, landlord_id, tenant_id')
      .eq('id', params.id)
      .single()

    if (!agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    const periodStartStr = periodStart.toISOString().split('T')[0]

    // Try to fetch cached statement first
    const { data: existing } = await supabase
      .from('financial_statements')
      .select('*')
      .eq('agreement_id', params.id)
      .eq('period_start', periodStartStr)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ data: existing })
    }

    // Generate on-demand
    await generateStatement(supabase, params.id, periodStart, periodEnd)

    const { data: statement } = await supabase
      .from('financial_statements')
      .select('*')
      .eq('agreement_id', params.id)
      .eq('period_start', periodStartStr)
      .single()

    return NextResponse.json({ data: statement })
  } catch (error) {
    console.error('[Statement] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET all statements list
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('financial_statements')
      .select('*')
      .eq('agreement_id', params.id)
      .order('period_start', { ascending: false })

    if (error) throw error
    return NextResponse.json({ data })
  } catch (error) {
    console.error('[Statement] POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
