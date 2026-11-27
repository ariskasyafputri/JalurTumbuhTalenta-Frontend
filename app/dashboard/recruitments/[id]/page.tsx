'use client';
import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Briefcase, ExternalLink, FileText, GraduationCap, Mail, Phone } from 'lucide-react';
import { api, errMsg, FILE_BASE, qs } from '@/lib/api';
import { dateID } from '@/lib/format';
import { Applicant, ApplicationStatus, Meta, Recruitment } from '@/lib/types';
import Pagination from '@/components/Pagination';
import RecruitmentForm from '@/components/RecruitmentForm';
import RoleGuard from '@/components/RoleGuard';
import StatusBadge from '@/components/StatusBadge';

function ManageRecruitmentContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [editMode, setEditMode] = useState(searchParams.get('edit') === '1');

  const [job, setJob] = useState<Recruitment | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAll = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError('');
      try {
        const [jRes, aRes] = await Promise.all([
          api<{ data: Recruitment }>(`/recruitments/${id}`),
          api<{ data: Applicant[]; meta: Meta }>(
            `/recruitments/${id}/applications` + qs({ status: statusFilter || undefined, page, limit: 10 })
          ),
        ]);
        setJob(jRes.data);
        setApplicants(aRes.data);
        setMeta(aRes.meta);
      } catch (e) {
        setError(errMsg(e));
      } finally {
        setLoading(false);
      }
    },
    [id, statusFilter]
  );

  useEffect(() => {
    loadAll(1);
  }, [loadAll]);

  const handleStatusChange = async (appId: number, status: ApplicationStatus) => {
    try {
      await api(`/applications/${appId}/status`, { method: 'PATCH', body: { status } });
      setApplicants((prev) => prev.map((a) => (a.id === appId ? { ...a, status } : a)));
    } catch (e) {
      setError(errMsg(e));
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-brand-blue">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali ke Dashboard
        </Link>
        {job && (
          <button onClick={() => setEditMode((v) => !v)} className="btn-outline text-xs">
            {editMode ? 'Lihat Daftar Pelamar' : 'Edit Detail Lowongan'}
          </button>
        )}
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="card text-center text-sm text-slate-500">Memuat data...</div>
      ) : editMode && job ? (
        <div className="card">
          <h1 className="mb-5 text-xl font-extrabold text-brand-dark">Edit Lowongan: {job.title}</h1>
          <RecruitmentForm initial={job} />
        </div>
      ) : (
        job && (
          <>
            {/* JOB HEADER */}
            <div className="card flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold text-brand-dark">{job.title}</h1>
                  <StatusBadge status={job.status} />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {job.company_name} · {job.category_name} · {job.employment_type_name} · {job.province_name}
                </p>
              </div>

              <div>
                <select
                  className="input text-xs"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Semua Status Pelamar</option>
                  <option value="submitted">Terkirim (Submitted)</option>
                  <option value="reviewed">Ditinjau (Reviewed)</option>
                  <option value="interview">Interview</option>
                  <option value="accepted">Diterima (Accepted)</option>
                  <option value="rejected">Ditolak (Rejected)</option>
                </select>
              </div>
            </div>

            {/* APPLICANTS LIST */}
            {applicants.length === 0 ? (
              <div className="card py-12 text-center text-sm text-slate-500">
                Belum ada pelamar untuk lowongan ini.
              </div>
            ) : (
              <div className="space-y-4">
                {applicants.map((a) => {
                  const cvLink = a.cv_snapshot_path || a.cv_path;
                  return (
                    <div key={a.id} className="card space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h2 className="text-lg font-bold text-brand-dark">{a.candidate_name}</h2>
                            <StatusBadge status={a.status} />
                          </div>
                          {a.headline && <p className="text-xs font-medium text-brand-blue">{a.headline}</p>}
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <Mail className="h-3.5 w-3.5" /> {a.candidate_email}
                            </span>
                            {a.phone && (
                              <span className="inline-flex items-center gap-1">
                                <Phone className="h-3.5 w-3.5" /> {a.phone}
                              </span>
                            )}
                            <span>Melamar: {dateID(a.applied_at)}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {cvLink && (
                            <a
                              href={`${FILE_BASE}${cvLink}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-outline px-3 py-1.5 text-xs"
                            >
                              <FileText className="mr-1.5 h-3.5 w-3.5" /> Lihat CV
                            </a>
                          )}
                          {a.portfolio_url && (
                            <a
                              href={a.portfolio_url}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-outline px-3 py-1.5 text-xs"
                            >
                              <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Portfolio
                            </a>
                          )}
                          <select
                            className="input w-auto py-1.5 text-xs font-semibold"
                            value={a.status}
                            onChange={(e) => handleStatusChange(a.id, e.target.value as ApplicationStatus)}
                          >
                            <option value="submitted">Terkirim</option>
                            <option value="reviewed">Ditinjau</option>
                            <option value="interview">Interview</option>
                            <option value="accepted">Diterima</option>
                            <option value="rejected">Ditolak</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid gap-4 text-xs sm:grid-cols-2">
                        <div>
                          <p className="font-bold uppercase text-slate-400">
                            <GraduationCap className="mr-1 inline h-3.5 w-3.5" /> Pendidikan & Keahlian
                          </p>
                          <p className="mt-1 font-semibold text-slate-700">
                            {a.education_level
                              ? `${a.education_level} - ${a.institution} (${a.major || '-'})`
                              : 'Pendidikan belum diisi'}
                          </p>
                          {a.skills && <p className="mt-1 text-slate-600">Skills: {a.skills}</p>}
                        </div>

                        <div>
                          <p className="font-bold uppercase text-slate-400">
                            <Briefcase className="mr-1 inline h-3.5 w-3.5" /> Pengalaman Kerja ({a.experiences?.length ?? 0})
                          </p>
                          {a.experiences?.length ? (
                            <ul className="mt-1 space-y-1 text-slate-700">
                              {a.experiences.map((exp) => (
                                <li key={exp.id}>
                                  <strong>{exp.job_title}</strong> di {exp.company_name}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-1 text-slate-500">Fresh Graduate / Tanpa riwayat kerja</p>
                          )}
                        </div>
                      </div>

                      {a.cover_letter && (
                        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                          <span className="font-bold text-slate-500">Catatan Kandidat: </span>
                          {a.cover_letter}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <Pagination meta={meta} onPage={(p) => loadAll(p)} />
          </>
        )
      )}
    </div>
  );
}

export default function ManageRecruitmentPage() {
  return (
    <RoleGuard roles={['company', 'admin', 'super_admin']}>
      <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Memuat...</div>}>
        <ManageRecruitmentContent />
      </Suspense>
    </RoleGuard>
  );
}
