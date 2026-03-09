'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronDown,
  Home,
  Clock,
  TrendingUp,
  MapPin,
  Building2,
  Layers,
  GraduationCap,
  PlusCircle,
  LayoutList,
  Tag,
  BarChart2,
  Users,
  UserPlus,
  BookOpen,
} from 'lucide-react'
import type { MegaMenuItem } from './MegaDropdown'

// ─── Static mega-menu data (defined here so icons aren't serialised over the wire) ──

interface NavItemGroup {
  label: string
  items: MegaMenuItem[]
  activePatterns?: string[]
  viewAllHref?: string
}

const NAV_GROUPS: NavItemGroup[] = [
  {
    label: 'Buy',
    viewAllHref: '/search?type=sale',
    activePatterns: ['type=sale'],
    items: [
      { label: 'Homes for Sale',  href: '/search?type=sale',             icon: Home,          description: 'Browse all properties available for purchase'   },
      { label: 'New Listings',    href: '/search?type=sale&sort=newest', icon: Clock,         description: 'The latest properties added to the market'      },
      { label: 'Home Values',     href: '/home-value',                   icon: TrendingUp,    description: "Estimate your property's current market value"  },
      { label: 'Area Guides',     href: '/areas',                        icon: MapPin,        description: 'Explore local neighbourhoods across Zimbabwe'   },
    ],
  },
  {
    label: 'Rent',
    viewAllHref: '/search?type=rent',
    activePatterns: ['type=rent', '/student'],
    items: [
      { label: 'All Rentals',     href: '/search?type=rent',                          icon: Building2,     description: 'Find your perfect rental home'                  },
      { label: 'Apartments',      href: '/search?type=rent&propertyType=apartment',   icon: Layers,        description: 'Apartment listings across Zimbabwe'             },
      { label: 'Houses',          href: '/search?type=rent&propertyType=house',       icon: Home,          description: 'Standalone houses available to rent'            },
      { label: 'Student Housing', href: '/student-housing',                           icon: GraduationCap, description: 'Purpose-built student accommodation'            },
    ],
  },
  {
    label: 'Sell',
    activePatterns: ['/dashboard/new-property'],
    items: [
      { label: 'List Your Property', href: '/dashboard/new-property',  icon: PlusCircle, description: 'Start listing your property today'            },
      { label: 'My Listings',        href: '/dashboard/my-properties', icon: LayoutList,  description: 'Manage and track all your active listings'    },
      { label: 'Pricing',            href: '/pricing',                 icon: Tag,         description: 'View our transparent listing plans'          },
      { label: 'Home Value',         href: '/home-value',              icon: BarChart2,   description: "Estimate your home's market value"           },
    ],
  },
]

// ─── ScrollHeader ─────────────────────────────────────────────────────────────

export function ScrollHeader({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-[1100] bg-white transition-shadow duration-200 ${
        scrolled ? 'shadow-[0_2px_8px_rgba(0,0,0,0.08)]' : 'shadow-[0_1px_0_#e5e7eb]'
      }`}
    >
      {children}
    </header>
  )
}

// ─── NavLinks ─────────────────────────────────────────────────────────────────

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
              : 'text-[#585858] hover:text-[#212529]'
          }`}
        >
          {label}
        </Link>
      ))}
    </>
  )
}

// ─── MegaNav ──────────────────────────────────────────────────────────────────

export function MegaNav() {
  const pathname = usePathname()
  const [activeLabel, setActiveLabel] = useState<string | null>(null)
  // Keep last visible label so content doesn't snap away during the exit transition
  const [displayLabel, setDisplayLabel] = useState<string | null>(null)
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fullUrl =
    typeof window !== 'undefined' ? pathname + window.location.search : pathname

  const isUrlActive = (patterns?: string[]) =>
    patterns?.some((p) => fullUrl.includes(p)) ?? false

  const show = useCallback((label: string) => {
    if (hideRef.current) clearTimeout(hideRef.current)
    setActiveLabel(label)
    setDisplayLabel(label)
  }, [])

  const hide = useCallback(() => {
    hideRef.current = setTimeout(() => setActiveLabel(null), 130)
  }, [])

  const keep = useCallback(() => {
    if (hideRef.current) clearTimeout(hideRef.current)
  }, [])

  // Close on Escape or page scroll
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveLabel(null)
    }
    const onScroll = () => {
      if (activeLabel) setActiveLabel(null)
    }
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll)
      if (hideRef.current) clearTimeout(hideRef.current)
    }
  }, [activeLabel])

  const isOpen = activeLabel !== null
  const currentGroup = NAV_GROUPS.find((g) => g.label === displayLabel)
  const currentItems = currentGroup?.items ?? []

  return (
    <>
      {/* ── Trigger buttons ── */}
      {NAV_GROUPS.map((group) => {
        const isThisOpen   = group.label === activeLabel
        const isThisActive = isThisOpen || isUrlActive(group.activePatterns)

        return (
          <button
            key={group.label}
            onMouseEnter={() => show(group.label)}
            onMouseLeave={hide}
            onClick={() => (isThisOpen ? setActiveLabel(null) : show(group.label))}
            aria-expanded={isThisOpen}
            aria-haspopup="true"
            className={`group flex items-center gap-0.5 px-3 h-[60px] text-sm font-bold relative transition-colors duration-150 ${
              isThisActive
                ? 'text-[#111827] after:absolute after:bottom-0 after:inset-x-1 after:h-[3px] after:rounded-t after:bg-[#111827]'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            {group.label}
            <ChevronDown
              size={12}
              strokeWidth={2.5}
              className={`ml-0.5 transition-transform duration-200 ${isThisOpen ? 'rotate-180' : 'group-hover:rotate-12'}`}
            />
          </button>
        )
      })}

      {/* ── Dim-backdrop (closes on click) ── */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 top-[60px] z-[1098] bg-black transition-opacity duration-200 ${
      />

      {/* ── Full-width mega panel ── */}
      <div
        role="navigation"
        aria-label={`${displayLabel ?? ''} menu`}
        aria-hidden={!isOpen}
        onMouseEnter={keep}
        onMouseLeave={hide}
        className={`fixed top-[60px] left-0 right-0 z-[1099] bg-white border-t border-[#E5E7EB] transition-all duration-200 ease-out ${
            {currentGroup?.label}
          </p>

          {/* Items grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1">
            {currentItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setActiveLabel(null)}
                  role="menuitem"
                  className="group relative flex items-start gap-3.5 px-4 py-[14px] rounded-2xl hover:bg-[#F9FAFB] active:bg-[#F3F4F6] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#111827] focus-visible:outline-offset-2"
                >
                  {Icon && (
                    <div className="mt-[1px] w-[38px] h-[38px] rounded-xl border border-[#E5E7EB] bg-white group-hover:border-[#D1D5DB] group-hover:shadow-sm flex items-center justify-center shrink-0 transition-all duration-150">
                      <Icon
                        size={17}
                        strokeWidth={1.75}
                        className="text-[#6B7280] group-hover:text-[#111827] transition-colors duration-150"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-[#1F2937] group-hover:text-[#111827] leading-snug transition-colors duration-150">
                      {item.label}
                    </p>
                    {item.description && (
                      <p className="text-[12px] text-[#9CA3AF] mt-[3px] leading-relaxed font-normal">
                        {item.description}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>

          {/* View-all footer link */}
          {currentGroup?.viewAllHref && (
            <div className="mt-5 pt-5 border-t border-[#F3F4F6]">
              <Link
                href={currentGroup.viewAllHref}
                onClick={() => setActiveLabel(null)}
                className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#6B7280] hover:text-[#111827] transition-colors duration-150"
              >
                Browse all {currentGroup.label.toLowerCase()} listings
                <svg
                  width="14" height="14" viewBox="0 0 14 14" fill="none"
                  aria-hidden="true"
                  className="group-hover:translate-x-0.5 transition-transform duration-150"
                >
                  <path
                    d="M2.9165 7H11.0832M7.5832 3.5L11.0832 7L7.5832 10.5"
                    stroke="currentColor" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ─── AgentsDropdown ───────────────────────────────────────────────────────────
// Right-side trigger that opens the same full-width mega panel as Buy/Rent/Sell

const AGENTS_GROUP: NavItemGroup = {
  label: 'Agents',
  activePatterns: ['/find-agent', '/agents/'],
  items: [
    { label: 'Find an Agent',   href: '/find-agent',    icon: Users,    description: 'Connect with local property experts'   },
    { label: 'Become an Agent', href: '/agents/signup', icon: UserPlus, description: 'Join our growing agent network'         },
    { label: 'Agent Resources', href: '/help',          icon: BookOpen, description: 'Tools and guides for property agents'  },
  ],
}

export function AgentsDropdown() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fullUrl = typeof window !== 'undefined' ? pathname + window.location.search : pathname
  const isActive = open || (AGENTS_GROUP.activePatterns?.some((p) => fullUrl.includes(p)) ?? false)

  const show = useCallback(() => {
    if (hideRef.current) clearTimeout(hideRef.current)
    setOpen(true)
  }, [])

  const hide = useCallback(() => {
    hideRef.current = setTimeout(() => setOpen(false), 130)
  }, [])

  const keep = useCallback(() => {
    if (hideRef.current) clearTimeout(hideRef.current)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    const onScroll = () => { if (open) setOpen(false) }
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll)
      if (hideRef.current) clearTimeout(hideRef.current)
    }
  }, [open])

  return (
    <>
      <button
        onMouseEnter={show}
        onMouseLeave={hide}
        onClick={() => (open ? setOpen(false) : show())}
        aria-expanded={open}
        aria-haspopup="true"
        className={`group flex items-center gap-0.5 px-3 h-[60px] text-sm font-bold relative transition-colors duration-150 ${
          isActive
            ? 'text-[#111827] after:absolute after:bottom-0 after:inset-x-1 after:h-[3px] after:rounded-t after:bg-[#111827]'
            : 'text-[#6B7280] hover:text-[#111827]'
        }`}
      >
        Agents
        <ChevronDown
          size={12}
          strokeWidth={2.5}
          className={`ml-0.5 transition-transform duration-200 ${open ? 'rotate-180' : 'group-hover:rotate-12'}`}
        />
      </button>

      {/* Dim backdrop */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 top-[60px] z-[1098] bg-black transition-opacity duration-200 ${
      />

      {/* Full-width mega panel — identical to MegaNav */}
      <div
        role="navigation"
        aria-label="Agents menu"
        aria-hidden={!open}
        onMouseEnter={keep}
        onMouseLeave={hide}
        className={`fixed top-[60px] left-0 right-0 z-[1099] bg-white border-t border-[#E5E7EB] transition-all duration-200 ease-out ${
            Agents
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1">
            {AGENTS_GROUP.items.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  className="group relative flex items-start gap-3.5 px-4 py-[14px] rounded-2xl hover:bg-[#F9FAFB] active:bg-[#F3F4F6] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#111827] focus-visible:outline-offset-2"
                >
                  {Icon && (
                    <div className="mt-[1px] w-[38px] h-[38px] rounded-xl border border-[#E5E7EB] bg-white group-hover:border-[#D1D5DB] group-hover:shadow-sm flex items-center justify-center shrink-0 transition-all duration-150">
                      <Icon size={17} strokeWidth={1.75} className="text-[#6B7280] group-hover:text-[#111827] transition-colors duration-150" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-[#1F2937] group-hover:text-[#111827] leading-snug transition-colors duration-150">
                      {item.label}
                    </p>
                    {item.description && (
                      <p className="text-[12px] text-[#9CA3AF] mt-[3px] leading-relaxed font-normal">
                        {item.description}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
