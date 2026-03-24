'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Currency } from '@/lib/financial-engine'
import { formatCents } from '@/lib/financial-engine'

interface Obligation {
  id: string
  type: string
  description: string | null
  amount: number
  currency: Currency
  due_date: string
  status: string
}

interface OpenDisputeFormProps {
  agreementId: string
  currency: Currency
  obligations: Obligation[]
}

export default function OpenDisputeForm({ agreementId, currency, obligations }: OpenDisputeFormProps) {
  const router = useRouter()
  const [reason, setReason] = useState('')
  const [obligationId, setObligationId] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (reason.trim().length < 10) {
      toast.error('Please provide more detail (at least 10 characters)')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/agreements/${agreementId}/disputes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reason.trim(),
          obligation_id: obligationId || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success('Dispute submitted successfully')
      setReason('')
      setObligationId('')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit dispute')
    } finally {
      setLoading(false)
    }
  }

  const eligibleObs = obligations.filter(o =>
    ['pending', 'partial', 'overdue'].includes(o.status)
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {eligibleObs.length > 0 && (
        <div>
          <label className="block text-xs text-[#495057] mb-1">Related Obligation (optional)</label>
          <select
            value={obligationId}
            onChange={e => setObligationId(e.target.value)}
            className="text-[#212529] bg-white w-full border border-[#E9ECEF] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#212529]"
          >
            <option value="">None — general dispute</option>
            {eligibleObs.map(o => (
              <option key={o.id} value={o.id}>
                {o.description ?? o.type} — {formatCents(o.amount, o.currency)} ({o.due_date})
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs text-[#495057] mb-1">Describe the issue</label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={4}
          placeholder="What are you disputing? Please be specific..."
          className="text-[#212529] bg-white w-full border border-[#E9ECEF] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#212529] resize-none"
          required
          minLength={10}
        />
        <div className="text-xs text-[#ADB5BD] mt-1">{reason.length}/2000 characters</div>
      </div>

      <button
        type="submit"
        disabled={loading || reason.trim().length < 10}
        className="w-full bg-[#212529] text-white text-sm font-medium py-2 rounded hover:bg-[#495057] transition-colors disabled:opacity-50"
      >
        {loading ? 'Submitting…' : 'Submit Dispute'}
      </button>
    </form>
  )
}
