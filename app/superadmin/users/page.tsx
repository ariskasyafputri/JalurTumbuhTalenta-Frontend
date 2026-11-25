/**
 * FILE: app/superadmin/users/page.tsx
 * PURPOSE:
 *   Super Admin User Management Page (`/superadmin/users`).
 *   Allows Super Admins to provision new Admin/Company/Candidate accounts, filter users
 *   by name, email, or role, toggle active/inactive account status, and delete users.
 */

'use client';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { api, errMsg, qs } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { roleLabel } from '@/lib/format';
import { ManagedUser, Meta, Role } from '@/lib/types';
import RoleGuard from '@/components/RoleGuard';
import AdminSidebar from '@/components/AdminSidebar';
import Pagination from '@/components/Pagination';

const ROLES: Role[] = ['candidate', 'company', 'admin', 'super_admin'];

function UsersManagementContent() {
  const { user: me } = useAuth();
  const [items, setItems] = useState<ManagedUser[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({ q: '', role: '' });
  const [applied, setApplied] = useState(filter);
  const [show, setShow] = useState(false);
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'admin', companyId: '' });
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const load = useCallback(() => {
    api<{ data: ManagedUser[]; meta: Meta }>('/superadmin/users' + qs({ ...applied, page }))
      .then((r) => {
        setItems(r.data);
        setMeta(r.meta);
      })
      .catch((e) => setError(errMsg(e)));
  }, [applied, page]);
  useEffect(load, [load]);

  async function create(e: FormEvent) {
    e.preventDefault();
    setError('');
    setMsg('');
    try {
      await api('/superadmin/users', {
        method: 'POST',
        body: { ...f, companyId: f.companyId ? Number(f.companyId) : null },
      });
      setMsg('Akun pengguna baru berhasil dibuat.');
      setF({ name: '', email: '', password: '', role: 'admin', companyId: '' });
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  }

  async function toggle(u: ManagedUser) {
    try {
      await api(`/superadmin/users/${u.id}`, {
        method: 'PATCH',
        body: { isActive: !u.is_active },
      });
      load();
    } catch (e) {
      setError(errMsg(e));
    }
  }

  async function remove(u: ManagedUser) {
    if (!confirm(`Hapus permanen akun ${u.email}?`)) return;
    try {
      await api(`/superadmin/users/${u.id}`, { method: 'DELETE' });
      load();
    } catch (e) {
      setError(errMsg(e));
    }
  }

  return (
    <div className="flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-10">
      <AdminSidebar />

      <div className="min-w-0 flex-1 space-y-5">
        <div className="card flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-brand-dark">Kelola Semua User</h1>
            <p className="text-xs text-slate-500">
              Tambah admin baru, atur status aktif akun, atau hapus pengguna
            </p>
          </div>
          <button className="btn" onClick={() => setShow(!show)}>
            <UserPlus className="mr-1.5 h-4 w-4" /> {show ? 'Tutup Form' : 'Tambah User Baru'}
          </button>
        </div>

        {show && (
          <form onSubmit={create} className="card grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input
              className="input"
              placeholder="Nama lengkap"
              required
              value={f.name}
              onChange={(e) => setF({ ...f, name: e.target.value })}
            />
            <input
              className="input"
              type="email"
              placeholder="Alamat email"
              required
              value={f.email}
              onChange={(e) => setF({ ...f, email: e.target.value })}
            />
            <input
              className="input"
              type="password"
              placeholder="Password (min. 8 karakter)"
              required
              minLength={8}
              value={f.password}
              onChange={(e) => setF({ ...f, password: e.target.value })}
            />
            <select
              className="input"
              value={f.role}
              onChange={(e) => setF({ ...f, role: e.target.value })}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {roleLabel[r] ?? r}
                </option>
              ))}
            </select>
            <input
              className="input"
              type="number"
              placeholder="ID Perusahaan (khusus admin/company)"
              value={f.companyId}
              onChange={(e) => setF({ ...f, companyId: e.target.value })}
            />
            <button className="btn">Simpan Akun</button>
          </form>
        )}

        <form
          className="card grid gap-2.5 sm:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setApplied(filter);
          }}
        >
          <input
            className="input sm:col-span-2"
            placeholder="Cari nama atau email..."
            value={filter.q}
            onChange={(e) => setFilter({ ...filter, q: e.target.value })}
          />
          <select
            className="input"
            value={filter.role}
            onChange={(e) => setFilter({ ...filter, role: e.target.value })}
          >
            <option value="">Semua Role</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {roleLabel[r] ?? r}
              </option>
            ))}
          </select>
          <button className="btn-outline">Filter Data</button>
        </form>

        {error && <div className="alert-error">{error}</div>}
        {msg && <div className="alert-ok">{msg}</div>}

        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[720px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="th">Nama</th>
                <th className="th">Email</th>
                <th className="th">Role</th>
                <th className="th">Perusahaan</th>
                <th className="th">Status</th>
                <th className="th text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70">
                  <td className="td font-semibold text-slate-900">{u.name}</td>
                  <td className="td">{u.email}</td>
                  <td className="td">
                    <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-medium text-brand-blue">
                      {roleLabel[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="td text-slate-600">{u.company_name ?? '-'}</td>
                  <td className="td">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {u.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="td">
                    {u.id !== me?.id && (
                      <div className="flex justify-end gap-2">
                        <button
                          className="btn-outline px-3 py-1.5 text-xs"
                          onClick={() => toggle(u)}
                        >
                          {u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <button className="btn-danger" onClick={() => remove(u)}>
                          Hapus
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="td py-12 text-center text-slate-500" colSpan={6}>
                    Tidak ada data pengguna.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination meta={meta} onPage={setPage} />
      </div>
    </div>
  );
}

export default function UsersManagementPage() {
  return (
    <RoleGuard roles={['super_admin']}>
      <UsersManagementContent />
    </RoleGuard>
  );
}
