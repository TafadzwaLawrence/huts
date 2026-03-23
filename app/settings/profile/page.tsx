import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from '@/components/settings/ProfileForm'
import type { Profile } from '@/types'

export const metadata = {
  title: 'Profile Settings | Huts',
  description: 'Manage your profile information',
}

export default async function ProfileSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/dashboard')

  const [{ data: profile }, { data: agent }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, email, phone, bio, role, avatar_url, city, area, verified, created_at, updated_at')
      .eq('id', user.id)
      .single(),
    supabase
      .from('agents')
      .select('id, agent_type, is_premier, slug')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  if (!profile) redirect('/dashboard')

  return (
    <div>
      <ProfileForm
        profile={profile as Profile}
        userEmail={user.email || ''}
        createdAt={user.created_at || new Date().toISOString()}
        isAgent={!!agent}
        agentType={agent?.agent_type ?? null}
        isPremier={agent?.is_premier ?? false}
        agentSlug={agent?.slug ?? null}
      />
    </div>
  )
}
