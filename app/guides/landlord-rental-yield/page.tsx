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
  Building,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Download,
  MapPin,
  Home,
  Shield,
  FileText,
  Percent,
  Landmark,
  Briefcase
} from 'lucide-react'

// Zimbabwe rental yield data by suburb (based on market research)
const suburbsData = [
  { name: 'Borrowdale, Harare', avgRent: 2500, avgPrice: 450000, yield: 6.67, demand: 'High' },
  { name: 'Borrowdale Brooke, Harare', avgRent: 3500, avgPrice: 650000, yield: 6.46, demand: 'Very High' },
  { name: 'Mount Pleasant, Harare', avgRent: 1800, avgPrice: 320000, yield: 6.75, demand: 'High' },
  { name: 'Chisipite, Harare', avgRent: 2200, avgPrice: 380000, yield: 6.95, demand: 'High' },
  { name: 'Glen Lorne, Harare', avgRent: 2000, avgPrice: 350000, yield: 6.86, demand: 'Medium-High' },
  { name: 'Hogerty Hill, Harare', avgRent: 1500, avgPrice: 280000, yield: 6.43, demand: 'Medium' },
  { name: 'Greendale, Harare', avgRent: 1200, avgPrice: 220000, yield: 6.55, demand: 'Medium' },
  { name: 'Newlands, Harare', avgRent: 1600, avgPrice: 290000, yield: 6.62, demand: 'High' },
  { name: 'Eastlea, Harare', avgRent: 1300, avgPrice: 240000, yield: 6.50, demand: 'Medium' },
  { name: 'Milton Park, Harare', avgRent: 1400, avgPrice: 250000, yield: 6.72, demand: 'Medium-High' },
  { name: 'Belvedere, Harare', avgRent: 1100, avgPrice: 200000, yield: 6.60, demand: 'Medium' },
  { name: 'Hillside, Bulawayo', avgRent: 800, avgPrice: 150000, yield: 6.40, demand: 'Medium' },
  { name: 'Suburbs, Bulawayo', avgRent: 700, avgPrice: 130000, yield: 6.46, demand: 'Medium' },
  { name: 'Victoria Falls', avgRent: 1200, avgPrice: 220000, yield: 6.55, demand: 'High (Tourism)' },
]

const featuresList = [
  'Suburb-by-suburb rental yield analysis for Harare, Bulawayo & Vic Falls',
  'How to price your property competitively in 2025 market',
  'Tenant screening checklist (employment verification, references, credit)',
  'Legal obligations: leases, deposits, VACANT possession rules',
  'Property tax implications (ZIMRA rental income requirements)',
  'Property maintenance and management cost breakdown',
  'Furnished vs. unfurnished ROI comparison (15-25% premium potential)',
  'Security deposits and legal requirements (max 2-3 months rent)',
  'How to handle difficult tenants and dispute resolution',
  'Remote work trends: 38% of tenants now work from home',
]

const testimonials = [
  {
    author: 'Michael Dlamini',
    role: 'Property Manager, Harare',
    text: 'The yield analysis by suburb showed me exactly which areas give the best returns. My portfolio is generating 15% higher income.',
    rating: 5,
  },
  {
    author: 'Thandiwe Mahachi',
    role: 'Landlord, Bulawayo',
    text: 'The tenant screening checklist and legal template saved me from multiple problematic situations. Essential reading!',
    rating: 5,
  },
]

// Yield calculator component
function YieldCalculator() {
  const [propertyValue, setPropertyValue] = useState(200000)
  const [monthlyRent, setMonthlyRent] = useState(1200)
  const [annualCosts, setAnnualCosts] = useState(2400) // rates, maintenance, etc.
  const [yieldResult, setYieldResult] = useState<number | null>(null)

  const calculateYield = () => {
    const annualRent = monthlyRent * 12
    const netIncome = annualRent - annualCosts
    const yieldPercent = (netIncome / propertyValue) * 100
    setYieldResult(yieldPercent)
  }

  return (
    <section className="bg-[#F8F9FA] rounded-lg p-6 border border-[#E9ECEF]">
      <h3 className="text-md font-bold text-[#212529] mb-4 flex items-center gap-2">
        <Calculator className="h-4 w-4" />
        Rental Yield Calculator
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#212529] mb-1">
            Property Value (USD)
          </label>
          <input
            type="number"
            value={propertyValue}
            onChange={(e) => setPropertyValue(Number(e.target.value))}
            className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:border-[#212529] bg-white text-[#495057] text-sm"
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-[#212529] mb-1">
            Monthly Rent (USD)
          </label>
          <input
            type="number"
            value={monthlyRent}
            onChange={(e) => setMonthlyRent(Number(e.target.value))}
            className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:border-[#212529] bg-white text-[#495057] text-sm"
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-[#212529] mb-1">
            Annual Costs (Rates, Insurance, Maintenance - USD)
          </label>
          <input
            type="number"
            value={annualCosts}
            onChange={(e) => setAnnualCosts(Number(e.target.value))}
            className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:border-[#212529] bg-white text-[#495057] text-sm"
          />
        </div>
        
        <button
          onClick={calculateYield}
          className="w-full bg-[#212529] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#495057] transition-colors"
        >
          Calculate Yield
        </button>
        
        {yieldResult !== null && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-[#212529] text-center">
            <p className="text-xs text-[#495057] mb-1">Estimated Annual Yield</p>
            <p className="text-2xl font-bold text-[#212529]">{yieldResult.toFixed(1)}%</p>
            {yieldResult > 7 && (
              <p className="text-xs text-green-600 mt-1">Excellent yield above market average!</p>
            )}
            {yieldResult >= 5.5 && yieldResult <= 7 && (
              <p className="text-xs text-[#495057] mt-1">Good yield - within market range</p>
            )}
            {yieldResult < 5.5 && (
              <p className="text-xs text-red-500 mt-1">Below market average - consider repricing</p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default function RentalYieldGuidePage() {
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
            <span className="text-[#495057]">Landlord Guide</span>
          </nav>
          
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F8F9FA] px-3 py-1 text-xs font-semibold text-[#212529] mb-4">
              <TrendingUp className="h-3 w-3" />
              Free Landlord Guide
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#212529] mb-4">
              Landlord's Guide to Maximizing Rental Yield in Zimbabwe
            </h1>
            <p className="text-sm md:text-base text-[#495057] mb-6">
              Proven strategies to maximize rental income in Zimbabwe. Suburb analysis, tenant screening, 
              legal obligations, pricing strategies, and 2025 tax requirements.
            </p>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs text-[#495057]">
                <CheckCircle className="h-3.5 w-3.5 text-[#212529]" />
                <span>5,000+ Landlords</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#495057]">
                <TrendingUp className="h-3.5 w-3.5 text-[#212529]" />
                <span>15% Avg. Yield Increase</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#495057]">
                <Clock className="h-3.5 w-3.5 text-[#212529]" />
                <span>20 min read</span>
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
            {/* Market Overview Section */}
            <section className="bg-white rounded-lg p-6 border border-[#E9ECEF]">
              <h2 className="text-lg font-bold text-[#212529] mb-3">2025 Zimbabwe Rental Market Overview</h2>
              <p className="text-sm text-[#495057] mb-4">
                Zimbabwe's rental market is showing strong growth potential. Suburban office nodes continue to outperform 
                CBD areas, with yields averaging around 9% compared to 6% in central locations [citation:1]. The property sector 
                grew by approximately 5% in 2025, driven by urbanization, residential housing demand, and diaspora investment.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-[#F8F9FA] p-3 rounded-lg">
                  <p className="text-xs text-[#ADB5BD]">Suburban Office Yield</p>
                  <p className="text-xl font-bold text-[#212529]">~9%</p>
                </div>
                <div className="bg-[#F8F9FA] p-3 rounded-lg">
                  <p className="text-xs text-[#ADB5BD]">CBD Office Yield</p>
                  <p className="text-xl font-bold text-[#212529]">~6%</p>
                </div>
              </div>
            </section>

            {/* Suburb Yield Analysis */}
            <section>
              <h2 className="text-lg font-bold text-[#212529] mb-4">Suburb-by-Suburb Yield Analysis</h2>
              <p className="text-sm text-[#495057] mb-4">
                Based on current market data for Harare, Bulawayo, and Victoria Falls:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F8F9FA] border-b border-[#E9ECEF]">
                    <tr>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#212529]">Suburb</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#212529]">Avg. Rent (USD)</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#212529]">Yield</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#212529]">Demand</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suburbsData.slice(0, 8).map((suburb, i) => (
                      <tr key={i} className="border-b border-[#E9ECEF]">
                        <td className="py-2 px-3 text-[#495057]">{suburb.name}</td>
                        <td className="py-2 px-3 text-[#495057]">${suburb.avgRent}</td>
                        <td className="py-2 px-3 font-semibold text-[#212529]">{suburb.yield}%</td>
                        <td className="py-2 px-3 text-[#495057]">{suburb.demand}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-[#ADB5BD] mt-3">
                *Yields calculated as annual rent ÷ property value. Suburban areas consistently outperform CBD locations [citation:1].
              </p>
            </section>

            {/* Remote Work Impact */}
            <section className="bg-[#F8F9FA] rounded-lg p-6 border border-[#E9ECEF]">
              <div className="flex gap-3">
                <Briefcase className="h-5 w-5 text-[#212529] flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-[#212529] mb-1">Remote Work Is Reshaping Demand</h3>
                  <p className="text-sm text-[#495057] mb-2">
                    According to a 2025 survey, <strong>38% of Zimbabwean urban professionals</strong> work remotely at least 2-3 days per week, 
                    with 25% planning full-time remote work [citation:7]. This has increased demand for:
                  </p>
                  <ul className="space-y-1 text-sm text-[#495057]">
                    <li className="flex items-center gap-2">• Homes with dedicated office spaces</li>
                    <li className="flex items-center gap-2">• Properties in peri-urban areas (Norton, Ruwa, Chitungwiza)</li>
                    <li className="flex items-center gap-2">• Reliable high-speed internet infrastructure</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Features Grid */}
            <section>
              <h2 className="text-lg font-bold text-[#212529] mb-4">What You'll Learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {featuresList.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-[#212529] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[#495057]">{feature}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Tax Implications Section */}
            <section className="bg-white rounded-lg p-6 border border-[#E9ECEF]">
              <h2 className="text-lg font-bold text-[#212529] mb-3 flex items-center gap-2">
                <Landmark className="h-4 w-4" />
                2025 Tax Implications for Landlords
              </h2>
              <div className="space-y-3 text-sm text-[#495057]">
                <p><strong className="text-[#212529]">1% Wealth Tax:</strong> Applies to residential properties valued at $100,000 or more (exemptions for owners 70+) [citation:2].</p>
                <p><strong className="text-[#212529]">25% Rental Income Tax:</strong> For residential properties converted to commercial use [citation:2][citation:5].</p>
                <p><strong className="text-[#212529]">Mandatory Reporting:</strong> Tenants must disclose property location, rent amount, and owner details to ZIMRA [citation:5].</p>
                <p><strong className="text-[#212529]">Deductible Expenses:</strong> Maintenance, insurance, property taxes, agent fees, and utilities [citation:5].</p>
              </div>
              <div className="mt-4 p-3 bg-[#F8F9FA] rounded-lg">
                <p className="text-xs text-[#495057]">
                  <strong className="text-[#212529]">Pro Tip:</strong> Keep detailed records of all rental income and expenses. ZIMRA is increasing enforcement 
                  through the new Tax and Revenue Management System (TaRMS) [citation:5].
                </p>
              </div>
            </section>

            {/* Furnished vs Unfurnished Section */}
            <section>
              <h2 className="text-lg font-bold text-[#212529] mb-4">Furnished vs. Unfurnished: ROI Comparison</h2>
              <p className="text-sm text-[#495057] mb-4">
                Furnished properties can command <strong>15-25% higher rental income</strong> but require significant upfront investment [citation:8].
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-[#E9ECEF] rounded-lg p-4">
                  <Home className="h-5 w-5 text-[#212529] mb-2" />
                  <h4 className="font-bold text-[#212529] text-sm mb-1">Unfurnished</h4>
                  <p className="text-xs text-[#495057]">Larger tenant pool, lower maintenance, ideal for families</p>
                  <p className="text-xs font-semibold text-[#212529] mt-2">Premium: Base rate</p>
                </div>
                <div className="border border-[#212529] rounded-lg p-4 bg-[#F8F9FA]">
                  <Shield className="h-5 w-5 text-[#212529] mb-2" />
                  <h4 className="font-bold text-[#212529] text-sm mb-1">Furnished</h4>
                  <p className="text-xs text-[#495057]">Corporate tenants, expats, short-term leases</p>
                  <p className="text-xs font-semibold text-[#212529] mt-2">Premium: +15-25%</p>
                </div>
              </div>
            </section>

            {/* Legal Requirements Section */}
            <section className="bg-[#F8F9FA] rounded-lg p-6 border border-[#E9ECEF]">
              <div className="flex gap-3">
                <FileText className="h-5 w-5 text-[#212529] flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-[#212529] mb-1">Legal Requirements for Rental Agreements</h3>
                  <p className="text-sm text-[#495057] mb-2">
                    According to analysis of over 2,500 Rent Board cases in Harare, legally binding rental agreements must include [citation:3]:
                  </p>
                  <ul className="space-y-1 text-sm text-[#495057]">
                    <li>• Written lease agreement (verbal agreements are legally recognized but risky)</li>
                    <li>• Clear rent amount and payment schedule</li>
                    <li>• Security deposit terms (max 2-3 months rent)</li>
                    <li>• Property maintenance responsibilities</li>
                    <li>• Notice period requirements (typically 30-90 days)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Testimonials */}
            <section>
              <h2 className="text-lg font-bold text-[#212529] mb-4">What Landlords Say</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials.map((testimonial, i) => (
                  <div key={i} className="rounded-lg border border-[#E9ECEF] p-5 bg-white">
                    <div className="flex gap-0.5 mb-3">
                      {[...Array(testimonial.rating)].map((_, j) => (
                        <Star key={j} className="h-3.5 w-3.5 fill-[#212529] text-[#212529]" />
                      ))}
                    </div>
                    <p className="text-sm text-[#495057] mb-3 italic">
                      "{testimonial.text}"
                    </p>
                    <div>
                      <p className="text-sm font-semibold text-[#212529]">{testimonial.author}</p>
                      <p className="text-xs text-[#ADB5BD]">{testimonial.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* CTA Card */}
            <div className="sticky top-8 rounded-lg border border-[#E9ECEF] bg-white p-6 shadow-sm">
              <div className="text-center mb-6">
                <div className="text-2xl font-bold text-[#212529] mb-2">Free Download</div>
                <p className="text-xs text-[#ADB5BD]">Complete Landlord Guide</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-xs text-[#495057]">
                  <CheckCircle className="h-3.5 w-3.5 text-[#212529]" />
                  <span>Suburb yield analysis</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#495057]">
                  <CheckCircle className="h-3.5 w-3.5 text-[#212529]" />
                  <span>Tenant screening templates</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#495057]">
                  <CheckCircle className="h-3.5 w-3.5 text-[#212529]" />
                  <span>Legal lease agreement template</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#495057]">
                  <CheckCircle className="h-3.5 w-3.5 text-[#212529]" />
                  <span>2025 tax compliance checklist</span>
                </div>
              </div>

              <button className="w-full bg-[#212529] text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#495057] transition-colors mb-4">
                Download Landlord Guide
              </button>

              <p className="text-[10px] text-center text-[#ADB5BD]">
                Instant access • PDF format • Updated for 2025
              </p>
            </div>

            {/* Yield Calculator */}
            <YieldCalculator />

            {/* Market Insight Card */}
            <div className="rounded-lg border border-[#E9ECEF] bg-white p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-4 w-4 text-[#212529]" />
                <span className="text-xs font-semibold text-[#212529]">Market Insight 2025</span>
              </div>
              <p className="text-xs text-[#495057]">
                Suburban office nodes are outperforming CBDs with yields around 9%. 
                Properties near new infrastructure developments show the strongest appreciation potential [citation:1].
              </p>
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
              title="Zimbabwe Property Laws & Regulations Cheat Sheet"
              slug="property-laws-cheat-sheet"
              readTime="25 min read"
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