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
  Image as ImageIcon,
  Building2,
  Tag,
  Loader2,
  GraduationCap,
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

interface PropertyOwner {
  id: string
  full_name: string
  email: string
}

export default function AgentNewPropertyPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // Start from step 1 (no owner selection - agent is always the owner)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedOwnerId, setSelectedOwnerId] = useState('')
  const [agentId, setAgentId] = useState<string | null>(null)

  const totalSteps = 5 // Removed owner selection step

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
  const [isDragging, setIsDragging] = useState(false)
  const [coverImageIndex, setCoverImageIndex] = useState(0)
  const [ownerSearch, setOwnerSearch] = useState('')

  // Load agent on mount and auto-set agent as property owner
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
        // Agent is always the owner of properties they list
        setSelectedOwnerId(user.id)
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
    if (coverImageIndex >= index && coverImageIndex > 0) setCoverImageIndex(prev => prev - 1)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
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

  const makeCover = (index: number) => {
    setImages(prev => {
      const next = [...prev]
      const [item] = next.splice(index, 1)
      next.unshift(item)
      return next
    })
    setImagePreviews(prev => {
      const next = [...prev]
      const [item] = next.splice(index, 1)
      next.unshift(item)
      return next
    })
    setCoverImageIndex(0)
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

    if (stepNumber === 1) {
      // No validation needed for listing type selection
    }

    if (stepNumber === 2) {
      if (!formData.title.trim()) newErrors.title = 'Title is required'
      if (!formData.propertyType) newErrors.propertyType = 'Property type is required'
    }

    if (stepNumber === 2) {
      if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required'
      if (!formData.beds) newErrors.beds = 'Bedrooms is required'
      if (!formData.baths) newErrors.baths = 'Bathrooms is required'
    }

    if (stepNumber === 3) {
      if (!formData.address.trim()) newErrors.address = 'Address is required'
      if (!formData.city.trim()) newErrors.city = 'City is required'
      if (!formData.lat || !formData.lng) newErrors.location = 'Please select location on map'
    }

    if (stepNumber === 4) {
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
    setStep(prev => Math.max(prev - 1, 1)) // Don't go below step 1 (skip step 0)
  }

  const progress = ((step - 1) / (totalSteps - 1)) * 100

  const stepLabels = [
    { label: 'Type', icon: Tag },
    { label: 'Details', icon: Building2 },
    { label: 'Pricing', icon: DollarSign },
    { label: 'Location', icon: MapPin },
    { label: 'Photos', icon: ImageIcon },
  ]

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#212529]">
                List Property
              </h1>
              <p className="text-xs text-[#ADB5BD] mt-1 font-medium">
                Step {step} of 5
              </p>
            </div>
            <Link
              href="/agent/my-properties"
              className="flex items-center justify-center w-9 h-9 rounded-lg border border-[#E9ECEF] hover:border-[#212529] transition-all"
            >
              <X size={ICON_SIZES.lg} />
            </Link>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between relative mt-2 pb-4">
            <div className="absolute left-4 right-4 top-4 h-1 bg-[#E9ECEF] rounded-full -z-0">
              <div
                className="h-full bg-[#212529] transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            {stepLabels.map((s, i) => {
              const Icon = s.icon
              // i is 0-4 for button indices, but step is 1-5, so adjust
              const stepNumber = i + 1
              const isCompleted = stepNumber < step
              const isCurrent = stepNumber === step
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => { if (isCompleted) setStep(stepNumber) }}
                  className={`relative z-10 flex flex-col items-center gap-1 ${isCompleted ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted ? 'bg-[#212529] border-[#212529] text-white' :
                    isCurrent ? 'bg-white border-[#212529] text-[#212529]' :
                    'bg-white border-[#E9ECEF] text-[#ADB5BD]'
                  }`}>
                    {isCompleted ? <Check size={14} /> : <Icon size={14} />}
                  </div>
                  <span className={`text-[10px] font-medium hidden sm:block ${
                    isCurrent ? 'text-[#212529]' : isCompleted ? 'text-[#495057]' : 'text-[#ADB5BD]'
                  }`}>
                    {s.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Listing Type */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#212529] mb-1">What are you listing?</h2>
                <p className="text-sm text-[#ADB5BD] mb-6">Select the listing type for this property</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      value: 'rent',
                      label: 'For Rent',
                      icon: Home,
                      features: ['Monthly rental income', 'Long & short-term leases', 'Security deposit', 'Tenant screening'],
                    },
                    {
                      value: 'sale',
                      label: 'For Sale',
                      icon: Building2,
                      features: ['One-time sale price', 'Mortgage calculator', 'Year built & lot size', 'Garage spaces'],
                    },
                  ].map(option => {
                    const Icon = option.icon
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, listingType: option.value as 'rent' | 'sale' }))}
                        className={`p-6 rounded-xl border-2 text-left transition-all ${
                          formData.listingType === option.value
                            ? 'border-[#212529] bg-[#F8F9FA]'
                            : 'border-[#E9ECEF] bg-white hover:border-[#212529]'
                        }`}
                      >
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                          formData.listingType === option.value ? 'bg-[#212529] text-white' : 'bg-[#F8F9FA] text-[#212529]'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <p className="font-bold text-[#212529] text-lg mb-3">{option.label}</p>
                        <ul className="space-y-1.5">
                          {option.features.map(f => (
                            <li key={f} className="flex items-center gap-2 text-sm text-[#495057]">
                              <Check size={14} className="text-[#212529] flex-shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Details (was step 3) */}
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
                  maxLength={80}
                  placeholder="Cozy 2BR Apartment in Downtown"
                  className="w-full px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] bg-white focus:outline-none focus:ring-2 focus:ring-[#212529]"
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.title ? <p className="text-sm text-red-600">{errors.title}</p> : <span />}
                  <span className={`text-xs ${formData.title.length > 70 ? 'text-red-500 font-medium' : 'text-[#ADB5BD]'}`}>
                    {formData.title.length}/80
                  </span>
                </div>
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
                  maxLength={2000}
                  className="w-full px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] bg-white focus:outline-none focus:ring-2 focus:ring-[#212529]"
                />
                <div className="flex justify-end mt-1">
                  <span className={`text-xs ${formData.description.length > 1800 ? 'text-red-500 font-medium' : 'text-[#ADB5BD]'}`}>
                    {formData.description.length}/2000
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Pricing & Details (was step 4) */}
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
                  {formData.price && parseFloat(formData.price) > 0 && (
                    <p className="text-sm text-[#495057] mt-2 font-medium">
                      USD {parseFloat(formData.price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      {formData.listingType === 'rent' ? ' / month' : ' sale price'}
                    </p>
                  )}
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
                  <div className="flex items-center border border-[#E9ECEF] rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, beds: String(Math.max(0, parseInt(prev.beds || '0') - 1)) }))}
                      className="px-4 py-3 text-[#212529] hover:bg-[#F8F9FA] font-bold text-lg border-r border-[#E9ECEF]"
                    >−</button>
                    <span className="flex-1 text-center py-3 font-medium text-[#212529]">{formData.beds || '0'}</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, beds: String(parseInt(prev.beds || '0') + 1) }))}
                      className="px-4 py-3 text-[#212529] hover:bg-[#F8F9FA] font-bold text-lg border-l border-[#E9ECEF]"
                    >+</button>
                  </div>
                  {errors.beds && <p className="text-sm text-red-600 mt-2">{errors.beds}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#212529] mb-2">
                    Bathrooms *
                  </label>
                  <div className="flex items-center border border-[#E9ECEF] rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, baths: String(Math.max(0, parseFloat(prev.baths || '0') - 0.5)) }))}
                      className="px-4 py-3 text-[#212529] hover:bg-[#F8F9FA] font-bold text-lg border-r border-[#E9ECEF]"
                    >−</button>
                    <span className="flex-1 text-center py-3 font-medium text-[#212529]">{formData.baths || '0'}</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, baths: String(parseFloat(prev.baths || '0') + 0.5) }))}
                      className="px-4 py-3 text-[#212529] hover:bg-[#F8F9FA] font-bold text-lg border-l border-[#E9ECEF]"
                    >+</button>
                  </div>
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

          {/* Step 4: Location (was step 5) */}
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
                    placeholder="Harare"
                    list="zw-cities-agent"
                    className="w-full px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] bg-white focus:outline-none focus:ring-2 focus:ring-[#212529]"
                  />
                  <datalist id="zw-cities-agent">
                    <option value="Harare" /><option value="Bulawayo" /><option value="Chitungwiza" />
                    <option value="Mutare" /><option value="Gweru" /><option value="Kwekwe" />
                    <option value="Kadoma" /><option value="Masvingo" /><option value="Chinhoyi" />
                    <option value="Norton" /><option value="Marondera" /><option value="Ruwa" />
                    <option value="Chegutu" /><option value="Zvishavane" /><option value="Bindura" />
                    <option value="Beitbridge" /><option value="Redcliff" /><option value="Victoria Falls" />
                    <option value="Hwange" /><option value="Kariba" />
                  </datalist>
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
                {errors.location && <p className="text-sm text-red-600 mt-2">{errors.location}</p>}
              </div>
            </div>
          )}

          {/* Step 5: Photos & Amenities (was step 6) */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#212529] mb-3">
                  Upload Photos (max 10) *
                </label>
                <div
                  onDrop={handleDrop}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
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
                      {isDragging ? 'Drop images here' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-[#ADB5BD] text-sm">PNG, JPG (max 10 images)</p>
                    {images.length > 0 && (
                      <span className="mt-2 inline-block px-2 py-0.5 bg-[#212529] text-white text-xs rounded-full">
                        {images.length} / 10 photo{images.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </label>
                </div>

                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img src={preview} alt={`Preview ${index}`} className="w-full h-32 object-cover rounded-lg" />
                        {index === 0 && (
                          <div className="absolute top-1 left-1 bg-[#212529] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                            Cover
                          </div>
                        )}
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={() => makeCover(index)}
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
                )}
                {errors.images && <p className="text-sm text-red-600 mt-2">{errors.images}</p>}
              </div>

              {/* Amenities */}
              <div className="border border-[#E9ECEF] rounded-xl p-4">
                <h3 className="text-sm font-semibold text-[#212529] mb-2">Amenities</h3>
                <p className="text-xs text-[#ADB5BD] mb-3">Select all amenities that apply</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {AMENITIES.map(amenity => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                        formData.amenities.includes(amenity)
                          ? 'border-[#212529] bg-[#212529] text-white'
                          : 'border-[#E9ECEF] bg-white text-[#495057] hover:border-[#212529]'
                      }`}
                    >
                      {formData.amenities.includes(amenity) && <Check size={ICON_SIZES.sm} />}
                      {amenity}
                    </button>
                  ))}
                </div>

                {formData.amenities.length > 0 && (
                  <p className="text-xs text-[#ADB5BD] mt-3">{formData.amenities.length} amenit{formData.amenities.length === 1 ? 'y' : 'ies'} selected</p>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-[#E9ECEF]">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1}
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
