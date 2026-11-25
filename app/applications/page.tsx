/**
 * FILE: app/applications/page.tsx
 * PURPOSE:
 *   Candidate Application History Page (`/applications`).
 *   Protected for `candidate` users. Displays a full-width responsive table of submitted
 *   applications, real-time selection status badges, and an option to withdraw an application.
 */

'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase } from 'lucide-react';
import { api, errMsg } from '@/lib/api';
import { dateID } from '@/lib/format';
import { Meta, MyApplication } from '@/lib/types';
import RoleGuard from '@/components/RoleGuard';
import Pagination from '@/components/Pagination';
import StatusBadge from '@/components/StatusBadge';

function ApplicationsContent() {
  const [items, setItems] = useState<MyApplication[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api<{ data: MyApplication[]; meta: Meta }>(`/applications/me?page=${page}`)
      .then((r) => {
        setItems(r.data);
        setMeta(r.meta);
      })
      .catch((e) => setError(errMsg(e)));
  }, [page]);
  useEffect(load, [load]);

  async function withdraw(id: number) {
    if (!confirm('Apakah Anda yakin ingin menarik/membatalkan lamaran ini?')) return;
    try {
      await api(`/applications/${id}`, { method: 'DELETE' });
      load();
    } catch (e) {
      setError(errMsg(e));
    }
  }

  return (
    <div className="w-full space-y-5 px-4 py-8 sm:px-6 lg:px-10">
      <div className="card flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-brand-dark">Riwayat Lamaran Saya</h1>
          <p className="text-xs text-slate-500">
            Pantau perkembangan proses seleksi lamaran yang sudah Anda kirim
          </p>
        </div>
        <Link href="/" className="btn-outline">
          <Briefcase className="mr-1.5 h-4 w-4" /> Cari Lowongan Lain
        </Link>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[640px]">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="th">Posisi Dilamar</th>
              <th className="th">Perusahaan</th>
              <th className="th">Tanggal Kirim</th>
              <th className="th">Status Seleksi</th>
              <th className="th text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50/70">
                <td className="td">
                  <Link
                    href={`/jobs/${a.recruitment_id}`}
                    className="font-semibold text-brand-blue hover:underline"
                  >
                    {a.title}
                  </Link>
                </td>
                <td className="td font-medium text-slate-700">{a.company_name}</td>
                <td className="td text-slate-500">{dateID(a.created_at)}</td>
                <td className="td">
                  <StatusBadge status={a.status} />
                </td>
                <td className="td text-right">
                  <button className="btn-danger" onClick={() => withdraw(a.id)}>
                    Tarik Lamaran
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="td py-12 text-center text-slate-500" colSpan={5}>
                  Anda belum melamar lowongan apa pun.{' '}
                  <Link href="/" className="font-semibold text-brand-blue hover:underline">
                    Cari lowongan sekarang
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination meta={meta} onPage={setPage} />
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <RoleGuard roles={['candidate']}>
      <ApplicationsContent />
    </RoleGuard>
  );
}
