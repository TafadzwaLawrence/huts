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
  Loader2,
  Copy,
  Check,
  Link2,
  ExternalLink
} from 'lucide-react'
import {
  AGENT_TYPE_LABELS,
  AGENT_SPECIALIZATIONS,
  AGENT_SPECIALIZATION_LABELS,
  LANGUAGES,
  ICON_SIZES,
  ZIMBABWE_CITIES
} from '@/lib/constants'

export default function AgentProfileEditPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
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
    <div className="max-w-7xl mx-auto px-4 py-8">
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

      {/* Share your profile card — only shown when slug exists */}
      {agentProfile.slug && (
        <div className="mb-8 bg-white border border-[#E9ECEF] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F1F3F5] flex items-center gap-2">
            <Link2 size={16} className="text-[#495057]" />
            <h2 className="text-sm font-semibold text-[#212529]">Share your profile</h2>
          </div>
          <div className="px-5 py-4">
            <p className="text-xs text-[#ADB5BD] mb-3">Share this link with clients so they can view your profile and send inquiries.</p>
            {/* Copyable URL */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg px-3 py-2.5 text-sm text-[#495057] font-mono truncate select-all">
                {typeof window !== 'undefined' ? `${window.location.origin}/agent/${agentProfile.slug}` : `/agent/${agentProfile.slug}`}
              </div>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/agent/${agentProfile.slug}`
                  navigator.clipboard.writeText(url).then(() => {
                    setCopiedLink(true)
                    setTimeout(() => setCopiedLink(false), 2000)
                  })
                }}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 bg-[#212529] text-white text-xs font-semibold rounded-lg hover:bg-black transition-colors"
              >
                {copiedLink ? <Check size={13} /> : <Copy size={13} />}
                {copiedLink ? 'Copied!' : 'Copy'}
              </button>
            </div>
            {/* Social share buttons */}
            <div className="flex flex-wrap gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Check out my property agent profile: ${typeof window !== 'undefined' ? window.location.origin : ''}/agent/${agentProfile.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-[#E9ECEF] rounded-lg hover:border-[#212529] hover:bg-[#F8F9FA] transition-colors text-[#212529]"
              >
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.121 1.529 5.847L.057 23.882l6.204-1.463A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.925 0-3.727-.5-5.28-1.371l-.374-.22-3.883.915.977-3.784-.245-.389A9.955 9.955 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/agent/${agentProfile.slug}`)}&text=${encodeURIComponent('Check out my property agent profile on Huts!')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-[#E9ECEF] rounded-lg hover:border-[#212529] hover:bg-[#F8F9FA] transition-colors text-[#212529]"
              >
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.638 5.903-5.638Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                X (Twitter)
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/agent/${agentProfile.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-[#E9ECEF] rounded-lg hover:border-[#212529] hover:bg-[#F8F9FA] transition-colors text-[#212529]"
              >
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </a>
              <a
                href={`/agent/${agentProfile.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-[#E9ECEF] rounded-lg hover:border-[#212529] hover:bg-[#F8F9FA] transition-colors text-[#212529] ml-auto"
              >
                View live profile <ExternalLink size={11} />
              </a>
            </div>
          </div>
        </div>
      )}

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
                className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-xl bg-white text-[#212529] focus:border-[#212529] focus:outline-none transition-colors"
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
                  className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-xl bg-white text-[#212529] focus:border-[#212529] focus:outline-none transition-colors"
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
                  className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-xl bg-white text-[#212529] focus:border-[#212529] focus:outline-none transition-colors"
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
                className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-xl bg-white text-[#212529] focus:border-[#212529] focus:outline-none transition-colors"
                required
              >
                <option value="">Select city...</option>
                {ZIMBABWE_CITIES.map(city => (
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
                className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-xl bg-white text-[#212529] focus:border-[#212529] focus:outline-none transition-colors"
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
                  className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-xl bg-white text-[#212529] focus:border-[#212529] focus:outline-none transition-colors"
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
                  className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-xl bg-white text-[#212529] focus:border-[#212529] focus:outline-none transition-colors"
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
                className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-xl bg-white text-[#212529] focus:border-[#212529] focus:outline-none transition-colors"
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
            {ZIMBABWE_CITIES.map(city => {
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
            className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-xl bg-white text-[#212529] focus:border-[#212529] focus:outline-none transition-colors resize-none"
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
            href="/agent/overview"
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
