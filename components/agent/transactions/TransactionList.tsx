'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { TransactionWithParticipants } from '@/types'
import { TransactionCard } from './TransactionCard'
import { TransactionStatus } from './TransactionStatus'

interface TransactionListProps {
  status?: string
  type?: string
}

export function TransactionList({ status, type }: TransactionListProps) {
  const [transactions, setTransactions] = useState<TransactionWithParticipants[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchTransactions()
  }, [status, type])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)

      let url = '/api/transactions?'
      const params = new URLSearchParams()
      if (status) params.set('status', status)
      if (type) params.set('type', type)
      url += params.toString()

      const response = await fetch(url)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch transactions')
      }

      setTransactions(result.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white border border-light-gray rounded-lg p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-light-gray rounded w-1/3"></div>
              <div className="h-6 bg-light-gray rounded w-20"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-light-gray rounded w-1/2"></div>
              <div className="h-4 bg-light-gray rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchTransactions}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-charcoal mb-2">No transactions found</h3>
        <p className="text-dark-gray">
          {status || type
            ? 'Try adjusting your filters to see more transactions.'
            : 'Create your first transaction to get started.'
          }
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <TransactionCard key={transaction.id} transaction={transaction} />
      ))}
    </div>
  )
}