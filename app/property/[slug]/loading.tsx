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

      {/* Content Skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Title Skeleton */}
            <div className="mb-6">
              <div className="h-8 w-3/4 bg-[#E9ECEF] rounded animate-pulse mb-2" />
              <div className="h-5 w-1/2 bg-[#E9ECEF] rounded animate-pulse" />
            </div>

            {/* Badges Skeleton */}
            <div className="flex gap-2 mb-6">
              <div className="h-8 w-24 bg-[#E9ECEF] rounded-full animate-pulse" />
              <div className="h-8 w-20 bg-[#E9ECEF] rounded-full animate-pulse" />
            </div>

            {/* Key Details Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[#F8F9FA] rounded-xl mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center">
                  <div className="w-8 h-8 bg-[#E9ECEF] rounded mx-auto mb-2 animate-pulse" />
                  <div className="h-6 w-12 bg-[#E9ECEF] rounded mx-auto mb-1 animate-pulse" />
                  <div className="h-4 w-16 bg-[#E9ECEF] rounded mx-auto animate-pulse" />
                </div>
              ))}
            </div>

            {/* Description Skeleton */}
            <div className="mb-8">
              <div className="h-6 w-48 bg-[#E9ECEF] rounded animate-pulse mb-4" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-[#E9ECEF] rounded animate-pulse" />
                <div className="h-4 w-full bg-[#E9ECEF] rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-[#E9ECEF] rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-[#E9ECEF] rounded-xl p-6 shadow-lg">
              {/* Landlord Skeleton */}
              <div className="flex items-center gap-4 pb-6 border-b border-[#E9ECEF] mb-6">
                <div className="w-14 h-14 rounded-full bg-[#E9ECEF] animate-pulse" />
                <div>
                  <div className="h-5 w-32 bg-[#E9ECEF] rounded animate-pulse mb-1" />
                  <div className="h-4 w-24 bg-[#E9ECEF] rounded animate-pulse" />
                </div>
              </div>

              {/* Button Skeletons */}
              <div className="h-12 w-full bg-[#E9ECEF] rounded-lg animate-pulse mb-3" />
              <div className="h-12 w-full bg-[#E9ECEF] rounded-lg animate-pulse mb-6" />

              {/* Form Skeleton */}
              <div className="pt-6 border-t border-[#E9ECEF]">
                <div className="h-5 w-32 bg-[#E9ECEF] rounded animate-pulse mb-4" />
                <div className="h-32 w-full bg-[#E9ECEF] rounded-lg animate-pulse mb-3" />
                <div className="h-12 w-full bg-[#E9ECEF] rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
