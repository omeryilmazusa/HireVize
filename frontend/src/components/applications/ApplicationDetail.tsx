"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApplication } from "@/hooks/useApplications";
import { StatusBadge } from "./StatusBadge";
import { api } from "@/lib/api";
import { APPLICATION_STATUSES } from "@/lib/constants";

export function ApplicationDetail({
  applicationId,
}: {
  applicationId: string;
}) {
  const { application, isLoading, mutate } = useApplication(applicationId);
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">Loading application...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-sm text-red-500">Application not found.</p>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      await api.put(`/api/v1/applications/${applicationId}/status`, {
        status: newStatus,
      });
      mutate();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this application?")) return;
    try {
      await api.delete(`/api/v1/applications/${applicationId}`);
      router.push("/applications");
    } catch (err) {
      console.error("Failed to delete application:", err);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">Application Details</h3>
          <p className="mt-1 text-sm text-gray-500">
            {application.company_name || "Unknown Company"} &mdash;{" "}
            {application.job_title || "Untitled Position"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={application.status} />
          <button
            onClick={handleDelete}
            className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Update Status
        </label>
        <select
          value={application.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={updating}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <span className="font-medium text-gray-700">Job: </span>
          <Link
            href={`/jobs/${application.job_id}`}
            className="text-primary-600 hover:underline"
          >
            View job details
          </Link>
        </div>

        {application.submitted_at && (
          <div>
            <span className="font-medium text-gray-700">Submitted: </span>
            <span className="text-gray-600">
              {new Date(application.submitted_at).toLocaleString()}
            </span>
          </div>
        )}

        {application.notes && (
          <div>
            <span className="font-medium text-gray-700">Notes: </span>
            <span className="text-gray-600">{application.notes}</span>
          </div>
        )}

        {application.cover_letter && (
          <div>
            <h4 className="mb-1 font-medium text-gray-700">Cover Letter</h4>
            <div className="rounded bg-gray-50 p-3 text-gray-600 whitespace-pre-wrap">
              {application.cover_letter}
            </div>
          </div>
        )}

        {application.error_message && (
          <div className="rounded bg-red-50 p-3 text-red-600">
            Error: {application.error_message}
          </div>
        )}

        <div>
          <span className="font-medium text-gray-700">Created: </span>
          <span className="text-gray-600">
            {new Date(application.created_at).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
