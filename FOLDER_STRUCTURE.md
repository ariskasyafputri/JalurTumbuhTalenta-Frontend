# Jalurtumbuh Jobs — Frontend Folder Structure & File Guide

All folder and file names use clean, standard **English** conventions while the user-facing UI remains in clear, natural **Bahasa Indonesia**.

---

## 1. Root Configuration Files
- `package.json`: Lists project dependencies (`next`, `react`, `tailwindcss`, `lucide-react`, `typescript`) and npm scripts (`dev`, `build`, `start`).
- `tsconfig.json`: Configures TypeScript strict mode and the `@/*` path alias pointing to the project root.
- `tailwind.config.ts`: Defines custom brand colors (`brand-blue`, `brand-dark`, `brand-light`, `brand-yellow`) and scans `app/` and `components/`.
- `postcss.config.js`: Integrates Tailwind CSS and Autoprefixer into the CSS build pipeline.
- `next.config.ts`: Main Next.js application configuration.
- `.env.example`: Environment variable template (`NEXT_PUBLIC_API_URL=http://localhost:4000/api`).

---

## 2. `app/` Directory (Next.js App Router Pages)
In Next.js App Router, every folder inside `app/` maps directly to a browser URL route:

- `app/globals.css`: Global Tailwind CSS layers, custom button styles (`.btn`, `.btn-outline`, `.btn-danger`), form inputs (`.input`, `.label`), surface cards (`.card`), alert banners, and responsive table helpers.
- `app/layout.tsx`: Root HTML/Body layout wrapper (`w-full min-h-screen flex flex-col`) that mounts `AuthProvider`, the full-width sticky `Navbar`, full-viewport page `<main>`, and the full-width `Footer`.
- `app/page.tsx` (`/`): **Public Job Portal & Landing Page**. Features the full-width diagonal sky-blue hero banner with white wave curves, search bar (keyword, location, job type), quick-filter pills, and a responsive 1/2/3/4-column job card grid.
- `app/login/page.tsx` (`/login`): **Unified Sign-In Page** for Candidates, Companies, Recruiters/Admins, and Super Admins using email and password (no email verification friction).
- `app/register/page.tsx` (`/register`): **Candidate Registration Page** using full name, email, and password; immediately activates the account and redirects to the job board.
- `app/register-company/page.tsx` (`/register-company`): **Company Registration Page** allowing company PIC/HR representatives to create a company profile and admin account in one step.
- `app/jobs/[id]/page.tsx` (`/jobs/[id]`): **Job Detail & Application Page**. Displays full job description, requirements, salary range, deadline, company info, and an interactive application form (CV link + cover letter) for logged-in candidates.
- `app/applications/page.tsx` (`/applications`): **Candidate Application History Page**. Lets candidates monitor application progress (`Dilamar`, `Ditinjau`, `Interview`, `Ditawari`, `Diterima`, `Ditolak`) or withdraw pending applications.
- `app/dashboard/page.tsx` (`/dashboard`): **Recruitment Management Dashboard** (Company, Admin, Super Admin). Full-width workspace with left `AdminSidebar`, status filter, quick KPI summary, and responsive table of recruitments with actions to manage applicants, edit, or delete.
- `app/dashboard/recruitments/new/page.tsx` (`/dashboard/recruitments/new`): **Create Recruitment Page** wrapping `RecruitmentForm` inside the admin workspace layout.
- `app/dashboard/recruitments/[id]/page.tsx` (`/dashboard/recruitments/[id]`): **Single-Recruitment Management Workspace** combining two tabs in one clean page: **Daftar Pelamar** (view CVs/cover letters and update candidate status inline) and **Edit Lowongan** (modify job details).
- `app/dashboard/companies/page.tsx` (`/dashboard/companies`): **Company Directory & Search Page** allowing admins/companies/super admins to search registered companies by name, industry, or city.
- `app/dashboard/companies/[id]/page.tsx` (`/dashboard/companies/[id]`): **Company Detail & Company Admin Management Page** showing company profile details and allowing company owners or Super Admins to add recruitment admin accounts.
- `app/superadmin/page.tsx` (`/superadmin`): **Super Admin System Overview Dashboard** displaying global platform metrics (candidates, companies, admins, open jobs, total recruitments, total applications) and quick navigation actions.
- `app/superadmin/users/page.tsx` (`/superadmin/users`): **Super Admin User Management Page** to create new Admin/User accounts, filter by role or keyword, activate/deactivate accounts, and delete users.

---

## 3. `components/` Directory (Reusable UI Components)
- `components/Navbar.tsx`: Full-width sticky top navigation bar with the Jalurtumbuh Jobs logo, role-based navigation links, active user badge, logout button, and responsive mobile drawer/strip menu.
- `components/AdminSidebar.tsx`: Responsive workspace sidebar for Company, Admin, and Super Admin panels (horizontal pill bar on mobile/tablet, sticky left rail on desktop `lg+`).
- `components/RecruitmentForm.tsx`: Shared form component used for both creating and editing job postings, including company selector for Super Admins, job type dropdown, salary range, deadline, description, and requirements.
- `components/StatusBadge.tsx`: Color-coded status pill badge for recruitment states (`open`, `draft`, `closed`) and candidate application stages (`applied`, `reviewed`, `interview`, `offered`, `accepted`, `rejected`).
- `components/Pagination.tsx`: Responsive pagination control bar showing current page, total items, and Previous/Next navigation buttons.
- `components/RoleGuard.tsx`: Client-side route protection wrapper verifying authentication state and permitted user roles before rendering protected pages.

---

## 4. `lib/` Directory (API Client, Auth State, Formatters & Types)
- `lib/api.ts`: Centralized HTTP fetch wrapper (`api<T>`) targeting `NEXT_PUBLIC_API_URL`, automatically attaching JWT `Authorization` headers, building clean URL query strings (`qs`), and parsing backend validation/server errors (`ApiError`, `errMsg`).
- `lib/auth.tsx`: React Context (`AuthProvider` & `useAuth`) managing user session persistence (`localStorage` token), `login`, `registerCandidate`, `registerCompany`, `logout`, and role-based home routing (`homeFor`).
- `lib/types.ts`: Central TypeScript interfaces and union types (`Role`, `User`, `Recruitment`, `Company`, `Applicant`, `MyApplication`, `AdminUser`, `ManagedUser`, `Stats`, `Meta`).
- `lib/format.ts`: Localization and formatting utilities for Indonesian Rupiah salary ranges (`salary`), Indonesian dates (`dateID`), role labels (`roleLabel`), employment types (`typeLabel`), and status labels/colors (`statusLabel`, `statusColor`).
