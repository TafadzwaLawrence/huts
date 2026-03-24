import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  MapPin, Phone, Mail, Star, CheckCircle, Award, Building2, Home,
  Briefcase, Camera, MessageSquare, Globe, Calendar,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import {
  AGENT_TYPE_LABELS,
  AGENT_SPECIALIZATION_LABELS,
  ICON_SIZES,
} from '@/lib/constants'

type Props = { params: { slug: string } }

// Fetch by slug first, then fall back to id or user_id (handles legacy/UUID links)
async function getAgent(slugOrId: string) {
  const supabase = await createClient()
  const select = `
    *,
    profiles:user_id (full_name, email, avatar_url),
    agent_service_areas (city, is_primary)
  `

  // 1. Try slug (preferred — human-readable URL)
  const { data: bySlug } = await supabase
    .from('agents')
    .select(select)
    .eq('slug', slugOrId)
    .eq('status', 'active')
    .maybeSingle()

  if (bySlug) return bySlug

  // 2. Try agent primary key id (links generated with agent.id)
  const { data: byId } = await supabase
    .from('agents')
    .select(select)
    .eq('id', slugOrId)
    .eq('status', 'active')
    .maybeSingle()

  if (byId) return byId

  // 3. Try user_id (legacy links generated with agent.user_id)
  const { data: byUserId } = await supabase
    .from('agents')
    .select(select)
    .eq('user_id', slugOrId)
    .eq('status', 'active')
    .maybeSingle()

  return byUserId ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const agent = await getAgent(params.slug)
  if (!agent) return { title: 'Agent Not Found | Huts' }
  const profile = agent.profiles as any
  const name = agent.business_name || profile?.full_name || 'Real Estate Professional'
  const type = AGENT_TYPE_LABELS[agent.agent_type as keyof typeof AGENT_TYPE_LABELS] || 'Professional'
  return {
    title: `${name} — ${type} in Zimbabwe | Huts`,
    description: agent.bio
      ? agent.bio.slice(0, 155)
      : `Connect with ${name}, a verified ${type} on Huts Zimbabwe.`,
  }
}

const agentTypeIcons: Record<string, any> = {
  real_estate_agent: Building2,
  property_manager: Home,
  home_builder: Briefcase,
  photographer: Camera,
  other: Award,
}

export default async function PublicAgentProfilePage({ params }: Props) {
  const agent = await getAgent(params.slug)
  if (!agent) notFound()

  const profile = agent.profiles as any
  const serviceAreas = (agent.agent_service_areas as any[]) || []
  const Icon = agentTypeIcons[agent.agent_type] || Award
  const displayName = agent.business_name || profile?.full_name || 'Agent'
  const avatarUrl = agent.profile_image_url || profile?.avatar_url
  const primaryArea = serviceAreas.find((a: any) => a.is_primary)?.city
  const specializations: string[] = agent.specializations || []

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* ── Hero / header ───────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E9ECEF]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-[#F8F9FA] border-2 border-[#E9ECEF] flex-shrink-0">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-[#ADB5BD]">
                  {displayName[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-[#212529]">{displayName}</h1>
                {agent.verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#212529] text-white text-xs font-semibold rounded-full">
                    <CheckCircle size={ICON_SIZES.xs} /> Verified
                  </span>
                )}
                {agent.is_premier && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-400 text-[#212529] text-xs font-bold rounded-full">
                    <Award size={ICON_SIZES.xs} /> Premier
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[#495057] text-sm mb-2">
                <Icon size={ICON_SIZES.sm} />
                <span>{AGENT_TYPE_LABELS[agent.agent_type as keyof typeof AGENT_TYPE_LABELS]}</span>
                {agent.years_experience ? (
                  <>
                    <span className="text-[#E9ECEF]">·</span>
                    <span>{agent.years_experience} yrs experience</span>
                  </>
                ) : null}
              </div>

              {/* Location */}
              {(primaryArea || agent.office_city) && (
                <div className="flex items-center gap-1 text-sm text-[#ADB5BD] mb-3">
                  <MapPin size={ICON_SIZES.xs} />
                  <span>{primaryArea || agent.office_city}</span>
                  {serviceAreas.length > 1 && (
                    <span className="text-[#ADB5BD]">+{serviceAreas.length - 1} areas</span>
                  )}
                </div>
              )}

              {/* Rating */}
              {agent.avg_rating > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={ICON_SIZES.sm}
                        className={
                          i < Math.round(agent.avg_rating)
                            ? 'fill-[#212529] text-[#212529]'
                            : 'text-[#E9ECEF]'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-[#212529]">
                    {Number(agent.avg_rating).toFixed(1)}
                  </span>
                  <span className="text-sm text-[#495057]">
                    ({agent.total_reviews} review{agent.total_reviews !== 1 ? 's' : ''})
                  </span>
                </div>
              )}

              {/* Contact CTAs */}
              <div className="flex flex-wrap gap-2 mt-4">
                {agent.whatsapp && (
                  <a
                    href={`https://wa.me/${agent.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#212529] text-white text-sm font-semibold rounded-xl hover:bg-black transition-colors"
                  >
                    <MessageSquare size={ICON_SIZES.sm} />
                    WhatsApp
                  </a>
                )}
                {agent.phone && !agent.whatsapp && (
                  <a
                    href={`tel:${agent.phone}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#212529] text-white text-sm font-semibold rounded-xl hover:bg-black transition-colors"
                  >
                    <Phone size={ICON_SIZES.sm} />
                    Call
                  </a>
                )}
                {profile?.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#212529] text-[#212529] text-sm font-semibold rounded-xl hover:bg-[#F8F9FA] transition-colors"
                  >
                    <Mail size={ICON_SIZES.sm} />
                    Email
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {agent.bio && (
              <div className="bg-white rounded-xl border border-[#E9ECEF] p-6">
                <h2 className="font-semibold text-[#212529] mb-3">About</h2>
                <p className="text-sm text-[#495057] leading-relaxed whitespace-pre-line">
                  {agent.bio}
                </p>
              </div>
            )}

            {/* Specializations */}
            {specializations.length > 0 && (
              <div className="bg-white rounded-xl border border-[#E9ECEF] p-6">
                <h2 className="font-semibold text-[#212529] mb-3">Specializations</h2>
                <div className="flex flex-wrap gap-2">
                  {specializations.map((s: string) => (
                    <span
                      key={s}
                      className="px-3 py-1 bg-[#F8F9FA] border border-[#E9ECEF] rounded-full text-sm text-[#495057]"
                    >
                      {AGENT_SPECIALIZATION_LABELS[s] || s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            {(agent.properties_listed > 0 || agent.properties_sold > 0) && (
              <div className="bg-white rounded-xl border border-[#E9ECEF] p-6">
                <h2 className="font-semibold text-[#212529] mb-4">Track Record</h2>
                <div className="grid grid-cols-2 gap-4">
                  {agent.properties_listed > 0 && (
                    <div className="bg-[#F8F9FA] rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-[#212529]">{agent.properties_listed}</p>
                      <p className="text-xs text-[#495057] mt-1">Properties Listed</p>
                    </div>
                  )}
                  {agent.properties_sold > 0 && (
                    <div className="bg-[#F8F9FA] rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-[#212529]">{agent.properties_sold}</p>
                      <p className="text-xs text-[#495057] mt-1">Properties Sold</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right column — details sidebar */}
          <div className="space-y-4">
            {/* Professional info */}
            <div className="bg-white rounded-xl border border-[#E9ECEF] p-5">
              <h3 className="text-xs font-semibold text-[#ADB5BD] uppercase tracking-wide mb-3">
                Professional Info
              </h3>
              <dl className="space-y-3 text-sm">
                {agent.license_number && (
                  <div>
                    <dt className="text-[#ADB5BD] text-xs">License #</dt>
                    <dd className="font-medium text-[#212529]">{agent.license_number}</dd>
                  </div>
                )}
                {agent.years_experience && (
                  <div>
                    <dt className="text-[#ADB5BD] text-xs">Experience</dt>
                    <dd className="font-medium text-[#212529]">{agent.years_experience} years</dd>
                  </div>
                )}
                {agent.office_city && (
                  <div>
                    <dt className="text-[#ADB5BD] text-xs">Office</dt>
                    <dd className="font-medium text-[#212529] flex items-center gap-1">
                      <MapPin size={ICON_SIZES.xs} /> {agent.office_city}
                    </dd>
                  </div>
                )}
                {agent.phone && (
                  <div>
                    <dt className="text-[#ADB5BD] text-xs">Phone</dt>
                    <dd className="font-medium text-[#212529]">
                      <a href={`tel:${agent.phone}`} className="hover:underline">
                        {agent.phone}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Service Areas */}
            {serviceAreas.length > 0 && (
              <div className="bg-white rounded-xl border border-[#E9ECEF] p-5">
                <h3 className="text-xs font-semibold text-[#ADB5BD] uppercase tracking-wide mb-3">
                  Service Areas
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {serviceAreas.map((area: any) => (
                    <span
                      key={area.city}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        area.is_primary
                          ? 'bg-[#212529] text-white'
                          : 'bg-[#F8F9FA] text-[#495057] border border-[#E9ECEF]'
                      }`}
                    >
                      {area.city}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA card */}
            <div className="bg-[#212529] rounded-xl p-5 text-white">
              <h3 className="font-semibold mb-1">Ready to work together?</h3>
              <p className="text-sm text-[#ADB5BD] mb-4">
                Reach out directly to get started.
              </p>
              {agent.whatsapp ? (
                <a
                  href={`https://wa.me/${agent.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-[#212529] text-sm font-bold rounded-xl hover:bg-[#F8F9FA] transition-colors"
                >
                  <MessageSquare size={ICON_SIZES.sm} />
                  Message on WhatsApp
                </a>
              ) : agent.phone ? (
                <a
                  href={`tel:${agent.phone}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-[#212529] text-sm font-bold rounded-xl hover:bg-[#F8F9FA] transition-colors"
                >
                  <Phone size={ICON_SIZES.sm} />
                  Call Now
                </a>
              ) : profile?.email ? (
                <a
                  href={`mailto:${profile.email}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-[#212529] text-sm font-bold rounded-xl hover:bg-[#F8F9FA] transition-colors"
                >
                  <Mail size={ICON_SIZES.sm} />
                  Send Email
                </a>
              ) : null}
            </div>

            {/* Back to directory */}
            <Link
              href="/find-agent"
              className="block text-center text-sm text-[#495057] hover:text-[#212529] transition-colors py-2"
            >
              ← Browse all agents
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
