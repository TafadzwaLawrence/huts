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
  GraduationCap,
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
    { value: 'rented', label: 'Rented', description: 'Marked as taken', icon: CheckCircle2, color: 'text-[#212529]' },
    { value: 'inactive', label: 'Inactive', description: 'Temporarily hidden', icon: XCircle, color: 'text-[#FF6B6B]' },
  ],
  sale: [
    { value: 'active', label: 'Active', description: 'Visible to buyers', icon: Eye, color: 'text-[#51CF66]' },
    { value: 'draft', label: 'Draft', description: 'Hidden from search', icon: EyeOff, color: 'text-[#ADB5BD]' },
    { value: 'sold', label: 'Sold', description: 'Marked as sold', icon: CheckCircle2, color: 'text-[#212529]' },
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
  { value: 'student', label: 'Student Housing', icon: GraduationCap },
] as const

const SECTIONS = [
  { id: 'status', label: 'Status' },
  { id: 'type', label: 'Type' },
  { id: 'basic', label: 'Basic' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'specs', label: 'Specs' },
  { id: 'location', label: 'Location' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'student', label: 'Student' },
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
    status: 'active' as string,
    // Sale-specific fields
    yearBuilt: '',
    lotSize: '',
    parkingSpaces: '',
    garageSpaces: '',
    propertyTax: '',
    hoaFee: '',
    // Student housing-specific fields
    furnished: false,
    sharedRooms: false,
    utilitiesIncluded: false,
    nearbyUniversities: '',
    studentLeaseTerms: '',
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
      
      // Parse nearby universities from JSON array to comma-separated string
      const nearbyUniversitiesString = property.nearby_universities && Array.isArray(property.nearby_universities)
        ? property.nearby_universities.map((uni: any) => uni.name || uni).join(', ')
        : ''
      
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
        furnished: property.furnished || false,
        sharedRooms: property.shared_rooms || false,
        utilitiesIncluded: property.utilities_included || false,
        nearbyUniversities: nearbyUniversitiesString,
        studentLeaseTerms: property.student_lease_terms || '',
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

  const toggleStudentField = (field: 'furnished' | 'sharedRooms' | 'utilitiesIncluded') => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field],
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
    if (formData.description.length > 2000) newErrors.description = 'Description must be 2000 characters or less'
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

      // Parse nearby universities
      const nearbyUniversities = formData.nearbyUniversities
        .split(',')
        .map(uni => uni.trim())
        .filter(uni => uni.length > 0)
        .map(name => ({ name }))

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
          parking_spaces: formData.parkingSpaces ? parseInt(formData.parkingSpaces) : null,
          garage_spaces: formData.garageSpaces ? parseInt(formData.garageSpaces) : null,
          property_tax_annual: formData.listingType === 'sale' && formData.propertyTax ? Math.round(parseFloat(formData.propertyTax) * 100) : null,
          hoa_fee_monthly: formData.listingType === 'sale' && formData.hoaFee ? Math.round(parseFloat(formData.hoaFee) * 100) : null,
          // Student housing fields
          furnished: formData.propertyType === 'student' ? formData.furnished : null,
          shared_rooms: formData.propertyType === 'student' ? formData.sharedRooms : null,
          utilities_included: formData.propertyType === 'student' ? formData.utilitiesIncluded : null,
          nearby_universities: formData.propertyType === 'student' && nearbyUniversities.length > 0 ? nearbyUniversities : null,
          student_lease_terms: formData.propertyType === 'student' ? formData.studentLeaseTerms || null : null,
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
      {/* Sticky Header - Enhanced */}
      <div className="bg-white/98 backdrop-blur-sm border-b-2 border-[#E9ECEF] sticky top-0 z-20 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link
              href="/dashboard/my-properties"
              className="flex items-center gap-2 text-[#495057] hover:text-[#212529] transition-colors text-sm font-semibold group"
            >
              <div className="p-1 rounded-lg group-hover:bg-[#F8F9FA] transition-colors">
                <ArrowLeft size={16} />
              </div>
              <span>My Properties</span>
            </Link>
            <div className="flex items-center gap-3">
              {propertySlug && (
                <Link
                  href={`/property/${propertySlug}`}
                  target="_blank"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#212529] hover:bg-[#F8F9FA] font-semibold rounded-lg border border-[#E9ECEF] transition-all hover:border-[#212529]"
                >
                  <Eye size={13} />
                  <span className="hidden sm:inline">Preview</span>
                </Link>
              )}
              {hasChanges && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FF6B6B]/10 text-[#FF6B6B] rounded-lg text-xs font-semibold">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] animate-pulse" />
                  Unsaved
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar - Enhanced */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-base font-bold text-[#212529]">Edit Listing</h1>
              <span className={`text-sm tabular-nums font-bold ${completion === 100 ? 'text-[#51CF66]' : 'text-[#212529]'}`}>
                {completion}% Complete
              </span>
            </div>
            <div className="relative w-full h-2 bg-[#E9ECEF] rounded-full overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out ${
                  completion === 100 ? 'bg-[#51CF66]' : 'bg-[#212529]'
                }`}
                style={{ width: `${completion}%` }}
              />
              {completion === 100 && (
                <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-r from-transparent to-white/30 animate-pulse" />
              )}
            </div>
          </div>

          {/* Section Navigation - Enhanced */}
          <div className="relative">
            <div className="flex gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {SECTIONS.filter(section => {
                if (section.id === 'student') {
                  return formData.propertyType === 'student'
                }
                return true
              }).map(section => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className={`relative flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-lg whitespace-nowrap transition-all font-semibold ${
                    activeSection === section.id
                      ? 'bg-[#212529] text-white shadow-md shadow-black/10'
                      : 'text-[#495057] hover:text-[#212529] hover:bg-[#F8F9FA] border border-transparent hover:border-[#E9ECEF]'
                  }`}
                >
                  {section.label}
                  {activeSection === section.id && (
                    <div className="w-1 h-1 rounded-full bg-white" />
                  )}
                </button>
              ))}
            </div>
            <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden" />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <form ref={formRef} onSubmit={handleSubmit}>

          {/* ===== STATUS ===== */}
          <section id="status" className="mb-12 scroll-mt-24">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#212529] mb-1.5">Listing Status</h2>
              <p className="text-sm text-[#495057]">
                Control your listing visibility. Active listings appear in search results. 
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                    className={`relative flex flex-col items-center gap-2 px-4 py-5 rounded-xl border-2 transition-all text-center group ${
                      isActive
                        ? 'border-[#212529] bg-[#212529] text-white shadow-lg shadow-black/5'
                        : 'border-[#E9ECEF] text-[#495057] hover:border-[#212529] bg-white hover:shadow-md'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-white/10' : 'bg-[#F8F9FA] group-hover:bg-[#E9ECEF]'} transition-colors`}>
                      <Icon size={20} className={isActive ? 'text-white' : opt.color} />
                    </div>
                    <div>
                      <span className="text-sm font-bold block">{opt.label}</span>
                      <span className={`text-[10px] block mt-0.5 ${isActive ? 'text-white/70' : 'text-[#ADB5BD]'}`}>
                        {opt.description}
                      </span>
                    </div>
                    {isActive && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#51CF66] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          <div className="h-px bg-gradient-to-r from-transparent via-[#E9ECEF] to-transparent mb-12" />

          {/* ===== LISTING TYPE ===== */}
          <section id="type" className="mb-12 scroll-mt-24">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#212529] mb-1.5">Listing Type</h2>
              <p className="text-sm text-[#495057]">
                Select whether this property is for rent or sale. This determines pricing fields.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, listingType: 'rent' }))
                  setHasChanges(true)
                }}
                className={`relative p-6 rounded-xl border-2 text-left transition-all group ${
                  formData.listingType === 'rent'
                    ? 'border-[#212529] bg-[#212529] text-white shadow-lg shadow-black/5'
                    : 'border-[#E9ECEF] bg-white hover:border-[#212529] hover:shadow-md'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                  formData.listingType === 'rent' ? 'bg-white/10' : 'bg-[#F8F9FA] group-hover:bg-[#E9ECEF]'
                } transition-colors`}>
                  <Home size={24} className={formData.listingType === 'rent' ? 'text-white' : 'text-[#212529]'} />
                </div>
                <p className="font-bold text-base mb-1">For Rent</p>
                <p className={`text-sm ${formData.listingType === 'rent' ? 'text-white/70' : 'text-[#ADB5BD]'}`}>
                  Generate monthly rental income
                </p>
                {formData.listingType === 'rent' && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#51CF66] rounded-full flex items-center justify-center border-2 border-white shadow-md">
                    <Check size={14} className="text-white" />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, listingType: 'sale' }))
                  setHasChanges(true)
                }}
                className={`relative p-6 rounded-xl border-2 text-left transition-all group ${
                  formData.listingType === 'sale'
                    ? 'border-[#212529] bg-[#212529] text-white shadow-lg shadow-black/5'
                    : 'border-[#E9ECEF] bg-white hover:border-[#212529] hover:shadow-md'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                  formData.listingType === 'sale' ? 'bg-white/10' : 'bg-[#F8F9FA] group-hover:bg-[#E9ECEF]'
                } transition-colors`}>
                  <DollarSign size={24} className={formData.listingType === 'sale' ? 'text-white' : 'text-[#212529]'} />
                </div>
                <p className="font-bold text-base mb-1">For Sale</p>
                <p className={`text-sm ${formData.listingType === 'sale' ? 'text-white/70' : 'text-[#ADB5BD]'}`}>
                  One-time purchase listing
                </p>
                {formData.listingType === 'sale' && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#51CF66] rounded-full flex items-center justify-center border-2 border-white shadow-md">
                    <Check size={14} className="text-white" />
                  </div>
                )}
              </button>
            </div>
            {formData.listingType !== originalListingTypeRef.current && (
              <div className="mt-4 p-4 bg-[#F8F9FA] rounded-xl border border-[#E9ECEF]">
                <p className="text-sm text-[#495057] flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>
                    <strong className="text-[#212529]">Note:</strong> Switching from {originalListingTypeRef.current === 'rent' ? 'rent to sale' : 'sale to rent'} will adjust pricing fields when you save.
                  </span>
                </p>
              </div>
            )}
          </section>

          <div className="h-px bg-gradient-to-r from-transparent via-[#E9ECEF] to-transparent mb-12" />

          {/* ===== BASIC INFORMATION ===== */}
          <section id="basic" className="mb-12 scroll-mt-24">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#212529] mb-1.5">Basic Information</h2>
              <p className="text-sm text-[#495057]">
                Provide a clear title and description to help renters/buyers find your property.
              </p>
            </div>

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
                  rows={8}
                  maxLength={2000}
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3.5 border-2 rounded-xl text-[#212529] bg-white placeholder:text-[#ADB5BD] focus:outline-none transition-colors resize-none ${
                    formData.description.length > 2000
                      ? 'border-[#FF6B6B]'
                      : formData.description.length > 1800
                      ? 'border-amber-500'
                      : 'border-[#E9ECEF] focus:border-[#212529]'
                  }`}
                  placeholder="Describe the property, its features, nearby amenities..."
                />
                <div className="flex justify-between mt-2">
                  {formData.description.length > 2000 ? (
                    <p className="text-xs text-[#FF6B6B] flex items-center gap-1">
                      <AlertCircle size={12} /> Description is too long
                    </p>
                  ) : formData.description.length > 1800 ? (
                    <p className="text-xs text-[#495057] flex items-center gap-1">
                      <AlertCircle size={12} /> Approaching character limit
                    </p>
                  ) : (
                    <p className="text-xs text-[#ADB5BD]">Optional but recommended</p>
                  )}
                  <p className={`text-xs tabular-nums ${
                    formData.description.length > 2000
                      ? 'text-[#FF6B6B] font-semibold'
                      : formData.description.length > 1800
                      ? 'text-[#495057] font-medium'
                      : 'text-[#ADB5BD]'
                  }`}>
                    {formData.description.length}/2000
                  </p>
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

          <div className="h-px bg-gradient-to-r from-transparent via-[#E9ECEF] to-transparent mb-12" />

          {/* ===== PRICING ===== */}
          <section id="pricing" className="mb-12 scroll-mt-24">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#212529] mb-1.5">Pricing</h2>
              <p className="text-sm text-[#495057]">
                Set your {formData.listingType === 'rent' ? 'monthly rent and deposit' : 'sale price and associated costs'}.
              </p>
            </div>

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

          <div className="h-px bg-gradient-to-r from-transparent via-[#E9ECEF] to-transparent mb-12" />

          {/* ===== PROPERTY DETAILS ===== */}
          <section id="specs" className="mb-12 scroll-mt-24">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#212529] mb-1.5">Property Specifications</h2>
              <p className="text-sm text-[#495057]">
                Add details about bedrooms, bathrooms, size, and other specifications.
              </p>
            </div>

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

          <div className="h-px bg-gradient-to-r from-transparent via-[#E9ECEF] to-transparent mb-12" />

          {/* ===== LOCATION ===== */}
          <section id="location" className="mb-12 scroll-mt-24">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#212529] mb-1.5">Location</h2>
              <p className="text-sm text-[#495057]">
                Provide the property address and pin the exact location on the map.
              </p>
            </div>

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

          <div className="h-px bg-gradient-to-r from-transparent via-[#E9ECEF] to-transparent mb-12" />

          {/* ===== STUDENT HOUSING ===== */}
          {formData.propertyType === 'student' && (
            <>
              <section id="student" className="mb-12 scroll-mt-24">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#212529] mb-1.5">Student Housing Details</h2>
                  <p className="text-sm text-[#495057]">
                    Additional information specific to student housing rentals.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Toggle Options */}
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => toggleStudentField('furnished')}
                      className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all ${
                        formData.furnished
                          ? 'border-[#212529] bg-[#212529] text-white'
                          : 'border-[#E9ECEF] bg-white text-[#212529] hover:border-[#495057]'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <GraduationCap size={18} />
                        <span className="font-semibold text-sm">Furnished</span>
                      </span>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        formData.furnished ? 'border-white bg-white' : 'border-[#ADB5BD]'
                      }`}>
                        {formData.furnished && <Check size={14} className="text-[#212529]" />}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleStudentField('sharedRooms')}
                      className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all ${
                        formData.sharedRooms
                          ? 'border-[#212529] bg-[#212529] text-white'
                          : 'border-[#E9ECEF] bg-white text-[#212529] hover:border-[#495057]'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Bed size={18} />
                        <span className="font-semibold text-sm">Shared Rooms Available</span>
                      </span>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        formData.sharedRooms ? 'border-white bg-white' : 'border-[#ADB5BD]'
                      }`}>
                        {formData.sharedRooms && <Check size={14} className="text-[#212529]" />}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleStudentField('utilitiesIncluded')}
                      className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all ${
                        formData.utilitiesIncluded
                          ? 'border-[#212529] bg-[#212529] text-white'
                          : 'border-[#E9ECEF] bg-white text-[#212529] hover:border-[#495057]'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Check size={18} />
                        <span className="font-semibold text-sm">Utilities Included in Rent</span>
                      </span>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        formData.utilitiesIncluded ? 'border-white bg-white' : 'border-[#ADB5BD]'
                      }`}>
                        {formData.utilitiesIncluded && <Check size={14} className="text-[#212529]" />}
                      </div>
                    </button>
                  </div>

                  {/* Nearby Universities */}
                  <div>
                    <label htmlFor="nearbyUniversities" className="block text-sm font-semibold text-[#212529] mb-2">
                      Nearby Universities
                    </label>
                    <input
                      id="nearbyUniversities"
                      name="nearbyUniversities"
                      type="text"
                      value={formData.nearbyUniversities}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 border-2 border-[#E9ECEF] rounded-xl text-[#212529] bg-white placeholder:text-[#ADB5BD] focus:outline-none focus:border-[#212529] transition-colors"
                      placeholder="e.g., University of Zimbabwe, NUST, Midlands State University"
                    />
                    <p className="mt-2 text-xs text-[#ADB5BD]">Separate multiple universities with commas</p>
                  </div>

                  {/* Student Lease Terms */}
                  <div>
                    <label htmlFor="studentLeaseTerms" className="block text-sm font-semibold text-[#212529] mb-2">
                      Student Lease Terms
                    </label>
                    <textarea
                      id="studentLeaseTerms"
                      name="studentLeaseTerms"
                      rows={3}
                      value={formData.studentLeaseTerms}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 border-2 border-[#E9ECEF] rounded-xl text-[#212529] bg-white placeholder:text-[#ADB5BD] focus:outline-none focus:border-[#212529] transition-colors resize-none"
                      placeholder="e.g., Academic year lease (September - June), Summer subletting allowed, Parental guarantee required"
                    />
                    <p className="mt-2 text-xs text-[#ADB5BD]">Special lease conditions for student tenants</p>
                  </div>
                </div>
              </section>

              <div className="h-px bg-gradient-to-r from-transparent via-[#E9ECEF] to-transparent mb-12" />
            </>
          )}

          {/* ===== AMENITIES ===== */}
          <section id="amenities" className="mb-12 scroll-mt-24">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#212529] mb-1.5">Amenities</h2>
              <p className="text-sm text-[#495057]">
                Select all amenities available at this property.
              </p>
            </div>

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

          <div className="h-px bg-gradient-to-r from-transparent via-[#E9ECEF] to-transparent mb-12" />

          {/* ===== PHOTOS ===== */}
          <section id="photos" className="mb-12 scroll-mt-24">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1.5">
                <h2 className="text-lg font-bold text-[#212529]">Photos</h2>
                <span className="text-sm text-[#495057] font-bold tabular-nums bg-[#F8F9FA] px-3 py-1 rounded-lg">{totalImageCount}/10</span>
              </div>
              <p className="text-sm text-[#495057]">
                Add up to 10 high-quality photos. Click the star to set a cover photo.
              </p>
            </div>

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

          <div className="h-px bg-gradient-to-r from-transparent via-[#E9ECEF] to-transparent mb-12" />

          {/* ===== AVAILABILITY ===== */}
          <section id="availability" className="mb-12 scroll-mt-24">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#212529] mb-1.5">Availability</h2>
              <p className="text-sm text-[#495057]">
                Set when the property will be available {formData.listingType === 'rent' ? 'for move-in' : 'for sale'}.
              </p>
            </div>

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
          <div ref={submitAreaRef} className="sticky bottom-0 bg-white pt-8 pb-6 border-t-2 border-[#E9ECEF] mt-12">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center justify-center gap-2 px-5 py-3.5 border-2 border-[#FF6B6B] text-[#FF6B6B] rounded-xl text-sm font-semibold hover:bg-[#FF6B6B] hover:text-white transition-all group"
              >
                <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                Delete
              </button>
              <div className="flex-1 flex gap-3">
                <Link
                  href="/dashboard/my-properties"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-[#E9ECEF] text-[#212529] rounded-xl text-sm font-semibold hover:border-[#212529] hover:shadow-md transition-all"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving || !hasChanges}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#212529] text-white px-6 py-3.5 rounded-xl text-sm font-bold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg disabled:shadow-none group"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Save Changes
                      <span className="hidden lg:inline text-xs opacity-70 ml-1">(Ctrl+S)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            {hasChanges && (
              <p className="mt-3 text-xs text-center text-[#495057] flex items-center justify-center gap-1.5">
                <AlertCircle size={12} />
                You have unsaved changes. Press <kbd className="px-1.5 py-0.5 bg-[#F8F9FA] border border-[#E9ECEF] rounded text-[10px] font-mono">Ctrl+S</kbd> to save quickly.
              </p>
            )}
          </div>
        </form>
      </div>

      {/* Sticky Bottom Save Bar - Appears when scrolling */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-sm border-t-2 border-[#E9ECEF] z-20 py-4 shadow-xl">
          <div className="max-w-2xl mx-auto px-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2.5">
                <div className="w-24 h-2 bg-[#E9ECEF] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${completion === 100 ? 'bg-[#51CF66]' : 'bg-[#212529]'}`}
                    style={{ width: `${completion}%` }}
                  />
                </div>
                <span className={`text-xs tabular-nums font-bold ${completion === 100 ? 'text-[#51CF66]' : 'text-[#212529]'}`}>
                  {completion}%
                </span>
              </div>
              {hasChanges && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FF6B6B]/10 text-[#FF6B6B] rounded-lg text-xs font-semibold">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] animate-pulse" />
                  <span className="hidden sm:inline">Unsaved changes</span>
                  <span className="sm:hidden">Unsaved</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2.5 text-[#ADB5BD] hover:text-[#FF6B6B] hover:bg-[#FF6B6B]/5 rounded-lg transition-all"
                title="Delete property"
              >
                <Trash2 size={16} />
              </button>
              <button
                type="button"
                onClick={() => formRef.current?.requestSubmit()}
                disabled={saving || !hasChanges}
                className="flex items-center gap-2 bg-[#212529] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span className="hidden sm:inline">Saving...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-2xl bg-[#FF6B6B]/10 flex items-center justify-center mx-auto mb-5">
              <Trash2 size={28} className="text-[#FF6B6B]" />
            </div>
            <h3 className="text-xl font-bold text-[#212529] text-center mb-3">Delete this property?</h3>
            <p className="text-sm text-[#495057] text-center mb-8 leading-relaxed">
              This will permanently remove the listing, all images, reviews, and analytics data. <strong className="text-[#212529]">This action cannot be undone.</strong>
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-5 py-3.5 border-2 border-[#E9ECEF] text-[#212529] rounded-xl text-sm font-semibold hover:border-[#212529] hover:shadow-md transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-5 py-3.5 bg-[#FF6B6B] text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete Forever
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
