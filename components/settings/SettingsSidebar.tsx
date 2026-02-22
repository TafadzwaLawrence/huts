'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Shield, Bell, CreditCard, Settings } from 'lucide-react';

const navItems = [
  { href: '/settings/profile', label: 'Profile', icon: User, description: 'Your public info' },
  { href: '/settings/security', label: 'Security', icon: Shield, description: 'Password & 2FA' },
  { href: '/settings/notifications', label: 'Notifications', icon: Bell, description: 'Email preferences' },
  { href: '/settings/billing', label: 'Billing', icon: CreditCard, description: 'Plans & payments' },
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="lg:w-64 flex-shrink-0">
      <div className="bg-white border border-[#E9ECEF] rounded-2xl p-2 shadow-sm">
        <nav className="space-y-1">
          {navItems.map(({ href, label, icon: Icon, description }) => {
            const isActive = pathname === href;
            
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-[#212529] text-white shadow-md'
                    : 'text-[#495057] hover:bg-[#F8F9FA] hover:text-[#212529]'
                }`}
              >
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                  isActive ? 'bg-white/20' : 'bg-[#F8F9FA]'
                }`}>
                  <Icon size={18} className={isActive ? 'text-white' : 'text-[#495057]'} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block">{label}</span>
                  <span className={`text-xs ${isActive ? 'text-white/70' : 'text-[#ADB5BD]'}`}>
                    {description}
                  </span>
                </div>
{/* Active indicator removed - cleaner design */}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
