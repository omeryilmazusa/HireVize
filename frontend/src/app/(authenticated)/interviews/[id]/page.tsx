"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { InterviewTypeBadge } from "@/components/interviews/InterviewTypeBadge";
import { InterviewStatusBadge } from "@/components/interviews/InterviewStatusBadge";
import { InterviewFormModal } from "@/components/interviews/InterviewFormModal";
import { useInterview } from "@/hooks/useInterviews";
import { api } from "@/lib/api";
import type { Interview, InterviewUpdate } from "@/types/interview";

export default function InterviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { interview, isLoading, mutate } = useInterview(id);
  const [editOpen, setEditOpen] = useState(false);
  const [pipelineInterviews, setPipelineInterviews] = useState<Interview[]>([]);

  useEffect(() => {
    if (!interview?.application_id) return;
    api
      .get<Interview[]>("/api/v1/interviews")
      .then((all) => {
        const related = all
          .filter((i) => i.application_id === interview.application_id)
          .sort(
            (a, b) =>
              new Date(a.scheduled_at).getTime() -
              new Date(b.scheduled_at).getTime()
          );
        setPipelineInterviews(related);
      })
      .catch(() => {});
  }, [interview?.application_id]);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="text-center text-navy-500">Loading interview...</div>
      </PageContainer>
    );
  }

  if (!interview) {
    return (
      <PageContainer>
        <div className="rounded-card border border-border-card bg-white p-6">
          <p className="text-sm text-red-500">Interview not found.</p>
        </div>
      </PageContainer>
    );
  }

  const handleDelete = async () => {
    if (!confirm("Delete this interview?")) return;
    try {
      await api.delete(`/api/v1/interviews/${id}`);
      router.push("/interviews");
    } catch (err) {
      console.error("Failed to delete interview:", err);
    }
  };

  const handleSubmit = async (data: InterviewUpdate) => {
    await api.put(`/api/v1/interviews/${id}`, data);
    mutate();
  };

  const date = new Date(interview.scheduled_at);
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  const isPast = date < new Date();

  return (
    <PageContainer>
      {/* Back link */}
      <Link
        href="/interviews"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary-500 hover:text-primary-700"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Interviews
      </Link>

      <div className="rounded-card border border-border-card bg-white p-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-navy-900">
              {interview.company_name || "Unknown Company"}
            </h2>
            {interview.job_title && (
              <p className="mt-1 text-sm text-navy-500">{interview.job_title}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditOpen(true)}
              className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Status row */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <InterviewTypeBadge type={interview.interview_type} />
          <InterviewStatusBadge status={interview.status} />
          {isPast && interview.status === "scheduled" && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Overdue
            </span>
          )}
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <DetailItem label="Date" value={dateStr} />
          <DetailItem label="Time" value={timeStr} />
          <DetailItem label="Duration" value={`${interview.duration_minutes} minutes`} />
          <DetailItem label="Location" value={interview.location || "Not specified"} />
          <DetailItem label="Interviewer" value={interview.interviewer_name || "Not specified"} />
          <DetailItem
            label="Application"
            value={
              <Link
                href={`/applications/${interview.application_id}`}
                className="text-primary-500 hover:text-primary-700 hover:underline"
              >
                View Application
              </Link>
            }
          />
        </div>

        {/* Notes */}
        {interview.notes && (
          <div className="mt-6">
            <h4 className="mb-2 font-mono text-[10px] font-medium uppercase tracking-wider text-navy-500">
              Notes
            </h4>
            <div className="rounded-lg bg-surface-subtle p-4 text-sm text-navy-800 whitespace-pre-wrap">
              {interview.notes}
            </div>
          </div>
        )}

        {/* Feedback */}
        {interview.feedback && (
          <div className="mt-6">
            <h4 className="mb-2 font-mono text-[10px] font-medium uppercase tracking-wider text-navy-500">
              Feedback
            </h4>
            <div className="rounded-lg bg-surface-subtle p-4 text-sm text-navy-800 whitespace-pre-wrap">
              {interview.feedback}
            </div>
          </div>
        )}

        {/* Result */}
        {interview.result && (
          <div className="mt-6">
            <h4 className="mb-2 font-mono text-[10px] font-medium uppercase tracking-wider text-navy-500">
              Result
            </h4>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-subtle px-3 py-1 text-sm font-medium capitalize text-navy-800">
              {interview.result}
            </span>
          </div>
        )}

        {/* Timestamps */}
        <div className="mt-6 border-t border-border-card pt-4">
          <div className="flex gap-6 font-mono text-xs text-navy-500">
            <span>Created {new Date(interview.created_at).toLocaleDateString()}</span>
            <span>Updated {new Date(interview.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Pipeline Timeline */}
      {pipelineInterviews.length > 1 && (
        <div className="mt-6 rounded-card border border-border-card bg-white p-6">
          <h3 className="mb-4 font-display text-base font-bold text-navy-900">
            Interview Pipeline
          </h3>
          <div className="relative ml-3">
            {pipelineInterviews.map((step, idx) => {
              const isCurrent = step.id === interview.id;
              const isLast = idx === pipelineInterviews.length - 1;
              const stepDate = new Date(step.scheduled_at);
              const stepDateStr = stepDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              const dotColor =
                step.result === "passed"
                  ? "bg-[#00875A]"
                  : step.result === "failed"
                  ? "bg-red-500"
                  : step.status === "cancelled"
                  ? "bg-gray-400"
                  : step.status === "completed"
                  ? "bg-amber-500"
                  : "bg-[#1E6FFF]";

              return (
                <div key={step.id} className="relative pb-6 last:pb-0">
                  {/* Connector line */}
                  {!isLast && (
                    <div className="absolute left-[5px] top-3 h-full w-px bg-border-card" />
                  )}
                  {/* Dot */}
                  <div
                    className={`absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border-2 border-white ${dotColor} ${
                      isCurrent ? "ring-2 ring-primary-500 ring-offset-1" : ""
                    }`}
                  />
                  {/* Content */}
                  <div className={`ml-6 ${isCurrent ? "" : "opacity-70"}`}>
                    <div className="flex items-center gap-2">
                      {isCurrent ? (
                        <span className="text-sm font-bold text-navy-900">
                          {step.interview_type.charAt(0).toUpperCase() +
                            step.interview_type.slice(1)}
                        </span>
                      ) : (
                        <Link
                          href={`/interviews/${step.id}`}
                          className="text-sm font-medium text-primary-500 hover:underline"
                        >
                          {step.interview_type.charAt(0).toUpperCase() +
                            step.interview_type.slice(1)}
                        </Link>
                      )}
                      <InterviewStatusBadge status={step.status} />
                      {step.result && (
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium capitalize ${
                            step.result === "passed"
                              ? "text-[#00875A]"
                              : step.result === "failed"
                              ? "text-red-500"
                              : "text-amber-600"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              step.result === "passed"
                                ? "bg-[#00875A]"
                                : step.result === "failed"
                                ? "bg-red-500"
                                : "bg-amber-500"
                            }`}
                          />
                          {step.result}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-navy-500">
                      {stepDateStr}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <InterviewFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleSubmit}
        interview={interview}
      />
    </PageContainer>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="font-mono text-[10px] font-medium uppercase tracking-wider text-navy-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-navy-900">{value}</dd>
    </div>
  );
}
