'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface FactCategory {
  title: string
  facts: { label: string; value: string | number | null | undefined }[]
}

interface PropertyFactsProps {
  property: {
    property_type?: string | null
    beds: number
    baths: number
    sqft?: number | null
    parking_spaces?: number | null
    year_built?: number | null
    lot_size?: number | null
    stories?: number | null
    price?: number | null
    sale_price?: number | null
    listing_type?: string | null
    property_tax_annual?: number | null
    hoa_fee_monthly?: number | null
    deposit?: number | null
    lease_term?: string | null
    available_from?: string | null
    heating?: string | null
    cooling?: string | null
    flooring?: string | null
    appliances?: string | null
    amenities?: string[] | null
  }
}

export default function PropertyFacts({ property }: PropertyFactsProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Interior': true,
    'Exterior': true,
  })

  const isSale = property.listing_type === 'sale' || !!property.sale_price
  const isRental = !isSale

  const categories: FactCategory[] = [
    {
      title: 'Interior',
      facts: [
        { label: 'Bedrooms', value: property.beds },
        { label: 'Bathrooms', value: property.baths },
        { label: 'Square feet', value: property.sqft ? `${property.sqft.toLocaleString()} sqft` : null },
        { label: 'Flooring', value: property.flooring },
        { label: 'Appliances', value: property.appliances },
      ],
    },
    {
      title: 'Exterior',
      facts: [
        { label: 'Property type', value: property.property_type ? property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1) : null },
        { label: 'Year built', value: property.year_built },
        { label: 'Lot size', value: property.lot_size ? `${property.lot_size.toLocaleString()} sqft` : null },
        { label: 'Stories', value: property.stories },
        { label: 'Parking', value: property.parking_spaces ? `${property.parking_spaces} space${property.parking_spaces > 1 ? 's' : ''}` : null },
      ],
    },
    {
      title: 'Financial',
      facts: [
        ...(isSale ? [
          { label: 'Price per sqft', value: property.sqft && property.sale_price ? `$${Math.round((property.sale_price / 100) / property.sqft)}` : null },
          { label: 'Property tax (annual)', value: property.property_tax_annual ? `$${(property.property_tax_annual / 100).toLocaleString()}` : null },
          { label: 'HOA fee (monthly)', value: property.hoa_fee_monthly ? `$${(property.hoa_fee_monthly / 100).toLocaleString()}` : null },
        ] : [
          { label: 'Deposit', value: property.deposit ? `$${(property.deposit / 100).toLocaleString()}` : null },
          { label: 'Lease term', value: property.lease_term },
          { label: 'Available from', value: property.available_from ? new Date(property.available_from).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null },
        ]),
      ],
    },
  ]

  // Filter out categories with no facts
  const validCategories = categories.map(cat => ({
    ...cat,
    facts: cat.facts.filter(f => f.value != null && f.value !== ''),
  })).filter(cat => cat.facts.length > 0)

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <div className="mb-8">
      <h2 className="text-base font-bold text-[#212529] mb-4">Facts & features</h2>
      <div className="space-y-1">
        {validCategories.map((category) => (
          <div key={category.title} className="border border-[#E9ECEF] rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection(category.title)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#F8F9FA] hover:bg-[#E9ECEF] transition-colors"
            >
              <span className="text-sm font-semibold text-[#212529]">{category.title}</span>
              {expandedSections[category.title] ? (
                <ChevronUp size={16} className="text-[#495057]" />
              ) : (
                <ChevronDown size={16} className="text-[#495057]" />
              )}
            </button>
            {expandedSections[category.title] && (
              <div className="px-4 py-3">
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  {category.facts.map((fact) => (
                    <div key={fact.label} className="flex justify-between items-baseline">
                      <span className="text-sm text-[#495057]">{fact.label}</span>
                      <span className="text-sm font-medium text-[#212529]">{fact.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
