import Link from 'next/link'
import { ArrowUpRight, type LucideIcon } from 'lucide-react'

interface AdminStatCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  href?: string
  highlight?: boolean
  description?: string
}

export function AdminStatCard({ 
  label, 
  value, 
  icon: Icon, 
  href, 
  highlight,
  description 
}: AdminStatCardProps) {
  const content = (
    <div className={`group bg-white rounded-xl border p-5 transition-all ${
      highlight 
        ? 'border-amber-200 hover:border-amber-400' 
        : 'border-border hover:border-border'
    } ${href ? 'hover:shadow-md cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
          highlight 
            ? 'bg-muted group-hover:bg-muted' 
            : 'bg-muted group-hover:bg-muted'
        }`}>
          <Icon size={17} className={`transition-colors ${
            highlight
              ? 'text-foreground group-hover:text-white'
              : 'text-foreground group-hover:text-white'
          }`} />
        </div>
        {href && (
          <ArrowUpRight 
            size={14} 
            className="text-foreground opacity-0 group-hover:opacity-100 transition-opacity" 
          />
        )}
      </div>
      <p className="text-2xl font-bold text-foreground tabular-nums mb-0.5">{value}</p>
      <p className="text-xs text-foreground font-medium">{label}</p>
      {description && (
        <p className="text-[10px] text-foreground mt-1">{description}</p>
      )}
    </div>
  )

  return href ? <Link href={href}>{content}</Link> : content
}
