'use client'

import { useRef } from 'react'
import PropertyStickyHeader from './PropertyStickyHeader'
import ContactSidebar from './ContactSidebar'
import PropertyHeader from './PropertyHeader'
import PropertyHighlights from './PropertyHighlights'
import PropertyFacts from './PropertyFacts'
import SimilarHomes from './SimilarHomes'
import NeighborhoodSection from './NeighborhoodSection'
import CostBreakdown from './CostBreakdown'
import PriceHistory from './PriceHistory'
import ReviewsSection from '@/components/reviews/ReviewsSection'
import { Check } from 'lucide-react'

interface PropertyDetailClientProps {
  property: any
  slug: string
  currentUserId?: string
  canReview: boolean
}

const AMENITY_ICONS: Record<string, string> = {
  'WiFi': 'wifi',
  'Parking': 'car',
  'Pool': 'waves',
  'Gym': 'dumbbell',
  'Pet-friendly': 'pet',
  'Security': 'shield',
  'Air conditioning': 'ac',
  'Heating': 'heating',
  'Garden': 'garden',
  'Storage': 'storage',
}

export default function PropertyDetailClient({ property, slug, currentUserId, canReview }: PropertyDetailClientProps) {
  const contactRef = useRef<HTMLDivElement>(null)

  const scrollToContact = () => {
    contactRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const isRental = property.listing_type === 'rent' || (!property.listing_type && property.price)
  const isSale = property.listing_type === 'sale' || !!property.sale_price
  const amenities = property.amenities || []
  const isNewListing = property.created_at && (Date.now() - new Date(property.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000

  return (
    <>
      {/* Sticky header on scroll */}
      <PropertyStickyHeader property={property} onContact={scrollToContact} />

      {/* Two-column content layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column: main content (65%) */}
          <div className="lg:col-span-7 xl:col-span-8">
            {/* Property header with price, stats, address */}
            <PropertyHeader property={property} slug={slug} />

            {/* What's special highlights */}
            <PropertyHighlights
              amenities={amenities}
              yearBuilt={property.year_built}
              isNewListing={isNewListing}
            />

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-base font-bold text-[#212529] mb-3">About this property</h2>
              {property.description ? (
                <p className="text-sm text-[#495057] whitespace-pre-line leading-relaxed">
                  {property.description}
                </p>
              ) : (
                <p className="text-sm text-[#ADB5BD]">
                  Contact the landlord for more details about this property.
                </p>
              )}
            </div>

            {/* Amenities grid */}
            {amenities.length > 0 && (
              <div className="mb-8">
                <h2 className="text-base font-bold text-[#212529] mb-3">Amenities</h2>
                <div className="grid grid-cols-2 gap-2">
                  {amenities.map((amenity: string) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-2 py-2 text-sm text-[#212529]"
                    >
                      <Check size={14} className="text-[#51CF66] flex-shrink-0" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Facts & Features */}
            <PropertyFacts property={property} />

            {/* Price History */}
            <PriceHistory
              propertyId={property.id}
              currentPrice={property.price}
              currentSalePrice={property.sale_price}
              listingType={property.listing_type}
            />

            {/* Neighborhood map */}
            <NeighborhoodSection
              lat={property.lat}
              lng={property.lng}
              city={property.city}
              neighborhood={property.neighborhood}
              state={property.state}
            />

            {/* Similar Homes */}
            <SimilarHomes
              propertyId={property.id}
              city={property.city}
              listingType={property.listing_type}
              price={property.price}
              salePrice={property.sale_price}
              beds={property.beds}
            />

            {/* Reviews */}
            <div className="mb-8">
              <ReviewsSection
                propertyId={property.id}
                propertyOwnerId={property.user_id}
                currentUserId={currentUserId}
                canReview={canReview}
              />
            </div>
          </div>

          {/* Right column: sticky sidebar (35%) */}
          <div className="lg:col-span-5 xl:col-span-4" ref={contactRef}>
            <div className="space-y-4">
              {/* Contact card */}
              <ContactSidebar
                propertyId={property.id}
                propertyTitle={property.title}
                landlord={property.profiles}
              />

              {/* Cost breakdown / mortgage calculator */}
              <CostBreakdown
                price={property.price}
                salePrice={property.sale_price}
                listingType={property.listing_type}
                propertyTaxAnnual={property.property_tax_annual}
                hoaFeeMonthly={property.hoa_fee_monthly}
                deposit={property.deposit}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-[#E9ECEF] px-4 py-3 z-30">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-[#212529]">
              {isSale
                ? (property.sale_price ? `$${(property.sale_price / 100).toLocaleString()}` : 'Contact')
                : (property.price ? `$${(property.price / 100).toLocaleString()}/mo` : 'Contact')
              }
            </p>
          </div>
          <button
            onClick={scrollToContact}
            className="px-6 py-2.5 bg-[#212529] text-white rounded-lg text-sm font-semibold hover:bg-black transition-colors"
          >
            Contact landlord
          </button>
        </div>
      </div>
    </>
  )
}
