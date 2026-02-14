import Link from 'next/link'
import Image from 'next/image'
import { Plus, LogOut, Search, Home, Heart, Key, ChevronDown, LayoutDashboard, Settings, Building2, Star, Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { MobileMenu } from './MobileMenu'
import { NotificationDropdown } from './NotificationDropdown'

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

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E9ECEF]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo.png"
              alt="Huts"
              width={32}
              height={32}
              priority
              className="h-8 w-8 object-contain"
            />
          </Link>

          {/* Center Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {user && isLandlord ? (
              <>
                <Link href="/dashboard/overview" className="px-3 py-1.5 text-sm text-[#6C757D] hover:text-[#212529] transition-colors">
                  Dashboard
                </Link>
                <Link href="/dashboard/my-properties" className="px-3 py-1.5 text-sm text-[#6C757D] hover:text-[#212529] transition-colors">
                  Properties
                </Link>
                <Link href="/dashboard/reviews" className="px-3 py-1.5 text-sm text-[#6C757D] hover:text-[#212529] transition-colors">
                  Reviews
                </Link>
              </>
            ) : (
              <>
                <Link href="/search" className="px-3 py-1.5 text-sm text-[#6C757D] hover:text-[#212529] transition-colors">
                  Browse
                </Link>
                <Link href="/search?type=rent" className="px-3 py-1.5 text-sm text-[#6C757D] hover:text-[#212529] transition-colors">
                  Rent
                </Link>
                <Link href="/search?type=sale" className="px-3 py-1.5 text-sm text-[#6C757D] hover:text-[#212529] transition-colors">
                  Buy
                </Link>
                <Link href="/areas" className="px-3 py-1.5 text-sm text-[#6C757D] hover:text-[#212529] transition-colors">
                  Areas
                </Link>
              </>
            )}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                {/* Search */}
                <Link href="/search" className="p-2 text-[#6C757D] hover:text-[#212529] transition-colors">
                  <Search size={18} />
                </Link>

                {/* Notifications */}
                <NotificationDropdown />

                {/* List Property - Landlords */}
                {isLandlord && (
                  <Link
                    href="/dashboard/new-property"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#212529] px-3 py-1.5 rounded-md hover:bg-black transition-colors"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                    New
                  </Link>
                )}

                {/* User Menu */}
                <div className="relative group ml-1">
                  <button className="flex items-center">
                    {userAvatar ? (
                      <Image
                        src={userAvatar}
                        alt=""
                        width={28}
                        height={28}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 bg-[#212529] rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">{userInitial}</span>
                      </div>
                    )}
                  </button>

                  {/* Dropdown */}
                  <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="bg-white rounded-lg shadow-lg border border-[#E9ECEF] py-1 min-w-[180px]">
                      <div className="px-3 py-2 border-b border-[#E9ECEF]">
                        <p className="text-sm font-medium text-[#212529] truncate">{userName}</p>
                        <p className="text-xs text-[#6C757D] truncate">{user.email}</p>
                      </div>
                      
                      <div className="py-1">
                        {isLandlord && (
                          <Link href="/search" className="block px-3 py-2 text-sm text-[#6C757D] hover:bg-[#F8F9FA] hover:text-[#212529]">
                            Browse
                          </Link>
                        )}
                        <Link href="/dashboard/saved" className="block px-3 py-2 text-sm text-[#6C757D] hover:bg-[#F8F9FA] hover:text-[#212529]">
                          Saved
                        </Link>
                        <Link href="/settings" className="block px-3 py-2 text-sm text-[#6C757D] hover:bg-[#F8F9FA] hover:text-[#212529]">
                          Settings
                        </Link>
                      </div>
                      
                      <div className="border-t border-[#E9ECEF] py-1">
                        <form action="/auth/signout" method="post">
                          <button type="submit" className="block w-full text-left px-3 py-2 text-sm text-[#6C757D] hover:bg-[#F8F9FA] hover:text-[#212529]">
                            Sign out
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/signup" className="text-sm text-[#6C757D] hover:text-[#212529] px-3 py-1.5 transition-colors">
                  Sign in
                </Link>
                <Link
                  href="/dashboard/new-property"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#212529] px-3 py-1.5 rounded-md hover:bg-black transition-colors"
                >
                  <Plus size={14} strokeWidth={2.5} />
                  List
                </Link>
              </>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-1">
            <Link href="/search" className="p-2 text-[#6C757D]">
              <Search size={20} />
            </Link>
            {user && (
              <Link href="/dashboard/saved" className="p-2 text-[#6C757D]">
                <Heart size={20} />
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
    </header>
  )
}
