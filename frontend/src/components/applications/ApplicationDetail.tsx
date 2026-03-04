"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApplication } from "@/hooks/useApplications";
import { StatusBadge } from "./StatusBadge";
import { api } from "@/lib/api";
import { APPLICATION_STATUSES } from "@/lib/constants";

interface StartApplyResponse {
  application_id: string;
  application_url: string;
}

export function ApplicationDetail({
  applicationId,
}: {
  applicationId: string;
}) {
  const { application, isLoading, mutate } = useApplication(applicationId);
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="rounded-card border border-border-card bg-white p-6">
        <p className="text-sm text-navy-500">Loading application...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="rounded-card border border-border-card bg-white p-6">
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

  const handleApplyNow = async () => {
    setApplying(true);
    setApplyError(null);
    try {
      const result = await api.post<StartApplyResponse>(
        `/api/v1/applications/${applicationId}/start-apply`,
        {}
      );
      mutate();
      window.open(result.application_url, "_blank");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start application";
      setApplyError(message);
      console.error("Apply now failed:", err);
    } finally {
      setApplying(false);
    }
  };

  const handleMarkSubmitted = async () => {
    try {
      await api.put(`/api/v1/applications/${applicationId}/apply-result`, {
        status: "submitted",
      });
      mutate();
    } catch (err) {
      console.error("Failed to mark as submitted:", err);
    }
  };

  const canApply = application.status === "added" || application.status === "pending" || application.status === "failed";
  const isApplying = application.status === "applying";

  return (
    <div className="rounded-card border border-border-card bg-white p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="font-display text-lg font-bold text-navy-900">Application Details</h3>
          <p className="mt-1 text-sm text-navy-500">
            {application.company_name || "Unknown Company"} &mdash;{" "}
            {application.job_title || "Untitled Position"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={application.status} />
          {canApply && (
            <button
              onClick={handleApplyNow}
              disabled={applying}
              className="rounded-lg bg-primary-500 px-3 py-1 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {applying ? "Opening..." : "Apply Now"}
            </button>
          )}
          {isApplying && (
            <button
              onClick={handleMarkSubmitted}
              className="rounded-lg bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
            >
              Mark as Submitted
            </button>
          )}
          <button
            onClick={handleDelete}
            className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      {isApplying && (
        <div className="mb-4 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-700">
          Complete the application in the opened tab. If you have the Hirevize extension installed, it will offer to auto-fill the form.
          Once done, click &ldquo;Mark as Submitted&rdquo; above.
        </div>
      )}

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-navy-800">
          Update Status
        </label>
        <select
          value={application.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={updating}
          className="rounded-lg border border-border-card px-3 py-2 text-sm"
        >
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <span className="font-medium text-navy-800">Job: </span>
          <Link
            href={`/jobs/${application.job_id}`}
            className="text-primary-500 hover:underline"
          >
            View job details
          </Link>
        </div>

        {application.submitted_at && (
          <div>
            <span className="font-medium text-navy-800">Submitted: </span>
            <span className="text-navy-800">
              {new Date(application.submitted_at).toLocaleString()}
            </span>
          </div>
        )}

        {application.notes && (
          <div>
            <span className="font-medium text-navy-800">Notes: </span>
            <span className="text-navy-800">{application.notes}</span>
          </div>
        )}

        {application.cover_letter && (
          <div>
            <h4 className="mb-1 font-medium text-navy-800">Cover Letter</h4>
            <div className="rounded bg-surface-subtle p-3 text-navy-800 whitespace-pre-wrap">
              {application.cover_letter}
            </div>
          </div>
        )}

        {application.error_message && (
          <div className="rounded bg-red-50 p-3 text-red-600">
            Error: {application.error_message}
          </div>
        )}

        {applyError && (
          <div className="rounded bg-red-50 p-3 text-red-600">
            {applyError}
          </div>
        )}

        <div>
          <span className="font-medium text-navy-800">Created: </span>
          <span className="text-navy-800">
            {new Date(application.created_at).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
