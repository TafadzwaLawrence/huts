import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TransactionList } from '@/components/agent/transactions/TransactionList'
import { TransactionFilters } from '@/components/agent/transactions/TransactionFilters'
import { CreateTransactionButton } from '@/components/agent/transactions/CreateTransactionButton'

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Check if user is an agent
  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!agent) {
    redirect('/agents/signup')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Transactions</h1>
          <p className="text-dark-gray mt-1">
            Manage property transactions, track progress, and handle commissions
          </p>
        </div>
        <CreateTransactionButton />
      </div>

      {/* Filters */}
      <TransactionFilters />

      {/* Transaction List */}
      <Suspense fallback={<TransactionListSkeleton />}>
        <TransactionList />
      </Suspense>
    </div>
  )
}

function TransactionListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white border border-light-gray rounded-lg p-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-light-gray rounded w-1/3"></div>
              <div className="h-6 bg-light-gray rounded w-20"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-light-gray rounded w-1/2"></div>
              <div className="h-4 bg-light-gray rounded w-1/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}