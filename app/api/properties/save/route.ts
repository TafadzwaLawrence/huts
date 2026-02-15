import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { propertyId } = await request.json()

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 })
    }

    // Save property
    const { error } = await supabase
      .from('saved_properties')
      .insert({
        user_id: user.id,
        property_id: propertyId,
      })

    if (error) {
      // Check if already saved (duplicate key error)
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Property already saved' }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error saving property:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save property' },
      { status: 500 }
    )
  }
}
