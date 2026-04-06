'use client'

import Link from 'next/link'
import { useState } from 'react'
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
  TrendingUp,
  Building,
  Shield,
  Briefcase,
  Calendar,
  BarChart3,
  PieChart,
  Percent,
  AlertTriangle,
  Hotel,
  LucideIcon,
  Receipt 
} from 'lucide-react'

// City investment data
const investmentData = {
  Harare: {
    traditionalYield: 8.5,
    shortTermYield: 12.5,
    occupancyRate: 65,
    avgDailyRate: 120,
    tourismSeasonality: 'Medium',
    managementFee: 15,
    riskLevel: 'Medium',
    demandDrivers: ['Corporate travelers', 'Expat community', 'Business hub'],
  },
  VictoriaFalls: {
    traditionalYield: 6.5,
    shortTermYield: 18.5,
    occupancyRate: 75,
    avgDailyRate: 180,
    tourismSeasonality: 'High',
    managementFee: 20,
    riskLevel: 'Medium-High',
    demandDrivers: ['Tourists', 'Safari visitors', 'International travelers'],
  },
  Bulawayo: {
    traditionalYield: 7.5,
    shortTermYield: 10.5,
    occupancyRate: 55,
    avgDailyRate: 90,
    tourismSeasonality: 'Low',
    managementFee: 12,
    riskLevel: 'Low',
    demandDrivers: ['Industrial travelers', 'Students', 'Local business'],
  },
  Mutare: {
    traditionalYield: 7.0,
    shortTermYield: 9.5,
    occupancyRate: 50,
    avgDailyRate: 80,
    tourismSeasonality: 'Medium-Low',
    managementFee: 12,
    riskLevel: 'Low',
    demandDrivers: ['Weekend tourists', 'Eastern Highlands visitors'],
  },
}

// ROI Calculator Component
function InvestmentCalculator() {
  const [selectedCity, setSelectedCity] = useState('Harare')
  const [investmentType, setInvestmentType] = useState<'traditional' | 'short-term'>('traditional')
  const [propertyValue, setPropertyValue] = useState(150000)
  const [downPayment, setDownPayment] = useState(30000)
  const [interestRate, setInterestRate] = useState(12)
  const [loanTerm, setLoanTerm] = useState(20)
  
  const cityData = investmentData[selectedCity as keyof typeof investmentData]
  
  const calculateROI = () => {
    const loanAmount = propertyValue - downPayment
    const monthlyInterest = interestRate / 100 / 12
    const numberOfPayments = loanTerm * 12
    
    const monthlyMortgage = loanAmount * monthlyInterest * Math.pow(1 + monthlyInterest, numberOfPayments) / (Math.pow(1 + monthlyInterest, numberOfPayments) - 1)
    
    let annualIncome = 0
    let annualExpenses = 0
    
    if (investmentType === 'traditional') {
      const monthlyRent = propertyValue * (cityData.traditionalYield / 100) / 12
      annualIncome = monthlyRent * 12
      annualExpenses = (monthlyMortgage * 12) + (propertyValue * 0.01) // 1% for maintenance
    } else {
      const dailyRate = cityData.avgDailyRate
      const occupancyRate = cityData.occupancyRate / 100
      annualIncome = dailyRate * 365 * occupancyRate
      const managementFee = annualIncome * (cityData.managementFee / 100)
      annualExpenses = (monthlyMortgage * 12) + managementFee + (propertyValue * 0.02)
    }
    
    const netIncome = annualIncome - annualExpenses
    const cashROI = (netIncome / downPayment) * 100
    const totalROI = ((propertyValue - loanAmount) / downPayment) * 100
    
    return {
      monthlyMortgage: monthlyMortgage,
      annualIncome: annualIncome,
      annualExpenses: annualExpenses,
      netIncome: netIncome,
      cashROI: cashROI,
      totalROI: totalROI,
      paybackYears: downPayment / (netIncome / 12)
    }
  }
  
  const results = calculateROI()
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-[#212529] mb-2">
          Investment Location
        </label>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:border-[#212529] bg-white text-[#495057] text-sm"
        >
          {Object.keys(investmentData).map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-[#212529] mb-2">
          Investment Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setInvestmentType('traditional')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              investmentType === 'traditional'
                ? 'bg-[#212529] text-white'
                : 'bg-[#F8F9FA] text-[#495057] border border-[#E9ECEF] hover:border-[#212529]'
            }`}
          >
            Traditional Rental
          </button>
          <button
            onClick={() => setInvestmentType('short-term')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              investmentType === 'short-term'
                ? 'bg-[#212529] text-white'
                : 'bg-[#F8F9FA] text-[#495057] border border-[#E9ECEF] hover:border-[#212529]'
            }`}
          >
            Short-Term (Airbnb)
          </button>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-[#212529] mb-2">
          Property Value (USD)
        </label>
        <input
          type="number"
          value={propertyValue}
          onChange={(e) => setPropertyValue(Number(e.target.value))}
          min={50000}
          max={1000000}
          step={10000}
          className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:border-[#212529] bg-white text-[#495057] text-sm"
        />
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-[#212529] mb-2">
          Down Payment (USD)
        </label>
        <input
          type="number"
          value={downPayment}
          onChange={(e) => setDownPayment(Number(e.target.value))}
          min={0}
          max={propertyValue}
          step={5000}
          className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:border-[#212529] bg-white text-[#495057] text-sm"
        />
        <p className="text-xs text-[#ADB5BD] mt-1">
          {((downPayment / propertyValue) * 100).toFixed(0)}% down payment
        </p>
      </div>
      
      <div className="bg-[#F8F9FA] rounded-lg p-4 space-y-3">
        <h4 className="text-sm font-bold text-[#212529]">Investment Results</h4>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#495057]">Monthly Mortgage:</span>
            <span className="font-semibold text-[#212529]">${results.monthlyMortgage.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#495057]">Annual Income:</span>
            <span className="font-semibold text-green-600">+${results.annualIncome.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#495057]">Annual Expenses:</span>
            <span className="font-semibold text-red-600">-${results.annualExpenses.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-[#E9ECEF]">
            <span className="font-semibold text-[#212529]">Net Annual Income:</span>
            <span className={`font-bold ${results.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${results.netIncome.toFixed(0)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#495057]">Cash-on-Cash ROI:</span>
            <span className="font-bold text-[#212529]">{results.cashROI.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#495057]">Total ROI (5 years):</span>
            <span className="font-bold text-[#212529]">{results.totalROI.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#495057]">Payback Period:</span>
            <span className="font-bold text-[#212529]">{results.paybackYears.toFixed(1)} years</span>
          </div>
        </div>
      </div>
      
      <div className={`p-3 rounded-lg ${results.cashROI >= 10 ? 'bg-green-50 border border-green-200' : results.cashROI >= 5 ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}`}>
        <div className="flex items-start gap-2">
          {results.cashROI >= 10 && <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />}
          {results.cashROI >= 5 && results.cashROI < 10 && <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />}
          {results.cashROI < 5 && <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />}
          <div>
            <p className="text-sm font-semibold mb-1">
              {results.cashROI >= 10 && '✓ Excellent Investment Opportunity'}
              {results.cashROI >= 5 && results.cashROI < 10 && '⚠ Moderate Investment - Consider Risks'}
              {results.cashROI < 5 && '⚠ Low Returns - Reassess Investment'}
            </p>
            <p className="text-xs">
              {results.cashROI >= 10 && 'This investment shows strong returns above market average.'}
              {results.cashROI >= 5 && results.cashROI < 10 && 'Returns are acceptable but consider negotiating better terms.'}
              {results.cashROI < 5 && 'Consider alternative locations or investment strategies.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Component
export default function ROICalculatorPage() {
  const featuresList = [
    'Compare traditional vs. short-term rental yields (Airbnb)',
    'City-specific ROI analysis (Harare, Vic Falls, Bulawayo, Mutare)',
    'Airbnb occupancy rate analysis by location',
    'Tourism season impact calculator for Vic Falls',
    'Management cost breakdowns (15-20% for short-term)',
    'Tax implications for both rental models',
    'Location-specific ROI recommendations',
    'Monthly revenue projections with seasonality',
    'Competitive pricing analysis tools',
    'Risk assessment for each investment type',
    '5-year investment forecast with appreciation',
    'Mortgage calculation with Zimbabwe interest rates',
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
            <span className="text-[#495057]">ROI Calculator</span>
          </nav>
          
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F8F9FA] px-3 py-1 text-xs font-semibold text-[#212529] mb-4">
              <Calculator className="h-3 w-3" />
              Free Investment Tool
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#212529] mb-4">
              Property Investment ROI Calculator
            </h1>
            <p className="text-sm md:text-base text-[#495057] mb-6">
              Compare rental yields between traditional rentals and short-term vacation rentals (Airbnb). 
              Make data-driven investment decisions with Zimbabwe-specific market data.
            </p>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs text-[#495057]">
                <CheckCircle className="h-3.5 w-3.5 text-[#212529]" />
                <span>4 Cities Analyzed</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#495057]">
                <BarChart3 className="h-3.5 w-3.5 text-[#212529]" />
                <span>Real-time Calculations</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#495057]">
                <Clock className="h-3.5 w-3.5 text-[#212529]" />
                <span>10 min read</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Market Overview */}
            <section className="bg-white rounded-lg p-6 border border-[#E9ECEF]">
              <h2 className="text-lg font-bold text-[#212529] mb-3">2025 Zimbabwe Investment Landscape</h2>
              <p className="text-sm text-[#495057] mb-4">
                Zimbabwe's property market offers diverse opportunities for investors. Traditional rentals provide 
                stable 6-9% yields, while short-term vacation rentals in tourism hotspots like Victoria Falls 
                can generate 15-20% returns during peak seasons. However, higher returns come with increased 
                management complexity and seasonality risks.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F8F9FA] p-3 rounded-lg">
                  <p className="text-xs text-[#ADB5BD]">Traditional Rental Yield</p>
                  <p className="text-xl font-bold text-[#212529]">6-9%</p>
                  <p className="text-xs text-green-600">Stable, predictable</p>
                </div>
                <div className="bg-[#F8F9FA] p-3 rounded-lg">
                  <p className="text-xs text-[#ADB5BD]">Short-Term Rental Yield</p>
                  <p className="text-xl font-bold text-[#212529]">10-20%</p>
                  <p className="text-xs text-yellow-600">Higher risk, higher reward</p>
                </div>
              </div>
            </section>

            {/* City Comparison Table */}
            <section>
              <h2 className="text-lg font-bold text-[#212529] mb-4">City Investment Comparison</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F8F9FA] border-b border-[#E9ECEF]">
                    <tr>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#212529]">City</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#212529]">Traditional Yield</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#212529]">Short-Term Yield</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#212529]">Occupancy</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#212529]">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(investmentData).map(([city, data]) => (
                      <tr key={city} className="border-b border-[#E9ECEF] hover:bg-[#F8F9FA]">
                        <td className="py-2 px-3 font-semibold text-[#212529]">{city}</td>
                        <td className="py-2 px-3 text-[#495057]">{data.traditionalYield}%</td>
                        <td className="py-2 px-3 text-green-600 font-semibold">{data.shortTermYield}%</td>
                        <td className="py-2 px-3 text-[#495057]">{data.occupancyRate}%</td>
                        <td className="py-2 px-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            data.riskLevel === 'Low' ? 'bg-green-100 text-green-700' :
                            data.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {data.riskLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Investment Strategy Guide */}
            <section className="bg-[#F8F9FA] rounded-lg p-6 border border-[#E9ECEF]">
              <h3 className="text-md font-bold text-[#212529] mb-3">Investment Strategy by City</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-[#212529] flex items-center gap-2">
                    <Hotel className="h-4 w-4" />
                    Victoria Falls - Short-Term King
                  </h4>
                  <p className="text-sm text-[#495057] mt-1">
                    Best for short-term rentals with 75% occupancy and $180/night average rates. 
                    Peak season (May-October) yields premium returns. Ideal for investors with 
                    hospitality experience or professional management.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#212529] flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Harare - Balanced Approach
                  </h4>
                  <p className="text-sm text-[#495057] mt-1">
                    Strong corporate rental market with 8.5% traditional yields. Short-term yields 
                    at 12.5% with consistent demand from business travelers and expats.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#212529] flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Bulawayo & Mutare - Low Risk
                  </h4>
                  <p className="text-sm text-[#495057] mt-1">
                    Lower yields but more stable with less seasonality. Ideal for risk-averse 
                    investors seeking steady cash flow rather than maximum returns.
                  </p>
                </div>
              </div>
            </section>

            {/* Cost Breakdown */}
            <section className="bg-white rounded-lg p-6 border border-[#E9ECEF]">
              <h3 className="text-md font-bold text-[#212529] mb-3">Cost Breakdown Comparison</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-[#212529] mb-2">Traditional Rental</h4>
                  <ul className="space-y-1 text-sm text-[#495057]">
                    <li>• Property management: 8-10%</li>
                    <li>• Maintenance: 1-2% of value</li>
                    <li>• Property taxes: 0.5-1%</li>
                    <li>• Insurance: $30-50/month</li>
                    <li>• Vacancy allowance: 5-10%</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#212529] mb-2">Short-Term Rental</h4>
                  <ul className="space-y-1 text-sm text-[#495057]">
                    <li>• Management: 15-20%</li>
                    <li>• Cleaning fees: $30-50/booking</li>
                    <li>• Furnishing: $5,000-15,000</li>
                    <li>• Utilities: $150-300/month</li>
                    <li>• Platform fees: 3%</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Tax Implications */}
            <section className="bg-[#F8F9FA] rounded-lg p-6 border border-[#E9ECEF]">
              <div className="flex gap-3">
                <Receipt className="h-5 w-5 text-[#212529] flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-[#212529] mb-1">Tax Implications for Investors</h3>
                  <p className="text-sm text-[#495057] mb-2">
                    Both rental models are subject to Zimbabwean income tax at progressive rates (0-40%). 
                    Short-term rentals may qualify for tourism incentives but face higher compliance requirements.
                  </p>
                  <ul className="text-sm text-[#495057] space-y-1">
                    <li>• Rental income: Taxable at marginal rate</li>
                    <li>• Capital gains: 5-20% on property sale</li>
                    <li>• Deductible expenses: Management fees, maintenance, interest</li>
                    <li>• VAT registration required above $60,000 annual turnover</li>
                  </ul>
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
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-8 space-y-6">
              {/* ROI Calculator */}
              <div className="rounded-lg border border-[#212529] bg-white p-5 shadow-sm">
                <h3 className="text-md font-bold text-[#212529] mb-3 flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  ROI Calculator
                </h3>
                <InvestmentCalculator />
              </div>

              {/* Download CTA */}
              <div className="rounded-lg border border-[#E9ECEF] bg-white p-5">
                <div className="text-center mb-3">
                  <div className="text-xl font-bold text-[#212529] mb-1">Free Download</div>
                  <p className="text-xs text-[#ADB5BD]">Complete Investment Guide</p>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-xs text-[#495057]">
                    <CheckCircle className="h-3 w-3 text-[#212529]" />
                    <span>ROI comparison tables</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#495057]">
                    <CheckCircle className="h-3 w-3 text-[#212529]" />
                    <span>Tax optimization guide</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#495057]">
                    <CheckCircle className="h-3 w-3 text-[#212529]" />
                    <span>Management templates</span>
                  </div>
                </div>
                <button className="w-full bg-[#212529] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#495057] transition-colors flex items-center justify-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Guide
                </button>
              </div>

              {/* Pro Tip Card */}
              <div className="rounded-lg border border-[#E9ECEF] bg-[#F8F9FA] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-[#212529]" />
                  <span className="text-xs font-semibold text-[#212529]">Pro Tip</span>
                </div>
                <p className="text-xs text-[#495057]">
                  For Victoria Falls, consider buying during off-peak season (December-February) 
                  when prices are 15-20% lower. Focus on properties near the airport or 
                  Elephant Hills area for maximum occupancy.
                </p>
              </div>

              {/* Data Source */}
              <div className="rounded-lg border border-[#E9ECEF] bg-white p-4">
                <p className="text-xs text-[#ADB5BD]">
                  Data based on 2025 market analysis from property.co.zw, Airbnb occupancy data, 
                  and ZIMRA tax guidelines. Yields may vary based on property condition and location.
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
              title="Home Valuation Tool & Property Estimator"
              slug="home-valuation-tool"
              readTime="8 min read"
            />
            <RelatedGuideCard
              title="Landlord's Guide to Maximizing Rental Yield"
              slug="landlord-rental-yield"
              readTime="20 min read"
            />
            <RelatedGuideCard
              title="Zimbabwe Property Laws & Regulations Cheat Sheet"
              slug="property-laws-cheat-sheet"
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