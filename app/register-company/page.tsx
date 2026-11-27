'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';
import { api, errMsg } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { MasterItem } from '@/lib/types';

export default function RegisterCompanyPage() {
  const router = useRouter();
  const { registerCompany } = useAuth();
  const [provinces, setProvinces] = useState<MasterItem[]>([]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [npwp, setNpwp] = useState('');
  const [nib, setNib] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ data: MasterItem[] }>('/master/provinces')
      .then((r) => setProvinces(r.data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await registerCompany({
        name,
        email,
        password,
        companyName,
        industry: industry || undefined,
        npwp: npwp || undefined,
        nib: nib || undefined,
        provinceId: provinceId ? Number(provinceId) : undefined,
        detailAddress: detailAddress || undefined,
        phone: phone || undefined,
        website: website || undefined,
        description: description || undefined,
      });
      router.push('/dashboard');
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="card">
        <h1 className="text-xl font-extrabold text-brand-dark">Pendaftaran Akun Perusahaan</h1>
        <p className="mt-1 text-xs text-slate-500">
          Lengkapi identitas perusahaan beserta NPWP dan NIB untuk mulai membuka lowongan.
        </p>

        {error && <div className="alert-error mt-4">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Nama PIC / HRD *</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="label">Email Login Perusahaan *</label>
              <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Password (min. 8 karakter) *</label>
              <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
              <label className="label">Nama Perusahaan (PT / CV) *</label>
              <input className="input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
            </div>
            <div>
              <label className="label">NPWP Perusahaan</label>
              <input className="input" placeholder="00.000.000.0-000.000" value={npwp} onChange={(e) => setNpwp(e.target.value)} />
            </div>
            <div>
              <label className="label">NIB (Nomor Induk Berusaha)</label>
              <input className="input" placeholder="13 digit NIB" value={nib} onChange={(e) => setNib(e.target.value)} />
            </div>
            <div>
              <label className="label">Bidang Industri</label>
              <input className="input" placeholder="Teknologi / Manufaktur / Jasa" value={industry} onChange={(e) => setIndustry(e.target.value)} />
            </div>
            <div>
              <label className="label">No. Telepon Perusahaan</label>
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="label">Lokasi Provinsi</label>
              <select className="input" value={provinceId} onChange={(e) => setProvinceId(e.target.value)}>
                <option value="">-- Pilih Provinsi --</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Website Perusahaan</label>
              <input type="url" className="input" placeholder="https://perusahaan.co.id" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Alamat Detail Kantor</label>
            <input className="input" placeholder="Nama gedung, jalan, kecamatan..." value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)} />
          </div>

          <div>
            <label className="label">Deskripsi Singkat Perusahaan</label>
            <textarea rows={3} className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <button type="submit" className="btn w-full" disabled={loading}>
            <Building2 className="mr-2 h-4 w-4" />
            {loading ? 'Mendaftarkan...' : 'Daftarkan Perusahaan'}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-600">
          Sudah punya akun perusahaan?{' '}
          <Link href="/login?tab=company" className="font-bold text-brand-blue hover:underline">
            Login Perusahaan
          </Link>
        </p>
      </div>
    </div>
  );
}
