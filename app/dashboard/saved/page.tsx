import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, MapPin, Bed, Bath, Square } from 'lucide-react'

export const metadata = {
  title: 'Saved Properties - Huts',
  description: 'View and manage your saved properties',
}

export default async function SavedPropertiesPage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/dashboard')
  }

  // Fetch saved properties
  const { data: savedProperties, error } = await supabase
    .from('saved_properties')
    .select(`
      user_id,
      property_id,
      saved_at,
      property:properties (
        id,
        title,
        slug,
        price,
        beds,
        baths,
        sqft,
        city,
        neighborhood,
        status,
        property_images (
          url,
          is_primary
        )
      )
    `)
    .eq('user_id', user.id)
    .order('saved_at', { ascending: false })

  if (error) {
    console.error('Error fetching saved properties:', error)
  }

  // Filter out null properties (if property was deleted)
  const validSavedProperties = savedProperties?.filter(sp => sp.property !== null) || []

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-[#E9ECEF]">
          <h1 className="text-2xl md:text-3xl font-bold text-[#212529] mb-2">
            Saved Homes
          </h1>
          <p className="text-sm text-[#495057]">
            {validSavedProperties.length} {validSavedProperties.length === 1 ? 'property' : 'properties'}
          </p>
        </div>

        {/* Content */}
        {validSavedProperties.length === 0 ? (
          <div className="bg-white border border-[#E9ECEF] rounded-lg p-12 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-[#F8F9FA] rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart size={32} className="text-[#ADB5BD]" />
            </div>
            <h2 className="text-xl font-bold text-[#212529] mb-2">
              No saved homes yet
            </h2>
            <p className="text-sm text-[#495057] mb-6 max-w-md mx-auto">
              Start exploring and save your favorite properties to keep track of them here.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-[#212529] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-black transition-colors"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {validSavedProperties.map((saved: any) => {
              const property = saved.property
              const primaryImage = property.property_images?.find((img: any) => img.is_primary) || property.property_images?.[0]
              const imageUrl = primaryImage?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop'

              return (
                <div key={`${saved.user_id}-${saved.property_id}`} className="group relative">
                  <Link
                    href={`/property/${property.slug || property.id}`}
                    className="block bg-white border border-[#E9ECEF] rounded-lg overflow-hidden hover:border-[#212529] hover:shadow-md transition-all"
                  >
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden bg-[#F8F9FA]">
                      <Image
                        src={imageUrl}
                        alt={property.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      
                      {/* Status Badge */}
                      {property.status !== 'active' && (
                        <div className="absolute top-3 left-3 bg-[#FF6B6B] text-white px-2 py-1 rounded text-xs font-bold uppercase">
                          {property.status}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Price */}
                      <p className="text-xl font-bold text-[#212529] mb-2">
                        ${(property.price / 100).toLocaleString()}/mo
                      </p>
                      
                      {/* Features */}
                      <div className="flex items-center gap-3 text-sm text-[#495057] mb-2">
                        <span className="flex items-center gap-1">
                          <Bed size={16} />
                          {property.beds} bd
                        </span>
                        <span className="flex items-center gap-1">
                          <Bath size={16} />
                          {property.baths} ba
                        </span>
                        {property.sqft && (
                          <span className="flex items-center gap-1">
                            <Square size={16} />
                            {property.sqft.toLocaleString()} sqft
                          </span>
                        )}
                      </div>

                      {/* Address */}
                      <p className="text-sm text-[#495057] truncate mb-2">
                        {property.title}
                      </p>
                      
                      <div className="flex items-center text-xs text-[#ADB5BD]">
                        <MapPin size={14} className="mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}
                        </span>
                      </div>

                      {/* Saved Date */}
                      <div className="mt-3 pt-3 border-t border-[#E9ECEF]">
                        <p className="text-xs text-[#ADB5BD]">
                          Saved {new Date(saved.saved_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </Link>

                  {/* Remove Button */}
                  <form action="/api/properties/unsave" method="POST" className="absolute top-3 right-3 z-10">
                    <input type="hidden" name="propertyId" value={property.id} />
                    <button
                      type="submit"
                      className="p-2.5 bg-white/95 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-md group/btn"
                      title="Remove from saved"
                    >
                      <Heart size={20} className="fill-[#FF6B6B] text-[#FF6B6B] group-hover/btn:fill-white group-hover/btn:text-[#FF6B6B] transition-all" />
                    </button>
                  </form>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
