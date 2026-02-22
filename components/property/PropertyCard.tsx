import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Bed, Bath, Square, Heart, Home, Car, GraduationCap, Sofa, Users, Zap } from 'lucide-react'
import { PropertyWithImages, isRentalProperty, isSaleProperty, isStudentProperty } from '@/types'
import { formatPrice, formatSalePrice } from '@/lib/utils'
import { ICON_SIZES } from '@/lib/constants'

interface PropertyCardProps {
  property: PropertyWithImages
}

export function PropertyCard({ property }: PropertyCardProps) {
  const primaryImage = property.property_images.find(img => img.is_primary) 
    || property.property_images[0]

  return (
    <Link href={`/property/${property.slug || property.id}`} className="block group">
      <article className="property-card">
        {/* Image */}
        <div className="property-card-image">
          {primaryImage ? (
            <>
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt_text || property.title}
                fill
                className="object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-95"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABwgJ/8QAJRAAAgEDAwMFAQAAAAAAAAAAAQIDBAURBgcSACExCBMUQVFx/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAeEQABAwQDAQAAAAAAAAAAAAABAAIDBBEhMQUSQf/aAAwDAQACEQMRAD8Av+u25ts1Pqe8agt2qLpQwXS4T3BYadIWjRpZGkKAuh48S2M4zjOR5Gg0S0d0T0Dt/piy2Ca+3a4U1qtsNvSonaNZJRFGsfNgqkBmxkgEDPjxo306Ah6W0m+6QP/Z"
                loading="lazy"
              />
              {/* Subtle overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="w-full h-full bg-[#F8F9FA] flex items-center justify-center">
              <Home className="text-[#ADB5BD]" size={ICON_SIZES['3xl']} />
            </div>
          )}
          
          {/* Price Badge */}
          {isRentalProperty(property) && property.price ? (
            <div className="property-card-badge group-hover:scale-105 transition-transform duration-200">
              {formatPrice(property.price)}/mo
            </div>
          ) : isSaleProperty(property) && property.sale_price ? (
            <>
              <div className="property-card-badge group-hover:scale-105 transition-transform duration-200">
                {formatSalePrice(property.sale_price)}
              </div>
              <div className="absolute top-3 left-14 bg-white/95 backdrop-blur-sm text-[#212529] px-2.5 py-1 rounded-lg text-xs font-bold shadow-md group-hover:scale-105 transition-transform duration-200">
                FOR SALE
              </div>
            </>
          ) : null}

          {/* Student Housing Badges */}
          {isStudentProperty(property) && (
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[140px]">
              {property.furnished && (
                <div className="bg-[#212529]/90 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 shadow-md hover:bg-[#212529] transition-colors" title="Furnished">
                  <Sofa size={ICON_SIZES.xs} /> Furnished
                </div>
              )}
              {property.shared_rooms && (
                <div className="bg-[#212529]/90 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 shadow-md hover:bg-[#212529] transition-colors" title="Shared Rooms Available">
                  <Users size={ICON_SIZES.xs} /> Shared
                </div>
              )}
              {property.utilities_included && (
                <div className="bg-[#212529]/90 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 shadow-md hover:bg-[#212529] transition-colors" title="Utilities Included">
                  <Zap size={ICON_SIZES.xs} /> Utilities
                </div>
              )}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              // TODO: Implement save functionality
            }}
            className="absolute top-3 right-3 p-2.5 bg-white/95 backdrop-blur-sm rounded-full hover:bg-white hover:scale-110 transition-all duration-200 shadow-md hover:shadow-lg min-w-[44px] min-h-[44px] flex items-center justify-center group/save z-10"
            aria-label="Save property"
          >
            <Heart size={ICON_SIZES.lg} className="text-[#212529] group-hover/save:fill-[#FF6B6B] group-hover/save:text-[#FF6B6B] transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="property-card-content">
          <h3 className="text-card-title mb-2 line-clamp-1 group-hover:text-[#000] transition-colors">
            {property.title}
          </h3>
          
          <div className="flex items-center text-muted-foreground text-sm mb-4">
            <MapPin size={ICON_SIZES.sm} className="mr-1.5 flex-shrink-0 text-[#ADB5BD]" />
            <span className="line-clamp-1">
              {property.neighborhood ? `${property.neighborhood}, ` : ''}
              {property.city}
            </span>
          </div>

          {/* Features */}
          <div className="property-card-features text-[#495057]">
            <div className="flex items-center gap-1.5">
              <Bed size={ICON_SIZES.md} className="text-[#ADB5BD]" />
              <span className="font-medium">{property.beds}</span>
            </div>
            {isSaleProperty(property) && property.parking_spaces && property.parking_spaces > 0 && (
              <div className="flex items-center gap-1.5">
                <Car size={ICON_SIZES.md} className="text-[#ADB5BD]" />
                <span className="font-medium">{property.parking_spaces}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Bath size={ICON_SIZES.md} className="text-[#ADB5BD]" />
              <span className="font-medium">{property.baths}</span>
            </div>
            {property.sqft && (
              <div className="flex items-center gap-1.5">
                <Square size={ICON_SIZES.md} className="text-[#ADB5BD]" />
                <span className="font-medium">{property.sqft}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
