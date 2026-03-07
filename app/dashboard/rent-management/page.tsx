'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Building2,
  Loader2,
  Handshake,
  CalendarDays,
  DollarSign,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Plus,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
  ArrowUpRight,
  RotateCcw,
  X,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────
type Payment = {
  id: string
  agreement_id: string
  due_date: string
  amount: number
  status: 'pending' | 'paid' | 'overdue' | 'waived'
  paid_at: string | null
  payment_method: string | null
  notes: string | null
  created_at: string
}

type Agreement = {
  id: string
  property_id: string
  agreement_type: 'rent' | 'sale'
  status: 'active' | 'completed' | 'terminated'
  lease_start_date: string
  lease_end_date: string | null
  monthly_rent: number
  deposit_amount: number
  agreed_sale_price: number | null
  notes: string | null
  created_at: string
  property: {
    id: string
    title: string
    slug: string
    address: string
    city: string
    listing_type: string
    status: string
    property_images: Array<{ url: string; is_primary: boolean }>
  }
  landlord: { id: string; name: string; avatar_url: string | null; phone: string | null }
  tenant: { id: string; name: string; avatar_url: string | null; phone: string | null }
  rent_payments?: Payment[]
}

// ── Helpers ───────────────────────────────────────────────────
const fmt = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100)

const fmtDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

function PaymentStatusBadge({ status }: { status: Payment['status'] }) {
  const map = {
    paid:    { label: 'Paid',    cls: 'bg-green-50 text-green-700 border-green-200',   icon: CheckCircle2 },
    pending: { label: 'Pending', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock },
    overdue: { label: 'Overdue', cls: 'bg-red-50 text-red-700 border-red-200',          icon: AlertCircle },
    waived:  { label: 'Waived',  cls: 'bg-gray-50 text-gray-500 border-gray-200',       icon: XCircle },
  }
  const { label, cls, icon: Icon } = map[status]
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cls}`}>
      <Icon size={11} />
      {label}
    </span>
  )
}

function AgreementStatusBadge({ status }: { status: Agreement['status'] }) {
  const map = {
    active:     { label: 'Active',     cls: 'bg-green-50 text-green-700 border-green-200' },
    completed:  { label: 'Completed',  cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    terminated: { label: 'Terminated', cls: 'bg-red-50 text-red-700 border-red-200' },
  }
  const { label, cls } = map[status]
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${cls}`}>
      {label}
    </span>
  )
}

// ── Log Payment Dialog ─────────────────────────────────────────
function LogPaymentDialog({
  agreement,
  onClose,
  onSuccess,
}: {
  agreement: Agreement
  onClose: () => void
  onSuccess: () => void
}) {
  const [form, setForm] = useState({
    due_date: '',
    amount: String(agreement.monthly_rent / 100),
    status: 'paid',
    paid_at: new Date().toISOString().slice(0, 10),
    payment_method: 'cash',
    notes: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.due_date || !form.amount) {
      toast.error('Please fill in due date and amount')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/agreements/${agreement.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          due_date: form.due_date,
          amount: Math.round(Number(form.amount) * 100),
          status: form.status,
          paid_at: form.status === 'paid' ? form.paid_at : null,
          payment_method: form.payment_method || null,
          notes: form.notes || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Failed to log payment')
        return
      }
      toast.success('Payment logged successfully')
      onSuccess()
      onClose()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E9ECEF]">
          <h2 className="text-base font-bold text-[#212529]">Log Payment</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F8F9FA] rounded-lg">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Property info strip */}
          <div className="flex items-center gap-2 bg-[#F8F9FA] rounded-lg px-3 py-2 text-xs text-[#495057]">
            <Building2 size={13} className="text-[#ADB5BD]" />
            <span className="truncate font-medium">{agreement.property.title}</span>
            <span className="text-[#ADB5BD] ml-auto whitespace-nowrap">
              Monthly: {fmt(agreement.monthly_rent)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#495057] mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm(f => ({ ...f, due_date: e.target.value }))}
                className="w-full text-sm px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-[#212529]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#495057] mb-1">
                Amount ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                className="w-full text-sm px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-[#212529]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#495057] mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full text-sm px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-[#212529] bg-white"
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="waived">Waived</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#495057] mb-1">Payment Method</label>
              <select
                value={form.payment_method}
                onChange={(e) => setForm(f => ({ ...f, payment_method: e.target.value }))}
                className="w-full text-sm px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-[#212529] bg-white"
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="ecocash">EcoCash</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {form.status === 'paid' && (
            <div>
              <label className="block text-xs font-medium text-[#495057] mb-1">Date Paid</label>
              <input
                type="date"
                value={form.paid_at}
                onChange={(e) => setForm(f => ({ ...f, paid_at: e.target.value }))}
                className="w-full text-sm px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-[#212529]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#495057] mb-1">Notes (optional)</label>
            <textarea
              rows={2}
              placeholder="Receipt reference, extra details..."
              value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full text-sm px-3 py-2 border border-[#E9ECEF] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-[#212529]"
            />
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm font-medium text-[#495057] border border-[#E9ECEF] rounded-lg hover:bg-[#F8F9FA] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2 text-sm font-semibold bg-black text-white rounded-lg hover:bg-[#212529] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
            {loading ? 'Saving...' : 'Log Payment'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Agreement Card ─────────────────────────────────────────────
function AgreementCard({
  agreement,
  userId,
  onRefresh,
}: {
  agreement: Agreement
  userId: string
  onRefresh: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [payments, setPayments] = useState<Payment[]>(agreement.rent_payments || [])
  const [loadingPayments, setLoadingPayments] = useState(false)
  const [showLogPayment, setShowLogPayment] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const isLandlord = agreement.landlord.id === userId

  const primaryImg = agreement.property.property_images?.find(i => i.is_primary)?.url
    || agreement.property.property_images?.[0]?.url

  const fetchPayments = useCallback(async () => {
    if (!expanded) return
    setLoadingPayments(true)
    try {
      const res = await fetch(`/api/agreements/${agreement.id}/payments`)
      if (res.ok) {
        const json = await res.json()
        setPayments(json.data || [])
      }
    } finally {
      setLoadingPayments(false)
    }
  }, [agreement.id, expanded])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const handleStatusChange = async (newStatus: 'completed' | 'terminated' | 'active') => {
    setUpdatingStatus(true)
    try {
      const res = await fetch(`/api/agreements/${agreement.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Failed to update agreement')
        return
      }
      const labels = { completed: 'Agreement completed', terminated: 'Agreement terminated', active: 'Agreement reactivated' }
      toast.success(labels[newStatus])
      onRefresh()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleMarkPayment = async (paymentId: string, newStatus: Payment['status']) => {
    try {
      const res = await fetch(`/api/agreements/${agreement.id}/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
        }),
      })
      if (!res.ok) {
        toast.error('Failed to update payment')
        return
      }
      toast.success(`Payment marked as ${newStatus}`)
      setPayments(prev =>
        prev.map(p => p.id === paymentId
          ? { ...p, status: newStatus, paid_at: newStatus === 'paid' ? new Date().toISOString() : p.paid_at }
          : p
        )
      )
    } catch {
      toast.error('Something went wrong')
    }
  }

  const totalPaid    = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const totalPending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)
  const totalOverdue = payments.filter(p => p.status === 'overdue').reduce((s, p) => s + p.amount, 0)

  return (
    <>
      <div className="border border-[#E9ECEF] rounded-xl overflow-hidden bg-white hover:border-[#ADB5BD] transition-colors">
        {/* Top strip */}
        <div className="flex items-start gap-4 p-4">
          {/* Property thumbnail */}
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#E9ECEF] flex-shrink-0">
            {primaryImg ? (
              <Image src={primaryImg} alt="" width={64} height={64} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Building2 size={20} className="text-[#ADB5BD]" />
              </div>
            )}
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <Link
                  href={`/property/${agreement.property.slug || agreement.property.id}`}
                  className="text-sm font-semibold text-[#212529] hover:underline flex items-center gap-1"
                  target="_blank"
                >
                  {agreement.property.title}
                  <ArrowUpRight size={12} className="text-[#ADB5BD]" />
                </Link>
                <p className="text-xs text-[#ADB5BD] mt-0.5">{agreement.property.city}</p>
              </div>
              <AgreementStatusBadge status={agreement.status} />
            </div>

            <div className="mt-2 flex flex-wrap gap-3">
              {/* Tenant / Landlord */}
              <div className="flex items-center gap-1.5 text-xs text-[#495057]">
                <User size={12} className="text-[#ADB5BD]" />
                <span className="font-medium">
                  {isLandlord ? agreement.tenant.name : agreement.landlord.name}
                </span>
                <span className="text-[#ADB5BD]">{isLandlord ? '(tenant)' : '(landlord)'}</span>
              </div>
              {/* Monthly rent */}
              {agreement.agreement_type === 'rent' && (
                <div className="flex items-center gap-1 text-xs text-[#495057]">
                  <DollarSign size={12} className="text-[#ADB5BD]" />
                  <span className="font-semibold">{fmt(agreement.monthly_rent)}</span>
                  <span className="text-[#ADB5BD]">/mo</span>
                </div>
              )}
              {/* Sale price */}
              {agreement.agreement_type === 'sale' && agreement.agreed_sale_price && (
                <div className="flex items-center gap-1 text-xs text-[#495057]">
                  <BadgeCheck size={12} className="text-[#ADB5BD]" />
                  <span className="font-semibold">{fmt(agreement.agreed_sale_price)}</span>
                  <span className="text-[#ADB5BD]">agreed price</span>
                </div>
              )}
              {/* Dates */}
              <div className="flex items-center gap-1 text-xs text-[#ADB5BD]">
                <CalendarDays size={12} />
                <span>{fmtDate(agreement.lease_start_date)}</span>
                {agreement.lease_end_date && <span>→ {fmtDate(agreement.lease_end_date)}</span>}
              </div>
            </div>

            {/* Action row */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {/* Expand payments */}
              {agreement.agreement_type === 'rent' && (
                <button
                  onClick={() => setExpanded(v => !v)}
                  className="flex items-center gap-1 text-xs font-medium text-[#495057] hover:text-[#212529] transition-colors"
                >
                  {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {expanded ? 'Hide' : 'Payments'} ({payments.length})
                </button>
              )}

              {/* Log payment — landlord only, active only */}
              {isLandlord && agreement.status === 'active' && agreement.agreement_type === 'rent' && (
                <button
                  onClick={() => setShowLogPayment(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-white bg-black px-3 py-1.5 rounded-lg hover:bg-[#212529] transition-colors"
                >
                  <Plus size={12} />
                  Log payment
                </button>
              )}

              {/* Status actions — landlord only */}
              {isLandlord && agreement.status === 'active' && (
                <>
                  <button
                    onClick={() => handleStatusChange('completed')}
                    disabled={updatingStatus}
                    className="text-xs font-medium text-[#495057] border border-[#E9ECEF] px-3 py-1.5 rounded-lg hover:bg-[#F8F9FA] transition-colors disabled:opacity-50"
                  >
                    Mark completed
                  </button>
                  <button
                    onClick={() => handleStatusChange('terminated')}
                    disabled={updatingStatus}
                    className="text-xs font-medium text-red-600 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Terminate
                  </button>
                </>
              )}
              {/* Reactivate */}
              {isLandlord && (agreement.status === 'completed' || agreement.status === 'terminated') && (
                <button
                  onClick={() => handleStatusChange('active')}
                  disabled={updatingStatus}
                  className="flex items-center gap-1 text-xs font-medium text-[#495057] border border-[#E9ECEF] px-3 py-1.5 rounded-lg hover:bg-[#F8F9FA] transition-colors disabled:opacity-50"
                >
                  <RotateCcw size={12} />
                  Re-list property
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Payment summary bar */}
        {agreement.agreement_type === 'rent' && payments.length > 0 && !expanded && (
          <div className="grid grid-cols-3 divide-x divide-[#E9ECEF] border-t border-[#E9ECEF] text-center">
            <div className="py-2 px-3">
              <p className="text-[10px] text-[#ADB5BD] uppercase tracking-wider">Collected</p>
              <p className="text-sm font-bold text-green-700">{fmt(totalPaid)}</p>
            </div>
            <div className="py-2 px-3">
              <p className="text-[10px] text-[#ADB5BD] uppercase tracking-wider">Pending</p>
              <p className="text-sm font-bold text-yellow-700">{fmt(totalPending)}</p>
            </div>
            <div className="py-2 px-3">
              <p className="text-[10px] text-[#ADB5BD] uppercase tracking-wider">Overdue</p>
              <p className="text-sm font-bold text-red-700">{fmt(totalOverdue)}</p>
            </div>
          </div>
        )}

        {/* Expanded payment list */}
        {expanded && agreement.agreement_type === 'rent' && (
          <div className="border-t border-[#E9ECEF]">
            {/* Summary */}
            <div className="grid grid-cols-3 divide-x divide-[#E9ECEF] border-b border-[#E9ECEF] text-center">
              <div className="py-2 px-3">
                <p className="text-[10px] text-[#ADB5BD] uppercase tracking-wider">Collected</p>
                <p className="text-sm font-bold text-green-700">{fmt(totalPaid)}</p>
              </div>
              <div className="py-2 px-3">
                <p className="text-[10px] text-[#ADB5BD] uppercase tracking-wider">Pending</p>
                <p className="text-sm font-bold text-yellow-700">{fmt(totalPending)}</p>
              </div>
              <div className="py-2 px-3">
                <p className="text-[10px] text-[#ADB5BD] uppercase tracking-wider">Overdue</p>
                <p className="text-sm font-bold text-red-700">{fmt(totalOverdue)}</p>
              </div>
            </div>

            {loadingPayments ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-[#ADB5BD]" size={20} />
              </div>
            ) : payments.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center px-6">
                <DollarSign size={28} className="text-[#E9ECEF] mb-2" />
                <p className="text-sm text-[#ADB5BD]">No payments logged yet</p>
                {isLandlord && agreement.status === 'active' && (
                  <button
                    onClick={() => setShowLogPayment(true)}
                    className="mt-3 flex items-center gap-1 text-xs font-semibold text-white bg-black px-3 py-1.5 rounded-lg hover:bg-[#212529] transition-colors"
                  >
                    <Plus size={12} />
                    Log first payment
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-[#F8F9FA]">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between px-4 py-3 hover:bg-[#FAFAFA]">
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-[#495057]">
                        <p className="font-medium">{fmtDate(payment.due_date)}</p>
                        {payment.payment_method && (
                          <p className="text-[#ADB5BD] capitalize">{payment.payment_method.replace('_', ' ')}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-[#212529]">{fmt(payment.amount)}</span>
                      <PaymentStatusBadge status={payment.status} />
                      {isLandlord && payment.status !== 'paid' && (
                        <button
                          onClick={() => handleMarkPayment(payment.id, 'paid')}
                          className="text-[10px] font-semibold text-green-700 border border-green-200 bg-green-50 px-2 py-1 rounded-md hover:bg-green-100 transition-colors whitespace-nowrap"
                        >
                          Mark paid
                        </button>
                      )}
                      {isLandlord && payment.status === 'pending' && (
                        <button
                          onClick={() => handleMarkPayment(payment.id, 'overdue')}
                          className="text-[10px] font-semibold text-red-600 border border-red-100 bg-red-50 px-2 py-1 rounded-md hover:bg-red-100 transition-colors whitespace-nowrap"
                        >
                          Overdue
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Log payment dialog */}
      {showLogPayment && (
        <LogPaymentDialog
          agreement={agreement}
          onClose={() => setShowLogPayment(false)}
          onSuccess={() => {
            fetchPayments()
            if (!expanded) setExpanded(true)
          }}
        />
      )}
    </>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function RentManagementPage() {
  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'terminated'>('all')
  const supabase = createClient()

  const fetchAgreements = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    const res = await fetch('/api/agreements')
    if (res.ok) {
      const json = await res.json()
      setAgreements(json.data || [])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchAgreements() }, [fetchAgreements])

  const filtered = filter === 'all' ? agreements : agreements.filter(a => a.status === filter)
  const active    = agreements.filter(a => a.status === 'active').length
  const completed = agreements.filter(a => a.status === 'completed').length
  const terminated = agreements.filter(a => a.status === 'terminated').length

  // Stats
  const totalMonthlyRent = agreements
    .filter(a => a.status === 'active' && a.agreement_type === 'rent')
    .reduce((s, a) => s + a.monthly_rent, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="animate-spin text-[#ADB5BD]" size={32} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Handshake size={22} className="text-[#212529]" />
          <h1 className="text-2xl font-bold text-[#212529]">Rent Management</h1>
        </div>
        <p className="text-sm text-[#ADB5BD]">
          Track all your rental agreements and payment history in one place.
        </p>
      </div>

      {/* Stats */}
      {agreements.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#F8F9FA] rounded-xl p-4">
            <p className="text-xs text-[#ADB5BD] uppercase tracking-wider mb-1">Active</p>
            <p className="text-2xl font-bold text-[#212529]">{active}</p>
          </div>
          <div className="bg-[#F8F9FA] rounded-xl p-4">
            <p className="text-xs text-[#ADB5BD] uppercase tracking-wider mb-1">Monthly Income</p>
            <p className="text-2xl font-bold text-green-700">{fmt(totalMonthlyRent)}</p>
          </div>
          <div className="bg-[#F8F9FA] rounded-xl p-4">
            <p className="text-xs text-[#ADB5BD] uppercase tracking-wider mb-1">Completed</p>
            <p className="text-2xl font-bold text-blue-700">{completed}</p>
          </div>
          <div className="bg-[#F8F9FA] rounded-xl p-4">
            <p className="text-xs text-[#ADB5BD] uppercase tracking-wider mb-1">Terminated</p>
            <p className="text-2xl font-bold text-red-700">{terminated}</p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      {agreements.length > 0 && (
        <div className="flex gap-1 mb-6 p-1 bg-[#F8F9FA] rounded-xl w-fit">
          {(['all', 'active', 'completed', 'terminated'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors capitalize ${
                filter === tab
                  ? 'bg-white text-[#212529] shadow-sm'
                  : 'text-[#495057] hover:text-[#212529]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Agreements */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-[#F8F9FA] rounded-full flex items-center justify-center mb-4">
            <Handshake size={28} className="text-[#ADB5BD]" />
          </div>
          <h2 className="text-lg font-semibold text-[#212529] mb-2">
            {agreements.length === 0 ? 'No agreements yet' : `No ${filter} agreements`}
          </h2>
          <p className="text-sm text-[#ADB5BD] max-w-xs">
            {agreements.length === 0
              ? 'When you confirm a deal with a tenant via Messages, the agreement will appear here.'
              : 'Try selecting a different filter.'}
          </p>
          {agreements.length === 0 && (
            <Link
              href="/dashboard/messages"
              className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-[#212529] transition-colors"
            >
              <Handshake size={16} />
              Go to Messages
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((agreement) => (
            <AgreementCard
              key={agreement.id}
              agreement={agreement}
              userId={userId || ''}
              onRefresh={fetchAgreements}
            />
          ))}
        </div>
      )}
    </div>
  )
}
