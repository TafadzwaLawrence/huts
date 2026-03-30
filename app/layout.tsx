import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Suspense } from 'react'
import './globals.css'
import { LayoutChrome } from '@/components/layout/LayoutChrome'
import { Navbar } from '@/components/layout/Navbar'
import { NavbarSkeleton } from '@/components/layout/NavbarSkeleton'
import { Footer } from '@/components/layout/Footer'
import OrganizationStructuredData from '@/components/layout/OrganizationStructuredData'
import FloatingChatWidget from '@/components/chat/FloatingChatWidget'
import { Toaster } from 'sonner'
import { NProgressProvider } from '@/components/providers/NProgressProvider'
import ChunkLoadErrorHandler from '@/components/dashboard/ChunkLoadErrorHandler'

// Google Sans — variable font, covers all weights 100–900
const googleSans = localFont({
  src: [
    {
      path: '../public/fonts/GoogleSans-VariableFont_GRAD,opsz,wght.ttf',
      weight: '100 900',
      style: 'normal',
    },
    {
      path: '../public/fonts/GoogleSans-Italic-VariableFont_GRAD,opsz,wght.ttf',
      weight: '100 900',
      style: 'italic',
    },
  ],
  variable: '--font-sans',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.huts.co.zw'),
  title: {
    template: '%s | Huts',
    default: 'Huts — Find Your Perfect Home in Zimbabwe',
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
    title: 'Huts — Find Your Perfect Home in Zimbabwe',
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
    site: '@HutsZw',
    title: 'Huts — Find Your Perfect Home in Zimbabwe',
    description: 'Find apartments, houses, and rooms for rent or sale across Zimbabwe. Browse verified properties in Harare, Bulawayo, and beyond.',
    creator: '@HutsZw',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={googleSans.variable} suppressHydrationWarning>
      <head>
        <meta name="ahrefs-site-verification" content="7498c7033a95c6a6210a2599e55cb4938569e7e04c7d61c40b83cb24848a6797" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/w2csrywisj";
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "w2csrywisj");
            `,
          }}
        ></script>
        <script src="https://analytics.ahrefs.com/analytics.js" data-key="ZBeB92jKZFhBHomRF9l5KQ" async></script>
      </head>
      <body className={googleSans.className} suppressHydrationWarning>
        {/* JSON-LD Structured Data for Organization */}
        <OrganizationStructuredData />
        
        {/* Auto-reload on chunk load errors */}
        <ChunkLoadErrorHandler />
        
        <Suspense fallback={null}>
          <NProgressProvider>
            <LayoutChrome
              navbar={
                <Suspense fallback={<NavbarSkeleton />}>
                  <Navbar />
                </Suspense>
              }
              footer={<Footer />}
              chatWidget={<FloatingChatWidget />}
            >
              {children}
            </LayoutChrome>
            <Toaster position="top-center" />
          </NProgressProvider>
        </Suspense>
      </body>
    </html>
  )
}
