'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Award,
  Briefcase,
  CheckCircle2,
  FileText,
  GraduationCap,
  Plus,
  Save,
  Trash2,
  Upload,
  User,
} from 'lucide-react';
import { api, apiUpload, errMsg, FILE_BASE } from '@/lib/api';
import { dateID } from '@/lib/format';
import { FullCandidateData, MasterItem } from '@/lib/types';
import RoleGuard from '@/components/RoleGuard';

function CandidateProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const [data, setData] = useState<FullCandidateData | null>(null);
  const [provinces, setProvinces] = useState<MasterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // Profile fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [address, setAddress] = useState('');
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [institution, setInstitution] = useState('');
  const [major, setMajor] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [certifications, setCertifications] = useState('');
  const [skills, setSkills] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  // Experience form
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [expType, setExpType] = useState('Fulltime');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [expDesc, setExpDesc] = useState('');
  const [addingExp, setAddingExp] = useState(false);

  const hydrate = (d: FullCandidateData) => {
    setData(d);
    setName(d.user.name ?? '');
    setPhone(d.profile.phone ?? '');
    setGender(d.profile.gender ?? '');
    setBirthDate(d.profile.birth_date ? String(d.profile.birth_date).slice(0, 10) : '');
    setProvinceId(d.profile.province_id ? String(d.profile.province_id) : '');
    setAddress(d.profile.address ?? '');
    setHeadline(d.profile.headline ?? '');
    setSummary(d.profile.summary ?? '');
    setEducationLevel(d.profile.education_level ?? '');
    setInstitution(d.profile.institution ?? '');
    setMajor(d.profile.major ?? '');
    setGraduationYear(d.profile.graduation_year ?? '');
    setCertifications(d.profile.certifications ?? '');
    setSkills(d.profile.skills ?? '');
    setPortfolioUrl(d.profile.portfolio_url ?? '');
    setLinkedinUrl(d.profile.linkedin_url ?? '');
  };

  useEffect(() => {
    Promise.all([
      api<{ data: FullCandidateData }>('/candidate/profile'),
      api<{ data: MasterItem[] }>('/master/provinces'),
    ])
      .then(([pRes, provRes]) => {
        hydrate(pRes.data);
        setProvinces(provRes.data);
      })
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMsg('');
    try {
      const res = await api<{ data: FullCandidateData }>('/candidate/profile', {
        method: 'PUT',
        body: {
          name,
          phone: phone || null,
          gender: gender || null,
          birthDate: birthDate || null,
          provinceId: provinceId ? Number(provinceId) : null,
          address: address || null,
          headline: headline || null,
          summary: summary || null,
          educationLevel: educationLevel || null,
          institution: institution || null,
          major: major || null,
          graduationYear: graduationYear || null,
          certifications: certifications || null,
          skills: skills || null,
          portfolioUrl: portfolioUrl || null,
          linkedinUrl: linkedinUrl || null,
        },
      });
      hydrate(res.data);
      setMsg('Profil kandidat berhasil disimpan!');
      if (returnTo) {
        setTimeout(() => router.push(returnTo), 800);
      }
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const handleUploadCv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCv(true);
    setError('');
    setMsg('');
    try {
      const fd = new FormData();
      fd.append('cv', file);
      const res = await apiUpload<{ data: FullCandidateData }>('/candidate/cv', fd);
      hydrate(res.data);
      setMsg('File CV berhasil diunggah!');
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setUploadingCv(false);
    }
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingExp(true);
    setError('');
    try {
      const res = await api<{ data: FullCandidateData }>('/candidate/experiences', {
        method: 'POST',
        body: {
          jobTitle,
          companyName,
          employmentType: expType,
          startDate,
          endDate: isCurrent ? null : endDate || null,
          isCurrent,
          description: expDesc || null,
        },
      });
      hydrate(res.data);
      setJobTitle('');
      setCompanyName('');
      setStartDate('');
      setEndDate('');
      setIsCurrent(false);
      setExpDesc('');
      setMsg('Pengalaman kerja ditambahkan!');
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setAddingExp(false);
    }
  };

  const handleDeleteExperience = async (expId: number) => {
    try {
      const res = await api<{ data: FullCandidateData }>(`/candidate/experiences/${expId}`, {
        method: 'DELETE',
      });
      hydrate(res.data);
    } catch (e) {
      setError(errMsg(e));
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-12 text-center text-sm text-slate-500">Memuat profil...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10 space-y-6">
      {/* COMPLETION BANNER */}
      <div className="card bg-gradient-to-r from-brand-dark to-brand-blue text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold">Profil & Dokumen Kandidat</h1>
            <p className="mt-1 text-xs text-blue-100">
              Lengkapi data diri, pendidikan, pengalaman kerja, sertifikasi, portfolio, dan CV agar dilirik perusahaan.
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-brand-yellow">{data?.completion ?? 0}%</span>
            <p className="text-[11px] uppercase tracking-wider text-blue-100">Kelengkapan Profil</p>
          </div>
        </div>
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full bg-brand-yellow transition-all duration-300"
            style={{ width: `${data?.completion ?? 0}%` }}
          />
        </div>
      </div>

      {msg && <div className="alert-ok">{msg}</div>}
      {error && <div className="alert-error">{error}</div>}

      {/* UPLOAD CV SECTION */}
      <div className="card flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-brand-light p-3 text-brand-blue">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-brand-dark">Curriculum Vitae (CV)</h2>
            <p className="text-xs text-slate-500">Format PDF, DOC, atau DOCX (maksimal 5MB).</p>
            {data?.profile.cv_path && (
              <a
                href={`${FILE_BASE}${data.profile.cv_path}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Lihat CV yang sudah terunggah
              </a>
            )}
          </div>
        </div>

        <label className="btn cursor-pointer">
          <Upload className="mr-2 h-4 w-4" />
          {uploadingCv ? 'Mengunggah...' : data?.profile.cv_path ? 'Ganti File CV' : 'Upload CV'}
          <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleUploadCv} disabled={uploadingCv} />
        </label>
      </div>

      {/* FORM PROFIL UTAMA */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="card space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="h-5 w-5 text-brand-blue" />
            <h2 className="text-base font-bold text-brand-dark">1. Data Diri & Ringkasan</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Nama Lengkap *</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="label">No. Handphone / WhatsApp</label>
              <input className="input" placeholder="08123456789" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="label">Jenis Kelamin</label>
              <select className="input" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">-- Pilih --</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="label">Tanggal Lahir</label>
              <input type="date" className="input" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </div>
            <div>
              <label className="label">Provinsi Domisili</label>
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
              <label className="label">Headline Profesional</label>
              <input
                className="input"
                placeholder="Contoh: Fresh Graduate Informatika | Fullstack Web Developer"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Alamat Lengkap</label>
            <input className="input" placeholder="Alamat domisili saat ini..." value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div>
            <label className="label">Tentang Saya (Summary)</label>
            <textarea
              rows={3}
              className="input"
              placeholder="Ceritakan singkat latar belakang, minat karier, dan keunggulanmu..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>
        </div>

        {/* PENDIDIKAN */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <GraduationCap className="h-5 w-5 text-brand-blue" />
            <h2 className="text-base font-bold text-brand-dark">2. Pendidikan Terakhir</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Jenjang Pendidikan</label>
              <select className="input" value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)}>
                <option value="">-- Pilih Jenjang --</option>
                <option value="SMA/SMK">SMA / SMK</option>
                <option value="D3">Diploma (D3)</option>
                <option value="D4 / S1">Sarjana (S1 / D4)</option>
                <option value="S2">Magister (S2)</option>
                <option value="S3">Doktor (S3)</option>
              </select>
            </div>
            <div>
              <label className="label">Nama Universitas / Sekolah</label>
              <input
                className="input"
                placeholder="Contoh: Universitas Gunadarma"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Jurusan / Program Studi</label>
              <input
                className="input"
                placeholder="Contoh: Teknik Informatika"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Tahun Lulus</label>
              <input
                className="input"
                placeholder="2026"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SERTIFIKASI & PORTFOLIO */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Award className="h-5 w-5 text-brand-blue" />
            <h2 className="text-base font-bold text-brand-dark">3. Sertifikasi, Pelatihan, Keahlian & Portfolio</h2>
          </div>

          <div>
            <label className="label">Keahlian / Skills (pisahkan dengan koma)</label>
            <input
              className="input"
              placeholder="React.js, TypeScript, Node.js, UI/UX Figma, MySQL"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Riwayat Sertifikasi & Pelatihan</label>
            <textarea
              rows={3}
              className="input"
              placeholder="Contoh:&#10;- Sertifikasi BNSP Multimedia (2022)&#10;- Pelatihan React & Backend AI (2025)"
              value={certifications}
              onChange={(e) => setCertifications(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Link Website / Portfolio</label>
              <input
                type="url"
                className="input"
                placeholder="https://portfolio-kamu.netlify.app"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Link LinkedIn</label>
              <input
                type="url"
                className="input"
                placeholder="https://linkedin.com/in/username"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="btn" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Menyimpan...' : returnTo ? 'Simpan & Lanjut ke Lamaran' : 'Simpan Semua Data Profil'}
            </button>
          </div>
        </div>
      </form>

      {/* 4. PENGALAMAN KERJA (TABEL CANDIDATE_EXPERIENCES) */}
      <div className="card space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Briefcase className="h-5 w-5 text-brand-blue" />
          <h2 className="text-base font-bold text-brand-dark">4. Riwayat Pengalaman Kerja</h2>
        </div>

        {/* LIST PENGALAMAN */}
        {data?.experiences.length ? (
          <div className="space-y-3">
            {data.experiences.map((exp) => (
              <div key={exp.id} className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4">
                <div>
                  <h3 className="font-bold text-slate-800">{exp.job_title}</h3>
                  <p className="text-sm font-medium text-brand-blue">
                    {exp.company_name} {exp.employment_type ? `· ${exp.employment_type}` : ''}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {dateID(exp.start_date)} – {exp.is_current ? 'Sekarang' : dateID(exp.end_date)}
                  </p>
                  {exp.description && <p className="mt-2 text-xs text-slate-600">{exp.description}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteExperience(exp.id)}
                  className="btn-danger shrink-0"
                  title="Hapus pengalaman"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">Belum ada pengalaman kerja yang ditambahkan (opsional untuk Fresh Graduate).</p>
        )}

        {/* FORM TAMBAH PENGALAMAN */}
        <form onSubmit={handleAddExperience} className="rounded-xl bg-slate-50 p-4 space-y-3">
          <p className="text-xs font-bold uppercase text-slate-600">Tambah Pengalaman Kerja / Magang</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              className="input"
              placeholder="Posisi / Jabatan *"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
            />
            <input
              className="input"
              placeholder="Nama Perusahaan *"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
            <select className="input" value={expType} onChange={(e) => setExpType(e.target.value)}>
              <option value="Fulltime">Fulltime</option>
              <option value="Intern">Intern / Magang</option>
              <option value="Freelance">Freelance</option>
              <option value="Contract">Contract</option>
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="label">Tanggal Mulai *</label>
              <input type="date" className="input" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div>
              <label className="label">Tanggal Selesai</label>
              <input
                type="date"
                className="input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isCurrent}
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)} />
                Masih bekerja di sini
              </label>
            </div>
          </div>

          <textarea
            rows={2}
            className="input"
            placeholder="Deskripsi singkat tugas & pencapaian..."
            value={expDesc}
            onChange={(e) => setExpDesc(e.target.value)}
          />

          <div className="flex justify-end">
            <button type="submit" className="btn-outline text-xs" disabled={addingExp}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              {addingExp ? 'Menambahkan...' : 'Tambah Pengalaman'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CandidateProfilePage() {
  return (
    <RoleGuard roles={['candidate']}>
      <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Memuat...</div>}>
        <CandidateProfileContent />
      </Suspense>
    </RoleGuard>
  );
}
