'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Edit3, FileText, Send } from 'lucide-react';
import { api, errMsg, FILE_BASE } from '@/lib/api';
import { FullCandidateData, MyApplication, Recruitment } from '@/lib/types';
import RoleGuard from '@/components/RoleGuard';

export default function ApplyJobPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [job, setJob] = useState<Recruitment | null>(null);
  const [candidate, setCandidate] = useState<FullCandidateData | null>(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api<{ data: Recruitment }>(`/recruitments/${encodeURIComponent(slug)}`),
      api<{ data: FullCandidateData }>('/candidate/profile'),
      api<{ data: MyApplication[] }>('/applications/me?page=1&limit=100').catch(() => ({
        data: [] as MyApplication[],
      })),
    ])
      .then(([jRes, cRes, appRes]) => {
        setJob(jRes.data);
        setCandidate(cRes.data);
        const applied = (appRes.data ?? []).some(
          (a) => a.recruitment_id === jRes.data.id || a.recruitment_slug === jRes.data.slug
        );
        setAlreadyApplied(applied);
      })
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || alreadyApplied) return;
    setSubmitting(true);
    setError('');
    try {
      await api(`/applications/apply/${encodeURIComponent(job.slug || slug)}`, {
        method: 'POST',
        body: { coverLetter: coverLetter.trim() || undefined },
      });
      router.push('/applications?submitted=1');
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RoleGuard roles={['candidate']}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Link
          href={`/jobs/${slug}`}
          className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-brand-blue"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali ke Detail Lowongan
        </Link>

        {loading ? (
          <div className="card mt-4 text-center text-sm text-slate-500">Menyiapkan formulir lamaran...</div>
        ) : alreadyApplied ? (
          <div className="card mt-4 space-y-4 text-center py-10">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
            <div>
              <h1 className="text-lg font-bold text-brand-dark">Kamu Sudah Melamar Lowongan Ini</h1>
              <p className="mt-1 text-xs text-slate-500">
                Lamaranmu untuk posisi <strong>{job?.title}</strong> sudah tercatat di sistem.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Link href="/applications" className="btn text-xs">
                Lihat Lamaran Saya
              </Link>
              <Link href={`/jobs/${slug}`} className="btn-outline text-xs">
                Kembali ke Detail
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            {error && <div className="alert-error">{error}</div>}

            {job && (
              <div className="card border-brand-blue/20 bg-brand-light/40">
                <p className="text-xs font-bold uppercase text-brand-blue">Konfirmasi Lamaran Kerja</p>
                <h1 className="mt-1 text-xl font-extrabold text-brand-dark">{job.title}</h1>
                <p className="text-sm text-slate-600">
                  {job.company_name} · {job.province_name} ({job.employment_type_name})
                </p>
              </div>
            )}

            {candidate && (
              <div className="card">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-brand-dark">Data Profil & CV yang Akan Dikirim</h2>
                    <p className="text-xs text-slate-500">
                      Kelengkapan profil kamu saat ini: <strong className="text-brand-blue">{candidate.completion}%</strong>
                    </p>
                  </div>
                  <Link href={`/profile?returnTo=/jobs/${slug}/apply`} className="btn-outline text-xs">
                    <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Update Data Profil / CV
                  </Link>
                </div>

                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full bg-brand-blue transition-all"
                    style={{ width: `${candidate.completion}%` }}
                  />
                </div>

                <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-400">Nama Lengkap</p>
                    <p className="font-semibold text-slate-800">{candidate.user.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Email & No. HP</p>
                    <p className="font-semibold text-slate-800">
                      {candidate.user.email} · {candidate.profile.phone || 'Belum diisi'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Pendidikan Terakhir</p>
                    <p className="font-semibold text-slate-800">
                      {candidate.profile.education_level
                        ? `${candidate.profile.education_level} - ${candidate.profile.institution} (${candidate.profile.major || '-'})`
                        : 'Belum dilengkapi'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Pengalaman Kerja</p>
                    <p className="font-semibold text-slate-800">{candidate.experiences.length} riwayat pengalaman</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-slate-400">File CV Terlampir</p>
                    {candidate.profile.cv_path ? (
                      <a
                        href={`${FILE_BASE}${candidate.profile.cv_path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:underline"
                      >
                        <FileText className="h-4 w-4" /> Lihat / Unduh CV Saat Ini{' '}
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      </a>
                    ) : (
                      <p className="text-xs font-medium text-rose-600">
                        Belum ada file CV yang diunggah. Disarankan unggah CV terlebih dahulu.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="card space-y-4">
              <div>
                <label className="label">Catatan / Cover Letter Singkat (Opsional)</label>
                <textarea
                  rows={4}
                  className="input"
                  placeholder="Tuliskan alasan singkat mengapa kamu cocok untuk posisi ini..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <button type="submit" className="btn" disabled={submitting}>
                  <Send className="mr-2 h-4 w-4" />
                  {submitting ? 'Mengirim Lamaran...' : 'Submit Lamaran'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}