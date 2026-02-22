import Link from 'next/link'
import Image from 'next/image'
import { Mail, MapPin, Phone, ArrowUpRight } from 'lucide-react'
import { ICON_SIZES } from '@/lib/constants'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-foreground text-white relative overflow-hidden" role="contentinfo">
      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-white/[0.02] rounded-full blur-[120px]" />

      {/* Main footer */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 pb-8 relative">
        
        {/* Top: Brand + Newsletter */}
        <div className="flex flex-col lg:flex-row justify-between gap-10 mb-14 md:mb-16">
          <div className="max-w-md">
            <div className="flex items-center gap-2.5 mb-5">
              <Image
                src="/logo.png"
                alt="Huts"
                width={36}
                height={36}
                className="h-9 w-9 object-contain invert"
              />
              <span className="text-xl font-bold tracking-tight">Huts</span>
            </div>
            <p className="text-sm text-on-dark-muted leading-relaxed mb-6">
              The simplest way to find your next home in Zimbabwe. No clutter, no noise — just verified properties from real landlords.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="mailto:hello@huts.co.zw"
                className="inline-flex items-center gap-2 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white/80 hover:text-white transition-all"
              >
                <Mail size={ICON_SIZES.sm} />
                hello@huts.co.zw
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-14">
            {/* Explore */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-5">Explore</h3>
              <ul className="space-y-3.5">
                <li>
                  <Link href="/search?type=rent" className="text-sm text-on-dark-muted hover:text-white transition-colors inline-flex items-center gap-1 group">
                    Rentals
                    <ArrowUpRight size={ICON_SIZES.xs} className="opacity-0 -translate-y-0.5 group-hover:opacity-60 group-hover:translate-y-0 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link href="/search?type=sale" className="text-sm text-on-dark-muted hover:text-white transition-colors inline-flex items-center gap-1 group">
                    For Sale
                    <ArrowUpRight size={ICON_SIZES.xs} className="opacity-0 -translate-y-0.5 group-hover:opacity-60 group-hover:translate-y-0 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link href="/areas" className="text-sm text-on-dark-muted hover:text-white transition-colors inline-flex items-center gap-1 group">
                    Area Guides
                    <ArrowUpRight size={ICON_SIZES.xs} className="opacity-0 -translate-y-0.5 group-hover:opacity-60 group-hover:translate-y-0 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link href="/search" className="text-sm text-on-dark-muted hover:text-white transition-colors inline-flex items-center gap-1 group">
                    Browse All
                    <ArrowUpRight size={ICON_SIZES.xs} className="opacity-0 -translate-y-0.5 group-hover:opacity-60 group-hover:translate-y-0 transition-all" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Landlords */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-5">Landlords</h3>
              <ul className="space-y-3.5">
                <li>
                  <Link href="/dashboard/new-property" className="text-sm text-on-dark-muted hover:text-white transition-colors inline-flex items-center gap-1 group">
                    Post a Property
                    <ArrowUpRight size={ICON_SIZES.xs} className="opacity-0 -translate-y-0.5 group-hover:opacity-60 group-hover:translate-y-0 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-sm text-on-dark-muted hover:text-white transition-colors inline-flex items-center gap-1 group">
                    Pricing
                    <ArrowUpRight size={ICON_SIZES.xs} className="opacity-0 -translate-y-0.5 group-hover:opacity-60 group-hover:translate-y-0 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-sm text-on-dark-muted hover:text-white transition-colors inline-flex items-center gap-1 group">
                    Dashboard
                    <ArrowUpRight size={ICON_SIZES.xs} className="opacity-0 -translate-y-0.5 group-hover:opacity-60 group-hover:translate-y-0 transition-all" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support & Contact */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-5">Support</h3>
              <ul className="space-y-3.5">
                <li>
                  <Link href="/help" className="text-sm text-on-dark-muted hover:text-white transition-colors inline-flex items-center gap-1 group">
                    Help Center
                    <ArrowUpRight size={ICON_SIZES.xs} className="opacity-0 -translate-y-0.5 group-hover:opacity-60 group-hover:translate-y-0 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-on-dark-muted hover:text-white transition-colors inline-flex items-center gap-1 group">
                    Contact Us
                    <ArrowUpRight size={ICON_SIZES.xs} className="opacity-0 -translate-y-0.5 group-hover:opacity-60 group-hover:translate-y-0 transition-all" />
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@huts.co.zw" className="text-sm text-on-dark-muted hover:text-white transition-colors flex items-center gap-2">
                    <Mail size={ICON_SIZES.sm} className="shrink-0" />
                    support@huts.co.zw
                  </a>
                </li>
                <li>
                  <a href="tel:+263786470999" className="text-sm text-on-dark-muted hover:text-white transition-colors flex items-center gap-2">
                    <Phone size={ICON_SIZES.sm} className="shrink-0" />
                    +263 78 647 0999
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.08]" />

        {/* SEO internal links — crawlable by search engines */}
        <nav className="pt-7 pb-5" aria-label="Property search links">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Popular Searches</h3>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/25">
            <Link href="/search?type=rent" className="hover:text-white/50 transition-colors">Rentals in Zimbabwe</Link>
            <Link href="/search?type=sale" className="hover:text-white/50 transition-colors">Homes for Sale</Link>
            <Link href="/search?city=Harare&type=rent" className="hover:text-white/50 transition-colors">Harare Rentals</Link>
            <Link href="/search?city=Bulawayo&type=rent" className="hover:text-white/50 transition-colors">Bulawayo Rentals</Link>
            <Link href="/search?city=Harare&type=sale" className="hover:text-white/50 transition-colors">Houses for Sale Harare</Link>
            <Link href="/search?beds=1&type=rent" className="hover:text-white/50 transition-colors">1 Bed Apartments</Link>
            <Link href="/search?beds=2&type=rent" className="hover:text-white/50 transition-colors">2 Bed Apartments</Link>
            <Link href="/search?beds=3&type=rent" className="hover:text-white/50 transition-colors">3 Bed Houses</Link>
            <Link href="/student-housing" className="hover:text-white/50 transition-colors">Student Housing</Link>
            <Link href="/areas" className="hover:text-white/50 transition-colors">Area Guides</Link>
          </div>
        </nav>

        {/* Divider */}
        <div className="border-t border-white/[0.08]" />

        {/* Bottom bar */}
        <div className="pt-7 pb-2 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-white/30">
            <MapPin size={ICON_SIZES.xs} />
            <span>Harare, Zimbabwe</span>
            <span className="text-white/15 mx-1">·</span>
            <span>&copy; {currentYear} Huts</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy" className="text-white/30 hover:text-white/70 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-white/30 hover:text-white/70 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
