import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { NavbarSkeleton } from '@/components/layout/NavbarSkeleton'
import { Footer } from '@/components/layout/Footer'
import FloatingChatWidget from '@/components/chat/FloatingChatWidget'
import { Toaster } from 'sonner'
// TODO: Re-enable when AI budget available
// import { HashbrownClientProvider } from '@/components/providers/HashbrownProvider'
import { NProgressProvider } from '@/components/providers/NProgressProvider'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
})

export const metadata: Metadata = {
  title: 'Huts - Find Your Perfect Rental',
  description: 'Discover your ideal rental property. Browse apartments, houses, and more in your area.',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {/* HashbrownClientProvider - TODO: Re-enable when AI budget available */}
          <Suspense fallback={null}>
            <NProgressProvider>
              <a href="#main-content" className="skip-link">
                Skip to main content
              </a>
              <Suspense fallback={<NavbarSkeleton />}>
                <Navbar />
              </Suspense>
              <main id="main-content" className="min-h-screen">
                {children}
              </main>
              <Footer />
              <FloatingChatWidget />
              <Toaster position="top-center" />
            </NProgressProvider>
          </Suspense>
        {/* End HashbrownClientProvider */}
      </body>
    </html>
  )
}
