'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

export interface MegaMenuItem {
  label: string
  href: string
}

interface MegaDropdownProps {
  label: string
  items: MegaMenuItem[]
  isActive?: boolean
}

export function MegaDropdown({ label, items, isActive = false }: MegaDropdownProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setPos({ top: rect.bottom, left: rect.left })
  }, [])

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    updatePosition()
    setOpen(true)
  }

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 120)
  }

  // Close on escape, update position on scroll/resize
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    const handleScroll = () => updatePosition()
    document.addEventListener('keydown', handleKey)
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    return () => {
      document.removeEventListener('keydown', handleKey)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [open, updatePosition])

  // Keep panel alive when mouse moves from trigger to panel
  const panelEnter = () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  const panelLeave = () => { timeoutRef.current = setTimeout(() => setOpen(false), 120) }

  return (
    <div
      className="h-[60px] flex items-center"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        ref={triggerRef}
        onClick={() => { updatePosition(); setOpen(!open) }}
        className={`flex items-center gap-0.5 px-3 h-[60px] text-sm font-bold transition-colors relative ${
          isActive || open
            ? 'text-[#212529] after:absolute after:bottom-0 after:inset-x-1 after:h-[3px] after:bg-[#212529] after:rounded-t'
            : 'text-[#585858] hover:text-[#212529] hover:after:absolute hover:after:bottom-0 hover:after:inset-x-1 hover:after:h-[3px] hover:after:bg-[#E5E7EB] hover:after:rounded-t'
        }`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {label}
        <ChevronDown
          size={12}
          className={`ml-0.5 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Fixed-position dropdown — never clipped by parent overflow */}
      {open && (
        <div
          ref={panelRef}
          onMouseEnter={panelEnter}
          onMouseLeave={panelLeave}
          className="fixed z-[9999]"
          style={{ top: pos.top, left: pos.left }}
          role="menu"
        >
          {/* Invisible bridge between trigger and panel */}
          <div className="h-1" />
          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-[0_4px_16px_rgba(0,0,0,0.12)] py-1 min-w-[200px]">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-[#3b3b3b] hover:bg-[#f0f0f0] hover:text-[#212529] transition-colors font-medium"
                role="menuitem"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
