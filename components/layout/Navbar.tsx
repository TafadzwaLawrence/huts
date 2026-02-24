import Link from 'next/link'
import Image from 'next/image'
import { Plus, Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { MobileMenu } from './MobileMenu'
import { NotificationDropdown } from './NotificationDropdown'
import { UserMenu } from './UserMenu'
import { ScrollHeader, NavLinks, MegaNav } from './NavbarClient'
import { NavbarSearch } from './NavbarSearch'
import { ICON_SIZES } from '@/lib/constants'

// Zillow-style mega-nav configurations
const buyMenuSections = [
  {
    items: [
      { label: 'Search Homes for Sale', href: '/search?type=sale', description: 'Browse all homes for sale' },
      { label: 'New Listings', href: '/search?type=sale&sort=newest', description: 'See just-listed properties' },
      { label: 'Price Drops', href: '/search?type=sale&sort=price_asc', description: 'Properties with recent cuts' },
      { label: 'Home Value', href: '/home-value', description: 'Estimate your home\'s worth' },
    ]
  },
  {
    title: 'Resources',
    items: [
      { label: 'Mortgage Calculator', href: '/rent-vs-buy', description: 'Calculate monthly payments' },
      { label: 'Area Guides', href: '/areas', description: 'Explore neighborhoods' },
      { label: 'Buying Guide', href: '/help', description: 'Tips for first-time buyers' },
    ]
  }
]

const rentMenuSections = [
  {
    items: [
      { label: 'Search Rentals', href: '/search?type=rent', description: 'Browse all rentals' },
      { label: 'Apartments', href: '/search?type=rent&propertyType=apartment', description: 'Find apartments for rent' },
      { label: 'Houses', href: '/search?type=rent&propertyType=house', description: 'Find houses for rent' },
      { label: 'Student Housing', href: '/student-housing', description: 'Accommodation near universities' },
    ]
  },
  {
    title: 'Popular Cities',
    items: [
      { label: 'Harare Rentals', href: '/search?type=rent&city=Harare' },
      { label: 'Bulawayo Rentals', href: '/search?type=rent&city=Bulawayo' },
      { label: 'All Areas', href: '/areas' },
    ]
  }
]

const sellMenuSections = [
  {
    items: [
      { label: 'List Your Property', href: '/dashboard/new-property', description: 'Post a listing for free' },
      { label: 'My Listings', href: '/dashboard/my-properties', description: 'Manage your properties' },
      { label: 'Pricing', href: '/pricing', description: "It's 100% free" },
    ]
  },
  {
    title: 'Tools',
    items: [
      { label: 'Home Value', href: '/home-value', description: 'See what your home is worth' },
      { label: 'Analytics', href: '/dashboard/overview', description: 'Track listing performance' },
    ]
  }
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

  // Landlord sees direct nav links (no dropdowns needed for dashboard)
  const landlordLinks = [
    { href: '/dashboard/overview', label: 'Dashboard' },
    { href: '/dashboard/my-properties', label: 'Properties' },
    { href: '/dashboard/reviews', label: 'Reviews' },
  ]

  // Public/renter sees Zillow-style mega-nav
  const megaNavItems = [
    {
      label: 'Buy',
      sections: buyMenuSections,
      activePatterns: ['type=sale'],
    },
    {
      label: 'Rent',
      sections: rentMenuSections,
      activePatterns: ['type=rent', '/student'],
    },
    {
      label: 'Sell',
      sections: sellMenuSections,
      activePatterns: ['/dashboard/new-property'],
    },
  ]

  return (
    <ScrollHeader>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="flex items-center h-[60px] gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 group">
            <Image
              src="/logo.png"
              alt="Huts"
              width={44}
              height={44}
              priority
              className="h-9 w-9 object-contain transition-opacity group-hover:opacity-80"
            />
          </Link>

          {/* Nav Links — left-aligned, Zillow style */}
          <div className="hidden md:block">
            {user && isLandlord ? (
              <NavLinks links={landlordLinks} />
            ) : (
              <MegaNav items={megaNavItems} />
            )}
          </div>

          {/* Search Bar — center fill */}
          <div className="hidden md:block flex-1 max-w-md mx-auto">
            <NavbarSearch />
          </div>

          {/* Right Actions — Desktop */}
          <div className="hidden md:flex items-center gap-1 shrink-0">
            {user ? (
              <>
                <Link
                  href="/dashboard/saved"
                  className="p-2 rounded-full text-[#6B7280] hover:text-[#212529] hover:bg-[#F8F9FA] transition-colors"
                  aria-label="Saved homes"
                >
                  <Heart size={ICON_SIZES.lg} />
                </Link>

                <NotificationDropdown />

                {isLandlord && (
                  <Link
                    href="/dashboard/new-property"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[#212529] ml-2 px-4 py-2 rounded-full hover:bg-black transition-colors"
                  >
                    <Plus size={ICON_SIZES.md} strokeWidth={2.5} />
                    <span>List</span>
                  </Link>
                )}

                <div className="w-px h-5 bg-[#E9ECEF] mx-2" />

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
                  className="text-sm font-semibold text-[#212529] px-3 py-2 hover:underline underline-offset-4 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/dashboard/new-property"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[#212529] px-4 py-2 rounded-full hover:bg-black transition-colors"
                >
                  <Plus size={ICON_SIZES.md} strokeWidth={2.5} />
                  List Property
                </Link>
              </>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-1 ml-auto">
            {user && (
              <Link
                href="/dashboard/saved"
                className="p-2.5 text-[#6B7280] hover:text-[#212529] transition-colors"
                aria-label="Saved"
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
