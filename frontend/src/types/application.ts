export interface Application {
  id: string;
  job_id: string;
  tailored_resume_id: string | null;
  status: string;
  cover_letter: string | null;
  form_answers: Record<string, unknown> | null;
  automation_log: LogEntry[] | null;
  submitted_at: string | null;
  error_message: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined from Job
  company_name: string | null;
  job_title: string | null;
}

export interface LogEntry {
  step: number;
  action: string;
  timestamp: string;
  success?: boolean;
  details?: string;
}

export interface RecentApplication {
  id: string;
  status: string;
  created_at: string;
  company_name: string | null;
  job_title: string | null;
}

export interface DashboardStats {
  total_applications: number;
  by_status: Record<string, number>;
  this_week: number;
  this_month: number;
  response_rate: number;
}
