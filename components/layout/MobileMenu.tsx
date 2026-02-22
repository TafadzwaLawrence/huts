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
        className="relative p-2.5 rounded-xl text-foreground hover:bg-muted transition-all min-w-[44px] min-h-[44px] flex items-center justify-center group"
        aria-label="Open menu"
      >
        <div className="w-5 h-4 flex flex-col justify-between items-center">
          <span className="w-5 h-0.5 bg-foreground rounded-full group-hover:w-4 transition-all" />
          <span className="w-4 h-0.5 bg-foreground rounded-full group-hover:w-5 transition-all" />
          <span className="w-3 h-0.5 bg-foreground rounded-full group-hover:w-4 transition-all" />
        </div>
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
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center">
            <Image
              src="/logo.png"
              alt="Huts"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100%-65px)] overflow-y-auto">
          {/* User Profile Card (when logged in) */}
          {isLoggedIn && (
            <div className="p-4 pb-2">
              <Link
                href="/dashboard/overview"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 bg-muted rounded-xl group"
              >
                {userAvatar ? (
                  <Image
                    src={userAvatar}
                    alt={userName || 'User'}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center text-white font-semibold">
                    {userInitial || 'U'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{userName || 'Welcome back'}</p>
                  <p className="text-xs text-muted-foreground truncate">{userEmail || 'View your dashboard'}</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            </div>
          )}

          {/* Search (when not logged in) */}
          {!isLoggedIn && (
            <div className="p-4 pb-2">
              <Link
                href="/search"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 border border-border hover:border-foreground rounded-xl transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Search size={18} className="text-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-foreground">Search Properties</p>
                  <p className="text-xs text-muted-foreground">Location, type, price...</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          )}

          {/* Explore Links */}
          <div className="px-4 py-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Explore</p>
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map(({ href, label, icon: Icon, desc }) => (
                <Link
                  key={href + label}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className="flex flex-col items-center p-3 rounded-xl bg-muted hover:bg-gray-200 transition-colors text-center group"
                >
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform border border-border">
                    <Icon size={18} className="text-foreground" />
                  </div>
                  <span className="font-medium text-sm text-foreground">{label}</span>
                  <span className="text-[10px] text-muted-foreground">{desc}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="mx-4 border-t border-border" />

          {/* Account Section */}
          <div className="p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Account</p>
            <div className="space-y-0.5">
              {isLoggedIn ? (
                <>
                  {userLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl text-foreground hover:bg-muted transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                          <Icon size={18} className="text-muted-foreground" />
                        </div>
                        <span className="font-medium text-sm">{label}</span>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  ))}

                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-between p-3 rounded-xl text-muted-foreground hover:bg-red-50 hover:text-warning transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center group-hover:bg-red-100 transition-colors">
                          <LogOut size={18} className="text-muted-foreground group-hover:text-warning" />
                        </div>
                        <span className="font-medium text-sm">Sign Out</span>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground group-hover:text-warning group-hover:translate-x-0.5 transition-all" />
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl text-foreground hover:bg-muted transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        <User size={18} className="text-muted-foreground" />
                      </div>
                      <span className="font-medium text-sm">Sign In</span>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl text-foreground hover:bg-muted transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center">
                        <PlusCircle size={18} className="text-foreground" />
                      </div>
                      <span className="font-semibold text-sm">Create Account</span>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
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
              className="flex items-center gap-2 p-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <HelpCircle size={16} />
              <span>Help Center</span>
            </Link>
          </div>

          {/* CTA at bottom */}
          <div className="p-4 border-t border-border bg-white">
            <Link
              href="/dashboard/new-property"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-foreground text-white font-semibold rounded-xl hover:bg-black transition-colors"
            >
              <Home size={18} />
              <span>List Your Property</span>
            </Link>
            <p className="text-[10px] text-center text-muted-foreground mt-2">
              Free to list &middot; Reach thousands of renters
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
