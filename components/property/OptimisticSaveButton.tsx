'use client'

import { useState, useEffect, useCallback } from 'react'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { addLocalSavedId, removeLocalSavedId, getLocalSavedIds } from '@/lib/cache'

interface OptimisticSaveButtonProps {
  propertyId: string
  initialSaved?: boolean
  size?: number
  className?: string
  showText?: boolean
}

export default function OptimisticSaveButton({
  propertyId,
  initialSaved = false,
  size = 18,
  className = '',
  showText = false
}: OptimisticSaveButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  
  const supabase = createClient()

  // Check if property is saved on mount
  useEffect(() => {
    async function checkSaveStatus() {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
      
      if (!user) {
        // Check local storage for unauthenticated users
        const localSaved = getLocalSavedIds()
        setIsSaved(localSaved.includes(propertyId))
        return
      }

      const { data } = await supabase
        .from('saved_properties')
        .select('id')
        .eq('user_id', user.id)
        .eq('property_id', propertyId)
        .maybeSingle()

      setIsSaved(!!data)
    }
    
    checkSaveStatus()
  }, [propertyId, supabase])

  const handleToggle = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isLoading) return

    // Optimistic update
    const previousState = isSaved
    setIsSaved(!isSaved)
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Handle unauthenticated - store locally
        if (previousState) {
          removeLocalSavedId(propertyId)
          toast.success('Removed from saved')
        } else {
          addLocalSavedId(propertyId)
          toast.success('Saved! Sign in to sync across devices')
        }
        setIsLoading(false)
        return
      }

      if (previousState) {
        // Unsave
        const { error } = await supabase
          .from('saved_properties')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', propertyId)

        if (error) throw error
        toast.success('Removed from saved')
      } else {
        // Save
        const { error } = await supabase
          .from('saved_properties')
          .insert({ user_id: user.id, property_id: propertyId })

        if (error) throw error
        toast.success('Property saved!')
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsSaved(previousState)
      toast.error('Failed to update. Please try again.')
      console.error('Save error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isSaved, isLoading, propertyId, supabase])

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`group flex items-center gap-2 transition-all duration-200 ${
        isLoading ? 'opacity-50 cursor-wait' : 'hover:scale-105'
      } ${className}`}
      aria-label={isSaved ? 'Remove from saved' : 'Save property'}
    >
      <Heart
        size={size}
        className={`transition-all duration-300 ${
          isSaved 
            ? 'fill-[#FF6B6B] text-[#FF6B6B]' 
            : 'text-[#495057] group-hover:text-[#FF6B6B]'
        }`}
      />
      {showText && (
        <span className={`text-sm font-medium ${isSaved ? 'text-[#FF6B6B]' : 'text-[#495057]'}`}>
          {isSaved ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  )
}
