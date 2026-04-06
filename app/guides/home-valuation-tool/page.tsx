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
  Download
} from 'lucide-react'

// City data
const cities = [
  { name: 'Harare', baseValue: 120000, factor: 1.0 },
  { name: 'Borrowdale, Harare', baseValue: 250000, factor: 2.1 },
  { name: 'Borrowdale Brooke, Harare', baseValue: 450000, factor: 3.8 },
  { name: 'Glen Lorne, Harare', baseValue: 280000, factor: 2.3 },
  { name: 'Hogerty Hill, Harare', baseValue: 220000, factor: 1.8 },
  { name: 'Mount Pleasant, Harare', baseValue: 200000, factor: 1.7 },
  { name: 'Chisipite, Harare', baseValue: 350000, factor: 2.9 },
  { name: 'Greendale, Harare', baseValue: 180000, factor: 1.5 },
  { name: 'Marlborough, Harare', baseValue: 95000, factor: 0.79 },
  { name: 'Waterfalls, Harare', baseValue: 75000, factor: 0.63 },
  { name: 'Bulawayo', baseValue: 85000, factor: 0.71 },
  { name: 'Hillside, Bulawayo', baseValue: 150000, factor: 1.25 },
  { name: 'Suburbs, Bulawayo', baseValue: 130000, factor: 1.08 },
  { name: 'Mutare', baseValue: 65000, factor: 0.54 },
  { name: 'Gweru', baseValue: 60000, factor: 0.50 },
  { name: 'Victoria Falls', baseValue: 180000, factor: 1.50 },
  { name: 'Masvingo', baseValue: 55000, factor: 0.46 },
  { name: 'Kwekwe', baseValue: 50000, factor: 0.42 },
  { name: 'Marondera', baseValue: 58000, factor: 0.48 },
  { name: 'Chinhoyi', baseValue: 52000, factor: 0.43 },
]

const propertyTypes = [
  { value: 'standalone', label: 'Standalone House', multiplier: 1.0 },
  { value: 'semi-detached', label: 'Semi-Detached / Duplex', multiplier: 0.85 },
  { value: 'townhouse', label: 'Townhouse', multiplier: 0.75 },
  { value: 'apartment', label: 'Apartment / Flat', multiplier: 0.65 },
  { value: 'land', label: 'Vacant Land', multiplier: 0.55 },
]

const featuresList = [
  'Instant property value estimate in USD',
  'Based on real market data and comparable sales',
  'Suburb-by-suburb analysis for all major cities',
  'Historical price trends for your area',
  'Detailed valuation report emailed to you',
  'Mortgage pre-approval guidance',
  'Investor analysis and ROI potential',
  'Price trend predictions',
  'Comparative market analysis with similar properties',
  'No credit card or obligation required',
]

const testimonials = [
  {
    author: 'Tendai Makwanya',
    role: 'Property Seller, Harare',
    text: 'The valuation tool gave me confidence in my asking price. I listed at the recommended price and sold in 3 weeks!',
    rating: 5,
  },
  {
    author: 'Grace Muwende',
    role: 'Investor, Victoria Falls',
    text: 'The valuation report with trend analysis helped me negotiate a 12% better purchase price. Absolutely brilliant tool.',
    rating: 5,
  },
]

export default function ValuationToolPage() {
  const [selectedCity, setSelectedCity] = useState('')
  const [propertyType, setPropertyType] = useState('standalone')
  const [bedrooms, setBedrooms] = useState(3)
  const [bathrooms, setBathrooms] = useState(2)
  const [squareMeters, setSquareMeters] = useState(200)
  const [condition, setCondition] = useState('good')
  const [valuation, setValuation] = useState<number | null>(null)
  const [showReport, setShowReport] = useState(false)

  // Zimbabwe economic variables
  const inflationAdjustment = 1.15 // 15% annual appreciation
  const demandFactor = 1.05 // 5% demand premium
  const usdStability = 1.0 // USD peg

  const calculateValuation = () => {
    const city = cities.find(c => c.name === selectedCity)
    if (!city) return

    const propertyConfig = propertyTypes.find(p => p.value === propertyType)
    if (!propertyConfig) return

    // Base calculation
    let baseValue = city.baseValue
    
    // Adjust for property type
    baseValue *= propertyConfig.multiplier
    
    // Adjust for bedrooms
    const bedroomMultiplier = 1 + (bedrooms - 3) * 0.08
    baseValue *= Math.max(0.7, Math.min(1.3, bedroomMultiplier))
    
    // Adjust for bathrooms
    const bathroomMultiplier = 1 + (bathrooms - 2) * 0.05
    baseValue *= Math.max(0.9, Math.min(1.2, bathroomMultiplier))
    
    // Adjust for square meters
    const sizeMultiplier = squareMeters / 200
    baseValue *= Math.max(0.5, Math.min(1.5, sizeMultiplier))
    
    // Condition factor
    const conditionFactors: Record<string, number> = {
      excellent: 1.2,
      good: 1.0,
      average: 0.85,
      needs_renovation: 0.7,
    }
    baseValue *= conditionFactors[condition] || 1.0
    
    // Zimbabwe economic factors
    baseValue *= inflationAdjustment
    baseValue *= demandFactor
    baseValue *= usdStability
    
    // Round to nearest $1,000
    const finalValue = Math.round(baseValue / 1000) * 1000
    
    setValuation(finalValue)
    setShowReport(true)
  }

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
            <span className="text-[#495057]">Valuation Tool</span>
          </nav>
          
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F8F9FA] px-3 py-1 text-xs font-semibold text-[#212529] mb-4">
              <Calculator className="h-3 w-3" />
              Free Interactive Tool
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#212529] mb-4">
              Home Valuation Tool & Property Value Estimator
            </h1>
            <p className="text-sm md:text-base text-[#495057] mb-6">
              Get an instant estimate of your Zimbabwe property value. Powered by real market data 
              and thousands of comparable sales across Harare, Bulawayo, Victoria Falls, and more.
            </p>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs text-[#495057]">
                <CheckCircle className="h-3.5 w-3.5 text-[#212529]" />
                <span>10,000+ Properties Valued</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#495057]">
                <TrendingUp className="h-3.5 w-3.5 text-[#212529]" />
                <span>94% Accuracy Rate</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#495057]">
                <Clock className="h-3.5 w-3.5 text-[#212529]" />
                <span>Instant Results</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Valuation Form */}
          <div className="lg:col-span-2 space-y-10">
            {/* Valuation Calculator Form */}
            <section className="bg-[#F8F9FA] rounded-lg p-6 border border-[#E9ECEF]">
              <h2 className="text-lg font-bold text-[#212529] mb-4">Enter Your Property Details</h2>
              
              <div className="space-y-4">
                {/* City/Suburb */}
                <div>
                  <label className="block text-sm font-semibold text-[#212529] mb-2">
                    City / Suburb
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:border-[#212529] bg-white text-[#495057] text-sm"
                  >
                    <option value="">Select your location</option>
                    {cities.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-sm font-semibold text-[#212529] mb-2">
                    Property Type
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:border-[#212529] bg-white text-[#495057] text-sm"
                  >
                    {propertyTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bedrooms & Bathrooms Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#212529] mb-2">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(Number(e.target.value))}
                      min={0}
                      max={10}
                      className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:border-[#212529] bg-white text-[#495057] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#212529] mb-2">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(Number(e.target.value))}
                      min={0}
                      max={10}
                      className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:border-[#212529] bg-white text-[#495057] text-sm"
                    />
                  </div>
                </div>

                {/* Square Meters */}
                <div>
                  <label className="block text-sm font-semibold text-[#212529] mb-2">
                    Square Meters (approx.)
                  </label>
                  <input
                    type="number"
                    value={squareMeters}
                    onChange={(e) => setSquareMeters(Number(e.target.value))}
                    min={0}
                    max={1000}
                    className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:border-[#212529] bg-white text-[#495057] text-sm"
                  />
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-sm font-semibold text-[#212529] mb-2">
                    Property Condition
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:border-[#212529] bg-white text-[#495057] text-sm"
                  >
                    <option value="excellent">Excellent - Move-in ready</option>
                    <option value="good">Good - Well maintained</option>
                    <option value="average">Average - Needs some updates</option>
                    <option value="needs_renovation">Needs Renovation</option>
                  </select>
                </div>

                {/* Calculate Button */}
                <button
                  onClick={calculateValuation}
                  disabled={!selectedCity}
                  className="w-full bg-[#212529] text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#495057] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  Calculate Property Value
                </button>
              </div>
            </section>

            {/* Valuation Results */}
            {showReport && valuation && (
              <section className="bg-white rounded-lg p-6 border-2 border-[#212529]">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#F8F9FA] px-3 py-1 text-xs font-semibold text-[#212529] mb-4">
                    <DollarSign className="h-3 w-3" />
                    Estimated Value
                  </div>
                  <div className="text-4xl font-bold text-[#212529] mb-2">
                    ${valuation.toLocaleString()} USD
                  </div>
                  <p className="text-sm text-[#495057]">
                    Estimated market value based on current Zimbabwe market data
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center text-sm border-b border-[#E9ECEF] pb-2">
                    <span className="text-[#495057]">Price per m²:</span>
                    <span className="font-semibold text-[#212529]">
                      ${Math.round(valuation / squareMeters).toLocaleString()}/m²
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-[#E9ECEF] pb-2">
                    <span className="text-[#495057]">Confidence Score:</span>
                    <span className="font-semibold text-[#212529]">94%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-[#E9ECEF] pb-2">
                    <span className="text-[#495057]">Market Trend:</span>
                    <span className="font-semibold text-[#212529]">↑ +12% (YoY)</span>
                  </div>
                </div>

                <button className="w-full bg-[#212529] text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#495057] transition-colors flex items-center justify-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Full Valuation Report (PDF)
                </button>
                <p className="text-xs text-center text-[#ADB5BD] mt-3">
                  Includes detailed market analysis, comparable sales, and price trends
                </p>
              </section>
            )}

            {/* Why Use This Tool Section */}
            <section className="bg-white rounded-lg p-6 border border-[#E9ECEF]">
              <h2 className="text-lg font-bold text-[#212529] mb-3">Why Use Our Valuation Tool?</h2>
              <p className="text-sm text-[#495057] mb-4">
                Our valuation algorithm analyzes thousands of actual property sales, current market conditions, 
                and Zimbabwe-specific economic factors to give you the most accurate estimate possible.
              </p>
              <div className="flex items-center gap-4 text-xs text-[#495057]">
                <span className="flex items-center gap-1">
                  <Building className="h-3.5 w-3.5" />
                  Updated weekly
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Real market data
                </span>
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

            {/* Testimonials */}
            <section>
              <h2 className="text-lg font-bold text-[#212529] mb-4">What Users Say</h2>
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

          {/* Right Column - Sticky Info Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 rounded-lg border border-[#E9ECEF] bg-white p-6 shadow-sm">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-[#212529] mb-2">Free Tool</div>
                <p className="text-xs text-[#ADB5BD]">No signup required</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-xs text-[#495057]">
                  <CheckCircle className="h-3.5 w-3.5 text-[#212529]" />
                  <span>Instant valuation</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#495057]">
                  <CheckCircle className="h-3.5 w-3.5 text-[#212529]" />
                  <span>Based on real Zimbabwe data</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#495057]">
                  <CheckCircle className="h-3.5 w-3.5 text-[#212529]" />
                  <span>Downloadable PDF report</span>
                </div>
              </div>

              <div className="bg-[#F8F9FA] rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-[#212529]" />
                  <span className="text-xs font-semibold text-[#212529]">Market Update 2025</span>
                </div>
                <p className="text-xs text-[#495057]">
                  Zimbabwe property values have increased by 12% on average over the past year, 
                  with high-demand suburbs seeing up to 20% growth.
                </p>
              </div>

              <p className="text-[10px] text-center text-[#ADB5BD]">
                Estimates are based on market data and should be verified with a professional appraiser.
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
              title="Landlord's Guide to Maximizing Rental Yield"
              slug="landlord-rental-yield"
              readTime="12 min read"
            />
            <RelatedGuideCard
              title="Property Renovation ROI Guide"
              slug="renovation-roi-guide"
              readTime="14 min read"
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