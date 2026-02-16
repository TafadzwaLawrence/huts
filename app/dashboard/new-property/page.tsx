'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  ArrowLeft,
  X,
  Check,
  AlertCircle,
  Image as ImageIcon,
  Building2,
  Tag,
  Calendar,
  Car,
  TreePine,
  Loader2,
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

export default function NewPropertyPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const totalSteps = 5

  // Form data
  const [formData, setFormData] = useState({
    // Listing type
    listingType: 'rent' as 'rent' | 'sale',
    
    // Basic info
    title: '',
    description: '',
    propertyType: 'apartment' as 'apartment' | 'house' | 'studio' | 'room' | 'townhouse' | 'condo',
    
    // Pricing
    price: '',        // Monthly rent (for rent) OR sale price (for sale)
    deposit: '',      // Security deposit (rent only)
    
    // Details
    beds: '',
    baths: '',
    sqft: '',
    
    // Location
    address: '',
    city: '',
    stateProvince: '',
    zipCode: '',
    neighborhood: '',
    lat: 0,
    lng: 0,
    
    // Features
    amenities: [] as string[],
    
    // Availability
    availableFrom: '',
    leaseTerm: '1-year',
    
    // Sale-specific
    yearBuilt: '',
    lotSize: '',
    parkingSpaces: '',
    garageSpaces: '',
  })

  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

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
    
    // Create previews
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to create a listing')
        router.push('/dashboard')
        return
      }

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

      // Create property
      // Generate slug from title
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + 
        '-' + Date.now().toString(36)

      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
          user_id: user.id,
          slug,
          title: formData.title,
          description: formData.description,
          property_type: formData.propertyType,
          listing_type: formData.listingType,
          status: 'active',
          verification_status: 'pending',
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
          // Sale-specific fields
          year_built: formData.listingType === 'sale' && formData.yearBuilt ? parseInt(formData.yearBuilt) : null,
          lot_size_sqft: formData.listingType === 'sale' && formData.lotSize ? parseInt(formData.lotSize) : null,
          parking_spaces: formData.parkingSpaces ? parseInt(formData.parkingSpaces) : 0,
          garage_spaces: formData.garageSpaces ? parseInt(formData.garageSpaces) : 0,
          lat: formData.lat,
          lng: formData.lng,
          published_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (propertyError) throw propertyError

      // Compress images before upload (keeps quality, reduces size)
      toast.loading('Compressing images...', { id: 'image-upload' })
      const compressedImages = await compressImages(images, { maxSizeMB: 1.5, maxWidthOrHeight: 1600 })
      
      // Upload images to UploadThing
      toast.loading('Uploading images...', { id: 'image-upload' })
      
      try {
        const uploadedImages = await uploadFiles('propertyImages', {
          files: compressedImages,
        })

        // Save image URLs to property_images table
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
            console.error('Error saving image URLs:', imageError)
            toast.error('Property created but some images failed to save', { id: 'image-upload' })
          } else {
            toast.success('Property and images saved!', { id: 'image-upload' })
          }
        }
      } catch (uploadError) {
        console.error('Error uploading images:', uploadError)
        toast.error('Property created but image upload failed', { id: 'image-upload' })
      }
      
      // Send verification email to admin
      try {
        const verifyRes = await fetch('/api/properties/verify/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ propertyId: property.id }),
        })
        const verifyData = await verifyRes.json()
        if (!verifyRes.ok) {
          console.error('[Verification] API error:', verifyRes.status, verifyData)
          toast.error('Property created but verification email failed to send')
        } else {
          console.log('[Verification] Email sent successfully:', verifyData)
        }
      } catch (verifyError) {
        console.error('[Verification] Network error:', verifyError)
        toast.error('Property created but verification email failed to send')
      }

      toast.success('Property submitted! It will be visible once verified by our team.')
      router.push('/dashboard/overview')
    } catch (error: any) {
      console.error('Error creating property:', error)
      toast.error(error.message || 'Failed to create property')
    } finally {
      setLoading(false)
    }
  }

  const AMENITIES = [
    'WiFi', 'Parking', 'Pool', 'Gym', 'Laundry', 'Pet-friendly',
    'Furnished', 'Air conditioning', 'Heating', 'Balcony',
    'Garden', 'Security', 'Elevator', 'Storage',
  ]

  // Validate current step
  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (stepNumber === 1) {
      // Listing type is always set, no validation needed
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
      setStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1))
  }

  // Progress percentage
  const progress = ((step - 1) / (totalSteps - 1)) * 100

  const stepLabels = [
    { label: 'Type', icon: Tag },
    { label: 'Details', icon: Building2 },
    { label: 'Pricing', icon: DollarSign },
    { label: 'Location', icon: MapPin },
    { label: 'Photos', icon: ImageIcon },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-[#E9ECEF] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 sm:py-4">
          {/* Top row: Back + Title + Step count */}
          <div className="flex items-center justify-between mb-4">
            <Link 
              href="/dashboard/overview" 
              className="flex items-center gap-2 text-[#495057] hover:text-[#212529] transition-colors text-sm font-medium"
              title="Back to Dashboard"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <h1 className="text-sm font-semibold text-[#212529] tracking-wide uppercase">New Listing</h1>
            <span className="text-xs text-[#ADB5BD] font-medium tabular-nums">{step}/{totalSteps}</span>
          </div>
          
          {/* Step Indicator */}
          <div className="flex items-center gap-1">
            {stepLabels.map((s, i) => {
              const stepNum = i + 1
              const isCompleted = step > stepNum
              const isActive = step === stepNum
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className={`h-1 w-full rounded-full transition-all duration-500 ${
                    isCompleted ? 'bg-[#212529]' : isActive ? 'bg-[#212529]' : 'bg-[#E9ECEF]'
                  }`} />
                  <span className={`text-[10px] font-medium transition-colors hidden sm:block ${
                    isActive ? 'text-[#212529]' : isCompleted ? 'text-[#495057]' : 'text-[#ADB5BD]'
                  }`}>
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Listing Type */}
          {step === 1 && (
            <div className="animate-fadeIn">
              <div className="mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-[#212529] tracking-tight mb-2">
                  What would you like to do?
                </h2>
                <p className="text-[#495057] text-base">Choose how you want to list your property</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {/* Rent Card */}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, listingType: 'rent' }))}
                  className={`group relative p-6 md:p-7 rounded-2xl border-2 text-left transition-all duration-200 ${
                    formData.listingType === 'rent'
                      ? 'border-[#212529] bg-[#212529] text-white shadow-xl shadow-black/10'
                      : 'border-[#E9ECEF] bg-white hover:border-[#212529] hover:shadow-lg'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${
                    formData.listingType === 'rent' ? 'bg-white/15' : 'bg-[#F8F9FA]'
                  }`}>
                    <Home size={22} className={formData.listingType === 'rent' ? 'text-white' : 'text-[#212529]'} />
                  </div>
                  <h3 className="text-lg font-bold mb-1.5">Rent Out</h3>
                  <p className={`text-sm leading-relaxed mb-4 ${formData.listingType === 'rent' ? 'text-white/70' : 'text-[#495057]'}`}>
                    List your property for monthly rental income
                  </p>
                  <ul className={`space-y-2 text-xs ${formData.listingType === 'rent' ? 'text-white/60' : 'text-[#ADB5BD]'}`}>
                    <li className="flex items-center gap-2"><Check size={12} /> Set monthly rent price</li>
                    <li className="flex items-center gap-2"><Check size={12} /> Add security deposit</li>
                    <li className="flex items-center gap-2"><Check size={12} /> Choose lease terms</li>
                  </ul>
                  {formData.listingType === 'rent' && (
                    <div className="absolute top-5 right-5 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <Check size={14} className="text-[#212529]" />
                    </div>
                  )}
                </button>

                {/* Sale Card */}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, listingType: 'sale' }))}
                  className={`group relative p-6 md:p-7 rounded-2xl border-2 text-left transition-all duration-200 ${
                    formData.listingType === 'sale'
                      ? 'border-[#212529] bg-[#212529] text-white shadow-xl shadow-black/10'
                      : 'border-[#E9ECEF] bg-white hover:border-[#212529] hover:shadow-lg'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${
                    formData.listingType === 'sale' ? 'bg-white/15' : 'bg-[#F8F9FA]'
                  }`}>
                    <DollarSign size={22} className={formData.listingType === 'sale' ? 'text-white' : 'text-[#212529]'} />
                  </div>
                  <h3 className="text-lg font-bold mb-1.5">Sell</h3>
                  <p className={`text-sm leading-relaxed mb-4 ${formData.listingType === 'sale' ? 'text-white/70' : 'text-[#495057]'}`}>
                    Put your property on the market for sale
                  </p>
                  <ul className={`space-y-2 text-xs ${formData.listingType === 'sale' ? 'text-white/60' : 'text-[#ADB5BD]'}`}>
                    <li className="flex items-center gap-2"><Check size={12} /> Set your sale price</li>
                    <li className="flex items-center gap-2"><Check size={12} /> Add property details</li>
                    <li className="flex items-center gap-2"><Check size={12} /> Reach buyers directly</li>
                  </ul>
                  {formData.listingType === 'sale' && (
                    <div className="absolute top-5 right-5 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <Check size={14} className="text-[#212529]" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Basic Information */}
          {step === 2 && (
            <div className="animate-fadeIn">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-[#212529] tracking-tight mb-2">
                  Tell us about your property
                </h2>
                <p className="text-[#495057] text-base">
                  {formData.listingType === 'rent' ? 'Details that help renters find your listing' : 'Details that attract potential buyers'}
                </p>
              </div>

              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-[#212529] mb-2">
                    Property Title <span className="text-[#FF6B6B]">*</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3.5 border-2 rounded-xl text-[#212529] bg-white placeholder:text-[#ADB5BD] focus:outline-none transition-colors ${
                      errors.title ? 'border-[#FF6B6B]' : 'border-[#E9ECEF] focus:border-[#212529]'
                    }`}
                    placeholder="e.g., Modern 2BR Apartment in Avondale"
                  />
                  {errors.title ? (
                    <p className="mt-2 text-sm text-[#FF6B6B] flex items-center gap-1">
                      <AlertCircle size={14} /> {errors.title}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-[#ADB5BD]">
                      A catchy title helps your listing stand out
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-[#212529] mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 border-2 border-[#E9ECEF] rounded-xl text-[#212529] bg-white placeholder:text-[#ADB5BD] focus:outline-none focus:border-[#212529] transition-colors resize-none"
                    placeholder="Describe the property, its features, nearby amenities..."
                  />
                  <div className="flex justify-between mt-2">
                    <p className="text-xs text-[#ADB5BD]">Optional but recommended</p>
                    <p className="text-xs text-[#ADB5BD] tabular-nums">{formData.description.length}/2000</p>
                  </div>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-sm font-semibold text-[#212529] mb-3">
                    Property Type <span className="text-[#FF6B6B]">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    {[
                      { value: 'apartment', label: 'Apartment', icon: Building2 },
                      { value: 'house', label: 'House', icon: Home },
                      { value: 'studio', label: 'Studio', icon: Square },
                      { value: 'room', label: 'Room', icon: Bed },
                      { value: 'townhouse', label: 'Townhouse', icon: Home },
                      { value: 'condo', label: 'Condo', icon: Building2 },
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, propertyType: value as any }))}
                        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                          formData.propertyType === value
                            ? 'border-[#212529] bg-[#212529] text-white'
                            : 'border-[#E9ECEF] text-[#212529] hover:border-[#495057] bg-white'
                        }`}
                      >
                        <Icon size={16} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Pricing & Details */}
          {step === 3 && (
            <div className="animate-fadeIn">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-[#212529] tracking-tight mb-2">
                  Pricing & Details
                </h2>
                <p className="text-[#495057] text-base">Set your price and property specifications</p>
              </div>

              <div className="space-y-8">
                {/* Price */}
                <div>
                  <label htmlFor="price" className="block text-sm font-semibold text-[#212529] mb-2">
                    {formData.listingType === 'rent' ? 'Monthly Rent' : 'Sale Price'} <span className="text-[#FF6B6B]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#495057] font-semibold text-lg">$</span>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-4 border-2 rounded-xl text-[#212529] text-2xl font-bold bg-white placeholder:text-[#ADB5BD] placeholder:font-normal focus:outline-none transition-colors ${
                        errors.price ? 'border-[#FF6B6B]' : 'border-[#E9ECEF] focus:border-[#212529]'
                      }`}
                      placeholder={formData.listingType === 'rent' ? '1,200' : '250,000'}
                    />
                    {formData.listingType === 'rent' && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#ADB5BD] font-medium">/month</span>
                    )}
                  </div>
                  {errors.price && (
                    <p className="mt-2 text-sm text-[#FF6B6B] flex items-center gap-1">
                      <AlertCircle size={14} /> {errors.price}
                    </p>
                  )}
                </div>

                {/* Security Deposit (Rent only) */}
                {formData.listingType === 'rent' && (
                  <div>
                    <label htmlFor="deposit" className="block text-sm font-semibold text-[#212529] mb-2">
                      Security Deposit
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#495057] font-medium">$</span>
                      <input
                        id="deposit"
                        name="deposit"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.deposit}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3.5 border-2 border-[#E9ECEF] rounded-xl text-[#212529] bg-white placeholder:text-[#ADB5BD] focus:outline-none focus:border-[#212529] transition-colors"
                        placeholder="1,200"
                      />
                    </div>
                    <p className="mt-2 text-xs text-[#ADB5BD]">Optional — usually equal to one month&apos;s rent</p>
                  </div>
                )}

                {/* Property Specs */}
                <div>
                  <h3 className="text-sm font-semibold text-[#212529] mb-4">Property Specifications</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="beds" className="block text-xs font-medium text-[#495057] mb-2 flex items-center gap-1.5">
                        <Bed size={13} /> Beds <span className="text-[#FF6B6B]">*</span>
                      </label>
                      <input
                        id="beds"
                        name="beds"
                        type="number"
                        min="0"
                        value={formData.beds}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-3.5 border-2 rounded-xl text-[#212529] text-center text-lg font-bold bg-white placeholder:text-[#ADB5BD] placeholder:font-normal ${
                          errors.beds ? 'border-[#FF6B6B]' : 'border-[#E9ECEF] focus:border-[#212529]'
                        } focus:outline-none transition-colors`}
                        placeholder="2"
                      />
                    </div>
                    <div>
                      <label htmlFor="baths" className="block text-xs font-medium text-[#495057] mb-2 flex items-center gap-1.5">
                        <Bath size={13} /> Baths <span className="text-[#FF6B6B]">*</span>
                      </label>
                      <input
                        id="baths"
                        name="baths"
                        type="number"
                        min="0"
                        step="0.5"
                        value={formData.baths}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-3.5 border-2 rounded-xl text-[#212529] text-center text-lg font-bold bg-white placeholder:text-[#ADB5BD] placeholder:font-normal ${
                          errors.baths ? 'border-[#FF6B6B]' : 'border-[#E9ECEF] focus:border-[#212529]'
                        } focus:outline-none transition-colors`}
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label htmlFor="sqft" className="block text-xs font-medium text-[#495057] mb-2 flex items-center gap-1.5">
                        <Square size={13} /> Sqft
                      </label>
                      <input
                        id="sqft"
                        name="sqft"
                        type="number"
                        min="0"
                        value={formData.sqft}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3.5 border-2 border-[#E9ECEF] rounded-xl text-[#212529] text-center text-lg font-bold bg-white placeholder:text-[#ADB5BD] placeholder:font-normal focus:outline-none focus:border-[#212529] transition-colors"
                        placeholder="850"
                      />
                    </div>
                  </div>
                </div>

                {/* Sale-specific fields */}
                {formData.listingType === 'sale' && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#212529] mb-4">Additional Details</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="yearBuilt" className="block text-xs font-medium text-[#495057] mb-2 flex items-center gap-1.5">
                          <Calendar size={13} /> Year Built
                        </label>
                        <input
                          id="yearBuilt"
                          name="yearBuilt"
                          type="number"
                          min="1800"
                          max="2030"
                          value={formData.yearBuilt}
                          onChange={handleInputChange}
                          className="w-full px-3 py-3.5 border-2 border-[#E9ECEF] rounded-xl text-[#212529] text-center bg-white placeholder:text-[#ADB5BD] focus:outline-none focus:border-[#212529] transition-colors"
                          placeholder="2020"
                        />
                      </div>
                      <div>
                        <label htmlFor="lotSize" className="block text-xs font-medium text-[#495057] mb-2 flex items-center gap-1.5">
                          <TreePine size={13} /> Lot Size (sqft)
                        </label>
                        <input
                          id="lotSize"
                          name="lotSize"
                          type="number"
                          min="0"
                          value={formData.lotSize}
                          onChange={handleInputChange}
                          className="w-full px-3 py-3.5 border-2 border-[#E9ECEF] rounded-xl text-[#212529] text-center bg-white placeholder:text-[#ADB5BD] focus:outline-none focus:border-[#212529] transition-colors"
                          placeholder="5000"
                        />
                      </div>
                      <div>
                        <label htmlFor="parkingSpaces" className="block text-xs font-medium text-[#495057] mb-2 flex items-center gap-1.5">
                          <Car size={13} /> Parking Spaces
                        </label>
                        <input
                          id="parkingSpaces"
                          name="parkingSpaces"
                          type="number"
                          min="0"
                          value={formData.parkingSpaces}
                          onChange={handleInputChange}
                          className="w-full px-3 py-3.5 border-2 border-[#E9ECEF] rounded-xl text-[#212529] text-center bg-white placeholder:text-[#ADB5BD] focus:outline-none focus:border-[#212529] transition-colors"
                          placeholder="2"
                        />
                      </div>
                      <div>
                        <label htmlFor="garageSpaces" className="block text-xs font-medium text-[#495057] mb-2 flex items-center gap-1.5">
                          <Car size={13} /> Garage Spaces
                        </label>
                        <input
                          id="garageSpaces"
                          name="garageSpaces"
                          type="number"
                          min="0"
                          value={formData.garageSpaces}
                          onChange={handleInputChange}
                          className="w-full px-3 py-3.5 border-2 border-[#E9ECEF] rounded-xl text-[#212529] text-center bg-white placeholder:text-[#ADB5BD] focus:outline-none focus:border-[#212529] transition-colors"
                          placeholder="1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Availability */}
                <div>
                  <h3 className="text-sm font-semibold text-[#212529] mb-4">Availability</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="availableFrom" className="block text-xs font-medium text-[#495057] mb-2">
                        {formData.listingType === 'rent' ? 'Available From' : 'Move-in Ready'}
                      </label>
                      <input
                        id="availableFrom"
                        name="availableFrom"
                        type="date"
                        value={formData.availableFrom}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3.5 border-2 border-[#E9ECEF] rounded-xl text-[#212529] bg-white focus:outline-none focus:border-[#212529] transition-colors"
                      />
                    </div>
                    {formData.listingType === 'rent' && (
                      <div>
                        <label htmlFor="leaseTerm" className="block text-xs font-medium text-[#495057] mb-2">
                          Lease Term
                        </label>
                        <select
                          id="leaseTerm"
                          name="leaseTerm"
                          value={formData.leaseTerm}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3.5 border-2 border-[#E9ECEF] rounded-xl text-[#212529] bg-white focus:outline-none focus:border-[#212529] transition-colors"
                        >
                          <option value="month-to-month">Month-to-month</option>
                          <option value="6-months">6 months</option>
                          <option value="1-year">1 year</option>
                          <option value="2-years">2 years</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Location */}
          {step === 4 && (
            <div className="animate-fadeIn">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-[#212529] tracking-tight mb-2">
                  Where is your property?
                </h2>
                <p className="text-[#495057] text-base">Help people find your property&apos;s location</p>
              </div>

              <div className="space-y-6">
                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-semibold text-[#212529] mb-2">
                    Street Address <span className="text-[#FF6B6B]">*</span>
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3.5 border-2 rounded-xl text-[#212529] bg-white placeholder:text-[#ADB5BD] focus:outline-none transition-colors ${
                      errors.address ? 'border-[#FF6B6B]' : 'border-[#E9ECEF] focus:border-[#212529]'
                    }`}
                    placeholder="123 Main Street"
                  />
                  {errors.address && (
                    <p className="mt-2 text-sm text-[#FF6B6B] flex items-center gap-1">
                      <AlertCircle size={14} /> {errors.address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="city" className="block text-sm font-semibold text-[#212529] mb-2">
                      City <span className="text-[#FF6B6B]">*</span>
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3.5 border-2 rounded-xl text-[#212529] bg-white placeholder:text-[#ADB5BD] focus:outline-none transition-colors ${
                        errors.city ? 'border-[#FF6B6B]' : 'border-[#E9ECEF] focus:border-[#212529]'
                      }`}
                      placeholder="Harare"
                    />
                  </div>
                  <div>
                    <label htmlFor="neighborhood" className="block text-sm font-semibold text-[#212529] mb-2">
                      Neighborhood
                    </label>
                    <input
                      id="neighborhood"
                      name="neighborhood"
                      type="text"
                      value={formData.neighborhood}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 border-2 border-[#E9ECEF] rounded-xl text-[#212529] bg-white placeholder:text-[#ADB5BD] focus:outline-none focus:border-[#212529] transition-colors"
                      placeholder="Avondale"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="stateProvince" className="block text-sm font-semibold text-[#212529] mb-2">
                      State/Province
                    </label>
                    <input
                      id="stateProvince"
                      name="stateProvince"
                      type="text"
                      value={formData.stateProvince}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 border-2 border-[#E9ECEF] rounded-xl text-[#212529] bg-white placeholder:text-[#ADB5BD] focus:outline-none focus:border-[#212529] transition-colors"
                      placeholder="Harare Province"
                    />
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-semibold text-[#212529] mb-2">
                      Zip/Postal Code
                    </label>
                    <input
                      id="zipCode"
                      name="zipCode"
                      type="text"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 border-2 border-[#E9ECEF] rounded-xl text-[#212529] bg-white placeholder:text-[#ADB5BD] focus:outline-none focus:border-[#212529] transition-colors"
                      placeholder="00263"
                    />
                  </div>
                </div>

                {/* Map */}
                <div>
                  <label className="block text-sm font-semibold text-[#212529] mb-2">
                    Pin Location on Map <span className="text-[#FF6B6B]">*</span>
                  </label>
                  <p className="text-xs text-[#ADB5BD] mb-3">
                    Search or click on the map to set the exact location
                  </p>
                  {errors.location && (
                    <p className="mb-3 text-sm text-[#FF6B6B] flex items-center gap-1">
                      <AlertCircle size={14} /> {errors.location}
                    </p>
                  )}
                  <div className="rounded-xl overflow-hidden border-2 border-[#E9ECEF]">
                    <LocationPicker
                      lat={formData.lat || undefined}
                      lng={formData.lng || undefined}
                      onLocationChange={(lat, lng, address) => {
                        setFormData(prev => ({
                          ...prev,
                          lat,
                          lng,
                          ...(address && !prev.address ? { address: address.split(',')[0] } : {}),
                        }))
                        setErrors(prev => ({ ...prev, location: '' }))
                      }}
                    />
                  </div>
                  {formData.lat && formData.lng && (
                    <p className="mt-3 text-xs text-[#51CF66] flex items-center gap-1.5 font-medium">
                      <Check size={14} /> Location set: {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Photos & Amenities */}
          {step === 5 && (
            <div className="animate-fadeIn">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-[#212529] tracking-tight mb-2">
                  Make it shine
                </h2>
                <p className="text-[#495057] text-base">Great photos get up to 5x more inquiries</p>
              </div>

              <div className="space-y-8">
                {/* Photos */}
                <div>
                  <h3 className="text-sm font-semibold text-[#212529] mb-1 flex items-center gap-2">
                    Photos <span className="text-xs text-[#ADB5BD] font-normal">max 10</span>
                  </h3>
                  <p className="text-xs text-[#ADB5BD] mb-4">First image will be the cover photo</p>
                  
                  {errors.images && (
                    <div className="mb-4 px-4 py-3 bg-[#FF6B6B]/5 border border-[#FF6B6B]/20 rounded-xl flex items-center gap-2 text-sm text-[#FF6B6B]">
                      <AlertCircle size={15} />
                      {errors.images}
                    </div>
                  )}

                  <label className="block w-full border-2 border-dashed border-[#E9ECEF] rounded-xl p-8 md:p-10 text-center hover:border-[#212529] transition-colors cursor-pointer bg-[#FAFAFA] hover:bg-white group">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-full bg-[#E9ECEF] flex items-center justify-center mx-auto mb-3 group-hover:bg-[#212529] transition-colors">
                      <Upload size={20} className="text-[#495057] group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-[#212529] font-semibold text-sm mb-1">Click to upload or drag & drop</p>
                    <p className="text-xs text-[#ADB5BD]">PNG, JPG, WEBP up to 10MB each</p>
                  </label>

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group aspect-square">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover rounded-xl border border-[#E9ECEF]"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                          >
                            <X size={12} />
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-2 left-2 bg-[#212529] text-white text-[10px] font-semibold px-2 py-0.5 rounded-md tracking-wide uppercase">
                              Cover
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Amenities */}
                <div>
                  <h3 className="text-sm font-semibold text-[#212529] mb-1">Amenities</h3>
                  <p className="text-xs text-[#ADB5BD] mb-4">Select all that apply</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    {AMENITIES.map(amenity => (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => toggleAmenity(amenity)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                          formData.amenities.includes(amenity)
                            ? 'border-[#212529] bg-[#212529] text-white'
                            : 'border-[#E9ECEF] text-[#212529] hover:border-[#495057] bg-white'
                        }`}
                      >
                        {formData.amenities.includes(amenity) && <Check size={14} />}
                        {amenity}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-10 pt-6 border-t border-[#E9ECEF]">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center justify-center gap-2 px-5 py-3.5 border-2 border-[#E9ECEF] text-[#212529] rounded-xl text-sm font-semibold hover:border-[#212529] transition-all"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            )}
            
            {step < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 flex items-center justify-center gap-2 bg-[#212529] text-white px-6 py-3.5 rounded-xl text-sm font-semibold hover:bg-black transition-all"
              >
                Continue
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-[#212529] text-white px-6 py-3.5 rounded-xl text-sm font-semibold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                    Publishing...
                  </>
                ) : (
                  <>
                    Submit for Verification
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
      `}</style>
    </div>
  )
}
