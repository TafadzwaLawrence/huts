import type { TransactionStatus as TransactionStatusType } from '@/types'

interface TransactionStatusProps {
  status: TransactionStatusType
}

export function TransactionStatus({ status }: TransactionStatusProps) {
  const statusConfig = {
    active: {
      label: 'Active',
      className: 'bg-blue-100 text-blue-800'
    },
    pending_offer: {
      label: 'Pending Offer',
      className: 'bg-yellow-100 text-yellow-800'
    },
    under_contract: {
      label: 'Under Contract',
      className: 'bg-purple-100 text-purple-800'
    },
    closed: {
      label: 'Closed',
      className: 'bg-green-100 text-green-800'
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-red-100 text-red-800'
    },
    expired: {
      label: 'Expired',
      className: 'bg-gray-100 text-gray-800'
    }
  }

  const config = statusConfig[status]

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
      {config.label}
    </span>
  )
}