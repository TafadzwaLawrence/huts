'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  User,
  Phone,
  MapPin,
  Briefcase,
  Award,
  Globe,
  FileText,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import {
  AGENT_TYPE_LABELS,
  AGENT_SPECIALIZATIONS,
  AGENT_SPECIALIZATION_LABELS,
  LANGUAGES,
  ICON_SIZES
} from '@/lib/constants'

const CITIES = ['Harare', 'Bulawayo', 'Chitungwiza', 'Mutare', 'Gweru', 'Kwekwe', 'Kadoma', 'Masvingo', 'Chinhoyi', 'Norton', 'Marondera', 'Ruwa', 'Chegutu', 'Bindura', 'Beitbridge', 'Redcliff', 'Victoria Falls', 'Hwange', 'Chiredzi', 'Kariba']

export default function AgentProfileEditPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [agentProfile, setAgentProfile] = useState<any>(null)
  const [serviceAreas, setServiceAreas] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    business_name: '',
    phone: '',
    whatsapp: '',
    office_address: '',
    office_city: '',
    license_number: '',
    license_state: 'Zimbabwe',
    years_experience: 0,
    bio: '',
    certifications: [] as string[],
    specializations: [] as string[],
    languages: ['English'] as string[],
    service_areas: [] as string[],
  })

  useEffect(() => {
    loadAgentProfile()
  }, [])

  const loadAgentProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/signup')
        return
      }

      // Fetch agent profile
      const { data: profile, error } = await supabase
        .from('agent_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No agent profile found
          toast.error('Agent profile not found')
          router.push('/agents/signup')
        }
        throw error
      }

      setAgentProfile(profile)

      // Fetch service areas
      const { data: areas } = await supabase
        .from('agent_service_areas')
        .select('*')
        .eq('agent_id', profile.id)
      
      setServiceAreas(areas || [])

      // Populate form
      setFormData({
        business_name: profile.business_name || '',
        phone: profile.phone || '',
        whatsapp: profile.whatsapp || '',
        office_address: profile.office_address || '',
        office_city: profile.office_city || '',
        license_number: profile.license_number || '',
        license_state: profile.license_state || 'Zimbabwe',
        years_experience: profile.years_experience || 0,
        bio: profile.bio || '',
        certifications: profile.certifications || [],
        specializations: profile.specializations || [],
        languages: profile.languages || ['English'],
        service_areas: (areas || []).map((a: any) => a.city),
      })
    } catch (error: any) {
      console.error('Load error:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Update agent profile
      const { error: profileError } = await supabase
        .from('agent_profiles')
        .update({
          business_name: formData.business_name || null,
          phone: formData.phone,
          whatsapp: formData.whatsapp || null,
          office_address: formData.office_address || null,
          office_city: formData.office_city,
          license_number: formData.license_number || null,
          license_state: formData.license_state || null,
          years_experience: formData.years_experience || 0,
          bio: formData.bio || null,
          certifications: formData.certifications.length > 0 ? formData.certifications : null,
          specializations: formData.specializations.length > 0 ? formData.specializations : null,
          languages: formData.languages.length > 0 ? formData.languages : ['English'],
          service_areas: formData.service_areas.length > 0 ? formData.service_areas : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', agentProfile.id)

      if (profileError) throw profileError

      // Update service areas (delete and re-insert for simplicity)
      await supabase
        .from('agent_service_areas')
        .delete()
        .eq('agent_id', agentProfile.id)

      if (formData.service_areas.length > 0) {
        const serviceAreaInserts = formData.service_areas.map(city => ({
          agent_id: agentProfile.id,
          city: city,
          is_primary: false,
        }))

        const { error: areasError } = await supabase
          .from('agent_service_areas')
          .insert(serviceAreaInserts)

        if (areasError) console.error('Service areas error:', areasError)
      }

      toast.success('Profile updated successfully!')
      loadAgentProfile() // Reload
    } catch (error: any) {
      console.error('Save error:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item)
    } else {
      return [...array, item]
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-[#212529]" size={48} />
      </div>
    )
  }

  if (!agentProfile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertCircle size={64} className="mx-auto text-[#ADB5BD] mb-4" />
        <h1 className="text-2xl font-bold text-[#212529] mb-3">
          Agent Profile Not Found
        </h1>
        <p className="text-[#495057] mb-6">
          You need to create an agent profile first.
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#212529] mb-2">Edit Agent Profile</h1>
        <p className="text-[#495057]">Update your professional information and preferences</p>
      </div>

      {/* Agent Type Badge */}
      <div className="mb-6 p-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#495057] mb-1">Agent Type</p>
            <p className="font-bold text-[#212529]">
              {AGENT_TYPE_LABELS[agentProfile.agent_type as keyof typeof AGENT_TYPE_LABELS]}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#495057] mb-1">Status</p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              agentProfile.status === 'active' 
                ? 'bg-green-100 text-green-800'
                : agentProfile.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {agentProfile.status}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Basic Information */}
        <section className="bg-white border border-[#E9ECEF] rounded-xl p-6">
          <h2 className="text-xl font-bold text-[#212529] mb-6 flex items-center gap-2">
            <User size={ICON_SIZES.md} />
            Basic Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#212529] mb-2">
                Business Name
              </label>
              <input
                type="text"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-xl focus:border-[#212529] focus:outline-none transition-colors"
                placeholder="Your business name"
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
                  WhatsApp
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
                Office Address
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
        </section>

        {/* Professional Details */}
        <section className="bg-white border border-[#E9ECEF] rounded-xl p-6">
          <h2 className="text-xl font-bold text-[#212529] mb-6 flex items-center gap-2">
            <Briefcase size={ICON_SIZES.md} />
            Professional Details
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#212529] mb-2">
                  License Number
                </label>
                <input
                  type="text"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-xl focus:border-[#212529] focus:outline-none transition-colors"
                  placeholder="Your license number"
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
                Certifications
              </label>
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
                placeholder="Press Enter to add"
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
        </section>

        {/* Service Areas */}
        <section className="bg-white border border-[#E9ECEF] rounded-xl p-6">
          <h2 className="text-xl font-bold text-[#212529] mb-6 flex items-center gap-2">
            <MapPin size={ICON_SIZES.md} />
            Service Areas
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CITIES.map(city => {
              const isSelected = formData.service_areas.includes(city)
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    service_areas: toggleArrayItem(formData.service_areas, city)
                  })}
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
        </section>

        {/* Bio */}
        <section className="bg-white border border-[#E9ECEF] rounded-xl p-6">
          <h2 className="text-xl font-bold text-[#212529] mb-6 flex items-center gap-2">
            <FileText size={ICON_SIZES.md} />
            Professional Bio
          </h2>

          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-xl focus:border-[#212529] focus:outline-none transition-colors resize-none"
            rows={6}
            placeholder="Tell clients about your experience and approach..."
          />
          <p className="text-xs text-[#ADB5BD] mt-2">{formData.bio.length} / 1000 characters</p>
        </section>

        {/* Specializations */}
        <section className="bg-white border border-[#E9ECEF] rounded-xl p-6">
          <h2 className="text-xl font-bold text-[#212529] mb-6 flex items-center gap-2">
            <Award size={ICON_SIZES.md} />
            Specializations
          </h2>

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
        </section>

        {/* Languages */}
        <section className="bg-white border border-[#E9ECEF] rounded-xl p-6">
          <h2 className="text-xl font-bold text-[#212529] mb-6 flex items-center gap-2">
            <Globe size={ICON_SIZES.md} />
            Languages
          </h2>

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
                  disabled={lang === 'English' && isSelected}
                >
                  {lang}
                </button>
              )
            })}
          </div>
        </section>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-6 border-t border-[#E9ECEF]">
          <Link
            href="/dashboard/overview"
            className="px-6 py-3 text-[#495057] hover:text-[#212529] transition-colors font-medium"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#212529] text-white rounded-xl hover:bg-[#000000] transition-colors font-medium disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={ICON_SIZES.md} />
                Saving...
              </>
            ) : (
              <>
                <Save size={ICON_SIZES.md} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
