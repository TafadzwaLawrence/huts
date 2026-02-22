import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, MapPin, Bed, Bath, Square, Trash2, Home } from 'lucide-react'
import { ICON_SIZES } from '@/lib/constants'

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
    <div className="min-h-screen bg-muted">
      <div className="container-main py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Saved Properties
          </h1>
          <p className="text-foreground">
            {validSavedProperties.length} {validSavedProperties.length === 1 ? 'property' : 'properties'} saved
          </p>
        </div>

        {/* Content */}
        {validSavedProperties.length === 0 ? (
          <div className="bg-white border-2 border-border rounded-xl p-12 text-center">
            <Heart size={ICON_SIZES['3xl']} className="mx-auto text-foreground mb-6" />
            <h2 className="text-2xl font-bold text-foreground mb-3">
              No saved properties yet
            </h2>
            <p className="text-foreground mb-8 max-w-md mx-auto">
              Start exploring properties and save your favorites to view them here.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-muted text-white px-6 py-3 rounded-lg font-semibold hover:bg-black hover:shadow-xl transition-all"
            >
              <Home size={ICON_SIZES.lg} />
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
                    className="block bg-white border-2 border-border rounded-xl overflow-hidden hover:border-border hover:shadow-xl transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-muted">
                      <Image
                        src={imageUrl}
                        alt={property.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      
                      {/* Price Badge */}
                      <div className="absolute top-3 left-3 bg-black/90 text-white px-3 py-1.5 rounded text-sm font-semibold">
                        ${(property.price / 100).toLocaleString()}/mo
                      </div>

                      {/* Status Badge */}
                      {property.status !== 'active' && (
                        <div className="absolute top-3 right-3 bg-muted text-white px-3 py-1 rounded text-xs font-semibold">
                          {property.status.toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground text-base mb-2 line-clamp-2">
                        {property.title}
                      </h3>
                      
                      <div className="flex items-center text-foreground text-xs mb-3">
                        <MapPin size={ICON_SIZES.xs} className="mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}
                        </span>
                      </div>

                      {/* Features */}
                      <div className="flex items-center gap-4 text-xs text-foreground pt-3 border-t border-border">
                        <span className="flex items-center gap-1">
                          <Bed size={ICON_SIZES.sm} />
                          {property.beds}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bath size={ICON_SIZES.sm} />
                          {property.baths}
                        </span>
                        {property.sqft && (
                          <span className="flex items-center gap-1">
                            <Square size={ICON_SIZES.sm} />
                            {property.sqft}
                          </span>
                        )}
                      </div>

                      {/* Saved Date */}
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-foreground">
                          Saved {new Date(saved.saved_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </Link>

                  {/* Remove Button */}
                  <form action="/api/properties/unsave" method="POST">
                    <input type="hidden" name="propertyId" value={property.id} />
                    <button
                      type="submit"
                      className="absolute top-3 right-3 z-10 p-2 bg-white/95 backdrop-blur-sm rounded-full hover:bg-muted hover:text-white transition-all shadow-md group/btn"
                      title="Remove from saved"
                    >
                      <Heart size={ICON_SIZES.lg} className="fill-current text-foreground group-hover/btn:text-white" />
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
