import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatCents } from '@/lib/financial-engine'
import { TrendingUp, AlertCircle, Home, MessageSquare } from 'lucide-react'

export const metadata = {
  title: 'Finances | Dashboard',
}

export default async function FinancesOverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signup')

  // Fetch active agreements for this landlord
  const { data: agreements } = await supabase
    .from('rental_agreements')
    .select(`
      id, monthly_rent, deposit_amount, currency, status, lease_start_date,
      late_fee_enabled,
      property:properties!rental_agreements_property_id_fkey(id, title, city),
      tenant:profiles!rental_agreements_tenant_id_fkey(id, full_name, email)
    `)
    .eq('landlord_id', user.id)
    .eq('status', 'active')
    .order('lease_start_date', { ascending: false })

  const agreementIds = (agreements ?? []).map(a => a.id)

  // Fetch overdue obligations + open disputes in parallel
  const [{ data: overdueObs }, { count: openDisputes }] = await Promise.all([
    supabase
      .from('lease_obligations')
      .select('agreement_id, amount, amount_paid')
      .in('agreement_id', agreementIds.length ? agreementIds : ['none'])
      .in('status', ['overdue', 'delinquent']),
    supabase
      .from('payment_disputes')
      .select('*', { count: 'exact', head: true })
      .in('agreement_id', agreementIds.length ? agreementIds : ['none'])
      .eq('status', 'open'),
  ])

  const total_monthly_rent = (agreements ?? []).reduce((s, a) => s + Number(a.monthly_rent), 0)
  const total_overdue = (overdueObs ?? []).reduce(
    (s, o) => s + Number(o.amount) - Number(o.amount_paid), 0
  )

  const overdueByAgreement = new Map<string, number>()
  for (const o of overdueObs ?? []) {
    overdueByAgreement.set(o.agreement_id, (overdueByAgreement.get(o.agreement_id) ?? 0) +
      Number(o.amount) - Number(o.amount_paid))
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#212529]">Finances</h1>
          <p className="text-sm text-[#495057] mt-1">Track rent, balances, and lease obligations across your properties</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="border border-[#E9ECEF] rounded-lg p-4">
            <div className="text-xs text-[#495057] mb-1">Active Leases</div>
            <div className="text-2xl font-semibold text-[#212529]">{agreements?.length ?? 0}</div>
          </div>
          <div className="border border-[#E9ECEF] rounded-lg p-4">
            <div className="flex items-center gap-1 text-xs text-[#495057] mb-1">
              <TrendingUp size={12} />
              Monthly Rent
            </div>
            <div className="text-2xl font-semibold text-[#212529]">
              {formatCents(total_monthly_rent)}
            </div>
          </div>
          <div className="border border-[#E9ECEF] rounded-lg p-4">
            <div className="flex items-center gap-1 text-xs text-[#495057] mb-1">
              <AlertCircle size={12} />
              Overdue
            </div>
            <div className={`text-2xl font-semibold ${total_overdue > 0 ? 'text-[#FF6B6B]' : 'text-[#212529]'}`}>
              {formatCents(total_overdue)}
            </div>
          </div>
          <div className="border border-[#E9ECEF] rounded-lg p-4">
            <div className="flex items-center gap-1 text-xs text-[#495057] mb-1">
              <MessageSquare size={12} />
              Open Disputes
            </div>
            <div className={`text-2xl font-semibold ${(openDisputes ?? 0) > 0 ? 'text-amber-600' : 'text-[#212529]'}`}>
              {openDisputes ?? 0}
            </div>
          </div>
        </div>

        {/* Active leases list */}
        {(agreements ?? []).length === 0 ? (
          <div className="border border-[#E9ECEF] rounded-lg p-12 text-center">
            <Home size={32} className="mx-auto text-[#ADB5BD] mb-3" />
            <p className="text-[#495057] text-sm">No active leases</p>
            <p className="text-[#ADB5BD] text-xs mt-1">Create a rental agreement from the rent management page</p>
            <Link
              href="/dashboard/rent-management"
              className="inline-block mt-4 text-sm font-medium text-[#212529] border border-[#212529] px-4 py-2 rounded hover:bg-[#212529] hover:text-white transition-colors"
            >
              Rent Management
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-[#495057] uppercase tracking-wide">Active Leases</h2>
            {(agreements ?? []).map(agreement => {
              const overdue = overdueByAgreement.get(agreement.id) ?? 0
              const property = agreement.property as unknown as { id: string; title: string; city: string } | null
              const tenant = agreement.tenant as unknown as { id: string; full_name: string; email: string } | null

              return (
                <Link
                  key={agreement.id}
                  href={`/dashboard/finances/${agreement.id}`}
                  className="flex items-center justify-between border border-[#E9ECEF] rounded-lg p-4 hover:border-[#212529] transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-[#212529] truncate">
                      {property?.title ?? 'Property'}
                    </div>
                    <div className="text-xs text-[#495057] mt-0.5">
                      {tenant?.full_name ?? 'Tenant'} · {property?.city}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 ml-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs text-[#ADB5BD]">Monthly</div>
                      <div className="text-sm font-medium text-[#212529]">
                        {formatCents(Number(agreement.monthly_rent), agreement.currency as 'usd' | 'zwl')}
                      </div>
                    </div>
                    {overdue > 0 && (
                      <div className="text-right">
                        <div className="text-xs text-[#ADB5BD]">Overdue</div>
                        <div className="text-sm font-medium text-[#FF6B6B]">
                          {formatCents(overdue, agreement.currency as 'usd' | 'zwl')}
                        </div>
                      </div>
                    )}
                    <svg className="w-4 h-4 text-[#ADB5BD] group-hover:text-[#212529]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
