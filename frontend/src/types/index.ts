export interface UserProfile {
  education?: string;
  skills?: string[];
  experience_level?: string;
  target_role?: string;
  interests?: string[];
  target_location?: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "model" | "system";
  content: string;
}

export interface ChatRequest {
  message?: string;
  profile?: UserProfile;
  conversation_history?: ChatMessage[];
  cv_text?: string;
  auto_search_jobs?: boolean;
}

export interface JobListing {
  title?: string;
  company?: string;
  location?: string;
  remote?: boolean | string;
  employment_type?: string;
  apply_link?: string;
  source?: string;
  summary?: string;
  skills?: string[];
  match_score?: number;
  [key: string]: any;
}

export interface SalaryInsights {
  job_title?: string;
  location?: string;
  median_salary?: number | string;
  min_salary?: number | string;
  max_salary?: number | string;
  currency?: string;
  salary_period?: string;
  data_source?: string;
  [key: string]: any;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  tools_used: string[];
  model_used: string;
  job_results?: JobListing[] | null;
  salary_results?: SalaryInsights | null;
}

export interface HealthResponse {
  status: string;
  service: string;
  database: string;
  stateless: boolean;
  gemini_model: string;
}

export type ActiveTab =
  | "dashboard"
  | "mentor"
  | "cv-analyzer"
  | "job-finder"
  | "skill-gap"
  | "learning-roadmap"
  | "interview-prep"
  | "portfolio"
  | "salary-explorer"
  | "ats-checker"
  | "resume-writer"
  | "career-progress";
