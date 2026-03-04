import Link from "next/link";
import { StatusBadge } from "@/components/applications/StatusBadge";
import type { Job } from "@/types/job";

export function JobCard({ job }: { job: Job }) {
  return (
    <Link href={`/jobs/${job.id}`}>
      <div className="flex items-center justify-between rounded-card border border-border-card bg-white p-4 hover:border-primary-300 transition-colors">
        <div>
          <h3 className="font-semibold text-navy-900">
            {job.job_title || "Untitled Position"}
          </h3>
          <p className="text-sm text-navy-500">
            {job.company_name || "Unknown Company"}
            {job.location && ` · ${job.location}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {job.ats_platform && job.ats_platform !== "unknown" && (
            <span className="rounded-full bg-surface-subtle px-2 py-1 text-xs text-navy-600">
              {job.ats_platform}
            </span>
          )}
          <StatusBadge status={job.scrape_status} />
        </div>
      </div>
    </Link>
  );
}
