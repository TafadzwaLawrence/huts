export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero skeleton */}
      <div className="h-[60vh] bg-gradient-to-b from-white to-foreground animate-pulse">
        <div className="max-w-6xl mx-auto px-4 pt-32">
          <div className="h-12 w-96 bg-muted rounded-lg mx-auto mb-4" />
          <div className="h-6 w-64 bg-muted rounded-lg mx-auto mb-8" />
          <div className="h-14 w-full max-w-2xl bg-muted rounded-xl mx-auto" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="h-8 w-48 bg-muted rounded-lg mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border overflow-hidden">
              <div className="h-48 bg-muted animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-6 w-24 bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-2/3 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
