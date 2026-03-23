'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui'
import {
  getWorkflowTimeline,
  getAvailableActions,
  getStateInfo,
  isActiveTransaction,
} from '@/lib/transaction-workflow'
import { formatPrice } from '@/lib/utils'
import type { Database } from '@/types/database'
import { CheckCircle, FileText, Users, DollarSign, Loader } from 'lucide-react'

type Transaction = Database['public']['Tables']['transactions']['Row'] & {
  transaction_participants?: Database['public']['Tables']['transaction_participants']['Row'][]
  transaction_documents?: Database['public']['Tables']['transaction_documents']['Row'][]
}

const STATE_COLORS: Record<string, string> = {
  active: 'bg-blue-600',
  pending_offer: 'bg-yellow-600',
  under_contract: 'bg-purple-600',
  closed: 'bg-green-600',
  cancelled: 'bg-red-600',
  expired: 'bg-gray-600',
}

export default function TransactionDetailPage() {
  const params = useParams()
  const supabase = createClient()
  const transactionId = params.id as string

  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [transitionLoading, setTransitionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'details' | 'participants' | 'documents' | 'actions'>('details')

  // Fetch transaction
  useEffect(() => {
    const loadTransaction = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('transactions')
          .select(`
            *,
            transaction_participants(*),
            transaction_documents(*)
          `)
          .eq('id', transactionId)
          .single()

        if (fetchError) throw fetchError
        setTransaction(data as Transaction)
      } catch (err) {
        console.error('Error loading transaction:', err)
        setError('Failed to load transaction')
      } finally {
        setLoading(false)
      }
    }

    loadTransaction()
  }, [transactionId, supabase])

  // Handle state transition
  const handleTransition = async (toState: string) => {
    setTransitionLoading(true)
    try {
      const response = await fetch(`/api/transactions/${transactionId}/transition`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toState }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to transition')
      }

      const data = await response.json()
      setTransaction(data.transaction)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to transition'
      setError(message)
      console.error('Transition error:', err)
    } finally {
      setTransitionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="p-6">
        <p className="text-red-600">Transaction not found</p>
      </div>
    )
  }

  const stateInfo = getStateInfo(transaction.status)
  const timeline = getWorkflowTimeline(transaction.status)
  const availableActions = getAvailableActions(transaction.status)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{transaction.property_id}</h1>
          <p className="text-gray-600">Transaction ID: {transactionId}</p>
        </div>
        <Badge
          className={`px-4 py-2 text-white ${STATE_COLORS[transaction.status] || 'bg-gray-600'}`}
        >
          {stateInfo.label}
        </Badge>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Workflow Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeline.map((step, index) => (
              <div key={step.state} className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    step.isCompleted
                      ? 'bg-green-600 text-white'
                      : step.isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.isCompleted ? <CheckCircle className="w-5 h-5" /> : index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{step.label}</p>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['details', 'participants', 'documents', 'actions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-black text-black'
                : 'border-b-2 border-transparent text-gray-600 hover:text-black'
            }`}
          >
            {tab === 'documents' ? `${tab} (${transaction.transaction_documents?.length || 0})` : tab}
          </button>
        ))}
      </div>

      {/* Details Tab */}
      {activeTab === 'details' && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Transaction Type</label>
              <p className="font-semibold capitalize">{transaction.transaction_type}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Total Price</label>
              <p className="font-semibold">
                {formatPrice(transaction.final_price || transaction.offer_price || 0)}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Commission Amount</label>
              <p className="font-semibold">{formatPrice((transaction.final_price || 0) * 0.05)}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Financing Type</label>
              <p className="font-semibold capitalize">{transaction.financing_type || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Offer Date</label>
              <p className="font-semibold">
                {transaction.offer_date
                  ? new Date(transaction.offer_date).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Contract Date</label>
              <p className="font-semibold">
                {transaction.contract_date
                  ? new Date(transaction.contract_date).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Closing Date</label>
              <p className="font-semibold">
                {transaction.closing_date
                  ? new Date(transaction.closing_date).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Status</label>
              <p className="font-semibold capitalize">{transaction.status}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Participants Tab */}
      {activeTab === 'participants' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Transaction Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transaction.transaction_participants?.map((participant) => (
                <div
                  key={participant.id}
                  className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold">{participant.profile_id}</p>
                    <p className="text-sm text-gray-600 capitalize">{participant.role}</p>
                  </div>
                  <Badge>{participant.role}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transaction.transaction_documents && transaction.transaction_documents.length > 0 ? (
              <div className="space-y-3">
                {transaction.transaction_documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold">{doc.title}</p>
                      <p className="text-sm text-gray-600 capitalize">{doc.document_type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.is_executed && <Badge>Executed</Badge>}
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No documents uploaded yet</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions Tab */}
      {activeTab === 'actions' && (
        <Card>
          <CardHeader>
            <CardTitle>Available Actions</CardTitle>
          </CardHeader>
          <CardContent>
            {isActiveTransaction(transaction.status) && availableActions.length > 0 ? (
              <div className="space-y-3">
                {availableActions.map((action) => (
                  <Button
                    key={action.action}
                    onClick={() => handleTransition(action.toState)}
                    disabled={transitionLoading}
                    className="w-full justify-start"
                    variant="secondary"
                  >
                    {transitionLoading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                    {action.label}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">
                {transaction.status === 'closed'
                  ? 'This transaction is completed'
                  : 'No actions available for this transaction'}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
