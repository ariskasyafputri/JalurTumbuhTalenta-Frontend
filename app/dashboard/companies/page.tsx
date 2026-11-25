/**
 * FILE: app/dashboard/companies/page.tsx
 * PURPOSE:
 *   Company Directory & Search Page (`/dashboard/companies`).
 *   Enables recruitment admins, companies, and Super Admins to search registered partner
 *   companies by name, industry, or location in a responsive multi-column card grid.
 */

"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Building2, MapPin, Search } from "lucide-react";
import { api, errMsg, qs } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Company, Meta } from "@/lib/types";
import RoleGuard from "@/components/RoleGuard";
import AdminSidebar from "@/components/AdminSidebar";
import Pagination from "@/components/Pagination";

function CompaniesContent() {
  const { user } = useAuth();
  const [f, setF] = useState({ q: "", industry: "", location: "" });
  const [applied, setApplied] = useState(f);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Company[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api<{ data: Company[]; meta: Meta }>(
      "/companies" + qs({ ...applied, page }),
    )
      .then((r) => {
        setItems(r.data);
        setMeta(r.meta);
        setError("");
      })
      .catch((e) => setError(errMsg(e)));
  }, [applied, page]);
  useEffect(load, [load]);

  async function remove(id: number) {
    if (!confirm("Hapus perusahaan ini beserta seluruh rekrutmennya?")) return;
    try {
      await api(`/superadmin/companies/${id}`, { method: "DELETE" });
      load();
    } catch (e) {
      setError(errMsg(e));
    }
  }

  return (
    <div className="flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-10">
      <AdminSidebar />

      <div className="min-w-0 flex-1 space-y-5">
        <div className="card space-y-4">
          <div>
            <h1 className="text-xl font-bold text-brand-dark">
              Direktori &amp; Cari Perusahaan
            </h1>
            <p className="text-xs text-slate-500">
              Temukan perusahaan mitra terdaftar berdasarkan nama, bidang
              industri, atau kota
            </p>
          </div>

          <form
            className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setApplied(f);
            }}
          >
            <input
              className="input"
              placeholder="Nama perusahaan..."
              value={f.q}
              onChange={(e) => setF({ ...f, q: e.target.value })}
            />
            <input
              className="input"
              placeholder="Bidang industri..."
              value={f.industry}
              onChange={(e) => setF({ ...f, industry: e.target.value })}
            />
            <input
              className="input"
              placeholder="Lokasi / Kota..."
              value={f.location}
              onChange={(e) => setF({ ...f, location: e.target.value })}
            />
            <button className="btn">
              <Search className="mr-1.5 h-4 w-4" /> Cari Perusahaan
            </button>
          </form>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((c) => (
            <div
              key={c.id}
              className="card flex flex-col justify-between transition hover:border-brand-blue/40"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand-blue">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <Link
                        href={`/dashboard/companies/${c.id}`}
                        className="font-bold text-slate-900 hover:text-brand-blue"
                      >
                        {c.name}
                      </Link>
                      <p className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {[c.industry, c.location].filter(Boolean).join(" · ") ||
                          "Informasi belum lengkap"}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-500">
                    ID #{c.id}
                  </span>
                </div>

                <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-600">
                  {c.description ?? "Belum ada deskripsi perusahaan."}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span className="rounded-full bg-brand-light px-2.5 py-0.5 font-semibold text-brand-blue">
                  {c.open_recruitments ?? 0} lowongan aktif
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/companies/${c.id}`}
                    className="font-semibold text-brand-blue hover:underline"
                  >
                    Detail &rarr;
                  </Link>
                  {user?.role === "super_admin" && (
                    <button className="btn-danger" onClick={() => remove(c.id)}>
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="card py-12 text-center text-sm text-slate-500 sm:col-span-2 xl:col-span-3">
              Perusahaan tidak ditemukan.
            </div>
          )}
        </div>

        <Pagination meta={meta} onPage={setPage} />
      </div>
    </div>
  );
}

export default function CompaniesPage() {
  return (
    <RoleGuard roles={["company", "admin", "super_admin"]}>
      <CompaniesContent />
    </RoleGuard>
  );
}
