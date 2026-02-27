'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Search, MapPin, Home, Heart, User, PlusCircle, LogOut, ChevronRight, Key, Bell, HelpCircle, Shield, Building2 } from 'lucide-react'

interface MobileMenuProps {
  isLoggedIn: boolean
  userName?: string
  userEmail?: string
  userAvatar?: string
  userInitial?: string
  isLandlord?: boolean
  unreadMessages?: number
}

export function MobileMenu({ isLoggedIn, userName, userEmail, userAvatar, userInitial, isLandlord, unreadMessages = 0 }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const navLinks = [
    { href: '/search', label: 'Browse all', icon: Search },
    { href: '/search?type=rent', label: 'For rent', icon: Key },
    { href: '/search?type=sale', label: 'For sale', icon: Building2 },
    { href: '/areas', label: 'Areas', icon: MapPin },
  ]

  const agentLinks = [
    { href: '/find-agent', label: 'Find an agent', icon: User },
    { href: '/agents/signup', label: 'Become an agent', icon: PlusCircle },
    { href: '/help', label: 'Agent resources', icon: HelpCircle },
  ]

  const userLinks = isLoggedIn
    ? isLandlord
      ? [
          { href: '/dashboard/overview', label: 'Dashboard', icon: User },
          { href: '/dashboard/my-properties', label: 'My properties', icon: Building2 },
          { href: '/dashboard/reviews', label: 'Reviews', icon: Heart },
          { href: '/settings', label: 'Settings', icon: Shield },
        ]
      : [
          { href: '/dashboard/overview', label: 'Dashboard', icon: User },
          { href: '/dashboard/saved', label: 'Saved properties', icon: Heart },
          { href: '/settings', label: 'Settings', icon: Shield },
        ]
    : []

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-[#212529] hover:bg-[#F8F9FA] rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Open menu"
      >
        <Menu size={24} strokeWidth={2} />
        {/* Notification Badge */}
        {unreadMessages > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF6B6B] rounded-full" />
        )}
      </button>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Slide-out Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-white z-50 shadow-lg transform transition-transform duration-250 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#E9ECEF]">
          <Link href="/" onClick={() => setIsOpen(false)}>
            <Image
              src="/logo.png"
              alt="Huts"
              width={100}
              height={32}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg text-[#495057] hover:text-[#212529] hover:bg-[#F8F9FA] min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Quick Search Bar */}
        <div className="px-4 py-3 border-b border-[#E9ECEF]">
          <Link
            href="/search"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg hover:border-[#495057] transition-colors"
          >
            <Search size={18} className="text-[#495057]" />
            <span className="text-sm text-[#495057]">Search properties</span>
          </Link>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100%-120px)] overflow-y-auto">
          {/* User Profile Card (when logged in) */}
          {isLoggedIn && (
            <div className="px-4 py-3 border-b border-[#E9ECEF]">
              <Link
                href="/dashboard/overview"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 bg-[#F8F9FA] rounded-lg hover:bg-[#E9ECEF] transition-colors"
              >
                {userAvatar ? (
                  <Image
                    src={userAvatar}
                    alt={userName || 'User'}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-[#212529] flex items-center justify-center text-white font-medium text-sm">
                    {userInitial || 'U'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#212529] truncate">{userName || 'Welcome back'}</p>
                  <p className="text-xs text-[#495057] truncate">{userEmail || 'View dashboard'}</p>
                </div>
                <ChevronRight size={16} className="text-[#ADB5BD] shrink-0" />
              </Link>
            </div>
          )}



          {/* Explore Links */}
          <div className="py-2">
            <p className="text-xs font-medium text-[#495057] px-4 py-2">Browse properties</p>
            <div className="space-y-0.5">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href + label}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-4 py-3 text-[#212529] hover:bg-[#F8F9FA] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} className="text-[#495057]" strokeWidth={2} />
                    <span className="font-medium text-sm">{label}</span>
                  </div>
                  <ChevronRight size={16} className="text-[#ADB5BD]" />
                </Link>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#E9ECEF] my-2" />

          {/* Agents Section */}
          <div className="py-2">
            <p className="text-xs font-medium text-[#495057] px-4 py-2">Agents</p>
            <div className="space-y-0.5">
              {agentLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-4 py-3 text-[#212529] hover:bg-[#F8F9FA] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} className="text-[#495057]" strokeWidth={2} />
                    <span className="font-medium text-sm">{label}</span>
                  </div>
                  <ChevronRight size={16} className="text-[#ADB5BD]" />
                </Link>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#E9ECEF] my-2" />

          {/* Account Section */}
          <div className="py-2">
            <p className="text-xs font-medium text-[#495057] px-4 py-2">Account</p>
            <div className="space-y-0.5">
              {isLoggedIn ? (
                <>
                  {userLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between px-4 py-3 text-[#212529] hover:bg-[#F8F9FA] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} className="text-[#495057]" strokeWidth={2} />
                        <span className="font-medium text-sm">{label}</span>
                      </div>
                      <ChevronRight size={16} className="text-[#ADB5BD]" />
                    </Link>
                  ))}

                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-between px-4 py-3 text-[#495057] hover:bg-[#FFF5F5] hover:text-[#FF6B6B] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <LogOut size={20} className="text-[#495057]" strokeWidth={2} />
                        <span className="font-medium text-sm">Sign out</span>
                      </div>
                      <ChevronRight size={16} className="text-[#ADB5BD]" />
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/auth/signup"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-4 py-3 text-[#212529] hover:bg-[#F8F9FA] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <User size={20} className="text-[#495057]" strokeWidth={2} />
                    <span className="font-medium text-sm">Sign in</span>
                  </div>
                  <ChevronRight size={16} className="text-[#ADB5BD]" />
                </Link>
              )}
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-grow" />

          {/* Help */}
          <div className="px-4 py-2">
            <Link
              href="/help"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 py-2 text-sm text-[#495057] hover:text-[#212529]"
            >
              <HelpCircle size={18} />
              <span>Help center</span>
            </Link>
          </div>

          {/* CTA at bottom */}
          <div className="p-4 border-t border-[#E9ECEF]">
            <Link
              href="/dashboard/new-property"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#212529] text-white font-medium rounded-lg hover:bg-black transition-colors"
            >
              <Home size={20} strokeWidth={2} />
              <span>List your property</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
