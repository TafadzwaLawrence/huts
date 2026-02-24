'use client'

import { useRef } from 'react'
import PropertyStickyHeader from './PropertyStickyHeader'
import ContactSidebar from './ContactSidebar'
import PropertyHeader from './PropertyHeader'
import PropertyHighlights from './PropertyHighlights'
import PropertyFacts from './PropertyFacts'
import PropertyCriteria from './PropertyCriteria'
import OfficeHours from './OfficeHours'
import PetEssentials from './PetEssentials'
import PropertyFAQs from './PropertyFAQs'
import SimilarHomes from './SimilarHomes'
import NeighborhoodSection from './NeighborhoodSection'
import CostBreakdown from './CostBreakdown'
import EnhancedCostBreakdown from './EnhancedCostBreakdown'
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

            {/* Property Criteria - Zillow style */}
            <PropertyCriteria
              incomeRequirement={property.income_requirement || '3x rent'}
              creditScoreMin={property.credit_score_min}
              petsAllowed={property.pets_allowed}
              petsSmallDogs={property.pets_small_dogs}
              petsLargeDogs={property.pets_large_dogs}
              petsCats={property.pets_cats}
              petsMaxCount={property.pets_max_count || 0}
            />

            {/* Office Hours & Contact */}
            <OfficeHours
              propertyManagerName={property.property_manager_name}
              propertyManagerCompany={property.property_manager_company}
              propertyManagerPhone={property.property_manager_phone}
              propertyManagerEmail={property.property_manager_email}
              propertyManagerWebsite={property.property_manager_website}
              officeHours={property.office_hours}
            />

            {/* Pet Essentials - visual icons */}
            <PetEssentials
              petsAllowed={property.pets_allowed}
              petsSmallDogs={property.pets_small_dogs}
              petsLargeDogs={property.pets_large_dogs}
              petsCats={property.pets_cats}
              petsMaxCount={property.pets_max_count || 0}
              petDeposit={property.pet_deposit_cents}
              petRentMonthly={property.pet_rent_monthly_cents}
            />

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

            {/* FAQs - Zillow style */}
            <PropertyFAQs
              propertyName={property.title}
              walkScore={property.walk_score}
              petsAllowed={property.pets_allowed}
              hasInUnitLaundry={amenities.some((a: string) => a.toLowerCase().includes('laundry'))}
              virtualTourAvailable={!!property.virtual_tour_url}
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
              <EnhancedCostBreakdown
                price={property.price}
                salePrice={property.sale_price}
                listingType={property.listing_type}
                propertyTaxAnnual={property.property_tax_annual}
                hoaFeeMonthly={property.hoa_fee_monthly}
                deposit={property.deposit}
                securityDeposit={property.security_deposit_cents}
                applicationFee={property.application_fee_cents}
                adminFee={property.admin_fee_cents}
                petDeposit={property.pet_deposit_cents}
                petRentMonthly={property.pet_rent_monthly_cents}
                parkingFeeMonthly={property.parking_fee_monthly_cents}
                utilityFees={property.utility_fees || {}}
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
