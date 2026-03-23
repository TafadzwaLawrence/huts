import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import type { Database } from '@/types/database'
import { DollarSign, TrendingUp, Clock, CheckCircle, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

type Commission = Database['public']['Tables']['commissions']['Row'] & {
  transactions?: Database['public']['Tables']['transactions']['Row']
}

async function getCommissions(agentId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('commissions')
    .select('*, transactions(*)')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false })
  if (error) { console.error('Error fetching commissions:', error); return [] }
  return (data || []) as Commission[]
}

function calculateMetrics(commissions: Commission[]) {
  const paid      = commissions.filter(c => c.status === 'paid')
  const pending   = commissions.filter(c => c.status === 'pending')
  const totalEarned  = paid.reduce((s, c) => s + (c.agent_commission || 0), 0)
  const totalPending = pending.reduce((s, c) => s + (c.agent_commission || 0), 0)
  const avg = commissions.length > 0 ? (totalEarned + totalPending) / commissions.length : 0
  return {
    totalEarned,
    totalPending,
    totalCount:   commissions.length,
    paidCount:    paid.length,
    pendingCount: pending.length,
    avgCommission: avg,
    completionRate: commissions.length > 0 ? Math.round((paid.length / commissions.length) * 100) : 0,
  }
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { dot: string; cls: string; label: string }> = {
    paid:      { dot: 'bg-[#22C55E]', cls: 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]', label: 'Paid' },
    pending:   { dot: 'bg-[#F59E0B]', cls: 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]', label: 'Pending' },
    cancelled: { dot: 'bg-[#EF4444]', cls: 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]', label: 'Cancelled' },
  }
  const c = cfg[status] ?? cfg.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-full ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  )
}

async function CommissionsContent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!agent) redirect('/agents/signup')

  const commissions = await getCommissions(agent.id)
  const m = calculateMetrics(commissions)

  const METRICS = [
    {
      icon: DollarSign,
      label: 'Total Earned',
      value: formatPrice(m.totalEarned),
      sub: `${m.paidCount} paid commission${m.paidCount !== 1 ? 's' : ''}`,
      accent: false,
    },
    {
      icon: Clock,
      label: 'Pending Earnings',
      value: formatPrice(m.totalPending),
      sub: `${m.pendingCount} awaiting payment`,
      accent: m.totalPending > 0,
    },
    {
      icon: TrendingUp,
      label: 'Average Commission',
      value: formatPrice(m.avgCommission),
      sub: 'per transaction',
      accent: false,
    },
    {
      icon: CheckCircle,
      label: 'Completion Rate',
      value: `${m.completionRate}%`,
      sub: 'transactions closed',
      accent: false,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map(({ icon: Icon, label, value, sub, accent }) => (
          <div key={label} className="bg-white border border-[#E9ECEF] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">{label}</p>
              <div className="w-8 h-8 rounded-lg bg-[#F9FAFB] border border-[#E9ECEF] flex items-center justify-center">
                <Icon size={15} className="text-[#6B7280]" />
              </div>
            </div>
            <p className={`text-2xl font-bold ${accent ? 'text-[#92400E]' : 'text-[#111827]'}`}>{value}</p>
            <p className="text-xs text-[#9CA3AF] mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E9ECEF] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E9ECEF]">
          <div>
            <h2 className="text-sm font-semibold text-[#111827]">All Commissions</h2>
            <p className="text-xs text-[#9CA3AF] mt-0.5">{m.totalCount} record{m.totalCount !== 1 ? 's' : ''}</p>
          </div>
          {m.totalCount > 0 && (
            <span className="text-xs font-semibold text-[#6B7280] bg-[#F3F4F6] px-2.5 py-1 rounded-full">
              {m.totalCount}
            </span>
          )}
        </div>

        {commissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-[#F9FAFB] border border-[#E9ECEF] flex items-center justify-center mb-4">
              <DollarSign size={20} className="text-[#D1D5DB]" />
            </div>
            <p className="text-sm font-semibold text-[#111827] mb-1">No commissions yet</p>
            <p className="text-xs text-[#9CA3AF]">Commissions will appear here once transactions are closed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E9ECEF] bg-[#F9FAFB]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Transaction</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Commission</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Rate</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Date</th>
                  {m.paidCount > 0 && (
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Paid</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {commissions.map(c => (
                  <tr key={c.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/agent/transactions/${c.transaction_id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-[#111827] hover:text-black group"
                      >
                        TXN-{c.transaction_id.slice(0, 8).toUpperCase()}
                        <ArrowUpRight size={12} className="text-[#9CA3AF] group-hover:text-[#111827] transition-colors" />
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-[#111827]">
                      {formatPrice(c.agent_commission || 0)}
                    </td>
                    <td className="px-5 py-3.5 text-[#6B7280]">
                      {(Math.round((c.agent_split_pct || 50) * 100) / 100).toFixed(1)}%
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={c.status || 'pending'} />
                    </td>
                    <td className="px-5 py-3.5 capitalize text-[#6B7280]">
                      {c.transactions?.transaction_type?.replace('_', ' ') || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-[#9CA3AF]">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    {m.paidCount > 0 && (
                      <td className="px-5 py-3.5 text-[#9CA3AF]">
                        {c.paid_at ? new Date(c.paid_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function CommissionsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#E9ECEF] rounded-xl p-5 animate-pulse">
            <div className="flex items-center justify-between mb-3">
              <div className="h-3 w-24 bg-[#F3F4F6] rounded" />
              <div className="w-8 h-8 bg-[#F3F4F6] rounded-lg" />
            </div>
            <div className="h-7 w-20 bg-[#F3F4F6] rounded mb-2" />
            <div className="h-3 w-28 bg-[#F3F4F6] rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white border border-[#E9ECEF] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E9ECEF]">
          <div className="h-4 w-36 bg-[#F3F4F6] rounded animate-pulse" />
        </div>
        <div className="p-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-[#F9FAFB] rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function CommissionsDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Commissions</h1>
        <p className="text-sm text-[#6B7280] mt-1">Track your earnings from closed transactions</p>
      </div>
      <Suspense fallback={<CommissionsLoading />}>
        <CommissionsContent />
      </Suspense>
    </div>
  )
}


