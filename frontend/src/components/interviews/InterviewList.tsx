"use client";

import type { Interview } from "@/types/interview";
import { InterviewTypeBadge } from "./InterviewTypeBadge";
import { InterviewStatusBadge } from "./InterviewStatusBadge";

interface InterviewListProps {
  interviews: Interview[];
  selectedDate: string | null;
  onEdit: (interview: Interview) => void;
  onDelete: (id: string) => void;
}

export function InterviewList({
  interviews,
  selectedDate,
  onEdit,
  onDelete,
}: InterviewListProps) {
  const filtered = selectedDate
    ? interviews.filter((iv) => iv.scheduled_at.startsWith(selectedDate))
    : interviews;

  if (filtered.length === 0) {
    return (
      <div className="rounded-card border border-border-card bg-white p-6 text-center text-navy-500">
        {selectedDate
          ? "No interviews scheduled for this date."
          : "No interviews this month."}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filtered.map((iv) => {
        const time = new Date(iv.scheduled_at).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        });
        return (
          <div
            key={iv.id}
            className="flex items-center justify-between rounded-card border border-border-card bg-white p-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-navy-900 truncate">
                  {iv.company_name || "Unknown Company"}
                </span>
                <InterviewTypeBadge type={iv.interview_type} />
                <InterviewStatusBadge status={iv.status} />
              </div>
              <div className="mt-1 text-sm text-navy-500">
                {iv.job_title && <span>{iv.job_title} &middot; </span>}
                <span>{time}</span>
                <span> &middot; {iv.duration_minutes} min</span>
                {iv.location && <span> &middot; {iv.location}</span>}
                {iv.interviewer_name && (
                  <span> &middot; with {iv.interviewer_name}</span>
                )}
              </div>
              {iv.notes && (
                <p className="mt-1 text-sm text-navy-500 truncate">{iv.notes}</p>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => onEdit(iv)}
                className="rounded-lg border border-border-card px-3 py-1.5 text-xs font-medium text-navy-800 hover:bg-surface-hover transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(iv.id)}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
