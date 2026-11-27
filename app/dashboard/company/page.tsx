'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, Camera, Crown, Save } from 'lucide-react';
import { api, apiUpload, errMsg, FILE_BASE } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { planBadge } from '@/lib/format';
import { Company, MasterItem } from '@/lib/types';
import RoleGuard from '@/components/RoleGuard';

export default function CompanyProfileManagerPage() {
  const { refreshUser } = useAuth();
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);
  const [provinces, setProvinces] = useState<MasterItem[]>([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Logo states
  const [logoPath, setLogoPath] = useState('');
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [npwp, setNpwp] = useState('');
  const [nib, setNib] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const RequiredStar = () => <span className="ml-0.5 font-bold text-red-600">*</span>;

  const getLogoSrc = (company: Company | null) => {
    const c = company as any;
    const raw = c?.logo_path || c?.logo_url || c?.logo || '';
    if (!raw) return '';
    return raw.startsWith('http') ? raw : `${FILE_BASE}${raw}`;
  };

  const hydrateCompany = (c: Company) => {
    setIsCreatingNew(false);
    setActiveCompany(c);
    setPendingLogoFile(null);
    setLogoPreviewUrl('');
    setLogoPath(getLogoSrc(c));

    setName(c.name ?? '');
    setIndustry(c.industry ?? '');
    setCompanySize(c.company_size ?? '');
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
    setProvinces(pRes.data);
    if (cRes.data.length > 0) {
      hydrateCompany(cRes.data[0]);
    } else {
      setIsCreatingNew(true);
      setActiveCompany(null);
    }
  };

  useEffect(() => {
    loadData()
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, []);

  const uploadLogoForCompany = async (companyId: number, file: File) => {
    const fd = new FormData();
    fd.append('logo', file);
    return apiUpload<{ data?: Company; logo_path?: string }>(`/companies/${companyId}/logo`, fd);
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setMsg('');

    if (isCreatingNew || !activeCompany) {
      setPendingLogoFile(file);
      setLogoPreviewUrl(URL.createObjectURL(file));
      return;
    }

    setUploadingLogo(true);
    try {
      const res = await uploadLogoForCompany(activeCompany.id, file);
      if (res.data) {
        hydrateCompany(res.data);
      } else if (res.logo_path) {
        setLogoPath(res.logo_path.startsWith('http') ? res.logo_path : `${FILE_BASE}${res.logo_path}`);
      }
      setMsg('Logo perusahaan berhasil diperbarui!');
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setUploadingLogo(false);
    }
  };

  const displayedLogo = logoPreviewUrl || logoPath;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setError('');

    if (!displayedLogo && !pendingLogoFile) {
      setError('Logo perusahaan wajib diunggah terlebih dahulu.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    try {
      const body = {
        name,
        industry: industry || null,
        companySize: companySize || null,
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
        let createdCompany = res.data;

        if (pendingLogoFile && createdCompany?.id) {
          const logoRes = await uploadLogoForCompany(createdCompany.id, pendingLogoFile);
          if (logoRes.data) createdCompany = logoRes.data;
        }

        await refreshUser();
        hydrateCompany(createdCompany);
        setMsg('Profil perusahaan berhasil disimpan & dihubungkan ke akunmu!');
      } else if (activeCompany) {
        const res = await api<{ data: Company }>(`/companies/${activeCompany.id}`, {
          method: 'PATCH',
          body,
        });
        hydrateCompany(res.data);
        setMsg('Profil & legalitas perusahaan berhasil diperbarui!');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setError(errMsg(e));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <RoleGuard roles={['company', 'admin', 'super_admin']}>
        <div className="mx-auto max-w-5xl px-4 py-12 text-center text-sm text-slate-500">Memuat profil perusahaan...</div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard roles={['company', 'admin', 'super_admin']}>
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-10">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-brand-blue"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali ke Dashboard
          </Link>
        </div>

        {msg && <div className="alert-ok">{msg}</div>}
        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="card space-y-6">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
                {isCreatingNew ? 'Lengkapi Profil & Legalitas Perusahaan' : `Profil & Legalitas: ${activeCompany?.name}`}
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Lengkapi logo, skala perusahaan, NPWP, NIB, lokasi provinsi, serta alamat detail kantor. Kolom bertanda{' '}
                <span className="font-bold text-red-600">*</span> wajib diisi.
              </p>
            </div>

            {activeCompany && (
              <div className="flex shrink-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 bg-white text-brand-blue shadow-xs">
                  <Crown className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-slate-500">Status Paket:</span>
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        planBadge[activeCompany.subscription_plan]
                      }`}
                    >
                      {activeCompany.subscription_plan}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-600">
                    Kuota Lowongan Aktif: <span className="font-semibold text-slate-900">{activeCompany.max_active_jobs} lowongan</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* LOGO PERUSAHAAN (WAJIB) */}
          <div
            className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 ${
              !displayedLogo ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200 bg-slate-50/70'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                {displayedLogo ? (
                  <img src={displayedLogo} alt="Logo Perusahaan" className="h-full w-full object-contain p-1.5" />
                ) : (
                  <Building2 className="h-7 w-7 text-slate-400" />
                )}
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Logo Perusahaan <RequiredStar />
                </h2>
                <p className="text-xs text-slate-500">
                  Wajib diunggah. Format PNG, JPG, atau WEBP rasio 1:1 (maks. 2MB).
                </p>
                {pendingLogoFile && (
                  <p className="mt-1 text-[11px] font-medium text-brand-blue">
                    Siap diunggah saat menyimpan: {pendingLogoFile.name}
                  </p>
                )}
              </div>
            </div>

            <label className="btn-outline cursor-pointer text-xs">
              <Camera className="mr-1.5 h-4 w-4" />
              {uploadingLogo ? 'Mengunggah...' : displayedLogo ? 'Ubah Logo' : 'Upload Logo'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleLogoChange}
                disabled={uploadingLogo}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">
                Nama Perusahaan (PT / CV) <RequiredStar />
              </label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="label">Bidang Industri</label>
              <input
                className="input"
                placeholder="Teknologi Informasi / Konstruksi"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Skala Perusahaan (Jumlah Karyawan)</label>
              <input
                list="company-size-options"
                className="input"
                placeholder="Contoh: 50 karyawan atau 11 - 50 karyawan"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
              />
              <datalist id="company-size-options">
                <option value="1 - 10 karyawan" />
                <option value="11 - 50 karyawan" />
                <option value="51 - 200 karyawan" />
                <option value="201 - 500 karyawan" />
                <option value="501 - 1.000 karyawan" />
                <option value="Lebih dari 1.000 karyawan" />
              </datalist>
            </div>
            <div>
              <label className="label">No. Telepon Kantor</label>
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="label">
                NPWP Perusahaan <RequiredStar />
              </label>
              <input
                className="input"
                placeholder="00.000.000.0-000.000"
                value={npwp}
                onChange={(e) => setNpwp(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">
                NIB (Nomor Induk Berusaha) <RequiredStar />
              </label>
              <input
                className="input"
                placeholder="13 digit NIB"
                value={nib}
                onChange={(e) => setNib(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">
                Provinsi Kantor (Database) <RequiredStar />
              </label>
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
              <label className="label">Website Perusahaan</label>
              <input
                type="url"
                className="input"
                placeholder="https://perusahaan.co.id"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">
              Alamat Detail Kantor <RequiredStar />
            </label>
            <input
              className="input"
              placeholder="Nama gedung, nomor jalan, kelurahan, kecamatan, kode pos..."
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Deskripsi Perusahaan</label>
            <textarea
              rows={3}
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="btn" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
            </button>
          </div>
        </form>
      </div>
    </RoleGuard>
  );
}