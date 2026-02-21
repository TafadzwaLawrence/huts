import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip auth middleware for SEO-critical routes — let crawlers through fast
  if (
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname.startsWith('/opengraph-image')
  ) {
    const response = NextResponse.next()
    response.headers.set('x-pathname', pathname)
    return response
  }

  // Update session for all other routes
  const response = await updateSession(request)
  
  // Add pathname header for layout detection
  response.headers.set('x-pathname', pathname)
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
