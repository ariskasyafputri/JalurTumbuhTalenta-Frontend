/**
 * FILE: components/StatusBadge.tsx
 * PURPOSE:
 *   Reusable Status Badge component rendering a color-coded pill label for both
 *   recruitment statuses (`open`, `draft`, `closed`) and candidate application stages
 *   (`applied`, `reviewed`, `interview`, `offered`, `accepted`, `rejected`).
 */

import { statusColor, statusLabel } from '@/lib/format';

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        statusColor[status] ?? 'border-slate-200 bg-slate-100 text-slate-600'
      }`}
    >
      {statusLabel[status] ?? status}
    </span>
  );
}
