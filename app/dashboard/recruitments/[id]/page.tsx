'use client';
import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Briefcase,
  ExternalLink,
  FileText,
  GraduationCap,
  Mail,
  MessageCircle,
  Phone,
  User,
} from 'lucide-react';
import { api, errMsg, FILE_BASE, qs } from '@/lib/api';
import { dateID } from '@/lib/format';
import { Applicant, ApplicationStatus, Meta, Recruitment } from '@/lib/types';
import Pagination from '@/components/Pagination';
import RecruitmentForm from '@/components/RecruitmentForm';
import RoleGuard from '@/components/RoleGuard';
import StatusBadge from '@/components/StatusBadge';

function formatWhatsAppUrl(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  const normalized = digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
  return `https://wa.me/${normalized}`;
}

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
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-10">
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
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-extrabold text-brand-dark">{job.title}</h1>
                  <StatusBadge status={job.status} />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {job.company_name} · {job.category_name} · {job.employment_type_name} · {job.province_name}
                  {job.min_experience ? ` · ${job.min_experience}` : ''}
                </p>
                {job.benefits && job.benefits.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {job.benefits.map((b) => (
                      <span
                        key={b.id}
                        className="rounded-md bg-brand-light px-2 py-0.5 text-[11px] font-medium text-brand-blue"
                      >
                        {b.name}
                      </span>
                    ))}
                  </div>
                )}
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
                  const waUrl = a.phone ? formatWhatsAppUrl(a.phone) : '';
                  return (
                    <div key={a.id} className="card space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                            {a.photo_path ? (
                              <img
                                src={a.photo_path.startsWith('http') ? a.photo_path : `${FILE_BASE}${a.photo_path}`}
                                alt={a.candidate_name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <User className="h-5 w-5 text-slate-400" />
                            )}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                              <h2 className="text-lg font-bold text-brand-dark">{a.candidate_name}</h2>
                              <StatusBadge status={a.status} />
                            </div>
                            {a.headline && <p className="text-xs font-medium text-brand-blue">{a.headline}</p>}

                            {/* PREVIEW KONTAK: EMAIL & NO TELEPON / WHATSAPP KANDIDAT */}
                            <div className="mt-2 flex flex-wrap items-center gap-2.5 text-xs">
                              <a
                                href={`mailto:${a.candidate_email}`}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700 hover:border-brand-blue hover:text-brand-blue"
                              >
                                <Mail className="h-3.5 w-3.5 text-slate-400" /> {a.candidate_email}
                              </a>

                              {a.phone ? (
                                <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 px-2.5 py-1 font-semibold text-emerald-800">
                                  <Phone className="h-3.5 w-3.5 text-emerald-600" />
                                  <span>{a.phone}</span>
                                  {waUrl && (
                                    <a
                                      href={waUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="ml-1 inline-flex items-center gap-0.5 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white hover:bg-emerald-700"
                                      title="Hubungi via WhatsApp"
                                    >
                                      <MessageCircle className="h-3 w-3" /> WA
                                    </a>
                                  )}
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-400">
                                  <Phone className="h-3.5 w-3.5" /> No. Telp belum diisi
                                </span>
                              )}

                              <span className="text-slate-400">· Melamar: {dateID(a.applied_at)}</span>
                            </div>
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