'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  User,
  Home,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Check,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

type Appointment = {
  id: string
  appointment_type: string
  title: string
  description: string | null
  scheduled_at: string
  duration_minutes: number
  location: string | null
  status: string
  follow_up_required: boolean
  client: { id: string; first_name: string; last_name: string; email: string; phone: string | null } | null
  property: { id: string; title: string; address: string; city: string } | null
}

const TYPE_LABELS: Record<string, string> = {
  tour: 'Property Tour',
  open_house: 'Open House',
  consultation: 'Consultation',
  meeting: 'Meeting',
  inspection: 'Inspection',
  appraisal: 'Appraisal',
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-50 border-blue-200 text-blue-700',
  confirmed: 'bg-green-50 border-green-200 text-green-700',
  completed: 'bg-[#F8F9FA] border-[#E9ECEF] text-[#495057]',
  cancelled: 'bg-red-50 border-red-200 text-red-700',
  no_show: 'bg-orange-50 border-orange-200 text-orange-700',
}

function WeekView({
  appointments,
  weekStart,
}: {
  appointments: Appointment[]
  weekStart: Date
}) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  const getAptsForDay = (day: Date) =>
    appointments.filter(a => {
      const d = new Date(a.scheduled_at)
      return (
        d.getDate() === day.getDate() &&
        d.getMonth() === day.getMonth() &&
        d.getFullYear() === day.getFullYear()
      )
    })

  const today = new Date()

  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((day, i) => {
        const apts = getAptsForDay(day)
        const isToday =
          day.getDate() === today.getDate() &&
          day.getMonth() === today.getMonth() &&
          day.getFullYear() === today.getFullYear()

        return (
          <div key={i} className="min-h-[120px]">
            <div
              className={`text-center py-2 text-xs font-medium mb-1 rounded-lg ${
                isToday ? 'bg-black text-white' : 'text-[#495057]'
              }`}
            >
              <div>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}</div>
              <div className={`text-sm font-bold ${isToday ? 'text-white' : 'text-[#212529]'}`}>
                {day.getDate()}
              </div>
            </div>
            <div className="space-y-1">
              {apts.map(apt => (
                <div
                  key={apt.id}
                  className={`text-xs px-1.5 py-1 rounded border truncate cursor-pointer hover:opacity-80 ${
                    STATUS_COLORS[apt.status] || 'bg-[#F8F9FA] border-[#E9ECEF]'
                  }`}
                  title={`${apt.title} at ${new Date(apt.scheduled_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`}
                >
                  <span className="font-medium">
                    {new Date(apt.scheduled_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="ml-1 text-[10px]">{apt.title}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AppointmentCard({
  apt,
  onStatusChange,
}: {
  apt: Appointment
  onStatusChange: (id: string, status: string) => void
}) {
  const scheduledDate = new Date(apt.scheduled_at)
  const endTime = new Date(scheduledDate.getTime() + apt.duration_minutes * 60000)

  return (
    <div className="border border-[#E9ECEF] rounded-xl p-4 bg-white hover:border-[#ADB5BD] transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-[#212529] truncate">{apt.title}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded border font-medium ${STATUS_COLORS[apt.status]}`}
            >
              {apt.status.replace('_', ' ')}
            </span>
            <span className="text-xs text-[#ADB5BD] border border-[#E9ECEF] px-2 py-0.5 rounded">
              {TYPE_LABELS[apt.appointment_type]}
            </span>
            {apt.follow_up_required && (
              <span className="text-xs text-orange-600 border border-orange-200 bg-orange-50 px-2 py-0.5 rounded">
                Follow-up needed
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#495057]">
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-[#ADB5BD]" />
              {scheduledDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}{' '}
              ·{' '}
              {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
              {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {apt.location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-[#ADB5BD]" />
                {apt.location}
              </span>
            )}
            {apt.client && (
              <span className="flex items-center gap-1">
                <User size={12} className="text-[#ADB5BD]" />
                {apt.client.first_name} {apt.client.last_name}
              </span>
            )}
            {apt.property && (
              <span className="flex items-center gap-1">
                <Home size={12} className="text-[#ADB5BD]" />
                {apt.property.title}
              </span>
            )}
          </div>
        </div>

        {/* Quick actions */}
        {apt.status === 'scheduled' && (
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={() => onStatusChange(apt.id, 'confirmed')}
              className="text-xs bg-green-600 text-white px-2.5 py-1.5 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-1"
            >
              <Check size={11} /> Confirm
            </button>
            <button
              onClick={() => onStatusChange(apt.id, 'cancelled')}
              className="text-xs border border-[#E9ECEF] text-[#495057] px-2.5 py-1.5 rounded-lg hover:border-red-300 hover:text-red-600 transition-colors"
            >
              <X size={11} />
            </button>
          </div>
        )}
        {apt.status === 'confirmed' && (
          <button
            onClick={() => onStatusChange(apt.id, 'completed')}
            className="shrink-0 text-xs bg-black text-white px-2.5 py-1.5 rounded-lg font-medium hover:bg-[#212529] transition-colors"
          >
            Mark Done
          </button>
        )}
      </div>
    </div>
  )
}

function ScheduleModal({
  onClose,
  onAdded,
}: {
  onClose: () => void
  onAdded: () => void
}) {
  const [form, setForm] = useState({
    title: '',
    appointmentType: 'tour',
    scheduledAt: '',
    durationMinutes: 60,
    location: '',
    description: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [conflictError, setConflictError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setConflictError(null)

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()

      if (response.status === 409) {
        const conflictList = data.conflicts
          ?.map((c: { title: string; scheduledAt: string }) =>
            `"${c.title}" at ${new Date(c.scheduledAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}`
          )
          .join(', ')
        setConflictError(`Conflict with: ${conflictList || 'another appointment'}`)
        return
      }

      if (!response.ok) throw new Error(data.error || 'Failed to schedule')
      toast.success('Appointment scheduled')
      onAdded()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to schedule')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-[#E9ECEF]">
          <h2 className="font-bold text-[#212529]">Schedule Appointment</h2>
          <button onClick={onClose} className="text-[#ADB5BD] hover:text-[#212529]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-[#495057] block mb-1">Title *</label>
            <input
              required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Property tour with John Smith"
              className="w-full border border-[#E9ECEF] rounded-lg px-3 py-2 text-sm bg-white text-[#212529] focus:outline-none focus:border-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#495057] block mb-1">Type *</label>
              <select
                required
                value={form.appointmentType}
                onChange={e => setForm({ ...form, appointmentType: e.target.value })}
                className="w-full border border-[#E9ECEF] rounded-lg px-3 py-2 text-sm bg-white text-[#212529] focus:outline-none focus:border-black"
              >
                {Object.entries(TYPE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#495057] block mb-1">Duration</label>
              <select
                value={form.durationMinutes}
                onChange={e => setForm({ ...form, durationMinutes: parseInt(e.target.value) })}
                className="w-full border border-[#E9ECEF] rounded-lg px-3 py-2 text-sm bg-white text-[#212529] focus:outline-none focus:border-black"
              >
                <option value={30}>30 min</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
                <option value={180}>3 hours</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#495057] block mb-1">Date & Time *</label>
            <input
              required
              type="datetime-local"
              value={form.scheduledAt}
              onChange={e => setForm({ ...form, scheduledAt: e.target.value })}
              className="w-full border border-[#E9ECEF] rounded-lg px-3 py-2 text-sm bg-white text-[#212529] focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#495057] block mb-1">Location</label>
            <input
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              placeholder="Address or meeting link"
              className="w-full border border-[#E9ECEF] rounded-lg px-3 py-2 text-sm bg-white text-[#212529] focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#495057] block mb-1">Notes</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full border border-[#E9ECEF] rounded-lg px-3 py-2 text-sm bg-white text-[#212529] focus:outline-none focus:border-black resize-none"
            />
          </div>

          {conflictError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
              {conflictError}
            </div>
          )}

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
              {submitting ? 'Scheduling…' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AgentCalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [hasAgentProfile, setHasAgentProfile] = useState<boolean | null>(null)
  const [view, setView] = useState<'week' | 'list'>('list')
  const [statusFilter, setStatusFilter] = useState('scheduled,confirmed')
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay())
    d.setHours(0, 0, 0, 0)
    return d
  })

  const supabase = createClient()

  const loadAppointments = useCallback(async () => {
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

      const params = new URLSearchParams({ status: statusFilter, limit: '100' })

      if (view === 'week') {
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 7)
        params.set('startDate', weekStart.toISOString())
        params.set('endDate', weekEnd.toISOString())
      }

      const response = await fetch(`/api/appointments?${params}`)
      if (!response.ok) throw new Error()
      const data = await response.json()
      setAppointments(data.appointments || [])
    } catch {
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }, [supabase, statusFilter, view, weekStart])

  useEffect(() => { loadAppointments() }, [loadAppointments])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error()
      toast.success(`Appointment ${status}`)
      loadAppointments()
    } catch {
      toast.error('Failed to update appointment')
    }
  }

  const shiftWeek = (delta: number) => {
    setWeekStart(prev => {
      const d = new Date(prev)
      d.setDate(d.getDate() + delta * 7)
      return d
    })
  }

  if (hasAgentProfile === false) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-[#ADB5BD]" />
        <h1 className="text-2xl font-bold text-[#212529] mb-2">Agent Profile Required</h1>
        <p className="text-[#495057] mb-6">Register as an agent to manage appointments.</p>
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
          <h1 className="text-2xl font-bold text-[#212529]">Calendar</h1>
          <p className="text-[#495057] text-sm mt-0.5">{appointments.length} appointments</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex border border-[#E9ECEF] rounded-lg overflow-hidden">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                view === 'list' ? 'bg-black text-white' : 'text-[#495057] hover:bg-[#F8F9FA]'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                view === 'week' ? 'bg-black text-white' : 'text-[#495057] hover:bg-[#F8F9FA]'
              }`}
            >
              Week
            </button>
          </div>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#212529] transition-colors"
          >
            <Plus size={14} />
            Schedule
          </button>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { value: 'scheduled,confirmed', label: 'Upcoming' },
          { value: 'scheduled', label: 'Scheduled' },
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'completed', label: 'Completed' },
          { value: 'scheduled,confirmed,completed,cancelled,no_show', label: 'All' },
        ].map(option => (
          <button
            key={option.value}
            onClick={() => setStatusFilter(option.value)}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              statusFilter === option.value
                ? 'bg-black text-white border-black'
                : 'border-[#E9ECEF] text-[#495057] hover:border-[#ADB5BD]'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Week nav (week view only) */}
      {view === 'week' && (
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => shiftWeek(-1)}
            className="p-1.5 border border-[#E9ECEF] rounded-lg hover:border-[#ADB5BD] transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-sm font-medium text-[#212529]">
            {weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} –{' '}
            {new Date(weekStart.getTime() + 6 * 86400000).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <button
            onClick={() => shiftWeek(1)}
            className="p-1.5 border border-[#E9ECEF] rounded-lg hover:border-[#ADB5BD] transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-[#F8F9FA] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : view === 'week' ? (
        <WeekView appointments={appointments} weekStart={weekStart} />
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 text-[#ADB5BD]">
          <Calendar size={48} className="mx-auto mb-3" />
          <p className="font-medium text-[#495057]">No appointments</p>
          <p className="text-sm mt-1">Schedule a tour, meeting, or consultation</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map(apt => (
            <AppointmentCard key={apt.id} apt={apt} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}

      {showScheduleModal && (
        <ScheduleModal
          onClose={() => setShowScheduleModal(false)}
          onAdded={loadAppointments}
        />
      )}
    </div>
  )
}
