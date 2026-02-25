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
    { href: '/search', label: 'Browse All', icon: Search, desc: 'All properties' },
    { href: '/search?type=rent', label: 'For Rent', icon: Key, desc: 'Monthly rentals' },
    { href: '/search?type=sale', label: 'For Sale', icon: Building2, desc: 'Homes to buy' },
    { href: '/find-agent', label: 'Find an Agent', icon: User, desc: 'Real estate pros' },
    { href: '/areas', label: 'Areas', icon: MapPin, desc: 'Neighborhoods' },
  ]

  const userLinks = isLoggedIn
    ? isLandlord
      ? [
          { href: '/dashboard/overview', label: 'Dashboard', icon: User },
          { href: '/dashboard/my-properties', label: 'My Properties', icon: Building2 },
          { href: '/dashboard/reviews', label: 'Reviews', icon: Heart },
          { href: '/settings', label: 'Settings', icon: Shield },
        ]
      : [
          { href: '/dashboard/overview', label: 'Dashboard', icon: User },
          { href: '/dashboard/saved', label: 'Saved Properties', icon: Heart },
          { href: '/settings', label: 'Settings', icon: Shield },
        ]
    : []

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2.5 rounded-xl text-[#212529] hover:bg-[#F8F9FA] transition-all min-w-[44px] min-h-[44px] flex items-center justify-center group"
        aria-label="Open menu"
      >
        <div className="w-5 h-4 flex flex-col justify-between items-center">
          <span className="w-5 h-0.5 bg-[#212529] rounded-full group-hover:w-4 transition-all" />
          <span className="w-4 h-0.5 bg-[#212529] rounded-full group-hover:w-5 transition-all" />
          <span className="w-3 h-0.5 bg-[#212529] rounded-full group-hover:w-4 transition-all" />
        </div>
        {/* Notification Badge */}
        {unreadMessages > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF6B6B] rounded-full border-2 border-white" />
        )}
      </button>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Slide-out Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[360px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E9ECEF] bg-[#F8F9FA]/50">
          <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Huts"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
            <span className="font-bold text-lg text-[#212529]">HUTS</span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl text-[#495057] hover:text-[#212529] hover:bg-white transition-all min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <X size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Quick Search Bar */}
        <div className="px-4 pt-3 pb-2 bg-[#F8F9FA]/30">
          <Link
            href="/search"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 p-3 bg-white border border-[#E9ECEF] rounded-xl hover:border-[#212529] transition-colors group"
          >
            <Search size={18} className="text-[#ADB5BD] group-hover:text-[#212529] transition-colors" />
            <span className="text-sm text-[#ADB5BD] group-hover:text-[#495057] transition-colors">Search for properties...</span>
          </Link>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100%-125px)] overflow-y-auto">
          {/* User Profile Card (when logged in) */}
          {isLoggedIn && (
            <div className="px-4 pt-3 pb-2">
              <Link
                href="/dashboard/overview"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3.5 bg-gradient-to-br from-[#212529] to-[#495057] rounded-xl group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {userAvatar ? (
                  <Image
                    src={userAvatar}
                    alt={userName || 'User'}
                    width={44}
                    height={44}
                    className="w-11 h-11 rounded-full object-cover border-2 border-white/20 relative z-10"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-[#212529] font-bold text-lg border-2 border-white/20 relative z-10">
                    {userInitial || 'U'}
                  </div>
                )}
                <div className="flex-1 min-w-0 relative z-10">
                  <p className="font-bold text-white text-sm truncate">{userName || 'Welcome back'}</p>
                  <p className="text-xs text-white/70 truncate">{userEmail || 'View your dashboard'}</p>
                  {unreadMessages > 0 && (
                    <div className="mt-1 flex items-center gap-1">
                      <Bell size={10} className="text-white/70" />
                      <span className="text-[10px] text-white/70">{unreadMessages} unread</span>
                    </div>
                  )}
                </div>
                <ChevronRight size={18} className="text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 relative z-10" />
              </Link>
            </div>
          )}



          {/* Explore Links */}
          <div className="px-4 pt-4 pb-3">
            <p className="text-[10px] font-bold text-[#ADB5BD] uppercase tracking-widest mb-3 px-1">Explore Properties</p>
            <div className="grid grid-cols-2 gap-2.5">
              {navLinks.map(({ href, label, icon: Icon, desc }) => (
                <Link
                  key={href + label}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className="flex flex-col items-center p-3.5 rounded-xl bg-[#F8F9FA] hover:bg-[#E9ECEF] transition-all text-center group hover:shadow-sm"
                >
                  <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform shadow-sm border border-[#E9ECEF]">
                    <Icon size={20} className="text-[#212529]" strokeWidth={2} />
                  </div>
                  <span className="font-semibold text-sm text-[#212529] mb-0.5">{label}</span>
                  <span className="text-[10px] text-[#ADB5BD] leading-tight">{desc}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="mx-4 my-2 border-t border-[#E9ECEF]" />

          {/* Account Section */}
          <div className="px-4 pb-4">
            <p className="text-[10px] font-bold text-[#ADB5BD] uppercase tracking-widest mb-3 px-1">Account</p>
            <div className="space-y-0.5">
              {isLoggedIn ? (
                <>
                  {userLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl text-[#212529] hover:bg-[#F8F9FA] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#F8F9FA] flex items-center justify-center group-hover:bg-[#E9ECEF] transition-colors">
                          <Icon size={18} className="text-[#495057]" />
                        </div>
                        <span className="font-medium text-sm">{label}</span>
                      </div>
                      <ChevronRight size={16} className="text-[#ADB5BD] group-hover:text-[#212529] group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  ))}

                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-between p-3 rounded-xl text-[#495057] hover:bg-[#FFF5F5] hover:text-[#FF6B6B] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#F8F9FA] flex items-center justify-center group-hover:bg-[#FFE8E8] transition-colors">
                          <LogOut size={18} className="text-[#495057] group-hover:text-[#FF6B6B]" />
                        </div>
                        <span className="font-medium text-sm">Sign Out</span>
                      </div>
                      <ChevronRight size={16} className="text-[#ADB5BD] group-hover:text-[#FF6B6B] group-hover:translate-x-0.5 transition-all" />
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl text-[#212529] hover:bg-[#F8F9FA] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#F8F9FA] flex items-center justify-center group-hover:bg-[#E9ECEF] transition-colors">
                        <User size={18} className="text-[#495057]" />
                      </div>
                      <span className="font-medium text-sm">Sign In</span>
                    </div>
                    <ChevronRight size={16} className="text-[#ADB5BD] group-hover:text-[#212529] group-hover:translate-x-0.5 transition-all" />
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl text-[#212529] hover:bg-[#F8F9FA] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#F8F9FA] border border-[#E9ECEF] flex items-center justify-center">
                        <PlusCircle size={18} className="text-[#212529]" />
                      </div>
                      <span className="font-semibold text-sm">Create Account</span>
                    </div>
                    <ChevronRight size={16} className="text-[#ADB5BD] group-hover:text-[#212529] group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-grow" />

          {/* Help */}
          <div className="px-4 pb-2">
            <Link
              href="/help"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 p-3 text-sm text-[#495057] hover:text-[#212529] transition-colors"
            >
              <HelpCircle size={16} />
              <span>Help Center</span>
            </Link>
          </div>

          {/* CTA at bottom */}
          <div className="p-4 border-t border-[#E9ECEF] bg-gradient-to-b from-white to-[#F8F9FA]">
            <Link
              href="/dashboard/new-property"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-[#212529] to-[#495057] text-white font-bold rounded-xl hover:from-black hover:to-[#212529] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Home size={20} strokeWidth={2.5} />
              <span>List Your Property</span>
            </Link>
            <p className="text-[10px] text-center text-[#ADB5BD] mt-2.5 leading-relaxed">
              Free to list · Reach thousands of renters
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
