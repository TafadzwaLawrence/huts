'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface PropertyViewTrackerProps {
  propertyId: string
  viewerId?: string | null
}

export default function PropertyViewTracker({ propertyId, viewerId }: PropertyViewTrackerProps) {
  useEffect(() => {
    // Generate or retrieve a session ID for deduplication
    let sessionId = sessionStorage.getItem('huts_sid')
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      sessionStorage.setItem('huts_sid', sessionId)
    }

    const source = document.referrer
      ? new URL(document.referrer).hostname === window.location.hostname
        ? 'internal'
        : 'referral'
      : 'direct'

    const supabase = createClient()
    supabase.rpc('track_property_view', {
      p_property_id: propertyId,
      p_viewer_id: viewerId ?? null,
      p_session_id: sessionId,
      p_source: source,
    })
    // Fire-and-forget — errors are intentionally swallowed so a failed
    // analytics call never degrades the user experience.
  }, [propertyId, viewerId])

  return null
}
