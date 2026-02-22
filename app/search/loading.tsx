export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-muted">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-12 bg-muted rounded-lg animate-pulse" />
            <div className="h-12 w-24 bg-muted rounded-lg animate-pulse" />
            <div className="h-12 w-24 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-48 bg-muted rounded animate-pulse" />
          <div className="h-10 w-32 bg-muted rounded-lg animate-pulse" />
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden border border-border">
              {/* Image Skeleton */}
              <div className="h-48 bg-muted animate-pulse" />
              
              {/* Content Skeleton */}
              <div className="p-4">
                <div className="h-6 w-3/4 bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 w-1/2 bg-muted rounded animate-pulse mb-4" />
                
                <div className="flex gap-4 pt-3 border-t border-border">
                  <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
