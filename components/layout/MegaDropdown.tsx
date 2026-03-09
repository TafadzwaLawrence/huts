import type { ComponentType } from 'react'

/** Shape for a single item inside a mega-dropdown panel. */
export interface MegaMenuItem {
  label: string
  href: string
  description?: string
  /** Any Lucide-compatible icon component. */
  icon?: ComponentType<{ size?: string | number; className?: string; strokeWidth?: number | string }>
  badge?: string
}
