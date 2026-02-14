'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Search, MapPin, Home, Heart, User, PlusCircle, LogOut, ChevronRight, Key, Bell, HelpCircle, Shield, Sparkles, TrendingUp, Building2 } from 'lucide-react'

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
    { href: '/search', label: 'Browse All', icon: Search, desc: 'All properties', color: 'bg-[#212529]', textColor: 'text-white' },
    { href: '/search?type=rent', label: 'For Rent', icon: Key, desc: 'Monthly rentals', color: 'bg-[#F8F9FA]', textColor: 'text-[#212529]' },
    { href: '/search?type=sale', label: 'For Sale', icon: Building2, desc: 'Homes to buy', color: 'bg-[#F8F9FA]', textColor: 'text-[#212529]' },
    { href: '/areas', label: 'Areas', icon: MapPin, desc: 'Neighborhoods', color: 'bg-[#F8F9FA]', textColor: 'text-[#212529]' },
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
      {/* Animated Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-xl text-[#212529] hover:bg-[#F8F9FA] transition-all min-w-[44px] min-h-[44px] flex items-center justify-center group"
        aria-label="Open menu"
      >
        <div className="w-6 h-5 flex flex-col justify-between items-center">
          <span className="w-6 h-0.5 bg-[#212529] rounded-full group-hover:w-5 transition-all" />
          <span className="w-5 h-0.5 bg-[#212529] rounded-full group-hover:w-6 transition-all" />
          <span className="w-4 h-0.5 bg-[#212529] rounded-full group-hover:w-5 transition-all" />
        </div>

      </button>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-all duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Slide-out Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[380px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E9ECEF]">
          <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[#212529] rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
              <Image
                src="/logo.png"
                alt="Huts"
                width={40}
                height={40}
                className="relative h-10 w-10 object-contain"
              />
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-3 rounded-full text-[#495057] hover:text-white hover:bg-[#212529] transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100%-81px)] overflow-y-auto">
          {/* User Profile Card (when logged in) */}
          {isLoggedIn && (
            <div className="p-4">
              <Link
                href="/dashboard/overview"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#212529] to-[#495057] rounded-2xl group"
              >
                <div className="relative">
                  {userAvatar ? (
                    <Image
                      src={userAvatar}
                      alt={userName || 'User'}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white/20"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                      {userInitial || userName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#212529] rounded-full ring-2 ring-[#212529]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{userName || 'Welcome back'}</p>
                  <p className="text-xs text-white/60 truncate">{userEmail || 'View your dashboard'}</p>
                </div>
                <ChevronRight size={18} className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
              </Link>
            </div>
          )}

          {/* Quick Search Bar (when not logged in) */}
          {!isLoggedIn && (
            <div className="p-4">
              <Link
                href="/search"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 w-full bg-gradient-to-r from-[#F8F9FA] to-white border-2 border-[#E9ECEF] hover:border-[#212529] rounded-2xl px-4 py-4 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Search size={20} className="text-[#212529]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#212529]">Search Properties</p>
                  <p className="text-xs text-[#ADB5BD]">Location, type, price range...</p>
                </div>
                <ChevronRight size={18} className="text-[#ADB5BD] group-hover:text-[#212529] group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          )}

          {/* Main Navigation */}
          <div className="px-4 pb-4">
            <p className="text-[10px] font-bold text-[#ADB5BD] uppercase tracking-widest mb-3 px-1 flex items-center gap-2">
              <Sparkles size={12} />
              Explore
            </p>
            <div className="grid grid-cols-2 gap-3">
              {navLinks.map(({ href, label, icon: Icon, desc, color, textColor }, index) => (
                <Link
                  key={href + label}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={`relative flex flex-col p-4 rounded-2xl transition-all group overflow-hidden ${
                    index === 0 
                      ? 'bg-[#212529] col-span-2 flex-row items-center gap-4' 
                      : 'bg-[#F8F9FA] hover:bg-[#E9ECEF] text-center items-center'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {index === 0 ? (
                    <>
                      {/* Featured: Browse All */}
                      <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon size={26} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-white text-lg">{label}</span>
                        <p className="text-xs text-white/60 mt-0.5">{desc}</p>
                      </div>
                      <ChevronRight size={20} className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      {/* Decorative shimmer */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm border border-[#E9ECEF]">
                        <Icon size={22} className="text-[#212529]" />
                      </div>
                      <span className="font-semibold text-sm text-[#212529]">{label}</span>
                      <span className="text-[10px] text-[#ADB5BD] mt-0.5">{desc}</span>
                    </>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mx-4 mb-4 p-4 bg-gradient-to-r from-[#F8F9FA] to-white rounded-2xl border border-[#E9ECEF]">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-[#212529]" />
              <p className="text-[10px] font-bold text-[#ADB5BD] uppercase tracking-widest">This Week</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xl font-bold text-[#212529]">50+</p>
                <p className="text-[10px] text-[#ADB5BD]">New Listings</p>
              </div>
              <div className="text-center border-x border-[#E9ECEF]">
                <p className="text-xl font-bold text-[#212529]">24h</p>
                <p className="text-[10px] text-[#ADB5BD]">Avg Response</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-[#212529]">100%</p>
                <p className="text-[10px] text-[#ADB5BD]">Verified</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-4 border-t border-[#E9ECEF]" />

          {/* Account Section */}
          <div className="p-4">
            <p className="text-[10px] font-bold text-[#ADB5BD] uppercase tracking-widest mb-3 px-1">
              Account
            </p>
            <div className="space-y-1">
              {isLoggedIn ? (
                <>
                  {userLinks.map(({ href, label, icon: Icon, badge }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between p-3.5 rounded-xl text-[#212529] hover:bg-[#F8F9FA] transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl bg-[#F8F9FA] flex items-center justify-center group-hover:bg-[#E9ECEF] transition-colors">
                          <Icon size={20} className="text-[#495057]" />
                          {badge && badge > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#212529] text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                              {badge > 9 ? '9+' : badge}
                            </span>
                          )}
                        </div>
                        <span className="font-medium">{label}</span>
                      </div>
                      <ChevronRight size={18} className="text-[#ADB5BD] group-hover:text-[#212529] group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                  
                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-between p-3.5 rounded-xl text-[#495057] hover:bg-[#FFF5F5] hover:text-[#FF6B6B] transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#F8F9FA] flex items-center justify-center group-hover:bg-[#FFE8E8] transition-colors">
                          <LogOut size={20} className="text-[#495057] group-hover:text-[#FF6B6B]" />
                        </div>
                        <span className="font-medium">Sign Out</span>
                      </div>
                      <ChevronRight size={18} className="text-[#ADB5BD] group-hover:text-[#FF6B6B] group-hover:translate-x-1 transition-all" />
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between p-3.5 rounded-xl text-[#212529] hover:bg-[#F8F9FA] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F8F9FA] flex items-center justify-center group-hover:bg-[#E9ECEF] transition-colors">
                        <User size={20} className="text-[#495057]" />
                      </div>
                      <span className="font-medium">Sign In</span>
                    </div>
                    <ChevronRight size={18} className="text-[#ADB5BD] group-hover:text-[#212529] group-hover:translate-x-1 transition-all" />
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between p-3.5 rounded-xl text-[#212529] hover:bg-[#F8F9FA] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] flex items-center justify-center">
                        <PlusCircle size={20} className="text-[#212529]" />
                      </div>
                      <span className="font-semibold">Create Account</span>
                    </div>
                    <ChevronRight size={18} className="text-[#ADB5BD] group-hover:text-[#212529] group-hover:translate-x-1 transition-all" />
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-grow" />

          {/* Help & Security */}
          <div className="px-4 pb-2">
            <div className="flex items-center justify-between">
              <Link
                href="/help"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 p-3 text-sm text-[#495057] hover:text-[#212529] transition-colors"
              >
                <HelpCircle size={16} />
                <span>Help Center</span>
              </Link>
              <div className="flex items-center gap-1.5 text-[10px] text-[#ADB5BD]">
                <Shield size={12} className="text-[#212529]" />
                <span>SSL Secured</span>
              </div>
            </div>
          </div>

          {/* CTA at bottom */}
          <div className="p-4 border-t border-[#E9ECEF] bg-white">
            <Link
              href="/dashboard/new-property"
              onClick={() => setIsOpen(false)}
              className="group relative flex items-center justify-center gap-3 w-full py-4 bg-[#212529] text-white font-semibold rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <div className="relative w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Home size={18} className="text-white" />
              </div>
              <span className="relative">List Your Property</span>
              <ChevronRight size={18} className="relative text-white/60 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-[10px] text-center text-[#ADB5BD] mt-3 flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#212529]" />
              Free to list • Reach thousands of renters
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
