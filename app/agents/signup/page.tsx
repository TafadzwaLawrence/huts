'use client'

import { useState } from 'react'
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
  Sparkles
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

export default function AgentSignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
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
    // Validation for each step
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

      // Get current profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single()

      // Generate slug from business name or profile name
      const slugBase = (formData.business_name || profile?.name || 'agent').toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      // Insert agent profile
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

      // Insert service areas
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

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E9ECEF]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-[#212529]">
              HUTS
            </Link>
            <div className="flex items-center gap-3 text-sm text-[#495057]">
              <span>Step {currentStep} of {totalSteps}</span>
              <div className="w-32 h-2 bg-[#E9ECEF] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#212529] transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-[#E9ECEF] shadow-sm p-8">
          {/* Step 1: Agent Type */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-[#212529] mb-2">Become a Professional on Huts</h1>
                <p className="text-[#495057]">Choose your professional category to get started</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(AGENT_TYPE_LABELS).map(([key, label]) => {
                  const icons = {
                    real_estate_agent: Building2,
                    property_manager: Home,
                    home_builder: Briefcase,
                    photographer: Camera,
                    other: Sparkles,
                  }
                  const Icon = icons[key as keyof typeof icons]
                  const isSelected = formData.agent_type === key

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData({ ...formData, agent_type: key as AgentType })}
                      className={`relative border-2 rounded-xl p-6 transition-all text-left group ${
                        isSelected
                          ? 'border-[#212529] bg-[#F8F9FA] shadow-lg scale-[1.02]'
                          : 'border-[#E9ECEF] hover:border-[#ADB5BD] hover:shadow-md bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-[#212529]' : 'bg-[#F8F9FA]'
                        }`}>
                          <Icon className={`h-6 w-6 ${isSelected ? 'text-white' : 'text-[#495057]'}`} />
                        </div>
                        <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'border-[#212529] bg-[#212529]' 
                            : 'border-[#E9ECEF] group-hover:border-[#ADB5BD]'
                        }`}>
                          {isSelected && <Check size={14} className="text-white" />}
                        </div>
                      </div>
                      <h3 className="font-bold text-lg mb-1 text-[#212529]">{label}</h3>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2: Basic Info */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#212529] mb-2">Basic Information</h2>
                <p className="text-[#495057]">Tell us about your business and how clients can reach you</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#212529] mb-2">
                  Business Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-xl focus:border-[#212529] focus:outline-none transition-colors"
                  placeholder="e.g., ABC Realty, Your Name Real Estate"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#212529] mb-2">
                    Phone Number <span className="text-[#FF6B6B]">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-xl focus:border-[#212529] focus:outline-none transition-colors"
                    placeholder="+263 ..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#212529] mb-2">
                    WhatsApp (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-xl focus:border-[#212529] focus:outline-none transition-colors"
                    placeholder="+263 ..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#212529] mb-2">
                  Office City <span className="text-[#FF6B6B]">*</span>
                </label>
                <select
                  value={formData.office_city}
                  onChange={(e) => setFormData({ ...formData, office_city: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-xl focus:border-[#212529] focus:outline-none transition-colors"
                  required
                >
                  <option value="">Select city...</option>
                  {CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#212529] mb-2">
                  Office Address (Optional)
                </label>
                <input
                  type="text"
                  value={formData.office_address}
                  onChange={(e) => setFormData({ ...formData, office_address: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-xl focus:border-[#212529] focus:outline-none transition-colors"
                  placeholder="Street address, suite number, etc."
                />
              </div>
            </div>
          )}

          {/* Step 3: Professional Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#212529] mb-2">Professional Details</h2>
                <p className="text-[#495057]">Help clients understand your experience and qualifications</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#212529] mb-2">
                    License Number {formData.agent_type === 'real_estate_agent' && <span className="text-[#FF6B6B]">*</span>}
                  </label>
                  <input
                    type="text"
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-xl focus:border-[#212529] focus:outline-none transition-colors"
                    placeholder="Your professional license number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#212529] mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={formData.years_experience || ''}
                    onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-xl focus:border-[#212529] focus:outline-none transition-colors"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#212529] mb-2">
                  Certifications (Optional)
                </label>
                <p className="text-xs text-[#ADB5BD] mb-2">Press Enter after each certification</p>
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
                  className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-xl focus:border-[#212529] focus:outline-none transition-colors"
                  placeholder="e.g., Certified Property Manager, REALTOR®"
                />
                {formData.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.certifications.map((cert, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-[#F8F9FA] text-[#212529] text-sm rounded-full border border-[#E9ECEF]"
                      >
                        {cert}
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            certifications: formData.certifications.filter((_, i) => i !== idx)
                          })}
                          className="text-[#ADB5BD] hover:text-[#212529]"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Service Areas */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#212529] mb-2">Service Areas</h2>
                <p className="text-[#495057]">Select the cities where you provide services</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#212529] mb-3">
                  Select Cities <span className="text-[#FF6B6B]">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                            // Clear primary if it's no longer in service areas
                            primary_service_area: newAreas.includes(formData.primary_service_area) 
                              ? formData.primary_service_area 
                              : ''
                          })
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                          isSelected
                            ? 'bg-[#212529] text-white border-[#212529]'
                            : 'bg-white text-[#495057] border-[#E9ECEF] hover:border-[#212529]'
                        }`}
                      >
                        {city}
                      </button>
                    )
                  })}
                </div>
              </div>

              {formData.service_areas.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-[#212529] mb-3">
                    Primary Service Area (Optional)
                  </label>
                  <p className="text-xs text-[#ADB5BD] mb-3">Choose your main area of operation</p>
                  <select
                    value={formData.primary_service_area}
                    onChange={(e) => setFormData({ ...formData, primary_service_area: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-xl focus:border-[#212529] focus:outline-none transition-colors"
                  >
                    <option value="">Select primary area...</option>
                    {formData.service_areas.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Profile Content */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#212529] mb-2">Complete Your Profile</h2>
                <p className="text-[#495057]">Tell clients what makes you stand out</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#212529] mb-2">
                  Professional Bio <span className="text-[#FF6B6B]">*</span>
                </label>
                <p className="text-xs text-[#ADB5BD] mb-2">Describe your experience, approach, and what sets you apart (200-1000 characters)</p>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-xl focus:border-[#212529] focus:outline-none transition-colors resize-none"
                  rows={6}
                  placeholder="Share your story, expertise, and what clients can expect when working with you..."
                  required
                />
                <p className="text-xs text-[#ADB5BD] mt-1">{formData.bio.length} / 1000 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#212529] mb-3">
                  Specializations (Optional)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border-2 ${
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
                <label className="block text-sm font-medium text-[#212529] mb-3">
                  Languages
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                          isSelected
                            ? 'bg-[#212529] text-white border-[#212529]'
                            : 'bg-white text-[#495057] border-[#E9ECEF] hover:border-[#212529]'
                        }`}
                        disabled={lang === 'English' && isSelected} // Can't deselect English
                      >
                        {lang}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E9ECEF]">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="inline-flex items-center gap-2 px-6 py-3 text-[#495057] hover:text-[#212529] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={ICON_SIZES.md} />
              Back
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#212529] text-white rounded-xl hover:bg-[#000000] transition-colors font-medium"
              >
                Next
                <ChevronRight size={ICON_SIZES.md} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#212529] text-white rounded-xl hover:bg-[#000000] transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Creating Profile...' : 'Complete Signup'}
                <Check size={ICON_SIZES.md} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
