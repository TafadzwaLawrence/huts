import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { calculateBalance, formatCents } from '@/lib/financial-engine'
import type { Currency } from '@/lib/financial-engine'
import AgreementDetailActions from './AgreementDetailActions'
import LogPaymentForm from './LogPaymentForm'
import { ArrowLeft, TrendingUp, AlertCircle, Clock } from 'lucide-react'

export async function generateMetadata({ params }: { params: { id: string } }) {
  return { title: 'Lease Detail | Finances' }
}

const STATUS_STYLE: Record<string, string> = {
  pending:    'bg-gray-100 text-[#495057]',
  partial:    'bg-amber-50 text-amber-700',
  overdue:    'bg-red-50 text-[#FF6B6B]',
  delinquent: 'bg-red-100 text-red-800',
  paid:       'bg-green-50 text-[#51CF66]',
  waived:     'bg-gray-100 text-[#ADB5BD]',
}

export default async function FinanceDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signup')

  const { data: agreement } = await supabase
    .from('rental_agreements')
    .select(`
      id, monthly_rent, deposit_amount, currency, status,
      lease_start_date, lease_end_date,
      due_day, grace_period_days,
      late_fee_enabled, late_fee_type, late_fee_flat, late_fee_percent,
      landlord_id, tenant_id,
      property:properties!rental_agreements_property_id_fkey(id, title, city, address),
      landlord:profiles!rental_agreements_landlord_id_fkey(id, full_name, email),
      tenant:profiles!rental_agreements_tenant_id_fkey(id, full_name, email, phone)
    `)
    .eq('id', params.id)
    .single()

  if (!agreement) notFound()

  const isLandlord = agreement.landlord_id === user.id
  const isTenant = agreement.tenant_id === user.id
  if (!isLandlord && !isTenant) notFound()

  const currency = (agreement.currency as Currency) ?? 'usd'

  // Parallel fetches
  const [balance, { data: obligations }, { data: ledgerEntries }, { data: disputes }] = await Promise.all([
    calculateBalance(supabase, params.id),
    supabase
      .from('lease_obligations')
      .select('*')
      .eq('agreement_id', params.id)
      .order('due_date', { ascending: false })
      .limit(30),
    supabase
      .from('financial_ledger_entries')
      .select('*, created_by_profile:profiles!financial_ledger_entries_created_by_fkey(full_name)')
      .eq('agreement_id', params.id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('payment_disputes')
      .select('id, status, reason, created_at')
      .eq('agreement_id', params.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const property = agreement.property as unknown as { id: string; title: string; city: string; address: string } | null
  const tenant = agreement.tenant as unknown as { id: string; full_name: string; email: string; phone: string } | null

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <Link
          href="/dashboard/finances"
          className="flex items-center gap-1 text-sm text-[#495057] hover:text-[#212529] mb-6"
        >
          <ArrowLeft size={14} />
          Back to Finances
        </Link>

        {/* Property header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[#212529]">{property?.title ?? 'Property'}</h1>
          <p className="text-sm text-[#495057]">
            {property?.city} · {isLandlord ? `Tenant: ${tenant?.full_name}` : 'Your Lease'} ·
            Since {new Date(agreement.lease_start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Balance + Obligations + Ledger */}
          <div className="lg:col-span-2 space-y-6">

            {/* Balance cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className={`border rounded-lg p-3 ${balance.balance > 0 ? 'border-[#FF6B6B] bg-red-50' : balance.balance < 0 ? 'border-[#51CF66] bg-green-50' : 'border-[#E9ECEF]'}`}>
                <div className="text-xs text-[#495057] mb-1">
                  {balance.balance > 0 ? 'Amount Owed' : balance.balance < 0 ? 'Credit Balance' : 'Balance'}
                </div>
                <div className={`text-lg font-semibold ${balance.balance > 0 ? 'text-[#FF6B6B]' : balance.balance < 0 ? 'text-[#51CF66]' : 'text-[#212529]'}`}>
                  {formatCents(Math.abs(balance.balance), currency)}
                </div>
              </div>
              <div className="border border-[#E9ECEF] rounded-lg p-3">
                <div className="flex items-center gap-1 text-xs text-[#495057] mb-1">
                  <TrendingUp size={10} />
                  Total Charged
                </div>
                <div className="text-lg font-semibold text-[#212529]">
                  {formatCents(balance.total_charges, currency)}
                </div>
              </div>
              <div className="border border-[#E9ECEF] rounded-lg p-3">
                <div className="text-xs text-[#495057] mb-1">Total Paid</div>
                <div className="text-lg font-semibold text-[#51CF66]">
                  {formatCents(balance.total_payments, currency)}
                </div>
              </div>
            </div>

            {/* Overdue alert */}
            {balance.overdue_amount > 0 && (
              <div className="flex items-start gap-3 border border-[#FF6B6B] bg-red-50 rounded-lg p-4">
                <AlertCircle size={16} className="text-[#FF6B6B] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    {balance.overdue_obligations} obligation{balance.overdue_obligations > 1 ? 's' : ''} overdue
                  </p>
                  <p className="text-xs text-red-700 mt-0.5">
                    {formatCents(balance.overdue_amount, currency)} outstanding past grace period
                  </p>
                </div>
              </div>
            )}

            {/* Obligations */}
            <div>
              <h2 className="text-sm font-medium text-[#495057] uppercase tracking-wide mb-3">Obligations</h2>
              {(obligations ?? []).length === 0 ? (
                <div className="border border-[#E9ECEF] rounded-lg p-6 text-center text-sm text-[#ADB5BD]">
                  No obligations yet. {isLandlord && 'Generate them using the button on the right.'}
                </div>
              ) : (
                <div className="space-y-2">
                  {(obligations ?? []).map(ob => {
                    const outstanding = Number(ob.amount) - Number(ob.amount_paid)
                    return (
                      <div
                        key={ob.id}
                        className="flex items-center justify-between border border-[#E9ECEF] rounded-lg px-4 py-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#212529] truncate">
                              {ob.description ?? ob.type}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLE[ob.status] ?? 'bg-gray-100 text-[#495057]'}`}>
                              {ob.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-[#495057]">
                            <span className="flex items-center gap-1">
                              <Clock size={10} />
                              Due {ob.due_date}
                            </span>
                            {ob.grace_deadline && ob.status === 'pending' && (
                              <span>Grace ends {ob.grace_deadline}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4 shrink-0">
                          <div className="text-sm font-medium text-[#212529]">
                            {formatCents(Number(ob.amount), ob.currency as Currency)}
                          </div>
                          {ob.amount_paid > 0 && outstanding > 0 && (
                            <div className="text-xs text-[#ADB5BD]">
                              {formatCents(outstanding, ob.currency as Currency)} remaining
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Ledger */}
            <div>
              <h2 className="text-sm font-medium text-[#495057] uppercase tracking-wide mb-3">Transaction History</h2>
              {(ledgerEntries ?? []).length === 0 ? (
                <div className="border border-[#E9ECEF] rounded-lg p-6 text-center text-sm text-[#ADB5BD]">
                  No transactions yet
                </div>
              ) : (
                <div className="border border-[#E9ECEF] rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F8F9FA] border-b border-[#E9ECEF]">
                      <tr>
                        <th className="text-left px-4 py-2 text-xs font-medium text-[#495057]">Date</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-[#495057]">Description</th>
                        <th className="text-right px-4 py-2 text-xs font-medium text-[#495057]">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E9ECEF]">
                      {(ledgerEntries ?? []).map(entry => {
                        const isDebit = ['charge', 'deposit'].includes(entry.type)
                        return (
                          <tr key={entry.id} className="hover:bg-[#F8F9FA]">
                            <td className="px-4 py-2 text-xs text-[#495057] whitespace-nowrap">
                              {new Date(entry.created_at).toLocaleDateString('en-GB', {
                                day: 'numeric', month: 'short', year: 'numeric',
                              })}
                            </td>
                            <td className="px-4 py-2 text-[#212529] max-w-xs truncate">
                              {entry.description}
                            </td>
                            <td className={`px-4 py-2 text-right font-medium ${isDebit ? 'text-[#FF6B6B]' : 'text-[#51CF66]'}`}>
                              {isDebit ? '+' : '-'}{formatCents(Number(entry.amount), entry.currency as Currency)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Disputes */}
            {(disputes ?? []).length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-[#495057] uppercase tracking-wide mb-3">Disputes</h2>
                <div className="space-y-2">
                  {(disputes ?? []).map(d => (
                    <div key={d.id} className="border border-[#E9ECEF] rounded-lg px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          d.status === 'open'     ? 'bg-amber-50 text-amber-700' :
                          d.status === 'resolved' ? 'bg-green-50 text-green-700' :
                          'bg-gray-100 text-[#495057]'
                        }`}>
                          {d.status}
                        </span>
                        <span className="text-xs text-[#ADB5BD]">
                          {new Date(d.created_at).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                      <p className="text-sm text-[#212529]">{d.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Actions panel */}
          <div className="space-y-4">

            {/* Lease info card */}
            <div className="border border-[#E9ECEF] rounded-lg p-4 space-y-2">
              <h3 className="text-xs font-medium text-[#495057] uppercase tracking-wide">Lease Info</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#495057]">Monthly Rent</span>
                  <span className="font-medium">{formatCents(Number(agreement.monthly_rent), currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#495057]">Deposit</span>
                  <span className="font-medium">{formatCents(Number(agreement.deposit_amount), currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#495057]">Due Day</span>
                  <span className="font-medium">Day {agreement.due_day ?? 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#495057]">Grace Period</span>
                  <span className="font-medium">{agreement.grace_period_days ?? 5} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#495057]">Currency</span>
                  <span className="font-medium">{currency.toUpperCase()}</span>
                </div>
                {agreement.late_fee_enabled && (
                  <div className="flex justify-between">
                    <span className="text-[#495057]">Late Fee</span>
                    <span className="font-medium text-amber-600">
                      {agreement.late_fee_type === 'flat' && formatCents(Number(agreement.late_fee_flat), currency)}
                      {agreement.late_fee_type === 'percent' && `${agreement.late_fee_percent}%`}
                      {agreement.late_fee_type === 'both' && `${formatCents(Number(agreement.late_fee_flat), currency)} + ${agreement.late_fee_percent}%`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Log payment (landlord only) */}
            {isLandlord && (
              <div className="border border-[#E9ECEF] rounded-lg p-4">
                <h3 className="text-xs font-medium text-[#495057] uppercase tracking-wide mb-3">Log Payment</h3>
                <LogPaymentForm
                  agreementId={params.id}
                  currency={currency}
                  obligations={obligations ?? []}
                />
              </div>
            )}

            {/* Actions */}
            <div className="border border-[#E9ECEF] rounded-lg p-4">
              <h3 className="text-xs font-medium text-[#495057] uppercase tracking-wide mb-3">Actions</h3>
              <AgreementDetailActions
                agreementId={params.id}
                isLandlord={isLandlord}
                isTenant={isTenant}
                obligations={obligations ?? []}
                currency={currency}
              />
            </div>

            {/* Statement link */}
            <Link
              href={`/dashboard/finances/${params.id}/statement`}
              className="block text-center text-sm text-[#495057] border border-[#E9ECEF] py-2 rounded hover:border-[#495057] transition-colors"
            >
              View Statements
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
