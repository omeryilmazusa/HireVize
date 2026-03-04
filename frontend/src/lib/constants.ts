export const APPLICATION_STATUSES = [
  "added",
  "applying",
  "applied",
  "phone_call",
  "video_call",
  "1st_round",
  "2nd_round",
  "3rd_round",
  "final_interview",
  "offered",
  "accepted",
  "rejected",
  "withdrawn",
] as const;

export const SCRAPE_STATUSES = [
  "pending",
  "scraping",
  "completed",
  "failed",
] as const;

export const TAILORING_STATUSES = [
  "generating",
  "draft",
  "approved",
  "rejected",
] as const;

export const INTERVIEW_TYPES = [
  "phone",
  "video",
  "onsite",
  "technical",
  "panel",
] as const;

export const INTERVIEW_STATUSES = [
  "scheduled",
  "completed",
  "cancelled",
  "rescheduled",
] as const;

export const INTERVIEW_RESULTS = [
  "pending",
  "passed",
  "failed",
] as const;
