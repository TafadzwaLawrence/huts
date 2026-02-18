'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
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
  Loader2,
  Trash2,
  Star,
  Building2,
  Calendar,
  Car,
  TreePine,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'

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

const STATUS_OPTIONS = {
  rent: [
    { value: 'active', label: 'Active', description: 'Visible to renters', icon: Eye, color: 'text-[#51CF66]' },
    { value: 'draft', label: 'Draft', description: 'Hidden from search', icon: EyeOff, color: 'text-[#ADB5BD]' },
    { value: 'rented', label: 'Rented', description: 'Marked as taken', icon: CheckCircle2, color: 'text-blue-500' },
    { value: 'inactive', label: 'Inactive', description: 'Temporarily hidden', icon: XCircle, color: 'text-[#FF6B6B]' },
  ],
  sale: [
    { value: 'active', label: 'Active', description: 'Visible to buyers', icon: Eye, color: 'text-[#51CF66]' },
    { value: 'draft', label: 'Draft', description: 'Hidden from search', icon: EyeOff, color: 'text-[#ADB5BD]' },
    { value: 'sold', label: 'Sold', description: 'Marked as sold', icon: CheckCircle2, color: 'text-blue-500' },
    { value: 'inactive', label: 'Inactive', description: 'Temporarily hidden', icon: XCircle, color: 'text-[#FF6B6B]' },
  ],
} as const

const AMENITIES = [
  'WiFi', 'Parking', 'Pool', 'Gym', 'Laundry', 'Pet-friendly',
  'Furnished', 'Air conditioning', 'Heating', 'Balcony',
  'Garden', 'Security', 'Elevator', 'Storage',
]

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment', icon: Building2 },
  { value: 'house', label: 'House', icon: Home },
  { value: 'studio', label: 'Studio', icon: Square },
  { value: 'room', label: 'Room', icon: Bed },
  { value: 'townhouse', label: 'Townhouse', icon: Home },
  { value: 'condo', label: 'Condo', icon: Building2 },
] as const

const SECTIONS = [
  { id: 'status', label: 'Status' },
  { id: 'type', label: 'Type' },
  { id: 'basic', label: 'Basic' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'specs', label: 'Specs' },
  { id: 'location', label: 'Location' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'photos', label: 'Photos' },
  { id: 'availability', label: 'Dates' },
]

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [propertyId, setPropertyId] = useState('')
  const [propertySlug, setPropertySlug] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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
    status: 'active' as string,
    // Sale-specific fields
    yearBuilt: '',
    lotSize: '',
    parkingSpaces: '',
    garageSpaces: '',
    propertyTax: '',
    hoaFee: '',
  })

  const [existingImages, setExistingImages] = useState<PropertyImage[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
  const [primaryImageId, setPrimaryImageId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showStickyBar, setShowStickyBar] = useState(false)
  const [activeSection, setActiveSection] = useState('status')
  const formRef = useRef<HTMLFormElement>(null)
  const submitAreaRef = useRef<HTMLDivElement>(null)
  const originalListingTypeRef = useRef<string>('rent')

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

      const listingType = property.listing_type || 'rent'
      const priceValue = listingType === 'sale' && property.sale_price
        ? (property.sale_price / 100).toString()
        : property.price ? (property.price / 100).toString() : ''

      setPropertySlug(property.slug || '')
      originalListingTypeRef.current = listingType
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
        yearBuilt: property.year_built?.toString() || '',
        lotSize: property.lot_size_sqft?.toString() || '',
        parkingSpaces: property.parking_spaces?.toString() || '',
        garageSpaces: property.garage_spaces?.toString() || '',
        propertyTax: property.property_tax_annual ? (property.property_tax_annual / 100).toString() : '',
        hoaFee: property.hoa_fee_monthly ? (property.hoa_fee_monthly / 100).toString() : '',
      })

      const sortedImages = (property.property_images || []).sort((a: PropertyImage, b: PropertyImage) => a.order - b.order)
      setExistingImages(sortedImages)
      const primary = sortedImages.find((img: PropertyImage) => img.is_primary)
      setPrimaryImageId(primary?.id || sortedImages[0]?.id || null)
      setLoading(false)
    }

    loadProperty()
  }, [params, supabase, router])

  // Warn on unsaved changes when navigating away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasChanges])

  // Ctrl+S keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (!saving && hasChanges) {
          formRef.current?.requestSubmit()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [saving, hasChanges])

  // Scroll observer for sticky save bar + active section tracking
  useEffect(() => {
    if (loading) return

    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    )
    if (submitAreaRef.current) observer.observe(submitAreaRef.current)

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-80px 0px -70% 0px' }
    )
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) sectionObserver.observe(el)
    })

    return () => {
      observer.disconnect()
      sectionObserver.disconnect()
    }
  }, [loading])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setHasChanges(true)
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const totalImages = existingImages.length - imagesToDelete.length + newImages.length + files.length

    if (totalImages > 10) {
      toast.error('Maximum 10 images allowed')
      return
    }

    setNewImages(prev => [...prev, ...files])
    setHasChanges(true)

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
    setHasChanges(true)
    if (imageId === primaryImageId) {
      const remaining = existingImages.filter(img => img.id !== imageId && !imagesToDelete.includes(img.id))
      setPrimaryImageId(remaining[0]?.id || null)
    }
  }

  const restoreImage = (imageId: string) => {
    setImagesToDelete(prev => prev.filter(id => id !== imageId))
    setHasChanges(true)
  }

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index))
    setHasChanges(true)
  }

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }))
    setHasChanges(true)
  }

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const moveImage = (imageId: string, direction: 'up' | 'down') => {
    setExistingImages(prev => {
      const index = prev.findIndex(img => img.id === imageId)
      if (index === -1) return prev
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= prev.length) return prev
      const updated = [...prev]
      ;[updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]]
      return updated.map((img, i) => ({ ...img, order: i }))
    })
    setHasChanges(true)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)
      if (error) throw error
      setHasChanges(false)
      toast.success('Property deleted')
      router.push('/dashboard/my-properties')
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error(error.message || 'Failed to delete property')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'A valid price is required'
    if (!formData.beds) newErrors.beds = 'Required'
    if (!formData.baths) newErrors.baths = 'Required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix the highlighted fields')
      const firstErrorField = document.querySelector('[data-error="true"]')
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in')
        router.push('/auth/signup')
        return
      }

      const priceValue = Math.round(parseFloat(formData.price) * 100)
      const depositInCents = formData.deposit ? Math.round(parseFloat(formData.deposit) * 100) : null

      const { error: updateError } = await supabase
        .from('properties')
        .update({
          title: formData.title,
          description: formData.description,
          property_type: formData.propertyType,
          listing_type: formData.listingType,
          status: formData.status,
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
          year_built: formData.listingType === 'sale' && formData.yearBuilt ? parseInt(formData.yearBuilt) : null,
          lot_size_sqft: formData.listingType === 'sale' && formData.lotSize ? parseInt(formData.lotSize) : null,
          parking_spaces: formData.parkingSpaces ? parseInt(formData.parkingSpaces) : 0,
          garage_spaces: formData.garageSpaces ? parseInt(formData.garageSpaces) : 0,
          property_tax_annual: formData.listingType === 'sale' && formData.propertyTax ? Math.round(parseFloat(formData.propertyTax) * 100) : null,
          hoa_fee_monthly: formData.listingType === 'sale' && formData.hoaFee ? Math.round(parseFloat(formData.hoaFee) * 100) : null,
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

        if (deleteError) console.error('Error deleting images:', deleteError)
      }

      // Update primary image flag
      if (primaryImageId) {
        await supabase
          .from('property_images')
          .update({ is_primary: false })
          .eq('property_id', propertyId)

        await supabase
          .from('property_images')
          .update({ is_primary: true })
          .eq('id', primaryImageId)
      }

      // Update image order
      const orderedImages = existingImages.filter(img => !imagesToDelete.includes(img.id))
      if (orderedImages.length > 0) {
        await Promise.all(
          orderedImages.map((img) =>
            supabase
              .from('property_images')
              .update({ order: img.order })
              .eq('id', img.id)
          )
        )
      }

      // Upload new images
      if (newImages.length > 0) {
        toast.loading('Compressing images...', { id: 'image-upload' })
        const compressedImages = await compressImages(newImages, { maxSizeMB: 1.5, maxWidthOrHeight: 1600 })

        toast.loading('Uploading images...', { id: 'image-upload' })

        try {
          const uploadedImages = await uploadFiles('propertyImages', {
            files: compressedImages,
          })

          if (uploadedImages.length > 0) {
            const remainingImages = existingImages.filter(img => !imagesToDelete.includes(img.id))
            const startOrder = remainingImages.length
            const noPrimaryExists = !primaryImageId || imagesToDelete.includes(primaryImageId)

            const imageInserts = uploadedImages.map((img, index) => ({
              property_id: propertyId,
              url: img.url,
              is_primary: noPrimaryExists && index === 0,
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

      setHasChanges(false)
      toast.success('Property updated successfully!')
      router.push('/dashboard/my-properties')
    } catch (error: any) {
      console.error('Error updating property:', error)
      toast.error(error.message || 'Failed to update property')
    } finally {
      setSaving(false)
    }
  }

  const activeImages = existingImages.filter(img => !imagesToDelete.includes(img.id))
  const totalImageCount = activeImages.length + newImages.length
  const statusOptions = STATUS_OPTIONS[formData.listingType] || STATUS_OPTIONS.rent

  const completion = useMemo(() => {
    let filled = 0
    const total = 10
    if (formData.title.trim()) filled++
    if (formData.price && parseFloat(formData.price) > 0) filled++
    if (formData.beds) filled++
    if (formData.baths) filled++
    if (formData.address.trim()) filled++
    if (formData.city.trim()) filled++
    if (formData.description.trim()) filled++
    if (totalImageCount > 0) filled++
    if (formData.amenities.length > 0) filled++
    if (formData.lat !== 0 && formData.lng !== 0) filled++
    return Math.round((filled / total) * 100)
  }, [formData, totalImageCount])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#212529] mb-4" />
          <p className="text-[#495057] text-sm">Loading property...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-[#E9ECEF] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/my-properties"
              className="flex items-center gap-2 text-[#495057] hover:text-[#212529] transition-colors text-sm font-medium"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">My Properties</span>
            </Link>
            <h1 className="text-sm font-semibold text-[#212529] tracking-wide uppercase">Edit Listing</h1>
            <div className="flex items-center gap-3">
              {/* Completion indicator */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-16 h-1.5 bg-[#E9ECEF] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${completion === 100 ? 'bg-[#51CF66]' : 'bg-[#212529]'}`}
                    style={{ width: `${completion}%` }}
                  />
                </div>
                <span className="text-[10px] text-[#ADB5BD] tabular-nums font-medium">{completion}%</span>
              </div>
              {propertySlug && (
                <Link
                  href={`/property/${propertySlug}`}
                  target="_blank"
                  className="text-xs text-[#495057] hover:text-[#212529] font-medium hidden sm:flex items-center gap-1"
                >
                  <Eye size={14} />
                  View
                </Link>
              )}
              {hasChanges && (
                <span className="flex items-center gap-1 text-xs text-[#FF6B6B] font-medium">
                  <Clock size={12} />
                  Unsaved
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Section Navigation */}
        <div className="max-w-3xl mx-auto px-4 pb-2 -mt-1">
          <div className="flex gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {SECTIONS.map(section => (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollToSection(section.id)}
                className={`text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap transition-all font-medium ${
                  activeSection === section.id
                    ? 'bg-[#212529] text-white'
                    : 'text-[#ADB5BD] hover:text-[#212529] hover:bg-[#F8F9FA]'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <form ref={formRef} onSubmit={handleSubmit}>

          {/* ===== STATUS ===== */}
          <section id="status" className="mb-10 scroll-mt-24">
            <h2 className="text-sm font-semibold text-[#212529] mb-4 uppercase tracking-wider">Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {statusOptions.map(opt => {
                const Icon = opt.icon
                const isActive = formData.status === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, status: opt.value }))
                      setHasChanges(true)
                    }}
                    className={`relative flex flex-col items-center gap-1.5 px-4 py-4 rounded-xl border-2 transition-all text-center ${
                      isActive
                        ? 'border-[#212529] bg-[#212529] text-white'
                        : 'border-[#E9ECEF] text-[#495057] hover:border-[#495057] bg-white'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-white' : opt.color} />
                    <span className="text-xs font-semibold">{opt.label}</span>
                    <span className={`text-[10px] ${isActive ? 'text-white/60' : 'text-[#ADB5BD]'}`}>
                      {opt.description}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          <div className="h-px bg-[#E9ECEF] mb-10" />

          {/* ===== LISTING TYPE ===== */}
          <section id="type" className="mb-10 scroll-mt-24">
            <h2 className="text-sm font-semibold text-[#212529] mb-4 uppercase tracking-wider">Listing Type</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, listingType: 'rent' }))
                  setHasChanges(true)
                }}
                className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                  formData.listingType === 'rent'
                    ? 'border-[#212529] bg-[#212529] text-white shadow-lg shadow-black/5'
                    : 'border-[#E9ECEF] bg-white hover:border-[#212529]'
                }`}
              >
                <Home size={20} className={formData.listingType === 'rent' ? 'text-white mb-2' : 'text-[#212529] mb-2'} />
                <p className="font-bold text-sm">For Rent</p>
                <p className={`text-xs mt-0.5 ${formData.listingType === 'rent' ? 'text-white/60' : 'text-[#ADB5BD]'}`}>
                  Monthly rental income
                </p>
                {formData.listingType === 'rent' && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <Check size={12} className="text-[#212529]" />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, listingType: 'sale' }))
                  setHasChanges(true)
                }}
                className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                  formData.listingType === 'sale'
                    ? 'border-[#212529] bg-[#212529] text-white shadow-lg shadow-black/5'
                    : 'border-[#E9ECEF] bg-white hover:border-[#212529]'
                }`}
              >
                <DollarSign size={20} className={formData.listingType === 'sale' ? 'text-white mb-2' : 'text-[#212529] mb-2'} />
                <p className="font-bold text-sm">For Sale</p>
                <p className={`text-xs mt-0.5 ${formData.listingType === 'sale' ? 'text-white/60' : 'text-[#ADB5BD]'}`}>
                  One-time purchase
                </p>
                {formData.listingType === 'sale' && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <Check size={12} className="text-[#212529]" />
                  </div>
                )}
              </button>
            </div>
            {formData.listingType !== originalListingTypeRef.current && (
              <p className="mt-3 text-xs text-amber-600 flex items-center gap-1.5 bg-amber-50 px-3 py-2 rounded-lg">
                <AlertCircle size={14} />
                Switching type will adjust pricing fields on save
              </p>
            )}
          </section>

          <div className="h-px bg-[#E9ECEF] mb-10" />

          {/* ===== BASIC INFORMATION ===== */}
          <section id="basic" className="mb-10 scroll-mt-24">
            <h2 className="text-sm font-semibold text-[#212529] mb-6 uppercase tracking-wider">Basic Information</h2>

            <div className="space-y-6">
              {/* Title */}
              <div data-error={!!errors.title || undefined}>
                <label htmlFor="title" className="block text-sm font-semibold text-[#212529] mb-2">
                  Property Title <span className="text-[#FF6B6B]">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3.5 border-2 rounded-xl text-[#212529] bg-white placeholder:text-[#ADB5BD] focus:outline-none transition-colors ${
                    errors.title ? 'border-[#FF6B6B]' : 'border-[#E9ECEF] focus:border-[#212529]'
                  }`}
                  placeholder="e.g., Modern 2BR Apartment in Avondale"
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-[#FF6B6B] flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.title}
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
                  {PROPERTY_TYPES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, propertyType: value as any }))
                        setHasChanges(true)
                      }}
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
          </section>

          <div className="h-px bg-[#E9ECEF] mb-10" />

          {/* ===== PRICING ===== */}
          <section id="pricing" className="mb-10 scroll-mt-24">
            <h2 className="text-sm font-semibold text-[#212529] mb-6 uppercase tracking-wider">Pricing</h2>

            <div className="space-y-6">
              {/* Price */}
              <div data-error={!!errors.price || undefined}>
                <label htmlFor="price" className="block text-sm font-semibold text-[#212529] mb-2">
                  {formData.listingType === 'rent' ? 'Monthly Rent' : 'Sale Price'} <span className="text-[#FF6B6B]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#495057] font-semibold text-lg">$</span>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    required
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

              {/* Sale-specific pricing */}
              {formData.listingType === 'sale' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="propertyTax" className="block text-xs font-medium text-[#495057] mb-2">
                      Annual Property Tax ($)
                    </label>
                    <input
                      id="propertyTax"
                      name="propertyTax"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.propertyTax}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 border-2 border-[#E9ECEF] rounded-xl text-[#212529] bg-white placeholder:text-[#ADB5BD] focus:outline-none focus:border-[#212529] transition-colors"
                      placeholder="2,400"
                    />
                  </div>
                  <div>
                    <label htmlFor="hoaFee" className="block text-xs font-medium text-[#495057] mb-2">
                      Monthly HOA Fee ($)
                    </label>
                    <input
                      id="hoaFee"
                      name="hoaFee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.hoaFee}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 border-2 border-[#E9ECEF] rounded-xl text-[#212529] bg-white placeholder:text-[#ADB5BD] focus:outline-none focus:border-[#212529] transition-colors"
                      placeholder="350"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="h-px bg-[#E9ECEF] mb-10" />

          {/* ===== PROPERTY DETAILS ===== */}
          <section id="specs" className="mb-10 scroll-mt-24">
            <h2 className="text-sm font-semibold text-[#212529] mb-6 uppercase tracking-wider">Property Specifications</h2>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div data-error={!!errors.beds || undefined}>
                <label htmlFor="beds" className="block text-xs font-medium text-[#495057] mb-2 flex items-center gap-1.5">
                  <Bed size={13} /> Beds <span className="text-[#FF6B6B]">*</span>
                </label>
                <input
                  id="beds"
                  name="beds"
                  type="number"
                  required
                  min="0"
                  value={formData.beds}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-3.5 border-2 rounded-xl text-[#212529] text-center text-lg font-bold bg-white placeholder:text-[#ADB5BD] placeholder:font-normal ${
                    errors.beds ? 'border-[#FF6B6B]' : 'border-[#E9ECEF] focus:border-[#212529]'
                  } focus:outline-none transition-colors`}
                  placeholder="2"
                />
              </div>
              <div data-error={!!errors.baths || undefined}>
                <label htmlFor="baths" className="block text-xs font-medium text-[#495057] mb-2 flex items-center gap-1.5">
                  <Bath size={13} /> Baths <span className="text-[#FF6B6B]">*</span>
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

            {/* Sale-specific details */}
            {formData.listingType === 'sale' && (
              <div>
                <h3 className="text-xs font-medium text-[#495057] mb-3">Additional Details</h3>
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

            {/* Parking for rentals too */}
            {formData.listingType === 'rent' && (
              <div className="grid grid-cols-2 gap-3">
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
                    placeholder="1"
                  />
                </div>
              </div>
            )}
          </section>

          <div className="h-px bg-[#E9ECEF] mb-10" />

          {/* ===== LOCATION ===== */}
          <section id="location" className="mb-10 scroll-mt-24">
            <h2 className="text-sm font-semibold text-[#212529] mb-6 uppercase tracking-wider">Location</h2>

            <div className="space-y-6">
              <div data-error={!!errors.address || undefined}>
                <label htmlFor="address" className="block text-sm font-semibold text-[#212529] mb-2">
                  Street Address <span className="text-[#FF6B6B]">*</span>
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
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
                <div data-error={!!errors.city || undefined}>
                  <label htmlFor="city" className="block text-sm font-semibold text-[#212529] mb-2">
                    City <span className="text-[#FF6B6B]">*</span>
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
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
                  Pin Location on Map
                </label>
                <p className="text-xs text-[#ADB5BD] mb-3">
                  Search or click on the map to update the location
                </p>
                <div className="rounded-xl overflow-hidden border-2 border-[#E9ECEF]">
                  <LocationPicker
                    lat={formData.lat || undefined}
                    lng={formData.lng || undefined}
                    onLocationChange={(lat, lng) => {
                      setFormData(prev => ({ ...prev, lat, lng }))
                      setHasChanges(true)
                    }}
                  />
                </div>
                {formData.lat !== 0 && formData.lng !== 0 && (
                  <p className="mt-3 text-xs text-[#51CF66] flex items-center gap-1.5 font-medium">
                    <Check size={14} /> Location set: {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}
                  </p>
                )}
              </div>
            </div>
          </section>

          <div className="h-px bg-[#E9ECEF] mb-10" />

          {/* ===== AMENITIES ===== */}
          <section id="amenities" className="mb-10 scroll-mt-24">
            <h2 className="text-sm font-semibold text-[#212529] mb-1 uppercase tracking-wider">Amenities</h2>
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
          </section>

          <div className="h-px bg-[#E9ECEF] mb-10" />

          {/* ===== PHOTOS ===== */}
          <section id="photos" className="mb-10 scroll-mt-24">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold text-[#212529] uppercase tracking-wider">Photos</h2>
              <span className="text-xs text-[#ADB5BD] font-medium tabular-nums">{totalImageCount}/10</span>
            </div>
            <p className="text-xs text-[#ADB5BD] mb-4">Click the star to set a cover photo. First image is used by default.</p>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {existingImages.map((image) => {
                    const isMarkedForDeletion = imagesToDelete.includes(image.id)
                    const isPrimary = primaryImageId === image.id
                    return (
                      <div key={image.id} className={`relative group aspect-square ${isMarkedForDeletion ? 'opacity-40' : ''}`}>
                        <img
                          src={image.url}
                          alt="Property"
                          className="w-full h-full object-cover rounded-xl border border-[#E9ECEF]"
                        />
                        {isMarkedForDeletion ? (
                          <button
                            type="button"
                            onClick={() => restoreImage(image.id)}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-xl text-white gap-1"
                          >
                            <Trash2 size={18} />
                            <span className="text-xs font-medium">Undo</span>
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => removeExistingImage(image.id)}
                              className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                            >
                              <X size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPrimaryImageId(image.id)
                                setHasChanges(true)
                              }}
                              className={`absolute top-2 left-2 p-1.5 rounded-full transition-opacity ${
                                isPrimary
                                  ? 'bg-[#212529] text-white opacity-100'
                                  : 'bg-black/60 text-white/70 opacity-0 group-hover:opacity-100 hover:text-white'
                              }`}
                              title={isPrimary ? 'Cover photo' : 'Set as cover'}
                            >
                              <Star size={12} fill={isPrimary ? 'currentColor' : 'none'} />
                            </button>
                            {isPrimary && (
                              <div className="absolute bottom-2 left-2 bg-[#212529] text-white text-[10px] font-semibold px-2 py-0.5 rounded-md tracking-wide uppercase">
                                Cover
                              </div>
                            )}
                            {activeImages.length > 1 && (
                              <div className="absolute bottom-2 right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                {activeImages.findIndex(img => img.id === image.id) > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => moveImage(image.id, 'up')}
                                    className="p-1 bg-black/60 text-white rounded hover:bg-black/80"
                                    title="Move earlier"
                                  >
                                    <ChevronUp size={10} />
                                  </button>
                                )}
                                {activeImages.findIndex(img => img.id === image.id) < activeImages.length - 1 && (
                                  <button
                                    type="button"
                                    onClick={() => moveImage(image.id, 'down')}
                                    className="p-1 bg-black/60 text-white rounded hover:bg-black/80"
                                    title="Move later"
                                  >
                                    <ChevronDown size={10} />
                                  </button>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Upload Area */}
            {totalImageCount < 10 && (
              <label className="block w-full border-2 border-dashed border-[#E9ECEF] rounded-xl p-8 text-center hover:border-[#212529] transition-colors cursor-pointer bg-[#FAFAFA] hover:bg-white group">
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
            )}

            {/* New Image Previews */}
            {newImagePreviews.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-[#495057] mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#51CF66]" />
                  New images to upload
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {newImagePreviews.map((preview, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={preview}
                        alt={`New ${index + 1}`}
                        className="w-full h-full object-cover rounded-xl border-2 border-[#51CF66]/30"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <div className="h-px bg-[#E9ECEF] mb-10" />

          {/* ===== AVAILABILITY ===== */}
          <section id="availability" className="mb-10 scroll-mt-24">
            <h2 className="text-sm font-semibold text-[#212529] mb-6 uppercase tracking-wider">Availability</h2>

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
          </section>

          {/* ===== SUBMIT ===== */}
          <div ref={submitAreaRef} className="flex gap-3 pt-6 border-t border-[#E9ECEF]">
            <Link
              href="/dashboard/my-properties"
              className="flex items-center justify-center gap-2 px-5 py-3.5 border-2 border-[#E9ECEF] text-[#212529] rounded-xl text-sm font-semibold hover:border-[#212529] transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-[#212529] text-white px-6 py-3.5 rounded-xl text-sm font-semibold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Saving...
                </>
              ) : (
                <>
                  Save Changes
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Sticky Bottom Save Bar */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-[#E9ECEF] z-20 py-3">
          <div className="max-w-2xl mx-auto px-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-20 h-1.5 bg-[#E9ECEF] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${completion === 100 ? 'bg-[#51CF66]' : 'bg-[#212529]'}`}
                    style={{ width: `${completion}%` }}
                  />
                </div>
                <span className="text-xs text-[#ADB5BD] tabular-nums">{completion}%</span>
              </div>
              {hasChanges && (
                <span className="text-xs text-[#FF6B6B] font-medium flex items-center gap-1">
                  <Clock size={12} /> Unsaved changes
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2.5 text-[#ADB5BD] hover:text-[#FF6B6B] rounded-xl transition-colors"
                title="Delete property"
              >
                <Trash2 size={16} />
              </button>
              <button
                type="button"
                onClick={() => formRef.current?.requestSubmit()}
                disabled={saving}
                className="flex items-center gap-2 bg-[#212529] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-black transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-[#FF6B6B]/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-[#FF6B6B]" />
            </div>
            <h3 className="text-lg font-bold text-[#212529] text-center mb-2">Delete this property?</h3>
            <p className="text-sm text-[#495057] text-center mb-6">
              This will permanently remove the listing, images, reviews, and analytics. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 border-2 border-[#E9ECEF] text-[#212529] rounded-xl text-sm font-semibold hover:border-[#212529] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-[#FF6B6B] text-white rounded-xl text-sm font-semibold hover:bg-red-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
