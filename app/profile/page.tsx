'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Award,
  Briefcase,
  Camera,
  CheckCircle2,
  ExternalLink,
  FileText,
  FolderKanban,
  Globe,
  GraduationCap,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Upload,
  User,
} from 'lucide-react';
import { api, apiUpload, errMsg, FILE_BASE } from '@/lib/api';
import { dateID } from '@/lib/format';
import { FullCandidateData, MasterItem } from '@/lib/types';
import RoleGuard from '@/components/RoleGuard';

interface AdditionalEducation {
  id: string;
  educationLevel: string;
  institution: string;
  major: string;
  graduationYear: string;
}

interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  year: string;
  fileUrl?: string;
  fileName?: string;
  pendingFile?: File | null;
}

interface NewExperienceItem {
  id: string;
  jobTitle: string;
  companyName: string;
  employmentType: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

const createEmptyCert = (): CertificationItem => ({
  id: crypto.randomUUID(),
  name: '',
  issuer: '',
  year: '',
  pendingFile: null,
});

const createEmptyExp = (): NewExperienceItem => ({
  id: crypto.randomUUID(),
  jobTitle: '',
  companyName: '',
  employmentType: 'Fulltime',
  startDate: '',
  endDate: '',
  isCurrent: false,
  description: '',
});

function CandidateProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const [data, setData] = useState<FullCandidateData | null>(null);
  const [provinces, setProvinces] = useState<MasterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [deletingCv, setDeletingCv] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);
  const [deletingPortfolioFile, setDeletingPortfolioFile] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // Foto Profil
  const [photoPath, setPhotoPath] = useState('');

  // 1. Biodata (Wajib / Primary)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [address, setAddress] = useState('');
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');

  // 2. Pendidikan Utama (1 blok wajib) + Pendidikan Tambahan
  const [educationLevel, setEducationLevel] = useState('');
  const [institution, setInstitution] = useState('');
  const [major, setMajor] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [extraEducations, setExtraEducations] = useState<AdditionalEducation[]>([]);

  // 3. Pengalaman Kerja
  const [newExperiences, setNewExperiences] = useState<NewExperienceItem[]>([createEmptyExp()]);

  // 4. Keahlian / Skills (Wajib)
  const [skills, setSkills] = useState('');

  // 5. Sertifikasi & Pelatihan
  const [certList, setCertList] = useState<CertificationItem[]>([createEmptyCert()]);

  // 6. Portfolio (Link + Upload PDF)
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [portfolioFileUrl, setPortfolioFileUrl] = useState('');
  const [portfolioFileName, setPortfolioFileName] = useState('');
  const [pendingPortfolioFile, setPendingPortfolioFile] = useState<File | null>(null);

  // 7. Media Sosial
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [socialMediaUrl, setSocialMediaUrl] = useState('');

  const RequiredStar = () => <span className="ml-0.5 font-bold text-red-600">*</span>;

  const hydrate = (d: FullCandidateData) => {
    setData(d);
    const prof = d.profile as any;

    setPhotoPath(prof.photo_path ?? prof.avatar_url ?? '');
    setName(d.user.name ?? '');
    setPhone(d.profile.phone ?? '');
    setGender(d.profile.gender ?? '');
    setBirthDate(d.profile.birth_date ? String(d.profile.birth_date).slice(0, 10) : '');
    setProvinceId(d.profile.province_id ? String(d.profile.province_id) : '');
    setAddress(d.profile.address ?? '');
    setHeadline(d.profile.headline ?? '');
    setSummary(d.profile.summary ?? '');

    // Pendidikan Primary
    setEducationLevel(d.profile.education_level ?? '');
    setInstitution(d.profile.institution ?? '');
    setMajor(d.profile.major ?? '');
    setGraduationYear(d.profile.graduation_year ?? '');

    // Pendidikan Tambahan
    if (Array.isArray(prof.additional_educations)) {
      setExtraEducations(prof.additional_educations);
    } else if (typeof prof.additional_educations === 'string') {
      try {
        const parsed = JSON.parse(prof.additional_educations);
        setExtraEducations(Array.isArray(parsed) ? parsed : []);
      } catch {
        setExtraEducations([]);
      }
    } else {
      setExtraEducations([]);
    }

    // Sertifikasi
    let loadedCerts: CertificationItem[] = [];
    if (Array.isArray(prof.certification_items)) {
      loadedCerts = prof.certification_items;
    } else if (d.profile.certifications) {
      try {
        const parsed = JSON.parse(d.profile.certifications);
        if (Array.isArray(parsed)) loadedCerts = parsed;
      } catch {
        const lines = d.profile.certifications
          .split('\n')
          .map((l) => l.replace(/^[-•]\s*/, '').trim())
          .filter(Boolean);
        loadedCerts = lines.map((line, idx) => ({
          id: `legacy-${idx}`,
          name: line,
          issuer: '',
          year: '',
        }));
      }
    }
    setCertList(loadedCerts.length > 0 ? loadedCerts : [createEmptyCert()]);

    setSkills(d.profile.skills ?? '');

    // Portfolio (Link & File PDF)
    setPortfolioUrl(d.profile.portfolio_url ?? '');
    const savedPortFile = prof.portfolio_path ?? prof.portfolio_file_url ?? '';
    setPortfolioFileUrl(savedPortFile);
    setPortfolioFileName(prof.portfolio_file_name ?? (savedPortFile ? savedPortFile.split('/').pop() : ''));

    // Media Sosial
    setLinkedinUrl(d.profile.linkedin_url ?? '');
    setSocialMediaUrl(prof.social_media_url ?? '');
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

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    setError('');
    setMsg('');
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const res = await apiUpload<{ data: FullCandidateData; photo_path?: string }>('/candidate/photo', fd);
      if (res.data) hydrate(res.data);
      else if (res.photo_path) setPhotoPath(res.photo_path);
      setMsg('Foto profil berhasil diperbarui!');
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!confirm('Hapus foto profil saat ini?')) return;
    setDeletingPhoto(true);
    setError('');
    setMsg('');
    try {
      const res = await api<{ data?: FullCandidateData }>('/candidate/photo', {
        method: 'DELETE',
      });
      if (res.data) hydrate(res.data);
      else setPhotoPath('');
      setMsg('Foto profil berhasil dihapus!');
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setDeletingPhoto(false);
    }
  };

  // --- REPEATER PENDIDIKAN ---
  const addExtraEducationRow = () => {
    setExtraEducations((prev) => [
      ...prev,
      { id: crypto.randomUUID(), educationLevel: '', institution: '', major: '', graduationYear: '' },
    ]);
  };

  const updateExtraEducationRow = (id: string, field: keyof AdditionalEducation, value: string) => {
    setExtraEducations((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeExtraEducationRow = (id: string) => {
    setExtraEducations((prev) => prev.filter((item) => item.id !== id));
  };

  // --- REPEATER PENGALAMAN KERJA BARU ---
  const addExpRow = () => {
    setNewExperiences((prev) => [...prev, createEmptyExp()]);
  };

  const updateExpRow = (id: string, field: keyof NewExperienceItem, value: any) => {
    setNewExperiences((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeExpRow = (id: string) => {
    setNewExperiences((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : [createEmptyExp()]));
  };

  const handleDeleteSavedExperience = async (expId: number) => {
    try {
      const res = await api<{ data: FullCandidateData }>(`/candidate/experiences/${expId}`, {
        method: 'DELETE',
      });
      hydrate(res.data);
      setMsg('Riwayat pengalaman dihapus.');
    } catch (e) {
      setError(errMsg(e));
    }
  };

  // --- REPEATER SERTIFIKASI ---
  const addCertRow = () => {
    setCertList((prev) => [...prev, createEmptyCert()]);
  };

  const updateCertRow = (id: string, field: keyof CertificationItem, value: any) => {
    setCertList((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeCertRow = (id: string) => {
    setCertList((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : [createEmptyCert()]));
  };

  // Hapus file sertifikat saja (tanpa menghapus data teks sertifikat)
  const handleRemoveCertFile = async (cert: CertificationItem) => {
    if (cert.pendingFile) {
      updateCertRow(cert.id, 'pendingFile', null);
      return;
    }
    if (!cert.fileUrl) return;
    if (!confirm('Hapus file sertifikat ini?')) return;

    try {
      await api('/candidate/certificates/file', {
        method: 'DELETE',
        body: { fileUrl: cert.fileUrl },
      });
    } catch {
      // Tetap bersihkan state di UI jika file fisik sudah tidak ada
    }

    setCertList((prev) =>
      prev.map((item) =>
        item.id === cert.id ? { ...item, fileUrl: undefined, fileName: undefined, pendingFile: null } : item
      )
    );
    setMsg('File sertifikat berhasil dihapus. Klik Simpan Profil untuk memperbarui data.');
  };

  // Hapus file PDF portfolio saja
  const handleRemovePortfolioFile = async () => {
    if (pendingPortfolioFile) {
      setPendingPortfolioFile(null);
      return;
    }
    if (!portfolioFileUrl) return;
    if (!confirm('Hapus file PDF portfolio yang tersimpan?')) return;

    setDeletingPortfolioFile(true);
    setError('');
    setMsg('');
    try {
      const res = await api<{ data?: FullCandidateData }>('/candidate/portfolio', {
        method: 'DELETE',
      });
      if (res.data) {
        hydrate(res.data);
      } else {
        setPortfolioFileUrl('');
        setPortfolioFileName('');
      }
      setMsg('File PDF portfolio berhasil dihapus!');
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setDeletingPortfolioFile(false);
    }
  };

  // --- SIMPAN SEMUA DATA PROFIL ---
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMsg('');

    try {
      // 1. Proses sertifikasi & upload file sertifikat jika ada
      const processedCerts: CertificationItem[] = [];
      for (const cert of certList) {
        if (!cert.name.trim()) continue;
        let fileUrl = cert.fileUrl;
        let fileName = cert.fileName;

        if (cert.pendingFile) {
          const fd = new FormData();
          fd.append('certificate', cert.pendingFile);
          const uploadRes = await apiUpload<{ url?: string; file_path?: string }>('/candidate/certificates/upload', fd);
          fileUrl = uploadRes.url ?? uploadRes.file_path ?? '';
          fileName = cert.pendingFile.name;
        }

        processedCerts.push({
          id: cert.id,
          name: cert.name.trim(),
          issuer: cert.issuer.trim(),
          year: cert.year.trim(),
          fileUrl,
          fileName,
        });
      }

      // 2. Upload file PDF portfolio jika ada yang baru dipilih
      let finalPortfolioFileUrl = portfolioFileUrl;
      let finalPortfolioFileName = portfolioFileName;
      if (pendingPortfolioFile) {
        const fd = new FormData();
        fd.append('portfolio', pendingPortfolioFile);
        const uploadRes = await apiUpload<{ url?: string; file_path?: string; portfolio_path?: string }>(
          '/candidate/portfolio',
          fd
        );
        finalPortfolioFileUrl = uploadRes.url ?? uploadRes.file_path ?? uploadRes.portfolio_path ?? '';
        finalPortfolioFileName = pendingPortfolioFile.name;
      }

      const validExtraEdus = extraEducations.filter((edu) => edu.educationLevel || edu.institution.trim());

      const formattedCertificationsText = processedCerts
        .map((c) => `- ${c.name}${c.issuer ? ` (${c.issuer})` : ''}${c.year ? ` - ${c.year}` : ''}`)
        .join('\n');

      let latestRes = await api<{ data: FullCandidateData }>('/candidate/profile', {
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
          additionalEducations: validExtraEdus,
          certifications: formattedCertificationsText || null,
          certificationItems: processedCerts,
          skills: skills || null,
          portfolioUrl: portfolioUrl || null,
          portfolioPath: finalPortfolioFileUrl || null,
          portfolioFileName: finalPortfolioFileName || null,
          linkedinUrl: linkedinUrl || null,
          socialMediaUrl: socialMediaUrl || null,
        },
      });

      const filledNewExps = newExperiences.filter((exp) => exp.jobTitle.trim() && exp.companyName.trim());
      for (const exp of filledNewExps) {
        if (!exp.startDate) {
          throw new Error(`Tanggal mulai wajib diisi untuk pengalaman "${exp.jobTitle}".`);
        }
        latestRes = await api<{ data: FullCandidateData }>('/candidate/experiences', {
          method: 'POST',
          body: {
            jobTitle: exp.jobTitle.trim(),
            companyName: exp.companyName.trim(),
            employmentType: exp.employmentType,
            startDate: exp.startDate,
            endDate: exp.isCurrent ? null : exp.endDate || null,
            isCurrent: exp.isCurrent,
            description: exp.description.trim() || null,
          },
        });
      }

      hydrate(latestRes.data);
      setPendingPortfolioFile(null);
      setNewExperiences([createEmptyExp()]);
      setMsg('Semua data profil kandidat berhasil disimpan!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (returnTo) {
        setTimeout(() => router.push(returnTo), 800);
      }
    } catch (e) {
      setError(errMsg(e));
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleDeleteCv = async () => {
    if (!confirm('Hapus file CV yang tersimpan?')) return;
    setDeletingCv(true);
    setError('');
    setMsg('');
    try {
      const res = await api<{ data?: FullCandidateData }>('/candidate/cv', {
        method: 'DELETE',
      });
      if (res.data) {
        hydrate(res.data);
      } else if (data) {
        setData({ ...data, profile: { ...data.profile, cv_path: null as any } });
      }
      setMsg('File CV berhasil dihapus!');
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setDeletingCv(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-12 text-center text-sm text-slate-500">Memuat profil...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-10">
      {/* HEADER & PROGRESS BAR CLEAN */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
              Profil & Dokumen Kandidat
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Lengkapi biodata, pendidikan, pengalaman kerja, keahlian, sertifikasi, portfolio, media sosial, dan CV. Kolom bertanda{' '}
              <span className="font-bold text-red-600">*</span> wajib diisi.
            </p>
          </div>

          <div className="w-full shrink-0 rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-2.5 sm:w-52">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-500">Kelengkapan</span>
              <span className="font-bold text-brand-blue">{data?.completion ?? 0}%</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-brand-blue transition-all duration-300"
                style={{ width: `${data?.completion ?? 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {msg && <div className="alert-ok">{msg}</div>}
      {error && <div className="alert-error">{error}</div>}

      {/* FOTO PROFIL & UPLOAD CV */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-brand-blue/20 bg-slate-100">
              {photoPath ? (
                <img
                  src={photoPath.startsWith('http') ? photoPath : `${FILE_BASE}${photoPath}`}
                  alt="Foto Profil"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-slate-400" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-brand-dark">Foto Profil</h2>
              <p className="text-xs text-slate-500">JPG, PNG, atau WEBP (maks. 2MB).</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <label className="btn-outline cursor-pointer text-xs">
              <Camera className="mr-1.5 h-4 w-4" />
              {uploadingPhoto ? 'Mengunggah...' : photoPath ? 'Ubah Foto' : 'Upload Foto'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleUploadPhoto}
                disabled={uploadingPhoto || deletingPhoto}
              />
            </label>

            {photoPath && (
              <button
                type="button"
                onClick={handleDeletePhoto}
                disabled={deletingPhoto || uploadingPhoto}
                className="btn-danger px-2.5 py-2 text-xs"
                title="Hapus Foto Profil"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="card flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="shrink-0 rounded-xl bg-brand-light p-3 text-brand-blue">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-brand-dark">
                Curriculum Vitae (CV) <RequiredStar />
              </h2>
              <p className="text-xs text-slate-500">PDF, DOC, atau DOCX (maks. 5MB).</p>
              {data?.profile.cv_path && (
                <a
                  href={`${FILE_BASE}${data.profile.cv_path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Lihat CV terunggah
                </a>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <label className="btn cursor-pointer text-xs">
              <Upload className="mr-1.5 h-4 w-4" />
              {uploadingCv ? 'Mengunggah...' : data?.profile.cv_path ? 'Ubah CV' : 'Upload CV'}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleUploadCv}
                disabled={uploadingCv || deletingCv}
              />
            </label>

            {data?.profile.cv_path && (
              <button
                type="button"
                onClick={handleDeleteCv}
                disabled={deletingCv || uploadingCv}
                className="btn-danger px-2.5 py-2 text-xs"
                title="Hapus File CV"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FORM PROFIL UTAMA */}
      <form id="candidate-profile-form" onSubmit={handleSaveProfile} className="space-y-6">
        {/* 1. BIODATA */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="h-5 w-5 text-brand-blue" />
            <h2 className="text-base font-bold text-brand-dark">1. Biodata & Ringkasan Diri</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">
                Nama Lengkap <RequiredStar />
              </label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="label">
                No. Handphone / WhatsApp <RequiredStar />
              </label>
              <input
                className="input"
                placeholder="08123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">
                Jenis Kelamin <RequiredStar />
              </label>
              <select className="input" value={gender} onChange={(e) => setGender(e.target.value)} required>
                <option value="">-- Pilih --</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="label">
                Tanggal Lahir <RequiredStar />
              </label>
              <input
                type="date"
                className="input"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">
                Provinsi Domisili <RequiredStar />
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
              <label className="label">
                Headline Profesional <RequiredStar />
              </label>
              <input
                className="input"
                placeholder="Contoh: Fresh Graduate Informatika | Fullstack Web Developer"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">
              Alamat Lengkap <RequiredStar />
            </label>
            <input
              className="input"
              placeholder="Alamat domisili saat ini..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">
              Tentang Saya (Summary) <RequiredStar />
            </label>
            <textarea
              rows={3}
              className="input"
              placeholder="Ceritakan singkat latar belakang, minat karier, dan keunggulanmu..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
            />
          </div>
        </div>

        {/* 2. RIWAYAT PENDIDIKAN */}
        <div className="card space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <GraduationCap className="h-5 w-5 text-brand-blue" />
            <h2 className="text-base font-bold text-brand-dark">2. Riwayat Pendidikan</h2>
          </div>

          {/* BLOK PENDIDIKAN 1 (UTAMA) */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Pendidikan 1 (Utama / Terakhir) <RequiredStar />
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">
                  Jenjang Pendidikan <RequiredStar />
                </label>
                <select
                  className="input"
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  required
                >
                  <option value="">-- Pilih Jenjang --</option>
                  <option value="SMA/SMK">SMA / SMK</option>
                  <option value="D3">Diploma (D3)</option>
                  <option value="D4 / S1">Sarjana (S1 / D4)</option>
                  <option value="S2">Magister (S2)</option>
                  <option value="S3">Doktor (S3)</option>
                </select>
              </div>
              <div>
                <label className="label">
                  Nama Universitas / Sekolah <RequiredStar />
                </label>
                <input
                  className="input"
                  placeholder="Contoh: Universitas Indonesia"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">
                  Jurusan / Program Studi <RequiredStar />
                </label>
                <input
                  className="input"
                  placeholder="Contoh: Teknik Informatika"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">
                  Tahun Lulus <RequiredStar />
                </label>
                <input
                  className="input"
                  placeholder="2026"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* BLOK PENDIDIKAN KE-2, KE-3, DST. */}
          {extraEducations.map((edu, index) => (
            <div key={edu.id} className="space-y-4 border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Pendidikan {index + 2}
                </p>
                <button
                  type="button"
                  onClick={() => removeExtraEducationRow(edu.id)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Hapus
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Jenjang Pendidikan</label>
                  <select
                    className="input"
                    value={edu.educationLevel}
                    onChange={(e) => updateExtraEducationRow(edu.id, 'educationLevel', e.target.value)}
                  >
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
                    placeholder="Contoh: SMA Negeri 1 Cibinong"
                    value={edu.institution}
                    onChange={(e) => updateExtraEducationRow(edu.id, 'institution', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Jurusan / Program Studi</label>
                  <input
                    className="input"
                    placeholder="Contoh: IPA"
                    value={edu.major}
                    onChange={(e) => updateExtraEducationRow(edu.id, 'major', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Tahun Lulus</label>
                  <input
                    className="input"
                    placeholder="2022"
                    value={edu.graduationYear}
                    onChange={(e) => updateExtraEducationRow(edu.id, 'graduationYear', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="pt-1">
            <button type="button" onClick={addExtraEducationRow} className="btn-outline inline-flex items-center gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" /> Tambah Pendidikan Lainnya
            </button>
          </div>
        </div>

        {/* 3. RIWAYAT PENGALAMAN KERJA */}
        <div className="card space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Briefcase className="h-5 w-5 text-brand-blue" />
            <h2 className="text-base font-bold text-brand-dark">
              3. Riwayat Pengalaman Kerja <span className="text-xs font-normal text-slate-400">(Opsional)</span>
            </h2>
          </div>

          {data?.experiences && data.experiences.length > 0 && (
            <div className="space-y-3">
              {data.experiences.map((exp, idx) => (
                <div key={exp.id} className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-slate-400">Pengalaman Tersimpan #{idx + 1}</span>
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
                    onClick={() => handleDeleteSavedExperience(exp.id)}
                    className="btn-danger shrink-0"
                    title="Hapus pengalaman"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {newExperiences.map((exp, index) => (
            <div
              key={exp.id}
              className={`space-y-3 ${index > 0 || (data?.experiences?.length ?? 0) > 0 ? 'border-t border-slate-100 pt-5' : ''}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Pengalaman Kerja {(data?.experiences?.length ?? 0) + index + 1}
                </p>
                {newExperiences.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExpRow(exp.id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Hapus
                  </button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="label">Posisi / Jabatan</label>
                  <input
                    className="input"
                    placeholder="Contoh: Web Developer"
                    value={exp.jobTitle}
                    onChange={(e) => updateExpRow(exp.id, 'jobTitle', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Nama Perusahaan</label>
                  <input
                    className="input"
                    placeholder="Contoh: Jalur Tumbuh Talenta"
                    value={exp.companyName}
                    onChange={(e) => updateExpRow(exp.id, 'companyName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Tipe Pekerjaan</label>
                  <select
                    className="input"
                    value={exp.employmentType}
                    onChange={(e) => updateExpRow(exp.id, 'employmentType', e.target.value)}
                  >
                    <option value="Fulltime">Fulltime</option>
                    <option value="Intern">Intern / Magang</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="label">Tanggal Mulai</label>
                  <input
                    type="date"
                    className="input"
                    value={exp.startDate}
                    onChange={(e) => updateExpRow(exp.id, 'startDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Tanggal Selesai</label>
                  <input
                    type="date"
                    className="input"
                    value={exp.endDate}
                    onChange={(e) => updateExpRow(exp.id, 'endDate', e.target.value)}
                    disabled={exp.isCurrent}
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={exp.isCurrent}
                      onChange={(e) => updateExpRow(exp.id, 'isCurrent', e.target.checked)}
                    />
                    Masih bekerja di sini
                  </label>
                </div>
              </div>

              <div>
                <label className="label">Deskripsi Tugas & Pencapaian</label>
                <textarea
                  rows={2}
                  className="input"
                  placeholder="Deskripsi singkat tugas & pencapaian..."
                  value={exp.description}
                  onChange={(e) => updateExpRow(exp.id, 'description', e.target.value)}
                />
              </div>
            </div>
          ))}

          <div className="pt-1">
            <button type="button" onClick={addExpRow} className="btn-outline inline-flex items-center gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" /> Tambah Pengalaman Lainnya
            </button>
          </div>
        </div>

        {/* 4. KEAHLIAN / SKILLS (WAJIB) */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="h-5 w-5 text-brand-blue" />
            <h2 className="text-base font-bold text-brand-dark">
              4. Keahlian / Skills <RequiredStar />
            </h2>
          </div>

          <div>
            <label className="label">
              Daftar Keahlian <RequiredStar />{' '}
              <span className="text-xs font-normal text-slate-400">(Pisahkan dengan koma)</span>
            </label>
            <input
              className="input"
              placeholder="React.js, TypeScript, Node.js, UI/UX Figma, MySQL"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              required
            />
          </div>
        </div>

        {/* 5. SERTIFIKASI & PELATIHAN */}
        <div className="card space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Award className="h-5 w-5 text-brand-blue" />
            <h2 className="text-base font-bold text-brand-dark">
              5. Sertifikasi & Pelatihan <span className="text-xs font-normal text-slate-400">(Opsional)</span>
            </h2>
          </div>

          {certList.map((cert, index) => (
            <div
              key={cert.id}
              className={`space-y-3 ${index > 0 ? 'border-t border-slate-100 pt-5' : ''}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Sertifikasi {index + 1}
                </p>
                {(certList.length > 1 || cert.name || cert.fileUrl || cert.pendingFile) && (
                  <button
                    type="button"
                    onClick={() => removeCertRow(cert.id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Hapus Sertifikasi
                  </button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="label">Nama Sertifikasi / Pelatihan</label>
                  <input
                    className="input"
                    placeholder="Contoh: Junior Web Programmer"
                    value={cert.name}
                    onChange={(e) => updateCertRow(cert.id, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Lembaga Penerbit</label>
                  <input
                    className="input"
                    placeholder="Contoh: BNSP"
                    value={cert.issuer}
                    onChange={(e) => updateCertRow(cert.id, 'issuer', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Tahun</label>
                  <input
                    className="input"
                    placeholder="Contoh: 2025"
                    value={cert.year}
                    onChange={(e) => updateCertRow(cert.id, 'year', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-600 hover:border-brand-blue">
                  <Upload className="h-3.5 w-3.5 text-brand-blue" />
                  <span>
                    {cert.pendingFile
                      ? cert.pendingFile.name
                      : cert.fileName
                        ? `Terunggah: ${cert.fileName} (Klik untuk ubah)`
                        : 'Upload File Sertifikat (PDF/JPG/PNG - Opsional)'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => updateCertRow(cert.id, 'pendingFile', e.target.files?.[0] ?? null)}
                  />
                </label>

                {cert.fileUrl && !cert.pendingFile && (
                  <a
                    href={cert.fileUrl.startsWith('http') ? cert.fileUrl : `${FILE_BASE}${cert.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Lihat Dokumen
                  </a>
                )}

                {(cert.pendingFile || cert.fileUrl) && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCertFile(cert)}
                    className="btn-danger px-2.5 py-1.5 text-xs"
                    title="Hapus File Sertifikat"
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" /> Hapus File
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="pt-1">
            <button type="button" onClick={addCertRow} className="btn-outline inline-flex items-center gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" /> Tambah Sertifikasi Lainnya
            </button>
          </div>
        </div>

        {/* 6. PORTFOLIO (BISA LINK & UPLOAD PDF) */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FolderKanban className="h-5 w-5 text-brand-blue" />
            <h2 className="text-base font-bold text-brand-dark">
              6. Portfolio <span className="text-xs font-normal text-slate-400">(Opsional)</span>
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Link Website / Portfolio</label>
              <input
                type="url"
                className="input"
                placeholder="https://portfolio-kamu.com"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Upload Dokumen Portfolio (PDF)</label>
              <div className="flex items-center gap-2">
                <label className="inline-flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600 hover:border-brand-blue">
                  <Upload className="h-4 w-4 shrink-0 text-brand-blue" />
                  <span className="truncate">
                    {pendingPortfolioFile
                      ? pendingPortfolioFile.name
                      : portfolioFileName
                        ? `Terunggah: ${portfolioFileName} (Klik untuk ubah)`
                        : 'Pilih File PDF Portfolio (maks. 5MB)'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => setPendingPortfolioFile(e.target.files?.[0] ?? null)}
                    disabled={deletingPortfolioFile}
                  />
                </label>

                {(pendingPortfolioFile || portfolioFileUrl) && (
                  <button
                    type="button"
                    onClick={handleRemovePortfolioFile}
                    disabled={deletingPortfolioFile}
                    className="btn-danger shrink-0 px-2.5 py-2.5 text-xs"
                    title="Hapus File PDF Portfolio"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {portfolioFileUrl && !pendingPortfolioFile && (
                <a
                  href={portfolioFileUrl.startsWith('http') ? portfolioFileUrl : `${FILE_BASE}${portfolioFileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Lihat PDF Portfolio
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 7. MEDIA SOSIAL */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Globe className="h-5 w-5 text-brand-blue" />
            <h2 className="text-base font-bold text-brand-dark">
              7. Media Sosial <span className="text-xs font-normal text-slate-400">(Opsional)</span>
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
            <div>
              <label className="label">Link Sosial Media (Instagram / GitHub / Lainnya)</label>
              <input
                type="url"
                className="input"
                placeholder="https://instagram.com/username atau GitHub"
                value={socialMediaUrl}
                onChange={(e) => setSocialMediaUrl(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* TOMBOL SIMPAN UTAMA */}
        <div className="flex flex-col items-center justify-between gap-3 pt-2 sm:flex-row">
          <p className="text-xs text-slate-500">
            Pastikan seluruh kolom wajib (<span className="font-bold text-red-600">*</span>) sudah terisi dengan benar sebelum menyimpan.
          </p>
          <button
            type="submit"
            className="btn w-full justify-center sm:w-auto"
            disabled={saving}
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Menyimpan...' : returnTo ? 'Simpan & Lanjut ke Lamaran' : 'Simpan Semua Data Profil'}
          </button>
        </div>
      </form>
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