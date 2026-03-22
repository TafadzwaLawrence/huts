'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { CreateTransactionModal } from './CreateTransactionModal'

export function CreateTransactionButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-charcoal transition-colors"
      >
        <Plus size={18} />
        New Transaction
      </button>

      <CreateTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}