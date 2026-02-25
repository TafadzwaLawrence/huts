import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient, createStaticClient } from '@/lib/supabase/server'
import { formatPrice, formatSalePrice } from '@/lib/utils'
import { ChevronLeft } from 'lucide-react'
import PropertyGallery from '@/components/property/PropertyGallery'
import PropertyDetailClient from '@/components/property/PropertyDetailClient'
import PropertyStructuredData from '@/components/property/PropertyStructuredData'
import BreadcrumbStructuredData from '@/components/property/BreadcrumbStructuredData'

// ISR - Revalidate every 60 seconds for fresh data
export const revalidate = 60

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

  // Check if landlord is also an agent
  let agentProfile = null
  if (property.user_id) {
    const { data } = await supabase
      .from('agent_profiles')
      .select(`
        *,
        agent_service_areas(city, is_primary)
      `)
      .eq('user_id', property.user_id)
      .eq('status', 'active')
      .single()
    agentProfile = data
  }

  // Block public access to unverified properties (owners can still view their own)
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === property.user_id
  if (property.verification_status && property.verification_status !== 'approved' && !isOwner) {
    notFound()
  }

  const images = property.property_images || []

  // Check if current user can review (has made an inquiry)
  let canReview = false
  if (user && user.id !== property.user_id) {
    const { count } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('property_id', property.id)
    canReview = (count || 0) > 0
  }

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-0">
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

      {/* Gallery */}
      <div className="relative">
        <PropertyGallery images={images} title={property.title} />
        <Link
          href="/search"
          className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm p-2.5 rounded-xl shadow-lg hover:bg-white hover:scale-105 transition-all z-10 border border-[#E9ECEF]"
        >
          <ChevronLeft size={22} className="text-[#212529]" />
        </Link>
      </div>

      {/* Zillow-style two-column content with sticky sidebar */}
      <PropertyDetailClient
        property={property}
        slug={slug}
        currentUserId={user?.id}
        canReview={canReview}
        agentProfile={agentProfile}
      />
    </div>
  )
}
