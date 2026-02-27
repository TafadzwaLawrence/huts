'use client'

import { useState, useEffect, useMemo } from 'react'
import { Calculator } from 'lucide-react'
import { formatPrice, calculateMonthlyMortgage } from '@/lib/utils'

interface CostBreakdownProps {
  price?: number | null      // rent price in cents (monthly)
  salePrice?: number | null  // sale price in cents
  listingType?: string | null
  propertyTaxAnnual?: number | null // in cents
  hoaFeeMonthly?: number | null     // in cents
  deposit?: number | null           // in cents
}

export default function CostBreakdown({
  price,
  salePrice,
  listingType,
  propertyTaxAnnual,
  hoaFeeMonthly,
  deposit,
}: CostBreakdownProps) {
  const isSale = listingType === 'sale' || !!salePrice
  
  // Mortgage calculator disabled for Zimbabwe market
  if (isSale) {
    return null
  }
  
  const [downPaymentPct, setDownPaymentPct] = useState(20)
  const [interestRate, setInterestRate] = useState(6.5)
  const [loanTerm, setLoanTerm] = useState(30)

  const costs = useMemo(() => {
    if (isSale && salePrice) {
      const mortgage = calculateMonthlyMortgage(salePrice, downPaymentPct, interestRate, loanTerm)
      const taxMonthly = propertyTaxAnnual ? Math.round(propertyTaxAnnual / 12) : 0
      const hoa = hoaFeeMonthly || 0
      const insurance = 15000 // $150/mo estimate in cents
      const total = mortgage + taxMonthly + hoa + insurance

      return {
        items: [
          { label: 'Principal & interest', value: mortgage, pct: total > 0 ? (mortgage / total) * 100 : 0 },
          ...(taxMonthly > 0 ? [{ label: 'Property tax', value: taxMonthly, pct: (taxMonthly / total) * 100 }] : []),
          ...(hoa > 0 ? [{ label: 'HOA', value: hoa, pct: (hoa / total) * 100 }] : []),
          { label: 'Insurance', value: insurance, pct: total > 0 ? (insurance / total) * 100 : 0 },
        ],
        total,
      }
    } else if (price) {
      return {
        items: [
          { label: 'Monthly rent', value: price, pct: 100 },
          ...(deposit ? [{ label: 'Deposit (one-time)', value: deposit, pct: 0 }] : []),
        ],
        total: price,
      }
    }
    return { items: [], total: 0 }
  }, [isSale, salePrice, price, downPaymentPct, interestRate, loanTerm, propertyTaxAnnual, hoaFeeMonthly, deposit])

  if (costs.items.length === 0) return null

  // Color segments for visual bar
  const colors = ['#212529', '#495057', '#ADB5BD', '#E9ECEF']

  return (
    <div className="border border-[#E9ECEF] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calculator size={16} className="text-[#212529]" />
        <h3 className="text-sm font-bold text-[#212529]">
          {isSale ? 'Monthly cost estimate' : 'Cost summary'}
        </h3>
      </div>

      {/* Total */}
      <div className="mb-4">
        <span className="text-2xl font-bold text-[#212529]">
          {formatPrice(costs.total)}
        </span>
        <span className="text-sm text-[#ADB5BD]">/mo</span>
      </div>

      {/* Visual bar */}
      {isSale && (
        <div className="flex h-2 rounded-full overflow-hidden mb-4">
          {costs.items.filter(i => i.pct > 0).map((item, i) => (
            <div
              key={item.label}
              style={{ width: `${item.pct}%`, backgroundColor: colors[i % colors.length] }}
            />
          ))}
        </div>
      )}

      {/* Line items */}
      <div className="space-y-2.5">
        {costs.items.map((item, i) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isSale && (
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.pct > 0 ? colors[i % colors.length] : '#E9ECEF' }}
                />
              )}
              <span className="text-sm text-[#495057]">{item.label}</span>
            </div>
            <span className="text-sm font-medium text-[#212529]">{formatPrice(item.value)}</span>
          </div>
        ))}
      </div>

      {/* Sliders for sale properties */}
      {isSale && salePrice && (
        <div className="mt-5 pt-4 border-t border-[#E9ECEF] space-y-3">
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
    </div>
  )
}
