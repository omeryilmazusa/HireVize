"use client";

export function ApplicationDetail({ applicationId }: { applicationId: string }) {
  // TODO: fetch application detail
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">Application Details</h3>
      <p className="text-sm text-gray-500">Loading application {applicationId}...</p>
    </div>
  );
}
