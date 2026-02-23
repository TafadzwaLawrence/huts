'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { ICON_SIZES } from '@/lib/constants'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className={`py-3 ${className}`}>
      <ol className="flex items-center flex-wrap gap-1 text-sm" itemScope itemType="https://schema.org/BreadcrumbList">
        {/* Home */}
        <li className="flex items-center" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
          <Link href="/" className="text-[#ADB5BD] hover:text-[#212529] transition-colors" itemProp="item">
            <Home size={ICON_SIZES.sm} />
            <meta itemProp="name" content="Home" />
          </Link>
          <meta itemProp="position" content="1" />
        </li>

        {items.map((item, i) => (
          <li
            key={item.label}
            className="flex items-center"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            <ChevronRight size={ICON_SIZES.xs} className="text-[#ADB5BD] mx-1" />
            {item.href ? (
              <Link
                href={item.href}
                className="text-[#ADB5BD] hover:text-[#212529] transition-colors"
                itemProp="item"
              >
                <span itemProp="name">{item.label}</span>
              </Link>
            ) : (
              <span className="text-[#495057] font-medium" itemProp="name">
                {item.label}
              </span>
            )}
            <meta itemProp="position" content={`${i + 2}`} />
          </li>
        ))}
      </ol>
    </nav>
  )
}
