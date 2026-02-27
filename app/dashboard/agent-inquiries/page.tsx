import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Clock,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search
} from 'lucide-react'
import { INQUIRY_TYPE_LABELS, ICON_SIZES } from '@/lib/constants'

export default async function AgentInquiriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signup')

  // Check if user has agent profile
  const { data: agentProfile } = await supabase
    .from('agent_profiles')
    .select('id, business_name, status')
    .eq('user_id', user.id)
    .single()

  if (!agentProfile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="mb-6">
          <AlertCircle size={64} className="mx-auto text-[#ADB5BD]" />
        </div>
        <h1 className="text-2xl font-bold text-[#212529] mb-3">
          Agent Profile Required
        </h1>
        <p className="text-[#495057] mb-6">
          You need to create an agent profile to access inquiries and leads.
        </p>
        <Link
          href="/agents/signup"
          className="inline-block px-6 py-3 bg-[#212529] text-white rounded-xl hover:bg-[#000000] transition-colors font-medium"
        >
          Create Agent Profile
        </Link>
      </div>
    )
  }

  // Fetch inquiries
  const { data: inquiries } = await supabase
    .from('agent_inquiries')
    .select(`
      *,
      property:properties(title, slug, city, neighborhood)
    `)
    .eq('agent_id', agentProfile.id)
    .order('created_at', { ascending: false })

  // Group by status
  const newInquiries = inquiries?.filter(i => i.status === 'new') || []
  const contactedInquiries = inquiries?.filter(i => i.status === 'contacted') || []
  const inProgressInquiries = inquiries?.filter(i => i.status === 'in_progress') || []
  const closedInquiries = inquiries?.filter(i => i.status === 'closed') || []

  const stats = [
    { label: 'New', count: newInquiries.length, color: 'text-[#212529]' },
    { label: 'Contacted', count: contactedInquiries.length, color: 'text-blue-600' },
    { label: 'In Progress', count: inProgressInquiries.length, color: 'text-yellow-600' },
    { label: 'Closed', count: closedInquiries.length, color: 'text-green-600' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#212529] mb-2">Inquiries & Leads</h1>
        <p className="text-[#495057]">Manage inquiries from potential clients</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-[#E9ECEF] rounded-xl p-5"
          >
            <div className="text-3xl font-bold mb-1" style={{ color: stat.color }}>
              {stat.count}
            </div>
            <div className="text-sm text-[#495057]">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Inquiries List */}
      {inquiries && inquiries.length > 0 ? (
        <div className="space-y-6">
          {/* New Inquiries */}
          {newInquiries.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-[#212529] mb-4 flex items-center gap-2">
                <AlertCircle size={ICON_SIZES.md} />
                New Inquiries ({newInquiries.length})
              </h2>
              <div className="space-y-3">
                {newInquiries.map((inquiry) => (
                  <InquiryCard key={inquiry.id} inquiry={inquiry} agentProfileId={agentProfile.id} />
                ))}
              </div>
            </section>
          )}

          {/* Contacted */}
          {contactedInquiries.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-[#212529] mb-4 flex items-center gap-2">
                <MessageSquare size={ICON_SIZES.md} />
                Contacted ({contactedInquiries.length})
              </h2>
              <div className="space-y-3">
                {contactedInquiries.map((inquiry) => (
                  <InquiryCard key={inquiry.id} inquiry={inquiry} agentProfileId={agentProfile.id} />
                ))}
              </div>
            </section>
          )}

          {/* In Progress */}
          {inProgressInquiries.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-[#212529] mb-4 flex items-center gap-2">
                <Clock size={ICON_SIZES.md} />
                In Progress ({inProgressInquiries.length})
              </h2>
              <div className="space-y-3">
                {inProgressInquiries.map((inquiry) => (
                  <InquiryCard key={inquiry.id} inquiry={inquiry} agentProfileId={agentProfile.id} />
                ))}
              </div>
            </section>
          )}

          {/* Closed */}
          {closedInquiries.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-[#212529] mb-4 flex items-center gap-2">
                <CheckCircle size={ICON_SIZES.md} />
                Closed ({closedInquiries.length})
              </h2>
              <div className="space-y-3">
                {closedInquiries.slice(0, 5).map((inquiry) => (
                  <InquiryCard key={inquiry.id} inquiry={inquiry} agentProfileId={agentProfile.id} />
                ))}
              </div>
              {closedInquiries.length > 5 && (
                <p className="text-sm text-[#ADB5BD] mt-3 text-center">
                  Showing 5 of {closedInquiries.length} closed inquiries
                </p>
              )}
            </section>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-[#E9ECEF] rounded-xl">
          <Mail size={64} className="mx-auto text-[#ADB5BD] mb-4" />
          <h3 className="text-xl font-bold text-[#212529] mb-2">No inquiries yet</h3>
          <p className="text-[#495057] mb-6">
            When potential clients contact you, they'll appear here.
          </p>
          <Link
            href="/find-agent"
            className="inline-block px-6 py-3 bg-white text-[#212529] border-2 border-[#212529] rounded-xl hover:bg-[#F8F9FA] transition-colors font-medium"
          >
            View Your Public Profile
          </Link>
        </div>
      )}
    </div>
  )
}

function InquiryCard({ inquiry, agentProfileId }: any) {
  const property = inquiry.property as { title: string; slug: string; city: string; neighborhood: string } | null
  const createdDate = new Date(inquiry.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const statusColors = {
    new: 'bg-[#212529] text-white',
    contacted: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    closed: 'bg-green-100 text-green-800',
    spam: 'bg-red-100 text-red-800',
  }

  return (
    <div className="bg-white border border-[#E9ECEF] rounded-xl p-6 hover:border-[#212529] transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-[#212529]">{inquiry.name}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[inquiry.status as keyof typeof statusColors]}`}>
              {inquiry.status.replace('_', ' ')}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-[#495057]">
            <span className="flex items-center gap-1">
              <Mail size={ICON_SIZES.sm} />
              {inquiry.email}
            </span>
            {inquiry.phone && (
              <span className="flex items-center gap-1">
                <Phone size={ICON_SIZES.sm} />
                {inquiry.phone}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={ICON_SIZES.sm} />
              {createdDate}
            </span>
          </div>
        </div>
      </div>

      {/* Inquiry Type & Budget */}
      <div className="flex flex-wrap gap-3 mb-4 text-sm">
        <span className="px-3 py-1 bg-[#F8F9FA] text-[#212529] rounded-full">
          {INQUIRY_TYPE_LABELS[inquiry.inquiry_type as keyof typeof INQUIRY_TYPE_LABELS]}
        </span>
        {inquiry.budget_min && inquiry.budget_max && (
          <span className="flex items-center gap-1 px-3 py-1 bg-[#F8F9FA] text-[#212529] rounded-full">
            <DollarSign size={ICON_SIZES.sm} />
            ${inquiry.budget_min / 100} - ${inquiry.budget_max / 100}
          </span>
        )}
        {inquiry.timeline && (
          <span className="px-3 py-1 bg-[#F8F9FA] text-[#212529] rounded-full">
            {inquiry.timeline}
          </span>
        )}
      </div>

      {/* Property Context */}
      {property && (
        <Link
          href={`/property/${property.slug || property.id}`}
          className="block mb-4 p-3 bg-[#F8F9FA] rounded-lg hover:bg-[#E9ECEF] transition-colors"
        >
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={ICON_SIZES.sm} className="text-[#495057]" />
            <span className="font-medium text-[#212529]">{property.title}</span>
            <span className="text-[#ADB5BD]">•</span>
            <span className="text-[#495057]">{property.neighborhood || property.city}</span>
          </div>
        </Link>
      )}

      {/* Message */}
      <div className="mb-4">
        <p className="text-sm text-[#495057] leading-relaxed">
          {inquiry.message}
        </p>
      </div>

      {/* Source */}
      {inquiry.source && (
        <div className="text-xs text-[#ADB5BD] mb-4">
          Source: {inquiry.source.replace('_', ' ')}
        </div>
      )}

      {/* Agent Notes */}
      {inquiry.agent_notes && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
          <p className="text-xs font-medium text-yellow-900 mb-1">Your Notes:</p>
          <p className="text-sm text-yellow-800">{inquiry.agent_notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-[#E9ECEF]">
        <a
          href={`mailto:${inquiry.email}`}
          className="px-4 py-2 bg-[#212529] text-white rounded-lg hover:bg-[#000000] transition-colors text-sm font-medium"
        >
          Reply via Email
        </a>
        {inquiry.phone && (
          <a
            href={`tel:${inquiry.phone}`}
            className="px-4 py-2 bg-white text-[#212529] border border-[#E9ECEF] rounded-lg hover:border-[#212529] transition-colors text-sm font-medium"
          >
            Call
          </a>
        )}
        {/* In a real implementation, these would be forms/buttons that update status */}
        <div className="flex-1"></div>
        <span className="text-xs text-[#ADB5BD]">
          Update status via API
        </span>
      </div>
    </div>
  )
}
