import { Check, X, Edit, Trash2, Loader2, type LucideIcon } from 'lucide-react'

interface ActionButtonProps {
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
  children: React.ReactNode
  variant?: 'primary' | 'danger' | 'secondary'
  icon?: LucideIcon
  className?: string
}

export function AdminActionButton({ 
  onClick, 
  loading, 
  disabled,
  children, 
  variant = 'primary',
  icon: Icon,
  className = ''
}: ActionButtonProps) {
  const variants = {
    primary: 'bg-muted text-white hover:bg-black',
    danger: 'border-2 border-border text-foreground hover:bg-muted',
    secondary: 'border-2 border-border text-foreground hover:border-border',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors ${variants[variant]} ${className}`}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : Icon ? (
        <Icon size={14} />
      ) : null}
      {children}
    </button>
  )
}

interface ApproveRejectButtonsProps {
  onApprove: () => void
  onReject: () => void
  loading?: boolean
  approveLabel?: string
  rejectLabel?: string
}

export function ApproveRejectButtons({
  onApprove,
  onReject,
  loading,
  approveLabel = 'Approve',
  rejectLabel = 'Reject',
}: ApproveRejectButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <AdminActionButton
        onClick={onApprove}
        loading={loading}
        variant="primary"
        icon={Check}
      >
        {approveLabel}
      </AdminActionButton>
      <AdminActionButton
        onClick={onReject}
        loading={loading}
        variant="danger"
        icon={X}
      >
        {rejectLabel}
      </AdminActionButton>
    </div>
  )
}

export const AdminActionButtons = {
  Button: AdminActionButton,
  ApproveReject: ApproveRejectButtons,
}
