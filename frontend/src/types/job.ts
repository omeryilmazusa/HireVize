export interface Job {
  id: string;
  source_url: string;
  company_name: string | null;
  job_title: string | null;
  location: string | null;
  salary_range: string | null;
  description_text: string | null;
  requirements: Record<string, unknown> | null;
  ats_platform: string | null;
  scrape_status: string;
  scrape_error: string | null;
  created_at: string;
  updated_at: string;
}
