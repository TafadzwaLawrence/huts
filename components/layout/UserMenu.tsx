'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LayoutDashboard, Heart, Settings, LogOut, Building2, Star, Search } from 'lucide-react'

interface UserMenuProps {
  userName: string
  userEmail: string
  userAvatar?: string
  userInitial: string
  isLandlord: boolean
}

export function UserMenu({ userName, userEmail, userAvatar, userInitial, isLandlord }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const menuLinks = isLandlord
    ? [
        { href: '/dashboard/overview', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/my-properties', label: 'Properties', icon: Building2 },
        { href: '/dashboard/reviews', label: 'Reviews', icon: Star },
      ]
    : [
        { href: '/dashboard/overview', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/saved', label: 'Saved', icon: Heart },
      ]

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center rounded-full p-0.5 transition-all duration-200 ${
          isOpen ? 'ring-2 ring-foreground' : 'hover:ring-2 hover:ring-foreground'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        {userAvatar ? (
          <Image
            src={userAvatar}
            alt=""
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-semibold">{userInitial}</span>
          </div>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" aria-hidden="true" onClick={() => setIsOpen(false)} />
          <div
            className="absolute top-full right-0 mt-2.5 z-50 bg-white rounded-xl shadow-xl border border-border min-w-[220px] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
            role="menu"
            aria-label="User menu"
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
              <p className="text-xs text-foreground truncate mt-0.5">{userEmail}</p>
            </div>

            {/* Main links */}
            <div className="py-1.5">
              {menuLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted hover:text-foreground transition-colors"
                  role="menuitem"
                >
                  <Icon size={16} className="shrink-0" />
                  {label}
                </Link>
              ))}
            </div>

            {/* Secondary links */}
            <div className="py-1.5 border-t border-border">
              {isLandlord && (
                <Link
                  href="/search"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted hover:text-foreground transition-colors"
                  role="menuitem"
                >
                  <Search size={16} className="shrink-0" />
                  Browse
                </Link>
              )}
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted hover:text-foreground transition-colors"
                role="menuitem"
              >
                <Settings size={16} className="shrink-0" />
                Settings
              </Link>
            </div>

            {/* Sign out */}
            <div className="border-t border-border py-1.5">
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-foreground hover:bg-muted hover:text-foreground transition-colors"
                  role="menuitem"
                >
                  <LogOut size={16} className="shrink-0" />
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
