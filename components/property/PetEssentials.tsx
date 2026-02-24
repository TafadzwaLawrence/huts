'use client'

import { Dog, Cat, Check, X } from 'lucide-react'

interface PetEssentialsProps {
  petsAllowed?: boolean
  petsSmallDogs?: boolean
  petsLargeDogs?: boolean
  petsCats?: boolean
  petsMaxCount?: number
  petDeposit?: number // in cents
  petRentMonthly?: number // in cents
}

export default function PetEssentials({
  petsAllowed = false,
  petsSmallDogs = false,
  petsLargeDogs = false,
  petsCats = false,
  petsMaxCount = 0,
  petDeposit,
  petRentMonthly,
}: PetEssentialsProps) {
  if (!petsAllowed) {
    return null
  }

  const formatMoney = (cents?: number) => {
    if (cents === undefined || cents === null) return null
    return `$${(cents / 100).toLocaleString()}`
  }

  return (
    <div className="mb-8">
      <h2 className="text-base font-bold text-[#212529] mb-4">Pet essentials</h2>
      
      {/* Pet Icons Grid - Zillow style */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Small Dogs */}
        <div className="flex items-center gap-3 p-4 bg-white border border-[#E9ECEF] rounded-lg">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            petsSmallDogs ? 'bg-[#51CF66]/10' : 'bg-[#F8F9FA]'
          }`}>
            <Dog size={24} className={petsSmallDogs ? 'text-[#51CF66]' : 'text-[#ADB5BD]'} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#212529]">Small dogs</p>
            <p className={`text-xs ${petsSmallDogs ? 'text-[#51CF66]' : 'text-[#ADB5BD]'}`}>
              {petsSmallDogs ? 'Allowed' : 'Not allowed'}
            </p>
          </div>
          {petsSmallDogs ? (
            <Check size={20} className="text-[#51CF66]" />
          ) : (
            <X size={20} className="text-[#ADB5BD]" />
          )}
        </div>

        {/* Large Dogs */}
        <div className="flex items-center gap-3 p-4 bg-white border border-[#E9ECEF] rounded-lg">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            petsLargeDogs ? 'bg-[#51CF66]/10' : 'bg-[#F8F9FA]'
          }`}>
            <Dog size={28} className={petsLargeDogs ? 'text-[#51CF66]' : 'text-[#ADB5BD]'} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#212529]">Large dogs</p>
            <p className={`text-xs ${petsLargeDogs ? 'text-[#51CF66]' : 'text-[#ADB5BD]'}`}>
              {petsLargeDogs ? 'Allowed' : 'Not allowed'}
            </p>
          </div>
          {petsLargeDogs ? (
            <Check size={20} className="text-[#51CF66]" />
          ) : (
            <X size={20} className="text-[#ADB5BD]" />
          )}
        </div>

        {/* Cats */}
        <div className="flex items-center gap-3 p-4 bg-white border border-[#E9ECEF] rounded-lg">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            petsCats ? 'bg-[#51CF66]/10' : 'bg-[#F8F9FA]'
          }`}>
            <Cat size={24} className={petsCats ? 'text-[#51CF66]' : 'text-[#ADB5BD]'} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#212529]">Cats</p>
            <p className={`text-xs ${petsCats ? 'text-[#51CF66]' : 'text-[#ADB5BD]'}`}>
              {petsCats ? 'Allowed' : 'Not allowed'}
            </p>
          </div>
          {petsCats ? (
            <Check size={20} className="text-[#51CF66]" />
          ) : (
            <X size={20} className="text-[#ADB5BD]" />
          )}
        </div>

        {/* Max Count */}
        {petsMaxCount > 0 && (
          <div className="flex items-center gap-3 p-4 bg-white border border-[#E9ECEF] rounded-lg">
            <div className="w-12 h-12 rounded-full bg-[#51CF66]/10 flex items-center justify-center">
              <span className="text-lg font-bold text-[#51CF66]">{petsMaxCount}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#212529]">Number allowed</p>
              <p className="text-xs text-[#51CF66]">Max {petsMaxCount} pets</p>
            </div>
          </div>
        )}
      </div>

      {/* Pet Fees */}
      {(petDeposit || petRentMonthly) && (
        <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg p-4 space-y-2">
          <p className="text-xs font-semibold text-[#212529] uppercase tracking-wide">Pet fees</p>
          {petDeposit && (
            <div className="flex justify-between text-sm">
              <span className="text-[#495057]">Pet deposit (one-time)</span>
              <span className="font-semibold text-[#212529]">{formatMoney(petDeposit)}</span>
            </div>
          )}
          {petRentMonthly && (
            <div className="flex justify-between text-sm">
              <span className="text-[#495057]">Pet rent (monthly)</span>
              <span className="font-semibold text-[#212529]">{formatMoney(petRentMonthly)}/mo</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
