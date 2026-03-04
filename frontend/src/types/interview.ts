export interface Interview {
  id: string;
  application_id: string;
  user_id: string;
  interview_type: string;
  status: string;
  scheduled_at: string;
  duration_minutes: number;
  location: string | null;
  interviewer_name: string | null;
  notes: string | null;
  feedback: string | null;
  result: string | null;
  created_at: string;
  updated_at: string;
  company_name: string | null;
  job_title: string | null;
}

export interface InterviewCreate {
  application_id: string;
  interview_type: string;
  scheduled_at: string;
  duration_minutes?: number;
  location?: string;
  interviewer_name?: string;
  notes?: string;
}

export interface InterviewUpdate {
  interview_type?: string;
  status?: string;
  scheduled_at?: string;
  duration_minutes?: number;
  location?: string;
  interviewer_name?: string;
  notes?: string;
  feedback?: string;
  result?: string;
}
