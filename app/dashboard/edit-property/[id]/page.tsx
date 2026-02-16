'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import { uploadFiles } from '@/lib/uploadthing'
import { compressImages } from '@/lib/image-compression'
import { toast } from 'sonner'
import {
  Home,
  DollarSign,
  Bed,
  Bath,
  Square,
  MapPin,
  Upload,
  ArrowRight,
  X,
  Check,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Trash2,
} from 'lucide-react'

// Dynamic import to avoid SSR issues with Leaflet
const LocationPicker = dynamic(() => import('@/components/property/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-[#F8F9FA] rounded-xl border-2 border-[#E9ECEF] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#ADB5BD]" />
    </div>
  ),
})

interface PropertyImage {
  id: string
  url: string
  is_primary: boolean
  order: number
}

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [propertyId, setPropertyId] = useState<string>('')

  // Form data
  const [formData, setFormData] = useState({
    listingType: 'rent' as 'rent' | 'sale',
    title: '',
    description: '',
    propertyType: 'apartment' as 'apartment' | 'house' | 'studio' | 'room' | 'townhouse' | 'condo',
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
    status: 'active' as 'draft' | 'active' | 'rented' | 'inactive',
  })

  const [existingImages, setExistingImages] = useState<PropertyImage[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

  // Load property data
  useEffect(() => {
    async function loadProperty() {
      const { id } = await params
      setPropertyId(id)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in')
        router.push('/auth/signup')
        return
      }

      const { data: property, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images(id, url, is_primary, order)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error || !property) {
        toast.error('Property not found or access denied')
        router.push('/dashboard/my-properties')
        return
      }

      // Populate form
      const listingType = property.listing_type || 'rent'
      const priceValue = listingType === 'sale' && property.sale_price 
        ? (property.sale_price / 100).toString()
        : property.price ? (property.price / 100).toString() : ''
      
      setFormData({
        listingType,
        title: property.title || '',
        description: property.description || '',
        propertyType: property.property_type || 'apartment',
        price: priceValue,
        deposit: property.deposit ? (property.deposit / 100).toString() : '',
        beds: property.beds?.toString() || '',
        baths: property.baths?.toString() || '',
        sqft: property.sqft?.toString() || '',
        address: property.address || '',
        city: property.city || '',
        stateProvince: property.state || '',
        zipCode: property.zip_code || '',
        neighborhood: property.neighborhood || '',
        lat: property.lat || 0,
        lng: property.lng || 0,
        amenities: property.amenities || [],
        availableFrom: property.available_from || '',
        leaseTerm: property.lease_term || '1-year',
        status: property.status || 'active',
      })

      setExistingImages(
        (property.property_images || []).sort((a: PropertyImage, b: PropertyImage) => a.order - b.order)
      )
      setLoading(false)
    }

    loadProperty()
  }, [params, supabase, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const totalImages = existingImages.length - imagesToDelete.length + newImages.length + files.length
    
    if (totalImages > 10) {
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

  const removeExistingImage = (imageId: string) => {
    setImagesToDelete(prev => [...prev, imageId])
  }

  const restoreImage = (imageId: string) => {
    setImagesToDelete(prev => prev.filter(id => id !== imageId))
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
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in')
        router.push('/auth/signup')
        return
      }

      // Validate required fields
      if (!formData.title || !formData.price || !formData.beds || !formData.baths || !formData.address || !formData.city) {
        toast.error('Please fill in all required fields')
        setSaving(false)
        return
      }

      // Convert price to cents
      const priceValue = Math.round(parseFloat(formData.price) * 100)
      const depositInCents = formData.deposit ? Math.round(parseFloat(formData.deposit) * 100) : null

      // Update property
      const { error: updateError } = await supabase
        .from('properties')
        .update({
          title: formData.title,
          description: formData.description,
          property_type: formData.propertyType,
          listing_type: formData.listingType,
          status: formData.status,
          // For rent: price is monthly rent. For sale: price is NULL, sale_price is the price
          price: formData.listingType === 'rent' ? priceValue : null,
          sale_price: formData.listingType === 'sale' ? priceValue : null,
          deposit: formData.listingType === 'rent' ? depositInCents : null,
          beds: parseInt(formData.beds),
          baths: parseFloat(formData.baths),
          sqft: formData.sqft ? parseInt(formData.sqft) : null,
          address: formData.address,
          city: formData.city,
          state: formData.stateProvince || null,
          zip_code: formData.zipCode || null,
          neighborhood: formData.neighborhood || null,
          amenities: formData.amenities,
          available_from: formData.availableFrom || null,
          lease_term: formData.listingType === 'rent' ? formData.leaseTerm : null,
          lat: formData.lat || null,
          lng: formData.lng || null,
        })
        .eq('id', propertyId)
        .eq('user_id', user.id)

      if (updateError) throw updateError

      // Delete marked images
      if (imagesToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('property_images')
          .delete()
          .in('id', imagesToDelete)

        if (deleteError) {
          console.error('Error deleting images:', deleteError)
        }
      }

      // Upload new images
      if (newImages.length > 0) {
        // Compress images before upload
        toast.loading('Compressing images...', { id: 'image-upload' })
        const compressedImages = await compressImages(newImages, { maxSizeMB: 1.5, maxWidthOrHeight: 1600 })
        
        toast.loading('Uploading new images...', { id: 'image-upload' })
        
        try {
          const uploadedImages = await uploadFiles('propertyImages', {
            files: compressedImages,
          })

          if (uploadedImages.length > 0) {
            const remainingImages = existingImages.filter(img => !imagesToDelete.includes(img.id))
            const startOrder = remainingImages.length

            const imageInserts = uploadedImages.map((img, index) => ({
              property_id: propertyId,
              url: img.url,
              is_primary: remainingImages.length === 0 && index === 0,
              order: startOrder + index,
            }))

            const { error: imageError } = await supabase
              .from('property_images')
              .insert(imageInserts)

            if (imageError) {
              console.error('Error saving image URLs:', imageError)
              toast.error('Property updated but some images failed to save', { id: 'image-upload' })
            } else {
              toast.success('Images uploaded!', { id: 'image-upload' })
            }
          }
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError)
          toast.error('Property updated but image upload failed', { id: 'image-upload' })
        }
      }
      
      toast.success('Property updated successfully!')
      router.push('/dashboard/my-properties')
    } catch (error: any) {
      console.error('Error updating property:', error)
      toast.error(error.message || 'Failed to update property')
    } finally {
      setSaving(false)
    }
  }

  const AMENITIES = [
    'WiFi', 'Parking', 'Pool', 'Gym', 'Laundry', 'Pet-friendly',
    'Furnished', 'Air conditioning', 'Heating', 'Balcony',
    'Garden', 'Security', 'Elevator', 'Storage',
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#212529] mb-4" />
          <p className="text-[#495057]">Loading property...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-12">
      <div className="container-main max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#495057] hover:text-[#212529] mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to My Properties
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-[#212529] mb-2">Edit Property</h1>
          <p className="text-[#495057]">Update your property listing details</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border-2 border-[#E9ECEF] rounded-xl p-8 md:p-10 shadow-lg">
          {/* Status */}
          <section className="mb-10 pb-10 border-b border-[#E9ECEF]">
            <h2 className="text-xl font-bold text-[#212529] mb-6">Listing Status</h2>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full max-w-xs px-4 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] focus:outline-none focus:border-[#212529] transition-colors"
            >
              <option value="active">Active - Visible to renters</option>
              <option value="draft">Draft - Hidden from search</option>
              <option value="rented">Rented - Marked as taken</option>
              <option value="inactive">Inactive - Temporarily hidden</option>
            </select>
          </section>

          {/* Listing Type Toggle */}
          <section className="mb-10 pb-10 border-b border-[#E9ECEF]">
            <h2 className="text-xl font-bold text-[#212529] mb-6">Listing Type</h2>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, listingType: 'rent' }))}
                className={`flex-1 py-4 px-6 rounded-lg font-medium text-lg transition-all ${
                  formData.listingType === 'rent'
                    ? 'bg-[#212529] text-white'
                    : 'border-2 border-[#E9ECEF] text-[#495057] hover:border-[#212529]'
                }`}
              >
                For Rent
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, listingType: 'sale' }))}
                className={`flex-1 py-4 px-6 rounded-lg font-medium text-lg transition-all ${
                  formData.listingType === 'sale'
                    ? 'bg-[#212529] text-white'
                    : 'border-2 border-[#E9ECEF] text-[#495057] hover:border-[#212529]'
                }`}
              >
                For Sale
              </button>
            </div>
          </section>

          {/* Basic Information */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#212529] mb-6 flex items-center gap-2">
              <Home size={24} />
              Basic Information
            </h2>

            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-[#212529] mb-2">
                  Property Title <span className="text-[#FF6B6B]">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] focus:outline-none focus:border-[#212529] transition-colors"
                  placeholder="e.g., Modern 2BR Apartment in Avondale"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-[#212529] mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] focus:outline-none focus:border-[#212529] transition-colors resize-none"
                  placeholder="Describe your property, its features, and what makes it special..."
                />
              </div>

              <div>
                <label htmlFor="propertyType" className="block text-sm font-medium text-[#212529] mb-2">
                  Property Type <span className="text-[#FF6B6B]">*</span>
                </label>
                <select
                  id="propertyType"
                  name="propertyType"
                  required
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] focus:outline-none focus:border-[#212529] transition-colors"
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="studio">Studio</option>
                  <option value="room">Room</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="condo">Condo</option>
                </select>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="mb-10 pb-10 border-b border-[#E9ECEF]">
            <h2 className="text-xl font-bold text-[#212529] mb-6 flex items-center gap-2">
              <DollarSign size={24} />
              Pricing
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-[#212529] mb-2">
                  {formData.listingType === 'rent' ? 'Monthly Rent ($)' : 'Sale Price ($)'} <span className="text-[#FF6B6B]">*</span>
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] focus:outline-none focus:border-[#212529] transition-colors"
                  placeholder={formData.listingType === 'rent' ? '1200' : '250000'}
                />
              </div>

              {formData.listingType === 'rent' && (
                <div>
                  <label htmlFor="deposit" className="block text-sm font-medium text-[#212529] mb-2">
                    Security Deposit ($)
                  </label>
                  <input
                    id="deposit"
                    name="deposit"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.deposit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] focus:outline-none focus:border-[#212529] transition-colors"
                    placeholder="1200"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Property Details */}
          <section className="mb-10 pb-10 border-b border-[#E9ECEF]">
            <h2 className="text-xl font-bold text-[#212529] mb-6">Property Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="beds" className="block text-sm font-medium text-[#212529] mb-2 flex items-center gap-2">
                  <Bed size={18} />
                  Bedrooms <span className="text-[#FF6B6B]">*</span>
                </label>
                <input
                  id="beds"
                  name="beds"
                  type="number"
                  required
                  min="0"
                  value={formData.beds}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] focus:outline-none focus:border-[#212529] transition-colors"
                  placeholder="2"
                />
              </div>

              <div>
                <label htmlFor="baths" className="block text-sm font-medium text-[#212529] mb-2 flex items-center gap-2">
                  <Bath size={18} />
                  Bathrooms <span className="text-[#FF6B6B]">*</span>
                </label>
                <input
                  id="baths"
                  name="baths"
                  type="number"
                  required
                  min="0"
                  step="0.5"
                  value={formData.baths}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] focus:outline-none focus:border-[#212529] transition-colors"
                  placeholder="1.5"
                />
              </div>

              <div>
                <label htmlFor="sqft" className="block text-sm font-medium text-[#212529] mb-2 flex items-center gap-2">
                  <Square size={18} />
                  Square Feet
                </label>
                <input
                  id="sqft"
                  name="sqft"
                  type="number"
                  min="0"
                  value={formData.sqft}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] focus:outline-none focus:border-[#212529] transition-colors"
                  placeholder="850"
                />
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="mb-10 pb-10 border-b border-[#E9ECEF]">
            <h2 className="text-xl font-bold text-[#212529] mb-6 flex items-center gap-2">
              <MapPin size={24} />
              Location
            </h2>

            <div className="space-y-6">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-[#212529] mb-2">
                  Street Address <span className="text-[#FF6B6B]">*</span>
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] focus:outline-none focus:border-[#212529] transition-colors"
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-[#212529] mb-2">
                    City <span className="text-[#FF6B6B]">*</span>
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] focus:outline-none focus:border-[#212529] transition-colors"
                    placeholder="Harare"
                  />
                </div>

                <div>
                  <label htmlFor="neighborhood" className="block text-sm font-medium text-[#212529] mb-2">
                    Neighborhood
                  </label>
                  <input
                    id="neighborhood"
                    name="neighborhood"
                    type="text"
                    value={formData.neighborhood}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] focus:outline-none focus:border-[#212529] transition-colors"
                    placeholder="Avondale"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="stateProvince" className="block text-sm font-medium text-[#212529] mb-2">
                    State/Province
                  </label>
                  <input
                    id="stateProvince"
                    name="stateProvince"
                    type="text"
                    value={formData.stateProvince}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] focus:outline-none focus:border-[#212529] transition-colors"
                    placeholder="Harare Province"
                  />
                </div>

                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-[#212529] mb-2">
                    Zip/Postal Code
                  </label>
                  <input
                    id="zipCode"
                    name="zipCode"
                    type="text"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] focus:outline-none focus:border-[#212529] transition-colors"
                    placeholder="00263"
                  />
                </div>
              </div>

              {/* Map Location Picker */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-[#212529] mb-2">
                  Pin Location on Map
                </label>
                <p className="text-sm text-[#495057] mb-4">
                  Search for an address or click on the map to update the property location
                </p>
                <LocationPicker
                  lat={formData.lat || undefined}
                  lng={formData.lng || undefined}
                  onLocationChange={(lat, lng, address) => {
                    setFormData(prev => ({
                      ...prev,
                      lat,
                      lng,
                    }))
                  }}
                />
              </div>
            </div>
          </section>

          {/* Amenities */}
          <section className="mb-10 pb-10 border-b border-[#E9ECEF]">
            <h2 className="text-xl font-bold text-[#212529] mb-6">Amenities</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {AMENITIES.map(amenity => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-md font-medium text-sm transition-all ${
                    formData.amenities.includes(amenity)
                      ? 'border-[#212529] bg-[#212529] text-white'
                      : 'border-[#E9ECEF] text-[#495057] hover:border-[#212529]'
                  }`}
                >
                  {formData.amenities.includes(amenity) && <Check size={16} />}
                  {amenity}
                </button>
              ))}
            </div>
          </section>

          {/* Images */}
          <section className="mb-10 pb-10 border-b border-[#E9ECEF]">
            <h2 className="text-xl font-bold text-[#212529] mb-6 flex items-center gap-2">
              <Upload size={24} />
              Photos <span className="text-sm font-normal text-[#495057]">(max 10)</span>
            </h2>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-[#212529] mb-3">Current Images</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {existingImages.map((image, index) => {
                    const isMarkedForDeletion = imagesToDelete.includes(image.id)
                    return (
                      <div key={image.id} className={`relative group ${isMarkedForDeletion ? 'opacity-50' : ''}`}>
                        <img
                          src={image.url}
                          alt={`Property image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-[#E9ECEF]"
                        />
                        {isMarkedForDeletion ? (
                          <button
                            type="button"
                            onClick={() => restoreImage(image.id)}
                            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg text-white font-medium text-sm"
                          >
                            Click to restore
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => removeExistingImage(image.id)}
                            className="absolute top-2 right-2 p-1.5 bg-[#FF6B6B] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#FF5252]"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        {index === 0 && !isMarkedForDeletion && (
                          <div className="absolute bottom-2 left-2 bg-[#212529] text-white text-xs px-2 py-1 rounded">
                            Primary
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Upload Area */}
            <label className="block w-full border-2 border-dashed border-[#E9ECEF] rounded-lg p-8 text-center hover:border-[#212529] transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              <Upload size={48} className="mx-auto text-[#ADB5BD] mb-4" />
              <p className="text-[#212529] font-medium mb-1">Click to upload more images</p>
              <p className="text-sm text-[#495057]">PNG, JPG, WEBP up to 10MB each</p>
            </label>

            {/* New Image Previews */}
            {newImagePreviews.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium text-[#212529] mb-3">New Images to Upload</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {newImagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`New image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-[#51CF66]"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-[#FF6B6B] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#FF5252]"
                      >
                        <X size={16} />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-[#51CF66] text-white text-xs px-2 py-1 rounded">
                        New
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Availability */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#212529] mb-6">Availability</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="availableFrom" className="block text-sm font-medium text-[#212529] mb-2">
                  Available From
                </label>
                <input
                  id="availableFrom"
                  name="availableFrom"
                  type="date"
                  value={formData.availableFrom}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] focus:outline-none focus:border-[#212529] transition-colors"
                />
              </div>

              <div>
                <label htmlFor="leaseTerm" className="block text-sm font-medium text-[#212529] mb-2">
                  Lease Term
                </label>
                <select
                  id="leaseTerm"
                  name="leaseTerm"
                  value={formData.leaseTerm}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] focus:outline-none focus:border-[#212529] transition-colors"
                >
                  <option value="month-to-month">Month-to-month</option>
                  <option value="6-months">6 months</option>
                  <option value="1-year">1 year</option>
                  <option value="2-years">2 years</option>
                </select>
              </div>
            </div>
          </section>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-4 border-2 border-[#E9ECEF] text-[#212529] rounded-lg font-medium hover:border-[#212529] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-[#212529] text-white px-6 py-4 rounded-lg font-medium hover:bg-black hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Saving...
                </>
              ) : (
                <>
                  Save Changes
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
