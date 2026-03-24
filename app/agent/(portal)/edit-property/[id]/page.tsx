'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import { uploadFiles } from '@/lib/uploadthing'
import { compressImages } from '@/lib/image-compression'
import { toast } from 'sonner'
import { ICON_SIZES } from '@/lib/constants'
import {
  ArrowLeft,
  Save,
  Loader2,
  X,
  AlertCircle,
  Image as ImageIcon,
  MapPin,
  Building2,
} from 'lucide-react'

const LocationPicker = dynamic(() => import('@/components/property/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-[#F8F9FA] rounded-xl border-2 border-[#E9ECEF] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#ADB5BD]" />
    </div>
  ),
})

interface Property {
  id: string
  title: string
  description: string
  property_type: string
  listing_type: 'rent' | 'sale'
  price: number | null
  sale_price: number | null
  deposit: number | null
  bedrooms: number
  bathrooms: number
  square_feet: number | null
  address: string
  city: string
  state: string | null
  zip_code: string | null
  area: string | null
  amenities: string[]
  available_from: string | null
  lease_term: string | null
  year_built: number | null
  lot_size_sqft: number | null
  parking_spaces: number
  garage_spaces: number
  furnished: boolean
  shared_rooms: boolean
  utilities_included: boolean
  nearby_universities: any
  student_lease_terms: string | null
  lat: number
  lng: number
  property_images: Array<{ id: string; url: string; is_primary: boolean; order: number }>
}

export default function AgentEditPropertyPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string
  const supabase = createClient()

  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: 'apartment' as string,
    price: '',
    deposit: '',
    beds: '',
    baths: '',
    sqft: '',
    address: '',
    city: '',
    stateProvince: '',
    zipCode: '',
    neighborhood: '',
    lat: 0,
    lng: 0,
    amenities: [] as string[],
    availableFrom: '',
    leaseTerm: '1-year',
    yearBuilt: '',
    lotSize: '',
    parkingSpaces: '',
    garageSpaces: '',
    furnished: false,
    sharedRooms: false,
    utilitiesIncluded: false,
    nearbyUniversities: '',
    studentLeaseTerms: '',
  })

  const [images, setImages] = useState<Array<{ id?: string; url: string; isNew?: boolean; isPrimary: boolean }>>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/signup')
          return
        }

        const { data: agent } = await supabase
          .from('agents')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (!agent) {
          toast.error('Agent profile not found')
          router.push('/agent/profile')
          return
        }

        const { data: prop, error } = await supabase
          .from('properties')
          .select(`
            *,
            property_images(id, url, is_primary, order)
          `)
          .eq('id', propertyId)
          .eq('agent_id', agent.id)
          .single()

        if (error) throw error
        if (!prop) {
          toast.error('Property not found or you do not have access')
          router.push('/agent/my-properties')
          return
        }

        setProperty(prop)

        // Populate form
        setFormData({
          title: prop.title || '',
          description: prop.description || '',
          propertyType: prop.property_type || 'apartment',
          price: prop.listing_type === 'rent' && prop.price ? (prop.price / 100).toString() : '',
          deposit: prop.listing_type === 'rent' && prop.deposit ? (prop.deposit / 100).toString() : '',
          beds: prop.bedrooms?.toString() || '',
          baths: prop.bathrooms?.toString() || '',
          sqft: prop.square_feet?.toString() || '',
          address: prop.address || '',
          city: prop.city || '',
          stateProvince: prop.state || '',
          zipCode: prop.zip_code || '',
          neighborhood: prop.area || '',
          lat: prop.lat || 0,
          lng: prop.lng || 0,
          amenities: prop.amenities || [],
          availableFrom: prop.available_from?.split('T')[0] || '',
          leaseTerm: prop.lease_term || '1-year',
          yearBuilt: prop.year_built?.toString() || '',
          lotSize: prop.lot_size_sqft?.toString() || '',
          parkingSpaces: prop.parking_spaces?.toString() || '',
          garageSpaces: prop.garage_spaces?.toString() || '',
          furnished: prop.furnished || false,
          sharedRooms: prop.shared_rooms || false,
          utilitiesIncluded: prop.utilities_included || false,
          nearbyUniversities: prop.nearby_universities?.map((u: any) => u.name).join(', ') || '',
          studentLeaseTerms: prop.student_lease_terms || '',
        })

        // Format images
        const sortedImages = (prop.property_images || []).sort((a: any, b: any) => a.order - b.order)
        setImages(
          sortedImages.map((img: any) => ({
            id: img.id,
            url: img.url,
            isPrimary: img.is_primary,
          }))
        )
      } catch (error) {
        console.error('Error loading property:', error)
        toast.error('Failed to load property')
      } finally {
        setLoading(false)
      }
    }

    loadProperty()
  }, [propertyId, supabase, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length + newImages.length > 10) {
      toast.error('Maximum 10 images allowed')
      return
    }

    setNewImages(prev => [...prev, ...files])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!property) return

    setSaving(true)

    try {
      // Validate required fields
      if (!formData.title || !formData.price || !formData.beds || !formData.baths || !formData.address || !formData.city) {
        toast.error('Please fill in all required fields')
        setSaving(false)
        return
      }

      const priceValue = Math.round(parseFloat(formData.price) * 100)
      const depositInCents = formData.deposit ? Math.round(parseFloat(formData.deposit) * 100) : null

      // Update property
      const { error: updateError } = await supabase
        .from('properties')
        .update({
          title: formData.title,
          description: formData.description,
          property_type: formData.propertyType,
          price: property.listing_type === 'rent' ? priceValue : null,
          sale_price: property.listing_type === 'sale' ? priceValue : null,
          deposit: property.listing_type === 'rent' ? depositInCents : null,
          bedrooms: parseInt(formData.beds),
          bathrooms: parseFloat(formData.baths),
          square_feet: formData.sqft ? parseInt(formData.sqft) : null,
          address: formData.address,
          city: formData.city,
          state: formData.stateProvince || null,
          zip_code: formData.zipCode || null,
          area: formData.neighborhood || null,
          amenities: formData.amenities,
          available_from: formData.availableFrom || null,
          lease_term: property.listing_type === 'rent' ? formData.leaseTerm : null,
          lat: formData.lat,
          lng: formData.lng,
        })
        .eq('id', property.id)

      if (updateError) throw updateError

      // Upload new images if any
      if (newImages.length > 0) {
        try {
          const compressedImages = await compressImages(newImages, { maxSizeMB: 1.5, maxWidthOrHeight: 1600 })
          const uploadedImages = await uploadFiles('propertyImages', { files: compressedImages })

          if (uploadedImages.length > 0) {
            const newImageInserts = uploadedImages.map((img, index) => ({
              property_id: property.id,
              url: img.url,
              is_primary: false,
              order: images.length + index,
            }))

            const { error: imageError } = await supabase
              .from('property_images')
              .insert(newImageInserts)

            if (imageError) throw imageError
          }
        } catch (uploadError) {
          console.error('Image upload error:', uploadError)
          toast.warning('Property updated but image upload failed')
        }
      }

      // Remove deleted images
      const imagesToDelete = images
        .filter(img => img.id && images.every(i => i.url !== img.url || i.id === img.id))
        .map(img => img.id)
        .filter(Boolean) as string[]

      if (imagesToDelete.length > 0) {
        await supabase
          .from('property_images')
          .delete()
          .in('id', imagesToDelete)
      }

      toast.success('Property updated successfully!')
      router.push(`/property/${property.id}`)
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Failed to update property')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#212529]" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-500 mr-2" />
        <p className="text-[#212529]">Property not found</p>
      </div>
    )
  }

  const AMENITIES = [
    'WiFi', 'Parking', 'Pool', 'Gym', 'Laundry', 'Pet-friendly',
    'Furnished', 'Air conditioning', 'Heating', 'Balcony',
    'Garden', 'Security', 'Elevator', 'Storage',
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-[#E9ECEF] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/agent/my-properties"
              className="flex items-center gap-2 text-[#495057] hover:text-[#212529] transition-all"
            >
              <ArrowLeft size={ICON_SIZES.md} />
              <span>Back</span>
            </Link>
            <h1 className="text-2xl font-bold text-[#212529]">Edit Property</h1>
            <div className="w-16" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div>
            <h2 className="text-lg font-semibold text-[#212529] mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#212529] mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] bg-white focus:outline-none focus:ring-2 focus:ring-[#212529]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#212529] mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] bg-white focus:outline-none focus:ring-2 focus:ring-[#212529]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#212529] mb-2">
                    Property Type
                  </label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] bg-white focus:outline-none focus:ring-2 focus:ring-[#212529]"
                  >
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="studio">Studio</option>
                    <option value="room">Room</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="condo">Condo</option>
                    <option value="student">Student Housing</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Details */}
          <div>
            <h2 className="text-lg font-semibold text-[#212529] mb-4">Pricing & Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#212529] mb-2">
                    Price
                  </label>
                  <div className="flex items-center">
                    <span className="text-[#495057] mr-2">$</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      className="flex-1 px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] bg-white focus:outline-none focus:ring-2 focus:ring-[#212529]"
                    />
                  </div>
                </div>
                {property.listing_type === 'rent' && (
                  <div>
                    <label className="block text-sm font-semibold text-[#212529] mb-2">
                      Deposit
                    </label>
                    <div className="flex items-center">
                      <span className="text-[#495057] mr-2">$</span>
                      <input
                        type="number"
                        name="deposit"
                        value={formData.deposit}
                        onChange={handleInputChange}
                        step="0.01"
                        className="flex-1 px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] bg-white focus:outline-none focus:ring-2 focus:ring-[#212529]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#212529] mb-2">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    name="beds"
                    value={formData.beds}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] bg-white focus:outline-none focus:ring-2 focus:ring-[#212529]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#212529] mb-2">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    name="baths"
                    value={formData.baths}
                    onChange={handleInputChange}
                    min="0"
                    step="0.5"
                    className="w-full px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] bg-white focus:outline-none focus:ring-2 focus:ring-[#212529]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#212529] mb-2">
                    Sq Ft
                  </label>
                  <input
                    type="number"
                    name="sqft"
                    value={formData.sqft}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] bg-white focus:outline-none focus:ring-2 focus:ring-[#212529]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h2 className="text-lg font-semibold text-[#212529] mb-4">Location</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Address"
                  className="px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] bg-white focus:outline-none focus:ring-2 focus:ring-[#212529]"
                />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className="px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] bg-white focus:outline-none focus:ring-2 focus:ring-[#212529]"
                />
              </div>

              <LocationPicker
                lat={formData.lat}
                lng={formData.lng}
                onChange={(lat, lng) => setFormData(prev => ({ ...prev, lat, lng }))}
              />
            </div>
          </div>

          {/* Images */}
          <div>
            <h2 className="text-lg font-semibold text-[#212529] mb-4">Images</h2>

            {/* Existing Images */}
            {images.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#212529] mb-3">Current Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative">
                      <img src={img.url} alt={`Current ${index}`} className="w-full h-32 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            <div>
              <h3 className="text-sm font-semibold text-[#212529] mb-3">Add More Images</h3>
              <div className="border-2 border-dashed border-[#E9ECEF] rounded-lg p-8 text-center cursor-pointer hover:border-[#212529] transition-colors mb-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-input"
                />
                <label htmlFor="image-input" className="cursor-pointer">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-[#ADB5BD]" />
                  <p className="text-[#212529] font-semibold">Click to upload</p>
                  <p className="text-[#ADB5BD] text-sm">max {10 - images.length} more images</p>
                </label>
              </div>

              {newImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {newImagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img src={preview} alt={`New ${index}`} className="w-full h-32 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-6 border-t border-[#E9ECEF]">
            <Link
              href="/agent/my-properties"
              className="flex-1 px-6 py-3 border border-[#E9ECEF] text-[#212529] rounded-lg hover:border-[#212529] transition-all text-center font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#212529] text-white rounded-lg hover:bg-[#000000] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
