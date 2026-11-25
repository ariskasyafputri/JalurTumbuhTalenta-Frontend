'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Building2, Calendar, MapPin, Search, Sparkles, Wallet } from 'lucide-react';
import { api, errMsg, qs } from '@/lib/api';
import { dateID, salary, typeLabel } from '@/lib/format';
import { Meta, Recruitment } from '@/lib/types';
import Pagination from '@/components/Pagination';

const QUICK_FILTERS = [
  { label: 'Semua Lowongan', type: '' },
  { label: 'Penuh Waktu', type: 'full_time' },
  { label: 'Magang', type: 'internship' },
  { label: 'Kontrak', type: 'contract' },
  { label: 'Freelance', type: 'freelance' },
];

export default function HomePage() {
  const [f, setF] = useState({ q: '', location: '', type: '' });
  const [applied, setApplied] = useState(f);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Recruitment[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api<{ data: Recruitment[]; meta: Meta }>('/recruitments' + qs({ ...applied, page, limit: 12 }))
      .then((r) => {
        setItems(r.data);
        setMeta(r.meta);
        setError('');
      })
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [applied, page]);

  function selectQuickFilter(type: string) {
    const next = { ...f, type };
    setF(next);
    setPage(1);
    setApplied(next);
  }

  return (
    <div className="w-full">
      {/* Full-Bleed Edge-to-Edge Hero Banner */}
      <section className="relative w-full overflow-hidden border-b border-sky-200/80 bg-gradient-to-br from-[#bfe0fb] via-[#d8ecfd] to-[#f4f9ff]">
        {/* Decorative diagonal white wave ribbons matching Jalurtumbuh aesthetic */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/45 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-[38rem] -rotate-12 rounded-full bg-white/60 blur-xl" />
        <svg
          className="pointer-events-none absolute bottom-0 left-0 h-16 w-full text-slate-50 sm:h-24"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,64 C360,128 720,0 1080,64 C1260,96 1380,88 1440,72 L1440,120 L0,120 Z"
          />
        </svg>

        <div className="relative z-10 w-full px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-14 lg:px-10">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            {/* Hero Copy & Search */}
            <div className="lg:col-span-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1 text-xs font-semibold text-brand-blue shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-brand-yellow" />
                Portal Karier &amp; Rekrutmen Terpadu
              </span>

              <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-brand-dark sm:text-4xl lg:text-5xl">
                Temukan Jalur Karier yang{' '}
                <span className="relative inline-block">
                  <span className="relative z-10">Tepat untukmu</span>
                  <span className="absolute bottom-1 left-0 right-0 -z-0 h-3 rounded-sm bg-brand-yellow/90" />
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm text-slate-700 sm:text-base">
                Jelajahi ribuan peluang kerja dari perusahaan terpercaya di seluruh Indonesia dan
                kirim lamaranmu dalam hitungan menit.
              </p>

              {/* Full-Width Responsive Search Bar */}
              <form
                className="mt-7 grid w-full gap-2.5 rounded-2xl border border-white bg-white/95 p-3 shadow-lg backdrop-blur sm:grid-cols-12"
                onSubmit={(e) => {
                  e.preventDefault();
                  setPage(1);
                  setApplied(f);
                }}
              >
                <div className="relative sm:col-span-5">
                  <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    className="input border-0 bg-slate-50 pl-10 focus:bg-white"
                    placeholder="Posisi, skill, atau kata kunci..."
                    value={f.q}
                    onChange={(e) => setF({ ...f, q: e.target.value })}
                  />
                </div>
                <div className="relative sm:col-span-3">
                  <MapPin className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    className="input border-0 bg-slate-50 pl-10 focus:bg-white"
                    placeholder="Kota / lokasi kerja"
                    value={f.location}
                    onChange={(e) => setF({ ...f, location: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <select
                    className="input border-0 bg-slate-50 focus:bg-white"
                    value={f.type}
                    onChange={(e) => setF({ ...f, type: e.target.value })}
                  >
                    <option value="">Semua Tipe</option>
                    {Object.entries(typeLabel).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="btn sm:col-span-2">Cari Lowongan</button>
              </form>

              {/* Quick Filter Pills */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-slate-600">Filter cepat:</span>
                {QUICK_FILTERS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => selectQuickFilter(item.type)}
                    className={`rounded-full px-3.5 py-1.5 font-semibold transition ${
                      applied.type === item.type
                        ? 'bg-brand-blue text-white shadow-sm'
                        : 'bg-white/90 text-slate-700 hover:bg-white hover:text-brand-blue'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Visual Highlight Card on Desktop */}
            <div className="hidden lg:col-span-4 lg:block">
              <div className="rounded-3xl border border-white/80 bg-white/85 p-6 shadow-xl backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-brand-light px-2.5 py-1 text-xs font-bold text-brand-blue">
                    Jalurtumbuh Jobs
                  </span>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </div>
                <h2 className="mt-4 text-lg font-bold text-brand-dark">
                  Karier Impian Dimulai dari Langkah Pertama
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  Pantau status lamaran secara real-time, terhubung langsung dengan HR perusahaan,
                  dan temukan posisi sesuai keahlianmu.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-xs">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-base font-extrabold text-brand-blue">
                      {meta ? meta.total : '100+'}
                    </p>
                    <p className="text-slate-500">Lowongan Aktif</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-base font-extrabold text-brand-dark">Cepat</p>
                    <p className="text-slate-500">Proses Seleksi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full-Width Job Listings Section */}
      <section
        id="daftar-lowongan"
        className="w-full scroll-mt-20 space-y-5 px-4 py-8 sm:px-6 lg:px-10"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-brand-dark">Lowongan Tersedia</h2>
            <p className="text-xs text-slate-500">
              Klik kartu lowongan untuk melihat detail kualifikasi dan mengirim lamaran
            </p>
          </div>
          {meta && (
            <span className="rounded-full bg-brand-light px-3.5 py-1 text-xs font-semibold text-brand-blue">
              {meta.total} posisi dibuka
            </span>
          )}
        </div>

        {error && <div className="alert-error">{error}</div>}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="card h-52 animate-pulse bg-slate-100/80" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="card py-14 text-center">
            <Briefcase className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-2 font-semibold text-slate-700">Belum ada lowongan yang cocok</p>
            <p className="text-xs text-slate-500">
              Coba ubah kata kunci pencarian atau reset filter tipe pekerjaan.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((r) => (
              <Link
                key={r.id}
                href={`/jobs/${r.id}`}
                className="card group flex flex-col justify-between transition hover:-translate-y-0.5 hover:border-brand-blue/50 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand-blue">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-brand-blue">
                      {typeLabel[r.employment_type] ?? r.employment_type}
                    </span>
                  </div>

                  <h3 className="mt-3.5 text-base font-bold text-slate-900 group-hover:text-brand-blue">
                    {r.title}
                  </h3>
                  <p className="text-sm font-medium text-slate-600">{r.company_name}</p>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">
                        {r.location ?? r.company_location ?? 'Lokasi fleksibel'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <Wallet className="h-3.5 w-3.5 shrink-0 text-brand-blue" />
                      <span>{salary(r.salary_min, r.salary_max)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Tutup: {dateID(r.deadline)}
                  </span>
                  <span className="font-semibold text-brand-blue group-hover:underline">
                    Detail &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Pagination meta={meta} onPage={setPage} />
      </section>
    </div>
  );
}