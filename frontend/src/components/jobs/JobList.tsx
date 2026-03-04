"use client";

import { useJobs } from "@/hooks/useJobs";
import { JobCard } from "./JobCard";

export function JobList() {
  const { jobs, isLoading } = useJobs();

  if (isLoading) {
    return <div className="text-center text-navy-500">Loading jobs...</div>;
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="rounded-card border border-border-card bg-white p-8 text-center text-navy-500">
        No jobs yet. Paste a URL above to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
