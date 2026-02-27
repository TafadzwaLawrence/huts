'use client'

import { Building2, Calendar, MapPin, Square, Car, Home as HomeIcon, Ruler } from 'lucide-react'
import { PropertyWithImages } from '@/types'
import { formatSalePrice, formatPrice } from '@/lib/utils'
import { ICON_SIZES } from '@/lib/constants'
// import { MortgageCalculator } from './MortgageCalculator' // Disabled - mortgages not applicable in Zimbabwe

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
      <div className="border-2 border-[#E9ECEF] rounded-lg p-6">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <p className="text-sm text-[#495057] mb-1">Purchase Price</p>
            <h2 className="text-4xl font-bold text-[#212529]">
              {formatSalePrice(property.sale_price)}
            </h2>
          </div>
          <div className="bg-[#F8F9FA] px-4 py-2 rounded-lg">
            <p className="text-xs text-[#495057]">Price per sqft</p>
            <p className="text-lg font-semibold text-[#212529]">
              {property.sqft 
                ? `$${Math.round((property.sale_price / 100) / property.sqft)}`
                : 'N/A'
              }
            </p>
          </div>
        </div>

        {/* Additional Costs */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E9ECEF]">
          {property.property_tax_annual && (
            <div>
              <p className="text-sm text-[#495057] mb-1">Property Tax (annual)</p>
              <p className="text-lg font-semibold text-[#212529]">
                {formatPrice(property.property_tax_annual)}
              </p>
            </div>
          )}
          {property.hoa_fee_monthly && (
            <div>
              <p className="text-sm text-[#495057] mb-1">HOA Fee (monthly)</p>
              <p className="text-lg font-semibold text-[#212529]">
                {formatPrice(property.hoa_fee_monthly)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Property Details */}
      <div className="border-2 border-[#E9ECEF] rounded-lg p-6">
        <h3 className="text-xl font-semibold text-[#212529] mb-4 flex items-center gap-2">
          <Building2 size={ICON_SIZES.xl} />
          Property Details
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F8F9FA] rounded">
              <HomeIcon size={ICON_SIZES.lg} className="text-[#495057]" />
            </div>
            <div>
              <p className="text-xs text-[#ADB5BD]">Type</p>
              <p className="font-medium text-[#212529] capitalize">{property.property_type}</p>
            </div>
          </div>

          {property.year_built && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F8F9FA] rounded">
                <Calendar size={ICON_SIZES.lg} className="text-[#495057]" />
              </div>
              <div>
                <p className="text-xs text-[#ADB5BD]">Year Built</p>
                <p className="font-medium text-[#212529]">{property.year_built}</p>
              </div>
            </div>
          )}

          {property.sqft && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F8F9FA] rounded">
                <Square size={ICON_SIZES.lg} className="text-[#495057]" />
              </div>
              <div>
                <p className="text-xs text-[#ADB5BD]">Interior</p>
                <p className="font-medium text-[#212529]">{property.sqft} sqft</p>
              </div>
            </div>
          )}

          {property.lot_size_sqft && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F8F9FA] rounded">
                <Ruler size={20} className="text-[#495057]" />
              </div>
              <div>
                <p className="text-xs text-[#ADB5BD]">Lot Size</p>
                <p className="font-medium text-[#212529]">
                  {property.lot_size_sqft.toLocaleString()} sqft
                </p>
              </div>
            </div>
          )}

          {property.parking_spaces && property.parking_spaces > 0 && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F8F9FA] rounded">
                <Car size={20} className="text-[#495057]" />
              </div>
              <div>
                <p className="text-xs text-[#ADB5BD]">Parking</p>
                <p className="font-medium text-[#212529]">
                  {property.parking_spaces} space{property.parking_spaces !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}

          {property.garage_spaces && property.garage_spaces > 0 && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F8F9FA] rounded">
                <Car size={20} className="text-[#495057]" />
              </div>
              <div>
                <p className="text-xs text-[#ADB5BD]">Garage</p>
                <p className="font-medium text-[#212529]">
                  {property.garage_spaces} car{property.garage_spaces !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}

          {property.stories && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F8F9FA] rounded">
                <Building2 size={20} className="text-[#495057]" />
              </div>
              <div>
                <p className="text-xs text-[#ADB5BD]">Stories</p>
                <p className="font-medium text-[#212529]">{property.stories}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mortgage Calculator - Disabled for Zimbabwe market */}
      {/* <MortgageCalculator
        salePrice={property.sale_price}
        propertyTaxAnnual={property.property_tax_annual}
        hoaFeeMonthly={property.hoa_fee_monthly}
      /> */}

      {/* Contact CTAs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button className="bg-black text-white px-6 py-3 rounded border-2 border-black hover:bg-[#212529] hover:-translate-y-0.5 transition-all font-semibold">
          Schedule a Tour
        </button>
        <button className="bg-transparent text-black px-6 py-3 rounded border-2 border-[#495057] hover:border-black hover:border-[3px] transition-all font-semibold">
          Make an Offer
        </button>
      </div>
    </div>
  )
}
