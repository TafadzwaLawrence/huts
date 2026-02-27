import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Search, Star, MapPin, Award, CheckCircle, Filter, 
  Building2, Home, Camera, Briefcase, TrendingUp
} from 'lucide-react'
import { 
  AGENT_TYPE_LABELS, 
  AGENT_SPECIALIZATION_LABELS,
  ACHIEVEMENT_LABELS,
  ICON_SIZES 
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
}

const CITIES = ['Harare', 'Bulawayo', 'Chitungwiza', 'Mutare', 'Gweru', 'Kwekwe', 'Kadoma', 'Masvingo']

export default async function FindAgentPage({ searchParams }: { searchParams: SearchParams }) {
  // Initialize with safe defaults
  let agents: any[] = []
  let totalAgents = 0
  let verifiedCount = 0
  let featuredCount = 0
  let tablesExist = false

  try {
    const supabase = await createClient()
    
    // Quick check if tables exist
    try {
      const { error: checkError } = await supabase
        .from('agent_profiles')
        .select('id')
        .limit(1)
      
      tablesExist = !checkError
    } catch (error) {
      console.log('Agent tables check failed:', error)
      tablesExist = false
    }

    // If tables don't exist, we'll show coming soon page below
    if (!tablesExist) {
      // Tables don't exist, fall through to show coming soon
    } else {
      // Try to query agents
      try {
        // Build query - simplified to avoid join issues
        let query = supabase
          .from('agent_profiles')
          .select('*')
          .eq('status', 'active')

        // Apply filters
        if (searchParams.type) {
          query = query.eq('agent_type', searchParams.type)
        }

        if (searchParams.city) {
          query = query.contains('service_areas', [searchParams.city])
        }

        if (searchParams.specialization) {
          query = query.contains('specializations', [searchParams.specialization])
        }

        if (searchParams.verified === 'true') {
          query = query.eq('verified', true)
        }

        if (searchParams.featured === 'true') {
          query = query.eq('featured', true)
        }

        // Apply sorting
        switch (searchParams.sort) {
          case 'rating':
            query = query.order('avg_rating', { ascending: false, nullsFirst: false })
            break
          case 'reviews':
            query = query.order('total_reviews', { ascending: false })
            break
          case 'experience':
            query = query.order('years_experience', { ascending: false, nullsFirst: false })
            break
          case 'newest':
            query = query.order('created_at', { ascending: false })
            break
          default:
            query = query.order('featured', { ascending: false })
              .order('verified', { ascending: false })
              .order('avg_rating', { ascending: false, nullsFirst: false })
        }

        const { data, error } = await query.limit(50)
        
        if (error) {
          console.error('Error fetching agents:', error)
          agents = []
        } else {
          agents = data || []
        }
        
        totalAgents = agents.length
        verifiedCount = agents.filter((a: any) => a.verified).length
        featuredCount = agents.filter((a: any) => a.featured).length
      } catch (error) {
        console.error('Error in agent query:', error)
        agents = []
      }
    }
  } catch (error) {
    console.error('Error initializing page:', error)
    // Fall through to show coming soon page
    tablesExist = false
  }

  // If tables don't exist, show coming soon page
  if (!tablesExist) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <Building2 size={64} className="mx-auto text-[#ADB5BD] mb-4" />
          <h1 className="text-2xl font-bold text-[#212529] mb-2">Agent Marketplace Coming Soon</h1>
          <p className="text-[#495057] mb-6">
            We're building an amazing marketplace for real estate professionals. Check back soon!
          </p>
          <Link
            href="/"
            className="inline-block bg-[#212529] text-white px-6 py-3 rounded-lg hover:bg-black transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  // Agent type icons
  const agentTypeIcons = {
    real_estate_agent: Building2,
    property_manager: Home,
    home_builder: Briefcase,
    photographer: Camera,
    other: Award,
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-[#F8F9FA] border-b border-[#E9ECEF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-[#212529] mb-4">
              Find a Real Estate Professional
            </h1>
            <p className="text-lg text-[#495057] mb-8">
              Connect with verified agents, property managers, builders, and photographers in Zimbabwe
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 flex-wrap">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#212529]">{totalAgents}</p>
                <p className="text-sm text-[#ADB5BD]">Professionals</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#212529]">{verifiedCount}</p>
                <p className="text-sm text-[#ADB5BD]">Verified</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#212529]">{featuredCount}</p>
                <p className="text-sm text-[#ADB5BD]">Featured</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-6 space-y-6">
              <div className="border border-[#E9ECEF] rounded-2xl p-6">
                <h3 className="font-bold text-[#212529] mb-4 flex items-center gap-2">
                  <Filter size={ICON_SIZES.md} />
                  Filters
                </h3>

                {/* Agent Type Filter */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-[#212529] mb-3">Professional Type</p>
                  <div className="space-y-2">
                    <Link 
                      href="/find-agent"
                      className={`block text-sm ${!searchParams.type ? 'text-[#212529] font-medium' : 'text-[#ADB5BD] hover:text-[#495057]'}`}
                    >
                      All Professionals
                    </Link>
                    {Object.entries(AGENT_TYPE_LABELS).map(([key, label]) => (
                      <Link
                        key={key}
                        href={`/find-agent?type=${key}${searchParams.city ? `&city=${searchParams.city}` : ''}${searchParams.sort ? `&sort=${searchParams.sort}` : ''}`}
                        className={`block text-sm ${searchParams.type === key ? 'text-[#212529] font-medium' : 'text-[#ADB5BD] hover:text-[#495057]'}`}
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* City Filter */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-[#212529] mb-3">Service Area</p>
                  <div className="space-y-2">
                    <Link 
                      href={`/find-agent${searchParams.type ? `?type=${searchParams.type}` : ''}${searchParams.sort ? `${searchParams.type ? '&' : '?'}sort=${searchParams.sort}` : ''}`}
                      className={`block text-sm ${!searchParams.city ? 'text-[#212529] font-medium' : 'text-[#ADB5BD] hover:text-[#495057]'}`}
                    >
                      All Cities
                    </Link>
                    {CITIES.map(city => (
                      <Link
                        key={city}
                        href={`/find-agent?city=${city}${searchParams.type ? `&type=${searchParams.type}` : ''}${searchParams.sort ? `&sort=${searchParams.sort}` : ''}`}
                        className={`block text-sm ${searchParams.city === city ? 'text-[#212529] font-medium' : 'text-[#ADB5BD] hover:text-[#495057]'}`}
                      >
                        {city}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Verified Filter */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-[#212529] mb-3">Verification</p>
                  <Link
                    href={`/find-agent?verified=true${searchParams.type ? `&type=${searchParams.type}` : ''}${searchParams.city ? `&city=${searchParams.city}` : ''}${searchParams.sort ? `&sort=${searchParams.sort}` : ''}`}
                    className={`inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${searchParams.verified === 'true' ? 'bg-[#212529] text-white' : 'bg-[#F8F9FA] text-[#495057] hover:bg-[#E9ECEF]'}`}
                  >
                    <CheckCircle size={14} />
                    Verified Only
                  </Link>
                </div>

                {/* Featured Filter */}
                <div>
                  <Link
                    href={`/find-agent?featured=true${searchParams.type ? `&type=${searchParams.type}` : ''}${searchParams.city ? `&city=${searchParams.city}` : ''}${searchParams.sort ? `&sort=${searchParams.sort}` : ''}`}
                    className={`inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${searchParams.featured === 'true' ? 'bg-[#212529] text-white' : 'bg-[#F8F9FA] text-[#495057] hover:bg-[#E9ECEF]'}`}
                  >
                    <Star size={14} />
                    Featured Only
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Sort Controls */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-[#495057]">
                {totalAgents} professional{totalAgents !== 1 ? 's' : ''} found
              </p>
              <AgentSortDropdown currentSort={searchParams.sort} />
            </div>

            {/* Featured Agents Section */}
            {featuredCount > 0 && !searchParams.featured && (
              <div className="mb-10">
                <h2 className="text-xl font-bold text-[#212529] mb-4 flex items-center gap-2">
                  <Star size={ICON_SIZES.lg} className="fill-[#212529]" />
                  Featured Professionals
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {agents?.filter(a => a.featured).slice(0, 3).map(agent => {
                    const profile = agent.profiles as any
                    const Icon = agentTypeIcons[agent.agent_type as keyof typeof agentTypeIcons]
                    const serviceAreas = (agent.agent_service_areas as any[]) || []
                    const primaryArea = serviceAreas.find(a => a.is_primary)?.city || serviceAreas[0]?.city

                    return (
                      <Link
                        key={agent.id}
                        href={`/agent/${agent.user_id}`}
                        className="border-2 border-[#212529] rounded-2xl p-6 hover:shadow-xl transition-all group bg-[#F8F9FA]"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-white flex-shrink-0">
                            {(agent.profile_image_url || profile?.avatar_url) ? (
                              <Image
                                src={agent.profile_image_url || profile.avatar_url}
                                alt={agent.business_name || profile?.name || ''}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl font-bold text-[#ADB5BD] bg-[#E9ECEF]">
                                {(agent.business_name || profile?.name || 'A')[0].toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-[#212529] truncate group-hover:text-[#000000]">
                              {agent.business_name || profile?.name || 'Agent'}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-[#495057] mt-1">
                              <Icon size={12} />
                              {AGENT_TYPE_LABELS[agent.agent_type as keyof typeof AGENT_TYPE_LABELS]}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <span className="inline-flex items-center gap-1 bg-[#212529] text-white px-2 py-0.5 rounded-full text-xs font-bold">
                            <Star size={10} className="fill-white" /> Featured
                          </span>
                          {agent.verified && (
                            <span className="inline-flex items-center gap-1 bg-white text-[#212529] px-2 py-0.5 rounded-full text-xs border border-[#212529]">
                              <CheckCircle size={10} /> Verified
                            </span>
                          )}
                        </div>

                        {agent.avg_rating > 0 && (
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  className={i < Math.round(agent.avg_rating) ? 'fill-[#212529] text-[#212529]' : 'text-[#E9ECEF]'}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-[#495057]">
                              {agent.avg_rating.toFixed(1)} ({agent.total_reviews} reviews)
                            </span>
                          </div>
                        )}

                        {primaryArea && (
                          <p className="text-xs text-[#ADB5BD] flex items-center gap-1">
                            <MapPin size={12} /> {primaryArea}
                          </p>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* All Agents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents?.filter(a => !a.featured || searchParams.featured).map(agent => {
                const profile = agent.profiles as any
                const Icon = agentTypeIcons[agent.agent_type as keyof typeof agentTypeIcons]
                const serviceAreas = (agent.agent_service_areas as any[]) || []
                const primaryArea = serviceAreas.find(a => a.is_primary)?.city || serviceAreas[0]?.city

                return (
                  <Link
                    key={agent.id}
                    href={`/agent/${agent.user_id}`}
                    className="border border-[#E9ECEF] rounded-2xl p-6 hover:border-[#212529] hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#E9ECEF] flex-shrink-0">
                        {(agent.profile_image_url || profile?.avatar_url) ? (
                          <Image
                            src={agent.profile_image_url || profile.avatar_url}
                            alt={agent.business_name || profile?.name || ''}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl font-bold text-[#ADB5BD]">
                            {(agent.business_name || profile?.name || 'A')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#212529] truncate group-hover:text-[#000000]">
                          {agent.business_name || profile?.name || 'Agent'}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-[#495057] mt-1">
                          <Icon size={12} />
                          {AGENT_TYPE_LABELS[agent.agent_type as keyof typeof AGENT_TYPE_LABELS]}
                        </div>
                      </div>
                    </div>

                    {agent.verified && (
                      <div className="mb-3">
                        <span className="inline-flex items-center gap-1 bg-[#F8F9FA] text-[#212529] px-2 py-1 rounded-full text-xs border border-[#E9ECEF]">
                          <CheckCircle size={10} /> Verified
                        </span>
                      </div>
                    )}

                    {agent.bio && (
                      <p className="text-sm text-[#495057] mb-3 line-clamp-2">
                        {agent.bio}
                      </p>
                    )}

                    {agent.avg_rating > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={i < Math.round(agent.avg_rating) ? 'fill-[#212529] text-[#212529]' : 'text-[#E9ECEF]'}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-[#495057]">
                          {agent.avg_rating.toFixed(1)} ({agent.total_reviews})
                        </span>
                      </div>
                    )}

                    {primaryArea && (
                      <p className="text-xs text-[#ADB5BD] flex items-center gap-1">
                        <MapPin size={12} /> {primaryArea}
                        {serviceAreas.length > 1 && ` +${serviceAreas.length - 1} more`}
                      </p>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Empty State */}
            {!agents || agents.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#F8F9FA] flex items-center justify-center">
                  <Search size={32} className="text-[#ADB5BD]" />
                </div>
                <h3 className="text-xl font-bold text-[#212529] mb-2">No professionals found</h3>
                <p className="text-[#495057] mb-6">Try adjusting your filters or browse all professionals</p>
                <Link
                  href="/find-agent"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#212529] text-white rounded-xl hover:bg-[#000000] transition-colors font-medium"
                >
                  View All Professionals
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
