export function NavbarSkeleton() {
  return (
    <header className="sticky top-0 z-50">
      {/* Top announcement bar skeleton */}
      <div className="bg-[#212529] text-center py-2 px-4">
        <div className="h-4 w-64 bg-white/20 rounded mx-auto animate-pulse" />
      </div>

      {/* Main navbar skeleton */}
      <nav className="bg-white border-b border-[#E9ECEF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[68px]">
            {/* Logo skeleton */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#E9ECEF] rounded-xl animate-pulse" />
              <div className="h-6 w-16 bg-[#E9ECEF] rounded animate-pulse" />
            </div>

            {/* Navigation links skeleton */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="h-4 w-16 bg-[#E9ECEF] rounded animate-pulse" />
              <div className="h-4 w-12 bg-[#E9ECEF] rounded animate-pulse" />
              <div className="h-4 w-20 bg-[#E9ECEF] rounded animate-pulse" />
            </div>

            {/* Right side skeleton */}
            <div className="flex items-center gap-4">
              <div className="h-10 w-28 bg-[#E9ECEF] rounded-lg animate-pulse hidden sm:block" />
              <div className="h-10 w-10 bg-[#E9ECEF] rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
