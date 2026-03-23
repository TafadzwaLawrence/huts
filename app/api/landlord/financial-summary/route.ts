import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/landlord/financial-summary
// Cross-property income overview for the authenticated landlord
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Active agreements for this landlord
    const { data: agreements, error: agreeError } = await supabase
      .from('rental_agreements')
      .select(`
        id, monthly_rent, deposit_amount, currency, status,
        property:properties!rental_agreements_property_id_fkey(id, title, city)
      `)
      .eq('landlord_id', user.id)
      .eq('status', 'active')

    if (agreeError) throw agreeError

    const agreementIds = (agreements ?? []).map(a => a.id)

    if (agreementIds.length === 0) {
      return NextResponse.json({
        data: {
          total_active_leases: 0,
          total_monthly_rent: 0,
          total_overdue_amount: 0,
          total_overdue_count: 0,
          total_open_disputes: 0,
          agreements: [],
        }
      })
    }

    // Overdue obligations
    const { data: overdueObs } = await supabase
      .from('lease_obligations')
      .select('agreement_id, amount, amount_paid')
      .in('agreement_id', agreementIds)
      .in('status', ['overdue', 'delinquent'])

    // Open disputes
    const { count: openDisputes } = await supabase
      .from('payment_disputes')
      .select('*', { count: 'exact', head: true })
      .in('agreement_id', agreementIds)
      .eq('status', 'open')

    // Per-agreement overdue amounts
    const overdueByAgreement = new Map<string, number>()
    for (const ob of overdueObs ?? []) {
      const outstanding = Number(ob.amount) - Number(ob.amount_paid)
      overdueByAgreement.set(ob.agreement_id, (overdueByAgreement.get(ob.agreement_id) ?? 0) + outstanding)
    }

    const summaries = (agreements ?? []).map(a => ({
      id: a.id,
      property: a.property,
      monthly_rent: a.monthly_rent,
      currency: a.currency,
      overdue_amount: overdueByAgreement.get(a.id) ?? 0,
    }))

    const total_monthly_rent = summaries.reduce((sum, a) => sum + Number(a.monthly_rent), 0)
    const total_overdue_amount = summaries.reduce((sum, a) => sum + a.overdue_amount, 0)

    return NextResponse.json({
      data: {
        total_active_leases: agreements?.length ?? 0,
        total_monthly_rent,
        total_overdue_amount,
        total_overdue_count: overdueObs?.length ?? 0,
        total_open_disputes: openDisputes ?? 0,
        agreements: summaries,
      }
    })
  } catch (error) {
    console.error('[FinancialSummary] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
