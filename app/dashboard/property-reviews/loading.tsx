export default function PropertyReviewsLoading() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-[#E9ECEF]">
          <div className="space-y-2">
            <div className="h-8 w-44 bg-[#E9ECEF] rounded animate-pulse" />
            <div className="h-4 w-72 bg-[#E9ECEF] rounded animate-pulse" />
          </div>
        </div>

        {/* Stats: 4 cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
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
            <div key={i} className="bg-white border border-[#E9ECEF] rounded-xl overflow-hidden">
              {/* Property header */}
              <div className="flex items-center justify-between p-5 border-b border-[#E9ECEF]">
                <div className="space-y-1.5">
                  <div className="h-4 w-52 bg-[#E9ECEF] rounded animate-pulse" />
                  <div className="h-3.5 w-36 bg-[#E9ECEF] rounded animate-pulse" />
                </div>
                {/* Stars */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((__, j) => (
                    <div key={j} className="w-4 h-4 bg-[#E9ECEF] rounded animate-pulse" />
                  ))}
                </div>
              </div>

              {/* Reviewer info + review body */}
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E9ECEF] animate-pulse flex-shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-28 bg-[#E9ECEF] rounded animate-pulse" />
                    <div className="h-3 w-20 bg-[#E9ECEF] rounded animate-pulse" />
                  </div>
                  <div className="ml-auto h-7 w-20 bg-[#E9ECEF] rounded-lg animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-[#E9ECEF] rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-[#E9ECEF] rounded animate-pulse" />
                  <div className="h-4 w-4/6 bg-[#E9ECEF] rounded animate-pulse" />
                </div>
              </div>

              {/* Response area */}
              <div className="px-5 pb-5">
                <div className="bg-[#F8F9FA] rounded-xl p-4 space-y-2 border border-[#E9ECEF]">
                  <div className="h-3.5 w-24 bg-[#E9ECEF] rounded animate-pulse" />
                  <div className="h-4 w-full bg-[#E9ECEF] rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-[#E9ECEF] rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
