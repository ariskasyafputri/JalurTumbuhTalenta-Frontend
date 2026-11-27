'use client';
import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Building2, ExternalLink, MapPin, Trash2 } from 'lucide-react';
import { api, errMsg, FILE_BASE, qs } from '@/lib/api';
import { dateID } from '@/lib/format';
import { Meta, MyApplication } from '@/lib/types';
import Pagination from '@/components/Pagination';
import RoleGuard from '@/components/RoleGuard';
import StatusBadge from '@/components/StatusBadge';

function ApplicationsContent() {
  const searchParams = useSearchParams();
  const submitted = searchParams.get('submitted');

  const [apps, setApps] = useState<MyApplication[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api<{ data: MyApplication[]; meta: Meta }>('/applications/me' + qs({ page, limit: 10 }));
      setApps(res.data);
      setMeta(res.meta);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  const handleWithdraw = async (id: number) => {
    if (!confirm('Batalkan lamaran ini?')) return;
    try {
      await api(`/applications/${id}`, { method: 'DELETE' });
      load(meta?.page ?? 1);
    } catch (e) {
      setError(errMsg(e));
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-dark">Riwayat Lamaran Saya</h1>
          <p className="text-xs text-slate-500">Pantau status seleksi lamaran yang sudah kamu kirimkan.</p>
        </div>
        <Link href="/" className="btn text-xs">
          Cari Lowongan Lain
        </Link>
      </div>

      {submitted && (
        <div className="alert-ok mb-5">
          Lamaran berhasil dikirim! Tim rekrutmen perusahaan akan meninjau profil dan CV kamu.
        </div>
      )}
      {error && <div className="alert-error mb-5">{error}</div>}

      {loading ? (
        <div className="card text-center text-sm text-slate-500">Memuat riwayat lamaran...</div>
      ) : apps.length === 0 ? (
        <div className="card py-12 text-center">
          <p className="font-semibold text-slate-700">Belum ada lamaran kerja</p>
          <Link href="/" className="btn mt-4 text-xs">
            Jelajahi Lowongan Sekarang
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {apps.map((a) => {
              const jobIdentifier = a.recruitment_slug || a.recruitment_id;
              const rawLogo = a.company_logo_path || '';
              const companyLogo = rawLogo ? (rawLogo.startsWith('http') ? rawLogo : `${FILE_BASE}${rawLogo}`) : '';

              return (
                <div key={a.id} className="card flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      {companyLogo ? (
                        <img src={companyLogo} alt={a.company_name} className="h-full w-full object-contain p-1" />
                      ) : (
                        <Building2 className="h-5 w-5 text-slate-400" />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <Link href={`/jobs/${jobIdentifier}`} className="text-base font-bold text-brand-dark hover:text-brand-blue">
                          {a.title}
                        </Link>
                        <StatusBadge status={a.status} />
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="font-medium text-slate-700">{a.company_name}</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {a.province_name} ({a.employment_type_name})
                        </span>
                        <span>Dilamar pada {dateID(a.applied_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/jobs/${jobIdentifier}`} className="btn-outline px-3 py-1.5 text-xs">
                      <ExternalLink className="mr-1 h-3.5 w-3.5" /> Detail
                    </Link>
                    {a.status === 'submitted' && (
                      <button onClick={() => handleWithdraw(a.id)} className="btn-danger">
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Batalkan
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <Pagination meta={meta} onPage={(p) => load(p)} />
        </>
      )}
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <RoleGuard roles={['candidate']}>
      <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Memuat...</div>}>
        <ApplicationsContent />
      </Suspense>
    </RoleGuard>
  );
}