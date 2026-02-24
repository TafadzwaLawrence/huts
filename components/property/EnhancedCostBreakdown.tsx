'use client'

import { useState, useMemo } from 'react'
import { Calculator } from 'lucide-react'
import { formatPrice, calculateMonthlyMortgage } from '@/lib/utils'

interface CostBreakdownProps {
  price?: number | null
  salePrice?: number | null
  listingType?: string | null
  propertyTaxAnnual?: number | null
  hoaFeeMonthly?: number | null
  deposit?: number | null
  securityDeposit?: number | null
  applicationFee?: number | null
  adminFee?: number | null
  petDeposit?: number | null
  petRentMonthly?: number | null
  parkingFeeMonthly?: number | null
  utilityFees?: Record<string, number | string>
}

export default function CostBreakdown({
  price,
  salePrice,
  listingType,
  propertyTaxAnnual,
  hoaFeeMonthly,
  deposit,
  securityDeposit,
  applicationFee = 5000, // Default $50
  adminFee,
  petDeposit,
  petRentMonthly,
  parkingFeeMonthly,
  utilityFees = {},
}: CostBreakdownProps) {
  const isSale = listingType === 'sale' || !!salePrice
  const isRental = !isSale && !!price
  
  const [downPaymentPct, setDownPaymentPct] = useState(20)
  const [interestRate, setInterestRate] = useState(6.5)
  const [loanTerm, setLoanTerm] = useState(30)
  const [includePet, setIncludePet] = useState(false)
  const [includeParking, setIncludeParking] = useState(false)

  const costs = useMemo(() => {
    if (isSale && salePrice) {
      const mortgage = calculateMonthlyMortgage(salePrice, downPaymentPct, interestRate, loanTerm)
      const taxMonthly = propertyTaxAnnual ? Math.round(propertyTaxAnnual / 12) : 0
      const hoa = hoaFeeMonthly || 0
      const insurance = 15000
      const total = mortgage + taxMonthly + hoa + insurance

      return { items: [
          { label: 'Principal & interest', value: mortgage, pct: (mortgage / total) * 100 },
          ...(taxMonthly > 0 ? [{ label: 'Property tax', value: taxMonthly, pct: (taxMonthly / total) * 100 }] : []),
          ...(hoa > 0 ? [{ label: 'HOA', value: hoa, pct: (hoa / total) * 100 }] : []),
          { label: 'Insurance', value: insurance, pct: (insurance / total) * 100 },
        ],
        total,
      }
    } else if (isRental && price) {
      const requiredMonthly: any[] = [
        { label: 'Monthly base rent', value: price },
      ]
      Object.entries(utilityFees).forEach(([key, value]) => {
        requiredMonthly.push({
          label: `${key.charAt(0).toUpperCase() + key.slice(1)} fee`,
          value: typeof value === 'number' ? value : 0,
          note: typeof value === 'string' ? value : undefined,
        })
      })

      const optionalMonthly: any[] = []
      if (petRentMonthly) {
        optionalMonthly.push({
          label: 'Pet rent',
          value: petRentMonthly,
          perUnit: `($${petRentMonthly / 100})`,
          included: includePet,
        })
      }
      if (parkingFeeMonthly) {
        optionalMonthly.push({
          label: 'Parking fee',
          value: parkingFeeMonthly,
          perUnit: `($${parkingFeeMonthly / 100})`,
          included: includeParking,
        })
      }

      const monthlyTotal = requiredMonthly.reduce((sum, item) => sum + item.value, 0) +
        optionalMonthly.filter(i => i.included).reduce((sum, item) => sum + item.value, 0)

      const oneTimeFees: any[] = []
      if (applicationFee) {
        oneTimeFees.push({ label: 'Application fee', value: applicationFee, refundable: false })
      }
      if (adminFee) {
        oneTimeFees.push({ label: 'Admin/Redecoration fee', value: adminFee, refundable: false })
      }
      const depositAmount = securityDeposit || deposit || 0
      if (depositAmount > 0) {
        oneTimeFees.push({ label: 'Security deposit', value: depositAmount, refundable: true })
      }

      const optionalOnetime: any[] = []
      if (petDeposit) {
        optionalOnetime.push({
          label: 'Pet deposit',
          value: petDeposit,
          perUnit: `($${petDeposit / 100})`,
          refundable: true,
          included: includePet,
        })
      }

      const oneTimeTotal = oneTimeFees.reduce((sum, item) => sum + item.value, 0) +
        optionalOnetime.filter(i => i.included).reduce((sum, item) => sum + item.value, 0)

      return {
        items: requiredMonthly,
        total: monthlyTotal,
        oneTime: oneTimeFees,
        oneTimeTotal,
        optional: optionalMonthly,
        optionalOnetime,
      }
    }
    return { items: [], total: 0 }
  }, [isSale, salePrice, price, downPaymentPct, interestRate, loanTerm, propertyTaxAnnual, hoaFeeMonthly, deposit, securityDeposit, applicationFee, adminFee, petRentMonthly, parkingFeeMonthly, utilityFees, includePet, includeParking, petDeposit])

  if (!costs || costs.items.length === 0) return null

  const colors = ['#212529', '#495057', '#ADB5BD', '#E9ECEF']

  return (
    <div className="border border-[#E9ECEF] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calculator size={16} className="text-[#212529]" />
        <h3 className="text-sm font-bold text-[#212529]">
          {isRental ? 'Cost calculator' : 'Monthly cost estimate'}
        </h3>
      </div>

      {isRental && (
        <p className="text-xs text-[#495057] mb-4">Estimate your total</p>
      )}

      {/* Total */}
      <div className="mb-4">
        <p className="text-xs text-[#495057] uppercase tracking-wide mb-1">
          {isRental ? 'Estimated monthly total' : 'Monthly payment'}
        </p>
        <span className="text-2xl font-bold text-[#212529]">
          {formatPrice(costs.total)}
        </span>
        {!isRental && <span className="text-sm text-[#ADB5BD]">/mo</span>}
      </div>

      {/* Visual bar (sale only) */}
      {isSale && (
        <div className="flex h-2 rounded-full overflow-hidden mb-4">
          {costs.items.filter((i: any) => i.pct > 0).map((item: any, i: number) => (
            <div
              key={item.label}
              style={{ width: `${item.pct}%`, backgroundColor: colors[i % colors.length] }}
            />
          ))}
        </div>
      )}

      {/* Monthly fees */}
      {isRental && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-[#212529] uppercase tracking-wide mb-2">
            Monthly rent, fees & charges
          </p>
          <p className="text-xs text-[#495057] mb-3">Required</p>
          <div className="space-y-2">
            {costs.items.map((item: any) => (
              <div key={item.label} className="flex justify-between text-sm">
                <div className="flex-1">
                  <span className="text-[#495057]">{item.label}</span>
                  {item.note && <span className="text-xs text-[#ADB5BD] block">{item.note}</span>}
                </div>
                <span className="font-medium text-[#212529]">
                  {item.value > 0 ? formatPrice(item.value) : item.note}
                </span>
              </div>
            ))}
          </div>

          {/* Optional monthly */}
          {costs.optional && costs.optional.length > 0 && (
            <>
              <p className="text-xs text-[#495057] mb-2 mt-4">Optional</p>
              {costs.optional.map((item: any) => (
                <div key={item.label} className="flex justify-between text-sm items-center mb-2">
                  <label className="flex items-center gap-2 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.included}
                      onChange={(e) => {
                        if (item.label.includes('Pet')) setIncludePet(e.target.checked)
                        if (item.label.includes('Parking')) setIncludeParking(e.target.checked)
                      }}
                      className="rounded border-[#ADB5BD] text-[#212529] focus:ring-[#212529]"
                    />
                    <span className="text-[#495057]">
                      {item.label} <span className="text-xs text-[#ADB5BD]">{item.perUnit}</span>
                    </span>
                  </label>
                  <span className="font-medium text-[#212529]">
                    {item.included ? formatPrice(item.value) : '$0'}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Sale property line items */}
      {isSale && (
        <div className="space-y-2.5 mb-4">
          {costs.items.map((item: any, i: number) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: colors[i % colors.length] }}
                />
                <span className="text-sm text-[#495057]">{item.label}</span>
              </div>
              <span className="text-sm font-medium text-[#212529]">{formatPrice(item.value)}</span>
            </div>
          ))}
        </div>
      )}

      {/* One-time fees (rental only) */}
      {isRental && costs.oneTime && costs.oneTime.length > 0 && (
        <div className="pt-4 border-t border-[#E9ECEF]">
          <p className="text-xs font-semibold text-[#212529] uppercase tracking-wide mb-3">
            One-time fees & charges
          </p>
          <p className="text-xs text-[#495057] mb-2">Required</p>
          <div className="space-y-2 mb-4">
            {costs.oneTime.map((item: any) => (
              <div key={item.label} className="flex justify-between text-sm">
                <div className="flex-1">
                  <span className="text-[#495057]">{item.label}</span>
                  {item.refundable && <span className="text-xs text-[#51CF66] block">Refundable</span>}
                </div>
                <span className="font-medium text-[#212529]">{formatPrice(item.value)}</span>
              </div>
            ))}
          </div>

          {/* Optional one-time */}
          {costs.optionalOnetime && costs.optionalOnetime.length > 0 && (
            <>
              <p className="text-xs text-[#495057] mb-2">Optional</p>
              {costs.optionalOnetime.map((item: any) => (
                <div key={item.label} className="flex justify-between text-sm mb-2">
                  <div className="flex-1">
                    <span className="text-[#495057]">
                      {item.label} <span className="text-xs text-[#ADB5BD]">{item.perUnit}</span>
                    </span>
                    {item.refundable && <span className="text-xs text-[#51CF66] block">Refundable</span>}
                  </div>
                  <span className="font-medium text-[#212529]">
                    {item.included ? formatPrice(item.value) : '$0'}
                  </span>
                </div>
              ))}
            </>
          )}

          <div className="mt-3 pt-3 border-t border-[#E9ECEF] flex justify-between">
            <span className="text-sm font-semibold text-[#212529]">Estimated total</span>
            <span className="text-sm font-bold text-[#212529]">{formatPrice(costs.oneTimeTotal || 0)}</span>
          </div>
        </div>
      )}

      {/* Sliders for sale properties */}
      {isSale && salePrice && (
        <div className="pt-4 border-t border-[#E9ECEF] space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#495057]">Down payment</span>
              <span className="font-medium text-[#212529]">{downPaymentPct}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={downPaymentPct}
              onChange={(e) => setDownPaymentPct(Number(e.target.value))}
              className="w-full h-1.5 bg-[#E9ECEF] rounded-full appearance-none cursor-pointer accent-[#212529]"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#495057]">Interest rate</span>
              <span className="font-medium text-[#212529]">{interestRate}%</span>
            </div>
            <input
              type="range"
              min="3"
              max="12"
              step="0.5"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-1.5 bg-[#E9ECEF] rounded-full appearance-none cursor-pointer accent-[#212529]"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#495057]">Loan term</span>
              <span className="font-medium text-[#212529]">{loanTerm} yr</span>
            </div>
            <input
              type="range"
              min="10"
              max="30"
              step="5"
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
              className="w-full h-1.5 bg-[#E9ECEF] rounded-full appearance-none cursor-pointer accent-[#212529]"
            />
          </div>
        </div>
      )}

      {isRental && (
        <p className="text-xs text-[#ADB5BD] mt-4 leading-relaxed">
          Displayed pricing may not reflect all required, optional or variable usage-based fees. For more details, please contact the property directly.
        </p>
      )}
    </div>
  )
}
