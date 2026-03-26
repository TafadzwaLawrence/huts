import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

export const dynamic = 'force-dynamic'

interface DocumentUploadRequest {
  title: string
  document_type: string
  file_size: number
  file_url: string // Uploadthing URL
  file_name: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const transactionId = params.id
    const body = (await request.json()) as DocumentUploadRequest

    // Validate request body
    if (!body.title || !body.document_type || !body.file_url) {
      return NextResponse.json(
        { error: 'Missing required fields: title, document_type, file_url' },
        { status: 400 }
      )
    }

    // Validate document type enum
    const validDocumentTypes = ['contract', 'disclosure', 'addendum', 'inspection_report', 'appraisal', 'closing_statement', 'other']
    if (!validDocumentTypes.includes(body.document_type)) {
      return NextResponse.json(
        { error: `Invalid document type. Must be one of: ${validDocumentTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Fetch transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*, transaction_participants!inner(*)')
      .eq('id', transactionId)
      .single()

    if (transactionError || !transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Check if user is a participant in the transaction
    const isParticipant = transaction.transaction_participants.some(
      (p: any) => p.profile_id === user.id
    )

    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Only transaction participants can upload documents' },
        { status: 403 }
      )
    }

    // Create transaction document record
    const { data: document, error: documentError } = await supabase
      .from('transaction_documents')
      .insert({
        transaction_id: transactionId,
        title: body.title,
        document_type: body.document_type,
        file_path: body.file_url,
        file_name: body.file_name || body.title,
        file_size_bytes: body.file_size,
        uploaded_by: user.id,
        is_private: false,
        is_executed: false,
      })
      .select()
      .single()

    if (documentError) {
      console.error('[Document Upload] Insert error:', documentError)
      return NextResponse.json(
        { error: 'Failed to save document record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      document,
      message: 'Document uploaded successfully',
    })
  } catch (error) {
    console.error('[Document Upload] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET documents for a transaction
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const transactionId = params.id

    // Fetch transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*, transaction_participants!inner(*)')
      .eq('id', transactionId)
      .single()

    if (transactionError || !transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Check if user is a participant
    const isParticipant = transaction.transaction_participants.some(
      (p: any) => p.profile_id === user.id
    )

    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Not authorized to view these documents' },
        { status: 403 }
      )
    }

    // Fetch documents
    const { data: documents, error: documentError } = await supabase
      .from('transaction_documents')
      .select('*')
      .eq('transaction_id', transactionId)
      .order('created_at', { ascending: false })

    if (documentError) {
      console.error('[Get Documents] Error:', documentError)
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      documents,
      count: documents?.length || 0,
    })
  } catch (error) {
    console.error('[Get Documents] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
