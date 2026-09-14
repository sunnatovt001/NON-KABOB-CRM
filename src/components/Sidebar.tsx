'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Store,
  UtensilsCrossed,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Buyurtmalar',
    href: '/orders',
    icon: ShoppingBag,
  },
  {
    label: 'Mijozlar',
    href: '/customers',
    icon: Users,
  },
  {
    label: 'Filiallar & Menyu',
    href: '/branches',
    icon: Store,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#111111] border-r border-[#222222] flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-[#222222]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5A623] to-[#D4891A] flex items-center justify-center shadow-lg shadow-[#F5A623]/20">
            <UtensilsCrossed className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm leading-none">NON-KABOB</h1>
            <p className="text-[#F5A623] text-xs font-medium mt-0.5">CRM Tizimi</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-[#6B7280] text-xs font-semibold uppercase tracking-wider px-3 mb-3">
          Asosiy
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/20'
                  : 'text-[#9CA3AF] hover:bg-[#1A1A1A] hover:text-white'
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={cn(
                    'w-4.5 h-4.5 transition-colors',
                    isActive ? 'text-[#F5A623]' : 'text-[#6B7280] group-hover:text-white'
                  )}
                  size={18}
                />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-[#F5A623]" size={14} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[#222222]">
        <div className="bg-[#1A1A1A] rounded-xl p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F5A623] to-[#D4891A] flex items-center justify-center text-black font-bold text-xs">
              D
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">Davron Adminov</p>
              <p className="text-[#6B7280] text-xs truncate">admin@nonkabob.uz</p>
            </div>
          </div>
        </div>
        <p className="text-center text-[#3D3D3D] text-xs mt-3">
          nonkabob.uz © 2024
        </p>
      </div>
    </aside>
  );
}
