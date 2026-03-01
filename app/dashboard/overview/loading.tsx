export default function OverviewLoading() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* Header: greeting + button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-[#E9ECEF]">
          <div className="space-y-2">
            <div className="h-8 w-56 bg-[#E9ECEF] rounded animate-pulse" />
            <div className="h-4 w-36 bg-[#E9ECEF] rounded animate-pulse" />
          </div>
          <div className="h-10 w-36 bg-[#E9ECEF] rounded-lg animate-pulse" />
        </div>

        {/* Stat cards: 2-col mobile, 4-col lg */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-[#E9ECEF] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-5 w-5 bg-[#E9ECEF] rounded animate-pulse" />
                <div className="h-4 w-4 bg-[#E9ECEF] rounded animate-pulse" />
              </div>
              <div className="h-8 w-12 bg-[#E9ECEF] rounded animate-pulse mb-1" />
              <div className="h-4 w-20 bg-[#E9ECEF] rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Main content: 5-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left col (span-3): property list */}
          <div className="lg:col-span-3 space-y-3">
            <div className="bg-white rounded-xl border border-[#E9ECEF] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F3F5]">
                <div className="h-4 w-28 bg-[#E9ECEF] rounded animate-pulse" />
                <div className="h-4 w-12 bg-[#E9ECEF] rounded animate-pulse" />
              </div>
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="rounded-xl border border-[#E9ECEF] overflow-hidden flex">
                    {/* Thumbnail */}
                    <div className="w-28 sm:w-36 flex-shrink-0 h-[100px] bg-[#E9ECEF] animate-pulse" />
                    {/* Details */}
                    <div className="flex-1 p-3.5 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="h-4 w-36 bg-[#E9ECEF] rounded animate-pulse" />
                          <div className="h-5 w-16 bg-[#E9ECEF] rounded-full animate-pulse" />
                        </div>
                        <div className="h-3 w-24 bg-[#E9ECEF] rounded animate-pulse" />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="h-5 w-20 bg-[#E9ECEF] rounded animate-pulse" />
                        <div className="h-7 w-12 bg-[#E9ECEF] rounded-md animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right col (span-2): messages + quick links */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Messages */}
            <div className="bg-white rounded-xl border border-[#E9ECEF] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F3F5]">
                <div className="h-4 w-32 bg-[#E9ECEF] rounded animate-pulse" />
                <div className="h-4 w-8 bg-[#E9ECEF] rounded animate-pulse" />
              </div>
              <div className="divide-y divide-[#E9ECEF]">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="w-9 h-9 rounded-full bg-[#E9ECEF] animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="h-3.5 w-28 bg-[#E9ECEF] rounded animate-pulse" />
                        <div className="h-3 w-10 bg-[#E9ECEF] rounded animate-pulse" />
                      </div>
                      <div className="h-3 w-40 bg-[#E9ECEF] rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links placeholder */}
            <div className="bg-white rounded-xl border border-[#E9ECEF] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#F1F3F5]">
                <div className="h-4 w-24 bg-[#E9ECEF] rounded animate-pulse" />
              </div>
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-[#E9ECEF]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#E9ECEF] rounded-lg animate-pulse" />
                      <div className="h-4 w-28 bg-[#E9ECEF] rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-4 bg-[#E9ECEF] rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
