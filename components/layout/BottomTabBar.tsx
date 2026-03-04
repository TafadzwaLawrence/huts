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

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E9ECEF] z-50">
      <div className="grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const isActive = tab.match(pathname)
          const Icon = tab.icon
          
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive 
                  ? 'text-[#212529]' 
                  : 'text-[#ADB5BD] hover:text-[#495057]'
              }`}
            >
              <Icon size={ICON_SIZES.lg} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
