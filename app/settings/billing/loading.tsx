export default function BillingSettingsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-24 bg-[#E9ECEF] rounded mb-2" />
        <div className="h-4 w-64 bg-[#E9ECEF] rounded" />
      </div>

      {/* Current Plan card skeleton */}
      <div className="bg-white rounded-xl border-2 border-[#E9ECEF] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-[#E9ECEF] shrink-0" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-28 bg-[#E9ECEF] rounded" />
                <div className="h-5 w-16 bg-[#E9ECEF] rounded-full" />
              </div>
              <div className="h-3 w-48 bg-[#E9ECEF] rounded" />
            </div>
          </div>
          <div className="text-right space-y-1.5">
            <div className="h-7 w-12 bg-[#E9ECEF] rounded ml-auto" />
            <div className="h-3 w-20 bg-[#E9ECEF] rounded" />
          </div>
        </div>
      </div>

      {/* Billing cycle toggle skeleton — centered */}
      <div className="flex items-center justify-center gap-4">
        <div className="h-4 w-16 bg-[#E9ECEF] rounded" />
        <div className="h-6 w-11 rounded-full bg-[#E9ECEF]" />
        <div className="h-4 w-20 bg-[#E9ECEF] rounded" />
      </div>

      {/* Plans grid skeleton — 3 cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border-2 border-[#E9ECEF] p-6">
            {/* Icon + name row */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-[#E9ECEF] shrink-0" />
              <div className="space-y-1.5">
                <div className="h-4 w-24 bg-[#E9ECEF] rounded" />
                <div className="h-3 w-32 bg-[#E9ECEF] rounded" />
              </div>
            </div>
            {/* Price */}
            <div className="h-9 w-20 bg-[#E9ECEF] rounded mb-6" />
            {/* Feature rows */}
            <div className="space-y-3 mb-6">
              {Array.from({ length: i === 3 ? 6 : i === 2 ? 6 : 4 }).map((_, j) => (
                <div key={j} className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-[#E9ECEF] shrink-0" />
                  <div className="h-3 bg-[#E9ECEF] rounded" style={{ width: `${60 + (j % 3) * 12}%` }} />
                </div>
              ))}
            </div>
            {/* Button */}
            <div className="h-12 w-full bg-[#E9ECEF] rounded-xl" />
          </div>
        ))}
      </div>

      {/* Payment Method card skeleton */}
      <div className="bg-white rounded-xl border-2 border-[#E9ECEF] p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-[#E9ECEF] shrink-0" />
          <div className="space-y-2">
            <div className="h-4 w-36 bg-[#E9ECEF] rounded" />
            <div className="h-3 w-44 bg-[#E9ECEF] rounded" />
          </div>
        </div>
        {/* Info row */}
        <div className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-xl">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded bg-[#E9ECEF]" />
            <div className="h-4 w-44 bg-[#E9ECEF] rounded" />
          </div>
          <div className="h-4 w-16 bg-[#E9ECEF] rounded" />
        </div>
      </div>

      {/* Billing History card skeleton */}
      <div className="bg-white rounded-xl border-2 border-[#E9ECEF] p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-[#E9ECEF] shrink-0" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-[#E9ECEF] rounded" />
            <div className="h-3 w-44 bg-[#E9ECEF] rounded" />
          </div>
        </div>
        {/* Centered empty state */}
        <div className="flex flex-col items-center py-8 gap-3">
          <div className="h-12 w-12 rounded bg-[#E9ECEF]" />
          <div className="h-4 w-36 bg-[#E9ECEF] rounded" />
          <div className="h-3 w-48 bg-[#E9ECEF] rounded" />
        </div>
      </div>
    </div>
  )
}
