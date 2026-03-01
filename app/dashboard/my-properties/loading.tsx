export default function MyPropertiesLoading() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="space-y-5">

          {/* Page header */}
          <div className="space-y-1.5">
            <div className="h-7 w-40 bg-[#E9ECEF] rounded animate-pulse" />
            <div className="h-4 w-48 bg-[#E9ECEF] rounded animate-pulse" />
          </div>

          {/* Stats row: 2-col mobile, 4-col sm */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-[#E9ECEF] p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-5 h-5 bg-[#E9ECEF] rounded animate-pulse" />
                </div>
                <div className="h-8 w-12 bg-[#E9ECEF] rounded animate-pulse mb-1" />
                <div className="h-4 w-20 bg-[#E9ECEF] rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Toolbar: search + filters + sort */}
          <div className="bg-white rounded-lg border border-[#E9ECEF] p-3 space-y-3">
            {/* Search bar */}
            <div className="h-9 w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg animate-pulse" />
            {/* Filter pills + sort */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex flex-wrap gap-2 flex-1">
                <div className="h-8 w-28 bg-[#F8F9FA] rounded-lg animate-pulse" />
                <div className="h-8 w-36 bg-[#F8F9FA] rounded-lg animate-pulse" />
              </div>
              <div className="h-8 w-24 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Results count */}
          <div className="h-3.5 w-24 bg-[#E9ECEF] rounded animate-pulse" />

          {/* Property rows */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-[#E9ECEF] overflow-hidden">
              <div className="flex">
                {/* Thumbnail */}
                <div className="w-28 sm:w-40 flex-shrink-0 h-[110px] bg-[#E9ECEF] animate-pulse" />
                {/* Details */}
                <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="h-4 w-40 bg-[#E9ECEF] rounded animate-pulse" />
                      <div className="h-5 w-16 bg-[#E9ECEF] rounded-full animate-pulse flex-shrink-0" />
                    </div>
                    <div className="h-3.5 w-28 bg-[#E9ECEF] rounded animate-pulse" />
                    <div className="flex items-center gap-3">
                      <div className="h-3.5 w-14 bg-[#E9ECEF] rounded animate-pulse" />
                      <div className="h-3.5 w-14 bg-[#E9ECEF] rounded animate-pulse" />
                      <div className="h-3.5 w-14 bg-[#E9ECEF] rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="h-5 w-24 bg-[#E9ECEF] rounded animate-pulse" />
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-14 bg-[#E9ECEF] rounded-md animate-pulse" />
                      <div className="h-7 w-14 bg-[#E9ECEF] rounded-md animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  )
}
