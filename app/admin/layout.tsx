import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}
import type { LucideIcon } from 'lucide-react'
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  ShieldCheck,
  LogOut,
  ChevronRight,
} from 'lucide-react'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'chitangalawrence03@gmail.com').split(',').map(e => e.trim())

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signup')
  if (!ADMIN_EMAILS.includes(user.email || '')) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-muted">
      {/* Top Bar */}
      <div className="bg-muted text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-sm font-extrabold tracking-[3px] text-white/60 hover:text-white transition-colors">
                HUTS
              </Link>
              <ChevronRight size={14} className="text-white/20" />
              <span className="text-sm font-semibold">Admin</span>
              <span className="ml-2 px-2 py-0.5 bg-white/10 rounded text-[10px] font-bold uppercase tracking-wider">
                Admin Panel
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-white/40">{user.email}</span>
              <Link 
                href="/dashboard" 
                className="text-xs text-white/60 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 -mb-px">
            <AdminNavLink href="/admin" icon={LayoutDashboard} label="Overview" />
            <AdminNavLink href="/admin/verification" icon={ShieldCheck} label="Verification" />
            <AdminNavLink href="/admin/properties" icon={Building2} label="Properties" />
            <AdminNavLink href="/admin/users" icon={Users} label="Users" />
          </nav>
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  )
}

function AdminNavLink({ 
  href, 
  icon: Icon, 
  label 
}: { 
  href: string
  icon: LucideIcon
  label: string 
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground hover:text-foreground border-b-2 border-transparent hover:border-border transition-all"
    >
      <Icon size={15} />
      {label}
    </Link>
  )
}
