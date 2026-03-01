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
  return null
}
