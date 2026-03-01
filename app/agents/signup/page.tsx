'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Building2, 
  Home, 
  Camera, 
  Briefcase, 
  ChevronRight, 
  ChevronLeft, 
  Check,
  User,
  Phone,
  MapPin,
  FileText,
  Award,
  Sparkles,
  Users,
  Eye,
  MessageSquare,
  TrendingUp,
  Shield,
  Star
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  AGENT_TYPES,
  AGENT_TYPE_LABELS,
  AGENT_SPECIALIZATIONS,
  AGENT_SPECIALIZATION_LABELS,
  LANGUAGES,
  ICON_SIZES
} from '@/lib/constants'

type AgentType = 'real_estate_agent' | 'property_manager' | 'home_builder' | 'photographer' | 'other'

interface FormData {
  // Step 1: Agent Type
  agent_type: AgentType | ''
  
  // Step 2: Basic Info
  business_name: string
  phone: string
  whatsapp: string
  office_address: string
  office_city: string
  
  // Step 3: Professional Details
  license_number: string
  license_state: string
  years_experience: number
  certifications: string[]
  
  // Step 4: Service Areas
  service_areas: string[]
  primary_service_area: string
  
  // Step 5: Profile Content
  bio: string
  specializations: string[]
  languages: string[]
}

const CITIES = ['Harare', 'Bulawayo', 'Chitungwiza', 'Mutare', 'Gweru', 'Kwekwe', 'Kadoma', 'Masvingo', 'Chinhoyi', 'Norton', 'Marondera', 'Ruwa', 'Chegutu', 'Bindura', 'Beitbridge', 'Redcliff', 'Victoria Falls', 'Hwange', 'Chiredzi', 'Kariba']

const BENEFITS = [
  {
    icon: Eye,
    title: 'Get discovered',
    description: 'Appear in search results when buyers and renters look for agents in your area.',
  },
  {
    icon: MessageSquare,
    title: 'Connect with clients',
    description: 'Receive direct inquiries from motivated buyers and renters actively searching.',
  },
  {
    icon: TrendingUp,
    title: 'Grow your business',
    description: 'Build your reputation with reviews, showcase your listings, and track your performance.',
  },
]

interface PlatformStats {
  listings: number | null
  cities: number | null
  agents: number | null
}

export default function AgentSignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showForm, setShowForm] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<PlatformStats>({ listings: null, cities: null, agents: null })

  // Fetch real platform stats once on mount
  useEffect(() => {
    ;(async () => {
      try {
        const [listingsRes, propertiesRes, agentsRes] = await Promise.allSettled([
          supabase
            .from('properties')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'active')
            .eq('verification_status', 'approved'),
          supabase
            .from('properties')
            .select('city')
            .eq('status', 'active')
            .eq('verification_status', 'approved'),
          supabase
            .from('agent_profiles')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'active'),
        ])

        const listingCount =
          listingsRes.status === 'fulfilled' ? (listingsRes.value.count ?? null) : null

        let cityCount: number | null = null
        if (propertiesRes.status === 'fulfilled' && propertiesRes.value.data) {
          const unique = new Set(propertiesRes.value.data.map((p: any) => p.city).filter(Boolean))
          cityCount = unique.size
        }

        const agentCount =
          agentsRes.status === 'fulfilled' ? (agentsRes.value.count ?? null) : null

        setStats({ listings: listingCount, cities: cityCount, agents: agentCount })
      } catch (e) {
        console.error('Stats fetch error:', e)
      }
    })()
  }, [])
  const [formData, setFormData] = useState<FormData>({
    agent_type: '',
    business_name: '',
    phone: '',
    whatsapp: '',
    office_address: '',
    office_city: '',
    license_number: '',
    license_state: 'Zimbabwe',
    years_experience: 0,
    certifications: [],
    service_areas: [],
    primary_service_area: '',
    bio: '',
    specializations: [],
    languages: ['English'],
  })

  const totalSteps = 5

  const handleNext = () => {
    if (currentStep === 1 && !formData.agent_type) {
      toast.error('Please select an agent type')
      return
    }
    if (currentStep === 2) {
      if (!formData.phone || !formData.office_city) {
        toast.error('Please fill in all required fields')
        return
      }
    }
    if (currentStep === 4 && formData.service_areas.length === 0) {
      toast.error('Please select at least one service area')
      return
    }
    if (currentStep === 5 && !formData.bio) {
      toast.error('Please write a brief bio')
      return
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to continue')
        router.push('/auth/signup')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single()

      const slugBase = (formData.business_name || profile?.name || 'agent').toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      const { data: agentProfile, error: profileError } = await supabase
        .from('agent_profiles')
        .insert({
          user_id: user.id,
          agent_type: formData.agent_type,
          business_name: formData.business_name || null,
          phone: formData.phone,
          whatsapp: formData.whatsapp || null,
          office_address: formData.office_address || null,
          office_city: formData.office_city,
          license_number: formData.license_number || null,
          license_state: formData.license_state || null,
          years_experience: formData.years_experience || 0,
          certifications: formData.certifications.length > 0 ? formData.certifications : null,
          service_areas: formData.service_areas.length > 0 ? formData.service_areas : null,
          bio: formData.bio || null,
          specializations: formData.specializations.length > 0 ? formData.specializations : null,
          languages: formData.languages.length > 0 ? formData.languages : ['English'],
          slug: slugBase,
          status: 'active',
        })
        .select()
        .single()

      if (profileError) throw profileError

      if (formData.service_areas.length > 0 && agentProfile) {
        const serviceAreaInserts = formData.service_areas.map(area => ({
          agent_id: agentProfile.id,
          city: area,
          is_primary: area === formData.primary_service_area,
        }))

        const { error: areasError } = await supabase
          .from('agent_service_areas')
          .insert(serviceAreaInserts)

        if (areasError) console.error('Service areas error:', areasError)
      }

      toast.success('Agent profile created successfully!')
      router.push('/dashboard/overview')
    } catch (error: any) {
      console.error('Signup error:', error)
      toast.error(error.message || 'Failed to create agent profile')
    } finally {
      setLoading(false)
    }
  }

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item)
    } else {
      return [...array, item]
    }
  }

  // Landing page (before form)
  if (!showForm) {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-[#212529] overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0">
            <img
              src="/agents-hero.jpg"
              alt=""
              className="w-full h-full object-cover"
              aria-hidden="true"
            />
            {/* Dark overlay so text stays legible */}
            <div className="absolute inset-0 bg-black/60" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-20 sm:py-28 lg:py-36">
              <div className="max-w-3xl">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
                  Grow your real estate business with Huts
                </h1>
                <p className="mt-6 text-lg sm:text-xl text-[#ADB5BD] max-w-xl leading-relaxed">
                  Join Zimbabwe&apos;s largest property platform. Connect with buyers and renters actively searching for their next home.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#212529] rounded-lg text-lg font-semibold hover:bg-[#F8F9FA] transition-colors"
                  >
                    Get started — it&apos;s free
                    <ChevronRight size={20} />
                  </button>
                  <Link
                    href="/find-agent"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#495057] text-white rounded-lg text-lg font-semibold hover:border-white transition-colors"
                  >
                    Browse agents
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="border-b border-[#E9ECEF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-[#212529]">
                  {stats.listings === null ? '—' : stats.listings.toLocaleString()}
                </p>
                <p className="text-sm text-[#495057] mt-1">Active listings</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-[#212529]">
                  {stats.cities === null ? '—' : stats.cities}
                </p>
                <p className="text-sm text-[#495057] mt-1">Cities covered</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-[#212529]">
                  {stats.agents === null ? '—' : stats.agents.toLocaleString()}
                </p>
                <p className="text-sm text-[#495057] mt-1">Agents on platform</p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-[#212529] text-center mb-8">Why professionals choose Huts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {BENEFITS.map((benefit) => (
                <div key={benefit.title} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] flex items-center justify-center flex-shrink-0">
                    <benefit.icon size={18} className="text-[#212529]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#212529] mb-1">{benefit.title}</h3>
                    <p className="text-sm text-[#495057] leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works + What you get — combined compact section */}
        <section className="py-12 sm:py-16 bg-[#F8F9FA] border-t border-[#E9ECEF]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Steps */}
            <div>
              <h2 className="text-xl font-bold text-[#212529] mb-6">Get started in minutes</h2>
              <div className="space-y-4">
                {[
                  { step: '1', title: 'Create your profile', desc: 'Your experience, areas, and contact details.' },
                  { step: '2', title: 'Get discovered', desc: 'Show up in searches for your service areas.' },
                  { step: '3', title: 'Close deals', desc: 'Receive inquiries and grow your client base.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 items-start">
                    <div className="w-7 h-7 rounded-full bg-[#212529] text-white font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold text-[#212529] text-sm">{item.title}</p>
                      <p className="text-xs text-[#495057] mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <h2 className="text-xl font-bold text-[#212529] mb-6">Everything included, free</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {[
                  'Professional profile page',
                  'Direct client inquiries',
                  'Client reviews & ratings',
                  'Service area targeting',
                  'Listing showcase',
                  'Performance analytics',
                  'Verified badge eligibility',
                  'Mobile-optimized profile',
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2 py-1.5">
                    <Check size={14} className="text-[#212529] flex-shrink-0" />
                    <span className="text-sm text-[#212529]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-20 sm:py-24 bg-[#212529]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to grow your business?</h2>
            <p className="text-[#ADB5BD] text-lg mb-10">
              Join hundreds of professionals already on Huts. It only takes a few minutes.
            </p>
            <button
              onClick={() => {
                setShowForm(true)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#212529] rounded-lg text-lg font-semibold hover:bg-[#F8F9FA] transition-colors"
            >
              Create your free profile
              <ChevronRight size={20} />
            </button>
          </div>
        </section>
      </div>
    )
  }

  // Multi-step form
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E9ECEF] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-[#212529]">
              HUTS
            </Link>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-1.5">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i + 1 <= currentStep ? 'bg-[#212529] w-8' : 'bg-[#E9ECEF] w-4'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-[#495057]">{currentStep}/{totalSteps}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Step 1: Agent Type */}
        {currentStep === 1 && (
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#212529] mb-2">What type of professional are you?</h1>
            <p className="text-[#495057] mb-8">Choose the category that best describes your work.</p>

            <div className="grid grid-cols-1 gap-3">
              {Object.entries(AGENT_TYPE_LABELS).map(([key, label]) => {
                const icons: Record<string, typeof Building2> = {
                  real_estate_agent: Building2,
                  property_manager: Home,
                  home_builder: Briefcase,
                  photographer: Camera,
                  other: Sparkles,
                }
                const descriptions: Record<string, string> = {
                  real_estate_agent: 'Help clients buy, sell, or rent properties',
                  property_manager: 'Manage rental properties for owners',
                  home_builder: 'Build new homes and developments',
                  photographer: 'Capture properties with professional photography',
                  other: 'Appraiser, inspector, or other real estate service',
                }
                const Icon = icons[key] || Sparkles
                const isSelected = formData.agent_type === key

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormData({ ...formData, agent_type: key as AgentType })}
                    className={`flex items-center gap-4 p-4 sm:p-5 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-[#212529] bg-[#212529] shadow-sm'
                        : 'border-[#E9ECEF] bg-white hover:border-[#ADB5BD]'
                    }`}
                  >
                    <div className={`h-11 w-11 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-white/10' : 'bg-[#F8F9FA]'
                    }`}>
                      <Icon className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-[#495057]'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold ${isSelected ? 'text-white' : 'text-[#212529]'}`}>{label}</p>
                      <p className={`text-sm mt-0.5 ${isSelected ? 'text-white/70' : 'text-[#495057]'}`}>
                        {descriptions[key]}
                      </p>
                    </div>
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected 
                        ? 'border-white bg-white' 
                        : 'border-[#E9ECEF]'
                    }`}>
                      {isSelected && <Check size={12} className="text-[#212529]" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 2: Basic Info */}
        {currentStep === 2 && (
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#212529] mb-2">Your contact details</h1>
            <p className="text-[#495057] mb-8">How clients will find and reach you.</p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#212529] mb-2">
                  Business name <span className="text-[#ADB5BD] font-normal text-xs">optional</span>
                </label>
                <div className="relative">
                  <Building2 size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ADB5BD]" />
                  <input
                    type="text"
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-[#E9ECEF] rounded-xl text-[#212529] placeholder:text-[#ADB5BD] focus:border-[#212529] focus:ring-0 focus:outline-none transition-colors"
                    placeholder="e.g., ABC Realty"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#212529] mb-2">
                    Phone number <span className="text-[#FF6B6B]">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ADB5BD]" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-[#E9ECEF] rounded-xl text-[#212529] placeholder:text-[#ADB5BD] focus:border-[#212529] focus:ring-0 focus:outline-none transition-colors"
                      placeholder="+263 77 123 4567"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#212529] mb-2">
                    WhatsApp <span className="text-[#ADB5BD] font-normal text-xs">optional</span>
                  </label>
                  <div className="relative">
                    <MessageSquare size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ADB5BD]" />
                    <input
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-[#E9ECEF] rounded-xl text-[#212529] placeholder:text-[#ADB5BD] focus:border-[#212529] focus:ring-0 focus:outline-none transition-colors"
                      placeholder="+263 77 123 4567"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#212529] mb-2">
                  City <span className="text-[#FF6B6B]">*</span>
                </label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ADB5BD] pointer-events-none" />
                  <select
                    value={formData.office_city}
                    onChange={(e) => setFormData({ ...formData, office_city: e.target.value })}
                    className="w-full pl-11 pr-10 py-3.5 bg-white border-2 border-[#E9ECEF] rounded-xl text-[#212529] focus:border-[#212529] focus:ring-0 focus:outline-none transition-colors appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select your city</option>
                    {CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  <ChevronRight size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#ADB5BD] rotate-90 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#212529] mb-2">
                  Office address <span className="text-[#ADB5BD] font-normal text-xs">optional</span>
                </label>
                <div className="relative">
                  <Home size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ADB5BD]" />
                  <input
                    type="text"
                    value={formData.office_address}
                    onChange={(e) => setFormData({ ...formData, office_address: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-[#E9ECEF] rounded-xl text-[#212529] placeholder:text-[#ADB5BD] focus:border-[#212529] focus:ring-0 focus:outline-none transition-colors"
                    placeholder="Street address, suite number"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Professional Details */}
        {currentStep === 3 && (
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#212529] mb-2">Your experience</h1>
            <p className="text-[#495057] mb-8">Credentials that build client confidence.</p>

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#212529] mb-2">
                    License number {formData.agent_type === 'real_estate_agent' && <span className="text-[#FF6B6B]">*</span>}
                  </label>
                  <div className="relative">
                    <Shield size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ADB5BD]" />
                    <input
                      type="text"
                      value={formData.license_number}
                      onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-[#E9ECEF] rounded-xl text-[#212529] placeholder:text-[#ADB5BD] focus:border-[#212529] focus:ring-0 focus:outline-none transition-colors"
                      placeholder="e.g., ZW-12345"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#212529] mb-2">
                    Years of experience
                  </label>
                  <div className="relative">
                    <TrendingUp size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ADB5BD]" />
                    <input
                      type="number"
                      value={formData.years_experience || ''}
                      onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) || 0 })}
                      className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-[#E9ECEF] rounded-xl text-[#212529] placeholder:text-[#ADB5BD] focus:border-[#212529] focus:ring-0 focus:outline-none transition-colors"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#212529] mb-2">
                  Certifications <span className="text-[#ADB5BD] font-normal text-xs">optional</span>
                </label>
                <div className="relative">
                  <Award size={18} className="absolute left-3.5 top-4 text-[#ADB5BD]" />
                  <input
                    type="text"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        e.preventDefault()
                        setFormData({
                          ...formData,
                          certifications: [...formData.certifications, e.currentTarget.value.trim()]
                        })
                        e.currentTarget.value = ''
                      }
                    }}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-[#E9ECEF] rounded-xl text-[#212529] placeholder:text-[#ADB5BD] focus:border-[#212529] focus:ring-0 focus:outline-none transition-colors"
                    placeholder="Type a certification and press Enter"
                  />
                </div>
                {formData.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.certifications.map((cert, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-[#212529] text-white text-sm rounded-full font-medium"
                      >
                        {cert}
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            certifications: formData.certifications.filter((_, i) => i !== idx)
                          })}
                          className="w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-xs leading-none transition-colors"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Service Areas */}
        {currentStep === 4 && (
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#212529] mb-2">Where do you operate?</h1>
            <p className="text-[#495057] mb-8">Select the cities where you provide services. You&apos;ll appear in search results for these areas.</p>

            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {CITIES.map(city => {
                  const isSelected = formData.service_areas.includes(city)
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        const newAreas = toggleArrayItem(formData.service_areas, city)
                        setFormData({ 
                          ...formData, 
                          service_areas: newAreas,
                          primary_service_area: newAreas.includes(formData.primary_service_area) 
                            ? formData.primary_service_area 
                            : ''
                        })
                      }}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                        isSelected
                          ? 'bg-[#212529] text-white border-[#212529]'
                          : 'bg-white text-[#495057] border-[#E9ECEF] hover:border-[#212529]'
                      }`}
                    >
                      {isSelected && <Check size={12} className="inline mr-1 -mt-0.5" />}
                      {city}
                    </button>
                  )
                })}
              </div>

              {formData.service_areas.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-[#212529] mb-2">
                    Primary area <span className="text-[#ADB5BD] font-normal text-xs">optional</span>
                  </label>
                  <div className="relative">
                    <Star size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ADB5BD] pointer-events-none" />
                    <select
                      value={formData.primary_service_area}
                      onChange={(e) => setFormData({ ...formData, primary_service_area: e.target.value })}
                      className="w-full pl-11 pr-10 py-3.5 bg-white border-2 border-[#E9ECEF] rounded-xl text-[#212529] focus:border-[#212529] focus:ring-0 focus:outline-none transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">Select primary area</option>
                      {formData.service_areas.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    <ChevronRight size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#ADB5BD] rotate-90 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Profile Content */}
        {currentStep === 5 && (
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#212529] mb-2">Complete your profile</h1>
            <p className="text-[#495057] mb-8">A strong bio helps you stand out to potential clients.</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#212529] mb-2">
                  About you <span className="text-[#FF6B6B]">*</span>
                </label>
                <div className="relative">
                  <FileText size={18} className="absolute left-3.5 top-4 text-[#ADB5BD]" />
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value.slice(0, 1000) })}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-[#E9ECEF] rounded-xl text-[#212529] placeholder:text-[#ADB5BD] focus:border-[#212529] focus:ring-0 focus:outline-none transition-colors resize-none"
                    rows={5}
                    placeholder="Share your experience, what you specialize in, and why clients should work with you..."
                    required
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-[#ADB5BD]">200–1,000 characters recommended</p>
                  <p className={`text-xs font-medium tabular-nums ${formData.bio.length > 900 ? 'text-[#FF6B6B]' : 'text-[#ADB5BD]'}`}>{formData.bio.length}/1,000</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#212529] mb-3">
                  Specializations <span className="text-[#ADB5BD] font-normal text-xs">optional</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {AGENT_SPECIALIZATIONS.map(spec => {
                    const isSelected = formData.specializations.includes(spec)
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          specializations: toggleArrayItem(formData.specializations, spec)
                        })}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all border ${
                          isSelected
                            ? 'bg-[#212529] text-white border-[#212529]'
                            : 'bg-white text-[#495057] border-[#E9ECEF] hover:border-[#212529]'
                        }`}
                      >
                        {AGENT_SPECIALIZATION_LABELS[spec]}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#212529] mb-3">Languages</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map(lang => {
                    const isSelected = formData.languages.includes(lang)
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          languages: toggleArrayItem(formData.languages, lang)
                        })}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all border ${
                          isSelected
                            ? 'bg-[#212529] text-white border-[#212529]'
                            : 'bg-white text-[#495057] border-[#E9ECEF] hover:border-[#212529]'
                        }`}
                        disabled={lang === 'English' && isSelected}
                      >
                        {lang}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-[#495057] hover:text-[#212529] transition-colors font-medium"
            >
              <ChevronLeft size={18} />
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="inline-flex items-center gap-1.5 text-[#495057] hover:text-[#212529] transition-colors font-medium"
            >
              <ChevronLeft size={18} />
              Back
            </button>
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#212529] text-white rounded-lg hover:bg-[#000000] transition-colors font-semibold"
            >
              Continue
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#212529] text-white rounded-lg hover:bg-[#000000] transition-colors font-semibold disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create profile'}
              {!loading && <Check size={18} />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
