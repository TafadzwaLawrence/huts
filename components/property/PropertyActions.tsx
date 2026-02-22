'use client'

import { useState, useEffect } from 'react'
import { Heart, Share2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ICON_SIZES } from '@/lib/constants'

interface PropertyActionsProps {
  propertyId: string
  propertyTitle: string
  initialSaved?: boolean
}

export default function PropertyActions({ propertyId, propertyTitle, initialSaved = false }: PropertyActionsProps) {
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

  const handleShare = async () => {
    const url = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: propertyTitle,
          text: `Check out this property: ${propertyTitle}`,
          url,
        })
      } catch (error) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleShare}
        className="bg-white p-2 rounded-full shadow-lg hover:bg-muted transition-colors"
        aria-label="Share property"
      >
        <Share2 size={ICON_SIZES.lg} className="text-black" />
      </button>
      <button
        onClick={handleSave}
        disabled={isLoading}
        className={`p-2 rounded-full shadow-lg transition-all ${
          isSaved ? 'bg-red-500 text-white' : 'bg-white hover:bg-muted'
        } ${isLoading ? 'opacity-50' : ''}`}
        aria-label={isSaved ? 'Remove from saved' : 'Save property'}
      >
        <Heart size={ICON_SIZES.lg} className={isSaved ? '' : 'text-black'} fill={isSaved ? 'currentColor' : 'none'} />
      </button>
    </div>
  )
}
