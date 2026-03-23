import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Currency } from '@/lib/financial-engine'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import OpenDisputeForm from './OpenDisputeForm'

export const metadata = { title: 'My Disputes | Dashboard' }

const STATUS_STYLE: Record<string, string> = {
  open:     'bg-amber-50 text-amber-700 border border-amber-200',
  resolved:  'bg-green-50 text-green-700 border border-green-200',
  dismissed: 'bg-gray-100 text-[#495057] border border-[#E9ECEF]',
}

export default async function TenantDisputesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signup')

  const { data: agreement } = await supabase
    .from('rental_agreements')
    .select('id, currency')
    .eq('tenant_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  const { data: disputes } = agreement
    ? await supabase
        .from('payment_disputes')
        .select(`
          *,
          obligation:lease_obligations!payment_disputes_obligation_id_fkey(type, description, amount, due_date)
        `)
        .eq('agreement_id', agreement.id)
        .eq('tenant_id', user.id)
        .order('created_at', { ascending: false })
    : { data: [] }

  const { data: obligations } = agreement
    ? await supabase
        .from('lease_obligations')
        .select('id, type, description, amount, currency, due_date, status')
        .eq('agreement_id', agreement.id)
        .in('status', ['pending', 'partial', 'overdue'])
    : { data: [] }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/dashboard/my-lease"
          className="flex items-center gap-1 text-sm text-[#495057] hover:text-[#212529] mb-6"
        >
          <ArrowLeft size={14} />
          Back to My Lease
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-[#212529]">My Disputes</h1>
          <div className="text-xs text-[#ADB5BD]">{(disputes ?? []).filter(d => d.status === 'open').length} open</div>
        </div>

        {agreement && (
          <div className="border border-[#E9ECEF] rounded-lg p-5 mb-8">
            <h2 className="text-sm font-medium text-[#495057] mb-3">Open a New Dispute</h2>
            <OpenDisputeForm
              agreementId={agreement.id}
              currency={(agreement.currency as Currency) ?? 'usd'}
              obligations={obligations ?? []}
            />
          </div>
        )}

        {(disputes ?? []).length === 0 ? (
          <div className="border border-[#E9ECEF] rounded-lg p-8 text-center">
            <MessageSquare size={32} className="mx-auto text-[#ADB5BD] mb-3" />
            <p className="text-sm text-[#495057]">No disputes filed</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-[#495057] uppercase tracking-wide">Past Disputes</h2>
            {(disputes ?? []).map(d => (
              <div key={d.id} className="border border-[#E9ECEF] rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLE[d.status] ?? 'bg-gray-100'}`}>
                    {d.status}
                  </span>
                  <span className="text-xs text-[#ADB5BD]">
                    {new Date(d.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                </div>

                {d.obligation && (
                  <div className="text-xs text-[#ADB5BD] mb-2">
                    Re: {d.obligation.description ?? d.obligation.type} ({d.obligation.due_date})
                  </div>
                )}

                <p className="text-sm text-[#212529]">{d.reason}</p>

                {d.resolution_notes && (
                  <div className="mt-3 border-t border-[#E9ECEF] pt-3">
                    <div className="text-xs font-medium text-[#495057] mb-1">Landlord Response</div>
                    <p className="text-sm text-[#495057]">{d.resolution_notes}</p>
                    {d.resolved_at && (
                      <div className="text-xs text-[#ADB5BD] mt-1">
                        Resolved {new Date(d.resolved_at).toLocaleDateString('en-GB')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
