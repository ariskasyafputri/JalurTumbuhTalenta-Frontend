'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Building2,
  LogOut,
  Menu,
  UserCircle,
  UserPlus,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { roleLabel } from '@/lib/format';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Otomatis tutup menu mobile saat rute berubah
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Kunci scroll body saat drawer mobile terbuka
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Sembunyikan navbar publik pada halaman login khusus admin/superadmin
  const isStaffPortal = pathname.startsWith('/admin') || pathname.startsWith('/superadmin');
  if (isStaffPortal && !user) return null;

  let links: { href: string; label: string }[] = [
    { href: '/', label: 'Lowongan' },
    { href: '/#daftar-lowongan', label: 'Cari Kerja' },
  ];

  if (user?.role === 'candidate') {
    links = [
      { href: '/', label: 'Cari Lowongan' },
      { href: '/applications', label: 'Lamaran Saya' },
      { href: '/profile', label: 'Profil & CV' },
    ];
  } else if (user?.role === 'company') {
    links = [
      { href: '/dashboard', label: 'Dashboard Rekrutmen' },
      { href: '/dashboard/company', label: 'Profil Perusahaan' },
      { href: '/', label: 'Portal Publik' },
    ];
  } else if (user?.role === 'admin') {
    links = [{ href: '/admin', label: 'Dashboard Admin' }];
  } else if (user?.role === 'super_admin') {
    links = [
      { href: '/superadmin', label: 'Super Admin' },
      { href: '/admin', label: 'Panel Admin' },
    ];
  }

  const handleLogout = () => {
    const prevRole = user?.role;
    setMobileOpen(false);
    logout();
    if (prevRole === 'admin') router.push('/admin');
    else if (prevRole === 'super_admin') router.push('/superadmin');
    else router.push('/login');
  };

  const homeHref =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'super_admin'
      ? '/superadmin'
      : user?.role === 'company'
      ? '/dashboard'
      : '/';

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 h-16 w-full border-b border-sky-200/80 bg-gradient-to-r from-[#eaf5ff]/95 via-white/95 to-[#e6f3ff]/95 shadow-sm shadow-sky-900/5 backdrop-blur-md">
        {/* Garis aksen biru di bagian paling atas */}
        <div className="h-[3px] w-full bg-gradient-to-r from-sky-400 via-brand-blue to-blue-600" />

        <div className="flex h-[calc(100%-3px)] w-full items-center justify-between px-4 sm:px-6 lg:px-10">
          {/* Kiri: Logo + Menu Navigasi */}
          <div className="flex items-center gap-7">
            <Link href={homeHref} className="flex shrink-0 items-center">
              <Image
                src="/images/Logo Jalur Tumbuh.jpeg"
                alt="Logo Jalurtumbuh"
                width={175}
                height={38}
                className="h-9 w-auto rounded-md object-contain mix-blend-multiply"
                priority
              />
            </Link>

            <nav className="hidden items-center gap-1.5 md:flex">
              {links.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                      active
                        ? 'bg-brand-light font-semibold text-brand-blue'
                        : 'text-slate-600 hover:bg-white/90 hover:text-brand-blue'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Kanan: Tombol Login / Profil Desktop */}
          <div className="hidden items-center gap-2.5 md:flex">
            {user ? (
              <>
                <div className="flex items-center gap-2.5 rounded-full border border-sky-200/80 bg-white/90 py-1.5 pl-3 pr-2 text-xs shadow-xs">
                  <UserCircle className="h-4 w-4 text-brand-blue" />
                  <span className="max-w-[140px] truncate font-semibold text-slate-800">
                    {user.name}
                  </span>
                  <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-[11px] font-semibold text-brand-blue">
                    {roleLabel[user.role] ?? user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                >
                  <LogOut className="h-3.5 w-3.5" /> Keluar
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login?tab=candidate"
                  className="rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-blue hover:bg-brand-light hover:text-brand-blue"
                >
                  Masuk
                </Link>

                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-blue px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  <UserPlus className="h-4 w-4" /> Daftar
                </Link>

                <div className="mx-0.5 h-5 w-px bg-sky-200" />

                <Link
                  href="/login?tab=company"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200/80 bg-brand-light px-3.5 py-2 text-xs font-semibold text-brand-blue transition hover:bg-blue-100"
                >
                  <Building2 className="h-3.5 w-3.5" /> Perusahaan
                </Link>
              </>
            )}
          </div>

          {/* Tombol Hamburger Mobile */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 bg-white text-slate-700 shadow-xs transition hover:bg-sky-50 active:scale-95 md:hidden"
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5 text-brand-blue" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Overlay & Drawer Menu Mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />

          <div className="fixed inset-x-0 top-16 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-sky-100 bg-white px-4 pb-6 pt-4 shadow-2xl">
            <nav className="flex flex-col space-y-1.5">
              {links.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                      active
                        ? 'bg-brand-light font-semibold text-brand-blue'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 border-t border-slate-100 pt-4">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-xl border border-sky-100 bg-brand-light/60 px-4 py-3">
                    <UserCircle className="h-6 w-6 shrink-0 text-brand-blue" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{user.name}</p>
                      <p className="text-xs font-medium text-brand-blue">
                        {roleLabel[user.role] ?? user.role}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                  >
                    <LogOut className="h-4 w-4" /> Keluar Akun
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <Link
                      href="/login?tab=candidate"
                      onClick={() => setMobileOpen(false)}
                      className="btn-outline py-2.5 text-center text-sm"
                    >
                      Masuk
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileOpen(false)}
                      className="btn py-2.5 text-center text-sm"
                    >
                      <UserPlus className="mr-1.5 h-4 w-4" /> Daftar
                    </Link>
                  </div>
                  <Link
                    href="/login?tab=company"
                    onClick={() => setMobileOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-200 bg-brand-light py-3 text-sm font-semibold text-brand-blue transition hover:bg-blue-100"
                  >
                    <Building2 className="h-4 w-4" /> Portal HR / Perusahaan
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}