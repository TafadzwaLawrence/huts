'use client'

import { useState } from 'react'
import { SearchAutocomplete } from '@/components/search/SearchAutocomplete'

const TABS = [
  { id: 'rent', label: 'Rent' },
  { id: 'buy', label: 'Buy' },
  { id: 'sell', label: 'Sell' },
] as const

type TabId = (typeof TABS)[number]['id']

export function HomepageHero() {
  const [activeTab, setActiveTab] = useState<TabId>('rent')

  const placeholders: Record<TabId, string> = {
    rent: 'Enter a city, neighborhood, or address',
    buy: 'Enter a city, neighborhood, or address',
    sell: 'Enter your address',
  }

  const handleSearch = (query: string) => {
    if (activeTab === 'sell') {
      window.location.href = '/dashboard/new-property'
    }
    // SearchAutocomplete handles navigation for rent/buy
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Tab Bar */}
      <div className="flex items-center gap-0 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2.5 text-sm font-bold tracking-wide transition-all rounded-t-lg ${
              activeTab === tab.id
                ? 'bg-white text-[#212529] shadow-sm'
                : 'bg-transparent text-white/80 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl rounded-tl-none shadow-2xl p-1.5">
        <SearchAutocomplete
          placeholder={placeholders[activeTab]}
          className="w-full"
          inputClassName="w-full px-5 py-4 text-base text-[#212529] placeholder:text-[#ADB5BD] outline-none rounded-lg bg-[#F8F9FA] focus:bg-white border-2 border-transparent focus:border-[#212529] transition-all"
        />
      </div>

      {/* Sub-links */}
      <div className="mt-3 flex items-center justify-center gap-4 text-sm">
        {activeTab === 'rent' && (
          <>
            <a href="/search?type=rent" className="text-white/70 hover:text-white underline underline-offset-2 transition-colors">All Rentals</a>
            <a href="/student-housing" className="text-white/70 hover:text-white underline underline-offset-2 transition-colors">Student Housing</a>
            <a href="/areas" className="text-white/70 hover:text-white underline underline-offset-2 transition-colors">Browse Areas</a>
          </>
        )}
        {activeTab === 'buy' && (
          <>
            <a href="/search?type=sale" className="text-white/70 hover:text-white underline underline-offset-2 transition-colors">Homes for Sale</a>
            <a href="/areas" className="text-white/70 hover:text-white underline underline-offset-2 transition-colors">Browse Areas</a>
          </>
        )}
        {activeTab === 'sell' && (
          <>
            <a href="/dashboard/new-property" className="text-white/70 hover:text-white underline underline-offset-2 transition-colors">List Property</a>
            <a href="/pricing" className="text-white/70 hover:text-white underline underline-offset-2 transition-colors">Pricing</a>
          </>
        )}
      </div>
    </div>
  )
}
