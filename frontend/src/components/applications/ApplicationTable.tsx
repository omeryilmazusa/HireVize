"use client";

import { useApplications } from "@/hooks/useApplications";
import { ApplicationRow } from "./ApplicationRow";

export function ApplicationTable() {
  const { applications, isLoading } = useApplications();

  if (isLoading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
        No applications yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-4 py-3 font-medium text-gray-500">Company</th>
            <th className="px-4 py-3 font-medium text-gray-500">Position</th>
            <th className="px-4 py-3 font-medium text-gray-500">Status</th>
            <th className="px-4 py-3 font-medium text-gray-500">Date</th>
            <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {applications.map((app) => (
            <ApplicationRow key={app.id} application={app} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
