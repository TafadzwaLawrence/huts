import Link from 'next/link'
import Image from 'next/image'
import { Mail, MapPin, Phone, ArrowUpRight } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#212529] text-white relative overflow-hidden">
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
            <p className="text-sm text-[#ADB5BD] leading-relaxed mb-6">
              The simplest way to find your next home in Zimbabwe. No clutter, no noise — just verified properties from real landlords.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="mailto:hello@huts.co.zw"
                className="inline-flex items-center gap-2 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white/80 hover:text-white transition-all"
              >
                <Mail size={15} />
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
                  <Link href="/search?type=rent" className="text-sm text-[#ADB5BD] hover:text-white transition-colors inline-flex items-center gap-1 group">
                    Rentals
                    <ArrowUpRight size={13} className="opacity-0 -translate-y-0.5 group-hover:opacity-60 group-hover:translate-y-0 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link href="/search?type=sale" className="text-sm text-[#ADB5BD] hover:text-white transition-colors inline-flex items-center gap-1 group">
                    For Sale
                    <ArrowUpRight size={13} className="opacity-0 -translate-y-0.5 group-hover:opacity-60 group-hover:translate-y-0 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link href="/areas" className="text-sm text-[#ADB5BD] hover:text-white transition-colors inline-flex items-center gap-1 group">
                    Area Guides
                    <ArrowUpRight size={13} className="opacity-0 -translate-y-0.5 group-hover:opacity-60 group-hover:translate-y-0 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link href="/search" className="text-sm text-[#ADB5BD] hover:text-white transition-colors inline-flex items-center gap-1 group">
                    Browse All
                    <ArrowUpRight size={13} className="opacity-0 -translate-y-0.5 group-hover:opacity-60 group-hover:translate-y-0 transition-all" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Landlords */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-5">Landlords</h3>
              <ul className="space-y-3.5">
                <li>
                  <Link href="/dashboard/new-property" className="text-sm text-[#ADB5BD] hover:text-white transition-colors inline-flex items-center gap-1 group">
                    Post a Property
                    <ArrowUpRight size={13} className="opacity-0 -translate-y-0.5 group-hover:opacity-60 group-hover:translate-y-0 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-sm text-[#ADB5BD] hover:text-white transition-colors inline-flex items-center gap-1 group">
                    Pricing
                    <ArrowUpRight size={13} className="opacity-0 -translate-y-0.5 group-hover:opacity-60 group-hover:translate-y-0 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-sm text-[#ADB5BD] hover:text-white transition-colors inline-flex items-center gap-1 group">
                    Dashboard
                    <ArrowUpRight size={13} className="opacity-0 -translate-y-0.5 group-hover:opacity-60 group-hover:translate-y-0 transition-all" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support & Contact */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-5">Support</h3>
              <ul className="space-y-3.5">
                <li>
                  <Link href="/help" className="text-sm text-[#ADB5BD] hover:text-white transition-colors inline-flex items-center gap-1 group">
                    Help Center
                    <ArrowUpRight size={13} className="opacity-0 -translate-y-0.5 group-hover:opacity-60 group-hover:translate-y-0 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-[#ADB5BD] hover:text-white transition-colors inline-flex items-center gap-1 group">
                    Contact Us
                    <ArrowUpRight size={13} className="opacity-0 -translate-y-0.5 group-hover:opacity-60 group-hover:translate-y-0 transition-all" />
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@huts.co.zw" className="text-sm text-[#ADB5BD] hover:text-white transition-colors flex items-center gap-2">
                    <Mail size={14} className="shrink-0" />
                    support@huts.co.zw
                  </a>
                </li>
                <li>
                  <a href="tel:+263780000000" className="text-sm text-[#ADB5BD] hover:text-white transition-colors flex items-center gap-2">
                    <Phone size={14} className="shrink-0" />
                    +263 78 000 0000
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.08]" />

        {/* Bottom bar */}
        <div className="pt-7 pb-2 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-white/30">
            <MapPin size={13} />
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
