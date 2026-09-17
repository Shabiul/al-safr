'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Inbox,
  Users,
  Compass,
  Percent,
  Tag,
  UserCog,
  LogOut,
  Plane,
} from 'lucide-react';

interface AdminSidebarProps {
  staffName: string;
  role: string;
  onLogout: () => Promise<void>;
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, superAdminOnly: false },
  { href: '/leads', label: 'Leads', icon: Inbox, superAdminOnly: false },
  { href: '/customers', label: 'Customers', icon: Users, superAdminOnly: false },
  { href: '/tour-packages', label: 'Tour Packages', icon: Compass, superAdminOnly: false },
  { href: '/markup', label: 'Markup', icon: Percent, superAdminOnly: true },
  { href: '/promo-codes', label: 'Promo Codes', icon: Tag, superAdminOnly: true },
  { href: '/staff', label: 'Staff', icon: UserCog, superAdminOnly: true },
];

export function AdminSidebar({ staffName, role, onLogout }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-200">
        <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center">
          <Plane className="w-4 h-4 -rotate-45" />
        </div>
        <span className="font-semibold text-slate-900">Al-Safr CRM</span>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.filter((item) => !item.superAdminOnly || role === 'SUPER_ADMIN').map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`focus-ring flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-200 space-y-2">
        <div className="px-3 py-2">
          <div className="text-sm font-medium text-slate-900 truncate">{staffName}</div>
          <div className="text-xs text-slate-400">{role === 'SUPER_ADMIN' ? 'Super Admin' : 'Staff'}</div>
        </div>
        <button
          onClick={() => onLogout()}
          className="focus-ring w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-rose-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
