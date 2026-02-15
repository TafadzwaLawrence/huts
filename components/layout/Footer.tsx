import Link from 'next/link'
import Image from 'next/image'
import { Mail } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#212529] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <Image
                src="/logo.png"
                alt="Huts"
                width={32}
                height={32}
                className="h-8 w-8 object-contain invert"
              />
              
            </div>
            <p className="text-sm text-[#ADB5BD] leading-relaxed">
              The simplest way to find your next rental. No clutter, no noise — just homes.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#ADB5BD] mb-4">Explore</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/search" className="text-[#ADB5BD] hover:text-white transition-colors">
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link href="/areas" className="text-[#ADB5BD] hover:text-white transition-colors">
                  Area Guides
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-[#ADB5BD] hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* For Landlords */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#ADB5BD] mb-4">Landlords</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/dashboard/new-property" className="text-[#ADB5BD] hover:text-white transition-colors">
                  Post a Property
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-[#ADB5BD] hover:text-white transition-colors">
                  It's Free
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-[#ADB5BD] hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#ADB5BD] mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="mailto:hello@huts.com" className="flex items-center gap-2 text-[#ADB5BD] hover:text-white transition-colors">
                  <Mail size={14} />
                  hello@huts.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#495057] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#ADB5BD]">
          <p>&copy; {currentYear} Huts. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
