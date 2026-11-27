'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import RecruitmentForm from '@/components/RecruitmentForm';
import RoleGuard from '@/components/RoleGuard';

export default function NewRecruitmentPage() {
  return (
    <RoleGuard roles={['company', 'admin', 'super_admin']}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-brand-blue">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali ke Dashboard
        </Link>

        <div className="card mt-4">
          <h1 className="text-xl font-extrabold text-brand-dark">Posting Lowongan Kerja Baru</h1>
          <p className="mb-6 mt-1 text-xs text-slate-500">
            Pilih bidang posisi, tipe pekerjaan, dan provinsi dari master database lalu lengkapi detail lowongan.
          </p>
          <RecruitmentForm />
        </div>
      </div>
    </RoleGuard>
  );
}
