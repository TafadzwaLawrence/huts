'use client'

import { useEffect, useCallback, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NProgress from 'nprogress'

// Configure NProgress
NProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.1,
})

export function NProgressProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isNavigating = useRef(false)

  // Complete progress when route changes
  useEffect(() => {
    if (isNavigating.current) {
      NProgress.done()
      isNavigating.current = false
    }
  }, [pathname, searchParams])

  // Start progress on link click
  const handleClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement
    const anchor = target.closest('a')
    
    if (anchor) {
      const href = anchor.getAttribute('href')
      const isInternal = href?.startsWith('/') || href?.startsWith(window.location.origin)
      const isSamePageAnchor = href?.startsWith('#')
      const isNewTab = anchor.getAttribute('target') === '_blank'
      const isDownload = anchor.hasAttribute('download')
      
      if (isInternal && !isSamePageAnchor && !isNewTab && !isDownload) {
        // Check if it's a different page
        const url = new URL(href!, window.location.origin)
        const currentUrl = new URL(window.location.href)
        
        if (url.pathname !== currentUrl.pathname || url.search !== currentUrl.search) {
          isNavigating.current = true
          NProgress.start()
        }
      }
    }
  }, [])

  useEffect(() => {
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [handleClick])

  return <>{children}</>
}

