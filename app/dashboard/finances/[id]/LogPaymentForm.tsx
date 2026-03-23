'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { formatCents } from '@/lib/financial-engine'
import type { Currency } from '@/lib/financial-engine'
import { Check, AlertCircle } from 'lucide-react'

interface Obligation {
  id: string
  type: string
  description: string | null
  amount: number
  amount_paid: number
  currency: Currency
  due_date: string
  status: string
  grace_deadline: string | null
}

interface LogPaymentFormProps {
  agreementId: string
  currency: Currency
  obligations: Obligation[]
}

export default function LogPaymentForm({ agreementId, currency, obligations }: LogPaymentFormProps) {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('cash')
  const [reference, setReference] = useState('')
  const [loading, setLoading] = useState(false)

  const totalOutstanding = obligations
    .filter(o => ['pending', 'partial', 'overdue'].includes(o.status))
    .reduce((s, o) => s + Number(o.amount) - Number(o.amount_paid), 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const cents = Math.round(parseFloat(amount) * 100)
    if (isNaN(cents) || cents <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    setLoading(true)
    try {
      // Use today's date as due_date for the legacy rent_payments table
      const today = new Date().toISOString().split('T')[0]
      const res = await fetch(`/api/agreements/${agreementId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          due_date: today,
          amount: cents,
          status: 'paid',
          paid_at: new Date().toISOString(),
          payment_method: method,
          reference_id: reference || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success('Payment logged successfully')
      setAmount('')
      setReference('')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to log payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {totalOutstanding > 0 && (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          <AlertCircle size={12} />
          Outstanding: {formatCents(totalOutstanding, currency)}
          <button
            type="button"
            className="ml-auto underline"
            onClick={() => setAmount((totalOutstanding / 100).toFixed(2))}
          >
            Use this amount
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder={`Amount (${currency.toUpperCase()})`}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
            className="w-full border border-[#E9ECEF] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#212529]"
          />
        </div>
        <select
          value={method}
          onChange={e => setMethod(e.target.value)}
          className="border border-[#E9ECEF] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#212529]"
        >
          <option value="cash">Cash</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="ecocash">EcoCash</option>
          <option value="other">Other</option>
        </select>
      </div>

      <input
        type="text"
        placeholder="Reference (optional, e.g. TXN-123)"
        value={reference}
        onChange={e => setReference(e.target.value)}
        className="w-full border border-[#E9ECEF] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#212529]"
      />

      <button
        type="submit"
        disabled={loading || !amount}
        className="w-full flex items-center justify-center gap-2 bg-[#212529] text-white text-sm font-medium py-2 rounded hover:bg-[#495057] transition-colors disabled:opacity-50"
      >
        <Check size={14} />
        {loading ? 'Logging…' : 'Log Payment'}
      </button>
    </form>
  )
}
