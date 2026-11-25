/**
 * FILE: lib/api.ts
 * PURPOSE:
 *   Centralized REST API HTTP client (`api<T>`) connecting the Next.js frontend to the
 *   Express/Node backend (`NEXT_PUBLIC_API_URL`). Automatically attaches the JWT Bearer
 *   token from `localStorage`, strips empty filter values in `qs()`, and normalizes
 *   server error responses (`ApiError`, `errMsg`).
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: { field: string; message: string }[]
  ) {
    super(message);
  }
}

export async function api<T>(
  path: string,
  opts: { method?: string; body?: unknown } = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(BASE + path, {
    method: opts.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data.message ?? 'Terjadi kesalahan pada server', data.errors);
  }
  return data as T;
}

/** Converts a filter object into a URL query string while ignoring empty/undefined fields */
export function qs(o: Record<string, string | number | undefined>) {
  const p = new URLSearchParams();
  Object.entries(o).forEach(([k, v]) => {
    if (v !== undefined && v !== '') p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : '';
}

/** Extracts a human-readable Indonesian error message from an ApiError or network failure */
export function errMsg(e: unknown) {
  if (e instanceof ApiError) {
    return e.errors?.length
      ? e.errors.map((x) => `${x.field}: ${x.message}`).join(', ')
      : e.message;
  }
  return 'Tidak dapat terhubung ke server backend. Pastikan server backend sudah berjalan.';
}
