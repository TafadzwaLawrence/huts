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
      <span className="text-sm font-medium text-[#495057]">Sort:</span>
      <select
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="text-sm font-medium text-[#212529] bg-white border-2 border-[#E9ECEF] rounded-lg px-4 py-2.5 hover:border-[#ADB5BD] focus:outline-none focus:border-[#212529] transition-colors cursor-pointer"
      >
        <option value="best">Best match</option>
        <option value="rating">Highest rated</option>
        <option value="reviews">Most reviews</option>
        <option value="experience">Most experience</option>
        <option value="newest">Newest</option>
      </select>
    </div>
  )
}
