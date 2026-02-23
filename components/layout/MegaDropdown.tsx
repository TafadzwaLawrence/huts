'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { ICON_SIZES } from '@/lib/constants'

export interface MegaMenuItem {
  label: string
  href: string
  description?: string
}

export interface MegaDropdownSection {
  title?: string
  items: MegaMenuItem[]
}

interface MegaDropdownProps {
  label: string
  sections: MegaDropdownSection[]
  isActive?: boolean
}

export function MegaDropdown({ label, sections, isActive = false }: MegaDropdownProps) {
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpen(true)
  }

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150)
  }

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
          isActive || open
            ? 'text-[#212529] bg-[#F8F9FA]'
            : 'text-[#495057] hover:text-[#212529] hover:bg-[#F8F9FA]/60'
        }`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {label}
        <ChevronDown
          size={ICON_SIZES.xs}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <>
          {/* Invisible bridge to prevent gap-triggered close */}
          <div className="absolute top-full left-0 right-0 h-2" />
          
          <div
            className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-white rounded-xl border border-[#E9ECEF] shadow-xl overflow-hidden z-50 min-w-[280px] animate-in fade-in slide-in-from-top-2 duration-200"
            role="menu"
          >
            <div className={`p-2 ${sections.length > 1 ? 'grid grid-cols-2 gap-1' : ''}`}>
              {sections.map((section, si) => (
                <div key={si}>
                  {section.title && (
                    <div className="px-3 py-2 text-[10px] font-bold text-[#ADB5BD] uppercase tracking-widest">
                      {section.title}
                    </div>
                  )}
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block px-3 py-2.5 rounded-lg hover:bg-[#F8F9FA] transition-colors group"
                      role="menuitem"
                    >
                      <div className="text-sm font-medium text-[#212529] group-hover:text-black">
                        {item.label}
                      </div>
                      {item.description && (
                        <div className="text-xs text-[#ADB5BD] mt-0.5">
                          {item.description}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
