'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Download } from 'lucide-react'
import type { LeadMagnet } from '@/types/lead-magnets'

interface LeadMagnetCaptureFormProps {
  leadMagnet: LeadMagnet
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LeadMagnetCaptureForm({
  leadMagnet,
  open,
  onOpenChange,
}: LeadMagnetCaptureFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    user_type: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})


  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate
    const newErrors: Record<string, string> = {}
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Invalid email address'
    }
    if (!formData.name) {
      newErrors.name = 'Name is required'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/lead-magnets/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_magnet_id: leadMagnet.id,
          ...formData,
          source_page: typeof window !== 'undefined' ? window.location.pathname : '',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process download')
      }

      toast.success(
        'Success! Check your email for your download link and exclusive content.'
      )
      setSubmitted(true)

      // Close modal after 2 seconds
      setTimeout(() => {
        onOpenChange(false)
        setSubmitted(false)
        setFormData({ name: '', email: '', phone: '', location: '', user_type: '' })
      }, 2000)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to process download'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(newOpen)
      if (!newOpen) {
        setSubmitted(false)
        setFormData({ name: '', email: '', phone: '', location: '', user_type: '' })
      }
    }
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => handleOpenChange(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="border-b border-light-gray px-6 py-4 flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-charcoal flex items-center gap-2">
                <Download className="h-5 w-5" />
                Get {leadMagnet.title}
              </h2>
            </div>
            <button
              onClick={() => handleOpenChange(false)}
              className="text-dark-gray hover:text-charcoal ml-4 text-lg"
              disabled={isLoading}
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            <p className="text-dark-gray mb-4">
              Enter your details below to receive your free guide instantly.
            </p>

            {submitted ? (
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-center font-semibold text-charcoal">
                  Check your email!
                </p>
                <p className="text-center text-sm text-dark-gray">
                  We&apos;ve sent you the guide plus exclusive market insights.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value })
                      setErrors({ ...errors, name: '' })
                    }}
                    disabled={isLoading}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                      errors.name ? 'border-red-500' : 'border-light-gray'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value })
                      setErrors({ ...errors, email: '' })
                    }}
                    disabled={isLoading}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                      errors.email ? 'border-red-500' : 'border-light-gray'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                {leadMagnet.gate_fields?.includes('phone') && (
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+263 123 456 789"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      disabled={isLoading}
                      className="w-full px-3 py-2 border border-light-gray rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                )}

                {/* Location */}
                {leadMagnet.gate_fields?.includes('location') && (
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">
                      Location / City
                    </label>
                    <select
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      disabled={isLoading}
                      className="w-full px-3 py-2 border border-light-gray rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="">Select your location</option>
                      <option value="harare">Harare</option>
                      <option value="bulawayo">Bulawayo</option>
                      <option value="victoria-falls">Victoria Falls</option>
                      <option value="gweru">Gweru</option>
                      <option value="mutare">Mutare</option>
                      <option value="hwange">Hwange</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                )}

                {/* User Type */}
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    I am a...
                  </label>
                  <select
                    value={formData.user_type}
                    onChange={(e) =>
                      setFormData({ ...formData, user_type: e.target.value })
                    }
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-light-gray rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="">Select your type</option>
                    <option value="buyer">Buyer</option>
                    <option value="renter">Renter</option>
                    <option value="landlord">Landlord</option>
                    <option value="agent">Real Estate Agent</option>
                    <option value="investor">Investor</option>
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black text-white py-2 rounded-md font-semibold hover:bg-charcoal disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isLoading ? 'Processing...' : 'Get Guide Instantly'}
                </button>

                <p className="text-center text-xs text-dark-gray">
                  We respect your privacy. Unsubscribe anytime.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
