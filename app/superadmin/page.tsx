'use client';
import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Building2,
  Crown,
  LogIn,
  Plus,
  Search,
  Shield,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react';
import { api, errMsg, qs } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { roleLabel } from '@/lib/format';
import { Company, ManagedUser, Meta, Role, Stats } from '@/lib/types';
import Pagination from '@/components/Pagination';

export default function SuperAdminPortalPage() {
  const { user, loading: authLoading, login } = useAuth();

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard state
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [q, setQ] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // Form tambah user baru (bisa nambah Admin, Company multi-aplikasi, Candidate, SuperAdmin)
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<Role>('admin');
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<number[]>([]);
  const [creating, setCreating] = useState(false);

  const isAuthorized = !!user && user.role === 'super_admin';

  const loadAll = useCallback(
    async (page = 1) => {
      if (!isAuthorized) return;
      setLoadingData(true);
      setError('');
      try {
        const [sRes, uRes, cRes] = await Promise.all([
          api<{ data: Stats }>('/superadmin/stats'),
          api<{ data: ManagedUser[]; meta: Meta }>(
            '/superadmin/users' +
              qs({
                role: roleFilter || undefined,
                q: q || undefined,
                page,
                limit: 10,
              })
          ),
          api<{ data: Company[] }>('/companies/my'),
        ]);
        setStats(sRes.data);
        setUsers(uRes.data);
        setMeta(uRes.meta);
        setCompanies(cRes.data);
      } catch (e) {
        setError(errMsg(e));
      } finally {
        setLoadingData(false);
      }
    },
    [isAuthorized, roleFilter, q]
  );

  useEffect(() => {
    if (isAuthorized) loadAll(1);
  }, [isAuthorized, loadAll]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      await login(email, password, 'super_admin');
    } catch (e) {
      setLoginError(errMsg(e));
    } finally {
      setLoginLoading(false);
    }
  };

  const toggleCompanySelect = (cid: number) => {
    setSelectedCompanyIds((prev) =>
      prev.includes(cid) ? prev.filter((x) => x !== cid) : [...prev, cid]
    );
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setMsg('');
    try {
      await api('/superadmin/users', {
        method: 'POST',
        body: {
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
          companyIds: newRole === 'company' ? selectedCompanyIds : undefined,
        },
      });
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setSelectedCompanyIds([]);
      setMsg(`User baru (${roleLabel[newRole]}) berhasil dibuat!`);
      loadAll(1);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (u: ManagedUser) => {
    try {
      await api(`/superadmin/users/${u.id}`, {
        method: 'PATCH',
        body: { isActive: u.is_active !== 1 },
      });
      loadAll(meta?.page ?? 1);
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Hapus akun user ini?')) return;
    try {
      await api(`/superadmin/users/${id}`, { method: 'DELETE' });
      setMsg('User berhasil dihapus.');
      loadAll(meta?.page ?? 1);
    } catch (e) {
      setError(errMsg(e));
    }
  };

  if (authLoading) {
    return <div className="p-12 text-center text-sm text-slate-500">Memuat portal super admin...</div>;
  }

  // LANGSUNG FORM LOGIN SUPERADMIN JIKA BELUM LOGIN
  if (!isAuthorized) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center bg-slate-900 px-4">
        <div className="card w-full max-w-md">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/images/Logo Jalur Tumbuh.jpeg"
              alt="Logo Jalurtumbuh"
              width={160}
              height={36}
              className="h-9 w-auto object-contain"
            />
            <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
              <Crown className="h-3.5 w-3.5" /> Portal Super Admin
            </span>
            <h1 className="mt-2 text-xl font-extrabold text-brand-dark">Login Super Admin</h1>
            <p className="mt-1 text-xs text-slate-500">
              Akses penuh untuk menambah user (Admin, Perusahaan Multi-Aplikasi, Kandidat) dan CRUD sistem.
            </p>
          </div>

          {loginError && <div className="alert-error mt-4">{loginError}</div>}

          <form onSubmit={handleLogin} className="mt-5 space-y-4">
            <div>
              <label className="label">Email Super Admin</label>
              <input
                type="email"
                className="input"
                placeholder="superadmin@jalurtumbuh.id"
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
              {loginLoading ? 'Memverifikasi...' : 'Masuk Super Admin'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // DASHBOARD SUPERADMIN
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-dark">Dashboard Super Admin</h1>
          <p className="text-xs text-slate-500">
            Kelola seluruh akun user (Admin, Perusahaan, Kandidat) serta akses CRUD perusahaan & pendaftar.
          </p>
        </div>
        <Link href="/admin" className="btn-outline">
          <Shield className="mr-1.5 h-4 w-4" /> Buka Panel CRUD Perusahaan & Kandidat
        </Link>
      </div>

      {/* RINGKASAN STATISTIK */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card">
            <p className="text-xs font-bold uppercase text-slate-400">Total Kandidat</p>
            <p className="mt-1 text-2xl font-extrabold text-brand-dark">{stats.candidates}</p>
          </div>
          <div className="card">
            <p className="text-xs font-bold uppercase text-slate-400">Akun Perusahaan & Admin</p>
            <p className="mt-1 text-2xl font-extrabold text-brand-blue">
              {stats.company_accounts} <span className="text-sm font-medium text-slate-500">/ {stats.admins} Admin</span>
            </p>
          </div>
          <div className="card">
            <p className="text-xs font-bold uppercase text-slate-400">Perusahaan Terdaftar</p>
            <p className="mt-1 text-2xl font-extrabold text-brand-dark">{stats.companies}</p>
          </div>
          <div className="card">
            <p className="text-xs font-bold uppercase text-slate-400">Lowongan Aktif & Lamaran</p>
            <p className="mt-1 text-2xl font-extrabold text-emerald-600">
              {stats.open_recruitments} <span className="text-sm font-medium text-slate-500">/ {stats.applications} Lamaran</span>
            </p>
          </div>
        </div>
      )}

      {msg && <div className="alert-ok">{msg}</div>}
      {error && <div className="alert-error">{error}</div>}

      {/* FORM TAMBAH USER BARU */}
      <form onSubmit={handleCreateUser} className="card space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <UserCheck className="h-5 w-5 text-brand-blue" />
          <h2 className="text-base font-bold text-brand-dark">Tambah User Baru (Admin / Perusahaan / Kandidat)</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label className="label">Nama Lengkap *</label>
            <input className="input" value={newName} onChange={(e) => setNewName(e.target.value)} required />
          </div>
          <div>
            <label className="label">Email *</label>
            <input type="email" className="input" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Password (min 8) *</label>
            <input type="password" className="input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          <div>
            <label className="label">Role Akun *</label>
            <select className="input" value={newRole} onChange={(e) => setNewRole(e.target.value as Role)}>
              <option value="admin">Admin</option>
              <option value="company">Perusahaan (Multi-Aplikasi)</option>
              <option value="candidate">Kandidat</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
        </div>

        {/* JIKA ROLE COMPANY: PILIH MULTI PERUSAHAAN YANG TERHUBUNG */}
        {newRole === 'company' && companies.length > 0 && (
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-bold uppercase text-slate-500">
              Hubungkan User Perusahaan Ini ke Beberapa Perusahaan / Aplikasi:
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {companies.map((c) => {
                const checked = selectedCompanyIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCompanySelect(c.id)}
                    className={`rounded-lg border px-3 py-1 text-xs font-semibold transition ${
                      checked
                        ? 'border-brand-blue bg-brand-blue text-white'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    {checked ? '✓ ' : '+ '}
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button type="submit" className="btn" disabled={creating}>
            <Plus className="mr-1.5 h-4 w-4" />
            {creating ? 'Membuat User...' : 'Tambah User'}
          </button>
        </div>
      </form>

      {/* DAFTAR SEMUA USER */}
      <div className="card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-brand-dark">Daftar Seluruh User Sistem</h2>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                className="input pl-9 py-1.5 text-xs"
                placeholder="Cari nama / email..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <select
              className="input w-auto py-1.5 text-xs"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">Semua Role</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="company">Perusahaan</option>
              <option value="candidate">Kandidat</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="th">Nama & Email</th>
                <th className="th">Role</th>
                <th className="th">Perusahaan Terhubung</th>
                <th className="th">Status</th>
                <th className="th text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingData ? (
                <tr>
                  <td colSpan={5} className="td py-8 text-center text-slate-500">
                    Memuat data user...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="td">
                      <p className="font-bold text-slate-800">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </td>
                    <td className="td">
                      <span className="rounded-lg bg-brand-light px-2.5 py-1 text-xs font-bold text-brand-blue">
                        {roleLabel[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="td text-xs">
                      {u.companies?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {u.companies.map((c) => (
                            <span
                              key={c.companyId}
                              className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700"
                            >
                              <Building2 className="h-3 w-3" /> {c.companyName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="td">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {u.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="td text-right">
                      {u.id !== user.id && (
                        <div className="inline-flex gap-1.5">
                          <button
                            onClick={() => toggleActive(u)}
                            className="btn-outline px-2.5 py-1 text-xs"
                          >
                            {u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                          <button onClick={() => deleteUser(u.id)} className="btn-danger px-2.5 py-1">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination meta={meta} onPage={(p) => loadAll(p)} />
      </div>
    </div>
  );
}
