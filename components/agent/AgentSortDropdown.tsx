'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface AgentSortDropdownProps {
  currentSort?: string
}

export function AgentSortDropdown({ currentSort = 'best' }: AgentSortDropdownProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', value)
    router.push(`/find-agent?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[#ADB5BD]">Sort by:</span>
      <select
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="text-sm bg-white border border-[#E9ECEF] rounded-lg px-3 py-2 focus:outline-none focus:border-[#212529]"
      >
        <option value="best">Best Match</option>
        <option value="rating">Highest Rated</option>
        <option value="reviews">Most Reviews</option>
        <option value="experience">Most Experience</option>
        <option value="newest">Newest</option>
      </select>
    </div>
  )
}
