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
  Wrench,
  TrendingUp,
  Bath,
  Utensils,
  Paintbrush,
  Zap,
  Droplet,
  Hammer,
  Ruler,
  Building,
  Percent,
  Shield,
  Lock,
  Sun,
  Sprout,
  Key,
  FileText
} from 'lucide-react'

const renovationProjects = [
  {
    id: 'kitchen',
    name: 'Kitchen Renovation (Mid-Range)',
    icon: Utensils,        // ← Fixed
    costMin: 3000,
    costMax: 8000,
    averageCost: 5000,
    roiMin: 60,
    roiMax: 80,
    averageROI: 70,
    timeline: '2-3 weeks',
    description: 'New countertops, cabinets, appliances, backsplash, and flooring',
    popularity: 'High',
  },
  {
    id: 'bathroom',
    name: 'Bathroom Renovation',
    icon: Bath,
    costMin: 2000,
    costMax: 5000,
    averageCost: 3500,
    roiMin: 65,
    roiMax: 85,
    averageROI: 75,
    timeline: '1-2 weeks',
    description: 'New fixtures, tiles, vanity, toilet, and lighting',
    popularity: 'High',
  },
  {
    id: 'painting',
    name: 'Interior/Exterior Painting',
    icon: Paintbrush,      // ← Fixed
    costMin: 1000,
    costMax: 3000,
    averageCost: 2000,
    roiMin: 50,
    roiMax: 70,
    averageROI: 60,
    timeline: '3-7 days',
    description: 'Fresh paint throughout, including trim and ceilings',
    popularity: 'Very High',
  },
  {
    id: 'flooring',
    name: 'Flooring Upgrade',
    icon: Ruler,
    costMin: 1500,
    costMax: 5000,
    averageCost: 3000,
    roiMin: 55,
    roiMax: 75,
    averageROI: 65,
    timeline: '1 week',
    description: 'Replace carpets with tiles or hardwood',
    popularity: 'Medium-High',
  },
  {
    id: 'solar',
    name: 'Solar Panel Installation',
    icon: Sun,             // ← Changed from Zap for better representation
    costMin: 2500,
    costMax: 8000,
    averageCost: 5000,
    roiMin: 40,
    roiMax: 60,
    averageROI: 50,
    timeline: '1-2 weeks',
    description: 'Solar panels, inverter, battery backup system',
    popularity: 'High (Due to ZESA issues)',
  },
  {
    id: 'security',
    name: 'Security Upgrades',
    icon: Shield,          // ← Changed from AlertCircle
    costMin: 800,
    costMax: 2500,
    averageCost: 1500,
    roiMin: 45,
    roiMax: 65,
    averageROI: 55,
    timeline: '3-5 days',
    description: 'Security gates, alarm system, CCTV cameras',
    popularity: 'Very High',
  },
  {
    id: 'landscaping',
    name: 'Landscaping & Curb Appeal',
    icon: Sprout,          // ← Changed from Home
    costMin: 500,
    costMax: 2000,
    averageCost: 1000,
    roiMin: 50,
    roiMax: 70,
    averageROI: 60,
    timeline: '1 week',
    description: 'Gardens, paving, fencing, exterior lighting',
    popularity: 'Medium',
  },
  {
    id: 'water',
    name: 'Water System (Borehole/Tanks)',
    icon: Droplet,         // ← Fixed
    costMin: 2000,
    costMax: 6000,
    averageCost: 4000,
    roiMin: 35,
    roiMax: 55,
    averageROI: 45,
    timeline: '1-2 weeks',
    description: 'Borehole drilling, water tanks, pressure pump',
    popularity: 'High',
  },
]
// Material cost estimates (USD)
const materialCosts = {
  cement: { price: 12, unit: '50kg bag' },
  bricks: { price: 0.30, unit: 'each' },
  paint: { price: 25, unit: '20L bucket' },
  tiles: { price: 15, unit: 'per m²' },
  plumbing: { price: 800, unit: 'basic bathroom set' },
  electrical: { price: 500, unit: 'basic rewire' },
}

// Labor costs by city
const laborCosts = {
  Harare: { dailyRate: 25, skilledRate: 40 },
  Bulawayo: { dailyRate: 20, skilledRate: 35 },
  VictoriaFalls: { dailyRate: 22, skilledRate: 38 },
  Mutare: { dailyRate: 18, skilledRate: 30 },
  Gweru: { dailyRate: 18, skilledRate: 30 },
}

// ROI Calculator Component
function ROICalculator() {
  const [propertyValue, setPropertyValue] = useState(150000)
  const [renovationCost, setRenovationCost] = useState(5000)
  const [selectedProject, setSelectedProject] = useState('kitchen')
  const [calculatedROI, setCalculatedROI] = useState<number | null>(null)
  const [newPropertyValue, setNewPropertyValue] = useState<number | null>(null)

  const project = renovationProjects.find(p => p.id === selectedProject)

  const calculateROI = () => {
    if (!project) return
    
    const estimatedValueIncrease = renovationCost * (project.averageROI / 100)
    const newValue = propertyValue + estimatedValueIncrease
    const roiPercentage = (estimatedValueIncrease / renovationCost) * 100
    
    setNewPropertyValue(Math.round(newValue))
    setCalculatedROI(roiPercentage)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-[#212529] mb-2">
          Current Property Value (USD)
        </label>
        <input
          type="number"
          value={propertyValue}
          onChange={(e) => setPropertyValue(Number(e.target.value))}
          className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:border-[#212529] bg-white text-[#495057] text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#212529] mb-2">
          Renovation Project
        </label>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:border-[#212529] bg-white text-[#495057] text-sm"
        >
          {renovationProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name} (${project.averageCost} avg)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#212529] mb-2">
          Estimated Renovation Cost (USD)
        </label>
        <input
          type="number"
          value={renovationCost}
          onChange={(e) => setRenovationCost(Number(e.target.value))}
          min={500}
          max={20000}
          step={500}
          className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:border-[#212529] bg-white text-[#495057] text-sm"
        />
        <p className="text-xs text-[#ADB5BD] mt-1">
          Typical range: ${project?.costMin} - ${project?.costMax}
        </p>
      </div>

      <button
        onClick={calculateROI}
        className="w-full bg-[#212529] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#495057] transition-colors"
      >
        Calculate ROI
      </button>

      {calculatedROI !== null && newPropertyValue !== null && (
        <div className="mt-4 p-4 bg-[#F8F9FA] rounded-lg border border-[#E9ECEF] space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#495057]">New Property Value:</span>
            <span className="text-lg font-bold text-[#212529]">${newPropertyValue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#495057]">Value Increase:</span>
            <span className="text-md font-semibold text-green-600">+${(newPropertyValue - propertyValue).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-[#E9ECEF]">
            <span className="text-sm font-semibold text-[#212529]">ROI:</span>
            <span className="text-xl font-bold text-[#212529]">{calculatedROI.toFixed(0)}%</span>
          </div>
          <div className={`text-xs p-2 rounded ${calculatedROI >= 60 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
            {calculatedROI >= 60 
              ? '✓ High ROI project - excellent investment' 
              : '⚠ Moderate ROI - consider alternatives with better returns'}
          </div>
        </div>
      )}
    </div>
  )
}

// Renovation Table Component
function RenovationTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-[#F8F9FA] border-b border-[#E9ECEF]">
          <tr>
            <th className="text-left py-2 px-3 text-xs font-semibold text-[#212529]">Project</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-[#212529]">Cost (USD)</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-[#212529]">ROI</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-[#212529]">Timeline</th>
          </tr>
        </thead>
        <tbody>
          {renovationProjects.slice(0, 6).map((project, i) => {
            const Icon = project.icon
            return (
              <tr key={i} className="border-b border-[#E9ECEF] hover:bg-[#F8F9FA] transition-colors">
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-[#ADB5BD]" />
                    <span className="text-[#212529] font-medium text-xs">{project.name}</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-[#495057] text-xs">${project.averageCost.toLocaleString()}</td>
                <td className="py-2 px-3">
                  <span className="text-green-600 font-semibold text-xs">{project.averageROI}%</span>
                </td>
                <td className="py-2 px-3 text-[#495057] text-xs">{project.timeline}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// Main Component
export default function RenovationROIGuidePage() {
  const featuresList = [
    'High-ROI renovation projects for Zimbabwe homes',
    'Material cost estimates (USD) with local supplier prices',
    'Labor cost breakdowns by city (Harare, Bulawayo, etc.)',
    'Timeline projections for each project type',
    'Before & after value increase examples',
    'Kitchen renovation strategies (70% average ROI)',
    'Bathroom upgrade impact (75% average ROI)',
    'Exterior improvements and curb appeal',
    'Energy-saving upgrades (solar, solar geysers)',
    'Trusted contractor referral network',
    'Zimbabwe-specific building material prices',
    'Permit requirements and approval processes',
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
            <span className="text-[#495057]">Renovation ROI</span>
          </nav>
          
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F8F9FA] px-3 py-1 text-xs font-semibold text-[#212529] mb-4">
              <Wrench className="h-3 w-3" />
              Free Renovation Guide
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#212529] mb-4">
              Property Renovation ROI Guide - Zimbabwe Home Improvement
            </h1>
            <p className="text-sm md:text-base text-[#495057] mb-6">
              Learn which renovations add the most value in Zimbabwe. Cost estimates, 
              timelines, contractor referrals, and ROI analysis for 2025.
            </p>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs text-[#495057]">
                <CheckCircle className="h-3.5 w-3.5 text-[#212529]" />
                <span>Zimbabwe-specific data</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#495057]">
                <TrendingUp className="h-3.5 w-3.5 text-[#212529]" />
                <span>60-80% typical ROI</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#495057]">
                <Clock className="h-3.5 w-3.5 text-[#212529]" />
                <span>15 min read</span>
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
              <h2 className="text-lg font-bold text-[#212529] mb-3">2025 Renovation Market Overview</h2>
              <p className="text-sm text-[#495057] mb-4">
                Zimbabwe's renovation market is growing as homeowners invest in property improvements. 
                With rising property values (up 80% in Harare over 5 years), strategic renovations 
                can significantly boost your property's value. The most profitable projects include 
                kitchen upgrades (70% ROI), bathroom renovations (75% ROI), and security improvements (55% ROI).
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F8F9FA] p-3 rounded-lg">
                  <p className="text-xs text-[#ADB5BD]">Most Profitable</p>
                  <p className="text-md font-bold text-[#212529]">Bathroom Renovation</p>
                  <p className="text-sm text-green-600">75% ROI</p>
                </div>
                <div className="bg-[#F8F9FA] p-3 rounded-lg">
                  <p className="text-xs text-[#ADB5BD]">Fastest Payback</p>
                  <p className="text-md font-bold text-[#212529]">Painting</p>
                  <p className="text-sm text-green-600">2-3 months</p>
                </div>
              </div>
            </section>

            {/* Renovation ROI Table */}
            <section>
              <h2 className="text-lg font-bold text-[#212529] mb-4">Renovation Projects & ROI Comparison</h2>
              <RenovationTable />
              <p className="text-xs text-[#ADB5BD] mt-2">
                *ROI estimates based on Zimbabwe market data and property value appreciation
              </p>
            </section>

            {/* Material Costs Section */}
            <section className="bg-[#F8F9FA] rounded-lg p-6 border border-[#E9ECEF]">
              <h3 className="text-md font-bold text-[#212529] mb-3 flex items-center gap-2">
                <Hammer className="h-4 w-4" />
                Current Material Costs (USD) - Harare Prices
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(materialCosts).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center text-sm border-b border-[#E9ECEF] pb-2">
                    <span className="text-[#495057] capitalize">{key}:</span>
                    <span className="font-semibold text-[#212529]">${value.price} / {value.unit}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#ADB5BD] mt-3">
                *Prices vary by supplier and quantity. Bulk purchases typically get 10-15% discounts.
              </p>
            </section>

            {/* Labor Costs by City */}
            <section>
              <h2 className="text-lg font-bold text-[#212529] mb-4">Labor Costs by City (2025)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F8F9FA] border-b border-[#E9ECEF]">
                    <tr>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#212529]">City</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#212529]">General Labor (Daily)</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#212529]">Skilled Labor (Daily)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(laborCosts).map(([city, rates]) => (
                      <tr key={city} className="border-b border-[#E9ECEF]">
                        <td className="py-2 px-3 text-[#212529] font-medium">{city}</td>
                        <td className="py-2 px-3 text-[#495057]">${rates.dailyRate}</td>
                        <td className="py-2 px-3 text-[#495057]">${rates.skilledRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* High ROI Projects Deep Dive */}
            <section className="bg-white rounded-lg p-6 border border-[#E9ECEF]">
              <h3 className="text-md font-bold text-[#212529] mb-3">Top 3 High-ROI Projects</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Bath className="h-5 w-5 text-[#212529] flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-[#212529]">1. Bathroom Renovation (75% ROI)</h4>
                    <p className="text-sm text-[#495057]">
                      New fixtures, modern tiles, and proper waterproofing can transform an outdated bathroom. 
                      Cost: $2,000-5,000. Timeline: 1-2 weeks.
                    </p>
                  </div>
                </div>
                  <div className="flex gap-3">
                    <Utensils className="h-5 w-5 text-[#212529] flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-[#212529]">2. Kitchen Renovation (70% ROI)</h4>
                      <p className="text-sm text-[#495057]">
                        New countertops, cabinets, and appliances. Mid-range kitchen updates offer the best value. 
                        Cost: $3,000-8,000. Timeline: 2-3 weeks.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Paintbrush className="h-5 w-5 text-[#212529] flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-[#212529]">3. Fresh Paint (60% ROI)</h4>
                      <p className="text-sm text-[#495057]">
                        The cheapest way to transform any property. Neutral colors appeal to most buyers. 
                        Cost: $1,000-3,000. Timeline: 3-7 days.
                      </p>
                    </div>
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

            {/* Permits Section */}
            <section className="bg-[#F8F9FA] rounded-lg p-6 border border-[#E9ECEF]">
              <div className="flex gap-3">
                <Building className="h-5 w-5 text-[#212529] flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-[#212529] mb-1">Permit Requirements in Zimbabwe</h3>
                  <p className="text-sm text-[#495057] mb-2">
                    Major structural changes require council approval. For Harare, contact the City Planning Department. 
                    Typical permits needed for:
                  </p>
                  <ul className="text-sm text-[#495057] space-y-1">
                    <li>• Structural changes (wall removal, extensions)</li>
                    <li>• Electrical and plumbing re-works</li>
                    <li>• Solar panel installations (must be certified)</li>
                    <li>• Major exterior changes</li>
                  </ul>
                  <p className="text-xs text-[#ADB5BD] mt-2">
                    Permit fees typically range from $50-200 depending on project scope.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-8 space-y-6">
              {/* ROI Calculator */}
              <div className="rounded-lg border border-[#E9ECEF] bg-white p-5">
                <h3 className="text-sm font-bold text-[#212529] mb-3 flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  ROI Calculator
                </h3>
                <ROICalculator />
              </div>

              {/* Download CTA Card */}
              <div className="rounded-lg border border-[#212529] bg-white p-5 shadow-sm">
                <div className="text-center mb-4">
                  <div className="text-xl font-bold text-[#212529] mb-1">Free Download</div>
                  <p className="text-xs text-[#ADB5BD]">Complete Renovation Guide</p>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-[#495057]">
                    <CheckCircle className="h-3 w-3 text-[#212529]" />
                    <span>Cost breakdowns by project</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#495057]">
                    <CheckCircle className="h-3 w-3 text-[#212529]" />
                    <span>Contractor referral list</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#495057]">
                    <CheckCircle className="h-3 w-3 text-[#212529]" />
                    <span>Material supplier discounts</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#495057]">
                    <CheckCircle className="h-3 w-3 text-[#212529]" />
                    <span>Project management checklist</span>
                  </div>
                </div>
                <button className="w-full bg-[#212529] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#495057] transition-colors flex items-center justify-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Full Guide
                </button>
              </div>

              {/* Pro Tip Card */}
              <div className="rounded-lg border border-[#E9ECEF] bg-[#F8F9FA] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-[#212529]" />
                  <span className="text-xs font-semibold text-[#212529]">Pro Tip</span>
                </div>
                <p className="text-xs text-[#495057]">
                  Focus on kitchens and bathrooms first - they offer the highest ROI (70-75%). 
                  Then address curb appeal (landscaping, painting) which can add 5-10% to property value.
                </p>
              </div>

              {/* Data Source */}
              <div className="rounded-lg border border-[#E9ECEF] bg-white p-4">
                <p className="text-xs text-[#ADB5BD]">
                  Cost estimates based on 2025 market data from Builders Warehouse Zimbabwe, 
                  Bricks & Blocks Hardware, and local contractor surveys.
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
              title="Landlord's Guide to Maximizing Rental Yield"
              slug="landlord-rental-yield"
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