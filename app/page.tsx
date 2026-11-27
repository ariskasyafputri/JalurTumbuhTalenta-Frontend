"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { api, errMsg, FILE_BASE, qs } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { dateID, salary } from "@/lib/format";
import { Company, MasterItem, Meta, Recruitment } from "@/lib/types";
import Pagination from "@/components/Pagination";

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [jobs, setJobs] = useState<Recruitment[]>([]);
  const [companyLogoMap, setCompanyLogoMap] = useState<Record<string, string>>({});
  const [meta, setMeta] = useState<Meta | null>(null);
  const [categories, setCategories] = useState<MasterItem[]>([]);
  const [types, setTypes] = useState<MasterItem[]>([]);
  const [provinces, setProvinces] = useState<MasterItem[]>([]);

  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [employmentTypeId, setEmploymentTypeId] = useState("");
  const [provinceId, setProvinceId] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{
      categories: MasterItem[];
      employmentTypes: MasterItem[];
      provinces: MasterItem[];
    }>("/master/all")
      .then((m) => {
        setCategories(m.categories);
        setTypes(m.employmentTypes);
        setProvinces(m.provinces);
      })
      .catch(() => {});

    const loadCompanyLogos = async () => {
      const map: Record<string, string> = {};
      const registerCompanies = (list?: Company[]) => {
        if (!Array.isArray(list)) return;
        list.forEach((c: any) => {
          const logo = c.logo_path || c.logoPath || c.logo_url || c.logo || "";
          if (logo) {
            if (c.id) map[`id:${c.id}`] = logo;
            if (c.name) map[`name:${String(c.name).trim().toLowerCase()}`] = logo;
          }
        });
      };

      try {
        const res = await api<{ data: Company[] }>("/companies");
        registerCompanies(res.data);
      } catch {
        // Fallback jika endpoint /companies butuh auth
      }

      if (user) {
        try {
          const myRes = await api<{ data: Company[] }>("/companies/my");
          registerCompanies(myRes.data);
        } catch {
          // Abaikan jika role bukan company
        }
      }

      setCompanyLogoMap(map);
    };

    loadCompanyLogos();
  }, [user]);

  const loadJobs = useCallback(
    async (targetPage = 1) => {
      setLoading(true);
      setError("");
      try {
        const res = await api<{ data: Recruitment[]; meta: Meta }>(
          "/recruitments" +
            qs({
              q,
              categoryId,
              employmentTypeId,
              provinceId,
              page: targetPage,
              limit: 9,
            }),
        );
        setJobs(res.data);
        setMeta(res.meta);
        setPage(targetPage);
      } catch (e) {
        setError(errMsg(e));
      } finally {
        setLoading(false);
      }
    },
    [q, categoryId, employmentTypeId, provinceId],
  );

  useEffect(() => {
    loadJobs(1);
  }, [loadJobs]);

  const handleApplyClick = (job: Recruitment) => {
    const slug = job.slug || String(job.id);
    if (!user) {
      router.push(`/login?tab=candidate&redirect=/jobs/${slug}/apply`);
      return;
    }
    if (user.role === "candidate") {
      router.push(`/jobs/${slug}/apply`);
    } else {
      router.push(`/jobs/${slug}`);
    }
  };

  const selectCategoryAndScroll = (id: string) => {
    setCategoryId(id);
    const el = document.getElementById("daftar-lowongan");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const getCompanyLogoSrc = (job: Recruitment) => {
    const j = job as any;
    const raw =
      j.company_logo_path ||
      j.companyLogoPath ||
      j.company_logo_url ||
      j.company_logo ||
      j.logo_path ||
      j.logoPath ||
      j.logo_url ||
      j.company?.logo_path ||
      j.company?.logoPath ||
      j.company?.logo_url ||
      (j.company_id ? companyLogoMap[`id:${j.company_id}`] : "") ||
      (j.company_name
        ? companyLogoMap[`name:${String(j.company_name).trim().toLowerCase()}`]
        : "") ||
      "";

    if (!raw) return "";
    return raw.startsWith("http") ? raw : `${FILE_BASE}${raw}`;
  };

  return (
    <div className="w-full bg-white text-slate-800">
      {/* 1. HERO SECTION BIRU-PUTIH CERAH */}
      <section className="relative w-full overflow-hidden border-b border-blue-100 bg-gradient-to-br from-[#EFF6FF] via-[#F7FAFF] to-[#DCEBFF] py-12 sm:py-16 lg:py-20">
        <div className="pointer-events-none absolute -left-28 -top-28 h-80 w-80 rounded-full bg-sky-200/45 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-0 h-96 w-96 rounded-full bg-blue-200/45 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            {/* Kolom Kiri: Headline & Search */}
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/90 bg-white/95 px-4 py-1.5 text-xs font-semibold text-brand-blue shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Portal Karier & Rekrutmen Terpadu</span>
              </div>

              <h1 className="mt-5 text-3xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl lg:text-[52px]">
                Temukan Jalur Karier yang{" "}
                <span className="bg-gradient-to-r from-brand-blue to-sky-500 bg-clip-text text-transparent">
                  Tepat untukmu
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Jelajahi ribuan peluang kerja dari perusahaan terpercaya di
                seluruh Indonesia. Lengkapi profil kandidatmu sekali dan kirim
                lamaran dalam hitungan menit.
              </p>

              {/* Kotak Pencarian */}
              <div className="mt-7 rounded-2xl border border-blue-100 bg-white p-3 shadow-xl shadow-blue-900/5 sm:p-3.5">
                <div className="grid gap-2.5 md:grid-cols-12">
                  <div className="relative md:col-span-4">
                    <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-blue-100"
                      placeholder="Posisi, skill, perusahaan..."
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                    />
                  </div>

                  <div className="relative md:col-span-3">
                    <MapPin className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <select
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-blue-100"
                      value={provinceId}
                      onChange={(e) => setProvinceId(e.target.value)}
                    >
                      <option value="">Kota / lokasi kerja</option>
                      {provinces.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <select
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-blue-100"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                    >
                      <option value="">Semua Bidang</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={() => loadJobs(1)}
                      className="btn h-full w-full whitespace-nowrap px-4 py-2.5 text-sm"
                    >
                      Cari Lowongan
                    </button>
                  </div>
                </div>
              </div>

              {/* Filter Cepat Pills */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-500">
                  Filter cepat:
                </span>
                <button
                  type="button"
                  onClick={() => setEmploymentTypeId("")}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    employmentTypeId === ""
                      ? "bg-brand-blue text-white shadow-xs shadow-blue-500/20"
                      : "border border-blue-100 bg-white text-slate-600 hover:border-brand-blue hover:text-brand-blue"
                  }`}
                >
                  Semua Lowongan
                </button>
                {types.map((t) => {
                  const active = String(employmentTypeId) === String(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() =>
                        setEmploymentTypeId(active ? "" : String(t.id))
                      }
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                        active
                          ? "bg-brand-blue text-white shadow-xs shadow-blue-500/20"
                          : "border border-blue-100 bg-white text-slate-600 hover:border-brand-blue hover:text-brand-blue"
                      }`}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Kolom Kanan: Kartu Info Platform */}
            <div className="lg:col-span-4">
              <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-xl shadow-blue-900/5">
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-brand-blue">
                    Jalurtumbuh Jobs
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />{" "}
                    Aktif
                  </span>
                </div>

                <h2 className="mt-4 text-xl font-bold leading-snug text-slate-900">
                  Karier Impian Dimulai dari Langkah Pertama
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Pantau status lamaran secara real-time, terhubung langsung
                  dengan HR perusahaan terverifikasi, dan temukan posisi sesuai
                  keahlianmu.
                </p>

                <div className="mt-5 space-y-2.5 rounded-2xl bg-slate-50/80 p-3.5 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-blue" />
                    <span>Perusahaan terverifikasi resmi</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-blue" />
                    <span>Tracking progres lamaran transparan</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-blue" />
                    <span>1x lengkapi profil & CV untuk semua posisi</span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-2xl font-extrabold text-brand-blue">
                      {meta?.total ?? 0}
                    </p>
                    <p className="text-[11px] font-medium text-slate-400">
                      Lowongan Aktif
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-slate-800">
                      {categories.length || 6}+
                    </p>
                    <p className="text-[11px] font-medium text-slate-400">
                      Bidang Industri
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DAFTAR LOWONGAN TERSEDIA */}
      <section id="daftar-lowongan" className="bg-slate-50/50 py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Lowongan Tersedia
              </h2>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Klik kartu lowongan untuk melihat detail kualifikasi dan
                mengirim lamaran
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {(q || categoryId || employmentTypeId || provinceId) && (
                <button
                  className="btn-outline py-1.5 text-xs"
                  onClick={() => {
                    setQ("");
                    setCategoryId("");
                    setEmploymentTypeId("");
                    setProvinceId("");
                  }}
                >
                  <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" /> Reset
                  Filter
                </button>
              )}
              <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold text-brand-blue">
                {meta?.total ?? 0} posisi dibuka
              </span>
            </div>
          </div>

          {error && <div className="alert-error mb-6">{error}</div>}

          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="card h-64 animate-pulse bg-white" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="card border-blue-100 bg-white py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-brand-blue">
                <Briefcase className="h-7 w-7" />
              </div>
              <p className="mt-4 text-base font-bold text-slate-800">
                Belum ada lowongan yang sesuai filter
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Coba ubah kata kunci pencarian atau reset filter lokasi dan
                bidang pekerjaan.
              </p>
              {(q || categoryId || employmentTypeId || provinceId) && (
                <button
                  onClick={() => {
                    setQ("");
                    setCategoryId("");
                    setEmploymentTypeId("");
                    setProvinceId("");
                  }}
                  className="btn mt-5 text-xs"
                >
                  Reset Semua Filter
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => {
                  const companyLogo = getCompanyLogoSrc(job);
                  const jobSlug = job.slug || String(job.id);
                  return (
                    <div
                      key={job.id}
                      className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-900/5 sm:p-6"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-brand-blue">
                            {job.employment_type_name}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                            <Clock className="h-3 w-3" /> Tutup:{" "}
                            {dateID(job.closed_at)}
                          </span>
                        </div>

                        {/* LOGO PERUSAHAAN + JUDUL LOWONGAN & NAMA PERUSAHAAN */}
                        <div className="mt-4 flex items-start gap-3.5">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200/90 bg-slate-50">
                            {companyLogo ? (
                              <img
                                src={companyLogo}
                                alt={job.company_name}
                                className="h-full w-full object-contain p-1.5"
                              />
                            ) : (
                              <Building2 className="h-5 w-5 text-slate-400" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <Link href={`/jobs/${jobSlug}`} className="block">
                              <h3 className="line-clamp-1 text-base font-bold text-slate-900 transition group-hover:text-brand-blue sm:text-lg">
                                {job.title}
                              </h3>
                            </Link>

                            <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-600 sm:text-sm">
                              <span className="line-clamp-1">
                                {job.company_name}
                              </span>
                              {job.company_verified === 1 && (
                                <span
                                  title="Perusahaan Terverifikasi"
                                  className="inline-flex shrink-0"
                                >
                                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2 border-t border-slate-100 pt-3.5 text-xs text-slate-500">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-3.5 w-3.5 shrink-0 text-brand-blue/70" />
                            <span className="line-clamp-1">
                              {job.category_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-blue/70" />
                            <span>{job.province_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 shrink-0 text-brand-blue/70" />
                            <span>
                              Periode: {dateID(job.opened_at)} –{" "}
                              {dateID(job.closed_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 border-t border-slate-100 pt-4">
                        <div className="flex items-baseline justify-between">
                          <span className="text-[11px] font-medium text-slate-400">
                            Estimasi Gaji
                          </span>
                          <p className="text-sm font-bold text-slate-900">
                            {salary(job.salary_min, job.salary_max)}
                          </p>
                        </div>

                        <div className="mt-3.5 flex gap-2.5">
                          <Link
                            href={`/jobs/${jobSlug}`}
                            className="btn-outline flex-1 text-xs"
                          >
                            Detail
                          </Link>
                          {(!user || user.role === "candidate") && (
                            <button
                              onClick={() => handleApplyClick(job)}
                              className="btn flex-1 text-xs"
                            >
                              <Send className="mr-1.5 h-3.5 w-3.5" /> Lamar Cepat
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8">
                <Pagination meta={meta} onPage={(p) => loadJobs(p)} />
              </div>
            </>
          )}
        </div>
      </section>

      {/* 2. KATEGORI POPULER SECTION */}
      {categories.length > 0 && (
        <section
          id="kategori"
          className="border-b border-slate-100 bg-white py-12"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
                  Eksplorasi Bidang
                </span>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  Kategori Pekerjaan Populer
                </h2>
              </div>
              {categoryId && (
                <button
                  onClick={() => setCategoryId("")}
                  className="text-xs font-semibold text-brand-blue hover:underline"
                >
                  Tampilkan semua kategori
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
              {categories.slice(0, 6).map((cat) => {
                const isSelected = String(categoryId) === String(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      selectCategoryAndScroll(isSelected ? "" : String(cat.id))
                    }
                    className={`group flex flex-col items-start rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-brand-blue bg-blue-50/70 shadow-sm"
                        : "border-slate-200/80 bg-white hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-sm"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                        isSelected
                          ? "bg-brand-blue text-white"
                          : "bg-blue-50 text-brand-blue group-hover:bg-brand-blue group-hover:text-white"
                      }`}
                    >
                      <Layers className="h-5 w-5" />
                    </div>
                    <p className="mt-3.5 line-clamp-1 text-sm font-bold text-slate-800 group-hover:text-brand-blue">
                      {cat.name}
                    </p>
                    <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 group-hover:text-brand-blue">
                      Lihat posisi <ArrowRight className="h-3 w-3" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 4. KEUNGGULAN PLATFORM */}
      <section
        id="keunggulan"
        className="border-t border-slate-100 bg-white py-14 sm:py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <span className="rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold text-brand-blue">
              Mengapa Jalurtumbuh?
            </span>
            <h2 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Proses Rekrutmen Lebih Cepat, Transparan, dan Terarah
            </h2>
            <p className="mt-2.5 text-sm text-slate-500">
              Dirancang untuk mempertemukan talenta terbaik dengan perusahaan
              yang tepat tanpa proses yang berbelit.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-blue-100/80 bg-gradient-to-b from-blue-50/50 to-white p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue text-white shadow-sm shadow-blue-500/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                Perusahaan Terverifikasi
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Setiap perusahaan melalui proses verifikasi admin untuk
                memastikan keaslian lowongan dan keamanan pelamar.
              </p>
            </div>

            <div className="rounded-2xl border border-blue-100/80 bg-gradient-to-b from-blue-50/50 to-white p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue text-white shadow-sm shadow-blue-500/20">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                Lamar dalam Hitungan Menit
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Simpan data diri, riwayat pendidikan, dan CV sekali di
                profilmu, gunakan langsung untuk melamar ke berbagai posisi.
              </p>
            </div>

            <div className="rounded-2xl border border-blue-100/80 bg-gradient-to-b from-blue-50/50 to-white p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue text-white shadow-sm shadow-blue-500/20">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                Status Lamaran Real-Time
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Tidak perlu menebak-nebak, pantau setiap tahap seleksi mulai dari
                review berkas, wawancara, hingga keputusan akhir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA BANNER UNTUK KANDIDAT & PERUSAHAAN */}
      {!user && (
        <section className="bg-white pb-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <div className="relative overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-r from-[#EFF6FF] via-white to-[#E0EEFF] p-8 shadow-sm sm:p-10 lg:flex lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-brand-blue shadow-2xs">
                  <Users className="h-3.5 w-3.5" /> Mulai Langkahmu Sekarang
                </span>
                <h2 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                  Siap Melangkah ke Jenjang Karier Berikutnya?
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Buat akun kandidat gratis sekarang atau daftarkan perusahaanmu
                  untuk mulai menjangkau ribuan talenta potensial.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 lg:mt-0 lg:shrink-0">
                <Link href="/register" className="btn px-6 py-3 text-sm">
                  Daftar Sebagai Kandidat
                </Link>
                <Link
                  href="/register-company"
                  className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-white px-5 py-3 text-sm font-semibold text-brand-blue transition hover:bg-blue-50"
                >
                  <Building2 className="mr-2 h-4 w-4" /> Daftarkan Perusahaan
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}