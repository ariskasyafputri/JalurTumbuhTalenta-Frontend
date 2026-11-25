/**
 * FILE: app/jobs/[id]/page.tsx
 * PURPOSE:
 *   Public Job Detail & Application Submission Page (`/jobs/[id]`).
 *   Displays complete job metadata, description, qualifications, and a sticky application
 *   sidebar where logged-in candidates can submit their CV link and cover letter.
 */

'use client';
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Briefcase, Building2, Calendar, CheckCircle2, MapPin, Wallet } from 'lucide-react';
import { api, errMsg } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { dateID, salary, typeLabel } from '@/lib/format';
import { Recruitment } from '@/lib/types';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [job, setJob] = useState<Recruitment | null>(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ coverLetter: '', resumeUrl: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api<{ data: Recruitment }>(`/recruitments/${id}`)
      .then((r) => setJob(r.data))
      .catch((e) => setError(errMsg(e)));
  }, [id, user]);

  async function apply(e: FormEvent) {
    e.preventDefault();
    setError('');
    setMsg('');
    setSending(true);
    try {
      await api(`/applications/apply/${id}`, {
        method: 'POST',
        body: { coverLetter: form.coverLetter || undefined, resumeUrl: form.resumeUrl || undefined },
      });
      setMsg('Lamaran berhasil dikirim! Pantau statusnya di menu Lamaran Saya.');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSending(false);
    }
  }

  if (error && !job) {
    return (
      <div className="w-full px-4 py-8 sm:px-6 lg:px-10">
        <div className="alert-error">{error}</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="w-full px-4 py-12 text-center text-sm text-slate-500 sm:px-6 lg:px-10">
        Memuat detail lowongan...
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 px-4 py-8 sm:px-6 lg:px-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Daftar Lowongan
      </Link>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Job Description Column */}
        <div className="card space-y-6 lg:col-span-8">
          <div className="border-b border-slate-100 pb-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand-blue">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-brand-dark sm:text-3xl">{job.title}</h1>
                <p className="mt-0.5 text-base font-semibold text-brand-blue">{job.company_name}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2.5 text-xs font-medium">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-brand-blue">
                <Briefcase className="h-3.5 w-3.5" />
                {typeLabel[job.employment_type] ?? job.employment_type}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                {job.location ?? job.company_location ?? 'Lokasi fleksibel'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                <Wallet className="h-3.5 w-3.5" />
                {salary(job.salary_min, job.salary_max)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-amber-800">
                <Calendar className="h-3.5 w-3.5" />
                Batas lamar: {dateID(job.deadline)}
              </span>
            </div>
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-brand-dark">Deskripsi Pekerjaan</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {job.description}
            </p>
          </section>

          {job.requirements && (
            <section className="space-y-2 border-t border-slate-100 pt-5">
              <h2 className="text-base font-bold text-brand-dark">Persyaratan &amp; Kualifikasi</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {job.requirements}
              </p>
            </section>
          )}
        </div>

        {/* Right Application Sidebar */}
        <aside className="card h-fit space-y-4 lg:sticky lg:top-20 lg:col-span-4">
          <h2 className="text-lg font-bold text-brand-dark">Lamar Posisi Ini</h2>

          {!user ? (
            <div className="space-y-3 text-sm">
              <p className="text-slate-600">
                Masuk sebagai kandidat untuk mengirimkan lamaran ke posisi ini.
              </p>
              <Link href="/login" className="btn w-full">
                Masuk Sekarang
              </Link>
              <Link href="/register" className="btn-outline w-full">
                Daftar Akun Kandidat
              </Link>
            </div>
          ) : user.role !== 'candidate' ? (
            <div className="rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
              Anda sedang login sebagai <strong>{user.role}</strong>. Hanya akun kandidat yang
              dapat mengirimkan lamaran kerja.
            </div>
          ) : (
            <form onSubmit={apply} className="space-y-4">
              {error && <div className="alert-error">{error}</div>}
              {msg && (
                <div className="alert-ok flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{msg}</span>
                </div>
              )}

              <div>
                <label className="label">Link CV / Resume (Google Drive / LinkedIn)</label>
                <input
                  className="input"
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={form.resumeUrl}
                  onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Cover Letter / Pesan Singkat</label>
                <textarea
                  className="input"
                  rows={5}
                  placeholder="Ceritakan secara singkat pengalaman dan motivasi Anda melamar..."
                  value={form.coverLetter}
                  onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
                />
              </div>

              <button className="btn w-full" disabled={sending || !!msg}>
                {sending ? 'Mengirim Lamaran...' : msg ? 'Lamaran Terkirim' : 'Kirim Lamaran'}
              </button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
