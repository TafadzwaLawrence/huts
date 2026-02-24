'use client'

import { Home, DollarSign, CreditCard, PawPrint } from 'lucide-react'

interface PropertyCriteriaProps {
  incomeRequirement?: string
  creditScoreMin?: number
  petsAllowed?: boolean
  petsSmallDogs?: boolean
  petsLargeDogs?: boolean
  petsCats?: boolean
  petsMaxCount?: number
}

export default function PropertyCriteria({
  incomeRequirement = '3x rent',
  creditScoreMin,
  petsAllowed = false,
  petsSmallDogs = false,
  petsLargeDogs = false,
  petsCats = false,
  petsMaxCount = 0,
}: PropertyCriteriaProps) {
  return (
    <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-5 mb-8">
      <h2 className="text-base font-bold text-[#212529] mb-4">Property's criteria</h2>
      <p className="text-xs text-[#495057] mb-4">
        The landlord or property manager sets these criteria. They may have other criteria as well.
      </p>

      <div className="space-y-4">
        {/* Income Requirement */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-white border border-[#E9ECEF] flex items-center justify-center flex-shrink-0">
            <DollarSign size={18} className="text-[#495057]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#212529] mb-0.5">
              Gross income per month
            </p>
            <p className="text-xs text-[#495057] mb-1">
              Income can include, but isn't limited to: W-2 or 1099 pay checks, Social Security payments, Housing vouchers
            </p>
            <p className="text-sm font-bold text-[#212529]">{incomeRequirement}</p>
          </div>
        </div>

        {/* Credit Score */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-white border border-[#E9ECEF] flex items-center justify-center flex-shrink-0">
            <CreditCard size={18} className="text-[#495057]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#212529] mb-0.5">Credit score</p>
            <p className="text-sm font-bold text-[#212529]">
              {creditScoreMin ? creditScoreMin : '--'}
            </p>
          </div>
        </div>

        {/* Pet Policy */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-white border border-[#E9ECEF] flex items-center justify-center flex-shrink-0">
            <PawPrint size={18} className="text-[#495057]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#212529] mb-0.5">Pet policy</p>
            {petsAllowed ? (
              <div className="space-y-1">
                {petsCats && (
                  <p className="text-sm text-[#495057]">Cats allowed</p>
                )}
                {petsSmallDogs && (
                  <p className="text-sm text-[#495057]">Small dogs allowed</p>
                )}
                {petsLargeDogs && (
                  <p className="text-sm text-[#495057]">Large dogs allowed</p>
                )}
                {petsMaxCount > 0 && (
                  <p className="text-xs text-[#495057] mt-1">
                    Maximum {petsMaxCount} pet{petsMaxCount > 1 ? 's' : ''} allowed
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#495057]">No pets allowed</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
