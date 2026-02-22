'use client'

import { Building2, Calendar, MapPin, Square, Car, Home as HomeIcon, Ruler } from 'lucide-react'
import { PropertyWithImages } from '@/types'
import { formatSalePrice, formatPrice } from '@/lib/utils'
import { ICON_SIZES } from '@/lib/constants'
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
      <div className="border-2 border-border rounded-lg p-6">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <p className="text-sm text-foreground mb-1">Purchase Price</p>
            <h2 className="text-4xl font-bold text-foreground">
              {formatSalePrice(property.sale_price)}
            </h2>
          </div>
          <div className="bg-muted px-4 py-2 rounded-lg">
            <p className="text-xs text-foreground">Price per sqft</p>
            <p className="text-lg font-semibold text-foreground">
              {property.sqft 
                ? `$${Math.round((property.sale_price / 100) / property.sqft)}`
                : 'N/A'
              }
            </p>
          </div>
        </div>

        {/* Additional Costs */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          {property.property_tax_annual && (
            <div>
              <p className="text-sm text-foreground mb-1">Property Tax (annual)</p>
              <p className="text-lg font-semibold text-foreground">
                {formatPrice(property.property_tax_annual)}
              </p>
            </div>
          )}
          {property.hoa_fee_monthly && (
            <div>
              <p className="text-sm text-foreground mb-1">HOA Fee (monthly)</p>
              <p className="text-lg font-semibold text-foreground">
                {formatPrice(property.hoa_fee_monthly)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Property Details */}
      <div className="border-2 border-border rounded-lg p-6">
        <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Building2 size={ICON_SIZES.xl} />
          Property Details
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded">
              <HomeIcon size={ICON_SIZES.lg} className="text-foreground" />
            </div>
            <div>
              <p className="text-xs text-foreground">Type</p>
              <p className="font-medium text-foreground capitalize">{property.property_type}</p>
            </div>
          </div>

          {property.year_built && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded">
                <Calendar size={ICON_SIZES.lg} className="text-foreground" />
              </div>
              <div>
                <p className="text-xs text-foreground">Year Built</p>
                <p className="font-medium text-foreground">{property.year_built}</p>
              </div>
            </div>
          )}

          {property.sqft && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded">
                <Square size={ICON_SIZES.lg} className="text-foreground" />
              </div>
              <div>
                <p className="text-xs text-foreground">Interior</p>
                <p className="font-medium text-foreground">{property.sqft} sqft</p>
              </div>
            </div>
          )}

          {property.lot_size_sqft && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded">
                <Ruler size={20} className="text-foreground" />
              </div>
              <div>
                <p className="text-xs text-foreground">Lot Size</p>
                <p className="font-medium text-foreground">
                  {property.lot_size_sqft.toLocaleString()} sqft
                </p>
              </div>
            </div>
          )}

          {property.parking_spaces && property.parking_spaces > 0 && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded">
                <Car size={20} className="text-foreground" />
              </div>
              <div>
                <p className="text-xs text-foreground">Parking</p>
                <p className="font-medium text-foreground">
                  {property.parking_spaces} space{property.parking_spaces !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}

          {property.garage_spaces && property.garage_spaces > 0 && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded">
                <Car size={20} className="text-foreground" />
              </div>
              <div>
                <p className="text-xs text-foreground">Garage</p>
                <p className="font-medium text-foreground">
                  {property.garage_spaces} car{property.garage_spaces !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}

          {property.stories && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded">
                <Building2 size={20} className="text-foreground" />
              </div>
              <div>
                <p className="text-xs text-foreground">Stories</p>
                <p className="font-medium text-foreground">{property.stories}</p>
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
        <button className="bg-black text-white px-6 py-3 rounded border-2 border-black hover:bg-muted hover:-translate-y-0.5 transition-all font-semibold">
          Schedule a Tour
        </button>
        <button className="bg-transparent text-black px-6 py-3 rounded border-2 border-border hover:border-black hover:border-[3px] transition-all font-semibold">
          Make an Offer
        </button>
      </div>
    </div>
  )
}
