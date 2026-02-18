'use client'

import { useState } from 'react'
import { RotateCw } from 'lucide-react'
import { toast } from 'sonner'

interface RetryVerificationButtonProps {
  propertyId: string
}

export default function RetryVerificationButton({ propertyId }: RetryVerificationButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleRetry = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/properties/verify/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send verification request')
      }

      toast.success('Verification request sent', {
        description: 'Our team will review your property shortly.',
      })
    } catch (error: any) {
      toast.error('Could not send request', {
        description: error.message || 'Please try again later.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleRetry}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#495057] hover:text-[#212529] border border-[#E9ECEF] hover:border-[#ADB5BD] px-2.5 py-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <RotateCw size={11} className={loading ? 'animate-spin' : ''} />
      {loading ? 'Sending…' : 'Retry verification'}
    </button>
  )
}
