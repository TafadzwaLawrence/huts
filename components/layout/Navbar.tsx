import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { MobileMenu } from './MobileMenu'
import { NotificationDropdown } from './NotificationDropdown'
import { UserMenu } from './UserMenu'
import { ScrollHeader, NavLinks, MegaNav } from './NavbarClient'

// Zillow-style mega-nav configurations
const buyMenuItems = [
  { label: 'Homes for Sale', href: '/search?type=sale' },
  { label: 'New Listings', href: '/search?type=sale&sort=newest' },
  { label: 'Home Values', href: '/home-value' },
  { label: 'Area Guides', href: '/areas' },
]

const rentMenuItems = [
  { label: 'All Rentals', href: '/search?type=rent' },
  { label: 'Apartments', href: '/search?type=rent&propertyType=apartment' },
  { label: 'Houses', href: '/search?type=rent&propertyType=house' },
  { label: 'Student Housing', href: '/student-housing' },
]

const sellMenuItems = [
  { label: 'List Your Property', href: '/dashboard/new-property' },
  { label: 'My Listings', href: '/dashboard/my-properties' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Home Value', href: '/home-value' },
]

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

  const megaNavItems = [
    { label: 'Buy', items: buyMenuItems, activePatterns: ['type=sale'] },
    { label: 'Rent', items: rentMenuItems, activePatterns: ['type=rent', '/student'] },
    { label: 'Sell', items: sellMenuItems, activePatterns: ['/dashboard/new-property'] },
  ]

  const rightLinks = [
    { href: '/areas', label: 'Areas' },
    { href: '/help', label: 'Help' },
  ]

  return (
    <ScrollHeader>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 relative">
        {/* Header background image (Gustavo Fring) */}
        <div className="absolute inset-0 z-0 hidden md:block">
          <Image
            src="/pexels-gustavo-fring-7489107.jpg"
            alt="Header background"
            fill
            className="object-cover w-full h-full grayscale contrast-125 opacity-20 select-none pointer-events-none"
            priority
            sizes="100vw"
          />
        </div>
        <div className="flex items-center h-[60px] relative z-10">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-1 shrink-0">
            <Link href="/" className="flex items-center shrink-0 mr-2 group">
              <Image
                src="/logo.png"
                alt="Huts"
                width={44}
                height={44}
                priority
                className="h-9 w-9 object-contain transition-opacity group-hover:opacity-80"
              />
            </Link>

            <div className="hidden md:contents">
              {user && isLandlord ? (
                <NavLinks links={landlordLinks} />
              ) : (
                <MegaNav items={megaNavItems} />
              )}
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right: Secondary links + actions */}
          <div className="hidden md:flex items-center">
            {/* Secondary text links */}
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
              <div className="flex items-center">
                <Link
                  href="/auth/signup"
                  className="px-3 py-1.5 text-sm font-semibold text-[#212529] hover:underline underline-offset-4"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-3 py-1.5 text-sm font-semibold text-[#212529] hover:underline underline-offset-4"
                >
                  Join
                </Link>
              </div>
            )}
          </div>

          {/* Mobile right side */}
          <div className="md:hidden flex items-center gap-0.5 ml-auto">
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
