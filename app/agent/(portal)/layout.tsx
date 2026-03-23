import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AgentNavbar } from '@/components/layout/AgentNavbar'

export default async function AgentPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signup')
  }

  // Fetch profile + agent record in parallel
  const [{ data: profile }, { data: agent }] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, role, avatar_url')
      .eq('id', user.id)
      .single(),
    supabase
      .from('agents')
      .select('id, is_premier, slug, avg_rating, total_reviews, agent_type')
      .eq('user_id', user.id)
      .single(),
  ])

  // User must have an agents record to access the portal
  // (role='agent' users who haven't finished registration are redirected to signup)
  if (!agent) {
    redirect('/agents/signup')
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <AgentNavbar
        user={{ id: user.id, email: user.email }}
        profile={profile}
        agentId={agent.id}
        isPremier={agent.is_premier ?? false}
        agentSlug={agent.slug ?? null}
        avgRating={agent.avg_rating ?? null}
        totalReviews={agent.total_reviews ?? null}
        agentType={agent.agent_type ?? null}
      />
      <main className="pt-[60px]">{children}</main>
    </div>
  )
}
