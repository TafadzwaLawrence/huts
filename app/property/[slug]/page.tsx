import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient, createStaticClient } from '@/lib/supabase/server'
import { 
  MapPin, Bed, Bath, Square, ChevronLeft, Phone, Mail, 
  Calendar, Clock, Check, Home, Building2, Car,
  Wifi, PawPrint, Dumbbell, Waves, Shield,
  ThermometerSun, Trees, Box
} from 'lucide-react'
import { formatPrice, formatSalePrice } from '@/lib/utils'
import PropertyGallery from '@/components/property/PropertyGallery'
import PropertyActions from '@/components/property/PropertyActions'
import InquiryForm from '@/components/property/InquiryForm'

// ISR - Revalidate every 60 seconds for fresh data
export const revalidate = 60

const AMENITY_ICONS: Record<string, any> = {
  'WiFi': Wifi,
  'Parking': Car,
  'Pool': Waves,
  'Gym': Dumbbell,
  'Pet-friendly': PawPrint,
  'Security': Shield,
  'Air conditioning': ThermometerSun,
  'Heating': ThermometerSun,
  'Garden': Trees,
  'Storage': Box,
}

// Generate static paths for popular properties
export async function generateStaticParams() {
  const supabase = createStaticClient()
  
  // Pre-render top 50 most viewed properties
  const { data: properties } = await supabase
    .from('properties')
    .select('slug, id')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(50)

  return (properties || []).map((property) => ({
    slug: property.slug || property.id,
  }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createStaticClient()
  
  const { data: property } = await supabase
    .from('properties')
    .select('title, description, city, price')
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .single()

  if (!property) {
    return { title: 'Property Not Found | Huts' }
  }

  return {
    title: `${property.title} | Huts`,
    description: property.description?.slice(0, 160) || `${property.title} in ${property.city}. ${formatPrice(property.price)}/month on Huts.`,
  }
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  
  // First try by slug
  let { data: property, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_images(id, url, is_primary, order, alt_text),
      profiles:user_id(id, name, avatar_url, phone, email)
    `)
    .eq('slug', slug)
    .single()

  // If not found by slug, try by id
  if (!property) {
    const result = await supabase
      .from('properties')
      .select(`
        *,
        property_images(id, url, is_primary, order, alt_text),
        profiles:user_id(id, name, avatar_url, phone, email)
      `)
      .eq('id', slug)
      .single()
    property = result.data
    error = result.error
  }

  if (error || !property) {
    notFound()
  }

  const images = property.property_images || []
  const isRental = property.listing_type === 'rent' || (!property.listing_type && property.price)
  const isSale = property.listing_type === 'sale' || property.sale_price

  // Build clean location string (avoid duplicates)
  const locationParts: string[] = []
  if (property.neighborhood && property.neighborhood !== property.city) {
    locationParts.push(property.neighborhood)
  }
  locationParts.push(property.city)
  if (property.state && property.state !== property.city && !property.state.toLowerCase().includes(property.city.toLowerCase())) {
    locationParts.push(property.state)
  }
  const locationString = locationParts.join(', ')

  // Capitalize property type
  const propertyTypeDisplay = property.property_type
    ? property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)
    : 'Property'

  return (
    <div className="min-h-screen bg-white">
      {/* Image Gallery */}
      <div className="relative">
        <PropertyGallery images={images} title={property.title} />

        {/* Back Button */}
        <Link
          href="/search"
          className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-lg hover:bg-[#F8F9FA] transition-colors z-10"
        >
          <ChevronLeft size={24} className="text-black" />
        </Link>

        {/* Actions */}
        <div className="absolute top-4 right-4 z-10">
          <PropertyActions 
            propertyId={property.id} 
            propertyTitle={property.title}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header with badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-[#212529] text-white px-3 py-1.5 rounded-full text-sm font-medium">
                <Building2 size={14} />
                {propertyTypeDisplay}
              </span>
              {isSale && (
                <span className="bg-[#51CF66] text-white px-3 py-1.5 rounded-full text-sm font-medium">
                  For Sale
                </span>
              )}
              {isRental && !isSale && (
                <span className="bg-[#495057] text-white px-3 py-1.5 rounded-full text-sm font-medium">
                  For Rent
                </span>
              )}
            </div>

            {/* Title & Price */}
            <div className="mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-[#212529] mb-2">{property.title}</h1>
              <div className="flex items-center gap-2 text-[#495057]">
                <MapPin size={18} className="flex-shrink-0" />
                <span>{locationString}</span>
              </div>
            </div>

            {/* Price Card */}
            <div className="bg-[#212529] text-white rounded-xl p-6 mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-bold">
                  {isSale ? formatSalePrice(property.sale_price) : formatPrice(property.price)}
                </span>
                {isRental && !isSale && <span className="text-lg opacity-80">/month</span>}
              </div>
              {property.deposit && (
                <p className="text-sm opacity-80 mt-2">
                  Security deposit: {formatPrice(property.deposit)}
                </p>
              )}
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 border-2 border-[#E9ECEF] rounded-xl hover:border-[#212529] transition-colors">
                <Bed className="mx-auto text-[#212529] mb-2" size={28} />
                <p className="text-2xl font-bold text-[#212529]">{property.beds}</p>
                <p className="text-sm text-[#495057]">{property.beds === 1 ? 'Bedroom' : 'Bedrooms'}</p>
              </div>
              <div className="text-center p-4 border-2 border-[#E9ECEF] rounded-xl hover:border-[#212529] transition-colors">
                <Bath className="mx-auto text-[#212529] mb-2" size={28} />
                <p className="text-2xl font-bold text-[#212529]">{property.baths}</p>
                <p className="text-sm text-[#495057]">{property.baths === 1 ? 'Bathroom' : 'Bathrooms'}</p>
              </div>
              {property.sqft ? (
                <div className="text-center p-4 border-2 border-[#E9ECEF] rounded-xl hover:border-[#212529] transition-colors">
                  <Square className="mx-auto text-[#212529] mb-2" size={28} />
                  <p className="text-2xl font-bold text-[#212529]">{property.sqft.toLocaleString()}</p>
                  <p className="text-sm text-[#495057]">Sq Ft</p>
                </div>
              ) : (
                <div className="text-center p-4 border-2 border-[#E9ECEF] rounded-xl hover:border-[#212529] transition-colors">
                  <Car className="mx-auto text-[#212529] mb-2" size={28} />
                  <p className="text-2xl font-bold text-[#212529]">{property.parking_spaces || 0}</p>
                  <p className="text-sm text-[#495057]">Parking</p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[#212529] mb-4 flex items-center gap-2">
                <Home size={20} className="text-[#212529]" />
                About this property
              </h2>
              {property.description ? (
                <p className="text-[#495057] whitespace-pre-line leading-relaxed">{property.description}</p>
              ) : (
                <div className="p-6 bg-[#F8F9FA] rounded-xl text-center">
                  <p className="text-[#495057] italic">Contact the landlord for more details about this property.</p>
                </div>
              )}
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-[#212529] mb-4 flex items-center gap-2">
                  <Check size={20} className="text-[#212529]" />
                  Amenities
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity: string) => {
                    const Icon = AMENITY_ICONS[amenity] || Check
                    return (
                      <div key={amenity} className="flex items-center gap-3 p-3 bg-[#F8F9FA] rounded-lg border border-[#E9ECEF]">
                        <div className="p-2 bg-white rounded-full">
                          <Icon size={18} className="text-[#212529]" />
                        </div>
                        <span className="text-[#212529] font-medium">{amenity}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Availability */}
            {(property.available_from || property.lease_term) && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-[#212529] mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-[#212529]" />
                  Availability
                </h2>
                <div className="flex flex-wrap gap-3">
                  {property.available_from && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-[#51CF66]/10 border border-[#51CF66]/30 rounded-lg">
                      <Calendar size={20} className="text-[#51CF66]" />
                      <span className="text-[#212529] font-medium">
                        Available {new Date(property.available_from).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                  {property.lease_term && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg">
                      <Clock size={20} className="text-[#495057]" />
                      <span className="text-[#212529] font-medium">{property.lease_term} lease</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Contact Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border-2 border-[#E9ECEF] rounded-2xl overflow-hidden shadow-xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#212529] to-[#495057] text-white px-6 py-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Mail size={16} />
                  </div>
                  <p className="font-bold text-lg">Get in Touch</p>
                </div>
                <p className="text-sm opacity-80 ml-10">Typically responds within 24 hours</p>
              </div>

              <div className="p-6">
                {/* Landlord Info */}
                {property.profiles && (
                  <div className="flex items-center gap-4 pb-5 border-b border-[#E9ECEF] mb-5">
                    <div className="relative">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-[#E9ECEF] to-[#DEE2E6] border-2 border-[#212529] flex items-center justify-center flex-shrink-0">
                        {property.profiles.avatar_url ? (
                          <Image
                            src={property.profiles.avatar_url}
                            alt={property.profiles.name || 'Landlord'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-[#495057]">
                            {property.profiles.name?.[0]?.toUpperCase() || 'L'}
                          </span>
                        )}
                      </div>
                      {/* Online indicator */}
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#51CF66] rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#212529] text-lg truncate">{property.profiles.name || 'Property Owner'}</p>
                      <div className="flex items-center gap-2 text-sm text-[#495057]">
                        <span>Property Owner</span>
                        <span className="inline-flex items-center gap-1 bg-[#51CF66]/10 text-[#51CF66] px-2 py-0.5 rounded-full text-xs font-medium">
                          <Check size={10} />
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Buttons */}
                <div className="space-y-3 mb-5">
                  {property.profiles?.phone && (
                    <a
                      href={`tel:${property.profiles.phone}`}
                      className="group flex items-center justify-center gap-2 w-full py-3.5 bg-[#212529] text-white rounded-xl font-semibold hover:bg-black hover:-translate-y-0.5 hover:shadow-lg transition-all"
                    >
                      <Phone size={18} className="group-hover:animate-pulse" />
                      Call Now
                    </a>
                  )}

                  <a
                    href={`mailto:${property.profiles?.email}?subject=Inquiry about ${property.title}`}
                    className="flex items-center justify-center gap-2 w-full py-3.5 border-2 border-[#212529] text-[#212529] rounded-xl font-semibold hover:bg-[#212529] hover:text-white transition-all"
                  >
                    <Mail size={18} />
                    Send Email
                  </a>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E9ECEF]"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-white text-[#ADB5BD] text-sm">or send a quick message</span>
                  </div>
                </div>

                {/* Inquiry Form - Client Component */}
                <Suspense fallback={<div className="h-48 bg-[#F8F9FA] rounded-lg animate-pulse" />}>
                  <InquiryForm propertyId={property.id} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
