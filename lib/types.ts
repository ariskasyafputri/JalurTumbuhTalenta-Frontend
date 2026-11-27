export type Role = 'candidate' | 'company' | 'admin' | 'super_admin';

export interface CompanyMembership {
  companyId: number;
  companyName: string;
  memberRole: 'owner' | 'recruiter';
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  companies: CompanyMembership[];
}

export interface MasterItem {
  id: number;
  name: string;
}

export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type RecruitmentStatus = 'draft' | 'open' | 'closed';
export type ApplicationStatus = 'submitted' | 'reviewed' | 'interview' | 'accepted' | 'rejected';

export interface Recruitment {
  id: number;
  slug: string;
  company_id: number;
  company_name: string;
  company_logo_path?: string | null;
  company_industry: string | null;
  company_size?: string | null;
  company_verified: number;
  subscription_plan: 'free' | 'pro' | 'enterprise';
  category_id: number;
  category_name: string;
  employment_type_id: number;
  employment_type_name: string;
  province_id: number;
  province_name: string;
  title: string;
  detail_address: string;
  salary_min: number | null;
  salary_max: number | null;
  hide_salary?: number | boolean;
  min_experience?: string | null;
  benefits?: MasterItem[];
  description: string;
  requirements: string;
  opened_at: string;
  closed_at: string;
  status: RecruitmentStatus;
  applicants_count?: number;
  created_at: string;
}

export interface Company {
  id: number;
  name: string;
  logo_path?: string | null;
  industry: string | null;
  company_size?: string | null;
  description: string | null;
  npwp: string | null;
  nib: string | null;
  province_id: number | null;
  province_name?: string | null;
  detail_address: string | null;
  website: string | null;
  phone: string | null;
  subscription_plan: 'free' | 'pro' | 'enterprise';
  max_active_jobs: number;
  can_view_cv: number;
  is_verified: number;
  open_recruitments?: number;
  total_recruitments?: number;
  active_recruitments?: number;
  pic_emails?: string | null;
}

export interface CandidateProfile {
  id: number;
  user_id: number;
  photo_path?: string | null;
  phone: string | null;
  gender: 'Laki-laki' | 'Perempuan' | null;
  birth_date: string | null;
  province_id: number | null;
  province_name?: string | null;
  address: string | null;
  headline: string | null;
  summary: string | null;
  education_level: string | null;
  institution: string | null;
  major: string | null;
  graduation_year: string | null;
  certifications: string | null;
  skills: string | null;
  portfolio_url: string | null;
  linkedin_url: string | null;
  social_media_url?: string | null;
  cv_path: string | null;
}

export interface CandidateExperience {
  id: number;
  user_id: number;
  job_title: string;
  company_name: string;
  employment_type: string | null;
  start_date: string;
  end_date: string | null;
  is_current: number;
  description: string | null;
}

export interface FullCandidateData {
  user: { id: number; name: string; email: string };
  profile: CandidateProfile;
  experiences: CandidateExperience[];
  completion: number;
}

export interface Applicant {
  id: number;
  status: ApplicationStatus;
  cover_letter: string | null;
  cv_snapshot_path: string | null;
  notes: string | null;
  applied_at: string;
  candidate_id: number;
  candidate_name: string;
  candidate_email: string;
  phone: string | null;
  photo_path?: string | null;
  headline: string | null;
  education_level: string | null;
  institution: string | null;
  major: string | null;
  graduation_year: string | null;
  skills: string | null;
  certifications: string | null;
  portfolio_url: string | null;
  cv_path: string | null;
  province_name: string | null;
  experiences: CandidateExperience[];
}

export interface MyApplication {
  id: number;
  status: ApplicationStatus;
  cover_letter: string | null;
  applied_at: string;
  recruitment_id: number;
  recruitment_slug?: string;
  title: string;
  company_name: string;
  company_logo_path?: string | null;
  province_name: string;
  employment_type_name: string;
}

export interface ManagedUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  is_active: number;
  created_at: string;
  companies: CompanyMembership[];
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