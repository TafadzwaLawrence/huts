/**
 * POST /api/agents/register
 * 
 * Register or create an agent profile
 * Requires authentication (user must be logged in)
 * 
 * Request body:
 * {
 *   businessName: string,
 *   licenseNumber: string,
 *   licenseState: string,
 *   licenseExpiryDate: string (ISO date),
 *   yearsExperience: number,
 *   phone: string,
 *   whatsapp?: string,
 *   officeAddress: string,
 *   officeCity: string,
 *   agentType: string,
 *   specializations?: string[],
 *   languages?: string[],
 *   bio?: string
 * }
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 1. Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      )
    }

    // 2. Check if agent already exists
    const { data: existingAgent } = await supabase
      .from('agents')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingAgent) {
      return NextResponse.json(
        { error: 'Agent profile already exists for this user' },
        { status: 409 },
      )
    }

    // 3. Parse and validate request
    const body = await request.json()

    const {
      businessName,
      licenseNumber,
      licenseState,
      licenseExpiryDate,
      yearsExperience,
      phone,
      whatsapp,
      officeAddress,
      officeCity,
      agentType,
      specializations,
      languages,
      bio,
    } = body

    // Validate required fields
    if (!businessName || !phone || !officeCity || !agentType) {
      return NextResponse.json(
        { error: 'Missing required fields: businessName, phone, officeCity, agentType' },
        { status: 400 },
      )
    }

    // Validate agentType
    const validTypes = [
      'real_estate_agent',
      'property_manager',
      'home_builder',
      'photographer',
      'other',
    ]
    if (!validTypes.includes(agentType)) {
      return NextResponse.json(
        { error: `Invalid agentType: ${agentType}` },
        { status: 400 },
      )
    }

    // 4. Generate slug from business name
    const baseSlug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Check slug uniqueness
    let slug = baseSlug
    let counter = 1
    let slugExists = true

    while (slugExists) {
      const { data: existing } = await supabase
        .from('agents')
        .select('id')
        .eq('slug', slug)
        .single()

      if (!existing) {
        slugExists = false
      } else {
        counter += 1
        slug = `${baseSlug}-${counter}`
      }
    }

    // 5. Create agent profile
    const { data: newAgent, error: createError } = await supabase
      .from('agents')
      .insert({
        user_id: user.id,
        business_name: businessName,
        license_number: licenseNumber,
        license_state: licenseState,
        license_expiry_date: licenseExpiryDate,
        years_experience: yearsExperience,
        phone,
        whatsapp,
        office_address: officeAddress,
        office_city: officeCity,
        agent_type: agentType,
        specializations: specializations || [],
        languages: languages || [],
        bio,
        slug,
        is_active: true,
        verified: false, // Admin approval needed
      })
      .select()
      .single()

    if (createError || !newAgent) {
      console.error('Failed to create agent:', createError)
      return NextResponse.json(
        { error: 'Failed to create agent profile' },
        { status: 500 },
      )
    }

    // 6. Return created agent
    return NextResponse.json(
      {
        success: true,
        agent: newAgent,
        message: 'Agent profile created successfully. Awaiting admin verification.',
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Register agent error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

/**
 * GET /api/agents/[agentId]
 * 
 * Get agent profile by ID (public or owned)
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get agentId from URL
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const agentId = pathParts[pathParts.length - 1]

    if (!agentId) {
      return NextResponse.json(
        { error: 'Missing agentId' },
        { status: 400 },
      )
    }

    // Get current user (optional)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Get agent
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single()

    if (agentError || !agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // If not owned by user, only show if active
    if (!user || user.id !== agent.user_id) {
      if (!agent.is_active) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
      }
    }

    // Get service areas
    const { data: serviceAreas } = await supabase
      .from('agent_service_areas')
      .select('*')
      .eq('agent_id', agentId)

    return NextResponse.json(
      {
        agent: {
          ...agent,
          serviceAreas,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Get agent error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

/**
 * PATCH /api/agents/[agentId]
 * 
 * Update agent profile (only owner or admin)
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    // Get agentId from URL
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const agentId = pathParts[pathParts.length - 1]

    if (!agentId) {
      return NextResponse.json(
        { error: 'Missing agentId' },
        { status: 400 },
      )
    }

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      )
    }

    // Verify ownership
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('user_id')
      .eq('id', agentId)
      .single()

    if (agentError || !agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    if (agent.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this agent' },
        { status: 403 },
      )
    }

    // Parse update payload
    const body = await request.json()

    // Build update object (whitelist fields)
    const allowedFields = [
      'business_name',
      'license_number',
      'license_state',
      'license_expiry_date',
      'years_experience',
      'phone',
      'whatsapp',
      'office_address',
      'office_city',
      'bio',
      'specializations',
      'languages',
      'profile_image_url',
      'cover_image_url',
    ]

    const updatePayload: any = {}
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updatePayload[field] = body[field]
      }
    })

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 },
      )
    }

    // Update agent
    const { error: updateError } = await supabase
      .from('agents')
      .update(updatePayload)
      .eq('id', agentId)

    if (updateError) {
      console.error('Failed to update agent:', updateError)
      return NextResponse.json(
        { error: 'Failed to update agent' },
        { status: 500 },
      )
    }

    // Fetch updated agent
    const { data: updatedAgent, error: refetchError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single()

    if (refetchError) {
      return NextResponse.json(
        { error: 'Agent updated but could not fetch updated record' },
        { status: 200 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        agent: updatedAgent,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Update agent error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
