'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Inbox,
  Users,
  Calendar,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Award,
  Menu,
  X,
  Bell,
  FileText,
} from 'lucide-react'

interface AgentNavbarProps {
  user: {
    id: string
    email?: string
  }
  profile: {
    name?: string | null
    avatar_url?: string | null
    role?: string | null
  } | null
  agentId: string
  isPremier: boolean
}

const NAV_LINKS = [
  { href: '/agent/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/agent/leads', label: 'Leads', icon: Inbox },
  { href: '/agent/transactions', label: 'Transactions', icon: FileText },
  { href: '/agent/clients', label: 'Clients', icon: Users },
  { href: '/agent/calendar', label: 'Calendar', icon: Calendar },
  { href: '/agent/profile', label: 'My Profile', icon: User },
]

export function AgentNavbar({ user, profile, agentId, isPremier }: AgentNavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [newLeadCount, setNewLeadCount] = useState(0)
  const [signingOut, setSigningOut] = useState(false)

  const userName =
    profile?.name || user.email?.split('@')[0] || 'Agent'
  const userInitial = userName.charAt(0).toUpperCase()
  const userAvatar = profile?.avatar_url

  const fetchNewLeads = useCallback(async () => {
    const { count } = await supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('assigned_to', agentId)
      .in('status', ['assigned', 'new'])

    setNewLeadCount(count ?? 0)
  }, [supabase, agentId])

  useEffect(() => {
    fetchNewLeads()

    // Real-time subscription for new lead count
    const channel = supabase
      .channel('agent-leads')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads', filter: `assigned_to=eq.${agentId}` },
        () => fetchNewLeads(),
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchNewLeads, supabase, agentId])

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false)
    setUserMenuOpen(false)
  }, [pathname])

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/')
  }

  const isActive = (href: string) =>
    pathname === href || (href !== '/agent/overview' && pathname.startsWith(href))

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E9ECEF] h-14">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/agent/overview" className="flex items-center gap-2 shrink-0">
            <Image src="/logo.svg" alt="Huts" width={80} height={28} className="h-7 w-auto" />
            <span className="text-[10px] font-semibold text-[#ADB5BD] uppercase tracking-widest hidden sm:block">
              Agent Portal
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = isActive(href)
              const isLeads = href === '/agent/leads'
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-black text-white'
                      : 'text-[#495057] hover:bg-[#F8F9FA] hover:text-[#212529]'
                  }`}
                >
                  <Icon size={14} />
                  {label}
                  {isLeads && newLeadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {newLeadCount > 99 ? '99+' : newLeadCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Premier badge */}
            {isPremier && (
              <span className="hidden sm:flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                <Award size={11} />
                Premier
              </span>
            )}

            {/* Leads bell (mobile) */}
            {newLeadCount > 0 && (
              <Link
                href="/agent/leads"
                className="relative md:hidden p-1.5 text-[#495057] hover:text-[#212529]"
              >
                <Bell size={18} />
                <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {newLeadCount > 9 ? '9+' : newLeadCount}
                </span>
              </Link>
            )}

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-[#F8F9FA] transition-colors"
              >
                {userAvatar ? (
                  <Image
                    src={userAvatar}
                    alt={userName}
                    width={28}
                    height={28}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-black text-white text-sm font-semibold flex items-center justify-center">
                    {userInitial}
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium text-[#212529] max-w-[120px] truncate">
                  {userName}
                </span>
                <ChevronDown size={14} className="text-[#ADB5BD]" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-[#E9ECEF] rounded-xl shadow-lg py-1 z-50">
                  <div className="px-4 py-2.5 border-b border-[#E9ECEF]">
                    <p className="text-sm font-semibold text-[#212529] truncate">{userName}</p>
                    <p className="text-xs text-[#ADB5BD] truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/agent/profile"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#495057] hover:bg-[#F8F9FA] transition-colors"
                  >
                    <User size={14} />
                    Edit Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#495057] hover:bg-[#F8F9FA] transition-colors"
                  >
                    <Settings size={14} />
                    Settings
                  </Link>
                  <div className="border-t border-[#E9ECEF] mt-1 pt-1">
                    <button
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <LogOut size={14} />
                      {signingOut ? 'Signing out…' : 'Sign Out'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1.5 text-[#495057] hover:text-[#212529]"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-14 left-0 right-0 bg-white border-b border-[#E9ECEF] shadow-lg">
            <nav className="flex flex-col p-3 gap-1">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const active = isActive(href)
                const isLeads = href === '/agent/leads'
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? 'bg-black text-white'
                        : 'text-[#495057] hover:bg-[#F8F9FA]'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                    {isLeads && newLeadCount > 0 && (
                      <span className="ml-auto min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {newLeadCount > 99 ? '99+' : newLeadCount}
                      </span>
                    )}
                  </Link>
                )
              })}
              <div className="border-t border-[#E9ECEF] mt-2 pt-2">
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <LogOut size={16} />
                  {signingOut ? 'Signing out…' : 'Sign Out'}
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
