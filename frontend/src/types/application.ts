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
}

export interface LogEntry {
  step: number;
  action: string;
  timestamp: string;
  success?: boolean;
  details?: string;
}
