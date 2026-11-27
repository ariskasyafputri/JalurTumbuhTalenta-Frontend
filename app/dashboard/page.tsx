'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Edit3, Eye, Plus, Trash2, Users } from 'lucide-react';
import { api, errMsg, qs } from '@/lib/api';
import { dateID } from '@/lib/format';
import { Meta, Recruitment } from '@/lib/types';
import Pagination from '@/components/Pagination';
import RoleGuard from '@/components/RoleGuard';
import StatusBadge from '@/components/StatusBadge';

export default function CompanyDashboardPage() {
  const [jobs, setJobs] = useState<Recruitment[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadJobs = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await api<{ data: Recruitment[]; meta: Meta }>(
        '/recruitments/manage/list' +
          qs({
            page,
            limit: 10,
          })
      );
      setJobs(res.data);
      setMeta(res.meta);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs(1);
  }, [loadJobs]);

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus lowongan ini beserta data lamarannya?')) return;
    try {
      await api(`/recruitments/${id}`, { method: 'DELETE' });
      loadJobs(meta?.page ?? 1);
    } catch (e) {
      setError(errMsg(e));
    }
  };

  return (
    <RoleGuard roles={['company', 'admin', 'super_admin']}>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-10">
        {/* TOP HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-brand-dark">Dashboard Rekrutmen Perusahaan</h1>
            <p className="text-xs text-slate-500">
              Kelola profil perusahaan (NPWP/NIB), lowongan kerja aktif, dan daftar pelamar.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link href="/dashboard/company" className="btn-outline">
              <Building2 className="mr-1.5 h-4 w-4" /> Profil Perusahaan
            </Link>
            <Link href="/dashboard/recruitments/new" className="btn">
              <Plus className="mr-1.5 h-4 w-4" /> Posting Lowongan Baru
            </Link>
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {/* RECRUITMENTS TABLE */}
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="th">Posisi & Bidang</th>
                  <th className="th">Perusahaan</th>
                  <th className="th">Tipe & Provinsi</th>
                  <th className="th">Periode</th>
                  <th className="th">Pelamar</th>
                  <th className="th">Status</th>
                  <th className="th text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="td py-10 text-center text-slate-500">
                      Memuat daftar lowongan...
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="td py-10 text-center text-slate-500">
                      Belum ada lowongan. Klik "Posting Lowongan Baru" untuk mulai merekrut.
                    </td>
                  </tr>
                ) : (
                  jobs.map((j) => (
                    <tr key={j.id} className="hover:bg-slate-50/70">
                      <td className="td">
                        <p className="font-bold text-slate-800">{j.title}</p>
                        <p className="text-xs text-slate-500">{j.category_name}</p>
                      </td>
                      <td className="td font-medium text-slate-700">{j.company_name}</td>
                      <td className="td">
                        <span className="rounded bg-brand-light px-2 py-0.5 text-xs font-semibold text-brand-blue">
                          {j.employment_type_name}
                        </span>
                        <p className="mt-1 text-xs text-slate-500">{j.province_name}</p>
                      </td>
                      <td className="td text-xs text-slate-600">
                        {dateID(j.opened_at)} – {dateID(j.closed_at)}
                      </td>
                      <td className="td">
                        <Link
                          href={`/dashboard/recruitments/${j.id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-brand-blue hover:bg-blue-100"
                        >
                          <Users className="h-3.5 w-3.5" /> {j.applicants_count ?? 0} Pelamar
                        </Link>
                      </td>
                      <td className="td">
                        <StatusBadge status={j.status} />
                      </td>
                      <td className="td text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/dashboard/recruitments/${j.id}`}
                            className="btn-outline px-2.5 py-1.5 text-xs"
                            title="Lihat Pelamar & Edit"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                          <Link
                            href={`/dashboard/recruitments/${j.id}?edit=1`}
                            className="btn-outline px-2.5 py-1.5 text-xs"
                            title="Edit Lowongan"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(j.id)}
                            className="btn-danger px-2.5 py-1.5"
                            title="Hapus Lowongan"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination meta={meta} onPage={(p) => loadJobs(p)} />
      </div>
    </RoleGuard>
  );
}