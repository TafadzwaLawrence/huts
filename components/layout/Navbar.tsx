import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MobileMenu } from './MobileMenu'
import { NotificationDropdown } from './NotificationDropdown'
import { UserMenu } from './UserMenu'
import { ScrollHeader, NavLinks, MegaNav, AgentsDropdown } from './NavbarClient'

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
        <div className="flex items-center h-[60px] gap-2">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 mr-3 group">
            <img
              src="/logo.svg"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 object-contain transition-opacity group-hover:opacity-75"
            />
          </Link>

          {/* Nav links — immediately after logo */}
          <div className="hidden md:contents">
            {user && isLandlord ? (
              <NavLinks links={landlordLinks} />
            ) : (
              <MegaNav />
            )}
          </div>

          {/* Push right side to the edge */}
          <div className="flex-1" />

          {/* Right: utility links + auth — desktop only */}
          <div className="hidden md:flex items-center gap-1">
            <AgentsDropdown />
            {rightLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 text-sm text-[#585858] hover:text-[#212529] transition-colors"
              >
                {label}
              </Link>
            ))}

            {isLandlord && user && (
              <>
                <div className="w-px h-5 bg-[#E5E7EB] mx-1" />
                <Link
                  href="/dashboard/new-property"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-[#212529] border border-[#212529] rounded-lg hover:bg-[#212529] hover:text-white transition-colors"
                >
                  + List property
                </Link>
              </>
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
                className="ml-1 px-4 py-1.5 text-sm font-semibold bg-[#212529] text-white rounded-lg hover:bg-black transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile: hamburger */}
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
