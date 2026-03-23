type StatusKey = 'active' | 'pending_offer' | 'under_contract' | 'closed' | 'cancelled' | 'expired'

interface TransactionStatusProps {
  status: StatusKey
}

const STATUS_CONFIG: Record<StatusKey, { label: string; dot: string; className: string }> = {
  active:         { label: 'Active',         dot: 'bg-[#22C55E]', className: 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]' },
  pending_offer:  { label: 'Pending Offer',  dot: 'bg-[#F59E0B]', className: 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]' },
  under_contract: { label: 'Under Contract', dot: 'bg-[#6366F1]', className: 'bg-[#EEF2FF] text-[#3730A3] border border-[#C7D2FE]' },
  closed:         { label: 'Closed',         dot: 'bg-[#111827]', className: 'bg-[#F9FAFB] text-[#374151] border border-[#E5E7EB]' },
  cancelled:      { label: 'Cancelled',      dot: 'bg-[#EF4444]', className: 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]' },
  expired:        { label: 'Expired',        dot: 'bg-[#9CA3AF]', className: 'bg-[#F9FAFB] text-[#6B7280] border border-[#E5E7EB]' },
}

export function TransactionStatus({ status }: TransactionStatusProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.expired

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-full ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      {config.label}
    </span>
  )
}