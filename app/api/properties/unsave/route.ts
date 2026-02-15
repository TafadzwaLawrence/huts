import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const formData = await request.formData()
    const savedId = formData.get('savedId') as string
    const propertyId = formData.get('propertyId') as string

    // Delete by saved_properties id OR by property_id + user_id
    if (savedId) {
      const { error } = await supabase
        .from('saved_properties')
        .delete()
        .eq('id', savedId)
        .eq('user_id', user.id)

      if (error) throw error
    } else if (propertyId) {
      const { error } = await supabase
        .from('saved_properties')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId)

      if (error) throw error
    } else {
      return NextResponse.json({ error: 'savedId or propertyId required' }, { status: 400 })
    }

    // Redirect back to saved page
    redirect('/dashboard/saved')
  } catch (error: any) {
    console.error('Error unsaving property:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to unsave property' },
      { status: 500 }
    )
  }
}
