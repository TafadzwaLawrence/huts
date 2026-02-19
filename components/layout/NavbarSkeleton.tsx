export function NavbarSkeleton() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E9ECEF]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo */}
          <div className="shrink-0">
            <div className="h-10 w-10 bg-[#F8F9FA] rounded-xl animate-pulse" />
          </div>

          {/* Center nav links */}
          <div className="flex-1 hidden md:flex items-center justify-center gap-2">
            <div className="h-4 w-14 bg-[#F8F9FA] rounded animate-pulse" />
            <div className="h-4 w-10 bg-[#F8F9FA] rounded animate-pulse" />
            <div className="h-4 w-10 bg-[#F8F9FA] rounded animate-pulse" />
            <div className="h-4 w-16 bg-[#F8F9FA] rounded animate-pulse" />
            <div className="h-4 w-12 bg-[#F8F9FA] rounded animate-pulse" />
          </div>

          {/* Right side - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <div className="h-8 w-8 bg-[#F8F9FA] rounded-lg animate-pulse" />
            <div className="h-8 w-8 bg-[#F8F9FA] rounded-lg animate-pulse" />
            <div className="h-8 w-8 bg-[#F8F9FA] rounded-full animate-pulse" />
          </div>

          {/* Right side - Mobile */}
          <div className="flex md:hidden items-center gap-2 ml-auto">
            <div className="h-9 w-9 bg-[#F8F9FA] rounded-lg animate-pulse" />
            <div className="h-9 w-9 bg-[#F8F9FA] rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </header>
  )
}
