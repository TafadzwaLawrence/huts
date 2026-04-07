import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import {
  Search, Star, MapPin, Award, CheckCircle,
  Building2, Home, Camera, Briefcase, ChevronRight
} from 'lucide-react'
import {
  AGENT_TYPE_LABELS,
  ZIMBABWE_CITIES
} from '@/lib/constants'
import { AgentSortDropdown } from '@/components/agent/AgentSortDropdown'

export const metadata: Metadata = {
  title: 'Find a Real Estate Professional in Zimbabwe | Huts',
  description: 'Connect with verified real estate agents, property managers, home builders, and photographers in Zimbabwe. Browse profiles, read reviews, and find the right professional for your needs.',
}

interface SearchParams {
  type?: string
  city?: string
  specialization?: string
  verified?: string
  featured?: string
  sort?: string
  q?: string
  page?: string
}

export default async function FindAgentPage({ searchParams }: { searchParams: SearchParams }) {
  let agents: any[] = []
  let totalAgents = 0
  let tablesExist = false
  const PAGE_SIZE = 20
  const page = Math.max(1, Number(searchParams.page) || 1)
  const offset = (page - 1) * PAGE_SIZE

  try {
    const supabase = await createClient()

    try {
      const { error: checkError } = await supabase.from('agent_profiles').select('id').limit(1)
      tablesExist = !checkError
    } catch {
      tablesExist = false
    }

    if (tablesExist) {
      try {
        const { count } = await supabase
          .from('agent_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')
        totalAgents = count || 0

        let query = supabase.from('agent_profiles').select('*').eq('status', 'active')

        if (searchParams.q) query = query.ilike('business_name', `%${searchParams.q}%`)
        if (searchParams.type) query = query.eq('agent_type', searchParams.type)

        if (searchParams.city) {
          const { data: agentIdsForCity } = await supabase
            .from('agent_service_areas')
            .select('agent_id')
            .eq('city', searchParams.city)
          const ids = (agentIdsForCity || []).map((r: any) => r.agent_id)
          if (ids.length > 0) {
            query = query.in('id', ids)
          } else {
            agents = []
            tablesExist = true
            return
          }
        }

        if (searchParams.verified === 'true') query = query.eq('verified', true)
        if (searchParams.featured === 'true') query = query.eq('featured', true)

        switch (searchParams.sort) {
          case 'rating':     query = query.order('avg_rating',       { ascending: false, nullsFirst: false }); break
          case 'reviews':    query = query.order('total_reviews',    { ascending: false }); break
          case 'experience': query = query.order('years_experience', { ascending: false, nullsFirst: false }); break
          case 'newest':     query = query.order('created_at',       { ascending: false }); break
          default:
            query = query
              .order('featured', { ascending: false })
              .order('verified', { ascending: false })
              .order('avg_rating', { ascending: false, nullsFirst: false })
        }

        const { data, error } = await query.range(offset, offset + PAGE_SIZE - 1)
        if (error) { console.error('Error fetching agents:', error); agents = [] }
        else agents = data || []
      } catch (error) {
        console.error('Error in agent query:', error)
        agents = []
      }
    }
  } catch (error) {
    console.error('Error initializing page:', error)
    tablesExist = false
  }

  if (!tablesExist) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <Building2 size={36} className="mx-auto text-[#ADB5BD] mb-4" />
          <h1 className="text-xl font-bold text-[#212529] mb-2">Agent marketplace coming soon</h1>
          <p className="text-sm text-[#495057] mb-6">We're building an amazing marketplace for real estate professionals.</p>
          <Link href="/" className="inline-block bg-[#212529] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-black transition-colors focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-1">
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  const agentTypeIcons: Record<string, any> = {
    real_estate_agent: Building2,
    property_manager: Home,
    home_builder: Briefcase,
    photographer: Camera,
    other: Award,
  }

  function qs(overrides: Record<string, string | undefined>) {
    const base: Record<string, string> = {}
    if (searchParams.type)     base.type     = searchParams.type
    if (searchParams.city)     base.city     = searchParams.city
    if (searchParams.sort)     base.sort     = searchParams.sort
    if (searchParams.q)        base.q        = searchParams.q
    if (searchParams.verified) base.verified = searchParams.verified
    if (searchParams.featured) base.featured = searchParams.featured
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === undefined || v === '') delete base[k]
      else base[k] = v
    })
    const s = new URLSearchParams(base).toString()
    return s ? `/find-agent?${s}` : '/find-agent'
  }

  const activeFilters: string[] = []
  if (searchParams.type)              activeFilters.push(AGENT_TYPE_LABELS[searchParams.type as keyof typeof AGENT_TYPE_LABELS] ?? searchParams.type)
  if (searchParams.city)              activeFilters.push(searchParams.city)
  if (searchParams.verified === 'true') activeFilters.push('Verified')
  if (searchParams.featured === 'true') activeFilters.push('Featured')

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E9ECEF]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#ADB5BD] mb-6">
            <Link href="/" className="hover:text-[#495057] transition-colors focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-1 rounded">Home</Link>
            <ChevronRight size={11} />
            <span className="text-[#495057]">Find an Agent</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-[#212529] mb-1">Find a real estate professional</h1>
          <p className="text-sm text-[#495057]">Verified agents, property managers, builders, and photographers in Zimbabwe</p>
        </div>
      </div>

{/* Filter bar - enhanced */}
<div className="border-b border-[#E9ECEF] bg-white sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
  <form method="GET" action="/find-agent">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 min-w-[180px] max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ADB5BD] pointer-events-none" />
        <input
          type="text"
          name="q"
          defaultValue={searchParams.q || ''}
          placeholder="Search by name…"
          className="w-full pl-9 pr-3 py-2 text-sm border border-[#E9ECEF] rounded-lg bg-white text-[#212529] placeholder:text-[#ADB5BD] focus:border-[#212529] focus:ring-1 focus:ring-[#212529] outline-none transition-all duration-200"
        />
      </div>

      {/* Type - custom styled select */}
      <div className="relative">
        <select
          name="type"
          defaultValue={searchParams.type || ''}
          className="appearance-none w-full py-2 pl-3 pr-7 text-sm border border-[#E9ECEF] rounded-lg bg-white text-[#212529] focus:border-[#212529] focus:ring-1 focus:ring-[#212529] outline-none transition-all duration-200 cursor-pointer hover:border-[#ADB5BD]"
        >
          <option value="">All types</option>
          {Object.entries(AGENT_TYPE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <ChevronRight size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ADB5BD] rotate-90 pointer-events-none transition-transform duration-200" />
      </div>

      {/* City - custom styled select */}
      <div className="relative">
        <select
          name="city"
          defaultValue={searchParams.city || ''}
          className="appearance-none w-full py-2 pl-3 pr-7 text-sm border border-[#E9ECEF] rounded-lg bg-white text-[#212529] focus:border-[#212529] focus:ring-1 focus:ring-[#212529] outline-none transition-all duration-200 cursor-pointer hover:border-[#ADB5BD]"
        >
          <option value="">All cities</option>
          {ZIMBABWE_CITIES.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        <ChevronRight size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ADB5BD] rotate-90 pointer-events-none transition-transform duration-200" />
      </div>

      {/* Verified toggle - enhanced */}
      <label className="flex items-center gap-1.5 px-3 py-2 text-sm border border-[#E9ECEF] rounded-lg bg-white cursor-pointer hover:border-[#212529] transition-all duration-200 select-none focus-within:ring-2 focus-within:ring-[#212529] focus-within:ring-offset-1">
        <input
          type="checkbox"
          name="verified"
          value="true"
          defaultChecked={searchParams.verified === 'true'}
          className="rounded border-[#ADB5BD] text-[#212529] focus:ring-[#212529] w-3.5 h-3.5"
        />
        <CheckCircle size={12} className="text-[#495057]" />
        Verified
      </label>

      {/* Preserve sort */}
      {searchParams.sort && <input type="hidden" name="sort" value={searchParams.sort} />}

      {/* Submit button */}
      <button
        type="submit"
        className="px-4 py-2 bg-[#212529] text-white text-sm font-semibold rounded-lg hover:bg-black transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-1 shadow-sm"
      >
        Filter
      </button>

      {/* Clear all link */}
      {activeFilters.length > 0 && (
        <Link
          href="/find-agent"
          className="text-xs text-[#ADB5BD] hover:text-[#495057] transition-colors focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-1 rounded px-2 py-1"
        >
          Clear all
        </Link>
      )}
    </div>
  </form>
</div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Count + sort row */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <p className="text-sm text-[#495057]">
            <span className="font-semibold text-[#212529]">{agents.length === PAGE_SIZE ? `${PAGE_SIZE}+` : agents.length}</span> professional{agents.length !== 1 ? 's' : ''}
            {activeFilters.length > 0 && (
              <span className="text-[#ADB5BD]"> · {activeFilters.join(' · ')}</span>
            )}
          </p>
          <AgentSortDropdown currentSort={searchParams.sort} />
        </div>

        {agents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {agents.map(agent => {
              const profile = agent.profiles as any
              const Icon = agentTypeIcons[agent.agent_type] ?? Award
              const serviceAreas = (agent.agent_service_areas as any[]) || []
              const primaryArea = serviceAreas.find((a: any) => a.is_primary)?.city || serviceAreas[0]?.city
              const displayName = agent.business_name || profile?.full_name || 'Agent'
              const avatarUrl = agent.profile_image_url || profile?.avatar_url
              const href = agent.slug ? `/agent/${agent.slug}` : `/agent/${agent.id}`

              return (
                <Link
                  key={agent.id}
                  href={href}
                  className="group bg-white border border-[#E9ECEF] rounded-lg p-5 hover:border-[#212529] hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-1"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F8F9FA] flex-shrink-0 border border-[#E9ECEF]">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt={displayName}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-base font-bold text-[#ADB5BD]">
                          {displayName[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="font-semibold text-sm text-[#212529] truncate leading-tight">
                          {displayName}
                        </h3>
                        {agent.featured && (
                          <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider bg-[#212529] text-white px-1.5 py-0.5 rounded">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#ADB5BD] mt-0.5">
                        <Icon size={12} />
                        <span>{AGENT_TYPE_LABELS[agent.agent_type as keyof typeof AGENT_TYPE_LABELS]}</span>
                      </div>
                    </div>
                  </div>

                  {agent.bio && (
                    <p className="text-xs text-[#495057] line-clamp-2 mb-3 leading-relaxed">{agent.bio}</p>
                  )}

                  <div className="flex items-center justify-between text-xs text-[#ADB5BD]">
                    <div className="flex items-center gap-2">
                      {agent.avg_rating > 0 && (
                        <span className="flex items-center gap-0.5 text-[#212529]">
                          <Star size={12} className="fill-[#212529]" />
                          <span>{agent.avg_rating.toFixed(1)}</span>
                          <span className="text-[#ADB5BD] ml-0.5">({agent.total_reviews})</span>
                        </span>
                      )}
                      {primaryArea && (
                        <span className="flex items-center gap-0.5">
                          <MapPin size={12} />
                          <span>{primaryArea}</span>
                          {serviceAreas.length > 1 && ` +${serviceAreas.length - 1}`}
                        </span>
                      )}
                    </div>
                    {agent.verified && (
                      <span className="flex items-center gap-0.5 text-[#495057]">
                        <CheckCircle size={12} /> Verified
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="border border-dashed border-[#E9ECEF] rounded-lg p-12 text-center bg-white shadow-sm">
            <Search size={28} className="mx-auto text-[#ADB5BD] mb-4" />
            <h3 className="text-base font-semibold text-[#212529] mb-2">No professionals found</h3>
            <p className="text-sm text-[#495057] mb-6">Try adjusting your filters or clearing the search.</p>
            <Link href="/find-agent" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[#212529] px-5 py-2.5 rounded-lg hover:bg-black transition-colors focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-1">
              View all professionals
            </Link>
          </div>
        )}

        {/* Pagination */}
        {agents.length > 0 && (
          <div className="flex items-center justify-between pt-8 mt-8 border-t border-[#E9ECEF]">
            <span className="text-xs text-[#ADB5BD]">Page {page}</span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={qs({ page: String(page - 1) })}
                  className="px-3 py-1.5 border border-[#E9ECEF] rounded-lg text-xs font-medium text-[#495057] hover:border-[#212529] hover:text-[#212529] transition-colors focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-1"
                >
                  ← Previous
                </Link>
              )}
              {agents.length === PAGE_SIZE && (
                <Link
                  href={qs({ page: String(page + 1) })}
                  className="px-3 py-1.5 bg-[#212529] text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-1"
                >
                  Next →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}