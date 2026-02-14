'use client'

import { HashbrownProvider } from '@hashbrownai/react'

export function AIProvider({ children }: { children: React.ReactNode }) {
  return (
    <HashbrownProvider url="/api/ai/chat">
      {children}
    </HashbrownProvider>
  )
}
