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
import PropertyStructuredData from '@/components/property/PropertyStructuredData'
import BreadcrumbStructuredData from '@/components/property/BreadcrumbStructuredData'

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
    .eq('verification_status', 'approved')
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
  
  try {
    // First try by slug
    let { data: property } = await supabase
      .from('properties')
      .select('title, description, city, price, sale_price, listing_type, beds, baths, property_type, property_images(url), created_at, updated_at, published_at')
      .eq('slug', slug)
      .single()

    // If not found by slug, try by id
    if (!property) {
      const result = await supabase
        .from('properties')
        .select('title, description, city, price, sale_price, listing_type, beds, baths, property_type, property_images(url), created_at, updated_at, published_at')
        .eq('id', slug)
        .single()
      property = result.data
    }

    if (!property) {
      return { 
        title: 'Property Not Found',
        description: 'The property you are looking for does not exist.'
      }
    }

    const isRental = property.listing_type === 'rent' || (!property.listing_type && property.price)
    const isSale = property.listing_type === 'sale' || property.sale_price
    const priceDisplay = isSale 
      ? formatSalePrice(property.sale_price) 
      : formatPrice(property.price) + '/month'
    const listingType = isSale ? 'For Sale' : 'For Rent'

    // Build compelling description for social sharing
    const descriptionParts = [
      `${listingType}: ${property.beds} bed, ${property.baths} bath ${property.property_type || 'property'} in ${property.city}, Zimbabwe.`,
      priceDisplay + '.',
    ]
    if (property.description) {
      descriptionParts.push(property.description.slice(0, 120).replace(/\s+/g, ' ').trim() + (property.description.length > 120 ? '...' : ''))
    }
    const description = descriptionParts.join(' ')

    // Shorter description for Twitter (200 char limit)
    const twitterDescription = `${listingType}: ${property.beds} bed, ${property.baths} bath in ${property.city}. ${priceDisplay}`

    // Property type for better categorization
    const propertyTypeDisplay = property.property_type
      ? property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)
      : 'Property'

    return {
      title: `${property.title}`,
      description,
      openGraph: {
        title: `${property.title} | Huts`,
        description,
        type: 'article',
        url: `https://www.huts.co.zw/property/${slug}`,
        siteName: 'Huts',
        locale: 'en_ZW',
        images: [
          {
            url: `https://www.huts.co.zw/property/${slug}/opengraph-image`,
            width: 1200,
            height: 630,
            alt: `${property.title} - ${property.city}, Zimbabwe`,
          },
        ],
        // Article-specific tags for Facebook
        publishedTime: property.published_at || property.created_at,
        modifiedTime: property.updated_at,
        authors: ['Huts Zimbabwe'],
        section: isSale ? 'Properties for Sale' : 'Properties for Rent',
        tags: [
          property.city,
          `${property.beds} bedroom`,
          propertyTypeDisplay,
          isSale ? 'For Sale' : 'For Rent',
          'Zimbabwe Real Estate',
          'Property Listing',
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${property.title} | Huts`,
        description: twitterDescription,
        site: '@huts',
        creator: '@huts',
        images: [`https://www.huts.co.zw/property/${slug}/opengraph-image`],
      },
      // Additional metadata for other platforms
      other: {
        // Pinterest-specific
        'pinterest:description': description,
        'pinterest:media': `https://www.huts.co.zw/property/${slug}/opengraph-image`,
        // WhatsApp uses OG tags but we can add extra context
        'al:android:url': `huts://property/${slug}`, // Deep link for future app
        'al:ios:url': `huts://property/${slug}`,
      },
      alternates: {
        canonical: `https://www.huts.co.zw/property/${slug}`,
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return { 
      title: 'Property Not Found | Huts',
      description: 'The property you are looking for does not exist.'
    }
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

  // Block public access to unverified properties (owners can still view their own)
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === property.user_id
  if (property.verification_status && property.verification_status !== 'approved' && !isOwner) {
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
      {/* JSON-LD Structured Data for SEO */}
      <PropertyStructuredData property={property} slug={slug} />
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: 'https://www.huts.co.zw' },
          { name: 'Search', url: 'https://www.huts.co.zw/search' },
          {
            name: property.city,
            url: `https://www.huts.co.zw/search?city=${encodeURIComponent(property.city)}`,
          },
          {
            name: property.title,
            url: `https://www.huts.co.zw/property/${slug}`,
          },
        ]}
      />

      {/* Image Gallery */}
      <div className="relative">
        <PropertyGallery images={images} title={property.title} />

        {/* Back Button */}
        <Link
          href="/search"
          className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm p-2.5 rounded-xl shadow-lg hover:bg-white hover:scale-105 transition-all z-10 border border-[#E9ECEF]"
        >
          <ChevronLeft size={22} className="text-[#212529]" />
        </Link>

        {/* Actions */}
        <div className="absolute top-4 right-4 z-10">
          <PropertyActions 
            propertyId={property.id} 
            propertyTitle={property.title}
            propertyDescription={property.description || `${property.beds} bed, ${property.baths} bath ${propertyTypeDisplay} in ${property.city}, Zimbabwe`}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 bg-[#212529] text-white px-3 py-1 rounded-lg text-xs font-semibold tracking-wide uppercase">
                  {propertyTypeDisplay}
                </span>
                {isSale && (
                  <span className="bg-[#212529] text-white px-3 py-1 rounded-lg text-xs font-semibold tracking-wide uppercase">
                    For Sale
                  </span>
                )}
                {isRental && !isSale && (
                  <span className="bg-[#212529] text-white px-3 py-1 rounded-lg text-xs font-semibold tracking-wide uppercase">
                    For Rent
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-[#212529] tracking-tight mb-3">{property.title}</h1>
              
              {/* Location */}
              <div className="flex items-center gap-2 text-[#495057]">
                <MapPin size={16} className="flex-shrink-0 text-[#ADB5BD]" />
                <span className="text-base">{locationString}</span>
              </div>
            </div>

            {/* Price + Key Stats Row */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              {/* Price */}
              <div className="flex-1 bg-[#212529] rounded-2xl p-6">
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">
                  {isSale ? 'Asking Price' : 'Monthly Rent'}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    {isSale ? formatSalePrice(property.sale_price) : formatPrice(property.price)}
                  </span>
                  {isRental && !isSale && <span className="text-sm text-white/50 font-medium">/month</span>}
                </div>
                {property.deposit && (
                  <p className="text-sm text-white/50 mt-2">
                    Deposit: {formatPrice(property.deposit)}
                  </p>
                )}
              </div>

              {/* Quick Stats */}
              <div className="flex sm:flex-col gap-3 sm:gap-2">
                <div className="flex-1 flex items-center gap-3 px-5 py-3 border-2 border-[#E9ECEF] rounded-xl">
                  <Bed size={20} className="text-[#212529] flex-shrink-0" />
                  <div>
                    <p className="text-lg font-bold text-[#212529] leading-none">{property.beds}</p>
                    <p className="text-xs text-[#ADB5BD]">{property.beds === 1 ? 'Bed' : 'Beds'}</p>
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-3 px-5 py-3 border-2 border-[#E9ECEF] rounded-xl">
                  <Bath size={20} className="text-[#212529] flex-shrink-0" />
                  <div>
                    <p className="text-lg font-bold text-[#212529] leading-none">{property.baths}</p>
                    <p className="text-xs text-[#ADB5BD]">{property.baths === 1 ? 'Bath' : 'Baths'}</p>
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-3 px-5 py-3 border-2 border-[#E9ECEF] rounded-xl">
                  {property.sqft ? (
                    <>
                      <Square size={20} className="text-[#212529] flex-shrink-0" />
                      <div>
                        <p className="text-lg font-bold text-[#212529] leading-none">{property.sqft.toLocaleString()}</p>
                        <p className="text-xs text-[#ADB5BD]">Sq Ft</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Car size={20} className="text-[#212529] flex-shrink-0" />
                      <div>
                        <p className="text-lg font-bold text-[#212529] leading-none">{property.parking_spaces || 0}</p>
                        <p className="text-xs text-[#ADB5BD]">Parking</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-[#212529] mb-4">About this property</h2>
              {property.description ? (
                <p className="text-[#495057] whitespace-pre-line leading-7">{property.description}</p>
              ) : (
                <div className="p-6 bg-[#F8F9FA] rounded-xl border border-[#E9ECEF]">
                  <p className="text-[#495057] text-sm">Contact the landlord for more details about this property.</p>
                </div>
              )}
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="mb-10">
                <h2 className="text-lg font-bold text-[#212529] mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity: string) => {
                    const Icon = AMENITY_ICONS[amenity] || Check
                    return (
                      <div key={amenity} className="flex items-center gap-3 p-3 rounded-xl border border-[#E9ECEF] hover:border-[#212529] transition-colors">
                        <div className="w-9 h-9 bg-[#F8F9FA] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon size={16} className="text-[#212529]" />
                        </div>
                        <span className="text-sm font-medium text-[#212529]">{amenity}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Availability */}
            {(property.available_from || property.lease_term) && (
              <div className="mb-10">
                <h2 className="text-lg font-bold text-[#212529] mb-4">Availability</h2>
                <div className="flex flex-wrap gap-3">
                  {property.available_from && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl">
                      <Calendar size={18} className="text-[#212529]" />
                      <span className="text-sm font-medium text-[#212529]">
                        Available {new Date(property.available_from).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                  {property.lease_term && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl">
                      <Clock size={18} className="text-[#212529]" />
                      <span className="text-sm font-medium text-[#212529]">{property.lease_term} lease</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Contact Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 border-2 border-[#E9ECEF] rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-[#212529] text-white px-6 py-5">
                <p className="font-bold text-lg">Get in Touch</p>
                <p className="text-sm text-white/60 mt-0.5">Typically responds within 24 hours</p>
              </div>

              <div className="p-6">
                {/* Landlord Info */}
                {property.profiles && (
                  <div className="flex items-center gap-4 pb-5 border-b border-[#E9ECEF] mb-5">
                    <div className="relative flex-shrink-0">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden bg-[#F8F9FA] border-2 border-[#E9ECEF] flex items-center justify-center">
                        {property.profiles.avatar_url ? (
                          <Image
                            src={property.profiles.avatar_url}
                            alt={property.profiles.name || 'Landlord'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-xl font-bold text-[#495057]">
                            {property.profiles.name?.[0]?.toUpperCase() || 'L'}
                          </span>
                        )}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#51CF66] rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#212529] truncate">{property.profiles.name || 'Property Owner'}</p>
                      <p className="text-xs text-[#ADB5BD]">Property Owner</p>
                    </div>
                  </div>
                )}

                {/* Contact Buttons */}
                <div className="space-y-3 mb-5">
                  {property.profiles?.phone && (
                    <a
                      href={`tel:${property.profiles.phone}`}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-[#212529] text-white rounded-xl text-sm font-semibold hover:bg-black hover:-translate-y-0.5 hover:shadow-lg transition-all"
                    >
                      <Phone size={16} />
                      Call Now
                    </a>
                  )}

                  <a
                    href={`mailto:${property.profiles?.email}?subject=Inquiry about ${property.title}`}
                    className="flex items-center justify-center gap-2 w-full py-3 border-2 border-[#E9ECEF] text-[#212529] rounded-xl text-sm font-semibold hover:border-[#212529] transition-all"
                  >
                    <Mail size={16} />
                    Send Email
                  </a>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E9ECEF]"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-white text-[#ADB5BD] text-xs">or send a message</span>
                  </div>
                </div>

                {/* Inquiry Form */}
                <Suspense fallback={<div className="h-48 bg-[#F8F9FA] rounded-xl animate-pulse" />}>
                  <InquiryForm propertyId={property.id} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'RealEstateListing',
            name: property.title,
            description: property.description || `${property.beds} bedroom, ${property.baths} bathroom ${property.property_type || 'property'} in ${property.city}, Zimbabwe`,
            url: `https://www.huts.co.zw/property/${slug}`,
            image: images.map((img: any) => img.url),
            datePosted: property.created_at,
            ...(property.sqft && {
              floorSize: {
                '@type': 'QuantitativeValue',
                value: property.sqft,
                unitCode: 'FTK',
              },
            }),
            numberOfBedrooms: property.beds,
            numberOfBathroomsFull: property.baths,
            address: {
              '@type': 'PostalAddress',
              streetAddress: property.address,
              addressLocality: property.city,
              ...(property.state && { addressRegion: property.state }),
              addressCountry: 'ZW',
            },
            ...(property.lat && property.lng && {
              geo: {
                '@type': 'GeoCoordinates',
                latitude: property.lat,
                longitude: property.lng,
              },
            }),
            offers: {
              '@type': 'Offer',
              price: isRental ? (property.price || 0) / 100 : (property.sale_price || 0) / 100,
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              ...(isRental && { priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }),
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.huts.co.zw' },
              { '@type': 'ListItem', position: 2, name: 'Search', item: 'https://www.huts.co.zw/search' },
              { '@type': 'ListItem', position: 3, name: property.title, item: `https://www.huts.co.zw/property/${slug}` },
            ],
          }),
        }}
      />
    </div>
  )
}
