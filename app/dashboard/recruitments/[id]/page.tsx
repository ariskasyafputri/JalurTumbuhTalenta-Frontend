/**
 * FILE: app/dashboard/recruitments/[id]/page.tsx
 * PURPOSE:
 *   Single-Recruitment Management Workspace (`/dashboard/recruitments/[id]`).
 *   Combines two workflows into clean, switchable tabs on one page:
 *     1. "Daftar Pelamar" — View submitted applicants, open CVs, read cover letters,
 *        filter by stage, and update application status inline.
 *     2. "Edit Lowongan" — Update job title, salary range, deadline, status, or requirements.
 */

'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ExternalLink, Settings, Users } from 'lucide-react';
import { api, errMsg, qs } from '@/lib/api';
import { dateID, statusLabel, typeLabel } from '@/lib/format';
import { Applicant, ApplicationStatus, Meta, Recruitment } from '@/lib/types';
import RoleGuard from '@/components/RoleGuard';
import AdminSidebar from '@/components/AdminSidebar';
import Pagination from '@/components/Pagination';
import RecruitmentForm from '@/components/RecruitmentForm';
import StatusBadge from '@/components/StatusBadge';

const APP_STATUSES = Object.keys(statusLabel).filter(
  (s) => !['draft', 'open', 'closed'].includes(s)
) as ApplicationStatus[];

function ManageRecruitmentContent() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<'applicants' | 'edit'>('applicants');
  const [job, setJob] = useState<Recruitment | null>(null);
  const [items, setItems] = useState<Applicant[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ data: Recruitment }>(`/recruitments/${id}`)
      .then((r) => setJob(r.data))
      .catch((e) => setError(errMsg(e)));
  }, [id]);

  const loadApplicants = useCallback(() => {
    if (tab !== 'applicants') return;
    api<{ data: Applicant[]; meta: Meta }>(`/recruitments/${id}/applications` + qs({ status, page }))
      .then((r) => {
        setItems(r.data);
        setMeta(r.meta);
        setError('');
      })
      .catch((e) => setError(errMsg(e)));
  }, [id, status, page, tab]);
  useEffect(loadApplicants, [loadApplicants]);

  async function changeStatus(appId: number, nextStatus: string) {
    try {
      await api(`/applications/${appId}/status`, {
        method: 'PATCH',
        body: { status: nextStatus },
      });
      setItems((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: nextStatus as ApplicationStatus } : a))
      );
    } catch (e) {
      setError(errMsg(e));
    }
  }

  return (
    <div className="flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-10">
      <AdminSidebar />

      <div className="min-w-0 flex-1 space-y-5">
        <div className="card space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Daftar Rekrutmen
              </Link>
              <h1 className="mt-1 text-xl font-bold text-brand-dark">
                {job ? job.title : `Kelola Rekrutmen #${id}`}
              </h1>
              {job && (
                <p className="text-xs text-slate-500">
                  {job.company_name} · {typeLabel[job.employment_type] ?? job.employment_type}
                </p>
              )}
            </div>
            {job && <StatusBadge status={job.status} />}
          </div>

          {/* Switchable Workspace Tabs */}
          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setTab('applicants')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                tab === 'applicants'
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users className="h-3.5 w-3.5" /> Daftar Pelamar ({meta?.total ?? items.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('edit')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                tab === 'edit'
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Settings className="h-3.5 w-3.5" /> Edit Lowongan
            </button>
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {tab === 'applicants' ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium text-slate-500">
                Ubah status seleksi kandidat langsung pada kolom Status
              </p>
              <select
                className="input w-48"
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value);
                }}
              >
                <option value="">Semua Status Pelamar</option>
                {APP_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel[s]}
                  </option>
                ))}
              </select>
            </div>

            <div className="card overflow-x-auto p-0">
              <table className="w-full min-w-[720px]">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="th">Kandidat</th>
                    <th className="th">Tanggal Lamar</th>
                    <th className="th">CV / Resume</th>
                    <th className="th">Cover Letter</th>
                    <th className="th">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 align-top">
                  {items.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/70">
                      <td className="td">
                        <p className="font-semibold text-slate-900">{a.candidate_name}</p>
                        <p className="text-xs text-slate-500">{a.candidate_email}</p>
                      </td>
                      <td className="td whitespace-nowrap text-slate-500">
                        {dateID(a.created_at)}
                      </td>
                      <td className="td whitespace-nowrap">
                        {a.resume_url ? (
                          <a
                            href={a.resume_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-brand-blue hover:underline"
                          >
                            Buka CV <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="td max-w-md whitespace-pre-line text-slate-600">
                        {a.cover_letter ?? '-'}
                      </td>
                      <td className="td">
                        <select
                          className="input w-40 py-1.5 text-xs font-medium"
                          value={a.status}
                          onChange={(e) => changeStatus(a.id, e.target.value)}
                        >
                          {APP_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {statusLabel[s]}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td className="td py-12 text-center text-slate-500" colSpan={5}>
                        Belum ada pelamar untuk lowongan ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination meta={meta} onPage={setPage} />
          </>
        ) : job ? (
          <RecruitmentForm initial={job} />
        ) : (
          <div className="card py-8 text-center text-sm text-slate-500">
            Memuat data lowongan...
          </div>
        )}
      </div>
    </div>
  );
}

export default function ManageRecruitmentPage() {
  return (
    <RoleGuard roles={['company', 'admin', 'super_admin']}>
      <ManageRecruitmentContent />
    </RoleGuard>
  );
}
