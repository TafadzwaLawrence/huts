export function NavbarSkeleton() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E9ECEF]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="flex items-center h-[60px] gap-6">
          {/* Logo */}
          <div className="shrink-0">
            <div className="h-9 w-9 bg-[#F3F4F6] rounded-lg animate-pulse" />
          </div>

          {/* Left nav links */}
          <div className="hidden md:flex items-center gap-4">
            <div className="h-4 w-10 bg-[#F3F4F6] rounded animate-pulse" />
            <div className="h-4 w-10 bg-[#F3F4F6] rounded animate-pulse" />
            <div className="h-4 w-10 bg-[#F3F4F6] rounded animate-pulse" />
          </div>

          {/* Center search bar */}
          <div className="hidden md:block flex-1 max-w-md mx-auto">
            <div className="h-9 bg-[#F3F4F6] rounded-full animate-pulse" />
          </div>

          {/* Right side - Desktop */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 bg-[#F3F4F6] rounded-full animate-pulse" />
            <div className="h-8 w-8 bg-[#F3F4F6] rounded-full animate-pulse" />
            <div className="h-8 w-8 bg-[#F3F4F6] rounded-full animate-pulse" />
          </div>

          {/* Right side - Mobile */}
          <div className="flex md:hidden items-center gap-2 ml-auto">
            <div className="h-9 w-9 bg-[#F3F4F6] rounded-full animate-pulse" />
            <div className="h-9 w-9 bg-[#F3F4F6] rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </header>
  )
}
