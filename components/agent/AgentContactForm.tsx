'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Send } from 'lucide-react'
import { INQUIRY_TYPES, INQUIRY_TYPE_LABELS, ICON_SIZES } from '@/lib/constants'

interface AgentContactFormProps {
  agentId: string
  agentName: string
  propertyId?: string
}

export default function AgentContactForm({ agentId, agentName, propertyId }: AgentContactFormProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiry_type: 'general',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Get user profile for name/email if logged in
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', user.id)
          .single()

        if (profile) {
          formData.name = formData.name || profile.name || ''
          formData.email = formData.email || profile.email || user.email || ''
        }
      }

      // Validate required fields
      if (!formData.name || !formData.email || !formData.message) {
        toast.error('Please fill in all required fields')
        return
      }

      // Insert agent inquiry
      const { error } = await supabase
        .from('agent_inquiries')
        .insert({
          agent_id: agentId,
          user_id: user?.id || null,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          inquiry_type: formData.inquiry_type,
          message: formData.message,
          property_id: propertyId || null,
          source: propertyId ? 'property_listing' : 'profile',
          status: 'new',
        })

      if (error) throw error

      toast.success(`Your message has been sent to ${agentName}!`)
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        inquiry_type: 'general',
        message: '',
      })
    } catch (error: any) {
      console.error('Inquiry error:', error)
      toast.error(error.message || 'Failed to send inquiry')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#212529] mb-2">
          Your Name <span className="text-[#FF6B6B]">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border-2 border-[#E9ECEF] rounded-lg focus:border-[#212529] focus:outline-none transition-colors text-sm"
          placeholder="Your full name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#212529] mb-2">
          Email <span className="text-[#FF6B6B]">*</span>
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2 border-2 border-[#E9ECEF] rounded-lg focus:border-[#212529] focus:outline-none transition-colors text-sm"
          placeholder="your@email.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#212529] mb-2">
          Phone (Optional)
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-2 border-2 border-[#E9ECEF] rounded-lg focus:border-[#212529] focus:outline-none transition-colors text-sm"
          placeholder="+263 ..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#212529] mb-2">
          I'm interested in
        </label>
        <select
          value={formData.inquiry_type}
          onChange={(e) => setFormData({ ...formData, inquiry_type: e.target.value })}
          className="w-full px-4 py-2 border-2 border-[#E9ECEF] rounded-lg focus:border-[#212529] focus:outline-none transition-colors text-sm"
        >
          {Object.entries(INQUIRY_TYPE_LABELS).map(([key, label]) => (
            <option key={key} value={key.toLowerCase()}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#212529] mb-2">
          Message <span className="text-[#FF6B6B]">*</span>
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-2 border-2 border-[#E9ECEF] rounded-lg focus:border-[#212529] focus:outline-none transition-colors text-sm resize-none"
          rows={4}
          placeholder="Tell the agent what you're looking for..."
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#212529] text-white py-3 rounded-lg hover:bg-[#000000] transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? 'Sending...' : (
          <>
            <Send size={ICON_SIZES.sm} />
            Send Message
          </>
        )}
      </button>

      <p className="text-xs text-[#ADB5BD] text-center">
        By clicking "Send Message", you agree to be contacted by this agent
      </p>
    </form>
  )
}
