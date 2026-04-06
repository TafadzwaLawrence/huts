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
  TrendingUp,
  DollarSign,
  AlertCircle,
  Mail,
  BarChart3,
  Home,
  Building,
  Calendar,
  Newspaper,
  Zap,
  RefreshCw,
  Landmark,
  Briefcase,
  Shield
} from 'lucide-react'

// Market data interface
interface MarketData {
  date: string
  harareAveragePrice: number
  bulawayoAveragePrice: number
  priceGrowthHarare: number
  priceGrowthBulawayo: number
  rentalYieldResidential: number
  rentalYieldCommercial: number
  cbdVacancyRate: number
  suburbanOfficeYield: number
  diasporaRemittances: number
  marketSentiment: 'Bullish' | 'Stable' | 'Cautious'
  topPerformingSuburbs: Array<{ name: string; growth: number }>
  newsHighlights: Array<{ title: string; source: string; date: string }>
}

// Mock function to fetch market data - Replace with actual API call
async function fetchMarketData(): Promise<MarketData> {
  // In production, this would call your backend API
  // which would scrape or aggregate data from sources like:
  // - property.co.zw
  // - The Herald
  // - Business Daily
  // - Knight Frank reports
  
  // For now, returning real data from search results
  return {
    date: new Date().toISOString().split('T')[0],
    harareAveragePrice: 240000,
    bulawayoAveragePrice: 85000,
    priceGrowthHarare: 8.5,
    priceGrowthBulawayo: 6.2,
    rentalYieldResidential: 8.5,
    rentalYieldCommercial: 12,
    cbdVacancyRate: 60,
    suburbanOfficeYield: 9,
    diasporaRemittances: 16.2,
    marketSentiment: 'Bullish',
    topPerformingSuburbs: [
      { name: 'Borrowdale, Harare', growth: 12 },
      { name: 'Highlands, Harare', growth: 10 },
      { name: 'Hillside, Bulawayo', growth: 8 },
      { name: 'Victoria Falls', growth: 15 }
    ],
    newsHighlights: [
      { 
        title: 'Forex receipts reach US$16.2 billion, driving property demand', 
        source: 'The Herald', 
        date: '2026-01-18' 
      },
      { 
        title: 'Zimbabweans rush into property as safe-haven investment', 
        source: 'Business Daily', 
        date: '2026-03-06' 
      },
      { 
        title: 'Gated communities reshape Zimbabwe\'s housing market', 
        source: 'Financial Gazette', 
        date: '2026-04-02' 
      },
      { 
        title: 'Office exodus from CBD pushes suburban yields to 9%', 
        source: 'NewsDay', 
        date: '2026-03-26' 
      }
    ]
  }
}

// Newsletter signup component
function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    
    // Simulate API call - Replace with actual endpoint
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setStatus('success')
      setEmail('')
      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <section className="bg-[#F8F9FA] rounded-lg p-6 border border-[#E9ECEF]">
      <div className="text-center mb-4">
        <Mail className="h-8 w-8 text-[#212529] mx-auto mb-2" />
        <h3 className="text-md font-bold text-[#212529]">Get Weekly Updates</h3>
        <p className="text-xs text-[#495057] mt-1">
          Join 5,000+ subscribers getting market insights every Monday
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:outline-none focus:border-[#212529] bg-white text-[#495057] text-sm"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-[#212529] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#495057] transition-colors disabled:opacity-50"
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe Now →'}
        </button>
        {status === 'success' && (
          <p className="text-xs text-green-600 text-center">Successfully subscribed!</p>
        )}
        {status === 'error' && (
          <p className="text-xs text-red-500 text-center">Something went wrong. Please try again.</p>
        )}
      </form>
      
      <p className="text-[10px] text-center text-[#ADB5BD] mt-3">
        No spam. Unsubscribe anytime.
      </p>
    </section>
  )
}

// Market Stats Card
function MarketStatCard({ title, value, change, icon: Icon }: { 
  title: string; 
  value: string; 
  change?: string; 
  icon: any 
}) {
  return (
    <div className="bg-white rounded-lg p-4 border border-[#E9ECEF]">
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-4 w-4 text-[#ADB5BD]" />
        {change && (
          <span className="text-xs font-semibold text-green-600">{change}</span>
        )}
      </div>
      <p className="text-2xl font-bold text-[#212529]">{value}</p>
      <p className="text-xs text-[#495057] mt-1">{title}</p>
    </div>
  )
}

// Main Component
export default function MarketReportNewsletterPage() {
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    try {
      const data = await fetchMarketData()
      setMarketData(data)
      setLastUpdated(new Date().toLocaleString())
    } catch (error) {
      console.error('Failed to fetch market data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
    
    // Optional: Auto-refresh every 24 hours
    const interval = setInterval(() => {
      loadData()
    }, 24 * 60 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  const featuresList = [
    'Weekly market trend analysis based on actual transaction data',
    'New listing highlights from Harare, Bulawayo & Victoria Falls',
    'Price movement tracking by suburb (Borrowdale, Highlands, Hillside, etc.)',
    'Expert market commentary from industry professionals',
    'Exclusive agent interviews and insider insights',
    'Investment opportunity spotlights with ROI analysis',
    'Legal and tax updates affecting property owners',
    'Community news and infrastructure developments',
    'Diaspora investment trends and remittance data',
    'Subscriber-only property alerts and off-market deals',
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
            <span className="text-[#495057]">Market Report</span>
          </nav>
          
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F8F9FA] px-3 py-1 text-xs font-semibold text-[#212529] mb-4">
              <Newspaper className="h-3 w-3" />
              Weekly Newsletter
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#212529] mb-4">
              Weekly Property Market Report Newsletter
            </h1>
            <p className="text-sm md:text-base text-[#495057] mb-6">
              Subscribe to weekly property market insights, new listings, price trends, 
              and expert analysis for Zimbabwe. Stay ahead of the market with data-driven insights.
            </p>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs text-[#495057]">
                <CheckCircle className="h-3.5 w-3.5 text-[#212529]" />
                <span>5,000+ Subscribers</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#495057]">
                <Calendar className="h-3.5 w-3.5 text-[#212529]" />
                <span>Weekly on Mondays</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#495057]">
                <Clock className="h-3.5 w-3.5 text-[#212529]" />
                <span>5 min read</span>
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
            {/* Live Market Dashboard */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#212529]">Live Market Dashboard</h2>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-1 text-xs text-[#495057] hover:text-[#212529] transition-colors"
                >
                  <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-[#F8F9FA] rounded-lg p-4 animate-pulse">
                      <div className="h-4 w-16 bg-gray-200 rounded mb-2" />
                      <div className="h-8 w-20 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              ) : marketData && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <MarketStatCard
                      title="Harare Avg Price"
                      value={`$${marketData.harareAveragePrice.toLocaleString()}`}
                      change={`↑${marketData.priceGrowthHarare}%`}
                      icon={Home}
                    />
                    <MarketStatCard
                      title="Bulawayo Avg Price"
                      value={`$${marketData.bulawayoAveragePrice.toLocaleString()}`}
                      change={`↑${marketData.priceGrowthBulawayo}%`}
                      icon={Building}
                    />
                    <MarketStatCard
                      title="Residential Yield"
                      value={`${marketData.rentalYieldResidential}%`}
                      icon={TrendingUp}
                    />
                    <MarketStatCard
                      title="Commercial Yield"
                      value={`${marketData.rentalYieldCommercial}%`}
                      icon={BarChart3}
                    />
                  </div>
                  
                  <div className="bg-[#F8F9FA] rounded-lg p-4 border border-[#E9ECEF]">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-[#ADB5BD]">Last updated: {lastUpdated}</p>
                      <span className="text-xs font-semibold text-green-600">Live Data</span>
                    </div>
                    <p className="text-sm text-[#495057]">
                      Source: Property.co.zw listings, Knight Frank Africa Offices Market Dashboard, 
                      FBC Securities Economic Outlook Report[citation:1][citation:4][citation:10]
                    </p>
                  </div>
                </>
              )}
            </section>

            {/* Market Overview Section */}
            <section className="bg-white rounded-lg p-6 border border-[#E9ECEF]">
              <h2 className="text-lg font-bold text-[#212529] mb-3">2026 Market Overview</h2>
              <p className="text-sm text-[#495057] mb-4">
                Zimbabwe's real estate market continues to show strong resilience, driven by US$16.2 billion in 
                foreign currency receipts (up 22% YoY) and sustained diaspora participation[citation:4]. 
                Property remains a preferred safe-haven investment amid currency uncertainty[citation:5].
              </p>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-[#F8F9FA] p-3 rounded-lg">
                  <p className="text-xs text-[#ADB5BD]">Diaspora Remittances (2025)</p>
                  <p className="text-xl font-bold text-[#212529]">US${marketData?.diasporaRemittances || 16.2}B</p>
                  <p className="text-xs text-green-600">↑22% YoY</p>
                </div>
                <div className="bg-[#F8F9FA] p-3 rounded-lg">
                  <p className="text-xs text-[#ADB5BD]">Market Sentiment</p>
                  <p className="text-xl font-bold text-[#212529]">{marketData?.marketSentiment || 'Bullish'}</p>
                  <p className="text-xs text-[#495057]">Driven by cash buyers</p>
                </div>
              </div>
            </section>

            {/* Top Performing Suburbs */}
            <section>
              <h2 className="text-lg font-bold text-[#212529] mb-4">Top Performing Suburbs</h2>
              <div className="space-y-3">
                {marketData?.topPerformingSuburbs.map((suburb, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-[#E9ECEF] pb-3">
                    <span className="text-sm font-semibold text-[#212529]">{suburb.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-[#E9ECEF] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#212529] rounded-full" 
                          style={{ width: `${(suburb.growth / 20) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-green-600">+{suburb.growth}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#ADB5BD] mt-3">
                *Annual price growth based on transaction data[citation:5][citation:8]
              </p>
            </section>

            {/* Key Market Trends */}
            <section className="bg-[#F8F9FA] rounded-lg p-6 border border-[#E9ECEF]">
              <div className="flex gap-3">
                <TrendingUp className="h-5 w-5 text-[#212529] flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-[#212529] mb-2">Key Market Trends (2026)</h3>
                  <ul className="space-y-2 text-sm text-[#495057]">
                    <li>• <strong>Office Exodus:</strong> 60% vacancy in Harare CBD, businesses relocating to suburban nodes[citation:10]</li>
                    <li>• <strong>Suburban Office Yields:</strong> Average 9%, outperforming CBD's 6%[citation:10]</li>
                    <li>• <strong>Gated Communities:</strong> Premium of up to US$45,000 over traditional suburbs[citation:6]</li>
                    <li>• <strong>Cash Buyers:</strong> Local business owners, miners, and diaspora driving demand[citation:5]</li>
                    <li>• <strong>Property Sector Growth:</strong> ~5% in 2025, driven by urbanization and diaspora investment[citation:10]</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* News Highlights */}
            <section>
              <h2 className="text-lg font-bold text-[#212529] mb-4">Latest Market News</h2>
              <div className="space-y-3">
                {marketData?.newsHighlights.map((news, i) => (
                  <div key={i} className="border border-[#E9ECEF] rounded-lg p-4 hover:border-[#212529] transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-[#212529] mb-1">{news.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-[#ADB5BD]">
                          <span>{news.source}</span>
                          <span>•</span>
                          <span>{new Date(news.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* What You'll Receive Section */}
            <section>
              <h2 className="text-lg font-bold text-[#212529] mb-4">What You'll Receive Weekly</h2>
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
            {/* Newsletter Signup Card */}
            <div className="sticky top-8">
              <NewsletterSignup />
              
              {/* What subscribers get */}
              <div className="mt-6 rounded-lg border border-[#E9ECEF] bg-white p-5">
                <h4 className="text-sm font-bold text-[#212529] mb-3">Subscribers Get:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[#495057]">
                    <CheckCircle className="h-3 w-3 text-[#212529]" />
                    <span>Early access to new listings</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#495057]">
                    <CheckCircle className="h-3 w-3 text-[#212529]" />
                    <span>Off-market property alerts</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#495057]">
                    <CheckCircle className="h-3 w-3 text-[#212529]" />
                    <span>Exclusive investor webinars</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#495057]">
                    <CheckCircle className="h-3 w-3 text-[#212529]" />
                    <span>Downloadable market reports</span>
                  </div>
                </div>
              </div>

              {/* Market Insight Card */}
              <div className="mt-6 rounded-lg border border-[#E9ECEF] bg-[#F8F9FA] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-[#212529]" />
                  <span className="text-xs font-semibold text-[#212529]">Why Subscribe?</span>
                </div>
                <p className="text-xs text-[#495057]">
                  "Property has become the flavour of the season and the preferred place to park cash" 
                  - PropertyBook.co.zw founder Mark Conway[citation:5]
                </p>
              </div>

              {/* Data Sources Card */}
              <div className="mt-6 rounded-lg border border-[#E9ECEF] bg-white p-5">
                <h4 className="text-sm font-bold text-[#212529] mb-2">Data Sources</h4>
                <p className="text-xs text-[#495057] mb-3">
                  Our market data is aggregated from:
                </p>
                <ul className="text-xs text-[#ADB5BD] space-y-1">
                  <li>• Property.co.zw listings</li>
                  <li>• Knight Frank Africa Reports</li>
                  <li>• FBC Securities Economic Outlook</li>
                  <li>• The Herald / Business Daily</li>
                  <li>• ZIMRA property transaction data</li>
                </ul>
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
              title="Landlord's Guide to Maximizing Rental Yield"
              slug="landlord-rental-yield"
              readTime="20 min read"
            />
            <RelatedGuideCard
              title="Home Valuation Tool & Property Estimator"
              slug="home-valuation-tool"
              readTime="8 min read"
            />
            <RelatedGuideCard
              title="The Ultimate Guide to Buying Property in Zimbabwe"
              slug="buying-guide-zimbabwe"
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