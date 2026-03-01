export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Messages two-panel chat layout */}
      <div className="flex h-[calc(100vh-60px)]">

        {/* Left: conversation list */}
        <div className="w-80 flex-shrink-0 bg-white border-r border-[#E9ECEF] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E9ECEF]">
            <div className="h-5 w-24 bg-[#E9ECEF] rounded animate-pulse" />
            <div className="h-5 w-5 bg-[#E9ECEF] rounded animate-pulse" />
          </div>
          {/* Search */}
          <div className="px-4 py-3 border-b border-[#E9ECEF]">
            <div className="h-9 w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg animate-pulse" />
          </div>
          {/* Conversation rows */}
          <div className="flex-1 overflow-hidden divide-y divide-[#E9ECEF]">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-11 h-11 rounded-full bg-[#E9ECEF] animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="h-3.5 w-28 bg-[#E9ECEF] rounded animate-pulse" />
                    <div className="h-3 w-8 bg-[#E9ECEF] rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-44 bg-[#E9ECEF] rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: empty chat panel */}
        <div className="flex-1 bg-[#FAFAFA] flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-full bg-[#E9ECEF] animate-pulse" />
          <div className="h-4 w-40 bg-[#E9ECEF] rounded animate-pulse" />
          <div className="h-3.5 w-56 bg-[#E9ECEF] rounded animate-pulse" />
        </div>

      </div>
    </div>
  )
}
