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
  CalendarCheck,
  Truck,
  BarChart3,
  Activity,
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
  { href: '/bookings', label: 'Bookings', icon: CalendarCheck, superAdminOnly: false },
  { href: '/tour-packages', label: 'Tour Packages', icon: Compass, superAdminOnly: false },
  { href: '/suppliers', label: 'Suppliers', icon: Truck, superAdminOnly: false },
  { href: '/markup', label: 'Markup', icon: Percent, superAdminOnly: true },
  { href: '/promo-codes', label: 'Promo Codes', icon: Tag, superAdminOnly: true },
  { href: '/reports', label: 'Reports', icon: BarChart3, superAdminOnly: true },
  { href: '/api-health', label: 'API Health', icon: Activity, superAdminOnly: true },
  { href: '/staff', label: 'Staff', icon: UserCog, superAdminOnly: true },
];

export function AdminSidebar({ staffName, role, onLogout }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shadow-sm">
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-200">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-sm shadow-brand-600/30">
          <Plane className="w-4.5 h-4.5 -rotate-45" />
        </div>
        <div className="leading-tight">
          <span className="font-semibold text-slate-900 block">Al-Safr</span>
          <span className="text-[11px] font-medium text-slate-400 tracking-wide uppercase">CRM</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.filter((item) => !item.superAdminOnly || role === 'SUPER_ADMIN').map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`focus-ring relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full bg-brand-600" />}
              <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-200 space-y-2">
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold shrink-0">
            {staffName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-900 truncate">{staffName}</div>
            <div className="text-xs text-slate-400">{role === 'SUPER_ADMIN' ? 'Super Admin' : 'Staff'}</div>
          </div>
        </div>
        <button
          onClick={() => onLogout()}
          className="focus-ring w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
