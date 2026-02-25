import Image from 'next/image'
import Link from 'next/link'
import { Building2, Home, Briefcase, Camera, Award, Star, CheckCircle, MapPin } from 'lucide-react'
import { AGENT_TYPE_LABELS, ICON_SIZES } from '@/lib/constants'

interface AgentCardProps {
  agentProfile: {
    id: string
    user_id: string
    agent_type: 'real_estate_agent' | 'property_manager' | 'home_builder' | 'photographer' | 'other'
    business_name: string | null
    profile_image_url: string | null
    bio: string | null
    avg_rating: number
    total_reviews: number
    verified: boolean
    agent_service_areas?: Array<{ city: string; is_primary: boolean }>
  }
  landlordName?: string
  landlordAvatar?: string
}

const agentTypeIcons = {
  real_estate_agent: Building2,
  property_manager: Home,
  home_builder: Briefcase,
  photographer: Camera,
  other: Award,
}

export default function AgentCard({ agentProfile, landlordName, landlordAvatar }: AgentCardProps) {
  const Icon = agentTypeIcons[agentProfile.agent_type]
  const primaryArea = agentProfile.agent_service_areas?.find(a => a.is_primary)?.city
  const displayName = agentProfile.business_name || landlordName || 'Agent'
  const avatarUrl = agentProfile.profile_image_url || landlordAvatar

  return (
    <div className="bg-[#F8F9FA] border-2 border-[#E9ECEF] rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Award size={16} className="text-[#212529]" />
        <h3 className="font-bold text-[#212529]">Professional Agent</h3>
      </div>

      <Link
        href={`/agent/${agentProfile.user_id}`}
        className="group block"
      >
        {/* Agent Info */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-white flex-shrink-0 border-2 border-white group-hover:border-[#212529] transition-colors">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl font-bold text-[#ADB5BD]">
                {displayName[0].toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-[#212529] truncate group-hover:text-[#000000] transition-colors">
              {displayName}
            </h4>
            <div className="flex items-center gap-1 text-xs text-[#495057] mt-1">
              <Icon size={12} />
              {AGENT_TYPE_LABELS[agentProfile.agent_type]}
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {agentProfile.verified && (
            <span className="inline-flex items-center gap-1 bg-white text-[#212529] px-2 py-1 rounded-full text-xs border border-[#212529]">
              <CheckCircle size={10} /> Verified
            </span>
          )}
        </div>

        {/* Rating */}
        {agentProfile.avg_rating > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < Math.round(agentProfile.avg_rating) ? 'fill-[#212529] text-[#212529]' : 'text-[#E9ECEF]'}
                />
              ))}
            </div>
            <span className="text-xs text-[#495057]">
              {agentProfile.avg_rating.toFixed(1)} ({agentProfile.total_reviews} reviews)
            </span>
          </div>
        )}

        {/* Bio Preview */}
        {agentProfile.bio && (
          <p className="text-sm text-[#495057] mb-3 line-clamp-2">
            {agentProfile.bio}
          </p>
        )}

        {/* Service Area */}
        {primaryArea && (
          <div className="flex items-center gap-1 text-xs text-[#ADB5BD] mb-4">
            <MapPin size={12} /> {primaryArea}
            {agentProfile.agent_service_areas && agentProfile.agent_service_areas.length > 1 && 
              ` +${agentProfile.agent_service_areas.length - 1} more`
            }
          </div>
        )}

        {/* View Profile Button */}
        <div className="pt-3 border-t border-[#E9ECEF]">
          <span className="text-sm font-semibold text-[#212529] group-hover:text-[#000000] transition-colors">
            View Agent Profile →
          </span>
        </div>
      </Link>
    </div>
  )
}
