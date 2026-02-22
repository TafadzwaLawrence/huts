'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Home, AlertTriangle } from 'lucide-react'

export default function PropertyError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Property page error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Property not available
        </h1>
        <p className="text-foreground mb-8">
          This property may have been removed or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-muted text-white font-medium rounded-lg hover:bg-muted transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-border text-foreground font-medium rounded-lg hover:bg-muted hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" />
            Browse Properties
          </Link>
        </div>
      </div>
    </div>
  )
}
