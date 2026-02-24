'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MegaDropdown, type MegaDropdownSection } from './MegaDropdown'

/**
 * Scroll-aware header wrapper. Adds backdrop blur + shadow on scroll.
 */
export function ScrollHeader({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,box-shadow] duration-200 bg-white ${
        scrolled
          ? 'shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
          : 'border-b border-[#E9ECEF]'
      }`}
    >
      {children}
    </header>
  )
}

/**
 * Navigation links with Zillow-style bottom-border active state.
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
    <nav className="hidden md:flex items-center h-[60px]" aria-label="Main navigation">
      {links.map(({ href, label }) => (
        <Link
          key={href + label}
          href={href}
          className={`relative h-full flex items-center px-3 text-sm font-semibold transition-colors duration-150 ${
            isActive(href)
              ? 'text-[#212529] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-[3px] after:bg-[#212529] after:rounded-full'
              : 'text-[#6B7280] hover:text-[#212529]'
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}

/**
 * Mega-navigation with Zillow-style dropdowns and bottom-border active state.
 */
interface MegaNavItem {
  label: string
  sections: MegaDropdownSection[]
  activePatterns?: string[]
}

export function MegaNav({ items }: { items: MegaNavItem[] }) {
  const pathname = usePathname()
  const fullUrl = pathname + (typeof window !== 'undefined' ? window.location.search : '')

  const isActive = (patterns?: string[]) =>
    patterns?.some(p => fullUrl.includes(p)) ?? false

  return (
    <nav className="hidden md:flex items-center h-[60px]" aria-label="Main navigation">
      {items.map((item) => (
        <MegaDropdown
          key={item.label}
          label={item.label}
          sections={item.sections}
          isActive={isActive(item.activePatterns)}
        />
      ))}
    </nav>
  )
}
