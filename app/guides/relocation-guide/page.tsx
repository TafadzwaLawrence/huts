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
  MapPin,
  School,
  Building,
  Heart,
  Car,
  Shield,
  Wifi,
  Coffee,
  TreePine,
  Utensils,
  Droplet,
  Zap,
  Briefcase,
  ShoppingBag  // ← Add this
} from 'lucide-react'

// City data with comprehensive information
const citiesData = {
  Harare: {
    name: 'Harare',
    population: '1.5 million',
    description: 'Zimbabwe\'s capital and largest city, the economic hub with the most amenities and job opportunities.',
    suburbs: [
      { name: 'Borrowdale', avgRent: 2500, avgPrice: 450000, safety: 'Very High', schools: 'Excellent', amenities: 'Premium', commute: '15-25 min', recommendation: 'High' },
      { name: 'Borrowdale Brooke', avgRent: 3500, avgPrice: 650000, safety: 'Excellent', schools: 'Excellent', amenities: 'Premium', commute: '20-30 min', recommendation: 'High' },
      { name: 'Mount Pleasant', avgRent: 1800, avgPrice: 320000, safety: 'High', schools: 'Excellent', amenities: 'Good', commute: '10-20 min', recommendation: 'High' },
      { name: 'Chisipite', avgRent: 2200, avgPrice: 380000, safety: 'Very High', schools: 'Excellent', amenities: 'Good', commute: '15-25 min', recommendation: 'High' },
      { name: 'Glen Lorne', avgRent: 2000, avgPrice: 350000, safety: 'High', schools: 'Good', amenities: 'Good', commute: '20-30 min', recommendation: 'Medium-High' },
      { name: 'Highlands', avgRent: 1600, avgPrice: 280000, safety: 'High', schools: 'Excellent', amenities: 'Good', commute: '10-15 min', recommendation: 'High' },
      { name: 'Avondale', avgRent: 1200, avgPrice: 220000, safety: 'Medium-High', schools: 'Good', amenities: 'Very Good', commute: '5-10 min', recommendation: 'Medium-High' },
      { name: 'Greendale', avgRent: 1200, avgPrice: 220000, safety: 'Medium-High', schools: 'Good', amenities: 'Good', commute: '15-25 min', recommendation: 'Medium' },
      { name: 'Newlands', avgRent: 1400, avgPrice: 250000, safety: 'High', schools: 'Good', amenities: 'Good', commute: '10-15 min', recommendation: 'High' },
      { name: 'Milton Park', avgRent: 1500, avgPrice: 260000, safety: 'High', schools: 'Excellent', amenities: 'Good', commute: '5-10 min', recommendation: 'High' },
      { name: 'Eastlea', avgRent: 1100, avgPrice: 200000, safety: 'Medium', schools: 'Average', amenities: 'Good', commute: '10-15 min', recommendation: 'Medium' },
      { name: 'Belvedere', avgRent: 1000, avgPrice: 180000, safety: 'Medium', schools: 'Average', amenities: 'Good', commute: '10-15 min', recommendation: 'Medium' },
      { name: 'Marlborough', avgRent: 800, avgPrice: 140000, safety: 'Medium-Low', schools: 'Average', amenities: 'Basic', commute: '20-30 min', recommendation: 'Low-Medium' },
      { name: 'Waterfalls', avgRent: 700, avgPrice: 120000, safety: 'Low-Medium', schools: 'Average', amenities: 'Basic', commute: '15-25 min', recommendation: 'Low' },
    ],
    costOfLiving: {
      monthlyRent: '700-3,500',
      utilities: '150-300',
      groceries: '200-400',
      transport: '50-120',
      total: '1,100-4,320',
    },
    healthcare: ['Avenues Clinic', 'St Anne\'s Hospital', 'West End Hospital', 'The Quinnington Group'],
    schools: ['St George\'s College', 'Chisipite Senior School', 'Harare International School', 'Arundel School'],
    shopping: ['Sam Levy\'s Village', 'Borrowdale Village', 'Westgate Mall', 'Joina City'],
  },
  Bulawayo: {
    name: 'Bulawayo',
    population: '650,000',
    description: 'Zimbabwe\'s second-largest city, known for its wide streets, industrial heritage, and lower cost of living.',
    suburbs: [
      { name: 'Hillside', avgRent: 800, avgPrice: 150000, safety: 'High', schools: 'Excellent', amenities: 'Good', commute: '10-15 min', recommendation: 'High' },
      { name: 'Suburbs', avgRent: 700, avgPrice: 130000, safety: 'High', schools: 'Good', amenities: 'Good', commute: '5-10 min', recommendation: 'High' },
      { name: 'Burnside', avgRent: 600, avgPrice: 110000, safety: 'Medium-High', schools: 'Good', amenities: 'Basic', commute: '15-20 min', recommendation: 'Medium' },
      { name: 'Matsheumhlope', avgRent: 650, avgPrice: 120000, safety: 'High', schools: 'Good', amenities: 'Good', commute: '10-15 min', recommendation: 'Medium-High' },
      { name: 'Kumalo', avgRent: 500, avgPrice: 90000, safety: 'Medium', schools: 'Average', amenities: 'Basic', commute: '10-15 min', recommendation: 'Medium' },
    ],
    costOfLiving: {
      monthlyRent: '500-1,500',
      utilities: '100-200',
      groceries: '150-300',
      transport: '30-80',
      total: '780-2,080',
    },
    healthcare: ['Mater Dei Hospital', 'Bulawayo Clinic', 'United Bulawayo Hospitals'],
    schools: ['Christian Brothers College', 'Girls\' College', 'Whitestone School'],
    shopping: ['Parkade Centre', 'Bulawayo Centre', 'Ascot Shopping Centre'],
  },
  VictoriaFalls: {
    name: 'Victoria Falls',
    population: '35,000',
    description: 'Tourist hub with strong rental demand from hospitality workers and short-term rental investors.',
    suburbs: [
      { name: 'Chinotimba', avgRent: 500, avgPrice: 90000, safety: 'Medium', schools: 'Average', amenities: 'Basic', commute: '10-15 min', recommendation: 'Medium' },
      { name: 'Mkhosana', avgRent: 550, avgPrice: 100000, safety: 'Medium', schools: 'Average', amenities: 'Basic', commute: '10-15 min', recommendation: 'Medium' },
    ],
    costOfLiving: {
      monthlyRent: '500-2,500',
      utilities: '120-250',
      groceries: '200-400',
      transport: '40-100',
      total: '860-3,250',
    },
    healthcare: ['Victoria Falls Hospital', 'Safari Medical Services'],
    schools: ['Victoria Falls Primary', 'Mkhosana High School'],
    shopping: ['Elephant Hills Mall', 'Victoria Falls Craft Market'],
  },
  Mutare: {
    name: 'Mutare',
    population: '190,000',
    description: 'Eastern Highlands gateway with cooler climate and scenic views.',
    suburbs: [
      { name: 'Hillside', avgRent: 500, avgPrice: 90000, safety: 'High', schools: 'Good', amenities: 'Basic', commute: '10-15 min', recommendation: 'High' },
      { name: 'Yeovil', avgRent: 450, avgPrice: 80000, safety: 'Medium-High', schools: 'Average', amenities: 'Basic', commute: '5-10 min', recommendation: 'Medium' },
    ],
    costOfLiving: {
      monthlyRent: '400-1,200',
      utilities: '80-180',
      groceries: '150-300',
      transport: '30-70',
      total: '660-1,750',
    },
    healthcare: ['Mutare Provincial Hospital', 'St John\'s Mission Hospital'],
    schools: ['Mutare Girls\' High', 'Chikanga High School'],
    shopping: ['Mutare City Centre', 'Sakubva Shopping Centre'],
  },
  Gweru: {
    name: 'Gweru',
    population: '160,000',
    description: 'Central city known as the "City of Progress" with affordable housing options.',
    suburbs: [
      { name: 'Northlea', avgRent: 450, avgPrice: 80000, safety: 'Medium-High', schools: 'Good', amenities: 'Basic', commute: '10-15 min', recommendation: 'Medium-High' },
      { name: 'Ivene', avgRent: 400, avgPrice: 70000, safety: 'Medium', schools: 'Average', amenities: 'Basic', commute: '5-10 min', recommendation: 'Medium' },
    ],
    costOfLiving: {
      monthlyRent: '350-1,000',
      utilities: '70-160',
      groceries: '130-250',
      transport: '25-60',
      total: '575-1,470',
    },
    healthcare: ['Gweru General Hospital', 'Claybank Hospital'],
    schools: ['Midlands Christian College', 'Fletcher High School'],
    shopping: ['Parkade Shopping Centre', 'Mtapa Shopping Centre'],
  },
}

// Suburb comparison component
function SuburbComparison() {
  const [selectedCity, setSelectedCity] = useState('Harare')
  const cityData = citiesData[selectedCity as keyof typeof citiesData]

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-[#212529] mb-2">
          Select City
        </label>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:border-[#212529] bg-white text-[#495057] text-sm"
        >
          {Object.keys(citiesData).map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F8F9FA] border-b border-[#E9ECEF]">
            <tr>
              <th className="text-left py-2 px-2 text-xs font-semibold text-[#212529]">Suburb</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-[#212529]">Rent (USD)</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-[#212529]">Safety</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-[#212529]">Schools</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-[#212529]">Commute</th>
            </tr>
          </thead>
          <tbody>
            {cityData.suburbs.map((suburb, i) => (
              <tr key={i} className="border-b border-[#E9ECEF] hover:bg-[#F8F9FA] transition-colors">
                <td className="py-2 px-2 text-[#212529] font-medium">{suburb.name}</td>
                <td className="py-2 px-2 text-[#495057]">${suburb.avgRent}</td>
                <td className="py-2 px-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    suburb.safety === 'Excellent' || suburb.safety === 'Very High' ? 'bg-green-100 text-green-700' :
                    suburb.safety === 'High' ? 'bg-green-50 text-green-600' :
                    suburb.safety === 'Medium-High' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {suburb.safety}
                  </span>
                </td>
                <td className="py-2 px-2 text-[#495057]">{suburb.schools}</td>
                <td className="py-2 px-2 text-[#495057]">{suburb.commute}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Cost of living card
function CostOfLivingCard({ cityData }: { cityData: typeof citiesData.Harare }) {
  return (
    <div className="bg-[#F8F9FA] rounded-lg p-5 border border-[#E9ECEF]">
      <h3 className="text-sm font-bold text-[#212529] mb-3 flex items-center gap-2">
        <DollarSign className="h-4 w-4" />
        Monthly Cost of Living ({cityData.name})
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[#495057]">Rent (2-bedroom):</span>
          <span className="font-semibold text-[#212529]">${cityData.costOfLiving.monthlyRent}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#495057]">Utilities (ZESA, Water, Internet):</span>
          <span className="font-semibold text-[#212529]">${cityData.costOfLiving.utilities}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#495057]">Groceries:</span>
          <span className="font-semibold text-[#212529]">${cityData.costOfLiving.groceries}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#495057]">Transportation:</span>
          <span className="font-semibold text-[#212529]">${cityData.costOfLiving.transport}</span>
        </div>
        <div className="flex justify-between text-sm pt-2 border-t border-[#E9ECEF]">
          <span className="font-semibold text-[#212529]">Estimated Total:</span>
          <span className="font-bold text-[#212529]">${cityData.costOfLiving.total}</span>
        </div>
      </div>
    </div>
  )
}

// Main Component
export default function RelocationGuidePage() {
  const [selectedCity, setSelectedCity] = useState('Harare')
  const cityData = citiesData[selectedCity as keyof typeof citiesData]

  const featuresList = [
    'Suburb rankings by income level and lifestyle',
    'Safety ratings for each area (crime statistics)',
    'School and education options (public, private, international)',
    'Shopping centers, restaurants, and entertainment amenities',
    'Healthcare facilities and hospitals nearby',
    'Transportation networks and average commute times',
    'Average rental and purchase prices by suburb',
    'Community demographics and expat communities',
    'Comprehensive cost of living breakdowns',
    'Moving checklists and relocation timelines',
    'Utility setup guides (ZESA, water, internet providers)',
    'Local customs and cultural integration tips',
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
            <span className="text-[#495057]">Relocation Guide</span>
          </nav>
          
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F8F9FA] px-3 py-1 text-xs font-semibold text-[#212529] mb-4">
              <MapPin className="h-3 w-3" />
              Free Relocation Guide
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#212529] mb-4">
              Moving to Zimbabwe? Complete Relocation Guide
            </h1>
            <p className="text-sm md:text-base text-[#495057] mb-6">
              Hyper-local guides for Harare, Bulawayo, Victoria Falls, and major cities. 
              Find the perfect suburb based on your budget, lifestyle, and needs.
            </p>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs text-[#495057]">
                <CheckCircle className="h-3.5 w-3.5 text-[#212529]" />
                <span>20+ Suburbs Analyzed</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#495057]">
                <Star className="h-3.5 w-3.5 text-[#212529]" />
                <span>Safety Ratings Included</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#495057]">
                <Clock className="h-3.5 w-3.5 text-[#212529]" />
                <span>30 min read</span>
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
            {/* City Overview */}
            <section className="bg-white rounded-lg p-6 border border-[#E9ECEF]">
              <h2 className="text-lg font-bold text-[#212529] mb-3">City Selection Guide</h2>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:border-[#212529] bg-white text-[#495057] text-sm"
                  >
                    {Object.keys(citiesData).map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <p className="text-sm text-[#495057]">{cityData.description}</p>
                <p className="text-xs text-[#ADB5BD] mt-2">Population: {cityData.population}</p>
              </div>
            </section>

            {/* Suburb Comparison Table */}
            <section>
              <h2 className="text-lg font-bold text-[#212529] mb-4">Suburb Comparison - {selectedCity}</h2>
              <SuburbComparison />
              <p className="text-xs text-[#ADB5BD] mt-2">
                *Rent prices are monthly averages for 2-3 bedroom properties. Safety ratings based on local crime data.
              </p>
            </section>

            {/* Recommended Suburbs by Profile */}
            <section className="bg-[#F8F9FA] rounded-lg p-6 border border-[#E9ECEF]">
              <h3 className="text-md font-bold text-[#212529] mb-3">Recommended Suburbs by Profile</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Briefcase className="h-5 w-5 text-[#212529] flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-[#212529]">For Professionals/Expats</h4>
                    <p className="text-sm text-[#495057]">
                      Borrowdale, Mount Pleasant, Chisipite, Highlands (Harare) | 
                      Hillside, Suburbs (Bulawayo)
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <School className="h-5 w-5 text-[#212529] flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-[#212529]">For Families with Children</h4>
                    <p className="text-sm text-[#495057]">
                      Borrowdale Brooke, Glen Lorne, Chisipite (Harare) | 
                      Hillside (Bulawayo)
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <DollarSign className="h-5 w-5 text-[#212529] flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-[#212529]">Budget-Friendly Options</h4>
                    <p className="text-sm text-[#495057]">
                      Greendale, Eastlea, Avondale (Harare) | 
                      Burnside, Kumalo (Bulawayo)
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Amenities and Services */}
            <section>
              <h2 className="text-lg font-bold text-[#212529] mb-4">Amenities & Services in {selectedCity}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-[#E9ECEF] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="h-4 w-4 text-[#212529]" />
                    <h4 className="text-sm font-semibold text-[#212529]">Healthcare</h4>
                  </div>
                  <ul className="text-sm text-[#495057] space-y-1">
                    {cityData.healthcare.slice(0, 3).map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="border border-[#E9ECEF] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <School className="h-4 w-4 text-[#212529]" />
                    <h4 className="text-sm font-semibold text-[#212529]">Schools</h4>
                  </div>
                  <ul className="text-sm text-[#495057] space-y-1">
                    {cityData.schools.slice(0, 3).map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="border border-[#E9ECEF] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingBag className="h-4 w-4 text-[#212529]" />
                    <h4 className="text-sm font-semibold text-[#212529]">Shopping</h4>
                  </div>
                  <ul className="text-sm text-[#495057] space-y-1">
                    {cityData.shopping.slice(0, 3).map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="border border-[#E9ECEF] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wifi className="h-4 w-4 text-[#212529]" />
                    <h4 className="text-sm font-semibold text-[#212529]">Internet Providers</h4>
                  </div>
                  <ul className="text-sm text-[#495057] space-y-1">
                    <li>• TelOne Fiber</li>
                    <li>• Liquid Home</li>
                    <li>• ZOL Zimbabwe</li>
                    <li>• Africom</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Moving Checklist */}
            <section className="bg-white rounded-lg p-6 border border-[#E9ECEF]">
              <h3 className="text-md font-bold text-[#212529] mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                10-Step Moving Checklist
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-start gap-2 text-sm text-[#495057]">
                  <CheckCircle className="h-3.5 w-3.5 text-[#212529] mt-0.5" />
                  <span>Research suburbs and visit shortlisted areas</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-[#495057]">
                  <CheckCircle className="h-3.5 w-3.5 text-[#212529] mt-0.5" />
                  <span>Set up property viewings (use Huts.co.zw)</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-[#495057]">
                  <CheckCircle className="h-3.5 w-3.5 text-[#212529] mt-0.5" />
                  <span>Secure rental agreement and deposit</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-[#495057]">
                  <CheckCircle className="h-3.5 w-3.5 text-[#212529] mt-0.5" />
                  <span>Arrange utilities (ZESA, water, internet)</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-[#495057]">
                  <CheckCircle className="h-3.5 w-3.5 text-[#212529] mt-0.5" />
                  <span>Book moving company or truck rental</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-[#495057]">
                  <CheckCircle className="h-3.5 w-3.5 text-[#212529] mt-0.5" />
                  <span>Update address with banks and employers</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-[#495057]">
                  <CheckCircle className="h-3.5 w-3.5 text-[#212529] mt-0.5" />
                  <span>Register children in local schools</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-[#495057]">
                  <CheckCircle className="h-3.5 w-3.5 text-[#212529] mt-0.5" />
                  <span>Find local doctors and hospitals</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-[#495057]">
                  <CheckCircle className="h-3.5 w-3.5 text-[#212529] mt-0.5" />
                  <span>Join community WhatsApp/Telegram groups</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-[#495057]">
                  <CheckCircle className="h-3.5 w-3.5 text-[#212529] mt-0.5" />
                  <span>Obtain residence permit if applicable</span>
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
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-8 space-y-6">
              {/* Cost of Living Card */}
              <CostOfLivingCard cityData={cityData} />

              {/* Download CTA Card */}
              <div className="rounded-lg border border-[#212529] bg-white p-5 shadow-sm">
                <div className="text-center mb-4">
                  <div className="text-xl font-bold text-[#212529] mb-1">Free Download</div>
                  <p className="text-xs text-[#ADB5BD]">Complete Relocation Guide</p>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-[#495057]">
                    <CheckCircle className="h-3 w-3 text-[#212529]" />
                    <span>20+ suburb profiles</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#495057]">
                    <CheckCircle className="h-3 w-3 text-[#212529]" />
                    <span>Cost comparison tables</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#495057]">
                    <CheckCircle className="h-3 w-3 text-[#212529]" />
                    <span>Moving checklist PDF</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#495057]">
                    <CheckCircle className="h-3 w-3 text-[#212529]" />
                    <span>Utility setup guides</span>
                  </div>
                </div>
                <button className="w-full bg-[#212529] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#495057] transition-colors flex items-center justify-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Full Guide
                </button>
              </div>

              {/* Quick Tips Card */}
              <div className="rounded-lg border border-[#E9ECEF] bg-[#F8F9FA] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-[#212529]" />
                  <span className="text-xs font-semibold text-[#212529]">Safety Tips</span>
                </div>
                <p className="text-xs text-[#495057]">
                  Always visit potential neighborhoods at different times of day. Join local community groups 
                  and ask residents about safety, security arrangements, and daily life.
                </p>
              </div>

              {/* Data Source */}
              <div className="rounded-lg border border-[#E9ECEF] bg-white p-4">
                <p className="text-xs text-[#ADB5BD]">
                  Suburb data compiled from property listings, local real estate agents, 
                  and community surveys. Updated quarterly for 2025.
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
              title="Rental Affordability Calculator & Budget Planner"
              slug="rental-affordability-calculator"
              readTime="10 min read"
            />
            <RelatedGuideCard
              title="Weekly Property Market Report Newsletter"
              slug="market-report-newsletter"
              readTime="5 min read"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Missing import for ShoppingBag
// Add to imports: ShoppingBag

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

// Add ShoppingBag to imports at the top
// import { ShoppingBag } from 'lucide-react'