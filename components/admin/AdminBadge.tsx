import { ShieldCheck, ShieldAlert, ShieldX, Check, X, Clock } from 'lucide-react'

type BadgeVariant = 'approved' | 'pending' | 'rejected' | 'active' | 'inactive' | 'success' | 'warning' | 'error'

interface AdminBadgeProps {
  variant: BadgeVariant
  label?: string
  showIcon?: boolean
  size?: 'sm' | 'md'
}

const badgeConfig: Record<BadgeVariant, {
  bg: string
  text: string
  icon: typeof ShieldCheck
}> = {
  approved: {
    bg: 'bg-muted/10',
    text: 'text-foreground',
    icon: ShieldCheck,
  },
  pending: {
    bg: 'bg-muted/10',
    text: 'text-foreground',
    icon: ShieldAlert,
  },
  rejected: {
    bg: 'bg-muted/10',
    text: 'text-foreground',
    icon: ShieldX,
  },
  active: {
    bg: 'bg-muted/10',
    text: 'text-foreground',
    icon: Check,
  },
  inactive: {
    bg: 'bg-muted',
    text: 'text-foreground',
    icon: X,
  },
  success: {
    bg: 'bg-muted/10',
    text: 'text-foreground',
    icon: Check,
  },
  warning: {
    bg: 'bg-muted/10',
    text: 'text-foreground',
    icon: Clock,
  },
  error: {
    bg: 'bg-muted/10',
    text: 'text-foreground',
    icon: X,
  },
}

export function AdminBadge({ 
  variant, 
  label, 
  showIcon = true,
  size = 'md' 
}: AdminBadgeProps) {
  const config = badgeConfig[variant]
  const Icon = config.icon
  const displayLabel = label || variant.charAt(0).toUpperCase() + variant.slice(1)
  
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-[10px] gap-1' 
    : 'px-2.5 py-1 text-xs gap-1.5'
  
  const iconSize = size === 'sm' ? 11 : 13

  return (
    <span 
      className={`inline-flex items-center ${sizeClasses} rounded-full font-semibold ${config.bg} ${config.text}`}
    >
      {showIcon && <Icon size={iconSize} />}
      {displayLabel}
    </span>
  )
}
