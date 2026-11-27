'use client';
import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Building2,
  CheckCircle2,
  FileText,
  LogIn,
  Search,
  ShieldCheck,
  Sliders,
  Trash2,
  Users,
} from 'lucide-react';
import { api, errMsg, FILE_BASE, qs } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { dateID, planBadge } from '@/lib/format';
import { Company, Meta } from '@/lib/types';
import Pagination from '@/components/Pagination';
import StatusBadge from '@/components/StatusBadge';

interface CandidateAdminRow {
  id: number;
  name: string;
  email: string;
  is_active: number;
  created_at: string;
  phone: string | null;
  headline: string | null;
  education_level: string | null;
  institution: string | null;
  major: string | null;
  skills: string | null;
  cv_path: string | null;
  province_name: string | null;
  applications: {
    id: number;
    status: string;
    applied_at: string;
    job_title: string;
    company_id: number;
    company_name: string;
  }[];
}

export default function AdminPortalPage() {
  const { user, loading: authLoading, login } = useAuth();

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard state (2 Menu: 'companies' | 'candidates')
  const [activeMenu, setActiveMenu] = useState<'companies' | 'candidates'>('companies');
  const [q, setQ] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [candidates, setCandidates] = useState<CandidateAdminRow[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // Modal edit paket perusahaan
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [plan, setPlan] = useState<'free' | 'pro' | 'enterprise'>('free');
  const [maxJobs, setMaxJobs] = useState(10);
  const [canViewCv, setCanViewCv] = useState(true);
  const [isVerified, setIsVerified] = useState(true);

  const isAuthorized = !!user && (user.role === 'admin' || user.role === 'super_admin');

  const loadData = useCallback(
    async (page = 1) => {
      if (!isAuthorized) return;
      setLoadingData(true);
      setError('');
      try {
        if (activeMenu === 'companies') {
          const res = await api<{ data: Company[]; meta: Meta }>(
            '/admin/companies' + qs({ q: q || undefined, page, limit: 10 })
          );
          setCompanies(res.data);
          setMeta(res.meta);
        } else {
          const res = await api<{ data: CandidateAdminRow[]; meta: Meta }>(
            '/admin/candidates' + qs({ q: q || undefined, page, limit: 10 })
          );
          setCandidates(res.data);
          setMeta(res.meta);
        }
      } catch (e) {
        setError(errMsg(e));
      } finally {
        setLoadingData(false);
      }
    },
    [isAuthorized, activeMenu, q]
  );

  useEffect(() => {
    if (isAuthorized) {
      loadData(1);
    }
  }, [isAuthorized, loadData]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      await login(email, password, 'admin');
    } catch (e) {
      setLoginError(errMsg(e));
    } finally {
      setLoginLoading(false);
    }
  };

  const openCompanyFeatureModal = (c: Company) => {
    setEditingCompany(c);
    setPlan(c.subscription_plan);
    setMaxJobs(c.max_active_jobs);
    setCanViewCv(c.can_view_cv === 1);
    setIsVerified(c.is_verified === 1);
  };

  const saveCompanyFeatures = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;
    try {
      await api(`/admin/companies/${editingCompany.id}`, {
        method: 'PATCH',
        body: {
          subscriptionPlan: plan,
          maxActiveJobs: Number(maxJobs),
          canViewCv,
          isVerified,
        },
      });
      setEditingCompany(null);
      setMsg('Paket & batasan fitur perusahaan berhasil diperbarui!');
      loadData(meta?.page ?? 1);
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const deleteCompany = async (id: number) => {
    if (!confirm('Hapus perusahaan ini secara permanen?')) return;
    try {
      await api(`/admin/companies/${id}`, { method: 'DELETE' });
      setMsg('Perusahaan dihapus.');
      loadData(meta?.page ?? 1);
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const toggleCandidateActive = async (c: CandidateAdminRow) => {
    try {
      await api(`/admin/candidates/${c.id}`, {
        method: 'PATCH',
        body: { isActive: c.is_active !== 1 },
      });
      setMsg('Status akun kandidat diperbarui.');
      loadData(meta?.page ?? 1);
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const deleteCandidate = async (id: number) => {
    if (!confirm('Hapus user kandidat ini beserta seluruh lamarannya?')) return;
    try {
      await api(`/admin/candidates/${id}`, { method: 'DELETE' });
      setMsg('User kandidat dihapus.');
      loadData(meta?.page ?? 1);
    } catch (e) {
      setError(errMsg(e));
    }
  };

  if (authLoading) {
    return <div className="p-12 text-center text-sm text-slate-500">Memuat portal admin...</div>;
  }

  // LANGSUNG TAMPILKAN LOGIN ADMIN JIKA BELUM LOGIN
  if (!isAuthorized) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center bg-slate-100 px-4">
        <div className="card w-full max-w-md">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/images/Logo Jalur Tumbuh.jpeg"
              alt="Logo Jalurtumbuh"
              width={160}
              height={36}
              className="h-9 w-auto object-contain"
            />
            <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand-blue">
              <ShieldCheck className="h-3.5 w-3.5" /> Portal Login Admin
            </span>
            <h1 className="mt-2 text-xl font-extrabold text-brand-dark">Masuk Dashboard Admin</h1>
            <p className="mt-1 text-xs text-slate-500">
              Kelola data perusahaan, paket fitur berbayar, dan pendaftar kandidat.
            </p>
          </div>

          {loginError && <div className="alert-error mt-4">{loginError}</div>}

          <form onSubmit={handleAdminLogin} className="mt-5 space-y-4">
            <div>
              <label className="label">Email Admin</label>
              <input
                type="email"
                className="input"
                placeholder="admin@jalurtumbuh.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn w-full" disabled={loginLoading}>
              <LogIn className="mr-2 h-4 w-4" />
              {loginLoading ? 'Memverifikasi...' : 'Masuk ke Panel Admin'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // DASHBOARD ADMIN (2 MENU: PERUSAHAAN & KANDIDAT)
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:px-10">
      {/* SIDEBAR 2 MENU ADMIN */}
      <aside className="w-full shrink-0 lg:w-64">
        <div className="card space-y-1.5 p-3">
          <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Menu Admin
          </p>
          <button
            onClick={() => {
              setActiveMenu('companies');
              setQ('');
            }}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
              activeMenu === 'companies'
                ? 'bg-brand-blue text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Building2 className="h-4 w-4" /> Data Perusahaan
          </button>
          <button
            onClick={() => {
              setActiveMenu('candidates');
              setQ('');
            }}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
              activeMenu === 'candidates'
                ? 'bg-brand-blue text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Users className="h-4 w-4" /> Data Kandidat
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 space-y-5">
        <div className="card flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-brand-dark">
              {activeMenu === 'companies'
                ? 'Manajemen Data Perusahaan & Paket Fitur'
                : 'Manajemen User Kandidat & Riwayat Lamaran'}
            </h1>
            <p className="text-xs text-slate-500">
              {activeMenu === 'companies'
                ? 'Atur paket berlangganan (Free/Pro/Enterprise), batas kuota lowongan, dan verifikasi perusahaan.'
                : 'Lihat profil pendaftar kandidat beserta perusahaan mana saja yang mereka lamar.'}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              className="input pl-9 text-xs"
              placeholder={activeMenu === 'companies' ? 'Cari perusahaan / NPWP / NIB...' : 'Cari nama / email / skill kandidat...'}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {msg && <div className="alert-ok">{msg}</div>}
        {error && <div className="alert-error">{error}</div>}

        {/* MENU 1: DATA PERUSAHAAN */}
        {activeMenu === 'companies' ? (
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="th">Perusahaan & Legalitas</th>
                    <th className="th">Lokasi & PIC</th>
                    <th className="th">Paket & Kuota Fitur</th>
                    <th className="th">Lowongan</th>
                    <th className="th text-right">CRUD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingData ? (
                    <tr>
                      <td colSpan={5} className="td py-10 text-center text-slate-500">
                        Memuat data perusahaan...
                      </td>
                    </tr>
                  ) : companies.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="td py-10 text-center text-slate-500">
                        Belum ada data perusahaan.
                      </td>
                    </tr>
                  ) : (
                    companies.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70">
                        <td className="td">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800">{c.name}</span>
                            {c.is_verified === 1 && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                          </div>
                          <p className="text-xs text-slate-500">NPWP: {c.npwp || '-'} · NIB: {c.nib || '-'}</p>
                        </td>
                        <td className="td text-xs">
                          <p className="font-medium text-slate-700">{c.province_name || 'Provinsi belum diisi'}</p>
                          <p className="text-slate-500">PIC: {c.pic_emails || '-'}</p>
                        </td>
                        <td className="td">
                          <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase ${planBadge[c.subscription_plan]}`}>
                            {c.subscription_plan}
                          </span>
                          <p className="mt-1 text-xs text-slate-600">
                            Maks Lowongan: <strong>{c.max_active_jobs}</strong> · Akses CV:{' '}
                            <strong>{c.can_view_cv ? 'Buka' : 'Terkunci'}</strong>
                          </p>
                        </td>
                        <td className="td text-xs font-semibold text-slate-700">
                          {c.active_recruitments ?? 0} Aktif / {c.total_recruitments ?? 0} Total
                        </td>
                        <td className="td text-right">
                          <div className="inline-flex gap-1.5">
                            <button
                              onClick={() => openCompanyFeatureModal(c)}
                              className="btn-outline px-2.5 py-1.5 text-xs"
                              title="Atur Paket & Fitur"
                            >
                              <Sliders className="mr-1 h-3.5 w-3.5" /> Atur Paket
                            </button>
                            <button onClick={() => deleteCompany(c.id)} className="btn-danger px-2.5 py-1.5">
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
        ) : (
          /* MENU 2: DATA KANDIDAT & PERUSAHAAN YANG DILAMAR */
          <div className="space-y-4">
            {loadingData ? (
              <div className="card text-center text-sm text-slate-500">Memuat data kandidat...</div>
            ) : candidates.length === 0 ? (
              <div className="card text-center text-sm text-slate-500">Belum ada pendaftar kandidat.</div>
            ) : (
              candidates.map((cand) => (
                <div key={cand.id} className="card space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-brand-dark">{cand.name}</h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            cand.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {cand.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {cand.email} · {cand.phone || 'No HP -'} · {cand.province_name || 'Domisili -'}
                      </p>
                      <p className="mt-1 text-xs text-slate-700">
                        Pendidikan:{' '}
                        <strong>
                          {cand.education_level ? `${cand.education_level} ${cand.institution}` : 'Belum dilengkapi'}
                        </strong>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {cand.cv_path && (
                        <a
                          href={`${FILE_BASE}${cand.cv_path}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-outline px-2.5 py-1.5 text-xs"
                        >
                          <FileText className="mr-1 h-3.5 w-3.5" /> CV
                        </a>
                      )}
                      <button
                        onClick={() => toggleCandidateActive(cand)}
                        className="btn-outline px-2.5 py-1.5 text-xs"
                      >
                        {cand.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                      <button onClick={() => deleteCandidate(cand.id)} className="btn-danger px-2.5 py-1.5">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* DAFTAR PERUSAHAAN YANG DILAMAR KANDIDAT INI */}
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">
                      Perusahaan yang Dilamar ({cand.applications?.length ?? 0})
                    </p>
                    {cand.applications?.length ? (
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {cand.applications.map((app) => (
                          <div
                            key={app.id}
                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                          >
                            <div>
                              <p className="font-bold text-slate-800">{app.company_name}</p>
                              <p className="text-slate-600">
                                {app.job_title} · {dateID(app.applied_at)}
                              </p>
                            </div>
                            <StatusBadge status={app.status} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-slate-500">Kandidat ini belum melamar ke perusahaan mana pun.</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <Pagination meta={meta} onPage={(p) => loadData(p)} />
      </div>

      {/* MODAL ATUR PAKET & BATASAN FITUR PERUSAHAAN */}
      {editingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form onSubmit={saveCompanyFeatures} className="card w-full max-w-md space-y-4">
            <h2 className="text-lg font-extrabold text-brand-dark">
              Atur Paket & Fitur: {editingCompany.name}
            </h2>
            <p className="text-xs text-slate-500">
              Buka atau batasi fitur perusahaan sesuai paket langganan berbayar.
            </p>

            <div>
              <label className="label">Paket Langganan</label>
              <select
                className="input"
                value={plan}
                onChange={(e) => {
                  const val = e.target.value as 'free' | 'pro' | 'enterprise';
                  setPlan(val);
                  if (val === 'free') setMaxJobs(3);
                  if (val === 'pro') setMaxJobs(20);
                  if (val === 'enterprise') setMaxJobs(999);
                }}
              >
                <option value="free">FREE (Umum / Dasar)</option>
                <option value="pro">PRO (Berbayar Menengah)</option>
                <option value="enterprise">ENTERPRISE (Unlimited)</option>
              </select>
            </div>

            <div>
              <label className="label">Batas Maksimal Lowongan Aktif</label>
              <input
                type="number"
                className="input"
                min={0}
                value={maxJobs}
                onChange={(e) => setMaxJobs(Number(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2 pt-1 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={canViewCv} onChange={(e) => setCanViewCv(e.target.checked)} />
                <span>Izinkan Akses Unduh CV Kandidat</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isVerified} onChange={(e) => setIsVerified(e.target.checked)} />
                <span>Status Perusahaan Terverifikasi (Centang Hijau)</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button type="button" className="btn-outline" onClick={() => setEditingCompany(null)}>
                Batal
              </button>
              <button type="submit" className="btn">
                Simpan Pengaturan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
