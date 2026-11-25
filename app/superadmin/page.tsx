/**
 * FILE: app/superadmin/page.tsx
 * PURPOSE:
 *   Super Admin System Overview Dashboard (`/superadmin`).
 *   Displays real-time global statistics across candidates, companies, admin accounts,
 *   recruitments, and submitted applications in a full-width responsive grid.
 *   Note: Super Admin accounts are provisioned directly via backend database seeders.
 */

'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Building2, FileCheck2, ShieldCheck, Users } from 'lucide-react';
import { api, errMsg } from '@/lib/api';
import { Stats } from '@/lib/types';
import RoleGuard from '@/components/RoleGuard';
import AdminSidebar from '@/components/AdminSidebar';

const STAT_CARDS: { key: keyof Stats; label: string; icon: React.ElementType }[] = [
  { key: 'candidates', label: 'Total Kandidat', icon: Users },
  { key: 'companies', label: 'Perusahaan Terdaftar', icon: Building2 },
  { key: 'admins', label: 'Akun Admin', icon: ShieldCheck },
  { key: 'open_recruitments', label: 'Lowongan Dibuka', icon: Briefcase },
  { key: 'recruitments', label: 'Total Rekrutmen', icon: Briefcase },
  { key: 'applications', label: 'Total Lamaran Masuk', icon: FileCheck2 },
];

function SuperAdminContent() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ data: Stats }>('/superadmin/stats')
      .then((r) => setStats(r.data))
      .catch((e) => setError(errMsg(e)));
  }, []);

  return (
    <div className="flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-10">
      <AdminSidebar />

      <div className="min-w-0 flex-1 space-y-5">
        <div className="card">
          <h1 className="text-xl font-bold text-brand-dark">Ringkasan Sistem (Super Admin)</h1>
          <p className="text-xs text-slate-500">
            Kontrol penuh terhadap seluruh pengguna, perusahaan, dan aktivitas rekrutmen Jalurtumbuh
          </p>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {STAT_CARDS.map(({ key, label, icon: Icon }) => (
            <div key={key} className="card flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="mt-1 text-3xl font-extrabold text-brand-dark">
                  {stats ? stats[key] : '-'}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand-blue">
                <Icon className="h-6 w-6" />
              </div>
            </div>
          ))}
        </div>

        <div className="card flex flex-wrap gap-3">
          <Link href="/superadmin/users" className="btn">
            Kelola Semua User
          </Link>
          <Link href="/dashboard" className="btn-outline">
            Kelola Semua Rekrutmen
          </Link>
          <Link href="/dashboard/companies" className="btn-outline">
            Kelola Perusahaan
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminPage() {
  return (
    <RoleGuard roles={['super_admin']}>
      <SuperAdminContent />
    </RoleGuard>
  );
}
