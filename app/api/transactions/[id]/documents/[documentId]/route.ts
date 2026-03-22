import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface UpdateDocumentRequest {
  title?: string
  is_executed?: boolean
  is_private?: boolean
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; documentId: string } }
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
    const documentId = params.documentId
    const body = (await request.json()) as UpdateDocumentRequest

    // Fetch the document
    const { data: document, error: docError } = await supabase
      .from('transaction_documents')
      .select('*')
      .eq('id', documentId)
      .eq('transaction_id', transactionId)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Check if user is authorized (must be uploader or transaction participant)
    if (document.uploaded_by !== user.id) {
      // Check if user is a transaction participant
      const { data: transaction } = await supabase
        .from('transactions')
        .select('*, transaction_participants!inner(*)')
        .eq('id', transactionId)
        .single()

      const isParticipant = transaction?.transaction_participants?.some(
        (p: any) => p.user_id === user.id
      )

      if (!isParticipant) {
        return NextResponse.json(
          { error: 'Not authorized to update this document' },
          { status: 403 }
        )
      }
    }

    // Update document
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (body.title !== undefined) updateData.title = body.title
    if (body.is_executed !== undefined) updateData.is_executed = body.is_executed
    if (body.is_private !== undefined) updateData.is_private = body.is_private

    const { data: updatedDoc, error: updateError } = await supabase
      .from('transaction_documents')
      .update(updateData)
      .eq('id', documentId)
      .select()
      .single()

    if (updateError) {
      console.error('[Update Document] Error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedDoc)
  } catch (error) {
    console.error('[Update Document] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; documentId: string } }
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
    const documentId = params.documentId

    // Fetch the document
    const { data: document, error: docError } = await supabase
      .from('transaction_documents')
      .select('*')
      .eq('id', documentId)
      .eq('transaction_id', transactionId)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Check if user is authorized (must be uploader)
    if (document.uploaded_by !== user.id) {
      return NextResponse.json(
        { error: 'Only the uploader can delete this document' },
        { status: 403 }
      )
    }

    // Delete document
    const { error: deleteError } = await supabase
      .from('transaction_documents')
      .delete()
      .eq('id', documentId)

    if (deleteError) {
      console.error('[Delete Document] Error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Delete Document] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
