import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SettingsSidebar } from "@/components/settings/SettingsSidebar"

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/signup")

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <SettingsSidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  )
}
