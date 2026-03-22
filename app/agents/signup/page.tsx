'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
  Eye,
  MessageSquare,
  TrendingUp,
  Shield,
  Star,
  AlertCircle,
  Loader2,
  Lock,
  Mail,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  AGENT_TYPE_LABELS,
  AGENT_SPECIALIZATIONS,
  AGENT_SPECIALIZATION_LABELS,
  LANGUAGES,
  ZIMBABWE_CITIES as CITIES,
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

// Inner component that uses useSearchParams (must be inside Suspense)
function AgentSignupInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [showForm, setShowForm] = useState(false)
  // Step 0 = account creation (only shown when unauthenticated)
  // Steps 1-5 = agent profile wizard
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<PlatformStats>({ listings: null, cities: null, agents: null })

  // ── Inline auth state ──────────────────────────────────────
  const [user, setUser] = useState<any>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authName, setAuthName] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // Check session on mount and listen for auth state changes
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ?? null)
      setAuthChecked(true)
      // If already authenticated when landing on this page (e.g. returned from Google
      // OAuth or re-visited after account creation), jump straight into the wizard.
      if (user) {
        const stepParam = searchParams.get('step')
        const step = stepParam ? parseInt(stepParam) : 1
        setCurrentStep(step >= 1 && step <= 5 ? step : 1)
        setShowForm(true)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null
      setUser(newUser)
      // When auth completes (email signup/signin), advance from step 0 → step 1
      if (newUser) {
        setCurrentStep(prev => prev === 0 ? 1 : prev)
      }
    })
    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        .select('full_name')
        .eq('id', user.id)
        .single()

      const slugBase = (formData.business_name || profile?.full_name || 'agent').toLowerCase()
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
          status: 'pending',
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

      toast.success('Profile submitted! We\'ll review it shortly and let you know when it\'s approved.')
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

  const handleStartForm = () => {
    setShowForm(true)
    // If user is already authenticated, start at step 1; otherwise step 0 (account creation)
    setCurrentStep(user ? 1 : 0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleInlineAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: { data: { name: authName, role: 'landlord' } },
        })
        if (error) throw error
        // onAuthStateChange will fire and advance currentStep to 1
        toast.success('Account created! Completing your agent profile now.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        })
        if (error) throw error
        toast.success('Welcome back!')
        // onAuthStateChange fires → setCurrentStep(1) handled in the listener
      }
    } catch (err: any) {
      setAuthError(err.message || 'Something went wrong')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setAuthLoading(true)
    setAuthError('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Return to /agents/signup?step=1 so we land directly in the wizard
          redirectTo: `${window.location.origin}/auth/callback?next=/agents/signup?step=1`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      })
      if (error) throw error
    } catch (err: any) {
      setAuthError(err.message || 'Failed to continue with Google')
      setAuthLoading(false)
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
                    onClick={handleStartForm}
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
              onClick={handleStartForm}
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

  // Unified wizard — step 0 = account creation, steps 1-5 = agent profile
  // Show a loading state while we resolve the session
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#ADB5BD]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Form Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12 bg-white">
        <div className="w-full max-w-[440px] mx-auto">
          {/* Logo */}
          <div className="mb-10">
            <Link href="/">
              <img src="/logo.svg" alt="Huts" width={48} height={48} className="h-12 w-12 object-contain" />
            </Link>
          </div>

          {/* Progress indicator for steps 1-5 */}
          {currentStep >= 1 && (
            <div className="mb-8">
              <div className="flex items-center justify-center gap-1.5">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i + 1 <= currentStep ? 'bg-[#212529] w-8' : 'bg-[#E9ECEF] w-4'
                    }`}
                  />
                ))}
              </div>
              <p className="text-center text-sm text-[#495057] mt-3">
                Step {currentStep} of {totalSteps}
              </p>
            </div>
          )}

        {/* Step 0: Account creation / sign in */}
        {currentStep === 0 && (
          <div className="max-w-[420px] mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-[#212529] mb-1">
                {authMode === 'signup' ? 'Create your account' : 'Sign in to continue'}
              </h1>
              <p className="text-sm text-[#767676]">
                {authMode === 'signup'
                  ? 'First, create a free Huts account — then build your agent profile.'
                  : 'Sign in to pick up where you left off.'}
              </p>
            </div>

            <div className="bg-white border border-[#E9ECEF] rounded-2xl p-6 shadow-sm">
              {/* Mode toggle */}
              <div className="flex border-b border-[#E9ECEF] mb-6">
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setAuthError('') }}
                  className={`flex-1 pb-3 text-sm font-bold text-center transition-colors relative ${
                    authMode === 'signup'
                      ? 'text-[#212529] after:absolute after:bottom-0 after:inset-x-0 after:h-[3px] after:bg-[#212529] after:rounded-t'
                      : 'text-[#767676] hover:text-[#212529]'
                  }`}
                >
                  New account
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('signin'); setAuthError('') }}
                  className={`flex-1 pb-3 text-sm font-bold text-center transition-colors relative ${
                    authMode === 'signin'
                      ? 'text-[#212529] after:absolute after:bottom-0 after:inset-x-0 after:h-[3px] after:bg-[#212529] after:rounded-t'
                      : 'text-[#767676] hover:text-[#212529]'
                  }`}
                >
                  Sign in
                </button>
              </div>

              {authError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle size={15} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{authError}</p>
                </div>
              )}

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-[#D1D5DB] text-[#212529] py-3 px-4 rounded-lg text-sm font-semibold hover:bg-[#F8F9FA] hover:border-[#9CA3AF] transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E9ECEF]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white text-xs text-[#9CA3AF]">or</span>
                </div>
              </div>

              <form onSubmit={handleInlineAuth} className="space-y-3">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-[#212529] mb-1">Full name</label>
                    <div className="relative">
                      <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="block w-full pl-9 pr-3 py-2.5 border border-[#D1D5DB] rounded-lg text-sm text-[#212529] placeholder-[#9CA3AF] focus:outline-none focus:border-[#212529] focus:ring-1 focus:ring-[#212529] transition-colors"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-[#212529] mb-1">Email</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2.5 border border-[#D1D5DB] rounded-lg text-sm text-[#212529] placeholder-[#9CA3AF] focus:outline-none focus:border-[#212529] focus:ring-1 focus:ring-[#212529] transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#212529] mb-1">Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2.5 border border-[#D1D5DB] rounded-lg text-sm text-[#212529] placeholder-[#9CA3AF] focus:outline-none focus:border-[#212529] focus:ring-1 focus:ring-[#212529] transition-colors"
                      placeholder={authMode === 'signup' ? 'Create a password (min 6 chars)' : 'Enter your password'}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-[#212529] text-white py-3 px-4 rounded-lg text-sm font-bold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
                >
                  {authLoading ? (
                    <><Loader2 size={15} className="animate-spin" /> {authMode === 'signup' ? 'Creating account…' : 'Signing in…'}</>
                  ) : (
                    <>{authMode === 'signup' ? 'Create account & continue' : 'Sign in & continue'} <ChevronRight size={15} /></>
                  )}
                </button>
              </form>

              <p className="text-[11px] text-[#9CA3AF] text-center mt-4 leading-relaxed">
                By continuing you agree to Huts&apos;{' '}
                <Link href="/terms" className="text-[#212529] underline">Terms of Use</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-[#212529] underline">Privacy Policy</Link>.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="mt-6 flex items-center gap-1.5 text-sm text-[#495057] hover:text-[#212529] transition-colors mx-auto"
            >
              <ChevronLeft size={16} />
              Back to overview
            </button>
          </div>
        )}

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

        {/* Navigation — only shown for steps 1-5 */}
        {currentStep >= 1 && (
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
        )}
        </div>
      </div>

      {/* Right — Image panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-[#212529]">
        <Image
          src="/agent-hero.jpg"
          alt="Real estate professionals"
          fill
          className="object-cover contrast-105 opacity-70 select-none pointer-events-none"
          priority
          sizes="50vw"
        />
        {/* Dark overlay for B&W aesthetic */}
        <div className="absolute inset-0 bg-black/15 mix-blend-multiply pointer-events-none" />
        {/* Decorative grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full border border-white/5" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full border border-white/5" />
      </div>
    </div>
  )
}

export default function AgentSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#ADB5BD]" />
      </div>
    }>
      <AgentSignupInner />
    </Suspense>
  )
}
