import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TransactionList } from '@/components/agent/transactions/TransactionList'
import { TransactionFilters } from '@/components/agent/transactions/TransactionFilters'
import { CreateTransactionButton } from '@/components/agent/transactions/CreateTransactionButton'

interface SearchParams {
  status?: string
  type?: string
}

export default async function TransactionsPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signin')

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!agent) redirect('/agents/signup')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Transactions</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Monitor active deals, track progress, and manage commissions
          </p>
        </div>
        <CreateTransactionButton />
      </div>

      {/* Filters */}
      <TransactionFilters currentStatus={searchParams.status} currentType={searchParams.type} />

      {/* Transaction List */}
      <Suspense fallback={<TransactionListSkeleton />}>
        <TransactionList status={searchParams.status} type={searchParams.type} />
      </Suspense>
    </div>
  )
}

function TransactionListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white border border-[#E9ECEF] rounded-xl p-5 animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className="h-5 bg-[#F3F4F6] rounded-lg w-1/3" />
            <div className="h-5 bg-[#F3F4F6] rounded-full w-24" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-[#F3F4F6] rounded w-1/2" />
            <div className="h-4 bg-[#F3F4F6] rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}