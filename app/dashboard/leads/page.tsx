'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  Inbox,
  Clock,
  Star,
  Filter,
  Search,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  RefreshCw,
  Timer,
} from 'lucide-react'
import { toast } from 'sonner'

type Lead = {
  id: string
  lead_type: string
  contact_name: string
  contact_email: string | null
  contact_phone: string | null
  message: string | null
  status: string
  lead_score: number
  financing_status: string | null
  timeline: string | null
  preferred_areas: string[] | null
  budget_min: number | null
  budget_max: number | null
  auto_assigned_at: string | null
  claim_deadline_at: string | null
  claimed_at: string | null
  expires_at: string | null
  created_at: string
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-[#212529] text-white',
  assigned: 'bg-blue-600 text-white',
  claimed: 'bg-green-600 text-white',
  contacted: 'bg-purple-600 text-white',
  in_progress: 'bg-orange-600 text-white',
  converted: 'bg-emerald-600 text-white',
  closed: 'bg-[#ADB5BD] text-white',
  lost: 'bg-red-500 text-white',
  spam: 'bg-[#ADB5BD] text-[#495057]',
}

const LEAD_TYPE_LABELS: Record<string, string> = {
  buyer_lead: 'Buyer',
  seller_lead: 'Seller',
  rental_lead: 'Rental',
  property_valuation: 'Valuation',
  general_inquiry: 'Inquiry',
}

const FINANCING_LABELS: Record<string, string> = {
  pre_approved: 'Pre-Approved',
  pre_qualified: 'Pre-Qualified',
  not_ready: 'Not Ready',
  unknown: 'Unknown',
}

function ClaimCountdown({ deadlineAt }: { deadlineAt: string | null }) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!deadlineAt) return
    const update = () => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(deadlineAt).getTime() - Date.now()) / 1000)
      )
      setSeconds(remaining)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [deadlineAt])

  if (!deadlineAt || seconds <= 0) return null

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const urgent = seconds < 60

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded border ${
        urgent
          ? 'border-red-300 text-red-600 bg-red-50 animate-pulse'
          : 'border-orange-300 text-orange-600 bg-orange-50'
      }`}
    >
      <Timer size={11} />
      {mins}:{secs.toString().padStart(2, '0')}
    </span>
  )
}

function LeadScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : score >= 50
      ? 'bg-blue-100 text-blue-700 border-blue-200'
      : 'bg-[#F8F9FA] text-[#495057] border-[#E9ECEF]'

  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${color}`}>
      {score.toFixed(0)}
    </span>
  )
}

export default function AgentLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [agentId, setAgentId] = useState<string | null>(null)
  const [hasAgentProfile, setHasAgentProfile] = useState<boolean | null>(null)
  const [statusFilter, setStatusFilter] = useState('assigned,claimed,contacted,in_progress')
  const [sortBy, setSortBy] = useState('score')
  const [search, setSearch] = useState('')
  const [claiming, setClaiming] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const supabase = createClient()

  const loadAgent = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: agent } = await supabase
      .from('agents')
      .select('id')
      .eq('user_id', user.id)
      .single()

    setHasAgentProfile(!!agent)
    if (agent) setAgentId(agent.id)
  }, [supabase])

  const loadLeads = useCallback(async () => {
    if (!agentId) return
    setLoading(true)

    try {
      const params = new URLSearchParams({
        status: statusFilter,
        sortBy,
        limit: '30',
        offset: '0',
      })

      const response = await fetch(`/api/leads?${params}`)
      if (!response.ok) throw new Error('Failed to fetch leads')

      const data = await response.json()
      setLeads(data.leads || [])
      setTotal(data.pagination?.total || 0)
    } catch {
      toast.error('Failed to load leads')
    } finally {
      setLoading(false)
    }
  }, [agentId, statusFilter, sortBy])

  useEffect(() => { loadAgent() }, [loadAgent])
  useEffect(() => { if (agentId) loadLeads() }, [agentId, loadLeads])

  const handleClaim = async (leadId: string) => {
    setClaiming(leadId)
    try {
      const response = await fetch(`/api/leads/${leadId}/claim`, { method: 'POST' })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim lead')
      }

      toast.success(data.message || 'Lead claimed!')
      loadLeads()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to claim lead')
    } finally {
      setClaiming(null)
    }
  }

  const handleStatusUpdate = async (leadId: string, status: string) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, status }),
      })
      if (!response.ok) throw new Error('Failed to update')
      toast.success('Lead updated')
      loadLeads()
    } catch {
      toast.error('Failed to update lead')
    }
  }

  const filteredLeads = leads.filter(lead => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      lead.contact_name.toLowerCase().includes(q) ||
      lead.contact_email?.toLowerCase().includes(q) ||
      lead.contact_phone?.toLowerCase().includes(q)
    )
  })

  if (hasAgentProfile === false) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-[#ADB5BD]" />
        <h1 className="text-2xl font-bold text-[#212529] mb-2">Agent Profile Required</h1>
        <p className="text-[#495057] mb-6">
          You need to register as an agent before you can receive leads.
        </p>
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#212529]">Lead Inbox</h1>
          <p className="text-[#495057] text-sm mt-0.5">{total} leads total</p>
        </div>
        <button
          onClick={loadLeads}
          className="flex items-center gap-2 text-sm text-[#495057] hover:text-[#212529] border border-[#E9ECEF] px-3 py-2 rounded-lg transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ADB5BD]" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-[#E9ECEF] rounded-lg text-sm focus:outline-none focus:border-black"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-[#E9ECEF] rounded-lg text-sm px-3 py-2 focus:outline-none focus:border-black bg-white"
        >
          <option value="assigned,claimed,contacted,in_progress">Active</option>
          <option value="assigned">Assigned</option>
          <option value="claimed">Claimed</option>
          <option value="contacted,in_progress">In Progress</option>
          <option value="converted">Converted</option>
          <option value="closed,lost">Closed</option>
          <option value="new,assigned,claimed,contacted,in_progress,converted,closed,lost">All</option>
        </select>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="border border-[#E9ECEF] rounded-lg text-sm px-3 py-2 focus:outline-none focus:border-black bg-white"
        >
          <option value="score">Sort by Score</option>
          <option value="urgency">Sort by Urgency</option>
          <option value="date">Sort by Date</option>
        </select>
      </div>

      {/* Lead Cards */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-[#F8F9FA] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-16 text-[#ADB5BD]">
          <Inbox size={48} className="mx-auto mb-3" />
          <p className="font-medium text-[#495057]">No leads found</p>
          <p className="text-sm mt-1">New leads will appear here when assigned to you</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map(lead => (
            <div
              key={lead.id}
              className="border border-[#E9ECEF] rounded-xl p-4 hover:border-[#ADB5BD] transition-colors bg-white group"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: Contact info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-[#212529]">{lead.contact_name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[lead.status] || 'bg-[#E9ECEF]'}`}>
                      {lead.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-[#ADB5BD] border border-[#E9ECEF] px-2 py-0.5 rounded">
                      {LEAD_TYPE_LABELS[lead.lead_type] || lead.lead_type}
                    </span>
                    {lead.status === 'assigned' && (
                      <ClaimCountdown deadlineAt={lead.claim_deadline_at} />
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#495057]">
                    {lead.contact_email && (
                      <span className="flex items-center gap-1">
                        <Mail size={12} className="text-[#ADB5BD]" />
                        {lead.contact_email}
                      </span>
                    )}
                    {lead.contact_phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={12} className="text-[#ADB5BD]" />
                        {lead.contact_phone}
                      </span>
                    )}
                    {lead.preferred_areas && lead.preferred_areas.length > 0 && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-[#ADB5BD]" />
                        {lead.preferred_areas.slice(0, 2).join(', ')}
                        {lead.preferred_areas.length > 2 && ` +${lead.preferred_areas.length - 2}`}
                      </span>
                    )}
                    {(lead.budget_min || lead.budget_max) && (
                      <span className="flex items-center gap-1">
                        <DollarSign size={12} className="text-[#ADB5BD]" />
                        {lead.budget_min
                          ? `$${(lead.budget_min / 100).toLocaleString()}`
                          : ''}
                        {lead.budget_min && lead.budget_max ? ' – ' : ''}
                        {lead.budget_max
                          ? `$${(lead.budget_max / 100).toLocaleString()}`
                          : ''}
                      </span>
                    )}
                    {lead.financing_status && lead.financing_status !== 'unknown' && (
                      <span className="flex items-center gap-1">
                        <CheckCircle size={12} className="text-[#ADB5BD]" />
                        {FINANCING_LABELS[lead.financing_status]}
                      </span>
                    )}
                    {lead.timeline && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-[#ADB5BD]" />
                        {lead.timeline.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  {lead.message && (
                    <p className="text-sm text-[#495057] mt-2 line-clamp-2">{lead.message}</p>
                  )}
                </div>

                {/* Right: Score & Actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={12} className="text-[#ADB5BD]" />
                    <LeadScoreBadge score={lead.lead_score} />
                  </div>

                  <div className="flex gap-2 mt-1">
                    {lead.status === 'assigned' && (
                      <button
                        onClick={() => handleClaim(lead.id)}
                        disabled={claiming === lead.id}
                        className="text-xs bg-black text-white px-3 py-1.5 rounded-lg font-medium hover:bg-[#212529] transition-colors disabled:opacity-60"
                      >
                        {claiming === lead.id ? 'Claiming…' : 'Claim Lead'}
                      </button>
                    )}
                    {lead.status === 'claimed' && (
                      <button
                        onClick={() => handleStatusUpdate(lead.id, 'contacted')}
                        className="text-xs border border-[#212529] text-[#212529] px-3 py-1.5 rounded-lg font-medium hover:bg-[#F8F9FA] transition-colors"
                      >
                        Mark Contacted
                      </button>
                    )}
                    {lead.status === 'contacted' && (
                      <button
                        onClick={() => handleStatusUpdate(lead.id, 'in_progress')}
                        className="text-xs border border-[#212529] text-[#212529] px-3 py-1.5 rounded-lg font-medium hover:bg-[#F8F9FA] transition-colors"
                      >
                        In Progress
                      </button>
                    )}
                    {lead.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusUpdate(lead.id, 'converted')}
                        className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                      >
                        Convert
                      </button>
                    )}
                    <Link
                      href={`/dashboard/leads/${lead.id}`}
                      className="text-xs text-[#495057] hover:text-[#212529] flex items-center gap-1 transition-colors"
                    >
                      View <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
