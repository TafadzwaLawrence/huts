export default function ReviewsLoading() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* Header */}
        <div className="mb-6 space-y-2">
          <div className="h-7 w-32 bg-[#E9ECEF] rounded animate-pulse" />
          <div className="h-4 w-72 bg-[#E9ECEF] rounded animate-pulse" />
        </div>

        {/* Stats: 3 cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-[#E9ECEF] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-5 h-5 bg-[#E9ECEF] rounded animate-pulse" />
              </div>
              <div className="h-8 w-12 bg-[#E9ECEF] rounded animate-pulse mb-1" />
              <div className="h-4 w-24 bg-[#E9ECEF] rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Review cards */}
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-[#E9ECEF] rounded-lg overflow-hidden">
              {/* Property bar */}
              <div className="flex items-center justify-between p-4 border-b border-[#E9ECEF]">
                <div className="space-y-1.5">
                  <div className="h-4 w-48 bg-[#E9ECEF] rounded animate-pulse" />
                  <div className="h-3.5 w-36 bg-[#E9ECEF] rounded animate-pulse" />
                </div>
                {/* Star row */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((__, j) => (
                    <div key={j} className="w-4 h-4 bg-[#E9ECEF] rounded animate-pulse" />
                  ))}
                </div>
              </div>
              {/* Review content */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-3.5 w-28 bg-[#E9ECEF] rounded animate-pulse" />
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-14 bg-[#E9ECEF] rounded animate-pulse" />
                    <div className="h-7 w-14 bg-[#E9ECEF] rounded animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-[#E9ECEF] rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-[#E9ECEF] rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-[#E9ECEF] rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
