import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChunkLoadErrorHandler from '@/components/dashboard/ChunkLoadErrorHandler'

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

  // Redirect agent-role users to the dedicated agent portal
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'agent') {
    redirect('/agent/overview')
  }

  return (
    <div className="min-h-screen bg-white">
      <ChunkLoadErrorHandler />
      {children}
    </div>
  )
}
