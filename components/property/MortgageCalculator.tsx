'use client'

import { useState, useEffect } from 'react'
import { Calculator, DollarSign, Home, TrendingUp } from 'lucide-react'
import { formatPrice, calculateMonthlyMortgage, calculateTotalMonthlyCost } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface MortgageCalculatorProps {
  salePrice: number // in cents
  propertyTaxAnnual?: number | null // in cents
  hoaFeeMonthly?: number | null // in cents
  className?: string
}

export function MortgageCalculator({
  salePrice,
  propertyTaxAnnual,
  hoaFeeMonthly,
  className
}: MortgageCalculatorProps) {
  const [downPaymentPercent, setDownPaymentPercent] = useState(20)
  const [interestRate, setInterestRate] = useState(6.5)
  const [loanTerm, setLoanTerm] = useState(30)

  const [calculations, setCalculations] = useState({
    downPayment: 0,
    loanAmount: 0,
    monthlyMortgage: 0,
    propertyTaxMonthly: 0,
    hoaFeeMonthly: 0,
    insuranceEstimate: 15000, // $150/month
    totalMonthly: 0
  })

  useEffect(() => {
    const downPayment = Math.round((salePrice * downPaymentPercent) / 100)
    const loanAmount = salePrice - downPayment
    const monthlyMortgage = calculateMonthlyMortgage(
      salePrice,
      downPaymentPercent,
      interestRate,
      loanTerm
    )
    const propertyTaxMonthly = propertyTaxAnnual ? Math.round(propertyTaxAnnual / 12) : 0
    const hoaMonthly = hoaFeeMonthly || 0
    const insuranceEstimate = 15000
    const totalMonthly = calculateTotalMonthlyCost(
      monthlyMortgage,
      propertyTaxAnnual ?? null,
      hoaFeeMonthly ?? null,
      insuranceEstimate
    )

    setCalculations({
      downPayment,
      loanAmount,
      monthlyMortgage,
      propertyTaxMonthly,
      hoaFeeMonthly: hoaMonthly,
      insuranceEstimate,
      totalMonthly
    })
  }, [salePrice, downPaymentPercent, interestRate, loanTerm, propertyTaxAnnual, hoaFeeMonthly])

  return (
    <div className={cn('border-2 border-[#E9ECEF] rounded-lg p-6 space-y-6', className)}>
      <div className="flex items-center gap-3 border-b-2 border-[#E9ECEF] pb-4">
        <div className="p-2 bg-[#F8F9FA] rounded">
          <Calculator size={24} className="text-[#212529]" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-[#212529]">Mortgage Calculator</h3>
          <p className="text-sm text-[#495057]">Estimate your monthly payment</p>
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        {/* Down Payment */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#212529]">
              Down Payment
            </label>
            <span className="text-sm font-semibold text-[#212529]">
              {downPaymentPercent}% ({formatPrice(calculations.downPayment)})
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            step="5"
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
            className="w-full h-2 bg-[#E9ECEF] rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-[#ADB5BD]">
            <span>0%</span>
            <span>50%</span>
          </div>
        </div>

        {/* Interest Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#212529]">
              Interest Rate
            </label>
            <span className="text-sm font-semibold text-[#212529]">
              {interestRate.toFixed(2)}%
            </span>
          </div>
          <input
            type="range"
            min="3"
            max="10"
            step="0.25"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full h-2 bg-[#E9ECEF] rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-[#ADB5BD]">
            <span>3%</span>
            <span>10%</span>
          </div>
        </div>

        {/* Loan Term */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#212529]">
              Loan Term
            </label>
            <span className="text-sm font-semibold text-[#212529]">
              {loanTerm} years
            </span>
          </div>
          <div className="flex gap-2">
            {[15, 20, 25, 30].map((term) => (
              <button
                key={term}
                onClick={() => setLoanTerm(term)}
                className={cn(
                  'flex-1 py-2 text-sm font-medium border-2 rounded transition-all',
                  loanTerm === term
                    ? 'bg-[#212529] text-white border-[#212529]'
                    : 'bg-white text-[#495057] border-[#E9ECEF] hover:border-[#495057]'
                )}
              >
                {term}yr
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-[#F8F9FA] border-2 border-[#E9ECEF] rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#495057] flex items-center gap-2">
            <Home size={16} />
            Principal & Interest
          </span>
          <span className="font-semibold text-[#212529]">
            {formatPrice(calculations.monthlyMortgage)}
          </span>
        </div>

        {propertyTaxAnnual && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#495057]">Property Tax</span>
            <span className="font-semibold text-[#212529]">
              {formatPrice(calculations.propertyTaxMonthly)}
            </span>
          </div>
        )}

        {hoaFeeMonthly && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#495057]">HOA Fees</span>
            <span className="font-semibold text-[#212529]">
              {formatPrice(calculations.hoaFeeMonthly)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-[#495057]">Insurance (est.)</span>
          <span className="font-semibold text-[#212529]">
            {formatPrice(calculations.insuranceEstimate)}
          </span>
        </div>

        <div className="border-t-2 border-[#E9ECEF] pt-3 mt-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-[#212529] flex items-center gap-2">
              <TrendingUp size={18} />
              Total Monthly
            </span>
            <span className="text-2xl font-bold text-[#212529]">
              {formatPrice(calculations.totalMonthly)}
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <p className="text-xs text-[#ADB5BD]">
        * This calculator provides estimates only. Actual payments may vary based on your credit score, 
        lender fees, and other factors. Consult with a mortgage professional for accurate quotes.
      </p>
    </div>
  )
}
