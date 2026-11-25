/**
 * FILE: lib/format.ts
 * PURPOSE:
 *   Presentation & Localization Helpers for Jalurtumbuh Jobs.
 *   Maps backend enum keys (`full_time`, `applied`, `super_admin`, etc.) to user-friendly
 *   Indonesian labels, badge color classes, formatted dates (`dateID`), and Rupiah salary
 *   ranges (`salary`).
 */

export const typeLabel: Record<string, string> = {
  full_time: 'Penuh Waktu',
  part_time: 'Paruh Waktu',
  contract: 'Kontrak',
  internship: 'Magang',
  freelance: 'Freelance',
};

export const roleLabel: Record<string, string> = {
  candidate: 'Kandidat',
  company: 'Perusahaan',
  admin: 'Admin Rekrutmen',
  super_admin: 'Super Admin',
};

export const statusLabel: Record<string, string> = {
  draft: 'Draft',
  open: 'Dibuka',
  closed: 'Ditutup',
  applied: 'Dilamar',
  reviewed: 'Ditinjau',
  interview: 'Interview',
  offered: 'Ditawari',
  accepted: 'Diterima',
  rejected: 'Ditolak',
};

export const statusColor: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
  open: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed: 'bg-rose-50 text-rose-700 border-rose-200',
  applied: 'bg-blue-50 text-blue-700 border-blue-200',
  reviewed: 'bg-sky-50 text-sky-700 border-sky-200',
  interview: 'bg-amber-50 text-amber-700 border-amber-200',
  offered: 'bg-purple-50 text-purple-700 border-purple-200',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const dateID = (s?: string | null) =>
  s
    ? new Date(s).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '-';

const rp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

export function salary(min: number | null, max: number | null) {
  if (min && max) return `${rp(min)} – ${rp(max)}`;
  if (min) return `Mulai ${rp(min)}`;
  if (max) return `Hingga ${rp(max)}`;
  return 'Gaji kompetitif';
}
