export default function PropertyLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Image Gallery Skeleton */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] md:h-[500px]">
        <div className="col-span-2 row-span-2 bg-[#E9ECEF] animate-pulse" />
        <div className="bg-[#E9ECEF] animate-pulse" />
        <div className="bg-[#E9ECEF] animate-pulse" />
        <div className="bg-[#E9ECEF] animate-pulse" />
        <div className="bg-[#E9ECEF] animate-pulse" />
      </div>

      {/* Two-column content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column (65%) */}
          <div className="lg:col-span-7 xl:col-span-8">
            {/* Price & address */}
            <div className="mb-6">
              <div className="h-10 w-48 bg-[#E9ECEF] rounded animate-pulse mb-2" />
              <div className="h-5 w-72 bg-[#F8F9FA] rounded animate-pulse mb-3" />
              <div className="flex gap-6">
                <div className="h-5 w-16 bg-[#F8F9FA] rounded animate-pulse" />
                <div className="h-5 w-16 bg-[#F8F9FA] rounded animate-pulse" />
                <div className="h-5 w-20 bg-[#F8F9FA] rounded animate-pulse" />
              </div>
            </div>

            {/* Highlights skeleton */}
            <div className="mb-8">
              <div className="h-6 w-36 bg-[#E9ECEF] rounded animate-pulse mb-3" />
              <div className="flex gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 w-32 bg-[#F8F9FA] rounded-lg animate-pulse" />
                ))}
              </div>
            </div>

            {/* Description skeleton */}
            <div className="mb-8">
              <div className="h-6 w-44 bg-[#E9ECEF] rounded animate-pulse mb-3" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-[#F8F9FA] rounded animate-pulse" />
                <div className="h-4 w-full bg-[#F8F9FA] rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-[#F8F9FA] rounded animate-pulse" />
              </div>
            </div>

            {/* Facts skeleton */}
            <div className="mb-8">
              <div className="h-6 w-40 bg-[#E9ECEF] rounded animate-pulse mb-3" />
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="flex justify-between py-2 border-b border-[#F8F9FA]">
                    <div className="h-4 w-24 bg-[#F8F9FA] rounded animate-pulse" />
                    <div className="h-4 w-16 bg-[#F8F9FA] rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Map skeleton */}
            <div className="mb-8">
              <div className="h-6 w-28 bg-[#E9ECEF] rounded animate-pulse mb-3" />
              <div className="h-64 bg-[#F8F9FA] rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Right column (35%) - Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white border-2 border-[#E9ECEF] rounded-xl p-6 shadow-lg">
              {/* Landlord */}
              <div className="flex items-center gap-4 pb-6 border-b border-[#E9ECEF] mb-6">
                <div className="w-14 h-14 rounded-full bg-[#E9ECEF] animate-pulse" />
                <div>
                  <div className="h-5 w-32 bg-[#E9ECEF] rounded animate-pulse mb-1" />
                  <div className="h-4 w-24 bg-[#E9ECEF] rounded animate-pulse" />
                </div>
              </div>

              {/* Buttons */}
              <div className="h-12 w-full bg-[#212529] rounded-lg animate-pulse mb-3" />
              <div className="h-12 w-full bg-[#F8F9FA] rounded-lg animate-pulse mb-6" />

              {/* Message form */}
              <div className="pt-6 border-t border-[#E9ECEF]">
                <div className="h-5 w-32 bg-[#E9ECEF] rounded animate-pulse mb-4" />
                <div className="h-28 w-full bg-[#F8F9FA] rounded-lg animate-pulse mb-3" />
                <div className="h-12 w-full bg-[#212529] rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
