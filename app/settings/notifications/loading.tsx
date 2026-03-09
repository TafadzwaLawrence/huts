// A single toggle row skeleton: icon + 2 text lines + toggle pill
function ToggleRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 rounded bg-[#E9ECEF] shrink-0" />
        <div className="space-y-1.5">
          <div className="h-4 w-32 bg-[#E9ECEF] rounded" />
          <div className="h-3 w-48 bg-[#E9ECEF] rounded" />
        </div>
      </div>
      <div className="h-6 w-11 rounded-full bg-[#E9ECEF] shrink-0" />
    </div>
  )
}

// A card with a header row + N toggle rows
function NotificationCardSkeleton({ rows }: { rows: number }) {
  return (
    <div className="bg-white rounded-xl border-2 border-[#E9ECEF] overflow-hidden">
      {/* Card header */}
      <div className="p-6 border-b border-[#E9ECEF] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#E9ECEF] shrink-0" />
          <div className="space-y-2">
            <div className="h-4 w-40 bg-[#E9ECEF] rounded" />
            <div className="h-3 w-48 bg-[#E9ECEF] rounded" />
          </div>
        </div>
        <div className="h-4 w-16 bg-[#E9ECEF] rounded" />
      </div>
      {/* Toggle rows */}
      <div className="divide-y divide-[#E9ECEF]">
        {Array.from({ length: rows }).map((_, i) => (
          <ToggleRowSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export default function NotificationsSettingsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-40 bg-[#E9ECEF] rounded mb-2" />
        <div className="h-4 w-56 bg-[#E9ECEF] rounded" />
      </div>

      {/* Email Notifications — 6 toggles */}
      <NotificationCardSkeleton rows={6} />

      {/* Push Notifications — 4 toggles */}
      <NotificationCardSkeleton rows={4} />

      {/* In-App Notifications — 4 toggles */}
      <NotificationCardSkeleton rows={4} />

      {/* Quiet Hours card skeleton */}
      <div className="bg-white rounded-xl border-2 border-[#E9ECEF] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#E9ECEF] shrink-0" />
            <div className="space-y-2">
              <div className="h-4 w-28 bg-[#E9ECEF] rounded" />
              <div className="h-3 w-52 bg-[#E9ECEF] rounded" />
            </div>
          </div>
          <div className="h-7 w-28 bg-[#E9ECEF] rounded-full" />
        </div>
      </div>
    </div>
  )
}
