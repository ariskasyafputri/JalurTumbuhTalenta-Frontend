'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, Plus, Save } from 'lucide-react';
import { api, errMsg } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { planBadge } from '@/lib/format';
import { Company, MasterItem } from '@/lib/types';
import RoleGuard from '@/components/RoleGuard';

export default function CompanyProfileManagerPage() {
  const { refreshUser } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [provinces, setProvinces] = useState<MasterItem[]>([]);
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [npwp, setNpwp] = useState('');
  const [nib, setNib] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const selectCompany = (c: Company) => {
    setIsCreatingNew(false);
    setActiveCompany(c);
    setName(c.name ?? '');
    setIndustry(c.industry ?? '');
    setNpwp(c.npwp ?? '');
    setNib(c.nib ?? '');
    setProvinceId(c.province_id ? String(c.province_id) : '');
    setDetailAddress(c.detail_address ?? '');
    setPhone(c.phone ?? '');
    setWebsite(c.website ?? '');
    setDescription(c.description ?? '');
  };

  const loadData = async () => {
    const [cRes, pRes] = await Promise.all([
      api<{ data: Company[] }>('/companies/my'),
      api<{ data: MasterItem[] }>('/master/provinces'),
    ]);
    setCompanies(cRes.data);
    setProvinces(pRes.data);
    if (cRes.data.length > 0) {
      selectCompany(cRes.data[0]);
    } else {
      startCreateNew();
    }
  };

  useEffect(() => {
    loadData().catch((e) => setError(errMsg(e)));
  }, []);

  const startCreateNew = () => {
    setIsCreatingNew(true);
    setActiveCompany(null);
    setName('');
    setIndustry('');
    setNpwp('');
    setNib('');
    setProvinceId('');
    setDetailAddress('');
    setPhone('');
    setWebsite('');
    setDescription('');
    setMsg('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setError('');
    try {
      const body = {
        name,
        industry: industry || null,
        npwp: npwp || null,
        nib: nib || null,
        provinceId: provinceId ? Number(provinceId) : null,
        detailAddress: detailAddress || null,
        phone: phone || null,
        website: website || null,
        description: description || null,
      };
      if (isCreatingNew) {
        const res = await api<{ data: Company }>('/companies', { method: 'POST', body });
        await refreshUser();
        await loadData();
        selectCompany(res.data);
        setMsg('Perusahaan baru berhasil ditambahkan & dihubungkan ke akunmu!');
      } else if (activeCompany) {
        const res = await api<{ data: Company }>(`/companies/${activeCompany.id}`, {
          method: 'PATCH',
          body,
        });
        setCompanies((prev) => prev.map((x) => (x.id === res.data.id ? res.data : x)));
        selectCompany(res.data);
        setMsg('Profil & legalitas perusahaan berhasil diperbarui!');
      }
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <RoleGuard roles={['company', 'admin', 'super_admin']}>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-brand-blue">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali ke Dashboard
          </Link>
          <button type="button" onClick={startCreateNew} className="btn-outline text-xs">
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Tambah Perusahaan / Aplikasi Lain
          </button>
        </div>

        {/* LIST PERUSAHAAN TERHUBUNG */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => selectCompany(c)}
              className={`card text-left transition ${
                !isCreatingNew && activeCompany?.id === c.id
                  ? 'border-brand-blue ring-2 ring-brand-blue/20'
                  : 'hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <Building2 className="h-5 w-5 text-brand-blue" />
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${planBadge[c.subscription_plan]}`}>
                  Paket {c.subscription_plan}
                </span>
              </div>
              <p className="mt-2 font-bold text-slate-800">{c.name}</p>
              <p className="text-xs text-slate-500">NPWP: {c.npwp || '-'}</p>
              <p className="text-xs text-slate-500">NIB: {c.nib || '-'}</p>
              <p className="mt-2 text-[11px] font-medium text-brand-blue">
                Kuota Lowongan Aktif: Maks {c.max_active_jobs}
              </p>
            </button>
          ))}
        </div>

        {msg && <div className="alert-ok">{msg}</div>}
        {error && <div className="alert-error">{error}</div>}

        {/* FORM PROFIL & LEGALITAS PERUSAHAAN */}
        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <h1 className="text-xl font-extrabold text-brand-dark">
              {isCreatingNew ? 'Tambah Perusahaan / Aplikasi Baru' : `Profil & Legalitas: ${activeCompany?.name}`}
            </h1>
            <p className="text-xs text-slate-500">
              Lengkapi NPWP, NIB, lokasi provinsi, serta alamat detail kantor perusahaan.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Nama Perusahaan (PT / CV) *</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="label">Bidang Industri</label>
              <input className="input" placeholder="Teknologi Informasi / Konstruksi" value={industry} onChange={(e) => setIndustry(e.target.value)} />
            </div>
            <div>
              <label className="label">NPWP Perusahaan *</label>
              <input
                className="input"
                placeholder="00.000.000.0-000.000"
                value={npwp}
                onChange={(e) => setNpwp(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">NIB (Nomor Induk Berusaha) *</label>
              <input
                className="input"
                placeholder="13 digit NIB"
                value={nib}
                onChange={(e) => setNib(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Provinsi Kantor (Database) *</label>
              <select className="input" value={provinceId} onChange={(e) => setProvinceId(e.target.value)} required>
                <option value="">-- Pilih Provinsi --</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">No. Telepon Kantor</label>
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Alamat Detail Kantor *</label>
            <input
              className="input"
              placeholder="Nama gedung, nomor jalan, kelurahan, kecamatan, kode pos..."
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Website Perusahaan</label>
            <input type="url" className="input" placeholder="https://perusahaan.co.id" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>

          <div>
            <label className="label">Deskripsi Perusahaan</label>
            <textarea rows={3} className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Menyimpan...' : isCreatingNew ? 'Simpan Perusahaan Baru' : 'Simpan Perubahan Profil'}
            </button>
          </div>
        </form>
      </div>
    </RoleGuard>
  );
}
