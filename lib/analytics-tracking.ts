'use client'

import { useEffect } from 'react'

interface TrackLeadMagnetProps {
  leadMagnetId: string
  leadMagnetSlug: string
  eventType: 'view' | 'form_loaded' | 'form_submitted' | 'download'
}

/**
 * Analytics tracking hook for lead magnets
 * Tracks page views, form interactions, and downloads
 */
export function useLeadMagnetTracking({
  leadMagnetId,
  leadMagnetSlug,
  eventType,
}: TrackLeadMagnetProps) {
  useEffect(() => {
    const trackEvent = async () => {
      try {
        // Send to analytics backend
        await fetch('/api/analytics/lead-magnets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lead_magnet_id: leadMagnetId,
            lead_magnet_slug: leadMagnetSlug,
            event_type: eventType,
            timestamp: new Date().toISOString(),
            page_url: typeof window !== 'undefined' ? window.location.href : '',
            referrer:
              typeof document !== 'undefined' ? document.referrer : '',
          }),
        })
      } catch (error) {
        console.error('[Analytics] Failed to track lead magnet event:', error)
        // Silently fail - don't disrupt user experience
      }
    }

    trackEvent()
  }, [leadMagnetId, leadMagnetSlug, eventType])
}

/**
 * Pixel tracking component for external referral sources
 * Tracks when leads come from ads, social media, etc.
 */
export function LeadMagnetPixel({
  leadMagnetId,
  source,
}: {
  leadMagnetId: string
  source?: string
}) {
  useEffect(() => {
    const trackPixel = async () => {
      try {
        await fetch('/api/analytics/pixel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lead_magnet_id: leadMagnetId,
            source: source || 'organic',
            timestamp: new Date().toISOString(),
          }),
        })
      } catch (error) {
        // Silently fail
      }
    }

    trackPixel()
  }, [leadMagnetId, source])

  return null
}
