/**
 * FILE: app/dashboard/page.tsx
 * PURPOSE:
 *   Recruitment Management Dashboard (`/dashboard`) for Company, Recruitment Admin,
 *   and Super Admin roles. Uses a full-screen workspace layout with `AdminSidebar`
 *   on the left and a wide, responsive recruitment management table on the right.
 */

'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Users } from 'lucide-react';
import { api, errMsg, qs } from '@/lib/api';
import { dateID, typeLabel } from '@/lib/format';
import { Meta, Recruitment } from '@/lib/types';
import RoleGuard from '@/components/RoleGuard';
import AdminSidebar from '@/components/AdminSidebar';
import Pagination from '@/components/Pagination';
import StatusBadge from '@/components/StatusBadge';

function DashboardContent() {
  const [items, setItems] = useState<Recruitment[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api<{ data: Recruitment[]; meta: Meta }>('/recruitments/manage/list' + qs({ status, page }))
      .then((r) => {
        setItems(r.data);
        setMeta(r.meta);
        setError('');
      })
      .catch((e) => setError(errMsg(e)));
  }, [status, page]);
  useEffect(load, [load]);

  async function remove(id: number) {
    if (!confirm('Hapus lowongan rekrutmen ini beserta seluruh data pelamarnya?')) return;
    try {
      await api(`/recruitments/${id}`, { method: 'DELETE' });
      load();
    } catch (e) {
      setError(errMsg(e));
    }
  }

  return (
    <div className="flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-10">
      <AdminSidebar />

      <div className="min-w-0 flex-1 space-y-5">
        <div className="card flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-brand-dark">Kelola Rekrutmen</h1>
            <p className="text-xs text-slate-500">
              Buat lowongan baru, pantau pelamar masuk, dan ubah status rekrutmen
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="input w-40"
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
            >
              <option value="">Semua Status</option>
              <option value="open">Dibuka</option>
              <option value="draft">Draft</option>
              <option value="closed">Ditutup</option>
            </select>
            <Link href="/dashboard/recruitments/new" className="btn whitespace-nowrap">
              <Plus className="mr-1.5 h-4 w-4" /> Buat Rekrutmen
            </Link>
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[720px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="th">Posisi</th>
                <th className="th">Perusahaan</th>
                <th className="th">Tipe</th>
                <th className="th">Batas</th>
                <th className="th">Status</th>
                <th className="th text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70">
                  <td className="td font-semibold text-slate-900">{r.title}</td>
                  <td className="td text-slate-600">{r.company_name}</td>
                  <td className="td">{typeLabel[r.employment_type] ?? r.employment_type}</td>
                  <td className="td text-slate-500">{dateID(r.deadline)}</td>
                  <td className="td">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="td">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/recruitments/${r.id}`}
                        className="btn-outline px-3 py-1.5 text-xs"
                      >
                        <Users className="mr-1 h-3.5 w-3.5" /> Pelamar &amp; Edit
                      </Link>
                      <button className="btn-danger" onClick={() => remove(r.id)}>
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="td py-12 text-center text-slate-500" colSpan={6}>
                    Belum ada data rekrutmen. Klik <strong>+ Buat Rekrutmen</strong> untuk
                    menambahkan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination meta={meta} onPage={setPage} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RoleGuard roles={['company', 'admin', 'super_admin']}>
      <DashboardContent />
    </RoleGuard>
  );
}
