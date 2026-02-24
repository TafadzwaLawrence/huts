'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface LayoutChromeProps {
  children: ReactNode
  navbar: ReactNode
  footer: ReactNode
  bottomTabBar: ReactNode
  chatWidget: ReactNode
}

export function LayoutChrome({ children, navbar, footer, bottomTabBar, chatWidget }: LayoutChromeProps) {
  const pathname = usePathname()
  
  // Routes where chrome (navbar, footer, etc.) should be hidden
  const isAdminRoute = pathname.startsWith('/admin')
  const isAuthRoute = pathname.startsWith('/auth')
  const hideChrome = isAdminRoute || isAuthRoute

  return (
    <>
      {!hideChrome && (
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
      )}
      
      {!hideChrome && navbar}
      
      <main id="main-content" className={hideChrome ? 'min-h-screen' : 'min-h-screen pb-14 md:pb-0'}>
        {children}
      </main>
      
      {!hideChrome && footer}
      {!hideChrome && bottomTabBar}
      {!hideChrome && chatWidget}
    </>
  )
}
