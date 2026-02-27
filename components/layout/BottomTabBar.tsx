'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Heart, Home, User } from 'lucide-react'
import { ICON_SIZES } from '@/lib/constants'

interface BottomTabBarProps {
  isLoggedIn: boolean
}

const tabs = [
  { href: '/', icon: Home, label: 'Home', match: (p: string) => p === '/' },
  { href: '/search', icon: Search, label: 'Search', match: (p: string) => p.startsWith('/search') },
  { href: '/dashboard/saved', icon: Heart, label: 'Saved', match: (p: string) => p.startsWith('/dashboard/saved') },
  { href: '/settings/profile', icon: User, label: 'Account', match: (p: string) => p.startsWith('/settings') || p.startsWith('/dashboard/overview') },
]

export function BottomTabBar({ isLoggedIn }: BottomTabBarProps) {
  const pathname = usePathname()

  // Bottom navigation disabled - using header navigation only
  return null

  // Hide on dashboard pages (they have their own nav) and auth pages
  if (pathname.startsWith('/dashboard/') && !pathname.startsWith('/dashboard/saved')) return null
  if (pathname.startsWith('/auth')) return null
  if (pathname.startsWith('/admin')) return null

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E9ECEF] safe-area-bottom"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-14">
        {tabs.map(({ href, icon: Icon, label, match }) => {
          const isActive = match(pathname)
          const targetHref = (href === '/dashboard/saved' || href === '/settings/profile') && !isLoggedIn
            ? '/auth/signup'
            : href

          return (
            <Link
              key={label}
              href={targetHref}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-1.5 transition-colors ${
                isActive
                  ? 'text-[#212529]'
                  : 'text-[#ADB5BD] active:text-[#495057]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={ICON_SIZES.lg} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
