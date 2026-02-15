import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resend } from '@/lib/resend'
import { PropertyInquiryEmail } from '@/emails/PropertyInquiryEmail'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { propertyId, message } = body

    // Validate required fields
    if (!propertyId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Fetch property to get owner id
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, title, user_id')
      .eq('id', propertyId)
      .single()

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Prevent users from inquiring about their own properties
    if (property.user_id === user.id) {
      return NextResponse.json(
        { error: 'Cannot inquire about your own property' },
        { status: 400 }
      )
    }

    // Record inquiry in database (for backwards compatibility and analytics)
    const { error: inquiryError } = await supabase
      .from('inquiries')
      .insert({
        property_id: propertyId,
        sender_id: user.id,
        recipient_id: property.user_id,
        message,
      })

    if (inquiryError) {
      console.error('Error creating inquiry:', inquiryError)
      return NextResponse.json(
        { error: 'Failed to send inquiry' },
        { status: 500 }
      )
    }

    // Create or get conversation using the database function
    const { data: conversationId, error: convError } = await supabase.rpc(
      'get_or_create_conversation',
      {
        p_property_id: propertyId,
        p_renter_id: user.id,
        p_landlord_id: property.user_id,
      }
    )

    if (convError || !conversationId) {
      console.error('Error creating conversation:', convError)
      // Don't fail the request - inquiry is already saved
      return NextResponse.json({ success: true, conversationCreated: false })
    }

    // Send the initial message in the conversation
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: message,
        message_type: 'text',
      })

    if (messageError) {
      console.error('Error sending message:', messageError)
      // Don't fail - conversation exists, user can send message via Messages page
    }

    // Send email notification to landlord
    try {
      // Get sender profile info
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single()
      
      // Get landlord profile info (includes email)
      const { data: landlordProfile } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', property.user_id)
        .single()

      const landlordEmail = landlordProfile?.email

      if (landlordEmail) {
        const { error: emailError } = await resend.emails.send({
          from: 'Huts <noreply@huts.co.zw>',
          to: landlordEmail,
          replyTo: user.email || undefined,
          subject: `New inquiry for ${property.title}`,
          react: PropertyInquiryEmail({
            propertyTitle: property.title,
            propertyUrl: `https://www.huts.co.zw/property/${propertyId}`,
            inquirerName: senderProfile?.name || user.user_metadata?.name || 'A renter',
            inquirerEmail: user.email || '',
            message,
            landlordName: landlordProfile?.name || 'Property Owner',
          }),
        })

        if (emailError) {
          console.error('[Inquiry Email] Resend error:', emailError)
        } else {
          console.log('[Inquiry Email] Sent to landlord:', landlordEmail)
        }
      }
    } catch (emailError) {
      console.error('[Inquiry Email] error:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ 
      success: true, 
      conversationId,
      conversationCreated: true 
    })
  } catch (error) {
    console.error('Inquiry error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
