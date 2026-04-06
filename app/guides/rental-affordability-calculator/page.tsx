'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  ChevronRight, 
  CheckCircle, 
  Clock,
  Users,
  Star,
  ArrowRight,
  Calculator,
  DollarSign,
  AlertCircle,
  Download,
  Home,
  Zap,
  Wifi,
  Droplets,
  Car,
  Shield,
  TrendingUp,
  PiggyBank,
  AlertTriangle
} from 'lucide-react'

// Zimbabwe utility cost estimates (monthly USD)
const UTILITY_COSTS = {
  zesa: { min: 50, max: 150, average: 80 },
  water: { min: 20, max: 60, average: 35 },
  internet: { min: 40, max: 120, average: 70 },
  security: { min: 30, max: 100, average: 60 },
  refuse: { min: 10, max: 25, average: 15 },
}

// Commuting costs by city (monthly USD)
const COMMUTING_COSTS = {
  Harare: { min: 40, max: 120, average: 70 },
  Bulawayo: { min: 30, max: 90, average: 55 },
  Mutare: { min: 25, max: 70, average: 45 },
  Gweru: { min: 25, max: 70, average: 45 },
  VictoriaFalls: { min: 30, max: 80, average: 50 },
  Other: { min: 20, max: 60, average: 40 },
}

// Rental price ranges by city (monthly USD)
const RENTAL_RANGES = {
  Harare: { min: 300, max: 3000, average: 800 },
  Bulawayo: { min: 200, max: 2000, average: 550 },
  Mutare: { min: 150, max: 1200, average: 400 },
  Gweru: { min: 150, max: 1200, average: 380 },
  VictoriaFalls: { min: 400, max: 2500, average: 900 },
  Other: { min: 120, max: 1000, average: 350 },
}

// Calculator component
function AffordabilityCalculator() {
  const [monthlyIncome, setMonthlyIncome] = useState(1500)
  const [selectedCity, setSelectedCity] = useState('Harare')
  const [bedrooms, setBedrooms] = useState(2)
  const [includeUtilities, setIncludeUtilities] = useState(true)
  const [includeCommuting, setIncludeCommuting] = useState(true)
  const [utilitiesEstimate, setUtilitiesEstimate] = useState(0)
  const [commutingEstimate, setCommutingEstimate] = useState(0)
  const [recommendedRent, setRecommendedRent] = useState(0)
  const [savingsPotential, setSavingsPotential] = useState(0)
  const [affordabilityStatus, setAffordabilityStatus] = useState<'safe' | 'stretched' | 'unsafe'>('safe')

  // Calculate utilities based on property size
  useEffect(() => {
    let totalUtilities = 0
    if (includeUtilities) {
      totalUtilities += UTILITY_COSTS.zesa.average
      totalUtilities += UTILITY_COSTS.water.average
      totalUtilities += UTILITY_COSTS.internet.average
      totalUtilities += UTILITY_COSTS.security.average
      totalUtilities += UTILITY_COSTS.refuse.average
      
      // Adjust for property size
      const sizeMultiplier = Math.min(1.5, Math.max(0.8, 1 + (bedrooms - 2) * 0.15))
      totalUtilities = Math.round(totalUtilities * sizeMultiplier)
    }
    setUtilitiesEstimate(totalUtilities)
  }, [includeUtilities, bedrooms])

  // Calculate commuting costs
  useEffect(() => {
    if (includeCommuting) {
      const cityData = COMMUTING_COSTS[selectedCity as keyof typeof COMMUTING_COSTS] || COMMUTING_COSTS.Other
      setCommutingEstimate(cityData.average)
    } else {
      setCommutingEstimate(0)
    }
  }, [includeCommuting, selectedCity])

  // Calculate affordability
  useEffect(() => {
    const maxRecommendedRent = monthlyIncome * 0.35 // 35% of income on rent is recommended
    const currentRent = maxRecommendedRent
    const totalMonthlyCost = currentRent + utilitiesEstimate + commutingEstimate
    const remainingIncome = monthlyIncome - totalMonthlyCost
    
    setRecommendedRent(Math.round(maxRecommendedRent))
    setSavingsPotential(remainingIncome)
    
    const rentToIncomeRatio = (currentRent / monthlyIncome) * 100
    if (rentToIncomeRatio <= 30) {
      setAffordabilityStatus('safe')
    } else if (rentToIncomeRatio <= 40) {
      setAffordabilityStatus('stretched')
    } else {
      setAffordabilityStatus('unsafe')
    }
  }, [monthlyIncome, utilitiesEstimate, commutingEstimate])

  const getRentRange = () => {
    const range = RENTAL_RANGES[selectedCity as keyof typeof RENTAL_RANGES] || RENTAL_RANGES.Other
    return `${range.min} - ${range.max}`
  }

  return (
    <div className="space-y-6">
      {/* Income Input */}
      <div>
        <label className="block text-sm font-semibold text-[#212529] mb-2">
          Monthly Household Income (USD)
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#ADB5BD]" />
          <input
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(Number(e.target.value))}
            min={100}
            max={10000}
            step={100}
            className="w-full pl-9 pr-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:border-[#212529] bg-white text-[#495057] text-sm"
          />
        </div>
      </div>

      {/* City Selection */}
      <div>
        <label className="block text-sm font-semibold text-[#212529] mb-2">
          City / Location
        </label>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:border-[#212529] bg-white text-[#495057] text-sm"
        >
          <option value="Harare">Harare</option>
          <option value="Bulawayo">Bulawayo</option>
          <option value="VictoriaFalls">Victoria Falls</option>
          <option value="Mutare">Mutare</option>
          <option value="Gweru">Gweru</option>
          <option value="Other">Other City</option>
        </select>
        <p className="text-xs text-[#ADB5BD] mt-1">
          Typical rent range: {getRentRange()} USD/month
        </p>
      </div>

      {/* Bedrooms */}
      <div>
        <label className="block text-sm font-semibold text-[#212529] mb-2">
          Bedrooms Needed
        </label>
        <select
          value={bedrooms}
          onChange={(e) => setBedrooms(Number(e.target.value))}
          className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:border-[#212529] bg-white text-[#495057] text-sm"
        >
          <option value={1}>Studio / 1 Bedroom</option>
          <option value={2}>2 Bedrooms</option>
          <option value={3}>3 Bedrooms</option>
          <option value={4}>4+ Bedrooms</option>
        </select>
      </div>

      {/* Expense Toggles */}
      <div className="space-y-2">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-[#495057]">Include Utilities (ZESA, Water, Internet, Security)</span>
          <button
            type="button"
            onClick={() => setIncludeUtilities(!includeUtilities)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              includeUtilities ? 'bg-[#212529]' : 'bg-[#E9ECEF]'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                includeUtilities ? 'translate-x-4' : 'translate-x-1'
              }`}
            />
          </button>
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-[#495057]">Include Commuting Costs</span>
          <button
            type="button"
            onClick={() => setIncludeCommuting(!includeCommuting)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              includeCommuting ? 'bg-[#212529]' : 'bg-[#E9ECEF]'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                includeCommuting ? 'translate-x-4' : 'translate-x-1'
              }`}
            />
          </button>
        </label>
      </div>

      {/* Results Section */}
      <div className="bg-[#F8F9FA] rounded-lg p-5 border border-[#E9ECEF] space-y-4">
        <div className="text-center pb-3 border-b border-[#E9ECEF]">
          <p className="text-xs text-[#ADB5BD]">Your Estimated Monthly Budget</p>
          <p className="text-2xl font-bold text-[#212529]">
            ${(recommendedRent + utilitiesEstimate + commutingEstimate).toLocaleString()}
          </p>
          <p className="text-xs text-[#495057] mt-1">
            {((recommendedRent + utilitiesEstimate + commutingEstimate) / monthlyIncome * 100).toFixed(0)}% of income
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#495057]">Maximum Rent (35% of income):</span>
            <span className="font-semibold text-[#212529]">${recommendedRent.toLocaleString()}</span>
          </div>
          {includeUtilities && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#495057]">Utilities (ZESA, Water, Internet, Security):</span>
              <span className="text-[#495057]">${utilitiesEstimate.toLocaleString()}</span>
            </div>
          )}
          {includeCommuting && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#495057]">Transport & Commuting:</span>
              <span className="text-[#495057]">${commutingEstimate.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-sm pt-2 border-t border-[#E9ECEF]">
            <span className="font-semibold text-[#212529]">Remaining for Savings/Living:</span>
            <span className={`font-semibold ${savingsPotential > 0 ? 'text-green-600' : 'text-red-500'}`}>
              ${savingsPotential.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Affordability Status */}
        <div className={`p-3 rounded-lg ${
          affordabilityStatus === 'safe' ? 'bg-green-50 border border-green-200' :
          affordabilityStatus === 'stretched' ? 'bg-yellow-50 border border-yellow-200' :
          'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start gap-2">
            {affordabilityStatus === 'safe' && <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />}
            {affordabilityStatus === 'stretched' && <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />}
            {affordabilityStatus === 'unsafe' && <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />}
            <div>
              <p className="text-sm font-semibold mb-1">
                {affordabilityStatus === 'safe' && '✓ Healthy Budget'}
                {affordabilityStatus === 'stretched' && '⚠ Stretched Budget'}
                {affordabilityStatus === 'unsafe' && '⚠ Unsafe Budget'}
              </p>
              <p className="text-xs">
                {affordabilityStatus === 'safe' && 'Your rent is within the recommended 30-35% of income. You have room for savings.'}
                {affordabilityStatus === 'stretched' && 'Rent is above 35% of income. Consider less expensive options or increasing income.'}
                {affordabilityStatus === 'unsafe' && 'Rent exceeds 40% of income. This may lead to financial strain.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <button className="w-full bg-[#212529] text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#495057] transition-colors flex items-center justify-center gap-2">
        <Download className="h-4 w-4" />
        Download Budget Planner (PDF)
      </button>
    </div>
  )
}

// Utility Cost Breakdown Component
function UtilityBreakdown() {
  return (
    <div className="bg-white rounded-lg p-5 border border-[#E9ECEF]">
      <h3 className="text-sm font-bold text-[#212529] mb-3 flex items-center gap-2">
        <Zap className="h-4 w-4" />
        Typical Monthly Utility Costs (USD)
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[#495057]">ZESA (Electricity)</span>
          <span className="text-[#212529]">$50 - $150</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#495057]">Water & Sewer</span>
          <span className="text-[#212529]">$20 - $60</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#495057]">Internet (Fiber/ADSL)</span>
          <span className="text-[#212529]">$40 - $120</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#495057]">Security (Alarm/Guards)</span>
          <span className="text-[#212529]">$30 - $100</span>
        </div>
        <div className="flex justify-between text-sm pt-2 border-t border-[#E9ECEF]">
          <span className="font-semibold text-[#212529]">Total Monthly</span>
          <span className="font-semibold text-[#212529]">$140 - $430</span>
        </div>
      </div>
    </div>
  )
}

// Main Component
export default function AffordabilityCalculatorPage() {
  const featuresList = [
    'Calculate monthly rental budget from your income',
    'Include utilities (ZESA, water, internet, security)',
    'Factor in commuting costs for your city',
    'City-specific rent ranges (Harare, Bulawayo, Vic Falls, etc.)',
    'Get savings recommendations based on affordability',
    'Downloadable budget planner template',
    'Track rent-to-income ratio for financial health',
    'Zimbabwe-specific cost estimates (2025 data)',
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Breadcrumb */}
      <div className="border-b border-[#E9ECEF]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#ADB5BD] mb-6">
            <Link href="/" className="hover:text-[#495057] transition-colors">Home</Link>
            <ChevronRight size={11} />
            <Link href="/guides" className="hover:text-[#495057] transition-colors">Guides</Link>
            <ChevronRight size={11} />
            <span className="text-[#495057]">Affordability Calculator</span>
          </nav>
          
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F8F9FA] px-3 py-1 text-xs font-semibold text-[#212529] mb-4">
              <Calculator className="h-3 w-3" />
              Free Interactive Tool
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#212529] mb-4">
              Rental Affordability Calculator & Budget Planner
            </h1>
            <p className="text-sm md:text-base text-[#495057] mb-6">
              Calculate your ideal rental budget including utilities, security, and commuting costs. 
              Get personalized recommendations based on your income and location in Zimbabwe.
            </p>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs text-[#495057]">
                <CheckCircle className="h-3.5 w-3.5 text-[#212529]" />
                <span>Zimbabwe-specific data</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#495057]">
                <Clock className="h-3.5 w-3.5 text-[#212529]" />
                <span>Updated for 2025</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#495057]">
                <Download className="h-3.5 w-3.5 text-[#212529]" />
                <span>PDF Budget Template</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Calculator */}
          <div className="lg:col-span-2 space-y-8">
            {/* Calculator Section */}
            <section className="bg-[#F8F9FA] rounded-lg p-6 border border-[#E9ECEF]">
              <h2 className="text-lg font-bold text-[#212529] mb-4">Calculate Your Budget</h2>
              <AffordabilityCalculator />
            </section>

            {/* Expert Tips Section */}
            <section className="bg-white rounded-lg p-6 border border-[#E9ECEF]">
              <h2 className="text-lg font-bold text-[#212529] mb-3">Expert Budgeting Tips</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <PiggyBank className="h-5 w-5 text-[#212529] flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-[#212529] mb-1">The 30% Rule</h4>
                    <p className="text-sm text-[#495057]">
                      Financial experts recommend spending no more than 30% of your gross monthly income on rent. 
                      In Zimbabwe's current market, aim for 30-35% to maintain financial flexibility.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Shield className="h-5 w-5 text-[#212529] flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-[#212529] mb-1">Hidden Costs to Consider</h4>
                    <p className="text-sm text-[#495057]">
                      Beyond rent and utilities, budget for security deposits (typically 2-3 months rent), 
                      agent fees, maintenance costs, and renters insurance.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Car className="h-5 w-5 text-[#212529] flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-[#212529] mb-1">Location vs. Commute Trade-off</h4>
                    <p className="text-sm text-[#495057]">
                      Paying slightly higher rent closer to work can save commuting costs and time. 
                      In Harare, consider Borrowdale, Mount Pleasant, or Avondale for work-life balance.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Features Grid */}
            <section>
              <h2 className="text-lg font-bold text-[#212529] mb-4">What You'll Get</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {featuresList.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-[#212529] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[#495057]">{feature}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Rent vs Buy Section */}
            <section className="bg-[#F8F9FA] rounded-lg p-6 border border-[#E9ECEF]">
              <h3 className="text-md font-bold text-[#212529] mb-3">Rent vs. Buy in Zimbabwe</h3>
              <p className="text-sm text-[#495057] mb-3">
                With average rental yields of 8-10% in Zimbabwe, renting often makes more financial sense 
                than buying in the short term. However, property values have appreciated significantly 
                (up 80% in Harare over 5 years), making buying a strong long-term investment.
              </p>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-white p-3 rounded-lg border border-[#E9ECEF]">
                  <p className="text-xs text-[#ADB5BD]">Average Monthly Rent (Harare)</p>
                  <p className="text-lg font-bold text-[#212529]">$800</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-[#E9ECEF]">
                  <p className="text-xs text-[#ADB5BD]">Average Home Price (Harare)</p>
                  <p className="text-lg font-bold text-[#212529]">$240,000</p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats Card */}
            <div className="sticky top-8 space-y-6">
              <div className="rounded-lg border border-[#E9ECEF] bg-white p-5">
                <h3 className="text-sm font-bold text-[#212529] mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Quick Stats (2025)
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#495057]">Harare 1-bed</span>
                    <span className="font-semibold text-[#212529]">$300-500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#495057]">Harare 2-bed</span>
                    <span className="font-semibold text-[#212529]">$500-1,200</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#495057]">Harare 3-bed</span>
                    <span className="font-semibold text-[#212529]">$800-3,000</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#E9ECEF]">
                    <span className="text-[#495057]">Bulawayo 2-bed</span>
                    <span className="font-semibold text-[#212529]">$350-800</span>
                  </div>
                </div>
              </div>

              {/* Utility Breakdown */}
              <UtilityBreakdown />

              {/* Savings Tip Card */}
              <div className="rounded-lg border border-[#E9ECEF] bg-[#F8F9FA] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <PiggyBank className="h-4 w-4 text-[#212529]" />
                  <span className="text-xs font-semibold text-[#212529]">Savings Tip</span>
                </div>
                <p className="text-xs text-[#495057]">
                  Consider co-living or renting with a roommate to reduce costs. 
                  A 2-bedroom apartment split with a roommate can lower your rent to 
                  $300-600/month in Harare, well within the 30% guideline.
                </p>
              </div>

              {/* Data Source */}
              <div className="rounded-lg border border-[#E9ECEF] bg-white p-5">
                <p className="text-xs text-[#ADB5BD]">
                  Cost estimates based on 2025 market data from property.co.zw listings 
                  and Zimbabwe National Statistics Agency (ZIMSTAT).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Guides Section */}
      <div className="border-t border-[#E9ECEF] bg-[#F8F9FA] py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#212529]">You Might Also Like</h2>
            <Link href="/guides" className="text-xs text-[#495057] hover:text-[#212529] transition-colors flex items-center gap-1">
              View all guides
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RelatedGuideCard
              title="The Ultimate Guide to Buying Property in Zimbabwe"
              slug="buying-guide-zimbabwe"
              readTime="25 min read"
            />
            <RelatedGuideCard
              title="Home Valuation Tool & Property Estimator"
              slug="home-valuation-tool"
              readTime="8 min read"
            />
            <RelatedGuideCard
              title="Moving to Harare, Bulawayo & Victoria Falls Guide"
              slug="relocation-guide"
              readTime="20 min read"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function RelatedGuideCard({ title, slug, readTime }: { title: string; slug: string; readTime: string }) {
  return (
    <Link href={`/guides/${slug}`}>
      <div className="group h-full cursor-pointer rounded-lg border border-[#E9ECEF] bg-white p-5 transition-all duration-300 hover:border-[#212529] hover:shadow-md">
        <h3 className="text-base font-bold text-[#212529] mb-2 transition-colors group-hover:text-[#495057] line-clamp-2">
          {title}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#ADB5BD]">{readTime}</span>
          <ChevronRight className="h-4 w-4 text-[#ADB5BD] transition-all group-hover:text-[#212529] group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}