import type { Metadata } from 'next'
import Link from 'next/link'
import { Home, Search, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist.',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl font-bold text-[#E9ECEF] mb-4">404</div>
        <h1 className="text-2xl font-bold text-[#212529] mb-2">
          Page not found
        </h1>
        <p className="text-[#495057] mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#212529] text-white font-medium rounded-lg hover:bg-[#495057] transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#212529] text-[#212529] font-medium rounded-lg hover:bg-[#212529] hover:text-white transition-colors"
          >
            <Search className="w-4 h-4" />
            Browse Properties
          </Link>
        </div>
      </div>
    </div>
  )
}
