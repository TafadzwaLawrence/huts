'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui'
import type { Database } from '@/types/database'
import { FileText, Download, Trash2, CheckCircle, Loader, Lock } from 'lucide-react'

type TransactionDocument = Database['public']['Tables']['transaction_documents']['Row']

interface TransactionDocumentsProps {
  transactionId: string
  canUpload?: boolean
}

export function TransactionDocuments({
  transactionId,
  canUpload = true,
}: TransactionDocumentsProps) {
  const [documents, setDocuments] = useState<TransactionDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load documents
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const response = await fetch(
          `/api/transactions/${transactionId}/documents`
        )
        if (!response.ok) {
          throw new Error('Failed to load documents')
        }
        const data = await response.json()
        setDocuments(data.documents || [])
      } catch (err) {
        console.error('Error loading documents:', err)
        setError('Failed to load documents')
      } finally {
        setLoading(false)
      }
    }

    loadDocuments()
  }, [transactionId])

  // Handle document delete
  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      const response = await fetch(
        `/api/transactions/${transactionId}/documents/${documentId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        throw new Error('Failed to delete document')
      }

      setDocuments(documents.filter(doc => doc.id !== documentId))
    } catch (err) {
      console.error('Error deleting document:', err)
      setError('Failed to delete document')
    }
  }

  // Handle mark as executed
  const handleMarkExecuted = async (documentId: string) => {
    try {
      const response = await fetch(
        `/api/transactions/${transactionId}/documents/${documentId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_executed: true }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update document')
      }

      const updatedDoc = await response.json()
      setDocuments(
        documents.map(doc =>
          doc.id === documentId
            ? { ...doc, is_executed: updatedDoc.is_executed }
            : doc
        )
      )
    } catch (err) {
      console.error('Error updating document:', err)
      setError('Failed to update document')
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Documents
          <Badge variant="outline">{documents.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-5 h-5 animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <div className="py-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-gray-600">No documents uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map(doc => (
              <div
                key={doc.id}
                className="border border-gray-200 rounded-lg p-4 flex items-start justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <p className="font-semibold">{doc.title}</p>
                    {doc.is_private && (
                      <Lock className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {doc.document_type}
                    </Badge>
                    {doc.is_executed && (
                      <Badge variant="solid">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Executed
                      </Badge>
                    )}
                    <span className="text-xs text-gray-600">
                      {doc.created_at
                        ? new Date(doc.created_at).toLocaleDateString()
                        : ''}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() =>
                      window.open(doc.file_path, '_blank')
                    }
                    className="btn btn-ghost btn-icon"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {!doc.is_executed && (
                    <button
                      onClick={() => handleMarkExecuted(doc.id)}
                      className="btn btn-ghost btn-icon"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="btn btn-ghost btn-icon text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
