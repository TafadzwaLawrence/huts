'use client'

import { useState, useMemo } from 'react'
import { DollarSign, TrendingUp, Calculator, ArrowRight, Info } from 'lucide-react'
import Link from 'next/link'

export default function RentVsBuyPage() {
  const [monthlyRent, setMonthlyRent] = useState(150000) // in cents ($1,500)
  const [homePrice, setHomePrice] = useState(35000000) // in cents ($350,000)
  const [downPaymentPct, setDownPaymentPct] = useState(20)
  const [interestRate, setInterestRate] = useState(6.5)
  const [loanTermYears, setLoanTermYears] = useState(30)
  const [annualRentIncrease, setAnnualRentIncrease] = useState(3)
  const [annualAppreciation, setAnnualAppreciation] = useState(3)
  const [propertyTaxRate, setPropertyTaxRate] = useState(1.2)
  const [yearsToCompare, setYearsToCompare] = useState(10)

  const results = useMemo(() => {
    const principal = homePrice * (1 - downPaymentPct / 100)
    const monthlyRate = interestRate / 100 / 12
    const numPayments = loanTermYears * 12

    // Monthly mortgage payment
    const monthlyMortgage = monthlyRate === 0
      ? principal / numPayments
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1)

    // Monthly property tax + insurance (estimate)
    const monthlyPropertyTax = (homePrice * propertyTaxRate / 100) / 12
    const monthlyInsurance = homePrice * 0.003 / 12
    const monthlyOwnershipCost = monthlyMortgage + monthlyPropertyTax + monthlyInsurance

    // Calculate cumulative costs over time
    const yearlyData = []
    let totalRentPaid = 0
    let totalBuyCost = 0
    let currentRent = monthlyRent
    let homeValue = homePrice
    let equityBuilt = homePrice * downPaymentPct / 100
    let remainingBalance = principal

    for (let year = 1; year <= Math.min(yearsToCompare, 30); year++) {
      // Rent costs for this year
      totalRentPaid += currentRent * 12
      currentRent = Math.round(currentRent * (1 + annualRentIncrease / 100))

      // Buy costs for this year
      const yearMortgage = monthlyMortgage * 12
      const yearTax = monthlyPropertyTax * 12
      const yearInsurance = monthlyInsurance * 12
      totalBuyCost += yearMortgage + yearTax + yearInsurance

      // Equity from appreciation
      homeValue = Math.round(homeValue * (1 + annualAppreciation / 100))

      // Principal paid this year (rough estimate)
      const interestThisYear = remainingBalance * interestRate / 100
      const principalThisYear = yearMortgage - interestThisYear
      remainingBalance = Math.max(0, remainingBalance - principalThisYear)
      equityBuilt = homeValue - remainingBalance

      yearlyData.push({
        year,
        totalRentCost: totalRentPaid,
        totalBuyCost: totalBuyCost + homePrice * downPaymentPct / 100, // Include down payment
        netBuyCost: totalBuyCost + homePrice * downPaymentPct / 100 - equityBuilt + homePrice, // Total cost minus home value
        equity: equityBuilt,
        homeValue,
        monthlyRent: currentRent,
      })
    }

    // Find break-even year
    const breakEvenYear = yearlyData.find(d => d.totalRentCost > d.netBuyCost)?.year || null

    return {
      monthlyMortgage: Math.round(monthlyMortgage),
      monthlyOwnershipCost: Math.round(monthlyOwnershipCost),
      yearlyData,
      breakEvenYear,
      totalRentCost: totalRentPaid,
      totalBuyCost,
      equity: equityBuilt,
      homeValue,
    }
  }, [monthlyRent, homePrice, downPaymentPct, interestRate, loanTermYears, annualRentIncrease, annualAppreciation, propertyTaxRate, yearsToCompare])

  const formatMoney = (cents: number) => {
    const dollars = cents / 100
    if (dollars >= 1000000) return `$${(dollars / 1000000).toFixed(1)}M`
    if (dollars >= 1000) return `$${(dollars / 1000).toFixed(0)}K`
    return `$${dollars.toFixed(0)}`
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-[#F8F9FA] border-b border-[#E9ECEF]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-[#212529] tracking-tight mb-4">
            Rent vs. Buy Calculator
          </h1>
          <p className="text-lg text-[#495057] max-w-2xl mx-auto">
            Should you rent or buy? Compare the total costs over time and find your break-even point.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left: Inputs */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-6">
              <h2 className="text-lg font-bold text-[#212529] mb-5">Parameters</h2>

              {/* Monthly Rent */}
              <div className="mb-5">
                <label className="text-sm font-medium text-[#495057] mb-2 block">
                  Monthly Rent: {formatMoney(monthlyRent)}
                </label>
                <input
                  type="range"
                  min={50000}
                  max={1000000}
                  step={5000}
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  className="w-full accent-[#212529]"
                />
              </div>

              {/* Home Price */}
              <div className="mb-5">
                <label className="text-sm font-medium text-[#495057] mb-2 block">
                  Home Price: {formatMoney(homePrice)}
                </label>
                <input
                  type="range"
                  min={5000000}
                  max={200000000}
                  step={500000}
                  value={homePrice}
                  onChange={(e) => setHomePrice(Number(e.target.value))}
                  className="w-full accent-[#212529]"
                />
              </div>

              {/* Down Payment */}
              <div className="mb-5">
                <label className="text-sm font-medium text-[#495057] mb-2 block">
                  Down Payment: {downPaymentPct}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={1}
                  value={downPaymentPct}
                  onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                  className="w-full accent-[#212529]"
                />
              </div>

              {/* Interest Rate */}
              <div className="mb-5">
                <label className="text-sm font-medium text-[#495057] mb-2 block">
                  Interest Rate: {interestRate}%
                </label>
                <input
                  type="range"
                  min={1}
                  max={15}
                  step={0.1}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full accent-[#212529]"
                />
              </div>

              {/* Years to Compare */}
              <div className="mb-5">
                <label className="text-sm font-medium text-[#495057] mb-2 block">
                  Years to Compare: {yearsToCompare}
                </label>
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={yearsToCompare}
                  onChange={(e) => setYearsToCompare(Number(e.target.value))}
                  className="w-full accent-[#212529]"
                />
              </div>

              {/* Appreciation */}
              <div className="mb-5">
                <label className="text-sm font-medium text-[#495057] mb-2 block">
                  Annual Home Appreciation: {annualAppreciation}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={0.5}
                  value={annualAppreciation}
                  onChange={(e) => setAnnualAppreciation(Number(e.target.value))}
                  className="w-full accent-[#212529]"
                />
              </div>

              {/* Rent Increase */}
              <div>
                <label className="text-sm font-medium text-[#495057] mb-2 block">
                  Annual Rent Increase: {annualRentIncrease}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={0.5}
                  value={annualRentIncrease}
                  onChange={(e) => setAnnualRentIncrease(Number(e.target.value))}
                  className="w-full accent-[#212529]"
                />
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-2">
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-4">
                <DollarSign size={16} className="text-[#ADB5BD] mb-2" />
                <p className="text-xs text-[#ADB5BD] font-medium">Monthly Mortgage</p>
                <p className="text-lg font-bold text-[#212529]">{formatMoney(results.monthlyMortgage)}</p>
              </div>
              <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-4">
                <Calculator size={16} className="text-[#ADB5BD] mb-2" />
                <p className="text-xs text-[#ADB5BD] font-medium">Total Monthly Cost</p>
                <p className="text-lg font-bold text-[#212529]">{formatMoney(results.monthlyOwnershipCost)}</p>
              </div>
              <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-4">
                <TrendingUp size={16} className="text-[#ADB5BD] mb-2" />
                <p className="text-xs text-[#ADB5BD] font-medium">Equity at {yearsToCompare}yr</p>
                <p className="text-lg font-bold text-[#212529]">{formatMoney(results.equity)}</p>
              </div>
              <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-4">
                <Info size={16} className="text-[#ADB5BD] mb-2" />
                <p className="text-xs text-[#ADB5BD] font-medium">Break-even</p>
                <p className="text-lg font-bold text-[#212529]">
                  {results.breakEvenYear ? `Year ${results.breakEvenYear}` : 'N/A'}
                </p>
              </div>
            </div>

            {/* Comparison chart (simple bar visualization) */}
            <div className="bg-white border border-[#E9ECEF] rounded-xl p-6 mb-8">
              <h3 className="text-base font-bold text-[#212529] mb-6">
                Cost Comparison Over {yearsToCompare} Years
              </h3>

              <div className="space-y-4">
                {results.yearlyData.filter((_, i) => {
                  // Show every year if <=10, otherwise show every other year
                  return yearsToCompare <= 10 || i % 2 === 0 || i === results.yearlyData.length - 1
                }).map((d) => {
                  const maxVal = Math.max(d.totalRentCost, d.totalBuyCost)
                  const rentWidth = maxVal > 0 ? (d.totalRentCost / maxVal) * 100 : 0
                  const buyWidth = maxVal > 0 ? (d.totalBuyCost / maxVal) * 100 : 0

                  return (
                    <div key={d.year}>
                      <div className="flex items-center justify-between text-xs text-[#495057] mb-1">
                        <span className="font-medium">Year {d.year}</span>
                        <span className="text-[#ADB5BD]">Equity: {formatMoney(d.equity)}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#ADB5BD] w-10">Rent</span>
                          <div className="flex-1 bg-[#F8F9FA] rounded-full h-4 overflow-hidden">
                            <div
                              className="bg-[#ADB5BD] h-full rounded-full transition-all duration-500"
                              style={{ width: `${rentWidth}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-[#495057] w-16 text-right">{formatMoney(d.totalRentCost)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#ADB5BD] w-10">Buy</span>
                          <div className="flex-1 bg-[#F8F9FA] rounded-full h-4 overflow-hidden">
                            <div
                              className="bg-[#212529] h-full rounded-full transition-all duration-500"
                              style={{ width: `${buyWidth}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-[#495057] w-16 text-right">{formatMoney(d.totalBuyCost)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Verdict */}
            <div className="bg-[#212529] text-white rounded-xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                {results.breakEvenYear && results.breakEvenYear <= yearsToCompare
                  ? <TrendingUp size={20} />
                  : <DollarSign size={20} />
                }
              </div>
              <div>
                <h3 className="font-bold mb-1">
                  {results.breakEvenYear && results.breakEvenYear <= yearsToCompare
                    ? `Buying breaks even in ${results.breakEvenYear} years`
                    : `Renting may be better for this period`
                  }
                </h3>
                <p className="text-sm text-white/70">
                  {results.breakEvenYear && results.breakEvenYear <= yearsToCompare
                    ? `After ${results.breakEvenYear} years, buying becomes cheaper than renting. By year ${yearsToCompare}, you'd have ${formatMoney(results.equity)} in equity.`
                    : `Over ${yearsToCompare} years, renting costs ${formatMoney(results.totalRentCost)} vs buying costs ${formatMoney(results.totalBuyCost)}. Consider extending the timeframe.`
                  }
                </p>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <Link
                href="/search?type=sale"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#212529] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors"
              >
                Browse homes for sale <ArrowRight size={16} />
              </Link>
              <Link
                href="/search?type=rent"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#E9ECEF] text-[#212529] rounded-xl text-sm font-medium hover:border-[#212529] transition-colors"
              >
                Find rentals <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
