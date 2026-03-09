export default function SecuritySettingsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-32 bg-[#E9ECEF] rounded mb-2" />
        <div className="h-4 w-56 bg-[#E9ECEF] rounded" />
      </div>

      {/* Change Password card skeleton */}
      <div className="bg-white border-2 border-[#E9ECEF] rounded-xl p-6">
        {/* Card header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-[#E9ECEF] shrink-0" />
          <div className="space-y-2">
            <div className="h-4 w-36 bg-[#E9ECEF] rounded" />
            <div className="h-3 w-52 bg-[#E9ECEF] rounded" />
          </div>
        </div>
        {/* 3 password inputs */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-4 w-32 bg-[#E9ECEF] rounded mb-2" />
              <div className="h-12 w-full bg-[#E9ECEF] rounded-xl" />
            </div>
          ))}
          <div className="h-12 w-full bg-[#E9ECEF] rounded-xl mt-2" />
        </div>
      </div>

      {/* Two-Factor Authentication card skeleton */}
      <div className="bg-white border-2 border-[#E9ECEF] rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#E9ECEF] shrink-0" />
            <div className="space-y-2">
              <div className="h-4 w-44 bg-[#E9ECEF] rounded" />
              <div className="h-3 w-40 bg-[#E9ECEF] rounded" />
            </div>
          </div>
          <div className="h-7 w-28 bg-[#E9ECEF] rounded-full" />
        </div>
      </div>

      {/* Active Sessions card skeleton */}
      <div className="bg-white border-2 border-[#E9ECEF] rounded-xl p-6">
        {/* Card header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-[#E9ECEF] shrink-0" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-[#E9ECEF] rounded" />
            <div className="h-3 w-48 bg-[#E9ECEF] rounded" />
          </div>
        </div>
        {/* Session row */}
        <div className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-xl">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full bg-[#E9ECEF]" />
            <div className="space-y-1.5">
              <div className="h-4 w-28 bg-[#E9ECEF] rounded" />
              <div className="h-3 w-36 bg-[#E9ECEF] rounded" />
            </div>
          </div>
          <div className="h-4 w-16 bg-[#E9ECEF] rounded" />
        </div>
        {/* Sign out button */}
        <div className="h-12 w-full bg-[#E9ECEF] rounded-xl mt-4" />
      </div>

      {/* Danger Zone card skeleton */}
      <div className="bg-white border-2 border-[#E9ECEF] rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-[#E9ECEF] shrink-0" />
          <div className="space-y-2">
            <div className="h-4 w-28 bg-[#E9ECEF] rounded" />
            <div className="h-3 w-52 bg-[#E9ECEF] rounded" />
          </div>
        </div>
        <div className="h-4 w-full bg-[#E9ECEF] rounded mb-2" />
        <div className="h-4 w-3/4 bg-[#E9ECEF] rounded mb-4" />
        <div className="h-12 w-40 bg-[#E9ECEF] rounded-xl" />
      </div>
    </div>
  )
}
