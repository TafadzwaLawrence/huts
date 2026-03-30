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
  Upload,
  Check,
  Home,
  Tag,
} from 'lucide-react'

import type { ParsedAddress } from '@/components/property/LocationPicker'

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
  const [isDragging, setIsDragging] = useState(false)
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([])

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
    const img = images[index]
    if (img.id) setDeletedImageIds(prev => [...prev, img.id!])
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const makePrimary = (index: number) => {
    setImages(prev => prev.map((img, i) => ({ ...img, isPrimary: i === index })))
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length + images.length + newImages.length > 10) {
      toast.error('Maximum 10 images allowed')
      return
    }
    setNewImages(prev => [...prev, ...files])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => setNewImagePreviews(prev => [...prev, reader.result as string])
      reader.readAsDataURL(file)
    })
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
      // Validate required fields with clear feedback
      const requiredFields: string[] = []
      if (!formData.title.trim()) requiredFields.push('title')
      if (!formData.price.trim()) requiredFields.push('price')
      if (!formData.beds.trim()) requiredFields.push('bedrooms')
      if (!formData.baths.trim()) requiredFields.push('bathrooms')
      if (!formData.address.trim()) requiredFields.push('address')
      if (!formData.city.trim()) requiredFields.push('city')

      if (requiredFields.length > 0) {
        toast.error(`Please fill in the following required field(s): ${requiredFields.join(', ')}`)
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
      if (deletedImageIds.length > 0) {
        await supabase
          .from('property_images')
          .delete()
          .in('id', deletedImageIds)
      }

      // Update cover/primary image
      const primaryImg = images.find(img => img.isPrimary) ?? images[0]
      if (primaryImg?.id) {
        await supabase.from('property_images').update({ is_primary: false }).eq('property_id', property.id)
        await supabase.from('property_images').update({ is_primary: true }).eq('id', primaryImg.id)
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
    'Borehole', 'City Water', 'Solar Power', 'Generator/Inverter',
    'DSTV Connection', 'Fibre Internet', 'Electric Fence',
    'Alarm System', "Servant's Quarters", 'Carport',
    'Wired Perimeter Fence', 'Prepaid Electricity', 'Swimming Pool',
    'Garden', 'Parking', 'Furnished', 'Air Conditioning',
    'Pet-friendly', 'Laundry', 'Security Guard',
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
        {/* Property Identity Banner */}
        <div className="flex items-center gap-3 mb-8 p-4 bg-[#F8F9FA] rounded-xl border border-[#E9ECEF]">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#212529] text-white flex items-center justify-center">
            {property.listing_type === 'rent' ? <Home size={18} /> : <Building2 size={18} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-[#212529] truncate">{property.title}</p>
            <p className="text-xs text-[#ADB5BD]">
              {property.listing_type === 'rent' ? 'Rental Property' : 'Sale Property'} &middot; {property.city}
            </p>
          </div>
          <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
            property.listing_type === 'rent' ? 'bg-[#212529] text-white' : 'bg-black text-white'
          }`}>
            {property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="border border-[#E9ECEF] rounded-xl p-6">
            <h2 className="text-base font-bold text-[#212529] mb-5 flex items-center gap-2">
              <Tag size={16} /> Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#212529] mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  maxLength={80}
                  className="w-full px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] bg-white focus:outline-none focus:ring-2 focus:ring-[#212529]"
                />
                <div className="flex justify-end mt-1">
                  <span className={`text-xs ${formData.title.length > 70 ? 'text-red-500 font-medium' : 'text-[#ADB5BD]'}`}>
                    {formData.title.length}/80
                  </span>
                </div>
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
                  maxLength={2000}
                  className="w-full px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] bg-white focus:outline-none focus:ring-2 focus:ring-[#212529]"
                />
                <div className="flex justify-end mt-1">
                  <span className={`text-xs ${formData.description.length > 1800 ? 'text-red-500 font-medium' : 'text-[#ADB5BD]'}`}>
                    {formData.description.length}/2000
                  </span>
                </div>
              </div>

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

          {/* Pricing & Details */}
          <div className="border border-[#E9ECEF] rounded-xl p-6">
            <h2 className="text-base font-bold text-[#212529] mb-5 flex items-center gap-2">
              <span className="text-base">$</span> Pricing & Details
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#212529] mb-2">
                    {property.listing_type === 'rent' ? 'Monthly Rent' : 'Sale Price'} *
                  </label>
                  <div className="flex items-center border border-[#E9ECEF] rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#212529]">
                    <span className="px-3 py-3 text-[#495057] bg-[#F8F9FA] border-r border-[#E9ECEF] text-sm font-medium">USD</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      className="flex-1 px-4 py-3 text-[#212529] bg-white focus:outline-none"
                    />
                  </div>
                  {formData.price && parseFloat(formData.price) > 0 && (
                    <p className="text-sm text-[#495057] mt-1.5 font-medium">
                      USD {parseFloat(formData.price).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                      {property.listing_type === 'rent' ? ' / month' : ' sale price'}
                    </p>
                  )}
                </div>
                {property.listing_type === 'rent' && (
                  <div>
                    <label className="block text-sm font-semibold text-[#212529] mb-2">
                      Security Deposit
                    </label>
                    <div className="flex items-center border border-[#E9ECEF] rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#212529]">
                      <span className="px-3 py-3 text-[#495057] bg-[#F8F9FA] border-r border-[#E9ECEF] text-sm font-medium">USD</span>
                      <input
                        type="number"
                        name="deposit"
                        value={formData.deposit}
                        onChange={handleInputChange}
                        step="0.01"
                        className="flex-1 px-4 py-3 text-[#212529] bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#212529] mb-2">
                    Bedrooms *
                  </label>
                  <div className="flex items-center border border-[#E9ECEF] rounded-lg overflow-hidden">
                    <button type="button"
                      onClick={() => setFormData(prev => ({ ...prev, beds: String(Math.max(0, parseInt(prev.beds || '0') - 1)) }))}
                      className="px-3 py-3 text-[#212529] hover:bg-[#F8F9FA] font-bold border-r border-[#E9ECEF]">−</button>
                    <span className="flex-1 text-center py-3 font-medium text-[#212529] text-sm">{formData.beds || '0'}</span>
                    <button type="button"
                      onClick={() => setFormData(prev => ({ ...prev, beds: String(parseInt(prev.beds || '0') + 1) }))}
                      className="px-3 py-3 text-[#212529] hover:bg-[#F8F9FA] font-bold border-l border-[#E9ECEF]">+</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#212529] mb-2">
                    Bathrooms *
                  </label>
                  <div className="flex items-center border border-[#E9ECEF] rounded-lg overflow-hidden">
                    <button type="button"
                      onClick={() => setFormData(prev => ({ ...prev, baths: String(Math.max(0, parseFloat(prev.baths || '0') - 0.5)) }))}
                      className="px-3 py-3 text-[#212529] hover:bg-[#F8F9FA] font-bold border-r border-[#E9ECEF]">−</button>
                    <span className="flex-1 text-center py-3 font-medium text-[#212529] text-sm">{formData.baths || '0'}</span>
                    <button type="button"
                      onClick={() => setFormData(prev => ({ ...prev, baths: String(parseFloat(prev.baths || '0') + 0.5) }))}
                      className="px-3 py-3 text-[#212529] hover:bg-[#F8F9FA] font-bold border-l border-[#E9ECEF]">+</button>
                  </div>
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
          <div className="border border-[#E9ECEF] rounded-xl p-6">
            <h2 className="text-base font-bold text-[#212529] mb-5 flex items-center gap-2">
              <MapPin size={16} /> Location
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#212529] mb-2">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main St"
                    className="w-full px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] bg-white focus:outline-none focus:ring-2 focus:ring-[#212529]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#212529] mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Harare"
                    list="zw-cities-edit"
                    className="w-full px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] bg-white focus:outline-none focus:ring-2 focus:ring-[#212529]"
                  />
                  <datalist id="zw-cities-edit">
                    <option value="Harare" /><option value="Bulawayo" /><option value="Chitungwiza" />
                    <option value="Mutare" /><option value="Gweru" /><option value="Kwekwe" />
                    <option value="Kadoma" /><option value="Masvingo" /><option value="Chinhoyi" />
                    <option value="Norton" /><option value="Marondera" /><option value="Ruwa" />
                    <option value="Chegutu" /><option value="Zvishavane" /><option value="Bindura" />
                    <option value="Beitbridge" /><option value="Redcliff" /><option value="Victoria Falls" />
                    <option value="Hwange" /><option value="Kariba" />
                  </datalist>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleInputChange}
                  placeholder="Neighbourhood"
                  className="px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] bg-white focus:outline-none focus:ring-2 focus:ring-[#212529]"
                />
                <input
                  type="text"
                  name="stateProvince"
                  value={formData.stateProvince}
                  onChange={handleInputChange}
                  placeholder="Province"
                  className="px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] bg-white focus:outline-none focus:ring-2 focus:ring-[#212529]"
                />
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  placeholder="ZIP Code"
                  className="px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] bg-white focus:outline-none focus:ring-2 focus:ring-[#212529]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#212529] mb-3">Pin on Map</label>
                <LocationPicker
                  lat={formData.lat}
                  lng={formData.lng}
                  onLocationChange={(lat, lng, _address, parsed) => {
                    setFormData(prev => ({
                      ...prev,
                      lat,
                      lng,
                      address: prev.address || (parsed?.road ?? ''),
                      city: prev.city || parsed?.city || '',
                      neighborhood: prev.neighborhood || parsed?.suburb || '',
                      stateProvince: prev.stateProvince || parsed?.state || '',
                      zipCode: prev.zipCode || parsed?.postcode || '',
                    }))
                  }}
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="border border-[#E9ECEF] rounded-xl p-6">
            <h2 className="text-base font-bold text-[#212529] mb-5 flex items-center gap-2">
              <Check size={16} /> Amenities
            </h2>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map(amenity => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                    formData.amenities.includes(amenity)
                      ? 'border-[#212529] bg-[#212529] text-white'
                      : 'border-[#E9ECEF] bg-white text-[#495057] hover:border-[#212529]'
                  }`}
                >
                  {formData.amenities.includes(amenity) && <Check size={12} className="inline mr-1 -mt-0.5" />}
                  {amenity}
                </button>
              ))}
            </div>
            {formData.amenities.length > 0 && (
              <p className="text-xs text-[#ADB5BD] mt-3">{formData.amenities.length} amenit{formData.amenities.length === 1 ? 'y' : 'ies'} selected</p>
            )}
          </div>

          {/* Images */}
          <div className="border border-[#E9ECEF] rounded-xl p-6">
            <h2 className="text-base font-bold text-[#212529] mb-5 flex items-center gap-2">
              <ImageIcon size={16} /> Photos
              <span className="ml-auto text-xs font-normal text-[#ADB5BD]">{images.length + newImages.length}/10</span>
            </h2>

            {/* Existing Images */}
            {images.length > 0 && (
              <div className="mb-6">
                <p className="text-xs text-[#ADB5BD] mb-3 font-medium uppercase tracking-wide">Current photos — click &quot;Set cover&quot; to change the primary photo</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img src={img.url} alt={`Current ${index}`} className="w-full h-32 object-cover rounded-lg" />
                      {img.isPrimary && (
                        <div className="absolute top-1 left-1 bg-[#212529] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                          Cover
                        </div>
                      )}
                      {!img.isPrimary && (
                        <button
                          type="button"
                          onClick={() => makePrimary(index)}
                          className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 bg-black/75 text-white text-[10px] px-1.5 py-0.5 rounded transition-opacity"
                        >
                          Set cover
                        </button>
                      )}
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
            {images.length + newImages.length < 10 && (
              <div>
                <div
                  onDrop={handleDrop}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors mb-4 ${
                    isDragging ? 'border-[#212529] bg-[#F8F9FA]' : 'border-[#E9ECEF] hover:border-[#212529]'
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-input"
                  />
                  <label htmlFor="image-input" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-[#ADB5BD]" />
                    <p className="text-[#212529] font-semibold">
                      {isDragging ? 'Drop images here' : 'Click to upload or drag & drop'}
                    </p>
                    <p className="text-[#ADB5BD] text-sm">Up to {10 - images.length - newImages.length} more image{10 - images.length - newImages.length !== 1 ? 's' : ''}</p>
                  </label>
                </div>

                {newImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {newImagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img src={preview} alt={`New ${index}`} className="w-full h-32 object-cover rounded-lg" />
                        <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                          New
                        </div>
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
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-6 border-t border-[#E9ECEF] mt-2">
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
