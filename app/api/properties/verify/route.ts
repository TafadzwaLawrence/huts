import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.huts.co.zw'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const action = searchParams.get('action')

    if (!token || !action) {
      return redirectWithMessage('error', 'Missing verification parameters')
    }

    if (!['approve', 'reject'].includes(action)) {
      return redirectWithMessage('error', 'Invalid action')
    }

    // Use admin client to bypass RLS — auth is via the secret verification token
    const supabase = createAdminClient()

    // Find property by verification token
    const { data: property, error: fetchError } = await supabase
      .from('properties')
      .select('id, title, verification_status, user_id, profiles!properties_user_id_fkey(email, name)')
      .eq('verification_token', token)
      .single()

    if (fetchError || !property) {
      console.error('[Verification] Token lookup error:', fetchError)
      return redirectWithMessage('error', 'Invalid or expired verification token')
    }

    // Check if already processed
    if (property.verification_status !== 'pending') {
      return redirectWithMessage('info', `This property has already been ${property.verification_status}`)
    }

    // Update verification status
    const updateData: any = {
      verification_status: action === 'approve' ? 'approved' : 'rejected',
      verified_at: new Date().toISOString(),
    }

    // If approved, make sure status is active
    if (action === 'approve') {
      updateData.status = 'active'
    }

    // If rejected, set status to inactive
    if (action === 'reject') {
      updateData.status = 'inactive'
    }

    const { error: updateError } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', property.id)

    if (updateError) {
      console.error('[Verification] Update error:', updateError)
      return redirectWithMessage('error', 'Failed to update property status')
    }

    const statusText = action === 'approve' ? 'approved' : 'rejected'
    return redirectWithMessage('success', `Property "${property.title}" has been ${statusText}`)
  } catch (error) {
    console.error('[Verification] Unexpected error:', error)
    return redirectWithMessage('error', 'Something went wrong')
  }
}

function redirectWithMessage(type: 'success' | 'error' | 'info', message: string) {
  const url = new URL(`${BASE_URL}/api/properties/verify/result`)
  url.searchParams.set('type', type)
  url.searchParams.set('message', message)
  return NextResponse.redirect(url)
}
