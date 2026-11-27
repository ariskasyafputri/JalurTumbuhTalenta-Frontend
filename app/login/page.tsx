'use client';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, LogIn, User } from 'lucide-react';
import { errMsg } from '@/lib/api';
import { homeFor, useAuth } from '@/lib/auth';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'company' ? 'company' : 'candidate';
  const redirect = searchParams.get('redirect');

  const { login } = useAuth();
  const [tab, setTab] = useState<'candidate' | 'company'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(email, password, 'public');
      if (redirect && user.role === 'candidate') {
        router.push(redirect);
      } else {
        router.push(homeFor(user.role));
      }
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="card">
        {/* TABS KANDIDAT / PERUSAHAAN */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setTab('candidate')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition ${
              tab === 'candidate' ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-600'
            }`}
          >
            <User className="h-4 w-4" /> Login Kandidat
          </button>
          <button
            type="button"
            onClick={() => setTab('company')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition ${
              tab === 'company' ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-600'
            }`}
          >
            <Building2 className="h-4 w-4" /> Login Perusahaan
          </button>
        </div>

        <div className="mt-6">
          <h1 className="text-xl font-extrabold text-brand-dark">
            {tab === 'candidate' ? 'Masuk Sebagai Kandidat' : 'Masuk Akun Perusahaan'}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {tab === 'candidate'
              ? 'Kelola CV, profil, dan pantau status lamaran kerjamu.'
              : 'Kelola profil perusahaan, legalitas, dan lowongan rekrutmen.'}
          </p>
        </div>

        {error && <div className="alert-error mt-4">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="nama@email.com"
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
              placeholder="Minimal 8 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn w-full" disabled={loading}>
            <LogIn className="mr-2 h-4 w-4" />
            {loading ? 'Memproses...' : 'Masuk Sekarang'}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-600">
          {tab === 'candidate' ? (
            <p>
              Belum punya akun kandidat?{' '}
              <Link href="/register" className="font-bold text-brand-blue hover:underline">
                Daftar Kandidat
              </Link>
            </p>
          ) : (
            <p>
              Perusahaan belum terdaftar?{' '}
              <Link href="/register-company" className="font-bold text-brand-blue hover:underline">
                Daftarkan Perusahaan
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Memuat...</div>}>
      <LoginContent />
    </Suspense>
  );
}
