export interface Resume {
  id: string;
  title: string;
  file_name: string;
  file_type: string;
  is_primary: boolean;
  parsed_sections: Record<string, unknown> | null;
  raw_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface TailoredResume {
  id: string;
  job_id: string;
  base_resume_id: string;
  tailored_sections: Record<string, unknown>;
  diff_summary: DiffEntry[] | null;
  ai_model_used: string;
  status: string;
  file_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface DiffEntry {
  section: string;
  original: string;
  suggested: string;
  rationale: string;
}
