'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, EyeOff } from 'lucide-react';
import { api, errMsg } from '@/lib/api';
import { Company, MasterItem, Recruitment, RecruitmentStatus } from '@/lib/types';

export default function RecruitmentForm({ initial }: { initial?: Recruitment }) {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<MasterItem[]>([]);
  const [types, setTypes] = useState<MasterItem[]>([]);
  const [provinces, setProvinces] = useState<MasterItem[]>([]);
  const [benefitsList, setBenefitsList] = useState<MasterItem[]>([]);

  const today = new Date().toISOString().slice(0, 10);
  const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

  const [companyId, setCompanyId] = useState<string>(initial ? String(initial.company_id) : '');
  const [categoryId, setCategoryId] = useState<string>(initial ? String(initial.category_id) : '');
  const [employmentTypeId, setEmploymentTypeId] = useState<string>(
    initial ? String(initial.employment_type_id) : ''
  );
  const [provinceId, setProvinceId] = useState<string>(initial ? String(initial.province_id) : '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [detailAddress, setDetailAddress] = useState(initial?.detail_address ?? '');
  const [minExperience, setMinExperience] = useState(initial?.min_experience ?? '');
  const [hideSalary, setHideSalary] = useState<boolean>(Boolean(initial?.hide_salary));
  const [salaryMin, setSalaryMin] = useState(initial?.salary_min ? String(initial.salary_min) : '');
  const [salaryMax, setSalaryMax] = useState(initial?.salary_max ? String(initial.salary_max) : '');
  const [selectedBenefits, setSelectedBenefits] = useState<number[]>(
    initial?.benefits ? initial.benefits.map((b) => b.id) : []
  );
  const [openedAt, setOpenedAt] = useState(initial?.opened_at ? String(initial.opened_at).slice(0, 10) : today);
  const [closedAt, setClosedAt] = useState(initial?.closed_at ? String(initial.closed_at).slice(0, 10) : nextMonth);
  const [status, setStatus] = useState<RecruitmentStatus>(initial?.status ?? 'open');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [requirements, setRequirements] = useState(initial?.requirements ?? '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api<{ data: Company[] }>('/companies/my'),
      api<{
        categories: MasterItem[];
        employmentTypes: MasterItem[];
        provinces: MasterItem[];
        benefits?: MasterItem[];
      }>('/master/all'),
    ])
      .then(([compRes, masterRes]) => {
        setCompanies(compRes.data);
        setCategories(masterRes.categories);
        setTypes(masterRes.employmentTypes);
        setProvinces(masterRes.provinces);
        setBenefitsList(masterRes.benefits ?? []);

        if (!initial) {
          if (compRes.data.length > 0) {
            setCompanyId(String(compRes.data[0].id));
            if (compRes.data[0].province_id) setProvinceId(String(compRes.data[0].province_id));
            if (compRes.data[0].detail_address) setDetailAddress(compRes.data[0].detail_address);
          }
          if (masterRes.categories.length > 0) setCategoryId(String(masterRes.categories[0].id));
          if (masterRes.employmentTypes.length > 0) setEmploymentTypeId(String(masterRes.employmentTypes[0].id));
          if (masterRes.provinces.length > 0 && !compRes.data[0]?.province_id) {
            setProvinceId(String(masterRes.provinces[0].id));
          }
        }
      })
      .catch((e) => setError(errMsg(e)));
  }, [initial]);

  const toggleBenefit = (id: number) => {
    setSelectedBenefits((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        companyId: Number(companyId),
        categoryId: Number(categoryId),
        employmentTypeId: Number(employmentTypeId),
        provinceId: Number(provinceId),
        title,
        detailAddress,
        minExperience: minExperience || null,
        hideSalary,
        salaryMin: hideSalary ? null : salaryMin ? Number(salaryMin) : null,
        salaryMax: hideSalary ? null : salaryMax ? Number(salaryMax) : null,
        benefitIds: selectedBenefits,
        openedAt,
        closedAt,
        status,
        description,
        requirements,
      };
      if (initial) {
        await api(`/recruitments/${encodeURIComponent(initial.slug)}`, { method: 'PATCH', body: payload });
      } else {
        await api('/recruitments', { method: 'POST', body: payload });
      }
      router.push('/dashboard');
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="alert-error">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Perusahaan / Aplikasi Terhubung *</label>
          <select className="input" value={companyId} onChange={(e) => setCompanyId(e.target.value)} required>
            <option value="">-- Pilih Perusahaan --</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.subscription_plan.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Judul Posisi / Lowongan *</label>
          <input
            className="input"
            placeholder="Contoh: Frontend Developer React / Next.js"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="label">Bidang Posisi *</label>
          <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
            <option value="">-- Pilih Bidang --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Tipe Pekerjaan *</label>
          <select
            className="input"
            value={employmentTypeId}
            onChange={(e) => setEmploymentTypeId(e.target.value)}
            required
          >
            <option value="">-- Pilih Tipe --</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Pengalaman Minimal *</label>
          <input
            list="min-exp-options"
            className="input"
            placeholder="Contoh: Fresh Graduate / Min. 1 Tahun"
            value={minExperience}
            onChange={(e) => setMinExperience(e.target.value)}
            required
          />
          <datalist id="min-exp-options">
            <option value="Tanpa Pengalaman / Fresh Graduate" />
            <option value="Minimal 1 Tahun" />
            <option value="Minimal 2 Tahun" />
            <option value="Minimal 3 Tahun" />
            <option value="Minimal 5 Tahun" />
            <option value="Lebih dari 5 Tahun" />
          </datalist>
        </div>

        <div>
          <label className="label">Status Lowongan *</label>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value as RecruitmentStatus)}>
            <option value="open">Dibuka (Publik)</option>
            <option value="draft">Draft</option>
            <option value="closed">Ditutup</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Lokasi Provinsi *</label>
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
          <label className="label">Alamat Detail Penempatan *</label>
          <input
            className="input"
            placeholder="Contoh: Jl. Sudirman Kav. 21, Jakarta Selatan"
            value={detailAddress}
            onChange={(e) => setDetailAddress(e.target.value)}
            required
          />
        </div>
      </div>

      {/* PERIODE & PENGATURAN GAJI */}
      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Periode Lowongan & Informasi Gaji
          </span>
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={hideSalary}
              onChange={(e) => setHideSalary(e.target.checked)}
              className="rounded border-slate-300 text-brand-blue focus:ring-brand-blue"
            />
            <EyeOff className="h-3.5 w-3.5 text-slate-500" />
            Tidak tampilkan gaji di lowongan
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label className="label">Tanggal Dibuka *</label>
            <input type="date" className="input" value={openedAt} onChange={(e) => setOpenedAt(e.target.value)} required />
          </div>
          <div>
            <label className="label">Tanggal Ditutup *</label>
            <input type="date" className="input" value={closedAt} onChange={(e) => setClosedAt(e.target.value)} required />
          </div>
          <div>
            <label className="label">Gaji Minimal (Rp)</label>
            <input
              type="number"
              className="input disabled:bg-slate-100 disabled:text-slate-400"
              placeholder={hideSalary ? 'Disembunyikan' : '5000000'}
              value={hideSalary ? '' : salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              disabled={hideSalary}
            />
          </div>
          <div>
            <label className="label">Gaji Maksimal (Rp)</label>
            <input
              type="number"
              className="input disabled:bg-slate-100 disabled:text-slate-400"
              placeholder={hideSalary ? 'Disembunyikan' : '8000000'}
              value={hideSalary ? '' : salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              disabled={hideSalary}
            />
          </div>
        </div>
      </div>

      {/* BENEFIT LOWONGAN (DARI TABEL MASTER BENEFITS) */}
      {benefitsList.length > 0 && (
        <div className="space-y-2.5">
          <label className="label">
            Benefit & Fasilitas Kerja <span className="text-xs font-normal text-slate-400">(Pilih yang tersedia)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {benefitsList.map((b) => {
              const active = selectedBenefits.includes(b.id);
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => toggleBenefit(b.id)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                    active
                      ? 'border-brand-blue bg-brand-blue text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-brand-blue/50 hover:bg-slate-50'
                  }`}
                >
                  {active && <Check className="h-3.5 w-3.5" />}
                  {b.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <label className="label">Deskripsi Pekerjaan *</label>
        <textarea
          rows={4}
          className="input"
          placeholder="Jelaskan tanggung jawab utama dan lingkup kerja..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="label">Kualifikasi / Persyaratan *</label>
        <textarea
          rows={4}
          className="input"
          placeholder="Tuliskan pendidikan, keahlian teknis, atau pengalaman yang dibutuhkan..."
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          required
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-outline" onClick={() => router.back()}>
          Batal
        </button>
        <button type="submit" className="btn" disabled={saving}>
          {saving ? 'Menyimpan...' : initial ? 'Simpan Perubahan' : 'Publikasikan Lowongan'}
        </button>
      </div>
    </form>
  );
}