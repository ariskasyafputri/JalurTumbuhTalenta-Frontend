/**
 * FILE: components/Pagination.tsx
 * PURPOSE:
 *   Reusable Pagination component rendering page indicators (`Halaman X dari Y`)
 *   and Previous/Next action buttons whenever a paginated API response exceeds 1 page.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Meta } from '@/lib/types';

export default function Pagination({
  meta,
  onPage,
}: {
  meta: Meta | null;
  onPage: (p: number) => void;
}) {
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
      <span className="text-slate-500">
        Halaman <strong className="text-slate-800">{meta.page}</strong> dari{' '}
        <strong className="text-slate-800">{meta.totalPages}</strong> ({meta.total} data)
      </span>
      <div className="flex items-center gap-2">
        <button
          className="btn-outline px-3 py-1.5"
          disabled={meta.page <= 1}
          onClick={() => onPage(meta.page - 1)}
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Sebelumnya
        </button>
        <button
          className="btn-outline px-3 py-1.5"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPage(meta.page + 1)}
        >
          Berikutnya <ChevronRight className="ml-1 h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
