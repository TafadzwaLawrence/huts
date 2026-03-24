'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils'
import { ICON_SIZES } from '@/lib/constants'
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Lock,
  AlertCircle,
  Loader2,
  MapPin,
  Bed,
  Bath,
  Square,
  Image as ImageIcon,
} from 'lucide-react'

interface Property {
  id: string
  title: string
  slug: string
  property_type: string
  listing_type: 'rent' | 'sale'
  status: 'active' | 'inactive' | 'draft'
  verification_status: string
  price: number | null
  sale_price: number | null
  bedrooms: number | null
  bathrooms: number | null
  square_feet: number | null
  city: string | null
  address: string | null
  property_images: Array<{ url: string; is_primary: boolean }>
  user: Array<{ full_name: string }> | { full_name: string } | null
}

export default function AgentMyPropertiesPage() {
  const supabase = createClient()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [agentId, setAgentId] = useState<string | null>(null)

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/signup')
          return
        }

        // Get agent record
        const { data: agent } = await supabase
          .from('agents')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (!agent) {
          toast.error('Agent profile not found. Please complete your agent setup.')
          router.push('/agent/profile')
          return
        }

        setAgentId(agent.id)

        // Load properties where agent_id = current agent
        const { data: props, error } = await supabase
          .from('properties')
          .select(`
            id,
            title,
            slug,
            property_type,
            listing_type,
            status,
            verification_status,
            price,
            sale_price,
            bedrooms,
            bathrooms,
            square_feet,
            city,
            address,
            user:user_id(full_name),
            property_images(url, is_primary)
          `)
          .eq('agent_id', agent.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setProperties(props || [])
      } catch (error) {
        console.error('Error loading properties:', error)
        toast.error('Failed to load properties')
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [supabase, router])

  const handleDelete = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return

    setDeleting(propertyId)
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)

      if (error) throw error

      setProperties(prev => prev.filter(p => p.id !== propertyId))
      toast.success('Property deleted')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to delete property')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#212529]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-[#E9ECEF] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#212529]">
                My Properties
              </h1>
              <p className="text-sm text-[#ADB5BD] mt-1">
                {properties.length} {properties.length === 1 ? 'property' : 'properties'} listed
              </p>
            </div>
            <Link
              href="/agent/new-property"
              className="flex items-center gap-2 px-4 py-3 bg-[#212529] text-white rounded-lg hover:bg-[#000000] transition-all"
            >
              <Plus size={ICON_SIZES.md} /> New Property
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {properties.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-[#ADB5BD]" />
            <h2 className="text-lg font-semibold text-[#212529] mb-2">
              No properties listed yet
            </h2>
            <p className="text-[#ADB5BD] mb-6">
              Start listing properties to grow your portfolio
            </p>
            <Link
              href="/agent/new-property"
              className="inline-flex items-center gap-2 px-4 py-3 bg-[#212529] text-white rounded-lg hover:bg-[#000000] transition-all"
            >
              <Plus size={ICON_SIZES.md} /> Create Property
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(property => {
              const primaryImage = property.property_images?.find(img => img.is_primary)?.url
                || property.property_images?.[0]?.url

              return (
                <div
                  key={property.id}
                  className="group bg-white border border-[#E9ECEF] rounded-lg overflow-hidden hover:border-[#212529] hover:shadow-lg transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-[#F8F9FA] overflow-hidden">
                    {primaryImage ? (
                      <img
                        src={primaryImage}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-[#ADB5BD]" />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          property.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {property.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                      {property.verification_status !== 'verified' && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 flex items-center gap-1">
                          <AlertCircle size={12} /> Pending
                        </span>
                      )}
                    </div>

                    {/* Listing Type Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="bg-[#212529] text-white px-3 py-1 rounded text-xs font-semibold">
                        {property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    {/* Title */}
                    <h3 className="font-semibold text-[#212529] mb-1 truncate">
                      {property.title}
                    </h3>

                    {/* Owner & Location */}
                    <p className="text-xs text-[#ADB5BD] mb-3">
                      {Array.isArray(property.user) ? property.user[0]?.full_name : property.user?.full_name}
                    </p>
                    <div className="flex items-center text-[#495057] text-sm mb-3">
                      <MapPin size={14} className="mr-1 flex-shrink-0" />
                      <span className="truncate">
                        {property.address || property.city || 'Location not set'}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-3 pb-3 border-b border-[#E9ECEF]">
                      <p className="font-semibold text-[#212529]">
                        {property.listing_type === 'rent'
                          ? formatPrice(property.price || 0) + '/mo'
                          : formatPrice(property.sale_price || 0)}
                      </p>
                    </div>

                    {/* Property Details Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                      <div className="text-center">
                        <Bed size={16} className="mx-auto mb-1 text-[#ADB5BD]" />
                        <p className="text-[#212529] font-semibold">
                          {property.bedrooms || 0}
                        </p>
                        <p className="text-[#ADB5BD] text-xs">bed</p>
                      </div>
                      <div className="text-center">
                        <Bath size={16} className="mx-auto mb-1 text-[#ADB5BD]" />
                        <p className="text-[#212529] font-semibold">
                          {property.bathrooms || 0}
                        </p>
                        <p className="text-[#ADB5BD] text-xs">bath</p>
                      </div>
                      <div className="text-center">
                        <Square size={16} className="mx-auto mb-1 text-[#ADB5BD]" />
                        <p className="text-[#212529] font-semibold">
                          {property.square_feet ? (property.square_feet / 1000).toFixed(1) : '—'}
                        </p>
                        <p className="text-[#ADB5BD] text-xs">K sqft</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-[#E9ECEF]">
                      <Link
                        href={`/property/${property.slug}`}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[#F8F9FA] text-[#212529] rounded border border-[#E9ECEF] hover:border-[#212529] transition-all text-sm font-medium"
                      >
                        <Eye size={14} /> View
                      </Link>
                      <Link
                        href={`/agent/edit-property/${property.id}`}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[#F8F9FA] text-[#212529] rounded border border-[#E9ECEF] hover:border-[#212529] transition-all text-sm font-medium"
                      >
                        <Edit2 size={14} /> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(property.id)}
                        disabled={deleting === property.id}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded border border-red-200 hover:border-red-400 disabled:opacity-50 transition-all text-sm font-medium"
                      >
                        {deleting === property.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
