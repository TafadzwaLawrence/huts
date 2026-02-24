'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MegaDropdown, type MegaMenuItem } from './MegaDropdown'

/**
 * Scroll-aware header wrapper.
 */
export function ScrollHeader({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${
        scrolled ? 'shadow-[0_2px_4px_rgba(0,0,0,0.1)]' : 'shadow-[0_1px_0_#e5e7eb]'
      }`}
    >
      {children}
    </header>
  )
}

/**
 * Plain navigation links with Zillow-style bottom-border active state.
 */
interface NavLink {
  href: string
  label: string
}

export function NavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    const [path] = href.split('?')
    if (href.includes('?')) return false
    if (path === '/') return pathname === '/'
    return pathname === path || pathname.startsWith(path + '/')
  }

  return (
    <>
      {links.map(({ href, label }) => (
        <Link
          key={href + label}
          href={href}
          className={`relative h-[60px] inline-flex items-center px-3 text-sm font-bold transition-colors ${
            isActive(href)
              ? 'text-[#212529] after:absolute after:bottom-0 after:inset-x-1 after:h-[3px] after:bg-[#212529] after:rounded-t'
              : 'text-[#585858] hover:text-[#212529] hover:after:absolute hover:after:bottom-0 hover:after:inset-x-1 hover:after:h-[3px] hover:after:bg-[#E5E7EB] hover:after:rounded-t'
          }`}
        >
          {label}
        </Link>
      ))}
    </>
  )
}

/**
 * Mega-navigation with Zillow-style dropdowns.
 */
interface MegaNavItem {
  label: string
  items: MegaMenuItem[]
  activePatterns?: string[]
}

export function MegaNav({ items }: { items: MegaNavItem[] }) {
  const pathname = usePathname()
  const fullUrl = typeof window !== 'undefined' ? pathname + window.location.search : pathname

  const isActive = (patterns?: string[]) =>
    patterns?.some(p => fullUrl.includes(p)) ?? false

  return (
    <>
      {items.map((item) => (
        <MegaDropdown
          key={item.label}
          label={item.label}
          items={item.items}
          isActive={isActive(item.activePatterns)}
        />
      ))}
    </>
  )
}
