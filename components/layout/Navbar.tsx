import Link from 'next/link'
import Image from 'next/image'
import { Plus, Search, Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { MobileMenu } from './MobileMenu'
import { NotificationDropdown } from './NotificationDropdown'
import { UserMenu } from './UserMenu'
import { ScrollHeader, NavLinks } from './NavbarClient'
import { ICON_SIZES } from '@/lib/constants'

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

  const navLinks = user && isLandlord
    ? [
        { href: '/dashboard/overview', label: 'Dashboard' },
        { href: '/dashboard/my-properties', label: 'Properties' },
        { href: '/dashboard/reviews', label: 'Reviews' },
      ]
    : [
        { href: '/search', label: 'Browse' },
        { href: '/search?type=rent', label: 'Rent' },
        { href: '/search?type=sale', label: 'Buy' },
        { href: '/student-housing', label: 'Student' },
        { href: '/areas', label: 'Areas' },
      ]

  return (
    <ScrollHeader>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center group">
              <Image
                src="/logo.png"
                alt="Huts"
                width={44}
                height={44}
                priority
                className="h-10 w-10 object-contain transition-opacity group-hover:opacity-80"
              />
            </Link>
          </div>

          {/* Center Navigation - Desktop */}
          <div className="flex-1 flex justify-center mx-6">
            <NavLinks links={navLinks} />
          </div>

          {/* Right Actions - Desktop */}
          <div className="hidden md:flex items-center gap-1.5">
            {user ? (
              <>                <Link
                  href="/search"
                  className="p-2 rounded-lg text-[#495057] hover:text-[#212529] hover:bg-[#F8F9FA] transition-colors"
                  aria-label="Search properties"
                >
                  <Search size={ICON_SIZES.lg} />
                </Link>

                <NotificationDropdown />

                {isLandlord && (
                  <Link
                    href="/dashboard/new-property"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[#212529] ml-1 px-3.5 py-2 rounded-lg hover:bg-black transition-colors"
                  >
                    <Plus size={ICON_SIZES.md} strokeWidth={2.5} />
                    <span>New</span>
                  </Link>
                )}

                <div className="w-px h-6 bg-[#E9ECEF] mx-1.5" />

                <UserMenu
                  userName={userName || 'User'}
                  userEmail={user.email || ''}
                  userAvatar={userAvatar}
                  userInitial={userInitial}
                  isLandlord={isLandlord}
                />
              </>
            ) : (
              <>
                <Link
                  href="/auth/signup"
                  className="text-sm font-medium text-[#495057] px-4 py-2 rounded-lg hover:text-[#212529] hover:bg-[#F8F9FA] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/dashboard/new-property"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[#212529] px-4 py-2 rounded-lg hover:bg-black transition-colors"
                >
                  <Plus size={ICON_SIZES.md} strokeWidth={2.5} />
                  List Property
                </Link>
              </>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-0.5 ml-auto">
            <Link
              href="/search"
              className="p-2.5 text-[#495057] hover:text-[#212529] transition-colors"
              aria-label="Search"
            >
              <Search size={ICON_SIZES.lg} />
            </Link>
            {user && (
              <Link
                href="/dashboard/saved"
                className="p-2.5 text-[#495057] hover:text-[#212529] transition-colors"
                aria-label="Saved properties"
              >
                <Heart size={ICON_SIZES.lg} />
              </Link>
            )}
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
