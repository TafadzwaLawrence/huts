export default function SearchLoading() {
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Filter bar skeleton */}
      <div className="bg-white border-b border-[#E9ECEF] px-4 py-3">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-9 w-24 bg-[#F8F9FA] rounded-full animate-pulse" />
          ))}
          <div className="ml-auto h-9 w-20 bg-[#F8F9FA] rounded-full animate-pulse" />
        </div>
      </div>

      {/* Split screen - Map LEFT, List RIGHT (matches actual layout) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map skeleton - LEFT SIDE */}
        <div className="hidden lg:block lg:w-1/2 border-r border-[#E9ECEF] bg-[#E9ECEF] animate-pulse relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-[#ADB5BD] text-sm font-medium">Loading map...</div>
          </div>
        </div>

        {/* Listings panel - RIGHT SIDE */}
        <div className="w-full lg:w-1/2 overflow-y-auto bg-white">
          {/* Search as map moves toggle skeleton */}
          <div className="px-4 py-1.5 border-b border-[#E9ECEF] bg-[#F8F9FA]/50">
            <div className="h-3.5 w-40 bg-[#E9ECEF] rounded animate-pulse" />
          </div>

          {/* Header with sort */}
          <div className="px-4 pt-4 pb-2 flex items-start justify-between">
            <div>
              <div className="h-6 w-48 bg-[#E9ECEF] rounded animate-pulse mb-1" />
              <div className="h-4 w-24 bg-[#F8F9FA] rounded animate-pulse" />
            </div>
            <div className="h-8 w-32 bg-[#E9ECEF] rounded animate-pulse" />
          </div>

          {/* Property cards grid */}
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse rounded-xl overflow-hidden border border-[#E9ECEF]">
                  {/* Image skeleton */}
                  <div className="bg-[#E9ECEF] h-44 relative">
                    <div className="absolute top-3 left-3 h-6 w-20 bg-white/80 rounded animate-pulse" />
                    <div className="absolute top-3 right-3 h-9 w-9 bg-white/80 rounded-full animate-pulse" />
                  </div>
                  {/* Content skeleton */}
                  <div className="p-3 space-y-2">
                    <div className="h-5 w-24 bg-[#E9ECEF] rounded" />
                    <div className="h-3 w-32 bg-[#F8F9FA] rounded" />
                    <div className="h-3 w-40 bg-[#F8F9FA] rounded" />
                    <div className="flex gap-3 pt-2 border-t border-[#F8F9FA]">
                      <div className="h-4 w-12 bg-[#E9ECEF] rounded" />
                      <div className="h-4 w-12 bg-[#E9ECEF] rounded" />
                      <div className="h-4 w-12 bg-[#E9ECEF] rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
