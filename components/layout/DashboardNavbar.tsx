'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Heart, 
  LogOut, 
  Search, 
  Bell, 
  Settings, 
  User,
  Users,
  Building2,
  Menu,
  X,
  ChevronDown,
  Star,
  LayoutDashboard,
  MapPin,
  Eye,
  Briefcase,
  Mail,
  Handshake,
  Calendar,
} from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { NotificationDropdown } from './NotificationDropdown'

interface DashboardNavbarProps {
  user: {
    email?: string
    user_metadata?: {
      full_name?: string
      name?: string
      avatar_url?: string
    }
  }
  profile?: {
    full_name?: string
    role?: string
    avatar_url?: string
  }
}

export function DashboardNavbar({ user, profile }: DashboardNavbarProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [hasAgentProfile, setHasAgentProfile] = useState(false)
  const supabase = createClient()

  const isLandlord = profile?.role === 'landlord'
  const userName = profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'
  const userInitial = userName.charAt(0).toUpperCase()
  const userAvatar = profile?.avatar_url || user.user_metadata?.avatar_url

  // Check if user has an agent record in the new agents table
  const checkAgentProfile = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      const { data: agent } = await supabase
        .from('agents')
        .select('id')
        .eq('user_id', authUser.id)
        .single()

      setHasAgentProfile(!!agent)
    } catch {
      setHasAgentProfile(false)
    }
  }, [supabase])

  useEffect(() => {
    checkAgentProfile()
  }, [checkAgentProfile])

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const mainNavLinks = isLandlord ? [
    { href: '/dashboard/overview', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/my-properties', label: 'Properties', icon: Building2 },
    { href: '/dashboard/rent-management', label: 'Rent', icon: Handshake },
    { href: '/dashboard/map', label: 'Map', icon: MapPin },
    { href: '/dashboard/reviews', label: 'Reviews', icon: Star },
    ...(hasAgentProfile ? [
      { href: '/agent/overview', label: 'Agent Portal', icon: Briefcase },
    ] : [])
  ] : [
    { href: '/dashboard/overview', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/saved', label: 'Saved', icon: Heart },
    ...(hasAgentProfile ? [
      { href: '/agent/overview', label: 'Agent Portal', icon: Briefcase },
    ] : [])
  ]

  const isActive = (href: string) => pathname === href

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white border-b border-[#E9ECEF]'
      }`}>
        <nav>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left: Logo + Nav */}
              <div className="flex items-center gap-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group shrink-0">
                  <img
                    src="/logo.svg"
                    alt=""
                    width={24}
                    height={24}
                    className="h-6 w-6 object-contain group-hover:opacity-75 transition-opacity"
                  />
                </Link>

                {/* Desktop Nav Links */}
                <div className="hidden lg:flex items-center gap-1">
                  {mainNavLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className={`relative flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive(href)
                          ? 'text-[#212529] bg-[#F8F9FA]'
                          : 'text-[#495057] hover:text-[#212529] hover:bg-[#F8F9FA]'
                      }`}
                    >
                      <Icon size={16} />
                      {label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Right: Actions + User */}
              <div className="flex items-center">
                {/* Action Buttons Group - Desktop */}
                <div className="hidden md:flex items-center gap-1 mr-4">
                  <Link
                    href="/search"
                    className="px-3 py-2 text-sm font-medium text-[#495057] hover:text-[#212529] hover:bg-[#F8F9FA] rounded-lg transition-colors"
                  >
                    Browse
                  </Link>
                  
                  {isLandlord && (
                    <Link
                      href="/dashboard/new-property"
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#212529] text-white text-sm font-medium rounded-lg hover:bg-black transition-colors"
                    >
                      <span>New</span>
                    </Link>
                  )}
                </div>

                {/* Utilities Group - Desktop */}
                <div className="hidden md:flex items-center gap-1 mr-3 pr-3 border-r border-[#E9ECEF]">
                  <NotificationDropdown onUnreadCountChange={setUnreadCount} />
                  
                  <Link
                    href="/settings"
                    className="p-2 rounded-lg text-[#495057] hover:text-[#212529] hover:bg-[#F8F9FA] transition-colors"
                  >
                    <Settings size={18} />
                  </Link>
                </div>

                {/* User Profile - Desktop */}
                <div className="hidden md:block relative group">
                  <button className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg hover:bg-[#F8F9FA] transition-colors">
                    {userAvatar ? (
                      <Image
                        src={userAvatar}
                        alt={userName}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-[#212529] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {userInitial}
                      </div>
                    )}
                    <div className="hidden xl:block text-left">
                      <p className="text-sm font-medium text-[#212529] leading-tight">{userName.split(' ')[0]}</p>
                      <p className="text-xs text-[#ADB5BD] capitalize leading-tight">{profile?.role}</p>
                    </div>
                    <ChevronDown size={14} className="text-[#ADB5BD] hidden xl:block" />
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="bg-white rounded-lg shadow-xl border border-[#E9ECEF] py-2 min-w-[200px]">
                      <div className="px-4 py-2 border-b border-[#E9ECEF]">
                        <p className="font-medium text-[#212529] text-sm">{userName}</p>
                        <p className="text-xs text-[#ADB5BD] truncate">{user.email}</p>
                      </div>
                      
                      <div className="py-2">
                        <Link
                          href="/dashboard/overview"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-[#495057] hover:bg-[#F8F9FA] transition-colors"
                        >
                          <LayoutDashboard size={16} />
                          Dashboard
                        </Link>
                        <Link
                          href="/settings/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-[#495057] hover:bg-[#F8F9FA] transition-colors"
                        >
                          <User size={16} />
                          Profile
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-[#495057] hover:bg-[#F8F9FA] transition-colors"
                        >
                          <Settings size={16} />
                          Settings
                        </Link>
                      </div>
                      
                      <div className="border-t border-[#E9ECEF] pt-2">
                        <form action="/auth/signout" method="post">
                          <button
                            type="submit"
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-[#495057] hover:bg-[#FFF5F5] hover:text-[#FF6B6B] transition-colors"
                          >
                            <LogOut size={16} />
                            Sign Out
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="flex md:hidden items-center justify-center w-10 h-10 rounded-lg text-[#495057] hover:bg-[#F8F9FA] transition-colors"
                >
                  <Menu size={20} />
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl transform transition-transform duration-300 md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E9ECEF]">
          <div className="flex items-center gap-3">
            {userAvatar ? (
              <Image
                src={userAvatar}
                alt={userName}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-[#212529] rounded-full flex items-center justify-center text-white font-semibold">
                {userInitial}
              </div>
            )}
            <div>
              <p className="font-medium text-[#212529]">{userName}</p>
              <p className="text-xs text-[#ADB5BD] capitalize">{profile?.role}</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg text-[#495057] hover:bg-[#F8F9FA] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu Content */}
        <div className="flex flex-col h-[calc(100%-73px)]">
          {/* Navigation */}
          <div className="p-4 space-y-1">
            {mainNavLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive(href)
                    ? 'bg-[#212529] text-white'
                    : 'text-[#495057] hover:bg-[#F8F9FA]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} />
                  {label}
                </div>
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-[#E9ECEF] space-y-1">
            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#495057] hover:bg-[#F8F9FA] font-medium transition-colors"
            >
              <Search size={20} />
              Browse Properties
            </Link>
            {isLandlord && (
              <Link
                href="/dashboard/new-property"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#212529] text-white font-medium transition-colors"
              >
                New Property
              </Link>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-grow" />

          {/* Bottom Actions */}
          <div className="p-4 border-t border-[#E9ECEF] space-y-1">
            <Link
              href="/settings/notifications"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-lg text-[#495057] hover:bg-[#F8F9FA] font-medium transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bell size={20} />
                Notifications
              </div>
              {unreadCount > 0 && (
                <span className="bg-[#FF6B6B] text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#495057] hover:bg-[#F8F9FA] font-medium transition-colors"
            >
              <Settings size={20} />
              Settings
            </Link>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-[#495057] hover:bg-[#FFF5F5] hover:text-[#FF6B6B] font-medium transition-colors"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
