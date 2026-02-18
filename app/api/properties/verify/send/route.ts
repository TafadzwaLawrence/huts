import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getResend } from '@/lib/resend'
import { PropertyVerificationEmail } from '@/emails/PropertyVerificationEmail'
import { formatPrice, formatSalePrice } from '@/lib/utils'

const ADMIN_EMAIL = 'chitangalawrence03@gmail.com'
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.huts.co.zw'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { propertyId } = body

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 })
    }

    // Fetch the property with its details
    console.log('[Verification] Fetching property:', propertyId, 'for user:', user.id)
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select(`
        *,
        property_images(url, is_primary),
        profiles!properties_user_id_fkey(name, email)
      `)
      .eq('id', propertyId)
      .eq('user_id', user.id)
      .single()

    if (propertyError || !property) {
      console.error('[Verification] Property fetch error:', propertyError)
      return NextResponse.json({ error: 'Property not found', details: propertyError?.message }, { status: 404 })
    }

    // Get or generate verification token
    let verificationToken = property.verification_token

    if (!verificationToken) {
      // Generate a new token if missing
      console.log('[Verification] No token found, generating one for:', propertyId)
      const newToken = crypto.randomUUID()
      const { error: tokenError } = await supabase
        .from('properties')
        .update({ verification_token: newToken })
        .eq('id', propertyId)

      if (tokenError) {
        console.error('[Verification] Failed to generate token:', tokenError)
        return NextResponse.json({ error: 'Failed to prepare verification' }, { status: 500 })
      }
      verificationToken = newToken
    }

    // If retrying (status is rejected/pending), reset to pending and regenerate token
    // so old approve/reject links are invalidated and admin can act on the new email
    if (property.verification_status === 'rejected') {
      console.log('[Verification] Resetting rejected property to pending:', propertyId)
      const freshToken = crypto.randomUUID()
      const { error: resetError } = await supabase
        .from('properties')
        .update({
          verification_status: 'pending',
          verification_token: freshToken,
          verified_at: null,
          rejection_reason: null,
        })
        .eq('id', propertyId)

      if (resetError) {
        console.error('[Verification] Failed to reset status:', resetError)
        return NextResponse.json({ error: 'Failed to reset verification status' }, { status: 500 })
      }
      verificationToken = freshToken
    }

    console.log('[Verification] Token ready, building email for:', property.title)

    // Build URLs for approval/rejection
    const approveUrl = `${BASE_URL}/api/properties/verify?token=${verificationToken}&action=approve`
    const rejectUrl = `${BASE_URL}/api/properties/verify?token=${verificationToken}&action=reject`
    const propertyUrl = `${BASE_URL}/property/${property.slug}`

    // Get primary image
    const primaryImage = property.property_images?.find((img: any) => img.is_primary) 
      || property.property_images?.[0]

    // Format the price
    const isForSale = property.listing_type === 'sale'
    const displayPrice = isForSale && property.sale_price
      ? formatSalePrice(property.sale_price)
      : property.price
        ? formatPrice(property.price)
        : '$0'

    // Get owner info
    const ownerProfile = property.profiles as any
    const ownerName = ownerProfile?.name || 'Unknown'
    const ownerEmail = ownerProfile?.email || user.email || 'Unknown'

    // Send verification email to admin
    let resend
    try {
      resend = getResend()
    } catch (initError: any) {
      console.error('[Verification] Resend init error:', initError.message)
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const emailProps = {
      propertyTitle: property.title || 'Untitled Property',
      propertyAddress: property.address || 'N/A',
      propertyCity: property.city || 'N/A',
      propertyType: property.property_type || 'property',
      listingType: (property.listing_type || 'rent') as 'rent' | 'sale',
      price: displayPrice,
      beds: property.beds || 0,
      baths: property.baths || 0,
      ownerName,
      ownerEmail,
      propertyUrl,
      approveUrl,
      rejectUrl,
      imageUrl: primaryImage?.url,
    }

    console.log('[Verification] Sending email with props:', JSON.stringify({ ...emailProps, imageUrl: emailProps.imageUrl ? '(set)' : '(none)' }))

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Huts <noreply@huts.co.zw>',
      to: ADMIN_EMAIL,
      subject: `[Verify] New property: ${property.title}`,
      react: PropertyVerificationEmail(emailProps),
    })

    if (emailError) {
      console.error('[Verification] Email send error:', JSON.stringify(emailError))
      return NextResponse.json({ error: 'Failed to send verification email', details: emailError }, { status: 500 })
    }

    console.log('[Verification] Email sent successfully for property:', property.title)
    return NextResponse.json({ 
      success: true, 
      message: 'Property submitted for verification' 
    })
  } catch (error: any) {
    console.error('[Verification] Unexpected error:', error?.message || error, error?.stack)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error?.message || String(error) 
    }, { status: 500 })
  }
}
