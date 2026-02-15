import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MyPropertiesList from '@/components/dashboard/MyPropertiesList'

export const metadata = {
  title: 'My Properties | Huts',
  description: 'Manage your property listings',
}

export default async function MyPropertiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/dashboard')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'landlord') {
    redirect('/dashboard/overview')
  }

  const { data: properties } = await supabase
    .from('properties')
    .select(`*, property_images(url, order, is_primary)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const propertiesWithStats = await Promise.all(
    (properties || []).map(async (property) => {
      const [{ count: views }, { count: saves }, { count: inquiries }] = await Promise.all([
        supabase.from('property_views').select('*', { count: 'exact', head: true }).eq('property_id', property.id),
        supabase.from('saved_properties').select('*', { count: 'exact', head: true }).eq('property_id', property.id),
        supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('property_id', property.id),
      ])
      return { ...property, stats: { views: views || 0, saves: saves || 0, inquiries: inquiries || 0 } }
    })
  )

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <MyPropertiesList properties={propertiesWithStats} />
      </div>
    </div>
  )
}
