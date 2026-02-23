'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ICON_SIZES } from '@/lib/constants'
import SocialShareButtons from './SocialShareButtons'

interface PropertyActionsProps {
  propertyId: string
  propertyTitle: string
  propertyDescription?: string
  initialSaved?: boolean
}

export default function PropertyActions({ 
  propertyId, 
  propertyTitle, 
  propertyDescription,
  initialSaved = false 
}: PropertyActionsProps) {
  const [isSaved, setIsSaved] = useState(initialSaved)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  // Optimistic UI - update immediately, revert on error
  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast.error('Please sign in to save properties')
      return
    }

    // Optimistic update
    const previousState = isSaved
    setIsSaved(!isSaved)
    setIsLoading(true)

    try {
      if (previousState) {
        const { error } = await supabase
          .from('saved_properties')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', propertyId)
        
        if (error) throw error
        toast.success('Property removed from saved')
      } else {
        const { error } = await supabase
          .from('saved_properties')
          .insert({ user_id: user.id, property_id: propertyId })
        
        if (error) throw error
        toast.success('Property saved!')
      }
    } catch (error) {
      // Revert on error
      setIsSaved(previousState)
      toast.error('Failed to update saved properties')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex gap-2 items-center">
      <SocialShareButtons 
        title={propertyTitle}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        description={propertyDescription}
      />
      <button
        onClick={handleSave}
        disabled={isLoading}
        className={`p-2 rounded-full shadow-lg transition-all ${
          isSaved ? 'bg-red-500 text-white' : 'bg-white hover:bg-[#F8F9FA]'
        } ${isLoading ? 'opacity-50' : ''}`}
        aria-label={isSaved ? 'Remove from saved' : 'Save property'}
      >
        <Heart size={ICON_SIZES.lg} className={isSaved ? '' : 'text-black'} fill={isSaved ? 'currentColor' : 'none'} />
      </button>
    </div>
  )
}
