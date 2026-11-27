'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Banknote,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Gift,
  MapPin,
  Send,
} from 'lucide-react';
import { api, errMsg, FILE_BASE } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { dateID, salary } from '@/lib/format';
import { MyApplication, Recruitment } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';

export default function JobDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [job, setJob] = useState<Recruitment | null>(null);
  const [myApplication, setMyApplication] = useState<MyApplication | null>(null);
  const [checkingApplied, setCheckingApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api<{ data: Recruitment }>(`/recruitments/${slug}`)
      .then((r) => setJob(r.data))
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!job || !user || user.role !== 'candidate') {
      setMyApplication(null);
      return;
    }

    let cancelled = false;
    setCheckingApplied(true);

    api<{ data: MyApplication[] }>('/applications/me?page=1&limit=100')
      .then((res) => {
        if (cancelled) return;
        const matched =
          (res.data ?? []).find(
            (app) => app.recruitment_id === job.id || app.recruitment_slug === job.slug
          ) ?? null;
        setMyApplication(matched);
      })
      .catch(() => {
        if (!cancelled) setMyApplication(null);
      })
      .finally(() => {
        if (!cancelled) setCheckingApplied(false);
      });

    return () => {
      cancelled = true;
    };
  }, [job, user]);

  const handleApply = () => {
    if (myApplication) return;
    if (!user) {
      router.push(`/login?tab=candidate&redirect=/jobs/${slug}/apply`);
      return;
    }
    router.push(`/jobs/${slug}/apply`);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center text-sm text-slate-500">
        Memuat detail lowongan...
      </div>
    );
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
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {job.category_name}
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-extrabold text-brand-dark sm:text-3xl">{job.title}</h1>

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
            checkingApplied ? (
              <span className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-500">
                Memeriksa status lamaran...
              </span>
            ) : myApplication ? (
              <div className="flex flex-col items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3.5 sm:items-end">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Status Lamaran:</span>
                  <StatusBadge status={myApplication.status} />
                </div>
                <p className="text-[11px] text-slate-500">Dilamar pada {dateID(myApplication.applied_at)}</p>
                {myApplication.notes && (
                  <p className="max-w-xs text-left text-[11px] text-slate-600 sm:text-right">
                    Catatan: {myApplication.notes}
                  </p>
                )}
                <Link href="/applications" className="btn-outline mt-0.5 px-3 py-1.5 text-xs">
                  Lihat Lamaran Saya
                </Link>
              </div>
            ) : (
              <button onClick={handleApply} className="btn px-6 py-3">
                <Send className="mr-2 h-4 w-4" /> Lamar Sekarang
              </button>
            )
          )}
        </div>

        <div className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
          <div className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Lokasi Penempatan</p>
              <p className="font-semibold text-slate-800">{job.province_name}</p>
              <p className="text-xs text-slate-600">{job.detail_address}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Banknote className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Estimasi Gaji</p>
              <p className="font-bold text-slate-800">
                {salary(job.salary_min, job.salary_max, job.hide_salary)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Periode Pendaftaran</p>
              <p className="font-medium text-slate-800">
                Dibuka {dateID(job.opened_at)} · Ditutup {dateID(job.closed_at)}
              </p>
            </div>
          </div>

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

          {job.benefits && job.benefits.length > 0 && (
            <div>
              <h2 className="inline-flex items-center gap-1.5 text-base font-bold text-brand-dark">
                <Gift className="h-4 w-4 text-brand-blue" /> Benefit & Fasilitas
              </h2>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {job.benefits.map((b) => (
                  <span
                    key={b.id}
                    className="rounded-xl border border-brand-blue/15 bg-brand-light px-3 py-1.5 text-xs font-semibold text-brand-blue"
                  >
                    {b.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}