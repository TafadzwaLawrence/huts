import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect non-authenticated users to login
  if (!user) {
    redirect('/auth/signup')
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
