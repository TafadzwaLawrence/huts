'use client'

import { HashbrownProvider } from '@hashbrownai/react'

export function HashbrownClientProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <HashbrownProvider url="/api/hashbrown">
      {children}
    </HashbrownProvider>
  )
}
