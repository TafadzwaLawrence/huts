import Link from 'next/link'
import Image from 'next/image'
import { Mail, MapPin, Phone, ArrowUpRight, Facebook, Instagram } from 'lucide-react'
import { ICON_SIZES } from '@/lib/constants'

const footerSections = [
  {
    title: 'Real Estate',
    links: [
      { label: 'Homes for Sale', href: '/search?type=sale' },
      { label: 'Rentals', href: '/search?type=rent' },
      { label: 'New Listings', href: '/search?sort=newest' },
      { label: 'Student Housing', href: '/student-housing' },
      { label: 'Area Guides', href: '/areas' },
    ],
  },
  {
    title: 'Professionals',
    links: [
      { label: 'Find an Agent', href: '/find-agent' },
      { label: 'Become an Agent', href: '/agents/signup' },
      // Temporarily disabled until pages are created:
      // { label: 'Agent Solutions', href: '/agent-solutions' },
      // { label: 'Agent Resources', href: '/resources' },
    ],
  },
  {
    title: 'Popular',
    links: [
      { label: 'Harare Homes', href: '/search?city=Harare' },
      { label: 'Bulawayo Homes', href: '/search?city=Bulawayo' },
      { label: 'Apartments for Rent', href: '/search?type=rent&propertyType=apartment' },
      { label: 'Houses for Sale', href: '/search?type=sale&propertyType=house' },
      { label: 'Browse All', href: '/search' },
    ],
  },
  {
    title: 'Landlords',
    links: [
      { label: 'List a Property', href: '/dashboard/new-property' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'My Properties', href: '/dashboard/my-properties' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Home Value', href: '/home-value' },
      { label: 'Rent vs Buy', href: '/rent-vs-buy' },
      { label: 'Help Center', href: '/help' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'About Huts', href: '/help' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
]

const seoLinks = [
  { label: 'Rentals in Zimbabwe', href: '/search?type=rent' },
  { label: 'Homes for Sale', href: '/search?type=sale' },
  { label: 'Harare Rentals', href: '/search?city=Harare&type=rent' },
  { label: 'Bulawayo Rentals', href: '/search?city=Bulawayo&type=rent' },
  { label: 'Houses for Sale Harare', href: '/search?city=Harare&type=sale' },
  { label: '1 Bed Apartments', href: '/search?beds=1&type=rent' },
  { label: '2 Bed Apartments', href: '/search?beds=2&type=rent' },
  { label: '3 Bed Houses', href: '/search?beds=3&type=rent' },
  { label: 'Student Housing', href: '/student-housing' },
  { label: 'Area Guides', href: '/areas' },
  { label: 'Townhouses', href: '/search?propertyType=townhouse' },
  { label: 'Condos', href: '/search?propertyType=condo' },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#212529] text-white relative overflow-hidden" role="contentinfo">
      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-white/[0.02] rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 pb-8 relative">
        
        {/* Top: Brand + Contact */}
        <div className="flex flex-col lg:flex-row justify-between gap-10 mb-14 md:mb-16">
          <div className="max-w-sm">
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
              Zimbabwe&apos;s property marketplace. Find homes for rent and sale—verified listings, real landlords, zero clutter.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <a
                href="mailto:hello@huts.co.zw"
                className="inline-flex items-center gap-2 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white/80 hover:text-white transition-all"
              >
                <Mail size={ICON_SIZES.sm} />
                hello@huts.co.zw
              </a>
              <a
                href="tel:+263786470999"
                className="inline-flex items-center gap-2 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white/80 hover:text-white transition-all"
              >
                <Phone size={ICON_SIZES.sm} />
                +263 78 647 0999
              </a>
            </div>
          </div>

          {/* Link Grid — 5 columns on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-6">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-[#ADB5BD] hover:text-white transition-colors inline-flex items-center gap-1 group"
                      >
                        {link.label}
                        <ArrowUpRight
                          size={ICON_SIZES.xs}
                          className="opacity-0 -translate-y-0.5 group-hover:opacity-60 group-hover:translate-y-0 transition-all"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.08]" />

        {/* SEO internal links */}
        <nav className="pt-7 pb-5" aria-label="Property search links">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Popular Searches</h3>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/25">
            {seoLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white/50 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Divider */}
        <div className="border-t border-white/[0.08]" />

        {/* Bottom bar */}
        <div className="pt-7 pb-2 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-white/30">
            <MapPin size={ICON_SIZES.xs} />
            <span>Harare, Zimbabwe</span>
            <span className="text-white/15 mx-1">&middot;</span>
            <span>&copy; {currentYear} Huts</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white/70 transition-colors" aria-label="Facebook">
                <Facebook size={ICON_SIZES.md} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white/70 transition-colors" aria-label="Instagram">
                <Instagram size={ICON_SIZES.md} />
              </a>
            </div>
            <span className="text-white/10">|</span>
            <Link href="/privacy" className="text-sm text-white/30 hover:text-white/70 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-white/30 hover:text-white/70 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
