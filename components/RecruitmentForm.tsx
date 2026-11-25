/**
 * FILE: components/RecruitmentForm.tsx
 * PURPOSE:
 *   Reusable Recruitment Form component used for both creating a new job posting
 *   (`POST /recruitments`) and updating an existing posting (`PATCH /recruitments/:id`).
 *   Automatically loads a company selector dropdown when accessed by a Super Admin.
 */

'use client';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, errMsg } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { typeLabel } from '@/lib/format';
import { Company, Recruitment } from '@/lib/types';

export default function RecruitmentForm({ initial }: { initial?: Recruitment }) {
  const { user } = useAuth();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [f, setF] = useState({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    requirements: initial?.requirements ?? '',
    location: initial?.location ?? '',
    employmentType: initial?.employment_type ?? 'full_time',
    salaryMin: initial?.salary_min?.toString() ?? '',
    salaryMax: initial?.salary_max?.toString() ?? '',
    status: initial?.status ?? 'open',
    deadline: initial?.deadline?.slice(0, 10) ?? '',
    companyId: initial?.company_id?.toString() ?? '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.role === 'super_admin' && !initial) {
      api<{ data: Company[] }>('/companies?limit=100')
        .then((r) => setCompanies(r.data))
        .catch(() => {});
    }
  }, [user, initial]);

  const set =
    (k: keyof typeof f) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setF({ ...f, [k]: e.target.value });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const body: Record<string, unknown> = {
      title: f.title,
      description: f.description,
      requirements: f.requirements || null,
      location: f.location || null,
      employmentType: f.employmentType,
      salaryMin: f.salaryMin ? Number(f.salaryMin) : null,
      salaryMax: f.salaryMax ? Number(f.salaryMax) : null,
      status: f.status,
      deadline: f.deadline || null,
    };
    if (user?.role === 'super_admin' && !initial) {
      body.companyId = Number(f.companyId);
    }

    try {
      if (initial) {
        await api(`/recruitments/${initial.id}`, { method: 'PATCH', body });
      } else {
        await api('/recruitments', { method: 'POST', body });
      }
      router.push('/dashboard');
    } catch (err) {
      setError(errMsg(err));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-5">
      {error && <div className="alert-error">{error}</div>}

      {user?.role === 'super_admin' && !initial && (
        <div>
          <label className="label">Pilih Perusahaan</label>
          {companies.length > 0 ? (
            <select className="input" required value={f.companyId} onChange={set('companyId')}>
              <option value="">-- Pilih perusahaan tujuan --</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.location ? `(${c.location})` : ''}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="input"
              type="number"
              placeholder="Masukkan ID Perusahaan"
              required
              value={f.companyId}
              onChange={set('companyId')}
            />
          )}
        </div>
      )}

      <div>
        <label className="label">Judul Posisi / Lowongan</label>
        <input
          className="input"
          placeholder="Contoh: Junior Fullstack Developer"
          required
          minLength={3}
          value={f.title}
          onChange={set('title')}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="label">Tipe Pekerjaan</label>
          <select className="input" value={f.employmentType} onChange={set('employmentType')}>
            {Object.entries(typeLabel).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Lokasi Penempatan</label>
          <input
            className="input"
            placeholder="Contoh: Jakarta Selatan / Remote"
            value={f.location}
            onChange={set('location')}
          />
        </div>
        <div>
          <label className="label">Status Lowongan</label>
          <select className="input" value={f.status} onChange={set('status')}>
            <option value="open">Dibuka (Tayang ke Kandidat)</option>
            <option value="draft">Draft (Disimpan Sementara)</option>
            <option value="closed">Ditutup</option>
          </select>
        </div>
        <div>
          <label className="label">Gaji Minimum (Rp)</label>
          <input
            className="input"
            type="number"
            min={0}
            placeholder="Contoh: 6000000"
            value={f.salaryMin}
            onChange={set('salaryMin')}
          />
        </div>
        <div>
          <label className="label">Gaji Maksimum (Rp)</label>
          <input
            className="input"
            type="number"
            min={0}
            placeholder="Contoh: 9000000"
            value={f.salaryMax}
            onChange={set('salaryMax')}
          />
        </div>
        <div>
          <label className="label">Batas Akhir Lamaran</label>
          <input className="input" type="date" value={f.deadline} onChange={set('deadline')} />
        </div>
      </div>

      <div>
        <label className="label">Deskripsi Pekerjaan</label>
        <textarea
          className="input"
          rows={4}
          placeholder="Jelaskan tanggung jawab utama posisi ini..."
          required
          minLength={10}
          value={f.description}
          onChange={set('description')}
        />
      </div>

      <div>
        <label className="label">Persyaratan / Kualifikasi</label>
        <textarea
          className="input"
          rows={3}
          placeholder="Contoh: Menguasai React, komunikasi baik, minimal pengalaman 1 tahun..."
          value={f.requirements}
          onChange={set('requirements')}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2">
        <button className="btn" disabled={saving}>
          {saving ? 'Menyimpan...' : 'Simpan Lowongan'}
        </button>
        <button type="button" className="btn-outline" onClick={() => router.back()}>
          Batal
        </button>
      </div>
    </form>
  );
}
