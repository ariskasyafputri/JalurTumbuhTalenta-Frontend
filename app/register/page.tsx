'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import { errMsg } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function RegisterCandidatePage() {
  const router = useRouter();
  const { registerCandidate } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await registerCandidate({ name, email, password });
      router.push('/profile');
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="card">
        <h1 className="text-xl font-extrabold text-brand-dark">Daftar Akun Kandidat</h1>
        <p className="mt-1 text-xs text-slate-500">
          Buat akun pencari kerja dan lengkapi profil serta CV kamu.
        </p>

        {error && <div className="alert-error mt-4">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="label">Nama Lengkap *</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label">Email *</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Password (min. 8 karakter) *</label>
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn w-full" disabled={loading}>
            <UserPlus className="mr-2 h-4 w-4" />
            {loading ? 'Mendaftarkan...' : 'Daftar & Lengkapi Profil'}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-600">
          Sudah punya akun?{' '}
          <Link href="/login?tab=candidate" className="font-bold text-brand-blue hover:underline">
            Login Kandidat
          </Link>
        </p>
      </div>
    </div>
  );
}
