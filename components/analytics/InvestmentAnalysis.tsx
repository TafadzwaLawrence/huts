'use client'

import { useEffect, useState } from 'react'
import { 
  TrendingUp, DollarSign, Home, Calculator, 
  ChevronDown, ChevronUp, AlertCircle, CheckCircle
} from 'lucide-react'
import type { InvestmentMetrics } from '@/lib/analysis'
import { ICON_SIZES } from '@/lib/constants'

interface InvestmentAnalysisProps {
  propertyId: string
}

export function InvestmentAnalysis({ propertyId }: InvestmentAnalysisProps) {
  const [data, setData] = useState<InvestmentMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Investment params (can be made interactive)
  const [downPayment, setDownPayment] = useState(20)
  const [interestRate, setInterestRate] = useState(6.5)

  useEffect(() => {
    async function loadInvestmentData() {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          type: 'investment',
          downPayment: downPayment.toString(),
          interestRate: interestRate.toString()
        })
        const res = await fetch(`/api/properties/${propertyId}/analytics?${params}`)
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || 'Failed to load investment data')
        }
        const investment = await res.json()
        setData(investment)
        setError(null)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadInvestmentData()
  }, [propertyId, downPayment, interestRate])

  if (loading) return <InvestmentSkeleton />
  if (error) return (
    <div className="text-sm text-[#6C757D] py-4 text-center">{error}</div>
  )
  if (!data) return null

  const recommendationStyles = {
    'strong-buy': 'bg-[#212529] text-white border-[#212529]',
    'buy': 'bg-[#495057] text-white border-[#495057]',
    'hold': 'bg-[#ADB5BD] text-white border-[#ADB5BD]',
    'avoid': 'bg-[#E9ECEF] text-[#495057] border-[#E9ECEF]'
  }

  const recommendationLabels = {
    'strong-buy': 'Strong Buy',
    'buy': 'Buy',
    'hold': 'Hold',
    'avoid': 'Avoid'
  }

  return (
    <div className="border border-[#E9ECEF] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-[#F8F9FA] border-b border-[#E9ECEF]">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Calculator size={ICON_SIZES.lg} />
            Investment Analysis
          </h3>
          <span className={`px-3 py-1 rounded border text-sm font-medium ${
            recommendationStyles[data.recommendation]
          }`}>
            {recommendationLabels[data.recommendation]}
          </span>
        </div>
        <p className="text-sm text-[#6C757D] mt-1">{data.analysis}</p>
      </div>

      {/* Key Metrics */}
      <div className="p-4 space-y-4">
        {/* Primary Metrics Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-[#F8F9FA] rounded">
            <div className="text-2xl font-bold">{data.capRate}%</div>
            <div className="text-xs text-[#6C757D]">Cap Rate</div>
          </div>
          <div className="text-center p-3 bg-[#F8F9FA] rounded">
            <div className="text-2xl font-bold">{data.cashOnCashReturn}%</div>
            <div className="text-xs text-[#6C757D]">Cash on Cash</div>
          </div>
          <div className="text-center p-3 bg-[#F8F9FA] rounded">
            <div className="text-2xl font-bold">{data.grossRentMultiplier}x</div>
            <div className="text-xs text-[#6C757D]">Gross Rent Multiplier</div>
          </div>
        </div>

        {/* Cash Flow */}
        <div className="flex items-center justify-between py-3 border-y border-[#E9ECEF]">
          <span className="text-sm text-[#6C757D]">Monthly Cash Flow</span>
          <span className={`text-lg font-bold ${
            data.monthlyNetCashFlow >= 0 ? 'text-[#212529]' : 'text-[#495057]'
          }`}>
            ${data.monthlyNetCashFlow.toLocaleString()}
            {data.monthlyNetCashFlow < 0 && (
              <AlertCircle size={ICON_SIZES.sm} className="inline ml-1" />
            )}
          </span>
        </div>

        {/* Rental Estimate */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#6C757D]">Est. Monthly Rent</span>
          <span className="font-semibold">
            ${(data.estimatedMonthlyRent / 100).toLocaleString()}/mo
          </span>
        </div>

        {/* Expand/Collapse Details */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-center gap-1 text-sm text-[#6C757D] hover:text-[#212529] py-2"
        >
          {showDetails ? 'Hide' : 'Show'} detailed breakdown
          {showDetails ? <ChevronUp size={ICON_SIZES.md} /> : <ChevronDown size={ICON_SIZES.md} />}
        </button>

        {/* Detailed Breakdown */}
        {showDetails && (
          <div className="space-y-4 pt-2 border-t border-[#E9ECEF]">
            {/* Adjustable Parameters */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#6C757D] mb-1">Down Payment %</label>
                <input
                  type="number"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  min={0}
                  max={100}
                  className="w-full px-3 py-2 border border-[#E9ECEF] rounded text-sm focus:outline-none focus:border-[#212529]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6C757D] mb-1">Interest Rate %</label>
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  min={0}
                  max={20}
                  step={0.1}
                  className="w-full px-3 py-2 border border-[#E9ECEF] rounded text-sm focus:outline-none focus:border-[#212529]"
                />
              </div>
            </div>

            {/* Financing Summary */}
            <div className="bg-[#F8F9FA] rounded p-3 space-y-2">
              <div className="text-xs font-medium text-[#495057] uppercase">Financing</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6C757D]">Down Payment</span>
                  <span>${(data.financing.downPayment / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6C757D]">Loan Amount</span>
                  <span>${(data.financing.loanAmount / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6C757D]">Monthly Mortgage</span>
                  <span>${(data.financing.monthlyMortgage / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6C757D]">Total Monthly</span>
                  <span className="font-medium">${(data.financing.totalMonthlyPayment / 100).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Expenses Breakdown */}
            <div className="bg-[#F8F9FA] rounded p-3 space-y-2">
              <div className="text-xs font-medium text-[#495057] uppercase">Annual Expenses</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6C757D]">Property Tax</span>
                  <span>${(data.estimatedExpenses.propertyTax / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6C757D]">Insurance</span>
                  <span>${(data.estimatedExpenses.insurance / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6C757D]">Maintenance</span>
                  <span>${(data.estimatedExpenses.maintenance / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6C757D]">Vacancy</span>
                  <span>${(data.estimatedExpenses.vacancy / 100).toLocaleString()}</span>
                </div>
                {data.estimatedExpenses.hoa > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#6C757D]">HOA</span>
                    <span>${(data.estimatedExpenses.hoa / 100).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-[#E9ECEF] font-medium">
                  <span>Total Expenses</span>
                  <span>${(data.estimatedExpenses.total / 100).toLocaleString()}/yr</span>
                </div>
              </div>
            </div>

            {/* Break-even Info */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6C757D]">Break-even Occupancy</span>
              <span className={data.breakEvenOccupancy > 90 ? 'text-[#495057]' : 'text-[#212529]'}>
                {data.breakEvenOccupancy}%
                {data.breakEvenOccupancy > 90 && (
                  <AlertCircle size={ICON_SIZES.xs} className="inline ml-1" />
                )}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6C757D]">Net Operating Income</span>
              <span className="font-medium">
                ${(data.netOperatingIncome / 100).toLocaleString()}/yr
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function InvestmentSkeleton() {
  return (
    <div className="border border-[#E9ECEF] rounded-lg overflow-hidden">
      <div className="p-4 bg-[#F8F9FA] border-b border-[#E9ECEF]">
        <div className="h-5 w-40 bg-[#E9ECEF] rounded animate-pulse" />
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-[#F8F9FA] rounded animate-pulse" />
          ))}
        </div>
        <div className="h-12 bg-[#F8F9FA] rounded animate-pulse" />
      </div>
    </div>
  )
}
