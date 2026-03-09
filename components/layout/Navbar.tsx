import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MobileMenu } from './MobileMenu'
import { NotificationDropdown } from './NotificationDropdown'
import { UserMenu } from './UserMenu'
import { ScrollHeader, NavLinks, MegaNav } from './NavbarClient'

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('name, role, avatar_url')
      .eq('id', user.id)
      .single()
    profile = data
  }
  
  const isLandlord = profile?.role === 'landlord'
  const userName = profile?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0]
  const userInitial = userName?.charAt(0).toUpperCase() || 'U'
  const userAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url

  const landlordLinks = [
    { href: '/dashboard/overview', label: 'Dashboard' },
    { href: '/dashboard/my-properties', label: 'Properties' },
    { href: '/dashboard/reviews', label: 'Reviews' },
  ]

  const rightLinks = [
    { href: '/areas', label: 'Areas' },
    { href: '/help', label: 'Help' },
  ]

  return (
    <ScrollHeader>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="relative flex items-center h-[60px]">

          {/* Left: Nav links */}
          <div className="flex-1 hidden md:flex items-center">
            {user && isLandlord ? (
              <NavLinks links={landlordLinks} />
            ) : (
              <MegaNav />
            )}
          </div>

          {/* Center: Logo — absolutely centered so it never shifts */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Link href="/" className="flex items-center gap-2 group pointer-events-auto">
              <img
                src="/logo.svg"
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 object-contain transition-opacity group-hover:opacity-75"
              />
              <span className="text-[15px] font-black tracking-tight text-[#212529]">Huts</span>
            </Link>
          </div>

          {/* Right: Secondary links + actions */}
          <div className="flex-1 hidden md:flex items-center justify-end">
            {rightLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 text-sm font-semibold text-[#585858] hover:text-[#212529] transition-colors"
              >
                {label}
              </Link>
            ))}

            {isLandlord && user && (
              <Link
                href="/dashboard/new-property"
                className="px-3 py-1.5 text-sm font-semibold text-[#585858] hover:text-[#212529] transition-colors"
              >
                Manage Listings
              </Link>
            )}

            <div className="w-px h-5 bg-[#E5E7EB] mx-1" />

            {user ? (
              <div className="flex items-center gap-0.5">
                <NotificationDropdown />
                <UserMenu
                  userName={userName || 'User'}
                  userEmail={user.email || ''}
                  userAvatar={userAvatar}
                  userInitial={userInitial}
                  isLandlord={isLandlord}
                />
              </div>
            ) : (
              <Link
                href="/auth/signup"
                className="px-3 py-1.5 text-sm font-semibold text-[#212529] hover:underline underline-offset-4"
              >
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile: hamburger on the right, logo centers naturally */}
          <div className="flex-1 md:hidden" />
          <div className="md:hidden flex items-center gap-0.5">
            <MobileMenu
              isLoggedIn={!!user}
              userName={userName}
              userEmail={user?.email}
              userAvatar={userAvatar}
              userInitial={userInitial}
              isLandlord={isLandlord}
              unreadMessages={0}
            />
          </div>
        </div>
      </div>
    </ScrollHeader>
  )
}
