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

      {/* Split screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Listings panel */}
        <div className="w-full lg:w-1/2 overflow-y-auto p-4 space-y-4">
          {/* Results count */}
          <div className="flex items-center justify-between mb-2">
            <div className="h-5 w-36 bg-[#E9ECEF] rounded animate-pulse" />
            <div className="h-8 w-28 bg-[#E9ECEF] rounded-lg animate-pulse" />
          </div>

          {/* Property cards */}
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="flex bg-white rounded-lg border border-[#E9ECEF] overflow-hidden">
              <div className="w-72 h-48 bg-[#E9ECEF] animate-pulse flex-shrink-0" />
              <div className="flex-1 p-4">
                <div className="h-6 w-28 bg-[#E9ECEF] rounded animate-pulse mb-2" />
                <div className="h-4 w-48 bg-[#E9ECEF] rounded animate-pulse mb-1" />
                <div className="h-4 w-32 bg-[#E9ECEF] rounded animate-pulse mb-4" />
                <div className="flex gap-4 pt-3 border-t border-[#F8F9FA]">
                  <div className="h-4 w-14 bg-[#E9ECEF] rounded animate-pulse" />
                  <div className="h-4 w-14 bg-[#E9ECEF] rounded animate-pulse" />
                  <div className="h-4 w-14 bg-[#E9ECEF] rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Map skeleton */}
        <div className="hidden lg:block lg:w-1/2 bg-[#E9ECEF] animate-pulse" />
      </div>
    </div>
  )
}
