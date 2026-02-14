export function PropertyCardSkeleton() {
  return (
    <div className="property-card">
      <div className="skeleton-image" />
      <div className="property-card-content space-y-3">
        <div className="skeleton-title" />
        <div className="skeleton-text w-2/3" />
        <div className="flex gap-4">
          <div className="skeleton-text w-16" />
          <div className="skeleton-text w-16" />
          <div className="skeleton-text w-16" />
        </div>
      </div>
    </div>
  )
}
