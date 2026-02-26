"use client";

export function JobDetail({ jobId }: { jobId: string }) {
  // TODO: fetch job by ID using SWR
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">Job Details</h3>
      <p className="text-sm text-gray-500">Loading job {jobId}...</p>
    </div>
  );
}
