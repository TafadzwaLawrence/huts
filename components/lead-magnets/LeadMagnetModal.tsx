'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import BuyingGuideForm from './BuyingGuideForm'

interface LeadMagnetModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
}

export default function LeadMagnetModal({
  isOpen,
  onClose,
  title = 'Get the Complete Guide (Free)',
  subtitle = 'The Ultimate Guide to Buying Property in Zimbabwe',
}: LeadMagnetModalProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
        role="presentation"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-[#E9ECEF] px-6 py-4 flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-[#212529]">{title}</h2>
              <p className="text-sm text-[#495057] mt-1">{subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 text-[#495057] hover:text-[#212529] transition-colors p-1"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            <BuyingGuideForm onSuccess={onClose} compact={true} />

            {/* Benefits */}
            <div className="mt-6 pt-6 border-t border-[#E9ECEF]">
              <p className="text-xs font-semibold text-[#495057] uppercase mb-3">What You'll Learn:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-[#212529]">
                  <span className="text-[#51CF66] font-bold">✓</span>
                  Step-by-step buying process
                </li>
                <li className="flex items-start gap-2 text-sm text-[#212529]">
                  <span className="text-[#51CF66] font-bold">✓</span>
                  Complete cost breakdown
                </li>
                <li className="flex items-start gap-2 text-sm text-[#212529]">
                  <span className="text-[#51CF66] font-bold">✓</span>
                  Common red flags to avoid
                </li>
                <li className="flex items-start gap-2 text-sm text-[#212529]">
                  <span className="text-[#51CF66] font-bold">✓</span>
                  City-specific checklists
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
