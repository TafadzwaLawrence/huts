'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import { uploadFiles } from '@/lib/uploadthing'
import { compressImages } from '@/lib/image-compression'
import { toast } from 'sonner'
import { ICON_SIZES } from '@/lib/constants'
import {
  Home,
  DollarSign,
  Bed,
  Bath,
  Square,
  MapPin,
  Upload,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  AlertCircle,
  Image as ImageIcon,
  Building2,
  Tag,
  Calendar,
  Car,
  Loader2,
  GraduationCap,
  User,
} from 'lucide-react'

const LocationPicker = dynamic(() => import('@/components/property/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-[#F8F9FA] rounded-xl border-2 border-[#E9ECEF] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#ADB5BD]" />
    </div>
  ),
})

interface PropertyOwner {
  id: string
  full_name: string
  email: string
}

export default function AgentNewPropertyPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0) // 0 = select owner, 1-5 = form steps
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [owners, setOwners] = useState<PropertyOwner[]>([])
  const [selectedOwnerId, setSelectedOwnerId] = useState('')
  const [agentId, setAgentId] = useState<string | null>(null)

  const totalSteps = 6 // 0 + 5 form steps

  // Form data (same as landlord form)
  const [formData, setFormData] = useState({
    listingType: 'rent' as 'rent' | 'sale',
    title: '',
    description: '',
    propertyType: 'apartment' as 'apartment' | 'house' | 'studio' | 'room' | 'townhouse' | 'condo' | 'student',
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

  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  // Load agents and property owners on mount
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          toast.error('Please sign in')
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

        // Load all users (property owners)
        const { data: users } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .order('full_name')

        setOwners(users || [])
      } catch (error) {
        console.error('Init error:', error)
        toast.error('Failed to load form')
      }
    }

    init()
  }, [supabase, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 10) {
      toast.error('Maximum 10 images allowed')
      return
    }

    setImages(prev => [...prev, ...files])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const toggleStudentField = (field: 'furnished' | 'sharedRooms' | 'utilitiesIncluded') => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOwnerId || !agentId) {
      toast.error('Missing property owner or agent information')
      return
    }

    setLoading(true)

    try {
      // Validate required fields
      if (!formData.title || !formData.price || !formData.beds || !formData.baths || !formData.address || !formData.city) {
        toast.error('Please fill in all required fields')
        setLoading(false)
        return
      }

      if (!formData.lat || !formData.lng) {
        toast.error('Please select a location on the map')
        setLoading(false)
        return
      }

      if (images.length === 0) {
        toast.error('Please add at least one image')
        setLoading(false)
        return
      }

      // Convert price to cents
      const priceValue = Math.round(parseFloat(formData.price) * 100)
      const depositInCents = formData.deposit ? Math.round(parseFloat(formData.deposit) * 100) : null

      // Parse nearby universities
      const nearbyUniversities = formData.nearbyUniversities
        .split(',')
        .map(uni => uni.trim())
        .filter(uni => uni.length > 0)
        .map(name => ({ name }))

      // Generate slug
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
        '-' + Date.now().toString(36)

      // Create property with agent_id set
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
          user_id: selectedOwnerId,  // Property owner
          agent_id: agentId,          // Agent who listed it
          slug,
          title: formData.title,
          description: formData.description,
          property_type: formData.propertyType,
          listing_type: formData.listingType,
          status: 'active',
          verification_status: 'pending',
          price: formData.listingType === 'rent' ? priceValue : null,
          sale_price: formData.listingType === 'sale' ? priceValue : null,
          deposit: formData.listingType === 'rent' ? depositInCents : null,
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
          lease_term: formData.listingType === 'rent' ? formData.leaseTerm : null,
          year_built: formData.listingType === 'sale' && formData.yearBuilt ? parseInt(formData.yearBuilt) : null,
          lot_size_sqft: formData.listingType === 'sale' && formData.lotSize ? parseInt(formData.lotSize) : null,
          parking_spaces: formData.parkingSpaces ? parseInt(formData.parkingSpaces) : 0,
          garage_spaces: formData.garageSpaces ? parseInt(formData.garageSpaces) : 0,
          furnished: formData.propertyType === 'student' ? formData.furnished : null,
          shared_rooms: formData.propertyType === 'student' ? formData.sharedRooms : null,
          utilities_included: formData.propertyType === 'student' ? formData.utilitiesIncluded : null,
          nearby_universities: formData.propertyType === 'student' && nearbyUniversities.length > 0 ? nearbyUniversities : null,
          student_lease_terms: formData.propertyType === 'student' ? formData.studentLeaseTerms || null : null,
          lat: formData.lat,
          lng: formData.lng,
          published_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (propertyError) throw propertyError

      // Compress and upload images
      toast.loading('Compressing images...', { id: 'image-upload' })
      const compressedImages = await compressImages(images, { maxSizeMB: 1.5, maxWidthOrHeight: 1600 })

      toast.loading('Uploading images...', { id: 'image-upload' })
      try {
        const uploadedImages = await uploadFiles('propertyImages', {
          files: compressedImages,
        })

        if (uploadedImages.length > 0) {
          const imageInserts = uploadedImages.map((img, index) => ({
            property_id: property.id,
            url: img.url,
            is_primary: index === 0,
            order: index,
          }))

          const { error: imageError } = await supabase
            .from('property_images')
            .insert(imageInserts)

          if (imageError) {
            console.error('Error saving images:', imageError)
            toast.error('Property created but images failed to save', { id: 'image-upload' })
          } else {
            toast.success('Property created successfully!', { id: 'image-upload' })
          }
        }
      } catch (uploadError) {
        console.error('Upload error:', uploadError)
        toast.error('Property created but image upload failed', { id: 'image-upload' })
      }

      // Send verification email
      try {
        await fetch('/api/properties/verify/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ propertyId: property.id }),
        })
      } catch (verifyError) {
        console.error('Verification email error:', verifyError)
      }

      toast.success('Property submitted for verification!')
      router.push('/agent/my-properties')
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Failed to create property')
    } finally {
      setLoading(false)
    }
  }

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (stepNumber === 0) {
      if (!selectedOwnerId) newErrors.owner = 'Please select a property owner'
    }

    if (stepNumber === 1) {
      // No validation needed
    }

    if (stepNumber === 2) {
      if (!formData.title.trim()) newErrors.title = 'Title is required'
      if (!formData.propertyType) newErrors.propertyType = 'Property type is required'
    }

    if (stepNumber === 3) {
      if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required'
      if (!formData.beds) newErrors.beds = 'Bedrooms is required'
      if (!formData.baths) newErrors.baths = 'Bathrooms is required'
    }

    if (stepNumber === 4) {
      if (!formData.address.trim()) newErrors.address = 'Address is required'
      if (!formData.city.trim()) newErrors.city = 'City is required'
      if (!formData.lat || !formData.lng) newErrors.location = 'Please select location on map'
    }

    if (stepNumber === 5) {
      if (images.length === 0) newErrors.images = 'At least one image is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, totalSteps - 1))
    }
  }

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 0))
  }

  const progress = ((step) / (totalSteps - 1)) * 100

  const stepLabels = [
    { label: 'Owner', icon: User },
    { label: 'Type', icon: Tag },
    { label: 'Details', icon: Building2 },
    { label: 'Pricing', icon: DollarSign },
    { label: 'Location', icon: MapPin },
    { label: 'Photos', icon: ImageIcon },
  ]

  const AMENITIES = [
    'WiFi', 'Parking', 'Pool', 'Gym', 'Laundry', 'Pet-friendly',
    'Furnished', 'Air conditioning', 'Heating', 'Balcony',
    'Garden', 'Security', 'Elevator', 'Storage',
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-[#E9ECEF] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#212529]">
                List Property
              </h1>
              <p className="text-xs text-[#ADB5BD] mt-1 font-medium">
                Step {step + 1} of {totalSteps}
              </p>
            </div>
            <Link
              href="/agent/my-properties"
              className="flex items-center justify-center w-9 h-9 rounded-lg border border-[#E9ECEF] hover:border-[#212529] transition-all"
            >
              <X size={ICON_SIZES.lg} />
            </Link>
          </div>

          {/* Progress Bar */}
          <div className="relative h-1 bg-[#E9ECEF] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#212529] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          {/* Step 0: Select Owner */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#212529] mb-3">
                  Select Property Owner
                </label>
                <select
                  value={selectedOwnerId}
                  onChange={(e) => setSelectedOwnerId(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] bg-white focus:outline-none focus:ring-2 focus:ring-[#212529]"
                >
                  <option value="">Choose owner...</option>
                  {owners.map(owner => (
                    <option key={owner.id} value={owner.id}>
                      {owner.full_name} ({owner.email})
                    </option>
                  ))}
                </select>
                {errors.owner && (
                  <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                    <AlertCircle size={16} /> {errors.owner}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 1: Listing Type */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#212529] mb-4">
                  What are you listing?
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: 'rent', label: 'For Rent', icon: Home },
                    { value: 'sale', label: 'For Sale', icon: Building2 },
                  ].map(option => {
                    const Icon = option.icon
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, listingType: option.value as 'rent' | 'sale' }))}
                        className={`p-6 rounded-lg border-2 transition-all ${
                          formData.listingType === option.value
                            ? 'border-[#212529] bg-[#F8F9FA]'
                            : 'border-[#E9ECEF] bg-white hover:border-[#212529]'
                        }`}
                      >
                        <Icon className="w-8 h-8 mx-auto mb-2 text-[#212529]" />
                        <p className="font-semibold text-[#212529]">{option.label}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#212529] mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Cozy 2BR Apartment in Downtown"
                  className="w-full px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] bg-white focus:outline-none focus:ring-2 focus:ring-[#212529]"
                />
                {errors.title && <p className="text-sm text-red-600 mt-2">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#212529] mb-2">
                  Property Type *
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

              <div>
                <label className="block text-sm font-semibold text-[#212529] mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell potential renters/buyers about this property..."
                  rows={4}
                  className="w-full px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] bg-white focus:outline-none focus:ring-2 focus:ring-[#212529]"
                />
              </div>
            </div>
          )}

          {/* Step 3: Pricing & Details */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#212529] mb-2">
                    {formData.listingType === 'rent' ? 'Monthly Rent' : 'Sale Price'} *
                  </label>
                  <div className="flex items-center">
                    <span className="text-[#495057] mr-2">$</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0"
                      step="0.01"
                      className="flex-1 px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] bg-white focus:outline-none focus:ring-2 focus:ring-[#212529]"
                    />
                  </div>
                  {errors.price && <p className="text-sm text-red-600 mt-2">{errors.price}</p>}
                </div>

                {formData.listingType === 'rent' && (
                  <div>
                    <label className="block text-sm font-semibold text-[#212529] mb-2">
                      Security Deposit
                    </label>
                    <div className="flex items-center">
                      <span className="text-[#495057] mr-2">$</span>
                      <input
                        type="number"
                        name="deposit"
                        value={formData.deposit}
                        onChange={handleInputChange}
                        placeholder="0"
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
                    Bedrooms *
                  </label>
                  <input
                    type="number"
                    name="beds"
                    value={formData.beds}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] bg-white focus:outline-none focus:ring-2 focus:ring-[#212529]"
                  />
                  {errors.beds && <p className="text-sm text-red-600 mt-2">{errors.beds}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#212529] mb-2">
                    Bathrooms *
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
                  {errors.baths && <p className="text-sm text-red-600 mt-2">{errors.baths}</p>}
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
          )}

          {/* Step 4: Location */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#212529] mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main St"
                    className="w-full px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] bg-white focus:outline-none focus:ring-2 focus:ring-[#212529]"
                  />
                  {errors.address && <p className="text-sm text-red-600 mt-2">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#212529] mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                    className="w-full px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] bg-white focus:outline-none focus:ring-2 focus:ring-[#212529]"
                  />
                  {errors.city && <p className="text-sm text-red-600 mt-2">{errors.city}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  name="stateProvince"
                  value={formData.stateProvince}
                  onChange={handleInputChange}
                  placeholder="State/Province"
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
                <input
                  type="text"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleInputChange}
                  placeholder="Neighborhood"
                  className="px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] bg-white focus:outline-none focus:ring-2 focus:ring-[#212529]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#212529] mb-3">
                  Select Location on Map *
                </label>
                <LocationPicker
                  lat={formData.lat}
                  lng={formData.lng}
                  onLocationChange={(lat, lng) => setFormData(prev => ({ ...prev, lat, lng }))}
                />
                {errors.location && <p className="text-sm text-red-600 mt-2">{errors.location}</p>}
              </div>
            </div>
          )}

          {/* Step 5: Photos */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#212529] mb-3">
                  Upload Photos (max 10) *
                </label>
                <div className="border-2 border-dashed border-[#E9ECEF] rounded-lg p-8 text-center cursor-pointer hover:border-[#212529] transition-colors">
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
                    <p className="text-[#212529] font-semibold">Click to upload or drag and drop</p>
                    <p className="text-[#ADB5BD] text-sm">PNG, JPG (max 10 images)</p>
                  </label>
                </div>

                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img src={preview} alt={`Preview ${index}`} className="w-full h-32 object-cover rounded-lg" />
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
                )}
                {errors.images && <p className="text-sm text-red-600 mt-2">{errors.images}</p>}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-[#E9ECEF]">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 0}
              className="flex items-center gap-2 px-6 py-3 border border-[#E9ECEF] text-[#495057] rounded-lg hover:border-[#212529] hover:text-[#212529] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ArrowLeft size={16} /> Back
            </button>

            {step < totalSteps - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-[#212529] text-white rounded-lg hover:bg-[#000000] transition-all"
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-[#212529] text-white rounded-lg hover:bg-[#000000] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                {loading ? 'Creating...' : 'Create Property'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
