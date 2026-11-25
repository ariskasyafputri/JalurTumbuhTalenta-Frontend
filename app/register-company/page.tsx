/**
 * FILE: app/register-company/page.tsx
 * PURPOSE:
 *   Company Registration Page (`/register-company`).
 *   Allows HR / PIC representatives to register their company profile and PIC account
 *   simultaneously using email and password, then redirects to `/dashboard`.
 */

'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, CheckCircle2, TrendingUp } from 'lucide-react';
import { errMsg } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function RegisterCompanyPage() {
  const { registerCompany } = useAuth();
  const router = useRouter();
  const [f, setF] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    industry: '',
    location: '',
    website: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set =
    (k: keyof typeof f) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setF({ ...f, [k]: e.target.value });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const body = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v || undefined]));
    try {
      await registerCompany(body);
      router.push('/dashboard');
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-8rem)] w-full lg:grid-cols-12">
      {/* Left Brand Panel */}
      <div className="hidden flex-col justify-between bg-gradient-to-br from-brand-dark via-[#123361] to-brand-blue p-10 text-white lg:col-span-5 lg:flex xl:p-14">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white">
            <TrendingUp className="h-5 w-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            Jalurtumbuh <span className="rounded bg-brand-yellow px-1.5 py-0.5 text-xs text-brand-dark">Jobs</span>
          </span>
        </div>

        <div className="space-y-5">
          <h2 className="text-3xl font-extrabold leading-tight">
            Rekrut Talenta Terbaik untuk Pertumbuhan Perusahaan Anda
          </h2>
          <p className="text-sm leading-relaxed text-blue-100">
            Daftarkan perusahaan Anda secara gratis dan langsung publikasikan lowongan kerja ke
            ribuan kandidat potensial.
          </p>
          <ul className="space-y-2.5 pt-2 text-sm text-blue-50">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-brand-yellow" />
              Kelola banyak lowongan dan tahapan seleksi dalam satu dashboard
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-brand-yellow" />
              Tambahkan tim admin HR perusahaan dengan mudah
            </li>
          </ul>
        </div>

        <p className="text-xs text-blue-200">
          jalurtumbuh.id · Portal Rekrutmen Perusahaan
        </p>
      </div>

      {/* Right Company Registration Form */}
      <div className="flex items-center justify-center px-4 py-8 sm:px-8 lg:col-span-7">
        <form onSubmit={submit} className="card w-full max-w-3xl space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand-blue">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-brand-dark">Registrasi Akun Perusahaan</h1>
              <p className="text-xs text-slate-500">
                Daftarkan perusahaan Anda untuk mulai mengelola rekrutmen
              </p>
            </div>
          </div>

          {error && <div className="alert-error">{error}</div>}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Nama Lengkap PIC / HR</label>
              <input
                className="input"
                placeholder="Nama penanggung jawab"
                required
                minLength={2}
                value={f.name}
                onChange={set('name')}
              />
            </div>
            <div>
              <label className="label">Email Perusahaan / PIC</label>
              <input
                className="input"
                type="email"
                placeholder="hr@perusahaan.co.id"
                required
                value={f.email}
                onChange={set('email')}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Password Akun (Minimal 8 Karakter)</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                required
                minLength={8}
                value={f.password}
                onChange={set('password')}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Nama Perusahaan</label>
              <input
                className="input"
                placeholder="Contoh: PT Jalur Tumbuh Talenta"
                required
                minLength={2}
                value={f.companyName}
                onChange={set('companyName')}
              />
            </div>
            <div>
              <label className="label">Bidang Industri</label>
              <input
                className="input"
                placeholder="Contoh: Teknologi Informasi / Retail"
                value={f.industry}
                onChange={set('industry')}
              />
            </div>
            <div>
              <label className="label">Kota / Lokasi Kantor</label>
              <input
                className="input"
                placeholder="Contoh: Jakarta Selatan"
                value={f.location}
                onChange={set('location')}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Website Perusahaan (Opsional)</label>
              <input
                className="input"
                type="url"
                placeholder="https://perusahaan.co.id"
                value={f.website}
                onChange={set('website')}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Deskripsi Singkat Perusahaan</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Profil singkat perusahaan Anda..."
                value={f.description}
                onChange={set('description')}
              />
            </div>
          </div>

          <button className="btn w-full" disabled={busy}>
            {busy ? 'Mendaftarkan Perusahaan...' : 'Daftar Perusahaan Sekarang'}
          </button>

          <p className="text-center text-xs text-slate-600">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-semibold text-brand-blue hover:underline">
              Masuk di sini
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
