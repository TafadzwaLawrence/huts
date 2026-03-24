'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { formatCents } from '@/lib/financial-engine'
import type { Currency, ObligationStatus } from '@/lib/financial-engine'
import { Plus, Minus, Calendar } from 'lucide-react'

interface Obligation {
  id: string
  type: string
  description: string | null
  amount: number
  amount_paid: number
  currency: Currency
  due_date: string
  status: ObligationStatus
  period_label: string | null
}

interface AgreementDetailActionsProps {
  agreementId: string
  isLandlord: boolean
  isTenant: boolean
  obligations: Obligation[]
  currency: Currency
}

export default function AgreementDetailActions({
  agreementId,
  isLandlord,
  isTenant,
  obligations,
  currency,
}: AgreementDetailActionsProps) {
  const router = useRouter()
  const [generating, setGenerating] = useState(false)
  const [showAdjustForm, setShowAdjustForm] = useState(false)
  const [showDisputeForm, setShowDisputeForm] = useState(false)
  const [adjType, setAdjType] = useState<'charge' | 'credit'>('charge')
  const [adjAmount, setAdjAmount] = useState('')
  const [adjReason, setAdjReason] = useState('')
  const [disputeReason, setDisputeReason] = useState('')
  const [disputeObligationId, setDisputeObligationId] = useState('')
  const [loading, setLoading] = useState(false)

  async function generateThisMonth() {
    setGenerating(true)
    try {
      const res = await fetch(`/api/agreements/${agreementId}/obligations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period_date: new Date().toISOString().split('T')[0] }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success('Obligations generated for this month')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate obligations')
    } finally {
      setGenerating(false)
    }
  }

  async function submitAdjustment() {
    if (!adjAmount || !adjReason) return
    const cents = Math.round(parseFloat(adjAmount) * 100)
    if (isNaN(cents) || cents <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/agreements/${agreementId}/adjustments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: adjType, amount: cents, reason: adjReason }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success(`${adjType === 'charge' ? 'Charge' : 'Credit'} recorded`)
      setShowAdjustForm(false)
      setAdjAmount('')
      setAdjReason('')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to record adjustment')
    } finally {
      setLoading(false)
    }
  }

  async function submitDispute() {
    if (disputeReason.trim().length < 10) {
      toast.error('Please provide more detail (at least 10 characters)')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/agreements/${agreementId}/disputes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: disputeReason.trim(),
          obligation_id: disputeObligationId || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success('Dispute submitted')
      setShowDisputeForm(false)
      setDisputeReason('')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit dispute')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {isLandlord && (
        <>
          <button
            onClick={generateThisMonth}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 border border-[#212529] text-[#212529] text-sm font-medium py-2 rounded hover:bg-[#212529] hover:text-white transition-colors disabled:opacity-50"
          >
            <Calendar size={14} />
            {generating ? 'Generating…' : 'Generate This Month\'s Obligations'}
          </button>

          <button
            onClick={() => setShowAdjustForm(v => !v)}
            className="w-full text-sm text-[#495057] border border-[#E9ECEF] py-2 rounded hover:border-[#495057] transition-colors"
          >
            {showAdjustForm ? 'Cancel Adjustment' : 'Issue Adjustment'}
          </button>

          {showAdjustForm && (
            <div className="border border-[#E9ECEF] rounded-lg p-4 space-y-3">
              <div className="flex gap-2">
                {(['charge', 'credit'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setAdjType(t)}
                    className={`flex-1 text-xs py-1.5 rounded border transition-colors capitalize ${
                      adjType === t
                        ? 'bg-[#212529] text-white border-[#212529]'
                        : 'border-[#E9ECEF] text-[#495057] hover:border-[#495057]'
                    }`}
                  >
                    {t === 'charge' ? <><Plus size={10} className="inline mr-1" />Charge</> : <><Minus size={10} className="inline mr-1" />Credit</>}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder={`Amount (${currency.toUpperCase()})`}
                value={adjAmount}
                onChange={e => setAdjAmount(e.target.value)}
                className="text-[#212529] bg-white w-full border border-[#E9ECEF] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#212529]"
              />
              <input
                type="text"
                placeholder="Reason (e.g. Maintenance charge, Lease promotion)"
                value={adjReason}
                onChange={e => setAdjReason(e.target.value)}
                className="text-[#212529] bg-white w-full border border-[#E9ECEF] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#212529]"
              />
              <button
                onClick={submitAdjustment}
                disabled={loading || !adjAmount || !adjReason}
                className="w-full bg-[#212529] text-white text-sm py-2 rounded hover:bg-[#495057] transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving…' : 'Record Adjustment'}
              </button>
            </div>
          )}
        </>
      )}

      {isTenant && (
        <>
          <button
            onClick={() => setShowDisputeForm(v => !v)}
            className="w-full text-sm text-[#495057] border border-[#E9ECEF] py-2 rounded hover:border-[#495057] transition-colors"
          >
            {showDisputeForm ? 'Cancel Dispute' : 'Open Dispute'}
          </button>

          {showDisputeForm && (
            <div className="border border-[#E9ECEF] rounded-lg p-4 space-y-3">
              <select
                value={disputeObligationId}
                onChange={e => setDisputeObligationId(e.target.value)}
                className="text-[#212529] bg-white w-full border border-[#E9ECEF] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#212529]"
              >
                <option value="">Select obligation (optional)</option>
                {obligations.filter(o => ['pending', 'overdue', 'partial'].includes(o.status)).map(o => (
                  <option key={o.id} value={o.id}>
                    {o.description ?? o.type} — {formatCents(o.amount, o.currency)} ({o.due_date})
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Describe your dispute (min 10 characters)..."
                value={disputeReason}
                onChange={e => setDisputeReason(e.target.value)}
                rows={3}
                className="text-[#212529] bg-white w-full border border-[#E9ECEF] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#212529] resize-none"
              />
              <button
                onClick={submitDispute}
                disabled={loading || disputeReason.trim().length < 10}
                className="w-full bg-[#212529] text-white text-sm py-2 rounded hover:bg-[#495057] transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting…' : 'Submit Dispute'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
