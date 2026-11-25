/**
 * FILE: app/login/page.tsx
 * PURPOSE:
 *   Unified Authentication Sign-In Page (`/login`).
 *   Supports all user roles (Candidate, Company, Recruitment Admin, Super Admin)
 *   using email and password authentication without multi-step verification friction,
 *   presented in a responsive full-screen split-panel layout on desktop.
 */

'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, LogIn, TrendingUp } from 'lucide-react';
import { errMsg } from '@/lib/api';
import { homeFor, useAuth } from '@/lib/auth';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const u = await login(email, password);
      router.push(homeFor(u.role));
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-8rem)] w-full lg:grid-cols-12">
      {/* Left Brand Panel (Full height on desktop) */}
      <div className="hidden flex-col justify-between bg-gradient-to-br from-brand-dark via-[#123361] to-brand-blue p-10 text-white lg:col-span-6 lg:flex xl:col-span-7 xl:p-14">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white">
            <TrendingUp className="h-5 w-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            Jalurtumbuh <span className="rounded bg-brand-yellow px-1.5 py-0.5 text-xs text-brand-dark">Jobs</span>
          </span>
        </div>

        <div className="max-w-xl space-y-5">
          <h2 className="text-3xl font-extrabold leading-tight xl:text-4xl">
            Satu Akun untuk Mengelola Karier &amp; Rekrutmen Perusahaan
          </h2>
          <p className="text-sm leading-relaxed text-blue-100">
            Masuk sebagai kandidat untuk melamar pekerjaan dan memantau tahapan seleksi, atau masuk
            sebagai perusahaan/admin untuk mempublikasikan lowongan dan menyaring pelamar terbaik.
          </p>
          <ul className="space-y-2.5 pt-2 text-sm text-blue-50">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-brand-yellow" />
              Akses cepat tanpa proses verifikasi yang berbelit
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-brand-yellow" />
              Pelacakan status lamaran transparan dan real-time
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-brand-yellow" />
              Dashboard rekrutmen terpusat untuk HR &amp; perusahaan
            </li>
          </ul>
        </div>

        <p className="text-xs text-blue-200">
          jalurtumbuh.id · Platform Karier &amp; Rekrutmen Indonesia
        </p>
      </div>

      {/* Right Sign-In Form Panel */}
      <div className="flex items-center justify-center px-4 py-8 sm:px-8 lg:col-span-6 xl:col-span-5">
        <form onSubmit={submit} className="card w-full max-w-md space-y-5">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-light text-brand-blue">
              <LogIn className="h-5 w-5" />
            </div>
            <h1 className="mt-3 text-2xl font-bold text-brand-dark">Masuk ke Jalurtumbuh</h1>
            <p className="text-xs text-slate-500">
              Gunakan email akun kandidat, perusahaan, atau admin
            </p>
          </div>

          {error && <div className="alert-error">{error}</div>}

          <div>
            <label className="label">Alamat Email</label>
            <input
              className="input"
              type="email"
              placeholder="nama@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              placeholder="Masukkan password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="btn w-full" disabled={busy}>
            {busy ? 'Memproses...' : 'Masuk Sekarang'}
          </button>

          <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-600">
            Belum punya akun?{' '}
            <Link href="/register" className="font-semibold text-brand-blue hover:underline">
              Daftar Kandidat
            </Link>{' '}
            atau{' '}
            <Link href="/register-company" className="font-semibold text-brand-blue hover:underline">
              Daftar Perusahaan
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
