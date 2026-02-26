import Link from "next/link";
import { StatusBadge } from "@/components/applications/StatusBadge";
import type { Job } from "@/types/job";

export function JobCard({ job }: { job: Job }) {
  return (
    <Link href={`/jobs/${job.id}`}>
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:border-primary-300 transition-colors">
        <div>
          <h3 className="font-semibold text-gray-900">
            {job.job_title || "Untitled Position"}
          </h3>
          <p className="text-sm text-gray-500">
            {job.company_name || "Unknown Company"}
            {job.location && ` · ${job.location}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {job.ats_platform && job.ats_platform !== "unknown" && (
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
              {job.ats_platform}
            </span>
          )}
          <StatusBadge status={job.scrape_status} />
        </div>
      </div>
    </Link>
  );
}
