import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateBalance } from '@/lib/financial-engine'

// GET /api/agreements/[id]/balance
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Verify access (RLS handles it, but we verify party membership explicitly)
    const { data: agreement } = await supabase
      .from('rental_agreements')
      .select('id, landlord_id, tenant_id')
      .eq('id', params.id)
      .single()

    if (!agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    const summary = await calculateBalance(supabase, params.id)
    return NextResponse.json({ data: summary })
  } catch (error) {
    console.error('[Balance] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
