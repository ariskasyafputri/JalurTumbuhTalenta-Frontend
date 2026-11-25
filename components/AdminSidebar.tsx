/**
 * FILE: components/AdminSidebar.tsx
 * PURPOSE:
 *   Responsive Workspace Sidebar component for Company, Recruitment Admin, and Super Admin
 *   dashboards. Displays as a horizontal scrollable bar on mobile/tablet screens and as a
 *   sticky left navigation rail on desktop (`lg:w-64`).
 */

'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, Building2, LayoutDashboard, PlusCircle, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function AdminSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const isSuper = user?.role === 'super_admin';

  const menu = [
    ...(isSuper
      ? [
          { href: '/superadmin', label: 'Ringkasan Sistem', icon: LayoutDashboard },
          { href: '/superadmin/users', label: 'Kelola Semua User', icon: Users },
        ]
      : []),
    { href: '/dashboard', label: 'Daftar Rekrutmen', icon: Briefcase },
    { href: '/dashboard/recruitments/new', label: 'Buat Rekrutmen', icon: PlusCircle },
    { href: '/dashboard/companies', label: 'Cari Perusahaan', icon: Building2 },
  ];

  return (
    <aside className="w-full shrink-0 lg:w-64">
      <div className="card flex gap-1.5 overflow-x-auto p-2.5 lg:sticky lg:top-20 lg:flex-col lg:space-y-1 lg:p-3">
        <p className="hidden px-3 pb-1.5 pt-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 lg:block">
          Menu Panel Kerja
        </p>
        {menu.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                active
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-brand-blue'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
