'use client'

import { Building2, Calendar, MapPin, Square, Car, Home as HomeIcon, Ruler } from 'lucide-react'
import { PropertyWithImages } from '@/types'
import { formatSalePrice, formatPrice } from '@/lib/utils'
import { MortgageCalculator } from './MortgageCalculator'

interface SalePropertyDetailsProps {
  property: PropertyWithImages
}

export function SalePropertyDetails({ property }: SalePropertyDetailsProps) {
  // Ensure this component is only used with sale properties
  if (!property.sale_price) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Price Section */}
      <div className="border-2 border-light-gray rounded-lg p-6">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <p className="text-sm text-dark-gray mb-1">Purchase Price</p>
            <h2 className="text-4xl font-bold text-charcoal">
              {formatSalePrice(property.sale_price)}
            </h2>
          </div>
          <div className="bg-off-white px-4 py-2 rounded-lg">
            <p className="text-xs text-dark-gray">Price per sqft</p>
            <p className="text-lg font-semibold text-charcoal">
              {property.sqft 
                ? `$${Math.round((property.sale_price / 100) / property.sqft)}`
                : 'N/A'
              }
            </p>
          </div>
        </div>

        {/* Additional Costs */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-light-gray">
          {property.property_tax_annual && (
            <div>
              <p className="text-sm text-dark-gray mb-1">Property Tax (annual)</p>
              <p className="text-lg font-semibold text-charcoal">
                {formatPrice(property.property_tax_annual)}
              </p>
            </div>
          )}
          {property.hoa_fee_monthly && (
            <div>
              <p className="text-sm text-dark-gray mb-1">HOA Fee (monthly)</p>
              <p className="text-lg font-semibold text-charcoal">
                {formatPrice(property.hoa_fee_monthly)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Property Details */}
      <div className="border-2 border-light-gray rounded-lg p-6">
        <h3 className="text-xl font-semibold text-charcoal mb-4 flex items-center gap-2">
          <Building2 size={24} />
          Property Details
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-off-white rounded">
              <HomeIcon size={20} className="text-dark-gray" />
            </div>
            <div>
              <p className="text-xs text-medium-gray">Type</p>
              <p className="font-medium text-charcoal capitalize">{property.property_type}</p>
            </div>
          </div>

          {property.year_built && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-off-white rounded">
                <Calendar size={20} className="text-dark-gray" />
              </div>
              <div>
                <p className="text-xs text-medium-gray">Year Built</p>
                <p className="font-medium text-charcoal">{property.year_built}</p>
              </div>
            </div>
          )}

          {property.sqft && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-off-white rounded">
                <Square size={20} className="text-dark-gray" />
              </div>
              <div>
                <p className="text-xs text-medium-gray">Interior</p>
                <p className="font-medium text-charcoal">{property.sqft} sqft</p>
              </div>
            </div>
          )}

          {property.lot_size_sqft && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-off-white rounded">
                <Ruler size={20} className="text-dark-gray" />
              </div>
              <div>
                <p className="text-xs text-medium-gray">Lot Size</p>
                <p className="font-medium text-charcoal">
                  {property.lot_size_sqft.toLocaleString()} sqft
                </p>
              </div>
            </div>
          )}

          {property.parking_spaces && property.parking_spaces > 0 && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-off-white rounded">
                <Car size={20} className="text-dark-gray" />
              </div>
              <div>
                <p className="text-xs text-medium-gray">Parking</p>
                <p className="font-medium text-charcoal">
                  {property.parking_spaces} space{property.parking_spaces !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}

          {property.garage_spaces && property.garage_spaces > 0 && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-off-white rounded">
                <Car size={20} className="text-dark-gray" />
              </div>
              <div>
                <p className="text-xs text-medium-gray">Garage</p>
                <p className="font-medium text-charcoal">
                  {property.garage_spaces} car{property.garage_spaces !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}

          {property.stories && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-off-white rounded">
                <Building2 size={20} className="text-dark-gray" />
              </div>
              <div>
                <p className="text-xs text-medium-gray">Stories</p>
                <p className="font-medium text-charcoal">{property.stories}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mortgage Calculator */}
      <MortgageCalculator
        salePrice={property.sale_price}
        propertyTaxAnnual={property.property_tax_annual}
        hoaFeeMonthly={property.hoa_fee_monthly}
      />

      {/* Contact CTAs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button className="bg-black text-white px-6 py-3 rounded border-2 border-black hover:bg-charcoal hover:-translate-y-0.5 transition-all font-semibold">
          Schedule a Tour
        </button>
        <button className="bg-transparent text-black px-6 py-3 rounded border-2 border-dark-gray hover:border-black hover:border-[3px] transition-all font-semibold">
          Make an Offer
        </button>
      </div>
    </div>
  )
}
