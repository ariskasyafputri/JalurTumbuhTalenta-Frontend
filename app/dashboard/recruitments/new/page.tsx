/**
 * FILE: app/dashboard/recruitments/new/page.tsx
 * PURPOSE:
 *   Create Recruitment Page (`/dashboard/recruitments/new`).
 *   Allows Company, Admin, and Super Admin users to publish a new job posting
 *   within the full-width admin workspace layout.
 */

'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import RoleGuard from '@/components/RoleGuard';
import AdminSidebar from '@/components/AdminSidebar';
import RecruitmentForm from '@/components/RecruitmentForm';

export default function NewRecruitmentPage() {
  return (
    <RoleGuard roles={['company', 'admin', 'super_admin']}>
      <div className="flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-10">
        <AdminSidebar />
        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Daftar Rekrutmen
            </Link>
            <h1 className="mt-1 text-xl font-bold text-brand-dark">Buat Rekrutmen Baru</h1>
          </div>
          <RecruitmentForm />
        </div>
      </div>
    </RoleGuard>
  );
}
