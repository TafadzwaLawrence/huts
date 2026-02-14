export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Dashboard header skeleton */}
      <div className="bg-white border-b border-[#E9ECEF] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="h-8 w-48 bg-[#E9ECEF] rounded animate-pulse" />
          <div className="flex gap-4">
            <div className="h-10 w-32 bg-[#E9ECEF] rounded animate-pulse" />
            <div className="h-10 w-10 bg-[#E9ECEF] rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Dashboard content skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E9ECEF] p-6">
              <div className="h-4 w-24 bg-[#E9ECEF] rounded animate-pulse mb-2" />
              <div className="h-8 w-16 bg-[#E9ECEF] rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Main content area */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] p-6">
          <div className="h-6 w-48 bg-[#E9ECEF] rounded animate-pulse mb-6" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border border-[#E9ECEF] rounded-lg">
                <div className="h-16 w-24 bg-[#E9ECEF] rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-48 bg-[#E9ECEF] rounded animate-pulse" />
                  <div className="h-4 w-32 bg-[#E9ECEF] rounded animate-pulse" />
                </div>
                <div className="h-8 w-20 bg-[#E9ECEF] rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
