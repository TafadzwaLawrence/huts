export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero skeleton */}
      <div className="h-[60vh] bg-gradient-to-b from-white to-[#F8F9FA] animate-pulse">
        <div className="max-w-7xl mx-auto px-4 pt-32">
          <div className="h-12 w-96 bg-[#E9ECEF] rounded-lg mx-auto mb-4" />
          <div className="h-6 w-64 bg-[#E9ECEF] rounded-lg mx-auto mb-8" />
          <div className="h-14 w-full max-w-2xl bg-[#E9ECEF] rounded-xl mx-auto" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="h-8 w-48 bg-[#E9ECEF] rounded-lg mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border border-[#E9ECEF] overflow-hidden">
              <div className="h-48 bg-[#E9ECEF] animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-6 w-24 bg-[#E9ECEF] rounded" />
                <div className="h-4 w-full bg-[#E9ECEF] rounded" />
                <div className="h-4 w-2/3 bg-[#E9ECEF] rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
