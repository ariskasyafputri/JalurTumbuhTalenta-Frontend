'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Banknote, Briefcase, Building2, Calendar, CheckCircle2, MapPin, Send } from 'lucide-react';
import { api, errMsg, FILE_BASE } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { dateID, salary } from '@/lib/format';
import { Recruitment } from '@/lib/types';

export default function JobDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [job, setJob] = useState<Recruitment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ data: Recruitment }>(`/recruitments/${slug}`)
      .then((r) => setJob(r.data))
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleApply = () => {
    if (!user) {
      router.push(`/login?tab=candidate&redirect=/jobs/${slug}/apply`);
      return;
    }
    router.push(`/jobs/${slug}/apply`);
  };

  if (loading) {
    return <div className="mx-auto max-w-4xl px-4 py-12 text-center text-sm text-slate-500">Memuat detail lowongan...</div>;
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="alert-error">{error || 'Lowongan tidak ditemukan'}</div>
        <Link href="/" className="btn-outline mt-4">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali ke Lowongan
        </Link>
      </div>
    );
  }

  const rawLogo = job.company_logo_path || '';
  const companyLogo = rawLogo ? (rawLogo.startsWith('http') ? rawLogo : `${FILE_BASE}${rawLogo}`) : '';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-brand-blue">
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali ke Daftar Lowongan
      </Link>

      <div className="card mt-4">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            {/* HANYA BADGE KATEGORI DI ATAS */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {job.category_name}
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-extrabold text-brand-dark sm:text-3xl">{job.title}</h1>

            {/* LOGO & NAMA PERUSAHAAN */}
            <div className="mt-3 flex items-center gap-2.5 text-base font-semibold text-slate-700">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {companyLogo ? (
                  <img src={companyLogo} alt={job.company_name} className="h-full w-full object-contain p-1" />
                ) : (
                  <Building2 className="h-4 w-4 text-brand-blue" />
                )}
              </div>
              <span>{job.company_name}</span>
              {job.company_verified === 1 && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            </div>
          </div>

          {(!user || user.role === 'candidate') && (
            <button onClick={handleApply} className="btn px-6 py-3">
              <Send className="mr-2 h-4 w-4" /> Lamar Sekarang
            </button>
          )}
        </div>

        {/* KOTAK INFO GRID 2x2 */}
        <div className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
          {/* Kiri Atas: Lokasi */}
          <div className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Lokasi Penempatan</p>
              <p className="font-semibold text-slate-800">{job.province_name}</p>
              <p className="text-xs text-slate-600">{job.detail_address}</p>
            </div>
          </div>

          {/* Kanan Atas: Estimasi Gaji */}
          <div className="flex items-start gap-2.5">
            <Banknote className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Estimasi Gaji</p>
              <p className="font-bold text-slate-800">{salary(job.salary_min, job.salary_max)}</p>
            </div>
          </div>

          {/* Kiri Bawah: Periode Pendaftaran */}
          <div className="flex items-start gap-2.5">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Periode Pendaftaran</p>
              <p className="font-medium text-slate-800">
                Dibuka {dateID(job.opened_at)} · Ditutup {dateID(job.closed_at)}
              </p>
            </div>
          </div>

          {/* Kanan Bawah: Tipe Pekerjaan / Fulltime */}
          <div className="flex items-start gap-2.5">
            <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Tipe Pekerjaan</p>
              <p className="font-semibold text-slate-800">{job.employment_type_name}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-brand-dark">Deskripsi Pekerjaan</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{job.description}</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-brand-dark">Kualifikasi & Persyaratan</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{job.requirements}</p>
          </div>
        </div>
      </div>
    </div>
  );
}