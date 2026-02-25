import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Star, MapPin, Phone, Mail, MessageSquare, Bed, Bath, Maximize, Clock,
  Award, Briefcase, CheckCircle, Languages, Building2, TrendingUp, Users,
  Calendar, Home, Camera
} from 'lucide-react'
import { formatPrice, formatSalePrice } from '@/lib/utils'
import { 
  AGENT_TYPE_LABELS, 
  AGENT_SPECIALIZATION_LABELS, 
  ACHIEVEMENT_LABELS,
  ICON_SIZES 
} from '@/lib/constants'
import AgentContactForm from '@/components/agent/AgentContactForm'

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient()
  
  // Try to get agent profile first
  const { data: agentProfile } = await supabase
    .from('agent_profiles')
    .select('business_name, bio, agent_type, office_city, slug')
    .eq('user_id', params.id)
    .single()

  // Fallback to regular profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', params.id)
    .single()

  const name = agentProfile?.business_name || profile?.name
  const type = agentProfile?.agent_type ? AGENT_TYPE_LABELS[agentProfile.agent_type as keyof typeof AGENT_TYPE_LABELS] : 'Agent'
  const city = agentProfile?.office_city

  return {
    title: name ? `${name} - ${type}${city ? ` in ${city}` : ''} | Huts` : 'Agent Profile',
    description: agentProfile?.bio?.substring(0, 155) || `View listings and reviews for ${name || 'this agent'} on Huts.`,
  }
}

export default async function AgentProfilePage({ params }: Props) {
  const supabase = await createClient()

  // Fetch basic profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, role, phone, email, created_at')
    .eq('id', params.id)
    .single()

  if (error || !profile) notFound()

  // Fetch agent profile if exists
  const { data: agentProfile } = await supabase
    .from('agent_profiles')
    .select(`
      *,
      agent_service_areas(*),
      agent_achievements(*)
    `)
    .eq('user_id', params.id)
    .single()

  // Fetch properties
  const { data: properties } = await supabase
    .from('properties')
    .select(`
      id, title, slug, price, sale_price, listing_type, beds, baths, sqft,
      city, neighborhood, status, created_at,
      property_images(url, is_primary)
    `)
    .eq('user_id', params.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(12)

  // Fetch agent reviews if agent profile exists
  let agentReviews = null
  let agentAvgRating = 0
  if (agentProfile) {
    const { data } = await supabase
      .from('agent_reviews')
      .select(`
        *,
        reviewer:profiles!agent_reviews_reviewer_id_fkey(name, avatar_url)
      `)
      .eq('agent_id', agentProfile.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(20)
    
    agentReviews = data
    agentAvgRating = agentProfile.avg_rating || 0
  }

  // Fallback to property reviews if no agent profile
  let propertyReviews = null
  let propertyAvgRating = 0
  if (!agentProfile && properties && properties.length > 0) {
    const { data } = await supabase
      .from('reviews')
      .select(`
        id, rating, comment_text, created_at,
        author:profiles!reviews_author_id_fkey(name, avatar_url)
      `)
      .in('property_id', properties.map(p => p.id))
      .order('created_at', { ascending: false })
      .limit(10)
    
    propertyReviews = data
    propertyAvgRating = propertyReviews && propertyReviews.length > 0
      ? propertyReviews.reduce((sum, r) => sum + r.rating, 0) / propertyReviews.length
      : 0
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  })

  const activeListings = properties?.length || 0
  const isAgent = !!agentProfile

  // Agent type icon
  const agentTypeIcons = {
    real_estate_agent: Building2,
    property_manager: Home,
    home_builder: Briefcase,
    photographer: Camera,
    other: Award,
  }
  const AgentTypeIcon = agentProfile?.agent_type 
    ? agentTypeIcons[agentProfile.agent_type as keyof typeof agentTypeIcons] 
    : Building2

  return (
    <div className="min-h-screen bg-white">
      {/* Cover Image + Header */}
      <section className="relative">
        {/* Cover Image */}
        {agentProfile?.cover_image_url && (
          <div className="h-48 md:h-64 w-full relative bg-[#F8F9FA]">
            <Image
              src={agentProfile.cover_image_url}
              alt="Cover"
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        
        {/* Profile Info */}
        <div className={`bg-[#F8F9FA] border-b border-[#E9ECEF] ${agentProfile?.cover_image_url ? '-mt-16 relative z-10' : ''}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <div className={`w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-white flex-shrink-0 ${agentProfile?.cover_image_url ? 'border-4 border-white shadow-lg' : 'bg-[#E9ECEF]'}`}>
                {(agentProfile?.profile_image_url || profile.avatar_url) ? (
                  <Image
                    src={agentProfile?.profile_image_url || profile.avatar_url!}
                    alt={agentProfile?.business_name || profile.name || 'Agent'}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[#ADB5BD] bg-[#E9ECEF]">
                    {(agentProfile?.business_name || profile.name || 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#212529] mb-2">
                      {agentProfile?.business_name || profile.name || 'Agent'}
                    </h1>
                    {agentProfile && (
                      <div className="flex items-center gap-2 mb-2">
                        <AgentTypeIcon size={ICON_SIZES.sm} className="text-[#495057]" />
                        <span className="text-[#495057] text-sm">
                          {AGENT_TYPE_LABELS[agentProfile.agent_type as keyof typeof AGENT_TYPE_LABELS]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-[#495057] mb-4 flex-wrap">
                  {isAgent && (
                    <>
                      {agentProfile.verified && (
                        <span className="inline-flex items-center gap-1 bg-[#212529] text-white px-3 py-1 rounded-full text-xs font-medium">
                          <CheckCircle size={12} /> Verified Agent
                        </span>
                      )}
                      {agentProfile.featured && (
                        <span className="inline-flex items-center gap-1 bg-[#F8F9FA] border border-[#212529] text-[#212529] px-3 py-1 rounded-full text-xs font-bold">
                          <Star size={12} className="fill-[#212529]" /> Featured
                        </span>
                      )}
                    </>
                  )}
                  
                  {(agentAvgRating > 0 || propertyAvgRating > 0) && (
                    <span className="flex items-center gap-1">
                      <Star size={14} className="fill-[#212529] text-[#212529]" />
                      {isAgent 
                        ? `${agentAvgRating.toFixed(1)} (${agentProfile?.total_reviews || 0} reviews)`
                        : `${propertyAvgRating.toFixed(1)} (${propertyReviews?.length || 0} reviews)`
                      }
                    </span>
                  )}
                  
                  {agentProfile?.years_experience && agentProfile.years_experience > 0 && (
                    <span className="flex items-center gap-1">
                      <Briefcase size={14} /> {agentProfile.years_experience} years experience
                    </span>
                  )}
                  
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> Member since {memberSince}
                  </span>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#212529]">{activeListings}</p>
                    <p className="text-xs text-[#ADB5BD]">Active Listings</p>
                  </div>
                  
                  {isAgent && agentProfile.properties_sold > 0 && (
                    <div className="text-center">
                      <p className="text-xl font-bold text-[#212529]">{agentProfile.properties_sold}</p>
                      <p className="text-xs text-[#ADB5BD]">Properties Sold</p>
                    </div>
                  )}
                  
                  {isAgent && agentProfile.response_rate && (
                    <div className="text-center">
                      <p className="text-xl font-bold text-[#212529]">{agentProfile.response_rate}%</p>
                      <p className="text-xs text-[#ADB5BD]">Response Rate</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* About Section */}
            {agentProfile?.bio && (
              <section>
                <h2 className="text-xl font-bold text-[#212529] mb-4">About</h2>
                <p className="text-[#495057] leading-relaxed whitespace-pre-wrap">{agentProfile.bio}</p>
              </section>
            )}

            {/* Specializations */}
            {agentProfile?.specializations && agentProfile.specializations.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-[#212529] mb-4">Specializations</h2>
                <div className="flex flex-wrap gap-2">
                  {agentProfile.specializations.map((spec: string) => (
                    <span
                      key={spec}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[#F8F9FA] text-[#212529] text-sm rounded-full border border-[#E9ECEF]"
                    >
                      <Award size={12} />
                      {AGENT_SPECIALIZATION_LABELS[spec] || spec}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Achievements */}
            {agentProfile?.agent_achievements && agentProfile.agent_achievements.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-[#212529] mb-4">Achievements & Badges</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {agentProfile.agent_achievements.map((achievement: any) => {
                    const achievementData = ACHIEVEMENT_LABELS[achievement.achievement_type]
                    if (!achievementData) return null
                    
                    return (
                      <div key={achievement.id} className="flex items-start gap-3 p-3 bg-[#F8F9FA] rounded-xl border border-[#E9ECEF]">
                        <div className="w-10 h-10 rounded-full bg-[#212529] flex items-center justify-center flex-shrink-0">
                          <Award size={18} className="text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#212529] text-sm">{achievementData.title}</p>
                          <p className="text-xs text-[#ADB5BD]">{achievementData.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Active Listings */}
            {properties && properties.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-[#212529] mb-6">Active Listings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {properties.map((prop) => {
                    const imgs = (prop.property_images as Array<{ url: string; is_primary: boolean }>) || []
                    const primary = imgs.find(i => i.is_primary) || imgs[0]
                    const isSale = prop.listing_type === 'sale'

                    return (
                      <Link
                        key={prop.id}
                        href={`/property/${prop.slug}`}
                        className="border border-[#E9ECEF] rounded-xl overflow-hidden hover:border-[#212529] transition-colors group"
                      >
                        <div className="h-44 bg-[#E9ECEF] relative overflow-hidden">
                          {primary?.url && (
                            <Image
                              src={primary.url}
                              alt={prop.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          )}
                          <div className="absolute top-2 left-2 bg-black/80 text-white px-2 py-0.5 rounded text-xs font-bold">
                            {isSale ? formatSalePrice(prop.sale_price ?? 0) : formatPrice(prop.price ?? 0)}
                            {!isSale && <span className="font-normal">/mo</span>}
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="text-sm font-semibold text-[#212529] truncate mb-1">{prop.title}</h3>
                          <p className="text-xs text-[#ADB5BD] flex items-center gap-1 mb-2">
                            <MapPin size={10} /> {prop.neighborhood || prop.city}
                          </p>
                          <div className="flex gap-3 text-xs text-[#495057]">
                            <span className="flex items-center gap-1"><Bed size={12} /> {prop.beds}</span>
                            <span className="flex items-center gap-1"><Bath size={12} /> {prop.baths}</span>
                            {prop.sqft && <span className="flex items-center gap-1"><Maximize size={12} /> {prop.sqft.toLocaleString()}</span>}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Reviews */}
            {((agentReviews && agentReviews.length > 0) || (propertyReviews && propertyReviews.length > 0)) && (
              <section>
                <h2 className="text-xl font-bold text-[#212529] mb-6">
                  {isAgent ? 'Client Reviews' : 'Reviews'} ({isAgent ? agentReviews?.length : propertyReviews?.length})
                </h2>
                <div className="space-y-4">
                  {isAgent ? (
                    // Agent Reviews
                    agentReviews?.map((review: any) => (
                      <div key={review.id} className="border border-[#E9ECEF] rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-[#E9ECEF] overflow-hidden flex-shrink-0">
                            {review.reviewer?.avatar_url ? (
                              <Image src={review.reviewer.avatar_url} alt="" width={40} height={40} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[#ADB5BD]">
                                {(review.reviewer?.name || 'U')[0]}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-[#212529]">{review.reviewer?.name || 'User'}</p>
                              {review.relationship_type && (
                                <span className="text-xs text-[#ADB5BD] bg-[#F8F9FA] px-2 py-1 rounded-full capitalize">
                                  {review.relationship_type}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    size={12}
                                    className={i < review.rating ? 'fill-[#212529] text-[#212529]' : 'text-[#E9ECEF]'}
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] text-[#ADB5BD]">
                                {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              {review.verified && (
                                <span className="text-[10px] text-[#51CF66] flex items-center gap-1">
                                  <CheckCircle size={10} /> Verified
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {review.review_text && (
                          <p className="text-sm text-[#495057] leading-relaxed mb-3">{review.review_text}</p>
                        )}
                        
                        {/* Category Ratings */}
                        {(review.professionalism_rating || review.communication_rating || review.knowledge_rating || review.responsiveness_rating) && (
                          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#E9ECEF]">
                            {review.professionalism_rating && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[#ADB5BD]">Professionalism</span>
                                <span className="font-medium text-[#212529]">{review.professionalism_rating}/5</span>
                              </div>
                            )}
                            {review.communication_rating && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[#ADB5BD]">Communication</span>
                                <span className="font-medium text-[#212529]">{review.communication_rating}/5</span>
                              </div>
                            )}
                            {review.knowledge_rating && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[#ADB5BD]">Knowledge</span>
                                <span className="font-medium text-[#212529]">{review.knowledge_rating}/5</span>
                              </div>
                            )}
                            {review.responsiveness_rating && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[#ADB5BD]">Responsiveness</span>
                                <span className="font-medium text-[#212529]">{review.responsiveness_rating}/5</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Agent Response */}
                        {review.agent_response && (
                          <div className="mt-4 p-3 bg-[#F8F9FA] rounded-lg">
                            <p className="text-xs font-medium text-[#212529] mb-1">Response from agent:</p>
                            <p className="text-xs text-[#495057]">{review.agent_response}</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    // Property Reviews (fallback)
                    propertyReviews?.map((review: any) => {
                      const author = review.author as { name: string; avatar_url: string | null }
                      return (
                        <div key={review.id} className="border border-[#E9ECEF] rounded-xl p-5">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-full bg-[#E9ECEF] overflow-hidden flex-shrink-0">
                              {author?.avatar_url ? (
                                <Image src={author.avatar_url} alt="" width={36} height={36} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#ADB5BD]">
                                  {(author?.name || 'U')[0]}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#212529]">{author?.name || 'User'}</p>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    size={12}
                                    className={i < review.rating ? 'fill-[#212529] text-[#212529]' : 'text-[#E9ECEF]'}
                                  />
                                ))}
                                <span className="text-[10px] text-[#ADB5BD] ml-1">
                                  {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-[#495057] leading-relaxed">{review.comment_text}</p>
                        </div>
                      )
                    })
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            {isAgent && (
              <div className="border border-[#E9ECEF] rounded-2xl p-6 sticky top-6">
                <h3 className="text-lg font-bold text-[#212529] mb-4">Contact Agent</h3>
                
                <div className="space-y-3 mb-6">
                  {agentProfile.phone && (
                    <a 
                      href={`tel:${agentProfile.phone}`}
                      className="flex items-center gap-3 p-3 bg-[#F8F9FA] rounded-xl hover:bg-[#E9ECEF] transition-colors"
                    >
                      <Phone size={ICON_SIZES.md} className="text-[#495057]" />
                      <span className="text-sm font-medium text-[#212529]">{agentProfile.phone}</span>
                    </a>
                  )}
                  
                  {agentProfile.whatsapp && (
                    <a 
                      href={`https://wa.me/${agentProfile.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-[#F8F9FA] rounded-xl hover:bg-[#E9ECEF] transition-colors"
                    >
                      <MessageSquare size={ICON_SIZES.md} className="text-[#495057]" />
                      <span className="text-sm font-medium text-[#212529]">WhatsApp</span>
                    </a>
                  )}
                  
                  {profile.email && (
                    <a 
                      href={`mailto:${profile.email}`}
                      className="flex items-center gap-3 p-3 bg-[#F8F9FA] rounded-xl hover:bg-[#E9ECEF] transition-colors"
                    >
                      <Mail size={ICON_SIZES.md} className="text-[#495057]" />
                      <span className="text-sm font-medium text-[#212529]">Email</span>
                    </a>
                  )}
                </div>

                <AgentContactForm agentId={agentProfile.id} agentName={agentProfile.business_name || profile.name || 'Agent'} />
              </div>
            )}

            {/* Service Areas */}
            {agentProfile?.agent_service_areas && agentProfile.agent_service_areas.length > 0 && (
              <div className="border border-[#E9ECEF] rounded-2xl p-6">
                <h3 className="text-lg font-bold text-[#212529] mb-4 flex items-center gap-2">
                  <MapPin size={ICON_SIZES.md} />
                  Service Areas
                </h3>
                <div className="space-y-2">
                  {agentProfile.agent_service_areas.map((area: any) => (
                    <div 
                      key={area.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-[#495057]">{area.city}</span>
                      {area.is_primary && (
                        <span className="text-xs bg-[#212529] text-white px-2 py-0.5 rounded-full">Primary</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {agentProfile?.languages && agentProfile.languages.length > 0 && (
              <div className="border border-[#E9ECEF] rounded-2xl p-6">
                <h3 className="text-lg font-bold text-[#212529] mb-4 flex items-center gap-2">
                  <Languages size={ICON_SIZES.md} />
                  Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {agentProfile.languages.map((lang: string) => (
                    <span
                      key={lang}
                      className="px-3 py-1 bg-[#F8F9FA] text-[#495057] text-sm rounded-full border border-[#E9ECEF]"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {agentProfile?.certifications && agentProfile.certifications.length > 0 && (
              <div className="border border-[#E9ECEF] rounded-2xl p-6">
                <h3 className="text-lg font-bold text-[#212529] mb-4 flex items-center gap-2">
                  <Award size={ICON_SIZES.md} />
                  Certifications
                </h3>
                <ul className="space-y-2">
                  {agentProfile.certifications.map((cert: string, idx: number) => (
                    <li key={idx} className="text-sm text-[#495057] flex items-start gap-2">
                      <CheckCircle size={14} className="text-[#51CF66] mt-0.5 flex-shrink-0" />
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
