'use client'

import { useEffect, useState, useCallback } from 'react'
import type { TransactionWithParticipants } from '@/types'
import { TransactionCard } from './TransactionCard'
import { FileText, AlertCircle, RefreshCw } from 'lucide-react'

interface TransactionListProps {
  status?: string
  type?: string
}

export function TransactionList({ status, type }: TransactionListProps) {
  const [transactions, setTransactions] = useState<TransactionWithParticipants[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (status) params.set('status', status)
      if (type)   params.set('type', type)
      const res  = await fetch(`/api/transactions?${params.toString()}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to fetch transactions')
      setTransactions(json.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [status, type])

  useEffect(() => { fetchTransactions() }, [fetchTransactions])

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center mb-3">
          <AlertCircle size={18} className="text-red-500" />
        </div>
        <p className="text-sm font-semibold text-[#111827] mb-1">Couldn't load transactions</p>
        <p className="text-xs text-[#9CA3AF] mb-4">{error}</p>
        <button
          onClick={fetchTransactions}
          className="flex items-center gap-1.5 text-sm font-medium text-[#495057] border border-[#E9ECEF] px-4 py-2 rounded-lg hover:border-[#111827] hover:text-[#111827] transition-colors"
        >
          <RefreshCw size={13} />
          Try again
        </button>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center border border-dashed border-[#E9ECEF] rounded-xl">
        <FileText size={28} className="text-[#D1D5DB] mb-3" />
        <p className="text-sm font-semibold text-[#111827] mb-1">No transactions yet</p>
        <p className="text-xs text-[#9CA3AF]">
          {status || type
            ? 'Try clearing the filters to see all transactions.'
            : 'Create your first transaction to get started.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map(t => <TransactionCard key={t.id} transaction={t} />)}
    </div>
  )
}