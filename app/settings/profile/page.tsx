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

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, phone, bio, role, avatar_url')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/dashboard')

  return (
    <div className="max-w-2xl">
      <ProfileForm 
        profile={profile as Profile} 
        userEmail={user.email || ''} 
        createdAt={user.created_at || new Date().toISOString()}
      />
    </div>
  )
}
