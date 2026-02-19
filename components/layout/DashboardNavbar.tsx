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
  Building2,
  Menu,
  X,
  ChevronDown,
  Star,
  LayoutDashboard,
  MapPin,
  Check,
  Eye,
  MessageSquare
} from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Notification {
  id: string
  type: 'message' | 'inquiry' | 'review' | 'property_update' | 'system'
  title: string
  description: string | null
  link: string | null
  read_at: string | null
  created_at: string
  metadata: Record<string, any>
}

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
    name?: string
    role?: string
    avatar_url?: string
  }
}

export function DashboardNavbar({ user, profile }: DashboardNavbarProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [loadingNotifications, setLoadingNotifications] = useState(true)
  const notificationRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const isLandlord = profile?.role === 'landlord'
  const userName = profile?.name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'
  const userInitial = userName.charAt(0).toUpperCase()
  const userAvatar = profile?.avatar_url || user.user_metadata?.avatar_url

  // Helper function to format time ago
  const timeAgo = (date: string) => {
    const now = new Date()
    const past = new Date(date)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return past.toLocaleDateString()
  }

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
        // Count message notifications for badge
        const messageCount = (data.notifications || []).filter(
          (n: Notification) => n.type === 'message' && !n.read_at
        ).length
        setUnreadMessages(messageCount)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoadingNotifications(false)
    }
  }, [])

  // Fetch notifications on mount and subscribe to realtime updates
  useEffect(() => {
    fetchNotifications()

    // Subscribe to real-time notification updates
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          // Add new notification to the list
          setNotifications(prev => [payload.new as Notification, ...prev])
          setUnreadCount(prev => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchNotifications, supabase])

  // Close notification dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id })
      })
      setNotifications(prev => prev.map(n => n.id === id ? {...n, read_at: new Date().toISOString()} : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true })
      })
      setNotifications(prev => prev.map(n => ({...n, read_at: new Date().toISOString()})))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

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
    { href: '/dashboard/map', label: 'Map', icon: MapPin },
    { href: '/dashboard/reviews', label: 'Reviews', icon: Star },
  ] : [
    { href: '/dashboard/overview', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/saved', label: 'Saved', icon: Heart },
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
                  <Image
                    src="/logo.png"
                    alt="Huts"
                    width={36}
                    height={36}
                    priority
                    className="h-9 w-9 object-contain group-hover:opacity-80 transition-opacity"
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
                  {/* Notification Bell with Dropdown */}
                  <div className="relative" ref={notificationRef}>
                    <button 
                      onClick={() => setNotificationsOpen(!notificationsOpen)}
                      className="relative p-2 rounded-lg text-[#495057] hover:text-[#212529] hover:bg-[#F8F9FA] transition-colors"
                    >
                      <Bell size={18} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF6B6B] rounded-full" />
                      )}
                    </button>

                    {/* Notification Dropdown */}
                    {notificationsOpen && (
                      <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#E9ECEF] overflow-hidden z-50">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E9ECEF]">
                          <h3 className="font-semibold text-[#212529]">Notifications</h3>
                          {unreadCount > 0 && (
                            <button 
                              onClick={markAllAsRead}
                              className="text-xs text-[#495057] hover:text-[#212529] transition-colors flex items-center gap-1"
                            >
                              <Check size={12} />
                              Mark all read
                            </button>
                          )}
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="py-8 text-center text-[#ADB5BD]">
                              <Bell size={24} className="mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No notifications yet</p>
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <Link
                                key={notification.id}
                                href={notification.link || '/dashboard'}
                                onClick={() => {
                                  if (!notification.read_at) markAsRead(notification.id)
                                  setNotificationsOpen(false)
                                }}
                                className={`flex items-start gap-3 px-4 py-3 hover:bg-[#F8F9FA] transition-colors border-b border-[#E9ECEF] last:border-0 ${
                                  !notification.read_at ? 'bg-[#F8F9FA]/50' : ''
                                }`}
                              >
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  notification.type === 'message' ? 'bg-blue-100' :
                                  notification.type === 'inquiry' ? 'bg-green-100' :
                                  notification.type === 'review' ? 'bg-yellow-100' : 'bg-[#F8F9FA]'
                                }`}>
                                  {notification.type === 'message' && <MessageSquare size={16} className="text-blue-600" />}
                                  {notification.type === 'inquiry' && <Building2 size={16} className="text-green-600" />}
                                  {notification.type === 'review' && <Star size={16} className="text-yellow-600" />}
                                  {notification.type === 'property_update' && <Building2 size={16} className="text-purple-600" />}
                                  {notification.type === 'system' && <Bell size={16} className="text-gray-600" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm text-[#212529]">{notification.title}</p>
                                    {!notification.read_at && (
                                      <span className="w-2 h-2 bg-[#FF6B6B] rounded-full flex-shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-xs text-[#495057] truncate">{notification.description}</p>
                                  <p className="text-xs text-[#ADB5BD] mt-0.5">{timeAgo(notification.created_at)}</p>
                                </div>
                              </Link>
                            ))
                          )}
                        </div>

                        <div className="border-t border-[#E9ECEF]">
                          <Link
                            href="/settings/notifications"
                            onClick={() => setNotificationsOpen(false)}
                            className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-[#495057] hover:bg-[#F8F9FA] transition-colors"
                          >
                            <Settings size={14} />
                            Notification Settings
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                  
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
