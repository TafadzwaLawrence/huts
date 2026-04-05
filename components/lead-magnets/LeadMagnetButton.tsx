'use client'

import { useState } from 'react'
import { Download, ChevronRight } from 'lucide-react'
import { LeadMagnetCaptureForm } from './LeadMagnetCaptureForm'
import type { LeadMagnet } from '@/types/lead-magnets'

interface LeadMagnetButtonProps {
  leadMagnet: LeadMagnet
  variant?: 'default' | 'secondary' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  showIcon?: boolean
  text?: string
  className?: string
}

export function LeadMagnetButton({
  leadMagnet,
  variant = 'default',
  size = 'default',
  showIcon = true,
  text = 'Get Guide',
  className = '',
}: LeadMagnetButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setDialogOpen(true)}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all ${
          variant === 'default'
            ? 'bg-black text-white hover:bg-charcoal'
            : 'border-2 border-dark-gray text-dark-gray hover:border-black hover:text-black'
        } ${
          size === 'sm'
            ? 'text-sm px-3 py-1.5'
            : size === 'lg'
              ? 'text-lg px-6 py-3'
              : ''
        } ${className}`}
      >
        {showIcon && <Download className="h-4 w-4" />}
        {text}
        {variant === 'secondary' && <ChevronRight className="h-4 w-4" />}
      </button>

      <LeadMagnetCaptureForm
        leadMagnet={leadMagnet}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}
