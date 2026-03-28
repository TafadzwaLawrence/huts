'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface BuyingGuideFormData {
  firstName: string
  email: string
  location: string
  message?: string
}

interface BuyingGuideFormProps {
  onSuccess?: () => void
  compact?: boolean
}

export default function BuyingGuideForm({ onSuccess, compact = false }: BuyingGuideFormProps) {
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BuyingGuideFormData>({
    defaultValues: {
      firstName: '',
      email: '',
      location: 'Harare',
      message: '',
    },
  })

  const onSubmit = async (data: BuyingGuideFormData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName,
          email: data.email,
          location: data.location,
          message: data.message,
          leadMagnetSource: 'buying_guide',
        }),
      })

      const responseData = await res.json()

      if (!res.ok) {
        throw new Error(responseData.error || 'Failed to submit form')
      }

      toast.success('Success!', {
        description: 'Check your email for the free guide. You'll receive the first email within a few minutes.',
      })

      reset()
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      toast.error('Could not submit form', {
        description: error.message || 'Please try again later.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={compact ? 'space-y-3' : 'space-y-4'}>
      {/* First Name */}
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-[#212529] mb-1">
          First Name
        </label>
        <input
          id="firstName"
          type="text"
          placeholder="John"
          {...register('firstName', {
            required: 'First name is required',
            minLength: { value: 2, message: 'Minimum 2 characters' },
          })}
          className={`w-full px-3 py-2 border border-[#E9ECEF] rounded-md focus:outline-none focus:ring-2 focus:ring-[#212529] focus:border-transparent ${
            errors.firstName ? 'border-[#FF6B6B]' : ''
          }`}
          disabled={loading}
        />
        {errors.firstName && <span className="text-xs text-[#FF6B6B] mt-1 block">{errors.firstName.message}</span>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#212529] mb-1">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          placeholder="john@example.com"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Please enter a valid email',
            },
          })}
          className={`w-full px-3 py-2 border border-[#E9ECEF] rounded-md focus:outline-none focus:ring-2 focus:ring-[#212529] focus:border-transparent ${
            errors.email ? 'border-[#FF6B6B]' : ''
          }`}
          disabled={loading}
        />
        {errors.email && <span className="text-xs text-[#FF6B6B] mt-1 block">{errors.email.message}</span>}
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-[#212529] mb-1">
          City / Region
        </label>
        <select
          id="location"
          {...register('location', { required: 'Location is required' })}
          className={`w-full px-3 py-2 border border-[#E9ECEF] rounded-md focus:outline-none focus:ring-2 focus:ring-[#212529] focus:border-transparent ${
            errors.location ? 'border-[#FF6B6B]' : ''
          }`}
          disabled={loading}
        >
          <option value="Harare">Harare</option>
          <option value="Bulawayo">Bulawayo</option>
          <option value="Mutare">Mutare</option>
          <option value="Gweru">Gweru</option>
          <option value="Masvingo">Masvingo</option>
          <option value="Chinhoyi">Chinhoyi</option>
          <option value="Victoria Falls">Victoria Falls</option>
          <option value="Other">Other</option>
        </select>
        {errors.location && <span className="text-xs text-[#FF6B6B] mt-1 block">{errors.location.message}</span>}
      </div>

      {/* Message (optional) */}
      {!compact && (
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-[#212529] mb-1">
            Message (Optional)
          </label>
          <textarea
            id="message"
            placeholder="Any questions or special interest areas?"
            {...register('message')}
            className="w-full px-3 py-2 border border-[#E9ECEF] rounded-md focus:outline-none focus:ring-2 focus:ring-[#212529] focus:border-transparent resize-none"
            rows={3}
            disabled={loading}
          />
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#212529] text-white font-semibold py-2.5 rounded-md hover:bg-[#000000] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : 'Get Free Guide'}
      </button>

      <p className="text-xs text-[#495057] text-center">
        We'll never share your email. You can unsubscribe anytime.
      </p>
    </form>
  )
}
