/**
 * FILE: lib/types.ts
 * PURPOSE:
 *   Central TypeScript Domain Models & API Contract Interfaces.
 *   Defines strongly-typed schemas for Users, Roles, Recruitments, Companies,
 *   Applicants, Candidate Applications, Pagination Metadata, and Super Admin Statistics.
 */

export type Role = 'candidate' | 'company' | 'admin' | 'super_admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  companyId: number | null;
}

export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance';
export type RecruitmentStatus = 'draft' | 'open' | 'closed';
export type ApplicationStatus =
  | 'applied'
  | 'reviewed'
  | 'interview'
  | 'offered'
  | 'accepted'
  | 'rejected';

export interface Recruitment {
  id: number;
  company_id: number;
  company_name: string;
  company_location: string | null;
  title: string;
  description: string;
  requirements: string | null;
  location: string | null;
  employment_type: EmploymentType;
  salary_min: number | null;
  salary_max: number | null;
  status: RecruitmentStatus;
  deadline: string | null;
  created_at: string;
}

export interface Company {
  id: number;
  name: string;
  description: string | null;
  industry: string | null;
  location: string | null;
  website: string | null;
  open_recruitments?: number;
}

export interface Applicant {
  id: number;
  status: ApplicationStatus;
  cover_letter: string | null;
  resume_url: string | null;
  created_at: string;
  candidate_id: number;
  candidate_name: string;
  candidate_email: string;
}

export interface MyApplication {
  id: number;
  status: ApplicationStatus;
  created_at: string;
  recruitment_id: number;
  title: string;
  company_name: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  is_active: number;
  created_at: string;
}

export interface ManagedUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  company_id: number | null;
  company_name: string | null;
  is_active: number;
  created_at: string;
}

export interface Stats {
  candidates: number;
  company_accounts: number;
  admins: number;
  companies: number;
  recruitments: number;
  open_recruitments: number;
  applications: number;
}
