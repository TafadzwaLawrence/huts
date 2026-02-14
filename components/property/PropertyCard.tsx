import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Bed, Bath, Square, Heart, Home, Car } from 'lucide-react'
import { PropertyWithImages, isRentalProperty, isSaleProperty } from '@/types'
import { formatPrice, formatSalePrice } from '@/lib/utils'

interface PropertyCardProps {
  property: PropertyWithImages
}

export function PropertyCard({ property }: PropertyCardProps) {
  const primaryImage = property.property_images.find(img => img.is_primary) 
    || property.property_images[0]

  return (
    <Link href={`/property/${property.slug || property.id}`}>
      <div className="property-card group">
        {/* Image */}
        <div className="property-card-image">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt_text || property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABwgJ/8QAJRAAAgEDAwMFAQAAAAAAAAAAAQIDBAURBgcSACExCBMUQVFx/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAeEQABAwQDAQAAAAAAAAAAAAABAAIDBBEhMQUSQf/aAAwDAQACEQMRAD8Av+u25ts1Pqe8agt2qLpQwXS4T3BYadIWjRpZGkKAuh48S2M4zjOR5Gg0S0d0T0Dt/piy2Ca+3a4U1qtsNvSonaNZJRFGsfNgqkBmxkgEDPjxo306Ah6W0m+6QP/Z"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-light-gray flex items-center justify-center">
              <Home className="text-medium-gray" size={48} />
            </div>
          )}
          
          {/* Price Badge */}
          {isRentalProperty(property) ? (
            <div className="property-card-badge">
              {formatPrice(property.price)}/mo
            </div>
          ) : isSaleProperty(property) ? (
            <>
              <div className="property-card-badge">
                {formatSalePrice(property.sale_price)}
              </div>
              <div className="absolute top-3 left-14 bg-white/90 text-black px-2 py-1 rounded text-xs font-semibold">
                FOR SALE
              </div>
            </>
          ) : null}

          {/* Save Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              // TODO: Implement save functionality
            }}
            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors heart-animation min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Save property"
          >
            <Heart size={20} className="text-black" />
          </button>
        </div>

        {/* Content */}
        <div className="property-card-content">
          <h3 className="text-card-title mb-2 line-clamp-1">{property.title}</h3>
          
          <div className="flex items-center text-dark-gray text-sm mb-3">
            <MapPin size={14} className="mr-1 flex-shrink-0" />
            <span className="line-clamp-1">
              {property.neighborhood ? `${property.neighborhood}, ` : ''}
              {property.city}
            </span>
          </div>

          {/* Features */}
          <div className="property-card-features">
            <div className="flex items-center gap-1">
              <Bed size={16} className="text-dark-gray" />
              <span>{property.beds} bed</span>
            {isSaleProperty(property) && property.parking_spaces > 0 && (
              <div className="flex items-center gap-1">
                <Car size={16} className="text-dark-gray" />
                <span>{property.parking_spaces} park</span>
              </div>
            )}
            </div>
            <div className="flex items-center gap-1">
              <Bath size={16} className="text-dark-gray" />
              <span>{property.baths} bath</span>
            </div>
            {property.sqft && (
              <div className="flex items-center gap-1">
                <Square size={16} className="text-dark-gray" />
                <span>{property.sqft} sqft</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
