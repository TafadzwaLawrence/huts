export function NavbarSkeleton() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-[0_1px_0_#e5e7eb]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="flex items-center h-[60px]">
          {/* Logo */}
          <div className="shrink-0 mr-2">
            <div className="h-9 w-9 bg-[#F3F4F6] rounded-lg animate-pulse" />
          </div>

          {/* Left nav links */}
          <div className="hidden md:flex items-center gap-1">
            <div className="h-4 w-8 bg-[#F3F4F6] rounded animate-pulse" />
            <div className="h-4 w-10 bg-[#F3F4F6] rounded animate-pulse" />
            <div className="h-4 w-8 bg-[#F3F4F6] rounded animate-pulse" />
          </div>

          <div className="flex-1" />

          {/* Right side - Desktop */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <div className="h-4 w-12 bg-[#F3F4F6] rounded animate-pulse" />
            <div className="h-4 w-10 bg-[#F3F4F6] rounded animate-pulse" />
            <div className="w-px h-5 bg-[#E5E7EB]" />
            <div className="h-8 w-8 bg-[#F3F4F6] rounded-full animate-pulse" />
          </div>

          {/* Right side - Mobile */}
          <div className="flex md:hidden items-center ml-auto">
            <div className="h-9 w-9 bg-[#F3F4F6] rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </header>
  )
}
