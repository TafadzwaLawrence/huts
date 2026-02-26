'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Handles ChunkLoadError by automatically reloading the page
 * This happens when Next.js code-split chunks fail to load (usually after deployment)
 */
export default function ChunkLoadErrorHandler() {
  const router = useRouter()

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const error = event.error
      
      // Check if it's a ChunkLoadError
      if (
        error?.name === 'ChunkLoadError' ||
        error?.message?.includes('Loading chunk') ||
        error?.message?.includes('Failed to fetch dynamically imported module')
      ) {
        console.log('ChunkLoadError detected - reloading page...')
        
        // Prevent infinite reload loops
        const reloadCount = parseInt(sessionStorage.getItem('chunkErrorReloadCount') || '0')
        
        if (reloadCount < 3) {
          sessionStorage.setItem('chunkErrorReloadCount', String(reloadCount + 1))
          
          // Small delay before reload to prevent race conditions
          setTimeout(() => {
            window.location.reload()
          }, 100)
        } else {
          console.error('Too many chunk load errors - manual refresh required')
          sessionStorage.removeItem('chunkErrorReloadCount')
        }
        
        event.preventDefault()
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason
      
      // Check if it's a ChunkLoadError in a promise
      if (
        error?.name === 'ChunkLoadError' ||
        error?.message?.includes('Loading chunk') ||
        error?.message?.includes('Failed to fetch dynamically imported module')
      ) {
        console.log('ChunkLoadError in promise - reloading page...')
        
        const reloadCount = parseInt(sessionStorage.getItem('chunkErrorReloadCount') || '0')
        
        if (reloadCount < 3) {
          sessionStorage.setItem('chunkErrorReloadCount', String(reloadCount + 1))
          
          setTimeout(() => {
            window.location.reload()
          }, 100)
        } else {
          console.error('Too many chunk load errors - manual refresh required')
          sessionStorage.removeItem('chunkErrorReloadCount')
        }
        
        event.preventDefault()
      }
    }

    // Reset reload count on successful navigation
    const resetReloadCount = () => {
      sessionStorage.removeItem('chunkErrorReloadCount')
    }

    // Listen for errors
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    
    // Reset counter on successful navigation
    router.prefetch = resetReloadCount as any

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [router])

  return null
}
