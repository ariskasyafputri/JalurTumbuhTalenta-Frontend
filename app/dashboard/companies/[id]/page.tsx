/**
 * FILE: app/dashboard/companies/[id]/page.tsx
 * PURPOSE:
 *   Company Detail & Company Admin Management Page (`/dashboard/companies/[id]`).
 *   Displays the company profile and allows company owners or Super Admins to view
 *   and create recruitment admin accounts under that company.
 */

'use client';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Building2, Globe, MapPin, UserPlus } from 'lucide-react';
import { api, errMsg } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { dateID } from '@/lib/format';
import { AdminUser, Company } from '@/lib/types';
import RoleGuard from '@/components/RoleGuard';
import AdminSidebar from '@/components/AdminSidebar';

function CompanyDetailContent() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const canManage =
    user?.role === 'super_admin' || (user?.role === 'company' && user.companyId === Number(id));
  const canSeeAdmins = user?.role === 'super_admin' || user?.companyId === Number(id);

  const load = useCallback(() => {
    api<{ data: Company }>(`/companies/${id}`)
      .then((r) => setCompany(r.data))
      .catch((e) => setError(errMsg(e)));
    if (canSeeAdmins) {
      api<{ data: AdminUser[] }>(`/companies/${id}/admins`)
        .then((r) => setAdmins(r.data))
        .catch(() => setAdmins([]));
    }
  }, [id, canSeeAdmins]);
  useEffect(load, [load]);

  async function addAdmin(e: FormEvent) {
    e.preventDefault();
    setError('');
    setMsg('');
    try {
      await api(`/companies/${id}/admins`, { method: 'POST', body: f });
      setF({ name: '', email: '', password: '' });
      setMsg('Admin perusahaan berhasil ditambahkan.');
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  }

  return (
    <div className="flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-10">
      <AdminSidebar />

      <div className="min-w-0 flex-1 space-y-5">
        <Link
          href="/dashboard/companies"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Direktori Perusahaan
        </Link>

        {!company ? (
          error ? (
            <div className="alert-error">{error}</div>
          ) : (
            <div className="card py-8 text-center text-sm text-slate-500">
              Memuat profil perusahaan...
            </div>
          )
        ) : (
          <>
            <div className="card space-y-3">
              <div className="flex items-start gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand-blue">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-brand-dark">{company.name}</h1>
                  <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {[company.industry, company.location].filter(Boolean).join(' · ') || '-'}
                    </span>
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-brand-blue hover:underline"
                      >
                        <Globe className="h-3.5 w-3.5" /> {company.website}
                      </a>
                    )}
                  </p>
                </div>
              </div>
              <p className="whitespace-pre-line border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-700">
                {company.description ?? 'Belum ada deskripsi perusahaan.'}
              </p>
            </div>

            {canSeeAdmins && (
              <div className="card space-y-4">
                <div>
                  <h2 className="text-base font-bold text-brand-dark">Admin Perusahaan</h2>
                  <p className="text-xs text-slate-500">
                    Daftar akun HR/Admin yang berwenang mengelola lowongan perusahaan ini
                  </p>
                </div>

                {error && <div className="alert-error">{error}</div>}
                {msg && <div className="alert-ok">{msg}</div>}

                <ul className="divide-y divide-slate-100 text-sm">
                  {admins.map((a) => (
                    <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                      <span>
                        <strong className="text-slate-800">{a.name}</strong>{' '}
                        <span className="text-slate-500">({a.email})</span>
                      </span>
                      <span className="text-xs text-slate-500">Bergabung: {dateID(a.created_at)}</span>
                    </li>
                  ))}
                  {admins.length === 0 && (
                    <li className="py-3 text-xs text-slate-500">Belum ada admin tambahan.</li>
                  )}
                </ul>

                {canManage && (
                  <form
                    onSubmit={addAdmin}
                    className="grid gap-2.5 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-4"
                  >
                    <input
                      className="input"
                      placeholder="Nama admin"
                      required
                      value={f.name}
                      onChange={(e) => setF({ ...f, name: e.target.value })}
                    />
                    <input
                      className="input"
                      type="email"
                      placeholder="Email admin"
                      required
                      value={f.email}
                      onChange={(e) => setF({ ...f, email: e.target.value })}
                    />
                    <input
                      className="input"
                      type="password"
                      placeholder="Password (min. 8)"
                      required
                      minLength={8}
                      value={f.password}
                      onChange={(e) => setF({ ...f, password: e.target.value })}
                    />
                    <button className="btn">
                      <UserPlus className="mr-1.5 h-4 w-4" /> Tambah Admin
                    </button>
                  </form>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function CompanyDetailPage() {
  return (
    <RoleGuard roles={['company', 'admin', 'super_admin']}>
      <CompanyDetailContent />
    </RoleGuard>
  );
}
