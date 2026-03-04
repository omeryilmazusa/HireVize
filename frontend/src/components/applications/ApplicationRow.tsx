"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { api } from "@/lib/api";
import type { Application } from "@/types/application";

interface StartApplyResponse {
  application_id: string;
  application_url: string;
}

export function ApplicationRow({
  application,
  onMutate,
}: {
  application: Application;
  onMutate?: () => void;
}) {
  const [applying, setApplying] = useState(false);

  const canApply =
    application.status === "pending" || application.status === "failed";

  const handleApplyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    setApplying(true);
    try {
      const result = await api.post<StartApplyResponse>(
        `/api/v1/applications/${application.id}/start-apply`,
        {}
      );
      window.open(result.application_url, "_blank");
      onMutate?.();
    } catch (err) {
      console.error("Apply now failed:", err);
    } finally {
      setApplying(false);
    }
  };

  return (
    <tr className="hover:bg-surface-hover">
      <td className="px-4 py-3 font-medium text-navy-900">
        {application.company_name || "Unknown"}
      </td>
      <td className="px-4 py-3 text-navy-800">
        {application.job_title || "Untitled"}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={application.status} />
      </td>
      <td className="px-4 py-3 text-navy-500">
        {new Date(application.created_at).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {canApply && (
            <button
              onClick={handleApplyNow}
              disabled={applying}
              className="rounded bg-primary-500 px-2 py-1 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {applying ? "..." : "Apply Now"}
            </button>
          )}
          <Link
            href={`/applications/${application.id}`}
            className="text-primary-500 hover:text-primary-700 text-sm font-medium"
          >
            View
          </Link>
        </div>
      </td>
    </tr>
  );
}
