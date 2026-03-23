'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback, useRef } from 'react'
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
  MessageSquare,
  DollarSign,
  Plus,
  ExternalLink,
  Star,
  TrendingUp,
  Handshake,
} from 'lucide-react'

interface AgentNavbarProps {
  user: {
    id: string
    email?: string
  }
  profile: {
    full_name?: string | null
    avatar_url?: string | null
    role?: string | null
  } | null
  agentId: string
  isPremier: boolean
  agentSlug?: string | null
  avgRating?: number | null
  totalReviews?: number | null
  agentType?: string | null
}

interface PortalNavItem {
  label: string
  href: string
  icon: React.ElementType
  description: string
  badge?: 'leads'
}

interface PortalNavGroup {
  label: string
  items: PortalNavItem[]
  activePatterns: string[]
}

const PORTAL_GROUPS: PortalNavGroup[] = [
  {
    label: 'Business',
    activePatterns: ['/agent/leads', '/agent/clients', '/agent/transactions', '/agent/commissions'],
    items: [
      { label: 'Leads',        href: '/agent/leads',        icon: Inbox,       description: 'Manage incoming and active leads',     badge: 'leads' },
      { label: 'Clients',      href: '/agent/clients',      icon: Handshake,   description: 'Track and nurture client relationships' },
      { label: 'Transactions', href: '/agent/transactions', icon: FileText,    description: 'Monitor active deals end-to-end'       },
      { label: 'Commissions',  href: '/agent/commissions',  icon: TrendingUp,  description: 'Review earnings and payment history'   },
    ],
  },
  {
    label: 'Communication',
    activePatterns: ['/agent/messages', '/agent/calendar'],
    items: [
      { label: 'Messages',  href: '/agent/messages',  icon: MessageSquare, description: 'Conversations with clients and colleagues' },
      { label: 'Calendar',  href: '/agent/calendar',  icon: Calendar,      description: 'Schedule viewings and appointments'       },
    ],
  },
]

const QUICK_ACTIONS = [
  { href: '/agent/leads?new=1',        label: 'Add Lead',            icon: Inbox },
  { href: '/agent/calendar?new=1',     label: 'Schedule Appointment', icon: Calendar },
  { href: '/agent/transactions?new=1', label: 'New Transaction',      icon: FileText },
]

function formatAgentType(type: string | null | undefined): string {
  switch (type) {
    case 'real_estate_agent': return 'Real Estate Agent'
    case 'property_manager':  return 'Property Manager'
    case 'home_builder':      return 'Home Builder'
    case 'photographer':      return 'Photographer'
    case 'other':             return 'Agent'
    default:                  return 'Agent'
  }
}

export function AgentNavbar({
  user,
  profile,
  agentId,
  isPremier,
  agentSlug,
  avgRating,
  totalReviews,
  agentType,
}: AgentNavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [mobileOpen, setMobileOpen]         = useState(false)
  const [userMenuOpen, setUserMenuOpen]     = useState(false)
  const [quickActionsOpen, setQuickActionsOpen] = useState(false)
  const [activeGroup, setActiveGroup]       = useState<string | null>(null)
  const [displayGroup, setDisplayGroup]     = useState<string | null>(null)
  const [newLeadCount, setNewLeadCount]     = useState(0)
  const [signingOut, setSigningOut]         = useState(false)

  const hideRef          = useRef<ReturnType<typeof setTimeout> | null>(null)
  const quickActionsRef  = useRef<HTMLDivElement>(null)
  const userMenuRef      = useRef<HTMLDivElement>(null)

  const userName    = profile?.full_name || user.email?.split('@')[0] || 'Agent'
  const userInitial = userName.charAt(0).toUpperCase()
  const userAvatar  = profile?.avatar_url

  // ── Mega panel helpers ──────────────────────────────────────────────────────
  const showGroup = useCallback((label: string) => {
    if (hideRef.current) clearTimeout(hideRef.current)
    setActiveGroup(label)
    setDisplayGroup(label)
    setQuickActionsOpen(false)
    setUserMenuOpen(false)
  }, [])

  const hideGroup = useCallback(() => {
    hideRef.current = setTimeout(() => setActiveGroup(null), 130)
  }, [])

  const keepGroup = useCallback(() => {
    if (hideRef.current) clearTimeout(hideRef.current)
  }, [])

  // ── Leads count ────────────────────────────────────────────────────────────
  const fetchNewLeads = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('assigned_to', agentId)
        .in('status', ['assigned', 'new'])
      if (!error) setNewLeadCount(count ?? 0)
    } catch {
      // leads table may not be available yet — badge stays at 0
    }
  }, [supabase, agentId])

  useEffect(() => {
    fetchNewLeads()
    const channel = supabase
      .channel('agent-leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads', filter: `assigned_to=eq.${agentId}` }, () => fetchNewLeads())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchNewLeads, supabase, agentId])

  // ── Close all on route change ───────────────────────────────────────────────
  useEffect(() => {
    setMobileOpen(false)
    setUserMenuOpen(false)
    setQuickActionsOpen(false)
    setActiveGroup(null)
  }, [pathname])

  // ── ESC / scroll close ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKey    = (e: KeyboardEvent)  => { if (e.key === 'Escape') setActiveGroup(null) }
    const onScroll = ()                  => { if (activeGroup) setActiveGroup(null) }
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { document.removeEventListener('keydown', onKey); window.removeEventListener('scroll', onScroll) }
  }, [activeGroup])

  // ── Outside-click close for Quick Actions / User Menu ─────────────────────
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (quickActionsRef.current && !quickActionsRef.current.contains(e.target as Node)) setQuickActionsOpen(false)
      if (userMenuRef.current       && !userMenuRef.current.contains(e.target as Node))       setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ── Scroll lock when mobile menu open ─────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/')
  }

  const isPathActive = (patterns: string[]) =>
    patterns.some(p => pathname === p || pathname.startsWith(p + '/'))

  const isMegaOpen   = activeGroup !== null
  const currentGroup = PORTAL_GROUPS.find(g => g.label === displayGroup)

  return (
    <>
      {/* ── Fixed header bar ────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E9ECEF] h-[60px]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-full flex items-center gap-2">

          {/* Logo */}
          <Link href="/agent/overview" className="flex items-center gap-2 shrink-0 mr-4 group">
            <Image src="/logo.svg" alt="Huts" width={80} height={28} className="h-7 w-auto transition-opacity group-hover:opacity-75" />
            <span className="text-[10px] font-semibold text-[#ADB5BD] uppercase tracking-widest hidden sm:block select-none">
              Agent Portal
            </span>
          </Link>

          {/* ── Desktop nav ─────────────────────────────────────────────── */}
          <nav className="hidden md:flex items-center h-full">
            {/* Overview — direct link */}
            <Link
              href="/agent/overview"
              className={`flex items-center gap-1.5 px-3 h-[60px] text-sm font-bold relative transition-colors duration-150 ${
                pathname === '/agent/overview'
                  ? 'text-[#111827] after:absolute after:bottom-0 after:inset-x-1 after:h-[3px] after:rounded-t after:bg-[#111827]'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              <LayoutDashboard size={13} strokeWidth={2} />
              Overview
            </Link>

            {/* Grouped mega triggers */}
            {PORTAL_GROUPS.map(group => {
              const isThisOpen   = group.label === activeGroup
              const isThisActive = isThisOpen || isPathActive(group.activePatterns)
              const hasLeadBadge = group.label === 'Business' && newLeadCount > 0

              return (
                <button
                  key={group.label}
                  onMouseEnter={() => showGroup(group.label)}
                  onMouseLeave={hideGroup}
                  onClick={() => (isThisOpen ? setActiveGroup(null) : showGroup(group.label))}
                  aria-expanded={isThisOpen}
                  aria-haspopup="true"
                  className={`relative flex items-center gap-1 px-3 h-[60px] text-sm font-bold transition-colors duration-150 ${
                    isThisActive
                      ? 'text-[#111827] after:absolute after:bottom-0 after:inset-x-1 after:h-[3px] after:rounded-t after:bg-[#111827]'
                      : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  {group.label}
                  {hasLeadBadge && (
                    <span className="flex items-center justify-center min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-bold rounded-full px-1">
                      {newLeadCount > 99 ? '99+' : newLeadCount}
                    </span>
                  )}
                  <ChevronDown
                    size={12}
                    strokeWidth={2.5}
                    className={`ml-0.5 transition-transform duration-200 ${isThisOpen ? 'rotate-180' : ''}`}
                  />
                </button>
              )
            })}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* ── Right: actions + user ───────────────────────────────────── */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Premier badge */}
            {isPremier && (
              <span className="hidden lg:flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                <Award size={11} />
                Premier
              </span>
            )}

            {/* Lead bell (mobile) */}
            {newLeadCount > 0 && (
              <Link href="/agent/leads" className="relative md:hidden p-1.5 text-[#495057] hover:text-[#212529]">
                <Bell size={18} />
                <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {newLeadCount > 9 ? '9+' : newLeadCount}
                </span>
              </Link>
            )}

            {/* Quick Add */}
            <div className="relative hidden md:block" ref={quickActionsRef}>
              <button
                onClick={() => { setQuickActionsOpen(!quickActionsOpen); setActiveGroup(null) }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] text-white text-sm font-semibold hover:bg-black transition-colors"
              >
                <Plus size={14} />
                <span className="hidden lg:block">Quick Add</span>
              </button>
              {quickActionsOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-[#E9ECEF] rounded-xl shadow-lg overflow-hidden z-50">
                  <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-[#ADB5BD] uppercase tracking-widest">Quick Actions</p>
                  {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => (
                    <Link key={href} href={href} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#495057] hover:bg-[#F9FAFB] transition-colors">
                      <Icon size={14} className="text-[#9CA3AF]" />
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => { setUserMenuOpen(!userMenuOpen); setActiveGroup(null) }}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-[#F9FAFB] transition-colors"
              >
                {userAvatar ? (
                  <Image src={userAvatar} alt={userName} width={28} height={28} className="rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#111827] text-white text-sm font-semibold flex items-center justify-center">
                    {userInitial}
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium text-[#212529] max-w-[120px] truncate">{userName}</span>
                <ChevronDown size={14} className="text-[#ADB5BD]" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-[#E9ECEF] rounded-xl shadow-lg overflow-hidden z-50">
                  {/* Identity */}
                  <div className="px-4 py-3.5 border-b border-[#E9ECEF]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#111827] truncate">{userName}</p>
                        <p className="text-xs text-[#9CA3AF] truncate mt-0.5">{formatAgentType(agentType)}</p>
                        {user.email && <p className="text-xs text-[#9CA3AF] truncate">{user.email}</p>}
                      </div>
                      {isPremier && (
                        <span className="shrink-0 flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                          <Award size={9} />
                          Premier
                        </span>
                      )}
                    </div>
                    {avgRating != null && avgRating > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <Star size={11} className="text-amber-500 fill-amber-500" />
                        <span className="text-xs font-semibold text-[#111827]">{avgRating.toFixed(1)}</span>
                        {totalReviews != null && totalReviews > 0 && (
                          <span className="text-xs text-[#9CA3AF]">· {totalReviews} review{totalReviews !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Menu items */}
                  <Link href="/agent/profile"   className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#495057] hover:bg-[#F9FAFB] transition-colors"><User size={14} className="text-[#9CA3AF]" />Edit Profile</Link>
                  {agentSlug && (
                    <Link href={`/agent/${agentSlug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#495057] hover:bg-[#F9FAFB] transition-colors">
                      <ExternalLink size={14} className="text-[#9CA3AF]" />
                      View Public Profile
                    </Link>
                  )}
                  <Link href="/settings"         className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#495057] hover:bg-[#F9FAFB] transition-colors"><Settings size={14} className="text-[#9CA3AF]" />Settings</Link>
                  <div className="border-t border-[#E9ECEF] mt-1">
                    <button onClick={handleSignOut} disabled={signingOut} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
                      <LogOut size={14} />
                      {signingOut ? 'Signing out…' : 'Sign Out'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-1.5 text-[#495057] hover:text-[#212529]" aria-label="Toggle menu">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Dim backdrop ────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 top-[60px] z-[48] bg-black transition-opacity duration-200 ${
          isMegaOpen ? 'opacity-[0.18] pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setActiveGroup(null)}
      />

      {/* ── Mega panel ──────────────────────────────────────────────────── */}
      <div
        role="navigation"
        aria-label={`${displayGroup ?? ''} menu`}
        aria-hidden={!isMegaOpen}
        onMouseEnter={keepGroup}
        onMouseLeave={hideGroup}
        className={`fixed top-[60px] left-0 right-0 z-[49] bg-white border-t border-[#E5E7EB] transition-all duration-200 ease-out ${
          isMegaOpen
            ? 'opacity-100 translate-y-0 shadow-[0_12px_40px_rgba(0,0,0,0.07)] pointer-events-auto'
            : 'opacity-0 -translate-y-2 shadow-none pointer-events-none'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 py-7 pb-8">
          <p className="text-[10.5px] font-semibold text-[#9CA3AF] uppercase tracking-[0.16em] mb-5 select-none">
            {currentGroup?.label}
          </p>
          <div className={`grid gap-1 ${currentGroup?.items.length === 2 ? 'grid-cols-2 max-w-lg' : 'grid-cols-2 lg:grid-cols-4'}`}>
            {currentGroup?.items.map(item => {
              const Icon = item.icon
              const hasLeadBadge = item.badge === 'leads' && newLeadCount > 0
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setActiveGroup(null)}
                  role="menuitem"
                  className="group relative flex items-start gap-3.5 px-4 py-[14px] rounded-2xl hover:bg-[#F9FAFB] active:bg-[#F3F4F6] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#111827] focus-visible:outline-offset-2"
                >
                  <div className="relative mt-[1px] w-[38px] h-[38px] rounded-xl border border-[#E5E7EB] bg-white group-hover:border-[#D1D5DB] group-hover:shadow-sm flex items-center justify-center shrink-0 transition-all duration-150">
                    <Icon size={17} strokeWidth={1.75} className="text-[#6B7280] group-hover:text-[#111827] transition-colors duration-150" />
                    {hasLeadBadge && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                        {newLeadCount > 99 ? '99+' : newLeadCount}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-[#1F2937] group-hover:text-[#111827] leading-snug transition-colors duration-150">
                      {item.label}
                    </p>
                    <p className="text-[12px] text-[#9CA3AF] mt-[3px] leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Mobile slide-down menu ──────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/20" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-[60px] left-0 right-0 bg-white border-b border-[#E9ECEF] shadow-lg max-h-[calc(100vh-3.75rem)] overflow-y-auto">

            {/* Identity */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-[#E9ECEF]">
              {userAvatar ? (
                <Image src={userAvatar} alt={userName} width={40} height={40} className="rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#111827] text-white text-base font-semibold flex items-center justify-center shrink-0">{userInitial}</div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#212529] truncate">{userName}</p>
                <p className="text-xs text-[#9CA3AF] truncate">{formatAgentType(agentType)}</p>
                {avgRating != null && avgRating > 0 && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star size={10} className="text-amber-500 fill-amber-500" />
                    <span className="text-xs font-medium text-[#495057]">{avgRating.toFixed(1)}</span>
                    {totalReviews != null && totalReviews > 0 && (
                      <span className="text-xs text-[#9CA3AF]">· {totalReviews}</span>
                    )}
                  </div>
                )}
              </div>
              {isPremier && (
                <span className="shrink-0 flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                  <Award size={9} />
                  Premier
                </span>
              )}
            </div>

            <nav className="flex flex-col p-3 gap-0.5">
              {/* Overview */}
              <Link
                href="/agent/overview"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  pathname === '/agent/overview' ? 'bg-[#111827] text-white' : 'text-[#495057] hover:bg-[#F9FAFB]'
                }`}
              >
                <LayoutDashboard size={16} />
                Overview
              </Link>

              {/* Groups */}
              {PORTAL_GROUPS.map(group => (
                <div key={group.label} className="mt-3">
                  <p className="px-4 pb-1 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest">{group.label}</p>
                  {group.items.map(({ href, label, icon: Icon, badge }) => {
                    const active    = pathname === href || pathname.startsWith(href + '/')
                    const leadBadge = badge === 'leads' && newLeadCount > 0
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                          active ? 'bg-[#111827] text-white' : 'text-[#495057] hover:bg-[#F9FAFB]'
                        }`}
                      >
                        <Icon size={16} />
                        {label}
                        {leadBadge && (
                          <span className="ml-auto min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                            {newLeadCount > 99 ? '99+' : newLeadCount}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              ))}

              {/* Quick Add */}
              <div className="border-t border-[#E9ECEF] mt-3 pt-3">
                <p className="px-4 pb-1 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest">Quick Add</p>
                {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#495057] hover:bg-[#F9FAFB] transition-colors">
                    <Icon size={16} />
                    {label}
                  </Link>
                ))}
              </div>

              {/* Account */}
              <div className="border-t border-[#E9ECEF] mt-3 pt-3">
                <p className="px-4 pb-1 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest">Account</p>
                <Link href="/agent/profile"  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#495057] hover:bg-[#F9FAFB] transition-colors"><User size={16} />Edit Profile</Link>
                {agentSlug && (
                  <Link href={`/agent/${agentSlug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#495057] hover:bg-[#F9FAFB] transition-colors">
                    <ExternalLink size={16} />
                    View Public Profile
                  </Link>
                )}
                <Link href="/settings"       className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#495057] hover:bg-[#F9FAFB] transition-colors"><Settings size={16} />Settings</Link>
                <button onClick={handleSignOut} disabled={signingOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
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
