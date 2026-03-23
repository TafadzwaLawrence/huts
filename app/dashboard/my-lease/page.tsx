import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { calculateBalance, formatCents } from '@/lib/financial-engine'
import type { Currency } from '@/lib/financial-engine'
import { Home, AlertCircle, TrendingUp, Clock } from 'lucide-react'

export const metadata = { title: 'My Lease | Dashboard' }

const STATUS_STYLE: Record<string, string> = {
  pending:    'bg-gray-100 text-[#495057]',
  partial:    'bg-amber-50 text-amber-700',
  overdue:    'bg-red-50 text-[#FF6B6B]',
  delinquent: 'bg-red-100 text-red-800',
  paid:       'bg-green-50 text-[#51CF66]',
  waived:     'bg-gray-100 text-[#ADB5BD]',
}

export default async function MyLeasePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signup')

  // Active agreement where this user is tenant
  const { data: agreement } = await supabase
    .from('rental_agreements')
    .select(`
      id, monthly_rent, deposit_amount, currency, status,
      lease_start_date, lease_end_date, due_day, grace_period_days,
      late_fee_enabled, late_fee_type, late_fee_flat, late_fee_percent,
      landlord_id,
      property:properties!rental_agreements_property_id_fkey(id, title, city, address),
      landlord:profiles!rental_agreements_landlord_id_fkey(id, full_name, email, phone)
    `)
    .eq('tenant_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!agreement) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <Home size={40} className="mx-auto text-[#ADB5BD] mb-4" />
          <h2 className="text-lg font-semibold text-[#212529] mb-2">No active lease</h2>
          <p className="text-sm text-[#495057]">Your landlord will set up your lease agreement once your rental is confirmed.</p>
          <Link
            href="/dashboard/overview"
            className="inline-block mt-4 text-sm font-medium border border-[#212529] px-4 py-2 rounded hover:bg-[#212529] hover:text-white transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const currency = (agreement.currency as Currency) ?? 'usd'
  const property = agreement.property as unknown as { id: string; title: string; city: string; address: string } | null
  const landlord = agreement.landlord as unknown as { id: string; full_name: string; email: string; phone: string } | null

  const [balance, { data: obligations }, { data: disputes }] = await Promise.all([
    calculateBalance(supabase, agreement.id),
    supabase
      .from('lease_obligations')
      .select('*')
      .eq('agreement_id', agreement.id)
      .order('due_date', { ascending: false })
      .limit(12),
    supabase
      .from('payment_disputes')
      .select('*')
      .eq('agreement_id', agreement.id)
      .eq('tenant_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const upcomingObligations = (obligations ?? []).filter(o =>
    ['pending', 'partial', 'overdue'].includes(o.status)
  )

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#212529]">My Lease</h1>
          <p className="text-sm text-[#495057] mt-1">{property?.title} · {property?.city}</p>
        </div>

        {/* Balance summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className={`border rounded-lg p-4 ${balance.balance > 0 ? 'border-[#FF6B6B] bg-red-50' : 'border-[#E9ECEF]'}`}>
            <div className="text-xs text-[#495057] mb-1">
              {balance.balance > 0 ? 'Amount Owed' : balance.balance < 0 ? 'Credit' : 'Balance'}
            </div>
            <div className={`text-xl font-semibold ${balance.balance > 0 ? 'text-[#FF6B6B]' : balance.balance < 0 ? 'text-[#51CF66]' : 'text-[#212529]'}`}>
              {formatCents(Math.abs(balance.balance), currency)}
            </div>
          </div>
          <div className="border border-[#E9ECEF] rounded-lg p-4">
            <div className="flex items-center gap-1 text-xs text-[#495057] mb-1">
              <TrendingUp size={10} />
              Monthly Rent
            </div>
            <div className="text-xl font-semibold text-[#212529]">
              {formatCents(Number(agreement.monthly_rent), currency)}
            </div>
          </div>
          <div className="border border-[#E9ECEF] rounded-lg p-4">
            <div className="text-xs text-[#495057] mb-1">Deposit</div>
            <div className="text-xl font-semibold text-[#212529]">
              {formatCents(Number(agreement.deposit_amount), currency)}
            </div>
          </div>
        </div>

        {/* Overdue alert */}
        {balance.overdue_amount > 0 && (
          <div className="flex items-start gap-3 border border-[#FF6B6B] bg-red-50 rounded-lg p-4 mb-6">
            <AlertCircle size={16} className="text-[#FF6B6B] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Payment overdue</p>
              <p className="text-xs text-red-700 mt-0.5">
                {formatCents(balance.overdue_amount, currency)} past due. Contact your landlord to arrange payment.
              </p>
            </div>
          </div>
        )}

        {/* Upcoming obligations */}
        {upcomingObligations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-[#495057] uppercase tracking-wide mb-3">Upcoming & Overdue</h2>
            <div className="space-y-2">
              {upcomingObligations.map(ob => {
                const outstanding = Number(ob.amount) - Number(ob.amount_paid)
                return (
                  <div key={ob.id} className="flex items-center justify-between border border-[#E9ECEF] rounded-lg px-4 py-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#212529]">{ob.description ?? ob.type}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLE[ob.status] ?? 'bg-gray-100'}`}>
                          {ob.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#495057] mt-0.5">
                        <Clock size={10} />
                        Due {ob.due_date}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-[#212529]">
                        {formatCents(Number(ob.amount), ob.currency as Currency)}
                      </div>
                      {ob.amount_paid > 0 && (
                        <div className="text-xs text-[#ADB5BD]">{formatCents(outstanding, ob.currency as Currency)} left</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Lease details */}
        <div className="border border-[#E9ECEF] rounded-lg p-5 mb-6">
          <h2 className="text-sm font-medium text-[#495057] uppercase tracking-wide mb-3">Lease Details</h2>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <div>
              <div className="text-xs text-[#ADB5BD]">Start Date</div>
              <div className="font-medium text-[#212529]">
                {new Date(agreement.lease_start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
            {agreement.lease_end_date && (
              <div>
                <div className="text-xs text-[#ADB5BD]">End Date</div>
                <div className="font-medium text-[#212529]">
                  {new Date(agreement.lease_end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            )}
            <div>
              <div className="text-xs text-[#ADB5BD]">Rent Due</div>
              <div className="font-medium text-[#212529]">Day {agreement.due_day ?? 1} of each month</div>
            </div>
            <div>
              <div className="text-xs text-[#ADB5BD]">Grace Period</div>
              <div className="font-medium text-[#212529]">{agreement.grace_period_days ?? 5} days</div>
            </div>
            <div>
              <div className="text-xs text-[#ADB5BD]">Currency</div>
              <div className="font-medium text-[#212529]">{currency.toUpperCase()}</div>
            </div>
            {agreement.late_fee_enabled && (
              <div>
                <div className="text-xs text-[#ADB5BD]">Late Fee</div>
                <div className="font-medium text-amber-600">
                  {agreement.late_fee_type === 'flat' && formatCents(Number(agreement.late_fee_flat), currency)}
                  {agreement.late_fee_type === 'percent' && `${agreement.late_fee_percent}%`}
                  {agreement.late_fee_type === 'both' && `${formatCents(Number(agreement.late_fee_flat), currency)} + ${agreement.late_fee_percent}%`}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Landlord contact */}
        <div className="border border-[#E9ECEF] rounded-lg p-5 mb-6">
          <h2 className="text-sm font-medium text-[#495057] uppercase tracking-wide mb-3">Landlord Contact</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#212529] flex items-center justify-center text-white text-sm font-medium">
              {(landlord?.full_name ?? '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-sm text-[#212529]">{landlord?.full_name}</div>
              <div className="text-xs text-[#495057]">{landlord?.email}</div>
              {landlord?.phone && <div className="text-xs text-[#495057]">{landlord.phone}</div>}
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href={`/dashboard/finances/${agreement.id}/statement`}
            className="text-center text-sm text-[#495057] border border-[#E9ECEF] py-2 rounded hover:border-[#495057] transition-colors"
          >
            View Statements
          </Link>
          <Link
            href={`/dashboard/my-lease/disputes`}
            className="text-center text-sm text-[#495057] border border-[#E9ECEF] py-2 rounded hover:border-[#495057] transition-colors"
          >
            My Disputes {(disputes ?? []).filter(d => d.status === 'open').length > 0 && `(${(disputes ?? []).filter(d => d.status === 'open').length} open)`}
          </Link>
        </div>
      </div>
    </div>
  )
}
