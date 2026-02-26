"use client";

import { useRouter } from "next/navigation";
import { useJob } from "@/hooks/useJobs";
import { StatusBadge } from "@/components/applications/StatusBadge";
import { api } from "@/lib/api";

export function JobDetail({ jobId }: { jobId: string }) {
  const { job, isLoading } = useJob(jobId);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">Loading job...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-sm text-red-500">Job not found.</p>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!confirm("Delete this job?")) return;
    try {
      await api.delete(`/api/v1/jobs/${jobId}`);
      router.push("/jobs");
    } catch (err) {
      console.error("Failed to delete job:", err);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {job.job_title || "Untitled Position"}
          </h3>
          <p className="text-sm text-gray-500">
            {job.company_name || "Unknown Company"}
            {job.location && ` · ${job.location}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={job.scrape_status} />
          <button
            onClick={handleDelete}
            className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      {job.salary_range && (
        <p className="mb-3 text-sm text-gray-600">Salary: {job.salary_range}</p>
      )}

      <div className="mb-4">
        <a
          href={job.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary-600 hover:underline"
        >
          View original posting
        </a>
      </div>

      {job.description_text && (
        <div className="mt-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-700">Description</h4>
          <div className="max-h-96 overflow-y-auto rounded bg-gray-50 p-4 text-sm text-gray-700 whitespace-pre-wrap">
            {job.description_text}
          </div>
        </div>
      )}

      {job.requirements && Object.keys(job.requirements).length > 0 && (
        <div className="mt-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-700">Requirements</h4>
          <pre className="max-h-48 overflow-y-auto rounded bg-gray-50 p-4 text-xs text-gray-600">
            {JSON.stringify(job.requirements, null, 2)}
          </pre>
        </div>
      )}

      {job.scrape_error && (
        <div className="mt-4 rounded bg-red-50 p-3 text-sm text-red-600">
          Scrape error: {job.scrape_error}
        </div>
      )}
    </div>
  );
}
