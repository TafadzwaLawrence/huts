export default function ProfileSettingsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Profile Header skeleton */}
      <div className="bg-white border-2 border-[#E9ECEF] rounded-xl p-6">
        <div className="flex items-start gap-6">
          <div className="h-24 w-24 rounded-full bg-[#E9ECEF] shrink-0" />
          <div className="flex-1 space-y-3 pt-1">
            <div className="h-5 w-40 bg-[#E9ECEF] rounded" />
            <div className="h-4 w-56 bg-[#E9ECEF] rounded" />
            <div className="flex gap-3 mt-3">
              <div className="h-6 w-20 bg-[#E9ECEF] rounded-full" />
              <div className="h-6 w-28 bg-[#E9ECEF] rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Account Type skeleton */}
      <div className="bg-white border-2 border-[#E9ECEF] rounded-xl p-6">
        <div className="h-5 w-32 bg-[#E9ECEF] rounded mb-1" />
        <div className="h-4 w-48 bg-[#E9ECEF] rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 bg-[#E9ECEF] rounded-xl" />
          <div className="h-32 bg-[#E9ECEF] rounded-xl" />
        </div>
      </div>

      {/* Personal Information skeleton */}
      <div className="bg-white border-2 border-[#E9ECEF] rounded-xl p-6">
        <div className="h-5 w-44 bg-[#E9ECEF] rounded mb-1" />
        <div className="h-4 w-40 bg-[#E9ECEF] rounded mb-6" />
        <div className="space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-4 w-24 bg-[#E9ECEF] rounded mb-2" />
              <div className="h-12 w-full bg-[#E9ECEF] rounded-xl" />
            </div>
          ))}
          <div>
            <div className="h-4 w-10 bg-[#E9ECEF] rounded mb-2" />
            <div className="h-28 w-full bg-[#E9ECEF] rounded-xl" />
          </div>
        </div>
      </div>

      {/* Submit area skeleton */}
      <div className="bg-white border-2 border-[#E9ECEF] rounded-xl p-6 flex justify-end gap-3">
        <div className="h-11 w-24 bg-[#E9ECEF] rounded-xl" />
        <div className="h-11 w-36 bg-[#E9ECEF] rounded-xl" />
      </div>
    </div>
  )
}
