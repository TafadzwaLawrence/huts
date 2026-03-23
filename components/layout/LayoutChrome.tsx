'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface LayoutChromeProps {
  children: ReactNode
  navbar: ReactNode
  footer: ReactNode
  chatWidget: ReactNode
}

export function LayoutChrome({ children, navbar, footer, chatWidget }: LayoutChromeProps) {
  const pathname = usePathname()
  
  // Routes where chrome (navbar, footer, etc.) should be hidden
  const isAdminRoute = pathname.startsWith('/admin')
  const isAuthRoute = pathname.startsWith('/auth')
  const isAgentsSignup = pathname.startsWith('/agents/signup')
  // Agent portal has its own AgentNavbar — hide global chrome for portal routes
  // (public agent profiles at /agent/[slug] are NOT in this list and keep the global chrome)
  const isAgentPortal = /^\/agent\/(overview|leads|clients|transactions|commissions|messages|calendar|profile)(\/|$)/.test(pathname)
  const hideChrome = isAdminRoute || isAuthRoute || isAgentsSignup || isAgentPortal

  return (
    <>
      {!hideChrome && (
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
      )}
      
      {!hideChrome && navbar}
      
      <main id="main-content" className="min-h-screen">
        {children}
      </main>
      
      {!hideChrome && footer}
      {!hideChrome && chatWidget}
    </>
  )
}
