import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import { headers } from 'next/headers'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { NavbarSkeleton } from '@/components/layout/NavbarSkeleton'
import { Footer } from '@/components/layout/Footer'
import { BottomTabBar } from '@/components/layout/BottomTabBar'
import OrganizationStructuredData from '@/components/layout/OrganizationStructuredData'
import FloatingChatWidget from '@/components/chat/FloatingChatWidget'
import { Toaster } from 'sonner'
import { NProgressProvider } from '@/components/providers/NProgressProvider'
import { createClient } from '@/lib/supabase/server'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.huts.co.zw'),
  title: {
    template: '%s | Huts',
    default: 'Huts — Find Your Perfect Rental in Zimbabwe',
  },
  description: 'Find apartments, houses, and rooms for rent or sale across Zimbabwe. Browse verified properties in Harare, Bulawayo, and beyond. Your home is waiting.',
  keywords: [
    'Zimbabwe rentals',
    'properties for rent in Zimbabwe',
    'Harare apartments',
    'Bulawayo houses',
    'property rental Zimbabwe',
    'find accommodation Zimbabwe',
    'rent house Zimbabwe',
    'apartments for rent Harare',
    'houses for rent Harare',
    'rooms for rent Zimbabwe',
    'rental properties Zimbabwe',
    'Zimbabwe property listings',
    'rent property Harare',
    'homes for sale Zimbabwe',
    'buy property Zimbabwe',
    'Zimbabwe real estate',
    'properties for rental in zim',
    'accommodation in Zimbabwe',
  ],
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    siteName: 'Huts',
    locale: 'en_ZW',
    type: 'website',
    title: 'Huts — Find Your Perfect Rental in Zimbabwe',
    description: 'Find apartments, houses, and rooms for rent or sale across Zimbabwe. Browse verified properties in Harare, Bulawayo, and beyond. Your home is waiting.',
    url: 'https://www.huts.co.zw',
    images: [
      {
        url: 'https://www.huts.co.zw/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Huts - Zimbabwe\'s Property Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@huts',
    title: 'Huts — Find Your Perfect Rental in Zimbabwe',
    description: 'Find apartments, houses, and rooms for rent or sale across Zimbabwe. Browse verified properties in Harare, Bulawayo, and beyond.',
    creator: '@huts',
    images: ['https://www.huts.co.zw/opengraph-image'],
  },
  verification: {
    google: '07HgtmO-cprVsWu7EANqo69fkJRo85EndexJLMzznlQ',
  },
  alternates: {
    canonical: 'https://www.huts.co.zw',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if current route is admin route
  const headersList = headers()
  const pathname = headersList.get('x-pathname') || ''
  const isAdminRoute = pathname.startsWith('/admin')

  // Check auth for BottomTabBar
  let isLoggedIn = false
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    isLoggedIn = !!user
  } catch {
    // Ignore auth errors in layout
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {/* JSON-LD Structured Data for Organization */}
        <OrganizationStructuredData />
        
        <Suspense fallback={null}>
            <NProgressProvider>
              {!isAdminRoute && (
                <a href="#main-content" className="skip-link">
                  Skip to main content
                </a>
              )}
              {!isAdminRoute && (
                <Suspense fallback={<NavbarSkeleton />}>
                  <Navbar />
                </Suspense>
              )}
              <main id="main-content" className="min-h-screen pb-14 md:pb-0">
                {children}
              </main>
              {!isAdminRoute && <Footer />}
              {!isAdminRoute && <BottomTabBar isLoggedIn={isLoggedIn} />}
              {!isAdminRoute && <FloatingChatWidget />}
              <Toaster position="top-center" />
            </NProgressProvider>
          </Suspense>
      </body>
    </html>
  )
}
