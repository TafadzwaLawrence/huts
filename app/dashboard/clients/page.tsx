'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Clock,
  StickyNote,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  X,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

type ClientNote = {
  id: string
  note_text: string
  is_internal: boolean
  created_at: string
}

type Client = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  client_type: string
  preferred_areas: string[] | null
  budget_min: number | null
  budget_max: number | null
  timeline: string | null
  special_requirements: string | null
  is_active: boolean
  last_contacted_at: string | null
  created_at: string
  notes?: ClientNote[]
}

const CLIENT_TYPE_LABELS: Record<string, string> = {
  buyer: 'Buyer',
  seller: 'Seller',
  renter: 'Renter',
  landlord: 'Landlord',
  mixed: 'Mixed',
}

const CLIENT_TYPE_COLORS: Record<string, string> = {
  buyer: 'bg-blue-50 text-blue-700 border-blue-200',
  seller: 'bg-purple-50 text-purple-700 border-purple-200',
  renter: 'bg-green-50 text-green-700 border-green-200',
  landlord: 'bg-orange-50 text-orange-700 border-orange-200',
  mixed: 'bg-[#F8F9FA] text-[#495057] border-[#E9ECEF]',
}

function AddNoteForm({ clientId, onAdded }: { clientId: string; onAdded: () => void }) {
  const [noteText, setNoteText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteText.trim()) return
    setSubmitting(true)

    try {
      const response = await fetch(`/api/clients/${clientId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteText }),
      })
      if (!response.ok) throw new Error('Failed to add note')
      setNoteText('')
      onAdded()
      toast.success('Note added')
    } catch {
      toast.error('Failed to add note')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 flex gap-2">
      <input
        type="text"
        value={noteText}
        onChange={e => setNoteText(e.target.value)}
        placeholder="Add a note..."
        className="flex-1 text-sm border border-[#E9ECEF] rounded-lg px-3 py-1.5 focus:outline-none focus:border-black"
      />
      <button
        type="submit"
        disabled={submitting || !noteText.trim()}
        className="text-sm bg-black text-white px-3 py-1.5 rounded-lg font-medium disabled:opacity-50 hover:bg-[#212529] transition-colors"
      >
        {submitting ? '…' : <Check size={14} />}
      </button>
    </form>
  )
}

function ClientCard({ client, onRefresh }: { client: Client; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false)

  const formatBudget = () => {
    if (!client.budget_min && !client.budget_max) return null
    if (client.budget_min && client.budget_max) {
      return `$${(client.budget_min / 100).toLocaleString()} – $${(client.budget_max / 100).toLocaleString()}`
    }
    return client.budget_max
      ? `Up to $${(client.budget_max / 100).toLocaleString()}`
      : `From $${(client.budget_min! / 100).toLocaleString()}`
  }

  const budget = formatBudget()

  return (
    <div className="border border-[#E9ECEF] rounded-xl bg-white overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-semibold text-[#212529]">
                {client.first_name} {client.last_name}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded border font-medium ${
                  CLIENT_TYPE_COLORS[client.client_type]
                }`}
              >
                {CLIENT_TYPE_LABELS[client.client_type]}
              </span>
              {!client.is_active && (
                <span className="text-xs text-[#ADB5BD] border border-[#E9ECEF] px-2 py-0.5 rounded">
                  Inactive
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#495057]">
              <a
                href={`mailto:${client.email}`}
                className="flex items-center gap-1 hover:text-black"
              >
                <Mail size={12} className="text-[#ADB5BD]" />
                {client.email}
              </a>
              {client.phone && (
                <a
                  href={`tel:${client.phone}`}
                  className="flex items-center gap-1 hover:text-black"
                >
                  <Phone size={12} className="text-[#ADB5BD]" />
                  {client.phone}
                </a>
              )}
              {client.preferred_areas && client.preferred_areas.length > 0 && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-[#ADB5BD]" />
                  {client.preferred_areas.slice(0, 2).join(', ')}
                </span>
              )}
              {budget && (
                <span className="flex items-center gap-1">
                  <DollarSign size={12} className="text-[#ADB5BD]" />
                  {budget}
                </span>
              )}
              {client.timeline && (
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-[#ADB5BD]" />
                  {client.timeline.replace('_', ' ')}
                </span>
              )}
            </div>

            {client.special_requirements && (
              <p className="text-sm text-[#495057] mt-1.5 line-clamp-1">
                {client.special_requirements}
              </p>
            )}
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 flex items-center gap-1 text-xs text-[#ADB5BD] hover:text-[#495057] border border-[#E9ECEF] px-2 py-1 rounded-lg transition-colors"
          >
            <StickyNote size={12} />
            {client.notes?.length ?? 0}
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Notes panel */}
      {expanded && (
        <div className="border-t border-[#E9ECEF] bg-[#F8F9FA] px-4 py-3">
          <p className="text-xs font-medium text-[#495057] mb-2">Notes</p>
          {!client.notes || client.notes.length === 0 ? (
            <p className="text-xs text-[#ADB5BD] mb-2">No notes yet</p>
          ) : (
            <div className="space-y-2 mb-2">
              {client.notes.map(note => (
                <div key={note.id} className="text-xs text-[#495057] bg-white border border-[#E9ECEF] rounded-lg px-3 py-2">
                  <p>{note.note_text}</p>
                  <p className="text-[#ADB5BD] mt-1">
                    {new Date(note.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
          <AddNoteForm clientId={client.id} onAdded={onRefresh} />
        </div>
      )}
    </div>
  )
}

function AddClientModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    clientType: 'buyer',
    budgetMin: '',
    budgetMax: '',
    timeline: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          budgetMin: form.budgetMin ? parseInt(form.budgetMin) * 100 : undefined,
          budgetMax: form.budgetMax ? parseInt(form.budgetMax) * 100 : undefined,
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create client')
      }
      toast.success('Client added')
      onAdded()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add client')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-[#E9ECEF]">
          <h2 className="font-bold text-[#212529]">Add New Client</h2>
          <button onClick={onClose} className="text-[#ADB5BD] hover:text-[#212529]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#495057] block mb-1">First Name *</label>
              <input
                required
                value={form.firstName}
                onChange={e => setForm({ ...form, firstName: e.target.value })}
                className="w-full border border-[#E9ECEF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#495057] block mb-1">Last Name *</label>
              <input
                required
                value={form.lastName}
                onChange={e => setForm({ ...form, lastName: e.target.value })}
                className="w-full border border-[#E9ECEF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#495057] block mb-1">Email *</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border border-[#E9ECEF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#495057] block mb-1">Phone</label>
            <input
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-[#E9ECEF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#495057] block mb-1">Client Type *</label>
            <select
              required
              value={form.clientType}
              onChange={e => setForm({ ...form, clientType: e.target.value })}
              className="w-full border border-[#E9ECEF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black bg-white"
            >
              {Object.entries(CLIENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#495057] block mb-1">Budget Min ($)</label>
              <input
                type="number"
                value={form.budgetMin}
                onChange={e => setForm({ ...form, budgetMin: e.target.value })}
                placeholder="50000"
                className="w-full border border-[#E9ECEF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#495057] block mb-1">Budget Max ($)</label>
              <input
                type="number"
                value={form.budgetMax}
                onChange={e => setForm({ ...form, budgetMax: e.target.value })}
                placeholder="200000"
                className="w-full border border-[#E9ECEF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#495057] block mb-1">Timeline</label>
            <select
              value={form.timeline}
              onChange={e => setForm({ ...form, timeline: e.target.value })}
              className="w-full border border-[#E9ECEF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black bg-white"
            >
              <option value="">Not specified</option>
              <option value="asap">ASAP</option>
              <option value="1_month">Within 1 month</option>
              <option value="3_months">Within 3 months</option>
              <option value="6_months">Within 6 months</option>
            </select>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#E9ECEF] text-[#495057] px-4 py-2 rounded-lg text-sm font-medium hover:border-[#ADB5BD] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60 hover:bg-[#212529] transition-colors"
            >
              {submitting ? 'Adding…' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AgentClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [hasAgentProfile, setHasAgentProfile] = useState<boolean | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [total, setTotal] = useState(0)

  const supabase = createClient()

  const loadClients = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: agent } = await supabase
        .from('agents')
        .select('id')
        .eq('user_id', user.id)
        .single()

      setHasAgentProfile(!!agent)
      if (!agent) { setLoading(false); return }

      const params = new URLSearchParams({ isActive: 'true', limit: '50' })
      if (typeFilter) params.set('clientType', typeFilter)
      if (search) params.set('search', search)

      const response = await fetch(`/api/clients?${params}`)
      if (!response.ok) throw new Error()
      const data = await response.json()
      setClients(data.clients || [])
      setTotal(data.pagination?.total || 0)
    } catch {
      toast.error('Failed to load clients')
    } finally {
      setLoading(false)
    }
  }, [supabase, typeFilter, search])

  useEffect(() => { loadClients() }, [loadClients])

  if (hasAgentProfile === false) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-[#ADB5BD]" />
        <h1 className="text-2xl font-bold text-[#212529] mb-2">Agent Profile Required</h1>
        <p className="text-[#495057] mb-6">Register as an agent to manage clients.</p>
        <Link
          href="/agents/signup"
          className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#212529] transition-colors"
        >
          Register as Agent
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#212529]">Clients</h1>
          <p className="text-[#495057] text-sm mt-0.5">{total} total</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#212529] transition-colors"
        >
          <Plus size={14} />
          Add Client
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ADB5BD]" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-[#E9ECEF] rounded-lg text-sm focus:outline-none focus:border-black"
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="border border-[#E9ECEF] rounded-lg text-sm px-3 py-2 focus:outline-none focus:border-black bg-white"
        >
          <option value="">All Types</option>
          {Object.entries(CLIENT_TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-[#F8F9FA] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-16 text-[#ADB5BD]">
          <Users size={48} className="mx-auto mb-3" />
          <p className="font-medium text-[#495057]">No clients yet</p>
          <p className="text-sm mt-1">Add your first client or convert a lead</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map(client => (
            <ClientCard key={client.id} client={client} onRefresh={loadClients} />
          ))}
        </div>
      )}

      {showAddModal && (
        <AddClientModal
          onClose={() => setShowAddModal(false)}
          onAdded={loadClients}
        />
      )}
    </div>
  )
}
