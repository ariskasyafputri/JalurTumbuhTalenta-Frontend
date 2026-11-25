/**
 * FILE: app/register/page.tsx
 * PURPOSE:
 *   Candidate Registration Page (`/register`).
 *   Allows job seekers to create an account using full name, email, and password.
 *   Activates immediately upon submission and redirects directly to the job portal.
 */

'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, TrendingUp, UserPlus } from 'lucide-react';
import { errMsg } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function RegisterCandidatePage() {
  const { registerCandidate } = useAuth();
  const router = useRouter();
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await registerCandidate(f);
      router.push('/');
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-8rem)] w-full lg:grid-cols-12">
      {/* Left Brand Panel */}
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
            Mulai Perjalanan Kariermu Bersama Perusahaan Terbaik
          </h2>
          <p className="text-sm leading-relaxed text-blue-100">
            Buat akun kandidat gratis dalam 30 detik. Langsung aktif tanpa menunggu verifikasi
            email, sehingga kamu bisa langsung melamar posisi impianmu hari ini.
          </p>
          <ul className="space-y-2.5 pt-2 text-sm text-blue-50">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-brand-yellow" />
              Lamar berbagai lowongan cukup dengan link CV &amp; cover letter
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-brand-yellow" />
              Pantau setiap tahap seleksi dari menu Lamaran Saya
            </li>
          </ul>
        </div>

        <p className="text-xs text-blue-200">
          jalurtumbuh.id · Platform Karier &amp; Rekrutmen Indonesia
        </p>
      </div>

      {/* Right Registration Form Panel */}
      <div className="flex items-center justify-center px-4 py-8 sm:px-8 lg:col-span-6 xl:col-span-5">
        <form onSubmit={submit} className="card w-full max-w-md space-y-4">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-light text-brand-blue">
              <UserPlus className="h-5 w-5" />
            </div>
            <h1 className="mt-3 text-2xl font-bold text-brand-dark">Daftar Akun Kandidat</h1>
            <p className="text-xs text-slate-500">Langsung aktif untuk melamar lowongan kerja</p>
          </div>

          {error && <div className="alert-error">{error}</div>}

          <div>
            <label className="label">Nama Lengkap</label>
            <input
              className="input"
              placeholder="Contoh: Budi Santoso"
              required
              minLength={2}
              value={f.name}
              onChange={(e) => setF({ ...f, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Alamat Email</label>
            <input
              className="input"
              type="email"
              placeholder="budi@email.com"
              required
              value={f.email}
              onChange={(e) => setF({ ...f, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Password (Minimal 8 Karakter)</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              required
              minLength={8}
              value={f.password}
              onChange={(e) => setF({ ...f, password: e.target.value })}
            />
          </div>

          <button className="btn w-full" disabled={busy}>
            {busy ? 'Mendaftarkan...' : 'Buat Akun Kandidat'}
          </button>

          <div className="border-t border-slate-100 pt-3 text-center text-xs text-slate-600">
            Ingin membuka lowongan?{' '}
            <Link href="/register-company" className="font-semibold text-brand-blue hover:underline">
              Daftar sebagai Perusahaan
            </Link>
            <br />
            Sudah punya akun?{' '}
            <Link href="/login" className="font-semibold text-brand-blue hover:underline">
              Masuk di sini
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
