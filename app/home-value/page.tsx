'use client'

import { useState } from 'react'
import { Search, TrendingUp, Home, ArrowRight, MapPin, DollarSign, BarChart3, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

type ValuationResult = {
  estimated_value: number
  price_per_sqft: number
  comparable_count: number
  confidence: 'high' | 'medium' | 'low'
  comparables: Array<{
    id: string
    title: string
    slug: string
    price: number
    sale_price: number | null
    sqft: number | null
    beds: number
    baths: number
    neighborhood: string
    listing_type: string
    primary_image?: string
  }>
  market_stats: {
    avg_price: number
    median_price: number
    total_listings: number
    avg_sqft_price: number
  }
}

export default function HomeValuePage() {
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('Harare')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ValuationResult | null>(null)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address.trim()) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch(`/api/valuation?address=${encodeURIComponent(address)}&city=${encodeURIComponent(city)}`)
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to get valuation')
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (p: number) => {
    if (p >= 1000000) return `$${(p / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
    if (p >= 100000) return `$${(p / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
    return `$${(p / 100).toFixed(2)}`
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-[#F8F9FA] border-b border-[#E9ECEF]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-[#212529] tracking-tight mb-4">
            How much is your home worth?
          </h1>
          <p className="text-lg text-[#495057] mb-10 max-w-2xl mx-auto">
            Get a free property valuation based on comparable listings in your area.
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ADB5BD]" size={18} />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter neighborhood or address..."
                  className="w-full pl-11 pr-4 py-4 text-base bg-white border-2 border-[#E9ECEF] rounded-xl focus:outline-none focus:border-[#212529] transition-colors"
                />
              </div>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="px-4 py-4 text-base bg-white border-2 border-[#E9ECEF] rounded-xl focus:outline-none focus:border-[#212529]"
              >
                <option value="Harare">Harare</option>
                <option value="Bulawayo">Bulawayo</option>
                <option value="Mutare">Mutare</option>
                <option value="Gweru">Gweru</option>
                <option value="Masvingo">Masvingo</option>
              </select>
              <button
                type="submit"
                disabled={loading || !address.trim()}
                className="px-8 py-4 bg-[#212529] text-white font-semibold rounded-xl hover:bg-black transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Get Estimate'}
              </button>
            </div>
          </form>

          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}
        </div>
      </section>

      {/* Results */}
      {result && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Estimate card */}
          <div className="bg-[#F8F9FA] border-2 border-[#E9ECEF] rounded-2xl p-8 mb-10 text-center">
            <p className="text-sm font-medium text-[#ADB5BD] uppercase tracking-wider mb-2">Estimated Value</p>
            <p className="text-4xl md:text-5xl font-bold text-[#212529] mb-3">
              {formatPrice(result.estimated_value)}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-[#495057]">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                result.confidence === 'high'
                  ? 'bg-green-100 text-green-800'
                  : result.confidence === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {result.confidence} confidence
              </span>
              <span>&middot;</span>
              <span>Based on {result.comparable_count} comparables</span>
            </div>
          </div>

          {/* Market stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Avg. Price', value: formatPrice(result.market_stats.avg_price), icon: DollarSign },
              { label: 'Median Price', value: formatPrice(result.market_stats.median_price), icon: BarChart3 },
              { label: 'Price/sqft', value: formatPrice(result.market_stats.avg_sqft_price), icon: TrendingUp },
              { label: 'Active Listings', value: result.market_stats.total_listings.toString(), icon: Home },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-[#E9ECEF] rounded-xl p-5">
                <stat.icon size={18} className="text-[#ADB5BD] mb-2" />
                <p className="text-xs text-[#ADB5BD] font-medium mb-1">{stat.label}</p>
                <p className="text-lg font-bold text-[#212529]">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Comparable properties */}
          {result.comparables.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-[#212529] mb-6">Comparable Properties</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {result.comparables.map((comp) => (
                  <Link
                    key={comp.id}
                    href={`/property/${comp.slug}`}
                    className="border border-[#E9ECEF] rounded-xl overflow-hidden hover:border-[#212529] transition-colors group"
                  >
                    <div className="h-40 bg-[#E9ECEF] relative">
                      {comp.primary_image && (
                        <Image
                          src={comp.primary_image}
                          alt={comp.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute top-2 left-2 bg-black/80 text-white px-2 py-0.5 rounded text-xs font-bold">
                        {formatPrice(comp.sale_price || comp.price)}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-[#212529] truncate mb-1">{comp.title}</h3>
                      <p className="text-xs text-[#ADB5BD] mb-2">{comp.neighborhood}</p>
                      <div className="flex gap-3 text-xs text-[#495057]">
                        <span><b>{comp.beds}</b> bd</span>
                        <span><b>{comp.baths}</b> ba</span>
                        {comp.sqft && <span><b>{comp.sqft.toLocaleString()}</b> sqft</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* How it works - shown when no results */}
      {!result && !loading && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-[#212529] text-center mb-10">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Enter your address', desc: 'Tell us your neighborhood or specific address to get started.' },
              { step: '2', title: 'We analyze the market', desc: 'We compare similar properties that are currently listed or recently sold.' },
              { step: '3', title: 'Get your estimate', desc: 'See your estimated home value based on real market data.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-[#212529] text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-[#212529] mb-2">{item.title}</h3>
                <p className="text-sm text-[#495057]">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/search?type=sale"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#212529] hover:underline"
            >
              Browse homes for sale <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
