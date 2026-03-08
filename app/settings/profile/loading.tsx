export default function ProfileSettingsLoading() {
  return (
    <div className="max-w-2xl space-y-6 animate-pulse">
      {/* Profile Header skeleton */}
      <div className="bg-white border border-[#E9ECEF] rounded-lg p-6">
        <div className="flex items-start gap-5">
          <div className="h-24 w-24 rounded-full bg-[#E9ECEF] shrink-0" />
          <div className="flex-1 space-y-3 pt-1">
            <div className="h-5 w-40 bg-[#E9ECEF] rounded" />
            <div className="h-4 w-56 bg-[#E9ECEF] rounded" />
            <div className="flex gap-3 mt-3">
              <div className="h-6 w-20 bg-[#E9ECEF] rounded-full" />
              <div className="h-6 w-24 bg-[#E9ECEF] rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Account Type skeleton */}
      <div className="bg-white border border-[#E9ECEF] rounded-lg p-6">
        <div className="h-5 w-32 bg-[#E9ECEF] rounded mb-1" />
        <div className="h-4 w-48 bg-[#E9ECEF] rounded mb-6" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 bg-[#E9ECEF] rounded-lg" />
          <div className="h-32 bg-[#E9ECEF] rounded-lg" />
        </div>
      </div>

      {/* Personal Information skeleton */}
      <div className="bg-white border border-[#E9ECEF] rounded-lg p-6">
        <div className="h-5 w-44 bg-[#E9ECEF] rounded mb-1" />
        <div className="h-4 w-40 bg-[#E9ECEF] rounded mb-6" />
        <div className="space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-4 w-24 bg-[#E9ECEF] rounded mb-2" />
              <div className="h-10 w-full bg-[#E9ECEF] rounded-lg" />
            </div>
          ))}
          <div>
            <div className="h-4 w-10 bg-[#E9ECEF] rounded mb-2" />
            <div className="h-24 w-full bg-[#E9ECEF] rounded-lg" />
          </div>
        </div>
      </div>

      {/* Submit area skeleton */}
      <div className="flex justify-end gap-3 pt-2">
        <div className="h-10 w-20 bg-[#E9ECEF] rounded-lg" />
        <div className="h-10 w-32 bg-[#E9ECEF] rounded-lg" />
      </div>
    </div>
  )
}
