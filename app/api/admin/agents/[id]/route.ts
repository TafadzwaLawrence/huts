import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { resend } from '@/lib/resend'
import { AgentVerificationEmail } from '@/emails/AgentVerificationEmail'
import * as React from 'react'

export const dynamic = 'force-dynamic'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'chitangalawrence03@gmail.com')
  .split(',')
  .map(e => e.trim())

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://huts.co.zw'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    if (!ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const allowed: Record<string, unknown> = {}

    // Only allow specific fields to be updated
    if ('status' in body && ['pending', 'active', 'suspended', 'inactive'].includes(body.status)) {
      allowed.status = body.status
    }
    if ('verified' in body && typeof body.verified === 'boolean') {
      allowed.verified = body.verified
      if (body.verified) allowed.verification_date = new Date().toISOString()
    }
    if ('featured' in body && typeof body.featured === 'boolean') {
      allowed.featured = body.featured
    }

    if (!Object.keys(allowed).length) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Use admin client to bypass RLS for the actual DB write
    const adminDb = createAdminClient()
    const { data, error } = await adminDb
      .from('agents')
      .update({ ...allowed, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select('id, user_id, status, verified, featured, business_name, agent_type, slug')
      .single()

    if (error) throw error

    // ── Send verification / approval email ──────────────────────────────────
    const shouldEmail =
      (allowed.status === 'active') || (allowed.verified === true)

    if (shouldEmail && data) {
      try {
        // Fetch the agent's email from profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', data.user_id)
          .single()

        if (profile?.email) {
          const agentName = data.business_name || profile.full_name || 'Agent'
          const agentTypeLabels: Record<string, string> = {
            real_estate_agent: 'Real Estate Agent',
            property_manager: 'Property Manager',
            home_builder: 'Home Builder',
            photographer: 'Real Estate Photographer',
            other: 'Professional',
          }
          const agentType = agentTypeLabels[data.agent_type] || 'Professional'
          const profileSlug = data.slug || data.user_id
          const profileUrl = `${BASE_URL}/agent/${profileSlug}`
          const portalUrl  = `${BASE_URL}/agent/overview`
          const action: 'approved' | 'verified' =
            allowed.status === 'active' ? 'approved' : 'verified'

          await resend.emails.send({
            from: 'Huts <noreply@huts.co.zw>',
            to: profile.email,
            subject: action === 'approved'
              ? `Your Huts agent profile is now live, ${agentName}!`
              : `You've been verified on Huts, ${agentName}!`,
            react: React.createElement(AgentVerificationEmail, {
              agentName,
              agentType,
              profileUrl,
              portalUrl,
              action,
            }),
          })
        }
      } catch (emailErr) {
        // Non-fatal — log but don't fail the update
        console.error('[Admin] agents PATCH email error:', emailErr)
      }
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[Admin] agents PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    if (!ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminDb = createAdminClient()
    const { error } = await adminDb
      .from('agents')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Admin] agents DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
