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

const NAV_LINKS = [
  { href: '/agent/overview',     label: 'Overview',     icon: LayoutDashboard },
  { href: '/agent/leads',        label: 'Leads',        icon: Inbox },
  { href: '/agent/clients',      label: 'Clients',      icon: Users },
  { href: '/agent/transactions', label: 'Transactions', icon: FileText },
  { href: '/agent/commissions',  label: 'Commissions',  icon: DollarSign },
  { href: '/agent/messages',     label: 'Messages',     icon: MessageSquare },
  { href: '/agent/calendar',     label: 'Calendar',     icon: Calendar },
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

  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [quickActionsOpen, setQuickActionsOpen] = useState(false)
  const [newLeadCount, setNewLeadCount] = useState(0)
  const [signingOut, setSigningOut] = useState(false)

  const quickActionsRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const userName =
    profile?.full_name || user.email?.split('@')[0] || 'Agent'
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
    setQuickActionsOpen(false)
  }, [pathname])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (quickActionsRef.current && !quickActionsRef.current.contains(e.target as Node)) {
        setQuickActionsOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

            {/* Quick Actions */}
            <div className="relative hidden md:block" ref={quickActionsRef}>
              <button
                onClick={() => setQuickActionsOpen(!quickActionsOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black text-white text-sm font-medium hover:bg-[#212529] transition-colors"
                aria-label="Quick actions"
              >
                <Plus size={14} />
                <span className="hidden lg:block">Quick Add</span>
              </button>
              {quickActionsOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-[#E9ECEF] rounded-xl shadow-lg py-1 z-50">
                  <p className="px-4 py-2 text-[10px] font-semibold text-[#ADB5BD] uppercase tracking-widest">Quick Actions</p>
                  {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#495057] hover:bg-[#F8F9FA] transition-colors"
                    >
                      <Icon size={14} />
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
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
                <div className="absolute right-0 top-full mt-1 w-60 bg-white border border-[#E9ECEF] rounded-xl shadow-lg py-1 z-50">
                  {/* Identity block */}
                  <div className="px-4 py-3 border-b border-[#E9ECEF]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#212529] truncate">{userName}</p>
                        <p className="text-xs text-[#ADB5BD] truncate mt-0.5">{formatAgentType(agentType)}</p>
                        {user.email && (
                          <p className="text-xs text-[#ADB5BD] truncate">{user.email}</p>
                        )}
                      </div>
                      {isPremier && (
                        <span className="shrink-0 flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                          <Award size={9} />
                          Premier
                        </span>
                      )}
                    </div>
                    {/* Rating */}
                    {avgRating != null && avgRating > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <Star size={11} className="text-amber-500 fill-amber-500" />
                        <span className="text-xs font-semibold text-[#212529]">{avgRating.toFixed(1)}</span>
                        {totalReviews != null && totalReviews > 0 && (
                          <span className="text-xs text-[#ADB5BD]">· {totalReviews} review{totalReviews !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <Link
                    href="/agent/profile"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#495057] hover:bg-[#F8F9FA] transition-colors"
                  >
                    <User size={14} />
                    Edit Profile
                  </Link>
                  {agentSlug && (
                    <Link
                      href={`/agent/${agentSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#495057] hover:bg-[#F8F9FA] transition-colors"
                    >
                      <ExternalLink size={14} />
                      View Public Profile
                    </Link>
                  )}
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
          <div className="absolute top-14 left-0 right-0 bg-white border-b border-[#E9ECEF] shadow-lg max-h-[calc(100vh-3.5rem)] overflow-y-auto">
            {/* Mobile identity block */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-[#E9ECEF]">
              {userAvatar ? (
                <Image
                  src={userAvatar}
                  alt={userName}
                  width={40}
                  height={40}
                  className="rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-black text-white text-base font-semibold flex items-center justify-center shrink-0">
                  {userInitial}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#212529] truncate">{userName}</p>
                <p className="text-xs text-[#ADB5BD] truncate">{formatAgentType(agentType)}</p>
                {avgRating != null && avgRating > 0 && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star size={10} className="text-amber-500 fill-amber-500" />
                    <span className="text-xs font-medium text-[#495057]">{avgRating.toFixed(1)}</span>
                    {totalReviews != null && totalReviews > 0 && (
                      <span className="text-xs text-[#ADB5BD]">· {totalReviews} review{totalReviews !== 1 ? 's' : ''}</span>
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

              {/* Quick actions section */}
              <div className="border-t border-[#E9ECEF] mt-2 pt-2">
                <p className="px-4 py-1.5 text-[10px] font-semibold text-[#ADB5BD] uppercase tracking-widest">Quick Add</p>
                {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#495057] hover:bg-[#F8F9FA] transition-colors"
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                ))}
              </div>

              {/* Profile / settings */}
              <div className="border-t border-[#E9ECEF] mt-2 pt-2">
                <Link
                  href="/agent/profile"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#495057] hover:bg-[#F8F9FA] transition-colors"
                >
                  <User size={16} />
                  Edit Profile
                </Link>
                {agentSlug && (
                  <Link
                    href={`/agent/${agentSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#495057] hover:bg-[#F8F9FA] transition-colors"
                  >
                    <ExternalLink size={16} />
                    View Public Profile
                  </Link>
                )}
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#495057] hover:bg-[#F8F9FA] transition-colors"
                >
                  <Settings size={16} />
                  Settings
                </Link>
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
