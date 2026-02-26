export const APPLICATION_STATUSES = [
  "pending",
  "ready",
  "submitting",
  "submitted",
  "failed",
  "withdrawn",
  "interviewing",
  "rejected",
  "offered",
  "accepted",
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
