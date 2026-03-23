import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { generateStatement, formatCents } from '@/lib/financial-engine'
import type { Currency } from '@/lib/financial-engine'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Statements | Finances' }

export default async function StatementsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signup')

  const { data: agreement } = await supabase
    .from('rental_agreements')
    .select('id, landlord_id, tenant_id, currency, lease_start_date')
    .eq('id', params.id)
    .single()

  if (!agreement) notFound()

  const isParty = agreement.landlord_id === user.id || agreement.tenant_id === user.id
  if (!isParty) notFound()

  const currency = (agreement.currency as Currency) ?? 'usd'

  // Ensure this month's statement exists
  const now = new Date()
  await generateStatement(
    supabase,
    params.id,
    new Date(now.getFullYear(), now.getMonth(), 1),
    new Date(now.getFullYear(), now.getMonth() + 1, 0)
  )

  const { data: statements } = await supabase
    .from('financial_statements')
    .select('*')
    .eq('agreement_id', params.id)
    .order('period_start', { ascending: false })

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href={`/dashboard/finances/${params.id}`}
          className="flex items-center gap-1 text-sm text-[#495057] hover:text-[#212529] mb-6"
        >
          <ArrowLeft size={14} />
          Back to Lease
        </Link>

        <h1 className="text-xl font-semibold text-[#212529] mb-6">Financial Statements</h1>

        {(statements ?? []).length === 0 ? (
          <div className="border border-[#E9ECEF] rounded-lg p-8 text-center text-sm text-[#ADB5BD]">
            No statements yet
          </div>
        ) : (
          <div className="space-y-3">
            {(statements ?? []).map(s => {
              const balance = s.closing_balance as number
              return (
                <div key={s.id} className="border border-[#E9ECEF] rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium text-[#212529]">
                        {new Date(s.period_start).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-[#ADB5BD]">
                        {s.period_start} → {s.period_end}
                      </div>
                    </div>
                    <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                      balance > 0 ? 'bg-red-50 text-[#FF6B6B]' : balance < 0 ? 'bg-green-50 text-[#51CF66]' : 'bg-gray-100 text-[#495057]'
                    }`}>
                      {balance > 0 ? 'Owes ' : balance < 0 ? 'Credit ' : ''}
                      {formatCents(Math.abs(balance), currency)}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-[#ADB5BD]">Opening Balance</div>
                      <div className="font-medium text-[#212529]">{formatCents(Number(s.opening_balance), currency)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#ADB5BD]">Total Charged</div>
                      <div className="font-medium text-[#FF6B6B]">+{formatCents(Number(s.total_charges), currency)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#ADB5BD]">Total Paid</div>
                      <div className="font-medium text-[#51CF66]">-{formatCents(Number(s.total_payments), currency)}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
