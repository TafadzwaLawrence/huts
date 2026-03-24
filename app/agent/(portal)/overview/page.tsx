import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Inbox,
  Users,
  Calendar,
  TrendingUp,
  Star,
  Clock,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Award,
} from 'lucide-react'

function StatCard({
  label,
  value,
  sub,
  href,
}: {
  label: string
  value: string | number
  sub?: string
  href?: string
}) {
  const inner = (
    <div className="bg-white border border-[#E9ECEF] rounded-xl p-5 hover:border-[#ADB5BD] transition-colors">
      <p className="text-xs font-medium text-[#ADB5BD] uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-3xl font-bold text-[#212529]">{value}</p>
      {sub && <p className="text-xs text-[#495057] mt-1">{sub}</p>}
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const LEAD_TYPE_LABELS: Record<string, string> = {
  buyer_lead: 'Buyer',
  seller_lead: 'Seller',
  rental_lead: 'Rental',
  property_valuation: 'Valuation',
  general_inquiry: 'Inquiry',
}

const APT_TYPE_LABELS: Record<string, string> = {
  tour: 'Tour',
  open_house: 'Open House',
  consultation: 'Consultation',
  meeting: 'Meeting',
  inspection: 'Inspection',
  appraisal: 'Appraisal',
}

export default async function AgentOverviewPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signup')

  // Get agent record
  const { data: agent } = await supabase
    .from('agents')
    .select(
      'id, is_premier, is_featured, avg_rating, total_reviews, properties_listed, properties_sold, specializations',
    )
    .eq('user_id', user.id)
    .single()

  if (!agent) redirect('/agents/signup')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const agentName = profile?.full_name?.split(' ')[0] || 'Agent'

  // Parallelise all stat queries
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { count: newLeadsCount },
    { count: activeLeadsCount },
    { count: convertedThisMonth },
    { count: activeClientsCount },
    { count: todayAptCount },
    { data: recentLeads },
    { data: todayApts },
  ] = await Promise.all([
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('assigned_agent_id', agent.id)
      .in('status', ['new', 'assigned']),
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('assigned_agent_id', agent.id)
      .in('status', ['claimed', 'contacted', 'in_progress']),
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('assigned_agent_id', agent.id)
      .eq('status', 'converted')
      .gte('updated_at', monthStart),
    supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('agent_id', agent.id)
      .eq('is_active', true),
    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('agent_id', agent.id)
      .gte('scheduled_at', todayStart)
      .lt('scheduled_at', todayEnd)
      .in('status', ['scheduled', 'confirmed']),
    supabase
      .from('leads')
      .select('id, lead_type, contact_name, contact_email, status, lead_score, preferred_areas, created_at')
      .eq('assigned_agent_id', agent.id)
      .in('status', ['new', 'assigned', 'claimed', 'contacted', 'in_progress'])
      .order('lead_score', { ascending: false })
      .limit(5),
    supabase
      .from('appointments')
      .select(
        'id, title, appointment_type, scheduled_at, duration_minutes, location, status, client:clients(first_name, last_name)',
      )
      .eq('agent_id', agent.id)
      .gte('scheduled_at', todayStart)
      .lt('scheduled_at', todayEnd)
      .in('status', ['scheduled', 'confirmed'])
      .order('scheduled_at', { ascending: true }),
  ])

  const greeting = (() => {
    const h = now.getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#212529]">
            {greeting}, {agentName} 👋
          </h1>
          <p className="text-[#495057] text-sm mt-1">
            Here's your performance at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {agent.is_premier && (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
              <Award size={14} />
              Premier Agent
            </span>
          )}
          {agent.avg_rating !== null && (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-[#495057] bg-white border border-[#E9ECEF] px-3 py-1.5 rounded-full">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              {Number(agent.avg_rating).toFixed(1)} ({agent.total_reviews} reviews)
            </span>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="New Leads"
          value={newLeadsCount ?? 0}
          sub="Awaiting your action"
          href="/agent/leads"
        />
        <StatCard
          label="Active Pipeline"
          value={activeLeadsCount ?? 0}
          sub="In progress"
          href="/agent/leads"
        />
        <StatCard
          label="Active Clients"
          value={activeClientsCount ?? 0}
          sub="Managed by you"
          href="/agent/clients"
        />
        <StatCard
          label="Converted This Month"
          value={convertedThisMonth ?? 0}
          sub={`${todayAptCount ?? 0} appointment${(todayAptCount ?? 0) === 1 ? '' : 's'} today`}
          href="/agent/calendar"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white border border-[#E9ECEF] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E9ECEF]">
            <div className="flex items-center gap-2">
              <Inbox size={16} className="text-[#ADB5BD]" />
              <h2 className="font-semibold text-[#212529]">Recent Leads</h2>
            </div>
            <Link
              href="/agent/leads"
              className="flex items-center gap-1 text-xs text-[#ADB5BD] hover:text-[#212529] transition-colors"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {!recentLeads || recentLeads.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Inbox size={32} className="mx-auto mb-2 text-[#E9ECEF]" />
              <p className="text-sm text-[#ADB5BD]">No active leads right now</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F8F9FA]">
              {recentLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href="/agent/leads"
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#F8F9FA] transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                      lead.lead_score >= 80
                        ? 'bg-emerald-500'
                        : lead.lead_score >= 50
                        ? 'bg-blue-500'
                        : 'bg-[#ADB5BD]'
                    }`}
                  >
                    {lead.lead_score?.toFixed(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#212529] truncate">
                        {lead.contact_name}
                      </span>
                      <span className="text-xs text-[#ADB5BD] border border-[#E9ECEF] px-1.5 py-0.5 rounded shrink-0">
                        {LEAD_TYPE_LABELS[lead.lead_type] || lead.lead_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#ADB5BD] mt-0.5">
                      {lead.contact_email && (
                        <span className="flex items-center gap-1 truncate">
                          <Mail size={10} />
                          {lead.contact_email}
                        </span>
                      )}
                      {lead.preferred_areas && lead.preferred_areas.length > 0 && (
                        <span className="flex items-center gap-1">
                          <MapPin size={10} />
                          {lead.preferred_areas[0]}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-[#ADB5BD] shrink-0">
                    {timeAgo(lead.created_at)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Today's Schedule */}
        <div className="bg-white border border-[#E9ECEF] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E9ECEF]">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#ADB5BD]" />
              <h2 className="font-semibold text-[#212529]">Today's Schedule</h2>
              {(todayAptCount ?? 0) > 0 && (
                <span className="text-xs font-semibold bg-black text-white px-2 py-0.5 rounded-full">
                  {todayAptCount}
                </span>
              )}
            </div>
            <Link
              href="/agent/calendar"
              className="flex items-center gap-1 text-xs text-[#ADB5BD] hover:text-[#212529] transition-colors"
            >
              Full calendar <ArrowRight size={12} />
            </Link>
          </div>

          {!todayApts || todayApts.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Calendar size={32} className="mx-auto mb-2 text-[#E9ECEF]" />
              <p className="text-sm text-[#ADB5BD]">Nothing scheduled for today</p>
              <Link
                href="/agent/calendar"
                className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-[#212529] underline underline-offset-2"
              >
                Schedule an appointment
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#F8F9FA]">
              {todayApts.map((apt) => {
                const scheduled = new Date(apt.scheduled_at)
                const end = new Date(scheduled.getTime() + apt.duration_minutes * 60000)
                const clientRaw = apt.client as unknown as { first_name: string; last_name: string }[] | { first_name: string; last_name: string } | null
                const client = Array.isArray(clientRaw) ? clientRaw[0] ?? null : clientRaw
                const isConfirmed = apt.status === 'confirmed'

                return (
                  <Link
                    key={apt.id}
                    href="/agent/calendar"
                    className="flex items-start gap-3 px-5 py-3.5 hover:bg-[#F8F9FA] transition-colors"
                  >
                    <div className="text-center w-12 shrink-0">
                      <p className="text-sm font-bold text-[#212529]">
                        {scheduled.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-[10px] text-[#ADB5BD]">
                        {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="w-0.5 self-stretch bg-[#E9ECEF] rounded-full mx-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-[#212529] truncate">
                          {apt.title}
                        </span>
                        {isConfirmed ? (
                          <CheckCircle size={12} className="text-green-500 shrink-0" />
                        ) : (
                          <Clock size={12} className="text-[#ADB5BD] shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#ADB5BD]">
                        <span>{APT_TYPE_LABELS[apt.appointment_type] || apt.appointment_type}</span>
                        {client && (
                          <span className="flex items-center gap-1">
                            <Users size={10} />
                            {client.first_name} {client.last_name}
                          </span>
                        )}
                        {apt.location && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin size={10} />
                            {apt.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Performance Footer */}
      <div className="mt-6 bg-white border border-[#E9ECEF] rounded-xl px-5 py-4 flex flex-wrap gap-x-8 gap-y-3">
        <div className="flex items-center gap-2 text-sm text-[#495057]">
          <TrendingUp size={14} className="text-[#ADB5BD]" />
          <span className="text-[#ADB5BD]">Listed:</span>
          <span className="font-semibold text-[#212529]">{agent.properties_listed ?? 0}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#495057]">
          <CheckCircle size={14} className="text-[#ADB5BD]" />
          <span className="text-[#ADB5BD]">Sold/Leased:</span>
          <span className="font-semibold text-[#212529]">{agent.properties_sold ?? 0}</span>
        </div>
        {agent.specializations && agent.specializations.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-[#495057]">
            <Star size={14} className="text-[#ADB5BD]" />
            <span className="text-[#ADB5BD]">Specialities:</span>
            <span className="font-semibold text-[#212529]">
              {agent.specializations.slice(0, 3).join(', ')}
            </span>
          </div>
        )}
        <Link
          href="/agent/profile"
          className="ml-auto flex items-center gap-1 text-xs font-medium text-[#495057] hover:text-[#212529] transition-colors"
        >
          Edit profile <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  )
}
